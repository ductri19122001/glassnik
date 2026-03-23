import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ModerationService } from './moderation.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ModerationQueueQueryDto } from './dto/moderation-queue-query.dto';
import { AssignQueueDto } from './dto/assign-queue.dto';
import { CreateModerationActionDto } from './dto/create-moderation-action.dto';

@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Post('reports')
  @UseGuards(JwtAuthGuard)
  createReport(@Req() req, @Body() dto: CreateReportDto) {
    return this.moderationService.createReport(req.user.id, dto);
  }

  @Get('queue')
  @UseGuards(JwtAuthGuard)
  listQueue(
    @Headers('x-moderator') moderatorHeader: string | undefined,
    @Headers('x-admin') adminHeader: string | undefined,
    @Query() query: ModerationQueueQueryDto,
  ) {
    this.assertModerator(moderatorHeader, adminHeader);
    return this.moderationService.listQueue(query);
  }

  @Patch('queue/:id/assign')
  @UseGuards(JwtAuthGuard)
  assignQueueItem(
    @Headers('x-moderator') moderatorHeader: string | undefined,
    @Headers('x-admin') adminHeader: string | undefined,
    @Req() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignQueueDto,
  ) {
    this.assertModerator(moderatorHeader, adminHeader);
    return this.moderationService.assignQueueItem(id, req.user.id, dto);
  }

  @Post('actions')
  @UseGuards(JwtAuthGuard)
  takeAction(
    @Headers('x-moderator') moderatorHeader: string | undefined,
    @Headers('x-admin') adminHeader: string | undefined,
    @Req() req,
    @Body() dto: CreateModerationActionDto,
  ) {
    this.assertModerator(moderatorHeader, adminHeader);
    return this.moderationService.takeAction(req.user.id, dto);
  }

  private assertModerator(
    moderatorHeader: string | undefined,
    adminHeader: string | undefined,
  ) {
    const isModerator = moderatorHeader === 'true' || moderatorHeader === '1';
    const isAdmin = adminHeader === 'true' || adminHeader === '1';

    if (!isModerator && !isAdmin) {
      throw new ForbiddenException('Moderator access required');
    }
  }
}
