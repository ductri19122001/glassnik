import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GcpService } from '../../gcp.service';

@Injectable()
export class SmartGlassesService {
  constructor(
    private prisma: PrismaService,
    private gcpService: GcpService,
  ) {}

  // Helper function to verify capability
  private async checkCapability(userId: number, capabilityName: string) {
    const userCap = await this.prisma.userCapability.findFirst({
      where: {
        userId,
        capability: { name: capabilityName },
        status: 'ACTIVE',
        expiresAt: { gt: new Date() },
      },
    });

    if (!userCap) {
      throw new ForbiddenException(`Required capability not found: ${capabilityName}`);
    }
  }

  async getExperience(userId: number, experienceId: string) {
    // 1. Check permission
    await this.checkCapability(userId, 'glasses.subscriber');

    // 2. Return mock immersive data
    return {
      id: experienceId,
      type: 'IMMERSIVE_EXPERIENCE',
      title: 'Glassnik World 360 Live',
      streamUrl: `rtmp://stream.glassnik.com/live/immersive/${experienceId}`,
      overlayData: {
        widgets: ['chat', 'stats', 'gps'],
        layout: 'ar-mode-v1',
      },
    };
  }

  async uploadFootage(userId: number, filename: string, content: string) {
    // 1. Check permission
    await this.checkCapability(userId, 'immersive.contributor');

    // 2. Upload to GCP
    const uniqueFilename = `glasses/${userId}/${Date.now()}-${filename}`;
    const publicUrl = await this.gcpService.uploadFile(uniqueFilename, content);

    // 3. Save metadata to DB
    return this.prisma.videoAsset.create({
      data: {
        ownerId: userId,
        title: filename,
        description: 'Uploaded via Smart Glasses',
        source: 'SMART_GLASSES',
        gcsPath: uniqueFilename,
        publicUrl: publicUrl,
        status: 'PROCESSING',
        mimeType: 'video/mp4',
      },
    });
  }
}