import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Redirect,
  InternalServerErrorException,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Render('settings/index')
  async index() {
    try {
      const settings = await this.settingsService.findSettings();
      return { settings: settings || {} };
    } catch {
      throw new InternalServerErrorException('Failed to retrieve settings.');
    }
  }

  @Post()
  @Redirect('/settings')
  async update(@Body() body: UpdateSettingsDto) {
    try {
      await this.settingsService.updateSettings(body);
      return;
    } catch {
      throw new InternalServerErrorException('Error updating settings.');
    }
  }
}
