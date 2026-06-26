import { NotFoundException } from "@nestjs/common";

export class TourNotFoundException extends NotFoundException {
    constructor(tourId: string){
        super(`Tour with ID ${tourId} not found`);
    }
}