import { Test, TestingModule } from '@nestjs/testing';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { InternalServerErrorException } from '@nestjs/common';

describe('SettingsController', () => {
  let controller: SettingsController;
  let service: SettingsService;

  const mockSettingsService = {
    findSettings: jest.fn(),
    updateSettings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingsController],
      providers: [{ provide: SettingsService, useValue: mockSettingsService }],
    }).compile();

    controller = module.get<SettingsController>(SettingsController);
    service = module.get<SettingsService>(SettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('index', () => {
    it('should return settings', async () => {
      const mockSettings = {
        id: '1',
        companyName: 'Test Company',
        companyAddress: '123 Test St',
        currency: 'EUR',
        defaultTaxRate: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSettingsService.findSettings.mockResolvedValue(mockSettings);

      const result = await controller.index();

      expect(result).toEqual({ settings: mockSettings });
      expect(service.findSettings).toHaveBeenCalledTimes(1);
    });

    it('should return empty object if no settings exist', async () => {
      mockSettingsService.findSettings.mockResolvedValue(null);

      const result = await controller.index();

      expect(result).toEqual({ settings: {} });
      expect(service.findSettings).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockSettingsService.findSettings.mockRejectedValue(new Error());

      await expect(controller.index()).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('should update settings successfully', async () => {
      const updateData = {
        companyName: 'New Company',
        currency: 'USD',
      };

      const updatedSettings = {
        id: '1',
        companyAddress: '123 Test St',
        defaultTaxRate: 20,
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSettingsService.updateSettings.mockResolvedValue(updatedSettings);

      await controller.update(updateData);

      expect(service.updateSettings).toHaveBeenCalledWith(updateData);
      expect(service.updateSettings).toHaveBeenCalledTimes(1);
    });

    it('should throw InternalServerErrorException on error', async () => {
      const updateData = {
        companyName: 'New Company',
      };

      mockSettingsService.updateSettings.mockRejectedValue(new Error());

      await expect(controller.update(updateData)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
