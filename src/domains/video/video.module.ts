import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { GcpModule } from '@/gcp.module';

@Module({
  imports: [GcpModule],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
