import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import {
  DocumentationParentType,
  DocumentationStatus,
} from '../documentation.enums.js';

export class ListDocumentationDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: DocumentationStatus })
  @IsOptional()
  @IsEnum(DocumentationStatus)
  status?: DocumentationStatus;

  @ApiPropertyOptional({ enum: DocumentationParentType })
  @IsOptional()
  @IsEnum(DocumentationParentType)
  parentType?: DocumentationParentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  checkpointId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  archived?: string;
}
