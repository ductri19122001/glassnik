import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateApplicationDto {
  @IsNotEmpty()
  @IsString()
  capabilityCode: string;

  @IsOptional()
  @IsString()
  notes?: string;
}