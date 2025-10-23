import { Test, TestingModule } from '@nestjs/testing';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { Response } from 'express';

describe('SettingsController', () => {
  let controller: SettingsController;
  let service: SettingsService;

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
      controllers: [SettingsController],
      providers: [
        {
          provide: SettingsService,
          useValue: {
            getSettings: jest.fn(),
            updateSettings: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SettingsController>(SettingsController);
    service = module.get<SettingsService>(SettingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('index', () => {
    it('should render settings page with settings data', async () => {
      const getSpy = jest.spyOn(service, 'getSettings').mockResolvedValue(mockSettings);

      const renderSpy = jest.fn();
      const mockResponse = { render: renderSpy } as unknown as Response;

      await controller.index(mockResponse);

      expect(getSpy).toHaveBeenCalled();
      expect(renderSpy).toHaveBeenCalledWith('settings/index', {
        settings: mockSettings,
        activeNav: 'settings',
        layout: false,
      });
    });
  });

  describe('update', () => {
    const updateDto = {
      companyName: 'Updated Company',
      companyEmail: 'updated@company.com',
      lowSeasonRate: 120.0,
    };

    it('should update settings and redirect on success', async () => {
      const updateSpy = jest.spyOn(service, 'updateSettings').mockResolvedValue(mockSettings);

      const redirectSpy = jest.fn();
      const mockResponse = {
        redirect: redirectSpy,
      } as unknown as Response;

      await controller.update(updateDto, mockResponse);

      expect(updateSpy).toHaveBeenCalledWith(updateDto);
      expect(redirectSpy).toHaveBeenCalledWith('/settings');
    });

    it('should render form with error on failure', async () => {
      const error = new Error('Update failed');
      const updateSpy = jest.spyOn(service, 'updateSettings').mockRejectedValue(error);
      const getSpy = jest.spyOn(service, 'getSettings').mockResolvedValue(mockSettings);

      const renderSpy = jest.fn();
      const mockResponse = {
        render: renderSpy,
      } as unknown as Response;

      await controller.update(updateDto, mockResponse);

      expect(updateSpy).toHaveBeenCalledWith(updateDto);
      expect(getSpy).toHaveBeenCalled();
      expect(renderSpy).toHaveBeenCalledWith('settings/index', {
        settings: mockSettings,
        activeNav: 'settings',
        error: 'Unable to update settings',
        layout: false,
      });
    });
  });
});
