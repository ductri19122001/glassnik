import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CursorPaginationDto, PaginatedResponse } from '@/common/dto/cursor-pagination.dto';

@Injectable()
export class MobileService {
  constructor(private prisma: PrismaService) {}

  uploadVideo(userId: number) {
    return {
      userId,
      message: 'Mobile video upload initiated (capability: mobile.creator)',
      status: 'PENDING_UPLOAD',
    };
  }

  async getFeed(pagination: CursorPaginationDto) {
    const limit = pagination.limit || 20;
    const cursor = pagination.cursor ? parseInt(pagination.cursor) : undefined;

    const videos = await this.prisma.videoAsset.findMany({
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      where: { status: 'READY' },
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: { id: true, username: true, displayName: true, avatarUrl: true },
        },
      },
    });

    const hasMore = videos.length > limit;
    const data = hasMore ? videos.slice(0, limit) : videos;
    const nextCursor = hasMore ? String(data[data.length - 1].id) : null;

    return new PaginatedResponse(data, nextCursor, hasMore);
  }
}
