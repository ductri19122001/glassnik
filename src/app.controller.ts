import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { GcpService } from './gcp.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly gcpService: GcpService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-upload')
  async testUpload() {
    const fileName = `api-upload-${Date.now()}.txt`;
    const url = await this.gcpService.uploadFile(fileName, 'This file was uploaded via NestJS API!');
    return { message: 'Upload success', url };
  }
}
