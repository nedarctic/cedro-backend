import { Module } from '@nestjs/common';
import { DestinationsService } from './destinations.service';

@Module({
  providers: [DestinationsService]
})
export class DestinationsModule {}
