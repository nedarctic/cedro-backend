import { NotFoundException } from "@nestjs/common";

export class DestinationNotFoundException extends NotFoundException {
    constructor(destinationId: string){
        super(`Destination with ID: ${destinationId} not found`)
    }
}