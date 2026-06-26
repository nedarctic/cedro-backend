import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { UserRole } from '../generated/prisma/enums';
import { UserWhereInput } from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserNotFoundException } from './exceptions/user-not-found.exceptions';

@Injectable()
export class UsersService {

    constructor(
        private readonly prisma: PrismaService
    ) { }

    // get users
    async getUsers(pagination: PaginationDto) {

        try {
            const {
                limit = 10,
                page = 1,
                search
            } = pagination;

            const skip = (page - 1) * limit;

            const searchTerm = search && search.trim();
            const searchTermUpper = searchTerm?.toUpperCase();

            const where: UserWhereInput = searchTerm ? {
                OR: [
                    {
                        email: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    },
                    {
                        name: {
                            contains: searchTerm,
                            mode: 'insensitive',
                        }
                    },
                    {
                        role: {
                            equals: searchTermUpper as UserRole
                        }
                    }
                ]
            } : {};

            const [users, total] = await Promise.all([
                await this.prisma.user.findMany({
                    take: limit,
                    skip,
                    where,
                    orderBy: {
                        createdAt: "desc"
                    }
                }),
                await this.prisma.user.count({ where })
            ]);

            return {
                users,
                meta: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        } catch (error) {
            throw new Error(String(error));
        }
    }

    // get user by userid
    async getUser(userId: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: userId
                }
            })

            if (!user) {
                throw new UserNotFoundException({userId});
            }

            return user;
        } catch (error) {
            throw new Error(String(error));
        }
    }

    // get user by email
    async getUserByEmail(email: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    email
                }
            })

            if (!user) {
                throw new UserNotFoundException({email});
            }

            return user;
        } catch (error) {
            throw new Error(String(error));
        }
    }

    // create user
    async createUser(dto: CreateUserDto) {
        
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        try {
            return await this.prisma.user.create({
                data: {
                    ...dto,
                    password: hashedPassword,
                }
            })
        } catch (error) {
            throw new Error(String(error));
        }
    }

    // update user
    async updateUser(userId: string, dto: UpdateUserDto) {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: userId
                }
            })

            if (!user) {
                throw new UserNotFoundException({userId});
            }

            return await this.prisma.user.update({
                where: {
                    id: userId
                },
                data: {
                    ...dto
                }
            })
        } catch (error) {
            throw new Error(String(error));
        }
    }

    // delete user
    async deleteUser(userId: string) {
        try {
            const user = await this.prisma.user.findUnique({
                where: {
                    id: userId
                }
            })

            if (!user) {
                throw new UserNotFoundException({userId});
            }

            return this.prisma.user.delete({
                where: {
                    id: userId
                }
            })
        } catch (error) {
            throw new Error(String(error));
        }
    }
}
