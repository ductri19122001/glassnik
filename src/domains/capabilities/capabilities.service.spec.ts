import { Test, TestingModule } from '@nestjs/testing';
import { CapabilitiesService } from './capabilities.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CapabilitiesService', () => {
  let service: CapabilitiesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CapabilitiesService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CapabilitiesService>(CapabilitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
