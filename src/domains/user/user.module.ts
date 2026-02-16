import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { MeCapabilitiesController } from './me-capabilities.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController, MeCapabilitiesController],
  providers: [UserService],
})
export class UserModule {}
