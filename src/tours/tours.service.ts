import { Injectable, Logger } from '@nestjs/common';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { ImageNotFoundException } from '../common/exceptions/image-not-found.exception';
import { DestinationsService } from '../destinations/destinations.service';
import { TourWhereInput } from '../generated/prisma/models';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { TourNotFoundException } from './exceptions/tour-not-found.exception';

@Injectable()
export class ToursService {

    private readonly logger = new Logger(ToursService.name)
    constructor(
        private readonly prisma: PrismaService,
        private readonly r2: R2Service,
        private readonly destinations: DestinationsService
    ) { }

    // get paginated tours
    async getTours(dto: PaginationDto) {
        try {
            const {
                limit,
                page = 1,
                search
            } = dto;

            const searchTerm = search && search.trim();

            const where: TourWhereInput = searchTerm ? {
                title: {
                    contains: searchTerm,
                    mode: 'insensitive'
                }

            } : {};

            const [data, total] = await Promise.all([
                await this.prisma.tour.findMany({
                    ...(limit !== undefined && {
                        take: limit,
                        skip: (page - 1) * limit
                    }),
                    where,
                    orderBy: {
                        bookings: {
                            _count: "desc"
                        }
                    },
                    include: {
                        _count: {
                            select: {
                                bookings: true,
                            }
                        }
                    }
                }),
                await this.prisma.tour.count({ where })
            ]);

            const tours = data.map(({ _count, ...tour }) => {
                const { bookings } = _count;
                return {
                    ...tour,
                    totalBookings: bookings
                }
            })

            return {
                tours,
                meta: {
                    page,
                    ...(limit !== undefined && { limit }),
                    total,
                    ...(limit !== undefined && { totalPages: Math.ceil(total / limit) })
                }
            }
        } catch (error) {
            throw new Error(String(error));
        }
    }

    // create tour
    async createTour(tourImage: Express.Multer.File, destinationId: string, dto: CreateTourDto) {
        try {
            const destination = this.destinations.getDestination(destinationId);

            this.logger.log(`Tour image size: ${tourImage.size}`);

            if (!tourImage || tourImage.size === 0) {
                throw new ImageNotFoundException('Tour')
            }

            const { key, publicUrl } = await this.r2.uploadFile(tourImage, "tours");

            return await this.prisma.tour.create({
                data: {
                    ...dto,
                    destinationId,
                    tourImageKey: key,
                    tourImageUrl: publicUrl
                }
            })
        } catch (error) {
            throw new Error(String(error))
        }
    }

    // get a tour by id
    async getTour(tourId: string) {
        try {
            const tour = await this.prisma.tour.findUnique({ where: { id: tourId }, include: { bookings: true } });

            if (!tour) {
                throw new TourNotFoundException(tourId);
            }

            return tour;
        } catch (error) {
            throw new Error(String(error));
        }
    }

    // update a tour
    async updateTour(tourId: string, dto: UpdateTourDto, tourImage?: Express.Multer.File) {
        try {
            const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });

            if (!tour) {
                throw new TourNotFoundException(tourId);
            }

            // delete remote asset
            await this.r2.deleteFile(tour.tourImageKey);

            // upload new asset
            const { key, publicUrl } = tourImage && tourImage.size > 0 ?
                await this.r2.uploadFile(tourImage, "tours") : {};


            return await this.prisma.tour.update({
                where: {
                    id: tourId
                },
                data: {
                    ...dto,
                    tourImageKey: key ? key : tour.tourImageKey,
                    tourImageUrl: publicUrl ? publicUrl : tour.tourImageUrl,
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

            // delete remote assets
            await this.r2.deleteFile(tour.tourImageKey);

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
