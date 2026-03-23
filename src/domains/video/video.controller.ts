import { Controller, Post, Get, Patch, Body, Param, UseGuards, Req, ParseIntPipe, UseInterceptors, UploadedFile, BadRequestException, Delete, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { FeedVideosQueryDto } from './dto/feed-videos-query.dto';
import { ExploreVideosQueryDto } from './dto/explore-videos-query.dto';
import { TrendingVideosQueryDto } from './dto/trending-videos-query.dto';
import { NearbyVideosQueryDto } from './dto/nearby-videos-query.dto';

@Controller('videos')
@UseGuards(JwtAuthGuard)
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  async create(@Req() req, @Body() body: CreateVideoDto) {
    const userId = req.user.id;
    return this.videoService.create(userId, body);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDirect(
    @Req() req,
    @UploadedFile() file: any,
    @Body() body: CreateVideoDto,
  ) {
    if (!file) throw new BadRequestException('A file is required for upload.');
    const userId = req.user.id;
    return this.videoService.uploadDirect(userId, file, body);
  }

  @Get('feed')
  async feed(@Query() query: FeedVideosQueryDto) {
    return this.videoService.getFeed(query);
  }

  @Get('explore')
  async explore(@Query() query: ExploreVideosQueryDto) {
    return this.videoService.explore(query);
  }

  @Get('trending')
  async trending(@Query() query: TrendingVideosQueryDto) {
    return this.videoService.trending(query);
  }

  @Get('nearby')
  async nearby(@Query() query: NearbyVideosQueryDto) {
    return this.videoService.nearby(query);
  }

  @Get()
  async findAll(@Req() req) {
    const userId = req.user.id;
    return this.videoService.findAll(userId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.videoService.findOne(id);
  }

  @Patch(':id')
  async update(@Req() req, @Param('id', ParseIntPipe) id: number, @Body() body: UpdateVideoDto) {
    return this.videoService.update(id, req.user.id, body);
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.id;
    return this.videoService.remove(id, userId);
  }
}
