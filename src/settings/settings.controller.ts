import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import type { Response } from 'express';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async index(@Res() res: Response): Promise<void> {
    const settings: unknown = await this.settingsService.getSettings();
    res.render('settings/index', {
      settings,
      activeNav: 'settings',
      layout: false,
    });
  }

  @Post()
  async update(@Body() dto: UpdateSettingsDto, @Res() res: Response): Promise<void> {
    try {
      await this.settingsService.updateSettings(dto);
      res.redirect('/settings');
    } catch {
      const settings: unknown = await this.settingsService.getSettings();
      res.render('settings/index', {
        settings,
        activeNav: 'settings',
        error: 'Unable to update settings',
      });
    }
  }
}
