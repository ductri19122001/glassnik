import { Injectable, NotFoundException, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Storage } from '@google-cloud/storage';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { FeedVideosQueryDto } from './dto/feed-videos-query.dto';
import { ExploreVideosQueryDto } from './dto/explore-videos-query.dto';
import { TrendingVideosQueryDto } from './dto/trending-videos-query.dto';
import { NearbyVideosQueryDto } from './dto/nearby-videos-query.dto';
import { VideographerVideosQueryDto } from './dto/videographer-videos-query.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VideoService {
  private storage = new Storage({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  });
  private bucketName = process.env.GCP_BUCKET_NAME || 'glassnik-videos';

  constructor(private prisma: PrismaService) {}

  private videoInclude = {
    owner: {
      select: { id: true, displayName: true, username: true, avatarUrl: true },
    },
    categories: {
      include: {
        category: { select: { id: true, name: true, slug: true } },
      },
    },
    activities: {
      include: {
        activity: { select: { id: true, name: true } },
      },
    },
    place: { select: { id: true, name: true, city: true, country: true, latitude: true, longitude: true } },
    tags: {
      include: {
        tag: { select: { id: true, name: true, slug: true } },
      },
    },
  } satisfies Prisma.VideoAssetInclude;

  // Helper to handle BigInt serialization
  private serializeVideo(video: any) {
    const tags = Array.isArray(video.tags)
      ? video.tags
          .map((item: any) => item.tag)
          .filter(Boolean)
      : undefined;
    const categories = Array.isArray(video.categories)
      ? video.categories
          .map((item: any) => item.category)
          .filter(Boolean)
      : undefined;
    const activities = Array.isArray(video.activities)
      ? video.activities
          .map((item: any) => item.activity)
          .filter(Boolean)
      : undefined;

    return {
      ...video,
      sizeBytes: video.sizeBytes ? video.sizeBytes.toString() : null,
      attributionName: video.authorDisplayName ?? video.owner?.displayName ?? video.owner?.username ?? null,
      tags,
      categories,
      activities,
    };
  }

  private normalizeCategoryIds(data: CreateVideoDto | UpdateVideoDto) {
    if (Array.isArray(data.categoryIds) && data.categoryIds.length > 0) {
      return data.categoryIds;
    }
    if (typeof data.categoryId === 'number') {
      return [data.categoryId];
    }
    return [];
  }

  private normalizeActivityIds(data: CreateVideoDto | UpdateVideoDto) {
    if (Array.isArray(data.activityIds) && data.activityIds.length > 0) {
      return data.activityIds;
    }
    if (typeof data.activityId === 'number') {
      return [data.activityId];
    }
    return [];
  }

  private toVideoActivities(activityIds: number[]) {
    if (!activityIds.length) return undefined;
    return {
      create: activityIds.map((activityId) => ({
        activity: { connect: { id: activityId } },
      })),
    };
  }

  private toVideoCategories(categoryIds: number[]) {
    if (!categoryIds.length) return undefined;
    return {
      create: categoryIds.map((categoryId) => ({
        category: { connect: { id: categoryId } },
      })),
    };
  }

  private toVideoCreateData(userId: number, data: CreateVideoDto, status: string, gcsPath: string) {
    return {
      ownerId: userId,
      title: data.title,
      description: data.description,
      source: data.source,
      placeId: data.placeId,
      latitude: data.latitude,
      longitude: data.longitude,
      locationName: data.locationName,
      authorDisplayName: data.authorDisplayName,
      eligibleForStitch: data.eligibleForStitch,
      status,
      processingStatus: status === 'READY' ? 'READY' : 'UPLOADED',
      gcsPath,
    } satisfies Prisma.VideoAssetUncheckedCreateInput;
  }

  async create(userId: number, data: CreateVideoDto) {
    // 1. Generate a unique path for the video file
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.mp4`;
    const gcsPath = `videos/${userId}/${fileName}`;
    const categoryIds = this.normalizeCategoryIds(data);
    const activityIds = this.normalizeActivityIds(data);

    if (process.env.DEBUG_VIDEO_M2M === '1') {
      console.log('[video:create] raw body:', data);
      console.log('[video:create] categoryIds:', categoryIds, 'activityIds:', activityIds);
    }

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
        ...this.toVideoCreateData(userId, data, 'PENDING_UPLOAD', gcsPath),
        categories: this.toVideoCategories(categoryIds),
        activities: this.toVideoActivities(activityIds),
      },
      include: this.videoInclude,
    });

    return {
      ...this.serializeVideo(video),
      uploadUrl,
      info: 'Use the uploadUrl to PUT your file directly to GCP.',
    };
  }

  async uploadDirect(userId: number, file: any, data: CreateVideoDto) {
    const fileName = `${Date.now()}_${file.originalname.replace(/\s/g, '_')}`;
    const gcsPath = `videos/${userId}/${fileName}`;
    const categoryIds = this.normalizeCategoryIds(data);
    const activityIds = this.normalizeActivityIds(data);

    if (process.env.DEBUG_VIDEO_M2M === '1') {
      console.log('[video:uploadDirect] raw body:', data);
      console.log('[video:uploadDirect] categoryIds:', categoryIds, 'activityIds:', activityIds);
    }

    // Upload file buffer to GCS
    await this.storage.bucket(this.bucketName).file(gcsPath).save(file.buffer, {
      contentType: file.mimetype,
      resumable: false,
    });

    const video = await this.prisma.videoAsset.create({
      data: {
        ...this.toVideoCreateData(userId, data, 'READY', gcsPath),
        categories: this.toVideoCategories(categoryIds),
        activities: this.toVideoActivities(activityIds),
        mimeType: file.mimetype,
        sizeBytes: BigInt(file.size),
      },
      include: this.videoInclude,
    });

    return this.serializeVideo(video);
  }

  async findAll(userId: number) {
    const videos = await this.prisma.videoAsset.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
      include: this.videoInclude,
    });

    return videos.map((v) => this.serializeVideo(v));
  }

  async findOne(id: number) {
    const video = await this.prisma.videoAsset.findUnique({
      where: { id },
      include: this.videoInclude,
    });
    if (!video) throw new NotFoundException(`Video with ID ${id} not found`);
    return this.serializeVideo(video);
  }

  async update(id: number, userId: number, data: UpdateVideoDto) {
    const existing = await this.prisma.videoAsset.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Video with ID ${id} not found`);
    if (existing.ownerId !== userId) {
      throw new ForbiddenException('You do not have permission to update this video.');
    }
    const categoryIds = this.normalizeCategoryIds(data);
    const activityIds = this.normalizeActivityIds(data);

    const updated = await this.prisma.videoAsset.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        source: data.source,
        status: data.status,
        placeId: data.placeId,
        latitude: data.latitude,
        longitude: data.longitude,
        locationName: data.locationName,
        authorDisplayName: data.authorDisplayName,
        eligibleForStitch: data.eligibleForStitch,
        ...(categoryIds.length
          ? {
              categories: {
                deleteMany: {},
                create: categoryIds.map((categoryId) => ({
                  category: { connect: { id: categoryId } },
                })),
              },
            }
          : {}),
        ...(activityIds.length
          ? {
              activities: {
                deleteMany: {},
                create: activityIds.map((activityId) => ({
                  activity: { connect: { id: activityId } },
                })),
              },
            }
          : {}),
      },
      include: this.videoInclude,
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

  async getFeed(query: FeedVideosQueryDto) {
    const take = query.limit ?? 20;
    const where: Prisma.VideoAssetWhereInput = {
      status: 'READY',
      ...(query.categoryId
        ? {
            categories: {
              some: { categoryId: query.categoryId },
            },
          }
        : {}),
      ...(query.lastVideoId ? { id: { lt: query.lastVideoId } } : {}),
    };

    const videos = await this.prisma.videoAsset.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
      include: this.videoInclude,
    });

    return videos.map((video) => this.serializeVideo(video));
  }

  async explore(query: ExploreVideosQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.VideoAssetWhereInput = {
      status: 'READY',
      ...(query.categoryId
        ? {
            categories: {
              some: { categoryId: query.categoryId },
            },
          }
        : {}),
      ...(query.placeId ? { placeId: query.placeId } : {}),
      ...(query.city
        ? {
            place: {
              city: { contains: query.city, mode: 'insensitive' },
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.videoAsset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: this.videoInclude,
      }),
      this.prisma.videoAsset.count({ where }),
    ]);

    return {
      page,
      limit,
      total,
      items: items.map((video) => this.serializeVideo(video)),
    };
  }

  async trending(query: TrendingVideosQueryDto) {
    const take = query.limit ?? 20;
    const where: Prisma.VideoAssetWhereInput = {
      status: 'READY',
      ...(query.categoryId
        ? {
            categories: {
              some: { categoryId: query.categoryId },
            },
          }
        : {}),
    };

    const videos = await this.prisma.videoAsset.findMany({
      where,
      orderBy: [{ views: 'desc' }, { shares: 'desc' }, { likes: 'desc' }, { createdAt: 'desc' }],
      take,
      include: this.videoInclude,
    });

    return videos.map((video) => this.serializeVideo(video));
  }

  private haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRadians = (deg: number) => (deg * Math.PI) / 180;
    const earthRadiusKm = 6371;

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const radLat1 = toRadians(lat1);
    const radLat2 = toRadians(lat2);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
  }

  async nearby(query: NearbyVideosQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const radiusKm = query.radius ?? 10;

    const latDelta = radiusKm / 111.32;
    const lngDivisor = Math.cos((query.lat * Math.PI) / 180);
    const lngDelta = radiusKm / (111.32 * (Math.abs(lngDivisor) < 0.0001 ? 0.0001 : Math.abs(lngDivisor)));

    const candidates = await this.prisma.videoAsset.findMany({
      where: {
        status: 'READY',
        latitude: { not: null, gte: query.lat - latDelta, lte: query.lat + latDelta },
        longitude: { not: null, gte: query.lng - lngDelta, lte: query.lng + lngDelta },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: this.videoInclude,
    });

    const withinRadius = candidates
      .map((video) => {
        const lat = Number(video.latitude);
        const lng = Number(video.longitude);
        const distanceKm = this.haversineDistanceKm(query.lat, query.lng, lat, lng);
        return { video, distanceKm };
      })
      .filter((item) => item.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const start = (page - 1) * limit;
    const items = withinRadius.slice(start, start + limit);

    return {
      page,
      limit,
      total: withinRadius.length,
      items: items.map((item) => ({
        ...this.serializeVideo(item.video),
        distanceKm: Number(item.distanceKm.toFixed(3)),
      })),
    };
  }

  async getVideographerProfile(videographerId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: videographerId },
      select: {
        id: true,
        displayName: true,
        username: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException(`Videographer with ID ${videographerId} not found`);

    const totalVideos = await this.prisma.videoAsset.count({
      where: { ownerId: videographerId, status: 'READY' },
    });

    return {
      ...user,
      totalVideos,
    };
  }

  async getVideographerVideos(videographerId: number, query: VideographerVideosQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.videoAsset.findMany({
        where: { ownerId: videographerId, status: 'READY' },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: this.videoInclude,
      }),
      this.prisma.videoAsset.count({
        where: { ownerId: videographerId, status: 'READY' },
      }),
    ]);

    return {
      page,
      limit,
      total,
      items: items.map((video) => this.serializeVideo(video)),
    };
  }
}
