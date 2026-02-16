import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateVideoDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  eligibleForStitch?: boolean;
}
