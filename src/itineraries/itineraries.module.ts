import { Module } from '@nestjs/common';
import { ItinerariesService } from './itineraries.service';
import { ItinerariesController } from './itineraries.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ToursModule } from '../tours/tours.module';
import { R2Module } from '../r2/r2.module';

@Module({
  imports: [PrismaModule, ToursModule, R2Module],
  providers: [ItinerariesService],
  controllers: [ItinerariesController]
})
export class ItinerariesModule {}
