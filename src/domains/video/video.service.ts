import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Storage } from '@google-cloud/storage';

@Injectable()
export class VideoService {
  private storage = new Storage({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });
  private bucketName = process.env.GCP_BUCKET_NAME || 'glassnik-videos';

  constructor(private prisma: PrismaService) {}

  // Helper to handle BigInt serialization
  private serializeVideo(video: any) {
    return {
      ...video,
      sizeBytes: video.sizeBytes ? video.sizeBytes.toString() : null,
    };
  }

  async create(userId: number, data: { title: string; description?: string }) {
    // 1. Generate a unique path for the video file
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.mp4`;
    const gcsPath = `videos/${userId}/${fileName}`;

    // Generate Signed URL for uploading
    const [uploadUrl] = await this.storage
      .bucket(this.bucketName)
      .file(gcsPath)
      .getSignedUrl({
        version: 'v4',
        action: 'write',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      });

    // 2. Create the database record in PENDING_UPLOAD state
    const video = await this.prisma.videoAsset.create({
      data: {
        ownerId: userId,
        title: data.title,
        description: data.description,
        status: 'PENDING_UPLOAD',
        gcsPath: gcsPath,
      },
    });

    return {
      ...this.serializeVideo(video),
      uploadUrl,
      info: 'Use the uploadUrl to PUT your file directly to GCP.',
    };
  }

  async uploadDirect(userId: number, file: any, data: { title: string; description?: string }) {
    const fileName = `${Date.now()}_${file.originalname.replace(/\s/g, '_')}`;
    const gcsPath = `videos/${userId}/${fileName}`;

    // Upload file buffer to GCS
    await this.storage.bucket(this.bucketName).file(gcsPath).save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
    });

    const video = await this.prisma.videoAsset.create({
      data: {
        ownerId: userId,
        title: data.title,
        description: data.description,
        status: 'READY', // Direct upload is immediately ready
        gcsPath: gcsPath,
        mimeType: file.mimetype,
        sizeBytes: BigInt(file.size),
      },
    });

    return this.serializeVideo(video);
  }

  async findAll(userId: number) {
    const videos = await this.prisma.videoAsset.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return videos.map((v) => this.serializeVideo(v));
  }

  async findOne(id: number) {
    const video = await this.prisma.videoAsset.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, displayName: true, avatarUrl: true },
        },
      },
    });
    if (!video) throw new NotFoundException(`Video with ID ${id} not found`);
    return this.serializeVideo(video);
  }

  async update(id: number, data: any) {
    await this.findOne(id); // Ensure exists

    const updated = await this.prisma.videoAsset.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        publicUrl: data.publicUrl,
        eligibleForStitch: data.eligibleForStitch,
      },
    });

    return this.serializeVideo(updated);
  }

  async remove(id: number, userId: number) {
    const video = await this.prisma.videoAsset.findUnique({
      where: { id },
    });

    if (!video) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }

    if (video.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this video.');
    }

    // Delete from GCS
    if (video.gcsPath) {
      try {
        await this.storage.bucket(this.bucketName).file(video.gcsPath).delete();
      } catch (error) {
        if (error.code !== 404) {
          console.error(`Failed to delete GCS file ${video.gcsPath}:`, error);
          throw new InternalServerErrorException('Failed to delete file from cloud storage');
        }
      }
    }

    await this.prisma.videoAsset.delete({ where: { id } });

    return { message: `Video with ID ${id} deleted successfully.` };
  }
}