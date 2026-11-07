import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { AttachmentParentType } from '../attachment.enums.js';

export class ListAttachmentDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: AttachmentParentType })
  @IsOptional()
  @IsEnum(AttachmentParentType)
  parentType?: AttachmentParentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  parentId?: string;
}
