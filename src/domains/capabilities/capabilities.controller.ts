import { Body, Controller, ForbiddenException, Get, Headers, Post, UseGuards, Req } from '@nestjs/common';
import { CapabilitiesService } from './capabilities.service';
import { CreateCapabilityDto } from './dto/create-capability.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('capabilities')
export class CapabilitiesController {
  constructor(private readonly capabilitiesService: CapabilitiesService) {}

  @Get()
  listAll() {
    return this.capabilitiesService.listAll();
  }

  @Get('applications/me')
  @UseGuards(JwtAuthGuard)
  listMyApplications(@Req() req) {
    return this.capabilitiesService.listUserApplications(req.user.id);
  }

  @Post()
  createCapability(@Headers('x-admin') adminHeader: string | undefined, @Body() dto: CreateCapabilityDto) {
    const isAdmin = adminHeader === 'true' || adminHeader === '1';
    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return this.capabilitiesService.createCapability(dto);
  }
}
