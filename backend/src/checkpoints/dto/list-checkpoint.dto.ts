import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import {
  CheckpointParentType,
  CheckpointStatus,
} from '../checkpoint.enums.js';

export class ListCheckpointDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: CheckpointParentType })
  @IsOptional()
  @IsEnum(CheckpointParentType)
  parentType?: CheckpointParentType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  parentId?: string;

  @ApiPropertyOptional({ enum: CheckpointStatus })
  @IsOptional()
  @IsEnum(CheckpointStatus)
  status?: CheckpointStatus;
}
