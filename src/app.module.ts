// Fichier: src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PropertiesModule } from './properties/properties.module';
import { ClientsModule } from './clients/clients.module';

@Module({
  imports: [PrismaModule, PropertiesModule, ClientsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
