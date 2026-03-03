import { Controller, Get, Post, Body, Query, UseGuards, Req, BadRequestException, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Post('videos')
  @UseGuards(JwtAuthGuard)
  uploadVideo(@Req() req, @Body() body: { filename: string; content: string }) {
    if (!body.filename || !body.content) {
      throw new BadRequestException('Filename and content are required');
    }
    return this.mobileService.uploadMobileVideo(req.user.id, body.filename, body.content);
  }

  @Get('feed')
  getFeed(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.mobileService.getFeed(page, limit);
  }
}