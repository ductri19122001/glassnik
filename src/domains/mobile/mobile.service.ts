import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GcpService } from '../../gcp.service';

@Injectable()
export class MobileService {
  constructor(
    private prisma: PrismaService,
    private gcpService: GcpService,
  ) {}

  // Helper to verify user has the required capability
  private async checkCapability(userId: number, capabilityName: string) {
    const userCap = await this.prisma.userCapability.findFirst({
      where: {
        userId,
        capability: { name: capabilityName },
        status: 'ACTIVE',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    if (!userCap) {
      throw new ForbiddenException(`Required capability not found: ${capabilityName}`);
    }
  }

  async uploadMobileVideo(userId: number, filename: string, content: string) {
    // 1. Enforce 'mobile.creator' capability
    await this.checkCapability(userId, 'mobile.creator');

    // 2. Upload to GCP
    const uniqueFilename = `mobile/${userId}/${Date.now()}-${filename}`;
    const publicUrl = await this.gcpService.uploadFile(uniqueFilename, content);

    // 3. Save metadata with source='MOBILE' to ensure feed consistency
    return this.prisma.videoAsset.create({
      data: {
        ownerId: userId,
        title: filename,
        description: 'Mobile Eye-POV Capture',
        source: 'MOBILE', // Critical for the "visual consistency" requirement
        gcsPath: uniqueFilename,
        publicUrl: publicUrl,
        status: 'READY', // Assuming direct upload success for this MVP
        mimeType: 'video/mp4',
      },
    });
  }

  async getFeed(page: number, limit: number) {
    const skip = (page - 1) * limit;

    // Fetch only MOBILE source videos to maintain the "continuous experience"
    // and "same eye level" perspective.
    return this.prisma.videoAsset.findMany({
      where: {
        source: 'MOBILE',
        status: 'READY',
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }
}
