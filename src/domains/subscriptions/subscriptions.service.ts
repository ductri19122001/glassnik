import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, planCode: string) {
    // Check if the user already has an active subscription
    const activeSub = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        currentPeriodEnd: { gt: new Date() },
      },
    });

    if (activeSub) {
      throw new BadRequestException('User already has an active subscription.');
    }

    // Mock logic: Create a 1-month active subscription
    const startDate = new Date();
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

    // Transaction: Create Subscription AND Grant Capability
    return this.prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.create({
      data: {
        userId,
        planCode,
        status: 'ACTIVE',
        startedAt: startDate,
        currentPeriodEnd: currentPeriodEnd,
      },
    });

      // Rule: Grant 'live.subscriber' if plan is PREMIUM
      if (planCode.startsWith('PREMIUM')) {
        const cap = await tx.capability.findUnique({ where: { name: 'live.subscriber' } });
        if (cap) {
          await tx.userCapability.upsert({
            where: { userId_capabilityId: { userId, capabilityId: cap.id } },
            create: {
              userId,
              capabilityId: cap.id,
              status: 'ACTIVE',
              expiresAt: currentPeriodEnd,
            },
            update: {
              status: 'ACTIVE',
              expiresAt: currentPeriodEnd,
            },
          });
        }
      }

      return sub;
    });
  }

  async findCurrent(userId: number) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        currentPeriodEnd: { gt: new Date() },
      },
      orderBy: { startedAt: 'desc' },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    return subscription;
  }

  async cancel(userId: number) {
    const activeSub = await this.findCurrent(userId);

    return this.prisma.subscription.update({
      where: { id: activeSub.id },
      data: {
        status: 'CANCELED',
        endedAt: new Date(),
      },
    });
  }
}