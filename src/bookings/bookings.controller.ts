import { Controller, UseFilters, Post, Get, Param, Query, Body, Patch, Delete } from '@nestjs/common';
import { ResponseFilter } from '../common/filters/reponse.filter';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@UseFilters(ResponseFilter)
@Controller('bookings')
export class BookingsController {
    constructor(
        private readonly bookings: BookingsService
    ) { }

    // get paginated bookings
    @Get()
    async getBookings(@Query() pagination: PaginationDto) {
        return await this.bookings.getBookings(pagination);
    }

    // create booking
    @Post(':tourId')
    async createBooking(@Param('tourId') tourId: string, @Body() dto: CreateBookingDto) {
        return await this.bookings.createBooking(tourId, dto)
    }

    // get booking
    @Get(':bookingId')
    async getBooking(@Param('bookingId') bookingId: string) {
        return await this.bookings.getBooking(bookingId);
    }

    // update booking
    @Patch(':bookingId')
    async updateBooking(@Param('bookingId') bookingId: string, @Body() dto: UpdateBookingDto) {
        return await this.bookings.updateBooking(bookingId, dto)
    }

    // delete booking
    @Delete(':bookingId')
    async deleteBooking(@Param('bookingId') bookingId: string) {
        return await this.bookings.deleteBooking(bookingId)
    }
}
