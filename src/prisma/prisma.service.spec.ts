import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  it('calls $connect on module init', async () => {
    const service = new PrismaService();
    const spy = jest.spyOn(service, '$connect').mockResolvedValue();
    await service.onModuleInit();
    expect(spy).toHaveBeenCalled();
  });
});
