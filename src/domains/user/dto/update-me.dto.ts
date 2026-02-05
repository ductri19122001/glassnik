import { IsOptional, IsString, IsUrl, Length } from 'class-validator';

export class UpdateMeDto {
  @IsOptional()
  @IsString()
  @Length(1, 150)
  displayName?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;
}
