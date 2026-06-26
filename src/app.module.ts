import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BookingsModule } from './bookings/bookings.module';
import { ToursModule } from './tours/tours.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/validation';
import { R2Module } from './r2/r2.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
      validationSchema,
      load: [configuration],
      validationOptions: {
        allowUnknown: true,
      }
    }),
    AuthModule, 
    UsersModule, 
    BookingsModule, 
    ToursModule, 
    PrismaModule, R2Module],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
