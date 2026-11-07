import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  Priority,
  ResearchCategory,
  ResearchStatus,
} from '../research.enums.js';

export type ResearchDocument = HydratedDocument<Research>;

@Schema({ timestamps: true, collection: 'research' })
export class Research {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, trim: true })
  slug: string;

  @Prop({ default: '', trim: true })
  description: string;

  @Prop({ default: '', trim: true })
  objective: string;

  @Prop({
    type: String,
    enum: Object.values(ResearchCategory),
    default: ResearchCategory.Other,
  })
  category: ResearchCategory;

  @Prop({
    type: String,
    enum: Object.values(ResearchStatus),
    default: ResearchStatus.Idea,
    index: true,
  })
  status: ResearchStatus;

  @Prop({
    type: String,
    enum: Object.values(Priority),
    default: Priority.Medium,
  })
  priority: Priority;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  startDate?: Date;

  @Prop()
  targetDate?: Date;

  @Prop({ default: 0, min: 0, max: 100 })
  progress: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;
}

export const ResearchSchema = SchemaFactory.createForClass(Research);
ResearchSchema.index({ ownerId: 1, slug: 1 }, { unique: true });
ResearchSchema.index({ ownerId: 1, status: 1 });
ResearchSchema.index({ title: 'text', description: 'text', tags: 'text' });
