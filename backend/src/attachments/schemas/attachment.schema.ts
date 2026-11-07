import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AttachmentParentType } from '../attachment.enums.js';

export type AttachmentDocument = HydratedDocument<Attachment>;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'attachments' })
export class Attachment {
  @Prop({ required: true, trim: true })
  originalName: string;

  @Prop({ required: true })
  mimeType: string;

  @Prop({ required: true, min: 0 })
  size: number;

  @Prop({ required: true })
  storageKey: string;

  @Prop({
    type: String,
    enum: Object.values(AttachmentParentType),
    required: true,
    index: true,
  })
  parentType: AttachmentParentType;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  parentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;
}

export const AttachmentSchema = SchemaFactory.createForClass(Attachment);
AttachmentSchema.index({ ownerId: 1, parentType: 1, parentId: 1 });
