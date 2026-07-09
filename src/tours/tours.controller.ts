import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    Patch,
    Delete,
    Query,
    Logger,
    UseFilters,
    UseGuards,
    UploadedFile,
    UseInterceptors,
    UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
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
    @UseInterceptors(FileInterceptor('tourImage'))
    @Post(':destinationId')
    async createTour(
        @Param('destinationId') destinationId: string,
        @Body() dto: { tour: string },
        @UploadedFile() tourImage: Express.Multer.File
    ) {
        const tour = JSON.parse(dto.tour);
        for (const item in tour) {
            this.logger.log(item)
        }
        return await this.tours.createTour(tourImage, destinationId, tour);
    }

    // get paginated tours
    @Get()
    async getTours(@Query() pagination: PaginationDto) {
        return await this.tours.getTours(pagination);
    }

    // get tour by id
    @Get(':tourId')
    async getTour(@Param('tourId') tourId: string) {
        return await this.tours.getTour(tourId);
    }

    // update a tour
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @UseInterceptors(FileInterceptor('tourImage'))
    @Patch(':tourId')
    async updateTour(
        @Param('tourId') tourId: string,
        @Body() dto: UpdateTourDto,
        @UploadedFile() tourImage: Express.Multer.File,
    ) {
        return await this.tours.updateTour(tourId, dto, tourImage);
    }

    // update a tour test    
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @UseInterceptors(FileFieldsInterceptor([
        { name: "tourImage" },
        { name: "updatedItinerariesImages" },
        { name: "newItinerariesImages" }
    ]))
    @Patch(':tourId/test')
    async updateTourTest(
        @UploadedFiles() files: {
            tourImage: Express.Multer.File[];
            updatedItinerariesImages: Express.Multer.File[];
            newItinerariesImages: Express.Multer.File[];
        },
        @Body() dto: {
            tour: string;
            newItineraries: string;
            updatedItineraries: string;
            updatedItinerariesRels: string;
        },
        @Param('tourId') tourId: string
    ) {
        return await this.tours.updateTourTest(
            files,
            dto,
            tourId
        )
    }

    // delete a tour
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Delete(':tourId')
    async deleteTour(@Param('tourId') tourId: string) {
        return await this.tours.deleteTour(tourId);
    }
}
