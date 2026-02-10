import { Injectable, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCapabilityDto } from './dto/create-capability.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CapabilityService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCapabilityDto) {
    try {
      console.log('Creating capability:', dto);
      return await this.prisma.capability.create({
        data: {
          name: dto.name,
          badgeType: dto.badgeType as any,
          minAmount: dto.minAmount,
          minMonths: dto.minMonths,
          iconUrl: dto.iconUrl || 'https://placehold.co/64',
          isActive: true,
        },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException(`Capability with name '${dto.name}' already exists`);
      }
      // Bắt lỗi sai kiểu dữ liệu hoặc sai Enum (ví dụ badgeType không khớp)
      if (error instanceof Prisma.PrismaClientValidationError) {
        throw new BadRequestException(`Validation Error: ${error.message}`);
      }
      console.error('Error creating capability:', error);
      throw new InternalServerErrorException(`Could not create capability: ${(error as any).message}`);
    }
  }

  findAll() {
    return this.prisma.capability.findMany({
      where: { isActive: true },
    });
  }
}