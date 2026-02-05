import { Module } from '@nestjs/common';
import { GcpService } from './gcp.service';

@Module({
  providers: [GcpService],
  exports: [GcpService], // Export để các module khác dùng được
})
export class GcpModule {}