import { Body, Controller, Get, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { CapabilityService } from './capability.service';
import { CreateCapabilityDto } from './dto/create-capability.dto';

@Controller('capabilities')
export class CapabilityController {
  constructor(private readonly capabilityService: CapabilityService) {}

  @Get()
  findAll() {
    return this.capabilityService.findAll();
  }

  @Post()
  create(
    @Body() dto: CreateCapabilityDto,
    @Headers('x-admin') adminHeader?: string,
  ) {
    if (adminHeader !== 'true') {
      throw new UnauthorizedException('Admin access required');
    }
    return this.capabilityService.create(dto);
  }
}