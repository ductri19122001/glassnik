import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeCapabilitiesController {
  constructor(private readonly userService: UserService) {}

  @Get('capabilities')
  getMyCapabilities(@Req() req) {
    return this.userService.listUserCapabilities(req.user.id);
  }
}
