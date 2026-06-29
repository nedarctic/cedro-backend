import { Module } from '@nestjs/common';
import { ItinerariesService } from './itineraries.service';

@Module({
  providers: [ItinerariesService]
})
export class ItinerariesModule {}
