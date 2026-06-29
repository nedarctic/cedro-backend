import { Module } from '@nestjs/common';
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { R2Module } from '../r2/r2.module';
import { DestinationsModule } from '../destinations/destinations.module';

@Module({
  imports: [PrismaModule, R2Module, DestinationsModule],
  providers: [ToursService],
  controllers: [ToursController],
  exports: [ToursService]
})
export class ToursModule {}
