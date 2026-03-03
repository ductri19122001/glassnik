import { Controller, Get, Post, Param, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { SmartGlassesService } from './smart-glasses.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('glasses')
@UseGuards(JwtAuthGuard) // Protect all endpoints
export class SmartGlassesController {
  constructor(private readonly service: SmartGlassesService) {}

  @Get('experiences/:id')
  getExperience(@Req() req, @Param('id') id: string) {
    return this.service.getExperience(req.user.id, id);
  }

  @Post('footage')
  uploadFootage(@Req() req, @Body() body: { filename: string; content: string }) {
    if (!body.filename || !body.content) {
      throw new BadRequestException('Filename and content are required');
    }
    // In a real scenario, 'content' would be a file buffer from Multer
    return this.service.uploadFootage(req.user.id, body.filename, body.content);
  }
}