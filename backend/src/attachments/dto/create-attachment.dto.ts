import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsMongoId } from 'class-validator';
import { AttachmentParentType } from '../attachment.enums.js';

export class CreateAttachmentDto {
  @ApiProperty({ enum: AttachmentParentType })
  @IsEnum(AttachmentParentType)
  parentType: AttachmentParentType;

  @ApiProperty()
  @IsMongoId()
  parentId: string;
}
