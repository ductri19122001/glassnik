import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GcpModule } from './gcp.module';
import { UserModule } from './domains/user/user.module';
import { CapabilitiesModule } from './domains/capabilities/capabilities.module';

@Module({
  imports: [PrismaModule, GcpModule, UserModule, CapabilitiesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
