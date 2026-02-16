import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateVideoDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsBoolean()
  eligibleForStitch?: boolean;
}
