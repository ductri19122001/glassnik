import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MobileService } from './mobile.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  CapabilitiesGuard,
  RequireCapabilities,
} from '@/auth/guards/capabilities.guard';
import { CursorPaginationDto } from '@/common/dto/cursor-pagination.dto';

@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Post('videos')
  @UseGuards(JwtAuthGuard, CapabilitiesGuard)
  @RequireCapabilities('mobile.creator')
  uploadVideo(@Req() req) {
    return this.mobileService.uploadVideo(req.user.id);
  }

  @Get('feed')
  getFeed(@Query() pagination: CursorPaginationDto) {
    return this.mobileService.getFeed(pagination);
  }
}
