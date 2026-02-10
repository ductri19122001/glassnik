import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCapabilityApplicationDto {
  @IsNotEmpty()
  @IsString()
  capabilityCode: string;

  @IsOptional()
  @IsString()
  notes?: string;
}