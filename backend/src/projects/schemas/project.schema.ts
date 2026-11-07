import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Priority, ProjectCategory, ProjectStatus } from '../project.enums.js';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({ timestamps: true, collection: 'projects' })
export class Project {
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
    enum: Object.values(ProjectCategory),
    default: ProjectCategory.Other,
  })
  category: ProjectCategory;

  @Prop({
    type: String,
    enum: Object.values(ProjectStatus),
    default: ProjectStatus.Planning,
    index: true,
  })
  status: ProjectStatus;

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

export const ProjectSchema = SchemaFactory.createForClass(Project);
ProjectSchema.index({ ownerId: 1, slug: 1 }, { unique: true });
ProjectSchema.index({ ownerId: 1, status: 1 });
ProjectSchema.index({ title: 'text', description: 'text', tags: 'text' });
