import { Body, Controller, ForbiddenException, Get, Headers, Post } from '@nestjs/common';
import { CapabilitiesService } from './capabilities.service';
import { CreateCapabilityDto } from './dto/create-capability.dto';

@Controller('capabilities')
export class CapabilitiesController {
  constructor(private readonly capabilitiesService: CapabilitiesService) {}

  @Get()
  listAll() {
    return this.capabilitiesService.listAll();
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
