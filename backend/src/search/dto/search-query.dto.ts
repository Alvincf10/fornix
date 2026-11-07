import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

export enum SearchType {
  All = 'all',
  Research = 'research',
  Projects = 'projects',
  Checkpoints = 'checkpoints',
  Entries = 'entries',
  Documentation = 'documentation',
}

export class SearchQueryDto {
  @ApiProperty({ minLength: 1 })
  @IsString()
  @MinLength(1)
  q: string;

  @ApiPropertyOptional({ enum: SearchType, default: SearchType.All })
  @IsOptional()
  @IsEnum(SearchType)
  type?: SearchType = SearchType.All;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
