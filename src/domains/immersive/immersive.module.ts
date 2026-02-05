import { Module } from '@nestjs/common';
import { ImmersiveController } from './immersive.controller';
import { ImmersiveService } from './immersive.service';

@Module({
  controllers: [ImmersiveController],
  providers: [ImmersiveService]
})
export class ImmersiveModule {}
