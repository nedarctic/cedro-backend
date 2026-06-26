import { NotFoundException } from "@nestjs/common";

export class BookingNotFoundException extends NotFoundException {
    constructor (bookingId: string) {
        super(`Booking with ID ${bookingId} not found`)
    }
}