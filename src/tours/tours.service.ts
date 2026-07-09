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
            const [tour, totalBookings] = await Promise.all([
                await this.prisma.tour.findUnique({
                    where: {
                        id: tourId
                    },
                    include: {
                        itineraries: {
                            orderBy: {
                                day: "asc"
                            }
                        },
                        destination: true,
                    },
                }),
                await this.prisma.tour.findUnique({
                    where: {
                        id: tourId
                    },
                    select: {
                        _count: {
                            select: {
                                bookings: true
                            }
                        }
                    }
                }).then(count => count?._count.bookings!)
            ])

            if (!tour) {
                throw new TourNotFoundException(tourId);
            }

            return { ...tour, totalBookings };
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
            tour.tourImageKey && await this.r2.deleteFile(tour.tourImageKey);

            return await this.prisma.tour.delete({
                where: {
                    id: tourId
                }
            })
        } catch (error) {
            throw new Error(String(error));
        }
    }

    // update a tour test
    async updateTourTest(
        files: {
            tourImage: Express.Multer.File[],
            updatedItinerariesImages: Express.Multer.File[],
            newItinerariesImages: Express.Multer.File[]
        },
        dto: {
            tour: string;
            newItineraries?: string;
            updatedItineraries?: string;
            updatedItinerariesRels?: string;
        },
        tourId: string
    ) {
        try {

            const {
                tourImage,
                newItinerariesImages,
                updatedItinerariesImages,
            } = files;

            const {
                newItineraries: newIncomingIts,
                tour: incomingTour,
                updatedItineraries: updatedIncomingIts,
                updatedItinerariesRels
            } = dto;

            const tourData: UpdateTourDto = JSON.parse(incomingTour);

            const updatedIts: {
                id: string;
                subtitle: string;
                activities: string[];
            }[] = updatedIncomingIts && JSON.parse(updatedIncomingIts);

            const newIts: {
                subtitle: string;
                activities: string[];
            }[] = newIncomingIts && JSON.parse(newIncomingIts);

            const updatedItsRls: string[] = updatedItinerariesRels && JSON.parse(updatedItinerariesRels);

            // get new, updated and deleted itineraries
            const updatedIncomingItineraries = updatedIts;
            const newIncomingItineraries = newIts;
            const deletedItineraries: { id: string }[] = [];

            const incomingItinerariesIds = updatedIncomingItineraries.map(itinerary => itinerary.id)
            const incomingIdsSet = new Set(incomingItinerariesIds);
            
            const existingItinerariesIds = (await this.prisma.itinerary.findMany({ where: { tourId } }).then(res => res)).map(({id}) => id)
            this.logger.log('existing ids', )
            
            for (const id of existingItinerariesIds) {
                if (!incomingIdsSet.has(id)) {
                    deletedItineraries.push({ id: id });
                }
            }

            // get tour
            const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });

            if (!tour) {
                throw new TourNotFoundException(tourId);
            }

            // delete remote tour image
            if (tourImage && tourImage.length && tourImage[0].size > 0 && tour.tourImageKey) {
                await this.r2.deleteFile(tour.tourImageKey);
            }

            // upload tour image
            const { key: tourImageKey, publicUrl: tourImageUrl } = (tourImage && tourImage.length) ? await this.r2.uploadFile(tourImage[0], 'tours') : {};

            // delete remote itinerary assets
            for (const { id } of deletedItineraries) {
                const itinerary = await this.prisma.itinerary.findUnique({ where: { id } });
                await this.r2.deleteFile(itinerary?.itineraryImageKey!);
            }

            // upload new itinerary images && construct new itineraries for db insert
            const newItineraries = newIncomingItineraries && newIncomingItineraries.length ? await Promise.all(
                newIncomingItineraries.map(async ({ ...newItinerary }, index) => {
                    let newItineraryImage: Express.Multer.File | undefined;
                    let itineraryImageUrl: string = '';
                    let itineraryImageKey: string = '';

                    if (newItinerariesImages[index]?.size > 0) {
                        newItineraryImage = newItinerariesImages[index];
                    }

                    if (newItineraryImage && newItineraryImage.size > 0) {
                        const { publicUrl, key } = await this.r2.uploadFile(newItineraryImage, 'itineraries');
                        itineraryImageKey = key;
                        itineraryImageUrl = publicUrl;
                    }

                    return {
                        ...newItinerary,
                        day: `Day ${index}`,
                        subtitle: newItinerary.subtitle,
                        itineraryImageUrl: itineraryImageUrl,
                        itineraryImageKey: itineraryImageKey
                    }
                })
            ) : undefined;

            // upload updated itinerary images && construct update payloads for db update
            const updatedItineraries = updatedIncomingItineraries && updatedIncomingItineraries.length ? await Promise.all(
                updatedIncomingItineraries.map(async ({ id, ...updatedItinerary }, index) => {

                    let updatedItineraryImage: Express.Multer.File | undefined;
                    let itineraryImageUrl: string | undefined;
                    let itineraryImageKey: string | undefined;

                    if (updatedItsRls && updatedItsRls.length) {
                        const imageId = updatedItsRls[index];
                        if (updatedItinerariesImages[imageId]?.size > 0) {
                            updatedItineraryImage = updatedItinerariesImages[imageId]
                        }

                        if (updatedItineraryImage) {
                            const { publicUrl, key } = await this.r2.uploadFile(updatedItineraryImage, 'itineraries');
                            itineraryImageKey = key;
                            itineraryImageUrl = publicUrl;
                        }
                    }

                    return {
                        where: { id: id! },
                        data: {
                            ...updatedItinerary,
                            itineraryImageUrl,
                            itineraryImageKey
                        }
                    }
                })
            ) : undefined;
            // nested tour update
            return await this.prisma.tour.update({
                where: {
                    id: tourId
                },
                data: {
                    ...tourData,
                    tourImageKey,
                    tourImageUrl,
                    itineraries: {
                        create: newItineraries,
                        update: updatedItineraries,
                        deleteMany: deletedItineraries
                    }
                }
            })

        } catch (error) {
            throw error;
        }
    }
}
