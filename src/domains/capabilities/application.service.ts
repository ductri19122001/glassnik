import { Injectable, NotFoundException, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ReviewApplicationDto } from './dto/review-application.dto';
import { CommonStatus, Prisma } from '@prisma/client';

@Injectable()
export class ApplicationService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateApplicationDto) {
    // Kiểm tra xem capability có tồn tại không (dựa trên code/name)
    const capability = await this.prisma.capability.findUnique({
      where: { name: dto.capabilityCode },
    });

    if (!capability) {
      throw new NotFoundException(`Capability with code '${dto.capabilityCode}' not found`);
    }

    try {
      return await this.prisma.capabilityApplication.create({
        data: {
          userId,
          capabilityCode: dto.capabilityCode,
          notes: dto.notes,
          status: CommonStatus.PENDING,
        },
      });
    } catch (error) {
      console.error('Error creating application:', error);
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('You have already applied for this capability');
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('User ID does not exist');
        }
      }
      throw new InternalServerErrorException('Could not create application');
    }
  }

  async findAll(status?: CommonStatus) {
    return this.prisma.capabilityApplication.findMany({
      where: status ? { status } : undefined,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const application = await this.prisma.capabilityApplication.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!application) {
      throw new NotFoundException('Application not found');
    }
    return application;
  }

  async review(id: number, reviewerId: number, dto: ReviewApplicationDto) {
    return this.prisma.$transaction(async (tx) => {
      const application = await tx.capabilityApplication.findUnique({
        where: { id },
      });

      if (!application) {
        throw new NotFoundException('Application not found');
      }

      const updatedApp = await tx.capabilityApplication.update({
        where: { id },
        data: {
          status: dto.status,
          reviewerId: reviewerId || undefined,
          reviewedAt: new Date(),
          notes: dto.notes || application.notes,
        },
      });

      // Nếu duyệt đơn (APPROVED), tự động tạo UserCapability
      if (dto.status === CommonStatus.APPROVED) {
        const capability = await tx.capability.findUnique({
          where: { name: application.capabilityCode },
        });

        if (capability) {
          await tx.userCapability.create({
            data: {
              userId: application.userId,
              capabilityId: capability.id,
              status: CommonStatus.ACTIVE,
              grantedAt: new Date(),
            },
          });
        }
      }

      return updatedApp;
    });
  }
}