import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Length } from 'class-validator';
import { ModerationActionType } from '@prisma/client';

export class CreateModerationActionDto {
  @Type(() => Number)
  @IsInt()
  videoId: number;

  @IsEnum(ModerationActionType)
  action: ModerationActionType;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  reason?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  policyVersion?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  queueItemId?: number;
}
