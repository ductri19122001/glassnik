import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CursorPaginationDto {
  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;

  constructor(data: T[], nextCursor: string | null, hasMore: boolean) {
    this.data = data;
    this.nextCursor = nextCursor;
    this.hasMore = hasMore;
  }
}
