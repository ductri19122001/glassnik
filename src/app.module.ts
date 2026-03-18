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
import { SmartGlassesModule } from './domains/smart-glasses/smart-glasses.module';
import { ModerationModule } from './domains/moderation/moderation.module';

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
    SmartGlassesModule,
    ModerationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
