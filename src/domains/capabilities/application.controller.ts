import { Body, Controller, Get, Headers, Param, ParseIntPipe, Patch, Post, Query, UnauthorizedException } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { CommonStatus } from '@prisma/client';

@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Post()
  create(
    @Body() dto: CreateApplicationDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) throw new UnauthorizedException('User ID required');
    return this.applicationService.create(+userId, dto);
  }

  @Get()
  findAll(
    @Headers('x-admin') adminHeader: string,
    @Query('status') status?: CommonStatus,
  ) {
    if (adminHeader !== 'true') throw new UnauthorizedException('Admin access required');
    return this.applicationService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.applicationService.findOne(id);
  }

  @Patch(':id/review')
  review(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewApplicationDto,
    @Headers('x-admin') adminHeader: string,
    @Headers('x-user-id') reviewerId: string,
  ) {
    if (adminHeader !== 'true') throw new UnauthorizedException('Admin access required');
    return this.applicationService.review(id, +reviewerId || 0, dto);
  }
}