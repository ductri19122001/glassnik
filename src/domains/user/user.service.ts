import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  createUser(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        displayName: dto.displayName,
        avatarUrl: dto.avatarUrl,
      },
    });
  }

  getMe(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  updateMe(userId: number, dto: UpdateMeDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName,
        avatarUrl: dto.avatarUrl,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  getPublicProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        status: true,
      },
    });
  }

  listUserCapabilities(userId: number) {
    return this.prisma.userCapability.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        grantedDatetimeby: true,
        grantedAt: true,
        expiresAt: true,
        capability: {
          select: {
            id: true,
            name: true,
            iconUrl: true,
            badgeType: true,
            minAmount: true,
            minMonths: true,
            isActive: true,
          },
        },
      },
    });
  }
}
