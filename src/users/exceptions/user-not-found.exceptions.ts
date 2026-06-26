import { NotFoundException } from "@nestjs/common";

export class UserNotFoundException extends NotFoundException {
    constructor(options: {userId?: string, email?: string}) {
        super(`User with ${options.userId ? `ID: ${options.userId}` : ''}${options.email ? `the email ${options.email}` : ''} not found.`)
    }
}