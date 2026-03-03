import { Module } from '@nestjs/common';
import { SmartGlassesController } from './smart-glasses.controller';
import { SmartGlassesService } from './smart-glasses.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { GcpModule } from '../../gcp.module';

@Module({
  imports: [PrismaModule, GcpModule],
  controllers: [SmartGlassesController],
  providers: [SmartGlassesService],
})
export class SmartGlassesModule {}