import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LiveService } from './live.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import {
  CapabilitiesGuard,
  RequireCapabilities,
} from '@/auth/guards/capabilities.guard';

@Controller('live')
export class LiveController {
  constructor(private readonly liveService: LiveService) {}

  @Get(':liveId')
  watchPublic(@Param('liveId', ParseIntPipe) liveId: number) {
    return this.liveService.getPublicLive(liveId);
  }

  @Get(':liveId/premium')
  @UseGuards(JwtAuthGuard, CapabilitiesGuard)
  @RequireCapabilities('live.subscriber')
  watchPremium(@Param('liveId', ParseIntPipe) liveId: number) {
    return this.liveService.getPremiumLive(liveId);
  }

  @Post('start')
  @UseGuards(JwtAuthGuard, CapabilitiesGuard)
  @RequireCapabilities('live.creator')
  startLive(@Req() req) {
    return this.liveService.startLive(req.user.id);
  }

  @Post(':liveId/chat')
  @UseGuards(JwtAuthGuard, CapabilitiesGuard)
  @RequireCapabilities('live.viewer')
  sendChat(
    @Param('liveId', ParseIntPipe) liveId: number,
    @Req() req,
  ) {
    return this.liveService.sendChat(liveId, req.user.id);
  }
}
