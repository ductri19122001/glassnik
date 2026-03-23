import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { VideoService } from './video.service';
import { VideographerVideosQueryDto } from './dto/videographer-videos-query.dto';

@Controller('videographers')
@UseGuards(JwtAuthGuard)
export class VideographerController {
  constructor(private readonly videoService: VideoService) {}

  @Get(':id')
  async profile(@Param('id', ParseIntPipe) id: number) {
    return this.videoService.getVideographerProfile(id);
  }

  @Get(':id/videos')
  async videos(@Param('id', ParseIntPipe) id: number, @Query() query: VideographerVideosQueryDto) {
    return this.videoService.getVideographerVideos(id, query);
  }
}

