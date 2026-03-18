import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Length } from 'class-validator';
import { ReportReason } from '@prisma/client';

export class CreateReportDto {
  @Type(() => Number)
  @IsInt()
  videoId: number;

  @IsEnum(ReportReason)
  reason: ReportReason;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  details?: string;
}
