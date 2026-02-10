import { IsInt, IsNotEmpty, IsOptional, IsString, IsUrl, Min } from 'class-validator';

export class CreateCapabilityDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  badgeType: string;

  @IsInt()
  @Min(0)
  minAmount: number;

  @IsInt()
  @Min(0)
  minMonths: number;

  @IsOptional()
  @IsUrl()
  iconUrl?: string;
}