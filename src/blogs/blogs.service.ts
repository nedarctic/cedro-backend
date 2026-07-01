import { Injectable } from '@nestjs/common';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { Blog, Section } from '../generated/prisma/client';
import { BlogWhereInput } from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { BlogNotFoundException } from './exceptions/blog-not-found.exception';
import { SectionNotFoundException } from './exceptions/section-not-found.exception';

@Injectable()
export class BlogsService {
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

            const [blogs, total] = await this.prisma.$transaction([
                this.prisma.blog.findMany({
                    where: searchQuery,
                    skip,
                    take: limit,
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                this.prisma.blog.count({
                    where: searchQuery,
                }),
            ]);

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
                    sections: true,
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
    async createBlog(blogImage: Express.Multer.File, sectionImages: Express.Multer.File[], dto: CreateBlogDto) {
        try {
            const {
                title,
                intro,
                sections,
                conclusion
            } = dto;

            // upload blog image to R2
            const { key, publicUrl } = await this.r2.uploadFile(blogImage, 'blogs');

            // create the blog in the database
            const blog = await this.prisma.blog.create({
                data: {
                    title,
                    intro,
                    conclusion,
                    blogImageKey: key,
                    blogImageUrl: publicUrl,
                }
            });

            // create the blog sections
            await this.createBlogSections(blog.id, sections, sectionImages);

            return blog;
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
        const uploadedSectionImages: { key: string; publicUrl: string }[] = [];
        try {
            const sectionData = sections.map(async (section, index) => {
                const sectionImage = sectionImages[index];
                let sectionImageKey: string | null = null;
                let sectionImageUrl: string | null = null;

                if (sectionImage) {
                    const { key, publicUrl } = await this.r2.uploadFile(sectionImage, 'sections');
                    uploadedSectionImages.push({ key, publicUrl });
                    sectionImageKey = key;
                    sectionImageUrl = publicUrl;
                }

                return {
                    ...section,
                    blogId,
                    sectionImageKey,
                    sectionImageUrl,
                };
            });

            const createdSections = await this.prisma.$transaction(async (tx) => {
                const results: Section[] = [];

                for (let i = 0; i < sectionData.length; i++) {
                    const section = await tx.section.create({
                        data: await sectionData[i],
                    });

                    results.push(section);
                }

                return results;
            });

            return createdSections;
        } catch (error) {

            await Promise.all(
                uploadedSectionImages.map((img) =>
                    this.r2.deleteFile(img.key)
                )
            );
            throw error;
        }
    }

    // update blog by id
    async updateBlog(blogId: string, dto: Blog) {
        try {
            const blog = await this.prisma.blog.findUnique({
                where: { id: blogId },
            });

            if (!blog) {
                throw new BlogNotFoundException(blogId);
            }

            const updatedBlog = await this.prisma.blog.update({
                where: { id: blogId },
                data: {
                    ...dto
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
            await this.r2.deleteFile(blog.blogImageKey);

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
            await this.prisma.$transaction(async (tx) => {
                await tx.blog.delete({
                    where: { id: blogId },
                });
            });

            return { message: 'Blog deleted successfully' };
        } catch (error) {
            throw error;
        }
    }

    // delete blog section by id
    async deleteBlogSection(sectionId: string) {
        try {
            const section = await this.prisma.section.findUnique({
                where: { id: sectionId },
            });

            if (!section) {
                throw new SectionNotFoundException(sectionId);
            }

            // delete the section image from R2
            if (section.sectionImageKey) {
                await this.r2.deleteFile(section.sectionImageKey);
            }

            // delete the section from the database
            await this.prisma.section.delete({
                where: { id: sectionId },
            });

            return { message: 'Section deleted successfully' };
        } catch (error) {
            throw error;
        }
    }
}
