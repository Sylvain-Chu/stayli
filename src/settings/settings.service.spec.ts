import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let prismaService: PrismaService;

  const mockSettings = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    companyName: 'Test Company',
    companyAddress: '123 Test St',
    companyPhoneNumber: '+33123456789',
    companyEmail: 'test@company.com',
    companyLogoUrl: null,
    defaultLanguage: 'en',
    currencyCode: 'EUR',
    currencySymbol: '€',
    lowSeasonMonths: [1, 2, 3, 11, 12],
    lowSeasonRate: 100.0,
    highSeasonRate: 150.0,
    linensOptionPrice: 20.0,
    cleaningOptionPrice: 50.0,
    touristTaxRatePerPersonPerDay: 2.5,
    invoicePrefix: 'INV-',
    invoiceDueDays: 30,
    invoicePaymentInstructions: 'Please pay by bank transfer',
    cancellationInsurancePercentage: 5.0,
    cancellationInsuranceProviderName: 'Insurance Co',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: PrismaService,
          useValue: {
            settings: {
              count: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSettings', () => {
    it('should return existing settings', async () => {
      jest.spyOn(prismaService.settings, 'count').mockResolvedValue(1);
      jest.spyOn(prismaService.settings, 'findFirst').mockResolvedValue(mockSettings);

      const result = await service.getSettings();

      expect(result).toEqual(mockSettings);
      expect(prismaService.settings.count).toHaveBeenCalled();
      expect(prismaService.settings.findFirst).toHaveBeenCalled();
    });

    it('should create default settings when none exist', async () => {
      jest.spyOn(prismaService.settings, 'count').mockResolvedValue(0);
      jest.spyOn(prismaService.settings, 'create').mockResolvedValue(mockSettings);

      const result = await service.getSettings();

      expect(result).toEqual(mockSettings);
      expect(prismaService.settings.count).toHaveBeenCalled();
      expect(prismaService.settings.create).toHaveBeenCalledWith({ data: {} });
    });
  });

  describe('updateSettings', () => {
    const updateDto = {
      companyName: 'Updated Company',
      companyEmail: 'updated@company.com',
      lowSeasonRate: 120.0,
    };

    it('should update existing settings', async () => {
      const updatedSettings = { ...mockSettings, ...updateDto };

      jest.spyOn(prismaService.settings, 'count').mockResolvedValue(1);
      jest.spyOn(prismaService.settings, 'findFirst').mockResolvedValue(mockSettings);
      jest.spyOn(prismaService.settings, 'update').mockResolvedValue(updatedSettings);

      const result = await service.updateSettings(updateDto);

      expect(result).toEqual(updatedSettings);
      expect(prismaService.settings.update).toHaveBeenCalledWith({
        where: { id: mockSettings.id },
        data: updateDto,
      });
    });

    it('should get settings before updating', async () => {
      const getSettingsSpy = jest.spyOn(service, 'getSettings').mockResolvedValue(mockSettings);
      jest.spyOn(prismaService.settings, 'update').mockResolvedValue(mockSettings);

      await service.updateSettings(updateDto);

      expect(getSettingsSpy).toHaveBeenCalled();
    });
  });
});
