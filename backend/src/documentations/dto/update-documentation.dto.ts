import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { CreateDocumentationDto } from './create-documentation.dto.js';

export class UpdateDocumentationDto extends PartialType(CreateDocumentationDto) {
  @ApiPropertyOptional({
    description: 'Client last-known updatedAt for conflict detection',
  })
  @IsOptional()
  @IsDateString()
  baseUpdatedAt?: string;
}
