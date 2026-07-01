import { NotFoundException } from "@nestjs/common";

export class SectionNotFoundException extends NotFoundException {
    constructor(sectionId: string) {
        super(`Section with ID ${sectionId} not found`);
    }
}