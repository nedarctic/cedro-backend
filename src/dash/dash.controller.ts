import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DashService } from './dash.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/role.decorator';
import { UserRole } from '../generated/prisma/enums';

@UseGuards(JwtAuthGuard, RoleGuard)
@Roles(UserRole.SUPER_ADMIN)
@Controller('dash')
export class DashController {
    constructor(
        private readonly dashService: DashService
    ){}

    @Get('/kpis')
    async getDashKpis () {
        return await this.dashService.getDashKpis();
    }
}
