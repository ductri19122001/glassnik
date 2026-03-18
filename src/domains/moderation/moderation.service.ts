import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ModerationActionType,
  ModerationStatus,
  ReportReason,
  ReportStatus,
  QueueStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ModerationQueueQueryDto } from './dto/moderation-queue-query.dto';
import { AssignQueueDto } from './dto/assign-queue.dto';
import { CreateModerationActionDto } from './dto/create-moderation-action.dto';

@Injectable()
export class ModerationService {
  constructor(private readonly prisma: PrismaService) {}

  async createReport(reporterId: number, dto: CreateReportDto) {
    const video = await this.prisma.videoAsset.findUnique({
      where: { id: dto.videoId },
      select: { id: true, moderationStatus: true },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const report = await this.prisma.moderationReport.create({
      data: {
        videoId: dto.videoId,
        reporterId,
        reason: dto.reason,
        details: dto.details,
        status: ReportStatus.OPEN,
      },
    });

    const existingQueue = await this.prisma.moderationQueueItem.findFirst({
      where: {
        videoId: dto.videoId,
        status: { in: [QueueStatus.PENDING, QueueStatus.ASSIGNED] },
      },
      select: { id: true },
    });

    if (!existingQueue) {
      await this.prisma.moderationQueueItem.create({
        data: {
          videoId: dto.videoId,
          status: QueueStatus.PENDING,
          priority: this.getPriorityForReason(dto.reason),
        },
      });
    }

    if (
      video.moderationStatus !== ModerationStatus.TAKEDOWN &&
      video.moderationStatus !== ModerationStatus.REJECTED
    ) {
      await this.prisma.videoAsset.update({
        where: { id: dto.videoId },
        data: {
          moderationStatus: ModerationStatus.NEEDS_REVIEW,
        },
      });
    }

    return report;
  }

  async listQueue(query: ModerationQueueQueryDto) {
    return this.prisma.moderationQueueItem.findMany({
      where: {
        status: query.status,
        assignedToId: query.assignedToId,
        ...(query.minPriority !== undefined
          ? { priority: { gte: query.minPriority } }
          : {}),
      },
      include: {
        video: {
          select: {
            id: true,
            title: true,
            moderationStatus: true,
            ownerId: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async assignQueueItem(queueItemId: number, moderatorId: number, dto: AssignQueueDto) {
    const queueItem = await this.prisma.moderationQueueItem.findUnique({
      where: { id: queueItemId },
      select: { id: true },
    });

    if (!queueItem) {
      throw new NotFoundException('Queue item not found');
    }

    const assigneeId = dto.assignedToId ?? moderatorId;

    return this.prisma.moderationQueueItem.update({
      where: { id: queueItemId },
      data: {
        status: QueueStatus.ASSIGNED,
        assignedToId: assigneeId,
        assignedAt: new Date(),
      },
    });
  }

  async takeAction(moderatorId: number, dto: CreateModerationActionDto) {
    const video = await this.prisma.videoAsset.findUnique({
      where: { id: dto.videoId },
      select: { id: true },
    });

    if (!video) {
      throw new NotFoundException('Video not found');
    }

    const moderationStatus = this.mapActionToStatus(dto.action);

    const action = await this.prisma.moderationAction.create({
      data: {
        videoId: dto.videoId,
        moderatorId,
        action: dto.action,
        reason: dto.reason,
        policyVersion: dto.policyVersion,
      },
    });

    await this.prisma.videoAsset.update({
      where: { id: dto.videoId },
      data: {
        moderationStatus,
        moderationReviewedAt: new Date(),
      },
    });

    if (dto.queueItemId) {
      await this.prisma.moderationQueueItem.update({
        where: { id: dto.queueItemId },
        data: {
          status: QueueStatus.DONE,
          completedAt: new Date(),
        },
      });
    }

    return action;
  }

  private getPriorityForReason(reason: ReportReason) {
    switch (reason) {
      case ReportReason.SELF_HARM:
      case ReportReason.VIOLENCE:
      case ReportReason.HATE:
      case ReportReason.NUDITY:
        return 90;
      case ReportReason.COPYRIGHT:
      case ReportReason.HARASSMENT:
        return 70;
      default:
        return 50;
    }
  }

  private mapActionToStatus(action: ModerationActionType) {
    switch (action) {
      case ModerationActionType.APPROVE:
      case ModerationActionType.AGE_RESTRICT:
      case ModerationActionType.SHADOW_BAN:
        return ModerationStatus.APPROVED;
      case ModerationActionType.REJECT:
        return ModerationStatus.REJECTED;
      case ModerationActionType.REMOVE:
        return ModerationStatus.TAKEDOWN;
      default:
        throw new BadRequestException('Unsupported moderation action');
    }
  }
}
