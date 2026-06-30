import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    UseInterceptors,
    UploadedFile,
    Body,
    UseGuards,
    UploadedFiles
} from '@nestjs/common';
import { ItinerariesService } from './itineraries.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../generated/prisma/enums';

@Controller('itineraries')
export class ItinerariesController {
    constructor(
        private readonly itineraries: ItinerariesService
    ) { }

    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @UseInterceptors(FileInterceptor('itineraryImage'))
    @Post(':tourId')
    async createItinerary(
        @Param('tourId') tourId: string,
        @Body() dto: { itinerary: CreateItineraryDto },
        @UploadedFile() itineraryImage: Express.Multer.File
    ) {
        return await this.itineraries.createItinerary(tourId, dto.itinerary, itineraryImage);
    }

    @Post(":tourId/bulk")
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @UseInterceptors(FilesInterceptor("itineraryImages"))
    async createBulkItineraries(
        @Param("tourId") tourId: string,
        @Body() dto: { itineraries: string },
        @UploadedFiles() itineraryImages: Express.Multer.File[],
    ) {
        const itineraries: CreateItineraryDto[] = JSON.parse(dto.itineraries)
        return this.itineraries.createBulkItineraries(
            tourId,
            itineraries,
            itineraryImages,
        );
    }

    @Get(':tourId')
    async getTourItineraries(@Param('tourId') tourId: string) {
        return await this.itineraries.getItineraries(tourId);
    }

    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Patch(':itineraryId')
    async updateItinerary(@Param('itineraryId') itineraryId: string) {
        return await this.updateItinerary(itineraryId);
    }

    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Delete(':itineraryId')
    async deleteItinerary(@Param('itineraryId') itineraryId: string) {
        return await this.itineraries.deleteItinerary(itineraryId);
    }
}
