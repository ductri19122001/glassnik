import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ReviewAction {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class ReviewApplicationDto {
  @IsEnum(ReviewAction)
  action!: ReviewAction;

  @IsOptional()
  @IsString()
  notes?: string;
}
