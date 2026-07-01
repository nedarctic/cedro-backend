import { NotFoundException } from "@nestjs/common";

export class BlogNotFoundException extends NotFoundException {
    constructor(blogId: string) {
        super(`Blog with ID ${blogId} not found`);
    }
}