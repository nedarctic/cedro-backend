import { NotFoundException } from "@nestjs/common";

export class ImageNotFoundException extends NotFoundException {
    constructor(category: string){
        super(`${category} image is required`)
    }
}