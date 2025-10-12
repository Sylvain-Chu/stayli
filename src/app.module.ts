// Fichier: src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticatedGuard } from './auth/authenticated.guard';
import { ValidationExceptionFilter } from './common/filters/validation-exception.filter';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PropertiesModule } from './properties/properties.module';
import { ClientsModule } from './clients/clients.module';
import { BookingsModule } from './bookings/bookings.module';
import { InvoicesModule } from './invoices/invoices.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PropertiesModule,
    ClientsModule,
    BookingsModule,
    InvoicesModule,
    DashboardModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ValidationExceptionFilter,
    { provide: APP_GUARD, useClass: AuthenticatedGuard },
  ],
})
export class AppModule {}
