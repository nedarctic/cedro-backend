import { Controller, UseFilters } from '@nestjs/common';
import { ResponseFilter } from '../common/filters/reponse.filter';

@UseFilters(ResponseFilter)
@Controller('bookings')
export class BookingsController {}
