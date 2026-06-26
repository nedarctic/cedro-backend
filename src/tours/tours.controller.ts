import { Controller, Post, Get, Param, Body, Patch, Delete, Query, Logger, UseFilters, UseGuards } from '@nestjs/common';
import { ToursService } from './tours.service';
import { CreateTourDto } from './dto/create-tour.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';
import { UpdateTourDto } from './dto/update-tour.dto';
import { ResponseFilter } from '../common/filters/reponse.filter';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../generated/prisma/enums';

@UseFilters(ResponseFilter)
@Controller('tours')
export class ToursController {

    private readonly logger = new Logger(ToursController.name);

    constructor(
        private readonly tours: ToursService
    ) { }

    // create a tour
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Post()
    async createTour(@Body() dto: CreateTourDto) {
        return await this.tours.createTour(dto);
    }

    // get paginated tours
    @Get()
    async getTours(@Query() pagination: PaginationDto) {
        return await this.tours.getTours(pagination);
    }

    // get tour by id
    @Get(':tourId')
    async getTour(@Param('tourId') tourId: string) {
        this.logger.log(`id received ${tourId}`)
        return await this.tours.getTour(tourId);
    }

    // update a tour
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Patch(':tourId')
    async updateTour(@Param('tourId') tourId: string, @Body() dto: UpdateTourDto) {
        return await this.tours.updateTour(tourId, dto);
    }

    // delete a tour
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Delete(':tourId')
    async deleteTour(@Param('tourId') tourId: string) {
        return await this.tours.deleteTour(tourId);
    }
}
