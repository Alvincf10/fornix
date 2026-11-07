import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  DocumentationParentType,
  DocumentationStatus,
} from '../documentation.enums.js';

export class CreateDocumentationDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({ description: 'Tiptap JSON document' })
  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

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

  @ApiPropertyOptional({ enum: DocumentationStatus })
  @IsOptional()
  @IsEnum(DocumentationStatus)
  status?: DocumentationStatus;
}
