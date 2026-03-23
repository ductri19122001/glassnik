import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';

export class AssignQueueDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  assignedToId?: number;
}
