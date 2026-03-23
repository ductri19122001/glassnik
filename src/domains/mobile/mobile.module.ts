import { Module } from '@nestjs/common';
import { MobileController } from './mobile.controller';
import { MobileService } from './mobile.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { GcpModule } from '../../gcp.module';

@Module({
  imports: [PrismaModule, GcpModule],
  controllers: [MobileController],
  providers: [MobileService],
})
export class MobileModule {}