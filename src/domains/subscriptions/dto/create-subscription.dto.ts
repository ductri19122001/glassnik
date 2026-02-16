import { IsString, Length } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  @Length(1, 100)
  planCode!: string;
}
