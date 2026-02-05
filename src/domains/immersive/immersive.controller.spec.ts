import { Test, TestingModule } from '@nestjs/testing';
import { ImmersiveController } from './immersive.controller';

describe('ImmersiveController', () => {
  let controller: ImmersiveController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImmersiveController],
    }).compile();

    controller = module.get<ImmersiveController>(ImmersiveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
