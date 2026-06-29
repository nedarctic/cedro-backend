import { Controller, UseFilters, Post, Get, Param, Query, Body, Patch, Delete, UseGuards } from '@nestjs/common';
import { ResponseFilter } from '../common/filters/reponse.filter';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { UserRole } from '../generated/prisma/enums';
import { Roles } from '../auth/decorators/role.decorator';

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
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Patch(':bookingId')
    async updateBooking(@Param('bookingId') bookingId: string, @Body() dto: UpdateBookingDto) {
        return await this.bookings.updateBooking(bookingId, dto)
    }

    // delete booking
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Delete(':bookingId')
    async deleteBooking(@Param('bookingId') bookingId: string) {
        return await this.bookings.deleteBooking(bookingId)
    }
}
