import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UploadedFiles,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/role.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { UserRole } from '../generated/prisma/enums';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blogs')
export class BlogsController {
    constructor(
        private readonly blogsService: BlogsService
    ) { }

    // create a new blog
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @UseInterceptors(FileFieldsInterceptor([
        { name: "blogImage" },
        { name: "sectionImages" }
    ]))
    @Post()
    async createBlog(
        @Body() dto: { blog: string, sectionsWithImages: string },
        @UploadedFiles() files: { blogImage: Express.Multer.File[], sectionImages: Express.Multer.File[] }
    ) {
        const blogData = JSON.parse(dto.blog) as CreateBlogDto;
        const { sectionsWithImages }: { sectionsWithImages: string[] } = JSON.parse(dto.sectionsWithImages);

        return await this.blogsService.createBlog(
            files.blogImage,
            files.sectionImages,
            blogData,
            sectionsWithImages
        );
    }

    // get paginated blogs
    @Get()
    async getBlogs(@Query() pagination: PaginationDto) {
        return await this.blogsService.getBlogs(pagination);
    }

    // get blog by id
    @Get(':blogId')
    async getBlogById(@Param('blogId') blogId: string) {
        return await this.blogsService.getBlogById(blogId);
    }

    // update blog by id
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @UseInterceptors(FileFieldsInterceptor([
        { name: "blogImage" },
        { name: "sectionImages" }
    ]))
    @Patch(':blogId')
    async updateBlog(
        @Param('blogId') blogId: string,
        @Body() dto: { blog: string, sectionsWithImages: string },
        @UploadedFiles() files: { blogImage: Express.Multer.File[], sectionImages: Express.Multer.File[] }
    ) {
        const { blogData }: { blogData: UpdateBlogDto } = JSON.parse(dto.blog);
        const { sectionsWithImages }: { sectionsWithImages: string[] } = JSON.parse(dto.sectionsWithImages);

        return await this.blogsService.updateBlog(blogId, blogData, files, sectionsWithImages);
    }

    // delete blog by id
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Delete(':blogId')
    async deleteBlog(@Param('blogId') blogId: string) {
        return await this.blogsService.deleteBlog(blogId);
    }
}
