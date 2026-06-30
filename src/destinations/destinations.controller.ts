import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { DestinationsService } from './destinations.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../generated/prisma/enums';

@Controller('destinations')
export class DestinationsController {
    constructor(
        private readonly destinations: DestinationsService
    ) { }

    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Post()
    async createDestination(@Body() dto: { destinationName: string }) {
        return await this.destinations.createDestination(dto.destinationName);
    }

    @Get()
    async getDestinations(@Query() pagination: PaginationDto) {
        return await this.destinations.getDestinations(pagination);
    }

    @Get(':destinationId')
    async getDestination(@Param('destinationId') destinationId: string) {
        return await this.destinations.getDestination(destinationId);
    }

    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Patch(':destinationId')
    async updateDestination(
        @Param('destinationId') destinationId: string,
        @Body() dto: { name: string }
    ) {
        return await this.destinations.updateDestination(destinationId, dto.name);
    }

    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Delete(':destinationId')
    async deleteDestination(@Param('destinationId') destinationId: string) {
        return await this.destinations.deleteDestination(destinationId);
    }
}
