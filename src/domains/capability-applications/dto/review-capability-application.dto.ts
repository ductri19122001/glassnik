import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CommonStatus } from '@prisma/client';

export class ReviewCapabilityApplicationDto {
  @IsNotEmpty()
  @IsEnum(CommonStatus)
  status: CommonStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}