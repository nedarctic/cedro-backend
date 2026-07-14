import { Injectable, Logger } from '@nestjs/common';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Blog, Section } from '../generated/prisma/client';
import { BlogWhereInput } from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogNotFoundException } from './exceptions/blog-not-found.exception';
import { SectionNotFoundException } from './exceptions/section-not-found.exception';
import { SectionDto, UpdateBlogDto } from './dto/update-blog.dto';
import { string } from 'joi';

@Injectable()
export class BlogsService {
    private readonly logger = new Logger(BlogsService.name);
    constructor(
        private readonly prisma: PrismaService,
        private readonly r2: R2Service
    ) { }

    // get paginated blogs with optional search query
    async getBlogs(pagination: PaginationDto) {
        try {
            const {
                limit = 10,
                page = 1,
                search
            } = pagination;

            const skip = (page - 1) * limit;
            const searchQuery: BlogWhereInput = search ? {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { intro: { contains: search, mode: 'insensitive' } },
                    { conclusion: { contains: search, mode: 'insensitive' } },
                    {
                        sections: {
                            some: {
                                section: {
                                    contains: search,
                                    mode: 'insensitive'
                                },
                                subtitle: {
                                    contains: search,
                                    mode: 'insensitive'
                                },
                                content: {
                                    contains: search,
                                    mode: 'insensitive'
                                }
                            }
                        }
                    },
                ],
            } : {};

            const [data, total] = await Promise.all([
                await this.prisma.blog.findMany({
                    where: searchQuery,
                    skip,
                    take: limit,
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                await this.prisma.blog.count({
                    where: searchQuery,
                }),
            ]);

            const blogs = data.map(blog => ({
                ...blog,
                createdAt: new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }),
                updatedAt: new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' }),
            }))

            return {
                blogs,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                }
            };
        } catch (error) {
            throw error;
        }
    }

    // get a single blog by id
    async getBlogById(blogId: string) {
        try {
            const blog = await this.prisma.blog.findUnique({
                where: { id: blogId },
                include: {
                    sections: {
                        orderBy: {
                            section: "asc"
                        }
                    },
                },
            });

            if (!blog) {
                throw new BlogNotFoundException(blogId);
            }

            return blog;
        } catch (error) {
            throw error;
        }
    }

    // create a new blog
    async createBlog(
        blogImage: Express.Multer.File[],
        sectionImages: Express.Multer.File[],
        dto: CreateBlogDto,
        sectionsWithImages: string[]
    ) {
        try {
            const {
                title,
                intro,
                sections,
                conclusion
            } = dto;

            // upload blog image to R2

            const { key, publicUrl } = await this.r2.uploadFile(blogImage[0], 'blogs');

            const sectionsData = await Promise.all(sections.map(async (section, index) => {

                const imageId = sectionsWithImages.indexOf(section.id);

                let sectionImageUrl: string | undefined;
                let sectionImageKey: string | undefined;

                if (imageId !== undefined && imageId !== null && imageId !== -1) {
                    const sectionImage = sectionImages[imageId];
                    const { key, publicUrl } = await this.r2.uploadFile(sectionImage, "itineraries/sections")
                    sectionImageKey = key;
                    sectionImageUrl = publicUrl;
                }

                return {
                    ...section,
                    sectionImageUrl,
                    sectionImageKey
                };
            }))

            // create the blog in the database
            return await this.prisma.blog.create({
                data: {
                    title,
                    intro,
                    conclusion,
                    blogImageKey: key,
                    blogImageUrl: publicUrl,
                    sections: {
                        createMany: {
                            data: sectionsData
                        }
                    }
                }
            });

        } catch (error) {
            throw error;
        }
    }

    // create blog sections in bulk using transaction
    async createBlogSections(
        blogId: string,
        sections: {
            section: string;
            subtitle: string;
            content: string;
        }[],
        sectionImages: Express.Multer.File[]
    ) {

        const uploadedSectionImages = new Map<number, { key: string; publicUrl: string }>();

        try {
            const sectionData = await Promise.all(
                sections.map(async (section, index) => {
                    const sectionImage = sectionImages[index];

                    let sectionImageKey: string | null = null;
                    let sectionImageUrl: string | null = null;

                    if (sectionImage && sectionImage.size > 0) {
                        const uploaded = await this.r2.uploadFile(
                            sectionImage,
                            'blogs/sections'
                        );

                        uploadedSectionImages.set(index, uploaded);

                        sectionImageKey = uploaded.key;
                        sectionImageUrl = uploaded.publicUrl;
                    }

                    return {
                        ...section,
                        blogId,
                        sectionImageKey,
                        sectionImageUrl,
                    };
                })
            );

            return await this.prisma.$transaction(async (tx) => {
                const results: Section[] = [];

                for (const data of sectionData) {
                    results.push(
                        await tx.section.create({
                            data,
                        })
                    );
                }

                return results;
            });

        } catch (error) {

            await Promise.all(
                Array.from(uploadedSectionImages.values()).map((img) =>
                    this.r2.deleteFile(img.key)
                )
            );
            throw error;
        }
    }

    // update blog by id
    async updateBlog(
        blogId: string,
        dto: UpdateBlogDto,
        files: { blogImage: Express.Multer.File[], sectionImages: Express.Multer.File[] },
        sectionsWithImages: string[]
    ) {
        try {
            const blog = await this.prisma.blog.findUnique({
                where: { id: blogId },
            });

            if (!blog) {
                throw new BlogNotFoundException(blogId);
            }

            const {
                title,
                intro,
                conclusion,
                sections,
            } = dto;

            const {
                blogImage,
                sectionImages
            } = files;

            const existingSectionsIds = await this.prisma.section.findMany({
                where: {
                    blogId
                }
            }).then(sections => sections.map(section => section.id));

            const existingSectionsIdsSet = new Set(existingSectionsIds);

            const blogDataPromise = async () => {

                let blogImageKey: string | undefined;
                let blogImageUrl: string | undefined;

                if (blogImage && blogImage[0].size > 0) {
                    await this.r2.deleteFile(blog.blogImageKey);
                    const { key, publicUrl } = await this.r2.uploadFile(blogImage[0], "blogs");
                    blogImageKey = key;
                    blogImageUrl = publicUrl;
                }

                return {
                    title,
                    intro,
                    blogImageKey,
                    blogImageUrl,
                    conclusion
                };
            }

            const newSectionsDataPromise = async () => {

                if (!sections) {
                    return (undefined);
                }

                const newSections = sections!.filter(section => !existingSectionsIdsSet.has(section.id)) as {
                    id: string;
                    section: string;
                    subtitle: string;
                    content: string;
                }[];

                if (!newSections || !newSections.length) {
                    return (undefined);
                }

                const unfiltered = await Promise.all(newSections.map(async ({ id, section, subtitle, content }) => {
                    const imageId = sectionsWithImages.indexOf(id);
                    let sectionImageKey: string | undefined;
                    let sectionImageUrl: string | undefined;

                    if (imageId !== -1) {
                        const sectionImage = sectionImages[imageId];
                        const {
                            key,
                            publicUrl
                        } = await this.r2.uploadFile(sectionImage, "blogs/sections");
                        sectionImageKey = key;
                        sectionImageUrl = publicUrl;
                    };

                    return {
                        id,
                        section,
                        subtitle,
                        content,
                        sectionImageKey,
                        sectionImageUrl
                    }
                }));

                const filtered = unfiltered.filter((section): section is NonNullable<typeof section> => section !== undefined);

                return (filtered);
            }

            const updatedSectionsDataPromise = async () => {

                if (!sections) {
                    return (undefined);
                }

                const updatedSections = sections!.filter(section => existingSectionsIdsSet.has(section.id)) as {
                    id: string;
                    section: string;
                    subtitle: string;
                    content: string;
                    sectionImageKey: string | undefined;
                    sectionImageUrl: string | undefined;
                }[];

                this.logger.log('updated sections', updatedSections)

                if (!updatedSections || !updatedSections.length) {
                    return (undefined);
                }

                const updateData = await Promise.all(updatedSections.map(async (section) => {
                    const imageId = sectionsWithImages.indexOf(section.id);
                    let sectionImageKey: string | undefined;
                    let sectionImageUrl: string | undefined;

                    if (imageId !== -1) {
                        await this.r2.deleteFile(section.sectionImageKey!);
                        const sectionImage = sectionImages[imageId];
                        const {
                            key,
                            publicUrl
                        } = await this.r2.uploadFile(sectionImage, "blogs/sections");
                        sectionImageKey = key;
                        sectionImageUrl = publicUrl;
                    };

                    return {
                        where: {
                            id: section.id
                        },
                        data: {
                            ...section,
                            sectionImageKey,
                            sectionImageUrl
                        }
                    };
                }));

                this.logger.log('update data', updateData);
                return (updateData);
            };

            const deletedSectionsIdsPromise = async () => {
                const incomingSectionsIds = sections.map(section => section.id);
                const incomingSectionsIdsSet = new Set(incomingSectionsIds);
                const deletedSectionsIds = existingSectionsIds.filter(id => !incomingSectionsIdsSet.has(id));
                return (deletedSectionsIds)
            }

            const [blogData, newSectionsData, updatedSectionsData, deletedSectionsIds] = await Promise.all([
                await blogDataPromise(),
                await newSectionsDataPromise(),
                await updatedSectionsDataPromise(),
                await deletedSectionsIdsPromise(),
            ])

            const updatedBlog = await this.prisma.blog.update({
                where: { id: blogId },
                data: {
                    ...blogData,
                    sections: {
                        updateMany: updatedSectionsData,
                        ...(newSectionsData && {
                            createMany: {
                                data: newSectionsData
                            }
                        }),
                        ...(deletedSectionsIds && deletedSectionsIds.length && {
                            deleteMany: {
                                id: {
                                    in: deletedSectionsIds
                                }
                            }
                        })
                    }
                },
            });

            return updatedBlog;
        } catch (error) {
            throw error;
        }
    }

    // update blog section by id
    async updateBlogSection(sectionId: string, dto: Section) {
        try {
            const section = await this.prisma.section.findUnique({
                where: { id: sectionId },
            });

            if (!section) {
                throw new SectionNotFoundException(sectionId);
            }

            const updatedSection = await this.prisma.section.update({
                where: { id: sectionId },
                data: {
                    ...dto
                },
            });

            return updatedSection;
        } catch (error) {
            throw error;
        }
    }

    // delete blog by id
    async deleteBlog(blogId: string) {
        try {
            const blog = await this.prisma.blog.findUnique({
                where: { id: blogId },
            });

            if (!blog) {
                throw new BlogNotFoundException(blogId);
            }

            // delete the blog image from R2
            blog.blogImageKey && await this.r2.deleteFile(blog.blogImageKey);

            // delete the blog sections images from R2
            const sections = await this.prisma.section.findMany({
                where: { blogId },
            });

            for (const section of sections) {
                if (section.sectionImageKey) {
                    await this.r2.deleteFile(section.sectionImageKey);
                }
            }

            // delete the blog and its sections from the database
            await this.prisma.blog.delete({ where: { id: blogId } })

            return { message: 'Blog deleted successfully' };
        } catch (error) {
            throw error;
        }
    }
}
