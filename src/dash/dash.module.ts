import { Module } from '@nestjs/common';
import { DashController } from './dash.controller';
import { DashService } from './dash.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DashController],
  providers: [DashService]
})
export class DashModule {}
