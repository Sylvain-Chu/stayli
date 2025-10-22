import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Settings } from '@prisma/client';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findSettings(): Promise<Settings | null> {
    // Get the first (and only) settings record
    const settings = await this.prisma.settings.findFirst();
    return settings;
  }

  async updateSettings(data: {
    companyName?: string;
    companyAddress?: string;
    currency?: string;
    defaultTaxRate?: number;
  }): Promise<Settings> {
    // Try to get existing settings
    const existing = await this.prisma.settings.findFirst();

    if (existing) {
      // Update existing settings
      return this.prisma.settings.update({
        where: { id: existing.id },
        data,
      });
    } else {
      // Create new settings if none exist
      return this.prisma.settings.create({
        data,
      });
    }
  }
}
