import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('videos')
@UseGuards(JwtAuthGuard)
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateVideoDto) {
    return this.videoService.create(req.user.id, dto);
  }

  @Get()
  findAll(@Req() req) {
    return this.videoService.findAllByOwner(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.videoService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req,
    @Body() dto: UpdateVideoDto,
  ) {
    return this.videoService.update(id, req.user.id, dto);
  }
}
