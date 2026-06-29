import { Injectable } from '@nestjs/common';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { DestinationWhereInput } from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';
import { DestinationNotFoundException } from './exceptions/destination-not-found.exception';

@Injectable()
export class DestinationsService {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    // get destinations
    async getDestinations(dto: PaginationDto) {
        try {
            const {
                limit = 10,
                page = 1,
                search
            } = dto;

            const skip = (page - 1) * limit;

            const searchTerm = search && search.trim();

            const where: DestinationWhereInput = searchTerm ? {
                OR: [
                    {
                        name: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    },
                    {
                        tour: {
                            some: {
                                title: {
                                    contains: searchTerm,
                                    mode: 'insensitive'
                                }
                            }
                        }
                    },
                ]

            } : {};

            const [data, total] = await Promise.all([
                await this.prisma.destination.findMany({
                    take: limit,
                    skip,
                    where,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    include: {
                        _count: {
                            select: {
                                tour: true
                            }
                        }
                    }
                }),
                await this.prisma.destination.count({ where })
            ]);

            const destinations = data.map(({ _count, ...destination }) => {
                const { tour: totalTours } = _count;
                return {
                    ...destination,
                    totalTours
                }
            })

            return {
                destinations,
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

    // get destination by id
    async getDestination(destinationId: string) {
        try {
            const destination = await this.prisma.destination.findUnique({
                where: {
                    id: destinationId
                }
            })

            if (!destination) {
                throw new DestinationNotFoundException(destinationId);
            }

            return destination;
        } catch (error) {
            throw new Error(String(error))
        }
    }

    // create destination
    async createDestination(name: string) {
        try {
            return await this.prisma.destination.create({
                data: {
                    name
                }
            })
        } catch (error) {
            throw new Error(String(error))
        }
    }

    // update destination
    async updateDestination(destinationId: string, name: string) {
        try {
            const destination = await this.prisma.destination.findUnique({ where: { id: destinationId } });

            if (!destinationId) {
                throw new DestinationNotFoundException(destinationId);
            }

            return await this.prisma.destination.update({
                where: {
                    id: destinationId,
                },
                data: {
                    name
                }
            })
        } catch (error) {
            throw new Error(String(error))
        }
    }

    // delete destination
    async deleteDestination (destinationId: string) {
        try {
            const destination = await this.prisma.destination.findUnique({
                where: {
                    id: destinationId
                }
            });

            if(!destination){
                throw new DestinationNotFoundException(destinationId);
            }

            return await this.prisma.destination.delete({
                where: {
                    id: destinationId
                }
            })
        } catch (error) {
            throw new Error(String(error))
        }
    }
}
