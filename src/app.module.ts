import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GcpModule } from './gcp.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './domains/user/user.module';
import { CapabilitiesModule } from './domains/capabilities/capabilities.module';
import { ApplicationsModule } from './domains/applications/applications.module';
import { SubscriptionsModule } from './domains/subscriptions/subscriptions.module';
import { VideoModule } from './domains/video/video.module';
import { LiveModule } from './domains/live/live.module';
import { MobileModule } from './domains/mobile/mobile.module';

@Module({
  imports: [
    PrismaModule,
    GcpModule,
    AuthModule,
    UserModule,
    CapabilitiesModule,
    ApplicationsModule,
    SubscriptionsModule,
    VideoModule,
    LiveModule,
    MobileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
