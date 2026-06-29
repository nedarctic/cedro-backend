import { Module } from '@nestjs/common';
import { DestinationsService } from './destinations.service';
import { DestinationsController } from './destinations.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [DestinationsService],
  controllers: [DestinationsController],
  exports: [DestinationsService],
})
export class DestinationsModule {}
