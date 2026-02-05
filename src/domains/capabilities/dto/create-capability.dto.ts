import { CapabilityBadgeType } from '@prisma/client';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class CreateCapabilityDto {
  @IsString()
  @Length(1, 100)
  name!: string;

  @IsOptional()
  @IsUrl()
  iconUrl?: string;

  @IsEnum(CapabilityBadgeType)
  badgeType!: CapabilityBadgeType;

  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  minMonths?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
