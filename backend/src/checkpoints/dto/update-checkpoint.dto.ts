import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCheckpointDto } from './create-checkpoint.dto.js';

export class UpdateCheckpointDto extends PartialType(
  OmitType(CreateCheckpointDto, ['parentType', 'parentId', 'mode'] as const),
) {}
