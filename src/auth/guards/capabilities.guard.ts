import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '@/prisma/prisma.service';

export const REQUIRED_CAPABILITIES_KEY = 'requiredCapabilities';
export const RequireCapabilities = (...capabilities: string[]) =>
  SetMetadata(REQUIRED_CAPABILITIES_KEY, capabilities);

@Injectable()
export class CapabilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredCapabilities = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_CAPABILITIES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredCapabilities || requiredCapabilities.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    const userCapabilities = await this.prisma.userCapability.findMany({
      where: {
        userId: user.id,
        status: 'ACTIVE',
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: { capability: true },
    });

    const userCapabilityNames = userCapabilities.map(
      (uc) => uc.capability.name,
    );

    const hasAll = requiredCapabilities.every((cap) =>
      userCapabilityNames.includes(cap),
    );

    if (!hasAll) {
      throw new ForbiddenException(
        `Missing required capabilities: ${requiredCapabilities.filter((c) => !userCapabilityNames.includes(c)).join(', ')}`,
      );
    }

    return true;
  }
}
