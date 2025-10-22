import { DashboardController } from './dashboard.controller';
import type { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  it('getDashboard returns data from service', async () => {
    const svc = {
      getDashboardData: jest.fn<Promise<unknown>, [scope?: 'week' | 'month']>().mockResolvedValue({
        ok: true,
      }),
    } as unknown as DashboardService;
    const ctrl = new DashboardController(svc);
    const res = await ctrl.getDashboard('month');
    expect(res).toEqual({ ok: true, activeNav: 'dashboard' });
    expect(
      (svc as unknown as { getDashboardData: jest.Mock }).getDashboardData,
    ).toHaveBeenCalledTimes(1);
  });
});
