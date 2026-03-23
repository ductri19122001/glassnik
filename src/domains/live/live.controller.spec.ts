import { Test, TestingModule } from '@nestjs/testing';
import { LiveController } from './live.controller';
import { LiveService } from './live.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { CapabilitiesGuard } from '@/auth/guards/capabilities.guard';
import { PrismaService } from '@/prisma/prisma.service';

describe('LiveController', () => {
  let controller: LiveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LiveController],
      providers: [
        {
          provide: LiveService,
          useValue: {},
        },
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
        {
          provide: CapabilitiesGuard,
          useValue: { canActivate: jest.fn().mockResolvedValue(true) },
        },
        {
          provide: PrismaService,
          useValue: {
            userCapability: {
              findMany: jest.fn().mockResolvedValue([]),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<LiveController>(LiveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
