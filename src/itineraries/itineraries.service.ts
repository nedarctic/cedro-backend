import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { R2Service } from '../r2/r2.service';
import { TourNotFoundException } from '../tours/exceptions/tour-not-found.exception';
import { ToursService } from '../tours/tours.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { ItineraryNotFoundException } from './exceptions/itinerary-not-found.exception';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';

@Injectable()
export class ItinerariesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tours: ToursService,
        private readonly r2: R2Service
    ) { }

    // create new itinerary
    async createItinerary(tourId: string, dto: CreateItineraryDto, itineraryImage: Express.Multer.File) {
        try {
            const tour = await this.tours.getTour(tourId);

            if (!tour) {
                throw new TourNotFoundException(tourId);
            }

            // upload image
            const { key, publicUrl } = await this.r2.uploadFile(itineraryImage, "itineraries");

            return await this.prisma.itinerary.create({
                data: {
                    ...dto,
                    itineraryImageKey: key,
                    itineraryImageUrl: publicUrl,
                    tourId
                }
            })
        } catch (error) {
            throw new Error(String(error))
        }
    }

    // get tour itineraries
    async getItineraries(tourId: string) {
        try {
            const tour = await this.tours.getTour(tourId);
            if (!tour) {
                throw new TourNotFoundException(tourId);
            }

            return await this.prisma.itinerary.findMany({
                where: {
                    tourId
                },
                orderBy: {
                    day: "desc"
                }
            })
        } catch (error) {
            throw new Error(String(error))
        }
    }

    // update itinerary
    async updateItinerary(tourId: string, itineraryId: string, dto: UpdateItineraryDto, itineraryImage?: Express.Multer.File) {
        try {
            const tour = await this.tours.getTour(tourId);
            if (!tour) {
                throw new TourNotFoundException(tourId);
            }

            const itinerary = await this.prisma.itinerary.findUnique({
                where: {
                    id: itineraryId
                }
            });

            if (!itinerary) {
                throw new ItineraryNotFoundException(itineraryId);
            }

            // remove remote assets
            itineraryImage && itineraryImage.size > 0 && await this.r2.deleteFile(itinerary.itineraryImageKey);

            // upload image
            const { key, publicUrl } = itineraryImage && itineraryImage.size > 0 ?
                await this.r2.uploadFile(itineraryImage, "itineraries") : {};

            return await this.prisma.itinerary.update({
                where: {
                    id: itineraryId
                },
                data: {
                    ...dto,
                    itineraryImageKey: key,
                    itineraryImageUrl: publicUrl,
                }
            })
        } catch (error) {
            throw new Error(String(error));
        }
    }

    // delete itinerary
    async deleteItinerary (itineraryId: string) {
        try {
            const itinerary = await this.prisma.itinerary.findUnique({
                where: {
                    id: itineraryId
                }
            });

            if(!itinerary){
                throw new ItineraryNotFoundException(itineraryId);
            }

            // delete remote image
            await this.r2.deleteFile(itinerary.itineraryImageKey);

            // delete db record
            return await this.prisma.itinerary.delete({
                where: {
                    id: itineraryId
                }
            })
        } catch (error) {
            throw new Error(String(error))
        }
    }
}
