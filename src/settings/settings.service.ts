import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import type { Settings } from '@prisma/client';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(): Promise<Settings> {
    const count = await this.prisma.settings.count();
    if (count === 0) {
      return this.prisma.settings.create({ data: {} });
    }
    const settings = await this.prisma.settings.findFirst();
    if (!settings) {
      return this.prisma.settings.create({ data: {} });
    }
    return settings;
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<Settings> {
    const settings = await this.getSettings();
    return this.prisma.settings.update({
      where: { id: settings.id },
      data: dto,
    });
  }
}
