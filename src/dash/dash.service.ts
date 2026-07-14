import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashService {
    constructor(
        private readonly prisma: PrismaService
    ){}

    // get dash kpis
    async getDashKpis () {
        
        const [
            totalTours, 
            totalBookings,
            totalBlogs,
            totalMembers,
            totalDestinations
        ] = await Promise.all([
            await this.prisma.tour.count(),
            await this.prisma.booking.count(),
            await this.prisma.blog.count(),
            await this.prisma.teamMember.count(),
            await this.prisma.destination.count()
        ]);

        return {
            totalTours,
            totalBookings,
            totalBlogs,
            totalMembers,
            totalDestinations
        }
    }
}
