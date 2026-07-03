import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Query,
    Body,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { TeamService } from './team.service';
import { UserRole } from '../generated/prisma/enums';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { PaginationDto } from '../common/dtos/pagination.dto';

@Controller('team')
export class TeamController {
    constructor(
        private readonly team: TeamService
    ) { }

    // create a new team member
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @UseInterceptors(FileInterceptor('memberImage'))
    @Post()
    async createTour(@Body() dto: CreateMemberDto, @UploadedFile() memberImage: Express.Multer.File) {
        return this.team.createMember(dto, memberImage)
    }

    // get team members
    @Get()
    async getTeam(@Query() pagination: PaginationDto) {
        return await this.team.getTeam(pagination);
    }

    // get a member
    @Get(':memberId')
    async getMember(@Param('memberId') memberId: string) {
        return await this.getMember(memberId);
    }

    // update a team member
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @UseInterceptors(FileInterceptor('memberImage'))
    @Patch(':memberId')
    async updateMember(
        @Param('memberId') memberId: string,
        @Body() dto: UpdateMemberDto,
        @UploadedFile() memberImage: Express.Multer.File
    ) {
        return await this.team.updateMember(memberId, dto, memberImage)
    }

    // delete a member
    @UseGuards(JwtAuthGuard, RoleGuard)
    @Roles(UserRole.SUPER_ADMIN)
    @Delete(':memberId')
    async deleteMember(@Param('memberId') memberId: string) {
        return await this.deleteMember(memberId);
    }
}
