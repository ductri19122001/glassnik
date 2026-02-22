import { Controller, Post, Get, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  create(@Req() req, @Body() body: { planCode: string }) {
    const userId = req.user.id;
    if (!body.planCode) throw new BadRequestException('Missing planCode in body');
    
    return this.subscriptionsService.create(userId, body.planCode);
  }

  @Get('current')
  getCurrent(@Req() req) {
    const userId = req.user.id;
    return this.subscriptionsService.findCurrent(userId);
  }

  @Post('cancel')
  cancel(@Req() req) {
    const userId = req.user.id;
    return this.subscriptionsService.cancel(userId);
  }
}