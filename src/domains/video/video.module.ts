import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { VideographerController } from './videographer.controller';

@Module({
  imports: [PrismaModule],
  controllers: [VideoController, VideographerController],
  providers: [VideoService],
})
export class VideoModule {}
