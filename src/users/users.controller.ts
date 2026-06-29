import { Controller, Post, Get, Query, Param, Body, Patch, Delete, UseFilters, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { ResponseFilter } from '../common/filters/reponse.filter';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../generated/prisma/enums';

@UseFilters(ResponseFilter)
@Controller('users')
export class UsersController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly users: UsersService,
    ) { }

    // get paginated users
    @Get()
    async getUsers(@Query() pagination: PaginationDto) {
        return await this.users.getUsers(pagination);
    }

    // create a user
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Post()
    async createUser(@Body() dto: CreateUserDto) {
        return await this.users.createUser(dto);
    }

    // get user by userId
    @Get(':userId')
    async getUser(@Param('userId') userId: string) {
        return await this.users.getUser(userId);
    }

    // update user by userId
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Patch(':userId')
    async updateUser(@Param('userId') userId: string, @Body() dto: UpdateUserDto) {
        return await this.users.updateUser(userId, dto)
    }

    // delete user by userId
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Delete(':userId')
    async deleteUser(@Param('userId') userId: string) {
        return await this.users.deleteUser(userId);
    }
}
