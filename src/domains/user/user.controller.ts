import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateMeDto } from './dto/update-me.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  @Get('me')
  getMe(@Headers('x-user-id') userIdHeader?: string) {
    const userId = this.parseUserId(userIdHeader);
    return this.userService.getMe(userId);
  }

  @Patch('me')
  updateMe(@Headers('x-user-id') userIdHeader: string | undefined, @Body() dto: UpdateMeDto) {
    const userId = this.parseUserId(userIdHeader);
    return this.userService.updateMe(userId, dto);
  }

  @Get(':id')
  getPublicProfile(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getPublicProfile(id);
  }

  @Get(':userId/capabilities')
  getUserCapabilities(@Param('userId', ParseIntPipe) userId: number) {
    return this.userService.listUserCapabilities(userId);
  }

  private parseUserId(userIdHeader?: string) {
    if (!userIdHeader) {
      throw new BadRequestException('Missing x-user-id header');
    }

    const userId = Number(userIdHeader);
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new BadRequestException('Invalid x-user-id header');
    }

    return userId;
  }
}
