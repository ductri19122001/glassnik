import { Test, TestingModule } from '@nestjs/testing';
import { CapabilitiesController } from './capabilities.controller';
import { CapabilitiesService } from './capabilities.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

describe('CapabilitiesController', () => {
  let controller: CapabilitiesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CapabilitiesController],
      providers: [
        {
          provide: CapabilitiesService,
          useValue: {},
        },
        {
          provide: JwtAuthGuard,
          useValue: { canActivate: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    controller = module.get<CapabilitiesController>(CapabilitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
