import { IsInt, IsNotEmpty } from 'class-validator';

export class AssignCapabilityDto {
  @IsNotEmpty()
  @IsInt()
  capabilityId: number;
}