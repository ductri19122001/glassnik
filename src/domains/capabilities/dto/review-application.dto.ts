import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CommonStatus } from '@prisma/client';

export class ReviewApplicationDto {
  @IsNotEmpty()
  @IsEnum(CommonStatus)
  status: CommonStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}