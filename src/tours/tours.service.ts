import { Injectable } from '@nestjs/common';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { TourWhereInput } from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { TourNotFoundException } from './exceptions/tour-not-found.exception';

@Injectable()
export class ToursService {

    constructor(
        private readonly prisma: PrismaService
    ) { }

    // get paginated tours
    async getTours(dto: PaginationDto) {
        try {
            const {
                limit = 10,
                page = 1,
                search
            } = dto;

            const skip = (page - 1) * limit;

            const searchTerm = search && search.trim();

            const where: TourWhereInput = searchTerm ? {
                title: {
                    contains: searchTerm,
                    mode: 'insensitive'
                }

            } : {};

            const [tours, total] = await Promise.all([
                await this.prisma.tour.findMany({
                    take: limit,
                    skip,
                    where,
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                await this.prisma.tour.count({ where })
            ]);

            return {
                tours,
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

    // create tour
    async createTour(dto: CreateTourDto) {
        try {
            return await this.prisma.tour.create({
                data: {
                    ...dto
                }
            })
        } catch (error) {
            throw new Error(String(error))
        }
    }

    // get a tour by id
    async getTour(tourId: string) {
        try {
            const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });

            if (!tour) {
                throw new TourNotFoundException(tourId);
            }

            return tour;
        } catch (error) {
            throw new Error(String(error));
        }
    }

    // update a tour
    async updateTour(tourId: string, dto: UpdateTourDto) {
        try {
            const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });

            if (!tour) {
                throw new TourNotFoundException(tourId);
            }

            return await this.prisma.tour.update({
                where: {
                    id: tourId
                },
                data: {
                    ...dto
                }
            })
        } catch (error) {
            throw new Error(String(error))
        }
    }

    // delete a tour
    async deleteTour(tourId) {
        try {
            const tour = await this.prisma.tour.findUnique({
                where: {
                    id: tourId
                }
            })

            if (!tour) {
                throw new TourNotFoundException(tourId);
            }

            return await this.prisma.tour.delete({
                where: {
                    id: tourId
                }
            })
        } catch (error) {
            throw new Error(String(error));
        }
    }
}
