// Fichier: src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PropertiesModule } from './properties/properties.module';

@Module({
  imports: [PrismaModule, PropertiesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
