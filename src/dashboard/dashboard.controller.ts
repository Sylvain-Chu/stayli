import { Controller, Get, Query, Render } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @Render('dashboard')
  async getDashboard(@Query('scope') scope?: 'week' | 'month') {
    const data = await this.dashboardService.getDashboardData(scope);
    return data;
  }
}
