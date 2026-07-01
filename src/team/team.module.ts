import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { R2Module } from '../r2/r2.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [R2Module, PrismaModule],
  controllers: [TeamController],
  providers: [TeamService]
})
export class TeamModule {}
