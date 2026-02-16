import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  create(userId: number, dto: CreateApplicationDto) {
    return this.prisma.capabilityApplication.create({
      data: {
        userId,
        capabilityCode: dto.capabilityCode,
        notes: dto.notes,
      },
    });
  }

  findAll(status?: string) {
    return this.prisma.capabilityApplication.findMany({
      where: status ? { status: status as any } : undefined,
      include: {
        user: {
          select: { id: true, email: true, username: true, displayName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const application = await this.prisma.capabilityApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true, username: true, displayName: true },
        },
      },
    });

    if (!application) {
      throw new NotFoundException(`Application #${id} not found`);
    }

    return application;
  }

  async review(id: number, reviewerId: number, dto: ReviewApplicationDto) {
    const application = await this.prisma.capabilityApplication.findUnique({
      where: { id },
    });

    if (!application) {
      throw new NotFoundException(`Application #${id} not found`);
    }

    const updated = await this.prisma.capabilityApplication.update({
      where: { id },
      data: {
        status: dto.action,
        reviewerId,
        notes: dto.notes,
        reviewedAt: new Date(),
      },
    });

    // If approved, grant the capability to the user
    if (dto.action === 'APPROVED') {
      const capability = await this.prisma.capability.findFirst({
        where: { name: application.capabilityCode },
      });

      if (capability) {
        await this.prisma.userCapability.upsert({
          where: {
            userId_capabilityId: {
              userId: application.userId,
              capabilityId: capability.id,
            },
          },
          create: {
            userId: application.userId,
            capabilityId: capability.id,
            status: 'ACTIVE',
          },
          update: {
            status: 'ACTIVE',
          },
        });
      }
    }

    return updated;
  }
}
