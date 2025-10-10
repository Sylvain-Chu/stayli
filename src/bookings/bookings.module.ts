import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InvoicesModule } from 'src/invoices/invoices.module';

@Module({
  imports: [PrismaModule, InvoicesModule],
  providers: [BookingsService],
  controllers: [BookingsController],
})
export class BookingsModule {}
