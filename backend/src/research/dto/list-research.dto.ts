import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { ResearchCategory, ResearchStatus } from '../research.enums.js';

export class ListResearchDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: ResearchStatus })
  @IsOptional()
  @IsEnum(ResearchStatus)
  status?: ResearchStatus;

  @ApiPropertyOptional({ enum: ResearchCategory })
  @IsOptional()
  @IsEnum(ResearchCategory)
  category?: ResearchCategory;

  @ApiPropertyOptional({
    description: 'When true, only archived items. Default excludes Archived.',
  })
  @IsOptional()
  archived?: string;
}
