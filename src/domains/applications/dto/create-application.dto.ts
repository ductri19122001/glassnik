import { IsOptional, IsString, Length } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @Length(1, 100)
  capabilityCode!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
