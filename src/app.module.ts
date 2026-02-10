import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GcpModule } from './gcp.module';
import { UsersModule } from './domains/capabilities/users.module';
import { CapabilitiesModule } from './domains/capabilities/capabilities.module';

@Module({
  imports: [PrismaModule, GcpModule, UsersModule, CapabilitiesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
