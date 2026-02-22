import { Controller, Post, Get, Patch, Body, Param, UseGuards, Req, ParseIntPipe, UseInterceptors, UploadedFile, BadRequestException, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('videos')
@UseGuards(JwtAuthGuard)
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post()
  async create(@Req() req, @Body() body: { title: string; description?: string }) {
    const userId = req.user.id;
    return this.videoService.create(userId, body);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDirect(
    @Req() req,
    @UploadedFile() file: any,
    @Body() body: { title: string; description?: string },
  ) {
    if (!file) throw new BadRequestException('A file is required for upload.');
    const userId = req.user.id;
    return this.videoService.uploadDirect(userId, file, body);
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
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.videoService.update(id, body);
  }

  @Delete(':id')
  async remove(@Req() req, @Param('id', ParseIntPipe) id: number) {
    const userId = req.user.id;
    return this.videoService.remove(id, userId);
  }
}