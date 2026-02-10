import { Module } from '@nestjs/common';
import { CapabilityController } from './capability.controller';
import { CapabilityService } from './capability.service';
import { ApplicationController } from './application.controller';
import { ApplicationService } from './application.service';

@Module({
  controllers: [CapabilityController, ApplicationController],
  providers: [CapabilityService, ApplicationService],
})
export class CapabilitiesModule {}
