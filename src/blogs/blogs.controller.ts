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
    UseInterceptors,
    Logger
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Roles } from '../auth/decorators/role.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { UserRole } from '../generated/prisma/enums';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { type Blog, type Section } from '../generated/prisma/client';

@Controller('blogs')
export class BlogsController {
    private readonly logger = new Logger(BlogsController.name);
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
    @Patch(':blogId')
    async updateBlog(
        @Query('blogId') blogId: string,
        @Body() dto: Blog
    ) {
        return await this.blogsService.updateBlog(blogId, dto);
    }

    // delete blog by id
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Delete(':blogId')
    async deleteBlog(@Param('blogId') blogId: string) {
        return await this.blogsService.deleteBlog(blogId);
    }
}
