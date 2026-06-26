import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { BookingWhereInput } from '../generated/prisma/models';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingNotFoundException } from './exceptions/booking-not-found.exception';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { TourNotFoundException } from '../tours/exceptions/tour-not-found.exception';

@Injectable()
export class BookingsService {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    // get paginated bookings
    async getBookings(dto: PaginationDto) {
        try {
            const {
                limit = 10,
                page = 1,
                search
            } = dto;

            const skip = (page - 1) * limit;

            const searchTerm = search && search.trim();

            const where: BookingWhereInput = searchTerm ? {
                OR: [
                    {
                        name: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    },
                    {
                        email: {
                            contains: searchTerm,
                            mode: 'insensitive'
                        }
                    },
                    {
                        tour: {
                            title: {
                                contains: searchTerm,
                                mode: 'insensitive'
                            }
                        }
                    },
                ]

            } : {};

            const [bookings, total] = await Promise.all([
                await this.prisma.booking.findMany({
                    take: limit,
                    skip,
                    where,
                    orderBy: {
                        createdAt: 'desc'
                    }
                }),
                await this.prisma.booking.count({ where })
            ]);

            return {
                bookings,
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

    // create booking
    async createBooking(tourId: string, dto: CreateBookingDto) {
        try {
            const tour = await this.prisma.tour.findUnique({ where: { id: tourId } });

            if (!tour) {
                throw new TourNotFoundException(tourId);
            }

            return await this.prisma.booking.create({
                data: {
                    ...dto,
                    tourId
                }
            })
        } catch (error) {
            throw new Error(String(error));
        }
    }

    // get booking
    async getBooking(bookingId: string) {
        try {
            const booking = await this.prisma.booking.findUnique({
                where: {
                    id: bookingId
                }
            });

            if (!booking) {
                throw new BookingNotFoundException(bookingId);
            }

            return booking;
        }
        catch (error) {
            throw new Error(String(error));
        }
    }

    // update booking
    async updateBooking(bookingId: string, dto: UpdateBookingDto) {
        try {
            const booking = await this.prisma.booking.findUnique({
                where: {
                    id: bookingId
                }
            });

            if (!booking) {
                throw new BookingNotFoundException(bookingId);
            }

            return await this.prisma.booking.update({
                where: {
                    id: bookingId,
                },
                data: {
                    ...dto
                }
            });
        } catch (error) {
            throw new Error(String(error));
        }
    }

    // delete booking
    async deleteBooking(bookingId: string) {
        try {
            const booking = await this.prisma.booking.findUnique({
                where: {
                    id: bookingId
                }
            });

            if (!booking) {
                throw new BookingNotFoundException(bookingId);
            }

            return await this.prisma.booking.delete({
                where: {
                    id: bookingId
                }
            })
        } catch (error) {
            throw new Error(String(error));
        }
    }
}