import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCapabilityApplicationDto } from './dto/create-capability-application.dto';
import { ReviewCapabilityApplicationDto } from './dto/review-capability-application.dto';
import { CommonStatus } from '@prisma/client';

@Injectable()
export class CapabilityApplicationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateCapabilityApplicationDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Verify capability code exists (maps to Capability name)
    const capability = await this.prisma.capability.findUnique({
      where: { name: dto.capabilityCode },
    });
    if (!capability) throw new NotFoundException(`Capability '${dto.capabilityCode}' not found`);

    return this.prisma.capabilityApplication.create({
      data: {
        userId,
        capabilityCode: dto.capabilityCode,
        notes: dto.notes,
        status: CommonStatus.PENDING,
      },
    });
  }

  async findAll(status?: CommonStatus) {
    return this.prisma.capabilityApplication.findMany({
      where: status ? { status } : undefined,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            username: true,
          },
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
          select: {
            id: true,
            email: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async review(id: number, reviewerId: number, dto: ReviewCapabilityApplicationDto) {
    return this.prisma.$transaction(async (tx) => {
      const application = await tx.capabilityApplication.findUnique({ where: { id } });
      if (!application) throw new NotFoundException('Application not found');

      if (application.status !== CommonStatus.PENDING) {
        throw new BadRequestException('Application is already processed');
      }

      const updatedApplication = await tx.capabilityApplication.update({
        where: { id },
        data: {
          status: dto.status,
          reviewerId,
          notes: dto.notes ?? application.notes,
          reviewedAt: new Date(),
        },
      });

      if (dto.status === CommonStatus.APPROVED) {
        const capability = await tx.capability.findUnique({
          where: { name: application.capabilityCode },
        });

        if (!capability) {
          throw new NotFoundException(`Capability '${application.capabilityCode}' not found`);
        }

        await tx.userCapability.upsert({
          where: {
            userId_capabilityId: {
              userId: application.userId,
              capabilityId: capability.id,
            },
          },
          create: {
            userId: application.userId,
            capabilityId: capability.id,
            status: CommonStatus.ACTIVE,
            grantedAt: new Date(),
          },
          update: {
            status: CommonStatus.ACTIVE,
            grantedAt: new Date(),
          },
        });
      }

      return updatedApplication;
    });
  }
}