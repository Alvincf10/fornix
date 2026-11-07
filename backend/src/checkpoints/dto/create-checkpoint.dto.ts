import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  CheckpointCreateMode,
  CheckpointOutcome,
  CheckpointParentType,
  CheckpointStatus,
} from '../checkpoint.enums.js';

export class CreateCheckpointDto {
  @ApiPropertyOptional({ enum: CheckpointCreateMode, default: CheckpointCreateMode.Quick })
  @IsOptional()
  @IsEnum(CheckpointCreateMode)
  mode?: CheckpointCreateMode;

  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  title: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  description?: string;

  @ApiProperty({ enum: CheckpointParentType })
  @IsEnum(CheckpointParentType)
  parentType: CheckpointParentType;

  @ApiProperty()
  @IsMongoId()
  parentId: string;

  @ApiPropertyOptional({ enum: CheckpointStatus })
  @IsOptional()
  @IsEnum(CheckpointStatus)
  status?: CheckpointStatus;

  @ApiPropertyOptional({ enum: CheckpointOutcome })
  @IsOptional()
  @IsEnum(CheckpointOutcome)
  outcome?: CheckpointOutcome;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  objective?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  methodology?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  expectedResult?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tools?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  initialNotes?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 100 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weight?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  targetDate?: string;
}
