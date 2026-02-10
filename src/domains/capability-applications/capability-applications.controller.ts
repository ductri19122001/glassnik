import { Controller, Get, Post, Body, Patch, Param, Query, Headers, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { CapabilityApplicationsService } from './capability-applications.service';
import { CreateCapabilityApplicationDto } from './dto/create-capability-application.dto';
import { ReviewCapabilityApplicationDto } from './dto/review-capability-application.dto';
import { CommonStatus } from '@prisma/client';

@Controller('applications')
export class CapabilityApplicationsController {
  constructor(private readonly applicationsService: CapabilityApplicationsService) {}

  @Post()
  create(
    @Headers('x-user-id') userId: string,
    @Body() createDto: CreateCapabilityApplicationDto,
  ) {
    if (!userId) throw new BadRequestException('x-user-id header is required');
    return this.applicationsService.create(+userId, createDto);
  }

  @Get()
  findAll(@Query('status') status?: CommonStatus) {
    return this.applicationsService.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.applicationsService.findOne(id);
  }

  @Patch(':id/review')
  review(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-user-id') reviewerId: string,
    @Body() reviewDto: ReviewCapabilityApplicationDto,
  ) {
    if (!reviewerId) throw new BadRequestException('x-user-id header is required for reviewer');
    return this.applicationsService.review(id, +reviewerId, reviewDto);
  }
}