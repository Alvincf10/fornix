import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { ProgressEntryType } from '../entry.enums.js';

export type ProgressEntryDocument = HydratedDocument<ProgressEntry>;

@Schema({ timestamps: { createdAt: true, updatedAt: true }, collection: 'progress_entries' })
export class ProgressEntry {
  @Prop({ type: Types.ObjectId, ref: 'Checkpoint', required: true, index: true })
  checkpointId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '', trim: true })
  content: string;

  @Prop({
    type: String,
    enum: Object.values(ProgressEntryType),
    default: ProgressEntryType.Note,
  })
  entryType: ProgressEntryType;

  @Prop({ required: true, index: true })
  occurredAt: Date;

  @Prop({ type: [String], default: [] })
  tools: string[];

  @Prop({ type: [Types.ObjectId], default: [] })
  attachmentIds: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;
}

export const ProgressEntrySchema = SchemaFactory.createForClass(ProgressEntry);
ProgressEntrySchema.index({ checkpointId: 1, occurredAt: -1 });
