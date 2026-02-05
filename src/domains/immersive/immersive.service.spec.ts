import { Test, TestingModule } from '@nestjs/testing';
import { ImmersiveService } from './immersive.service';

describe('ImmersiveService', () => {
  let service: ImmersiveService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImmersiveService],
    }).compile();

    service = module.get<ImmersiveService>(ImmersiveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
