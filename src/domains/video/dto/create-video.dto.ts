import { Transform, Type } from 'class-transformer';
import { ArrayUnique, IsArray, IsBoolean, IsInt, IsNumber, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateVideoDto {
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Transform(({ value }) => normalizeNumberArray(value))
  @Type(() => Number)
  @IsInt({ each: true })
  categoryIds?: number[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  activityId?: number;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @Transform(({ value }) => normalizeNumberArray(value))
  @Type(() => Number)
  @IsInt({ each: true })
  activityIds?: number[];

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  placeId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsString()
  @Length(1, 255)
  locationName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 150)
  authorDisplayName?: string;

  @IsOptional()
  @IsBoolean()
  eligibleForStitch?: boolean;
}

function normalizeNumberArray(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => Number(item)).filter((item) => Number.isFinite(item));
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map((item) => Number(item)).filter((item) => Number.isFinite(item));
        }
      } catch {
        // fall through to CSV/number handling
      }
    }
    if (value.includes(',')) {
      return value
        .split(',')
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isFinite(item));
    }
    const asNumber = Number(value);
    return Number.isFinite(asNumber) ? [asNumber] : [];
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return [value];
  }
  return [];
}
