import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateSubscriptionDto) {
    return this.subscriptionsService.create(req.user.id, dto);
  }

  @Get('current')
  getCurrent(@Req() req) {
    return this.subscriptionsService.getCurrent(req.user.id);
  }

  @Post('cancel')
  cancel(@Req() req) {
    return this.subscriptionsService.cancel(req.user.id);
  }
}
