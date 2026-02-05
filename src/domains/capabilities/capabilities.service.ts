import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateCapabilityDto } from './dto/create-capability.dto';

@Injectable()
export class CapabilitiesService {
  constructor(private prisma: PrismaService) {}

  listAll() {
    return this.prisma.capability.findMany({
      orderBy: { id: 'asc' },
    });
  }

  createCapability(dto: CreateCapabilityDto) {
    return this.prisma.capability.create({
      data: {
        name: dto.name,
        iconUrl: dto.iconUrl,
        badgeType: dto.badgeType,
        minAmount: dto.minAmount,
        minMonths: dto.minMonths,
        isActive: dto.isActive ?? true,
      },
    });
  }
}
