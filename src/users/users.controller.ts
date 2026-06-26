import { Controller, Post, Get, Query, Param, Body, Patch, Delete, UseFilters } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { ResponseFilter } from '../common/filters/reponse.filter';

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
    @Patch(':userId')
    async updateUser(@Param('userId') userId: string, @Body() dto: UpdateUserDto) {
        return await this.users.updateUser(userId, dto)
    }

    // delete user by userId
    @Delete(':userId')
    async deleteUser(@Param('userId') userId: string) {
        return await this.users.deleteUser(userId);
    }
}
