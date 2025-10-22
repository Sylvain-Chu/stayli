import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import { PrismaService } from 'src/prisma/prisma.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    settings: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findSettings', () => {
    it('should return settings if they exist', async () => {
      const mockSettings = {
        id: '1',
        companyName: 'Test Company',
        companyAddress: '123 Test St',
        currency: 'EUR',
        defaultTaxRate: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.settings.findFirst.mockResolvedValue(mockSettings);

      const result = await service.findSettings();

      expect(result).toEqual(mockSettings);
      expect(prisma.settings.findFirst).toHaveBeenCalledTimes(1);
    });

    it('should return null if no settings exist', async () => {
      mockPrismaService.settings.findFirst.mockResolvedValue(null);

      const result = await service.findSettings();

      expect(result).toBeNull();
      expect(prisma.settings.findFirst).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateSettings', () => {
    it('should update existing settings', async () => {
      const existingSettings = {
        id: '1',
        companyName: 'Old Company',
        companyAddress: '123 Old St',
        currency: 'EUR',
        defaultTaxRate: 20,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedData = {
        companyName: 'New Company',
        currency: 'USD',
      };

      const updatedSettings = {
        ...existingSettings,
        ...updatedData,
      };

      mockPrismaService.settings.findFirst.mockResolvedValue(existingSettings);
      mockPrismaService.settings.update.mockResolvedValue(updatedSettings);

      const result = await service.updateSettings(updatedData);

      expect(result).toEqual(updatedSettings);
      expect(prisma.settings.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.settings.update).toHaveBeenCalledWith({
        where: { id: existingSettings.id },
        data: updatedData,
      });
    });

    it('should create settings if none exist', async () => {
      const newData = {
        companyName: 'New Company',
        currency: 'EUR',
        defaultTaxRate: 20,
      };

      const createdSettings = {
        id: '1',
        companyAddress: null,
        ...newData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.settings.findFirst.mockResolvedValue(null);
      mockPrismaService.settings.create.mockResolvedValue(createdSettings);

      const result = await service.updateSettings(newData);

      expect(result).toEqual(createdSettings);
      expect(prisma.settings.findFirst).toHaveBeenCalledTimes(1);
      expect(prisma.settings.create).toHaveBeenCalledWith({
        data: newData,
      });
    });
  });
});
