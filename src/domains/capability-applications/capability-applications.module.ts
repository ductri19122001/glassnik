import { Module } from '@nestjs/common';
import { CapabilityApplicationsService } from './capability-applications.service';
import { CapabilityApplicationsController } from './capability-applications.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CapabilityApplicationsController],
  providers: [CapabilityApplicationsService],
})
export class CapabilityApplicationsModule {}