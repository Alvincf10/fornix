import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import {
  CheckpointOutcome,
  CheckpointParentType,
  CheckpointStatus,
} from '../checkpoint.enums.js';

export type CheckpointDocument = HydratedDocument<Checkpoint>;

@Schema({ timestamps: true, collection: 'checkpoints' })
export class Checkpoint {
  @Prop({ required: true, trim: true })
  code: string;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ default: '', trim: true })
  description: string;

  @Prop({
    type: String,
    enum: Object.values(CheckpointParentType),
    required: true,
    index: true,
  })
  parentType: CheckpointParentType;

  @Prop({ type: Types.ObjectId, required: true, index: true })
  parentId: Types.ObjectId;

  @Prop({ default: '', trim: true })
  objective: string;

  @Prop({ default: '', trim: true })
  methodology: string;

  @Prop({ default: '', trim: true })
  expectedResult: string;

  @Prop({ type: [String], default: [] })
  tools: string[];

  @Prop({ default: '', trim: true })
  initialNotes: string;

  @Prop({
    type: String,
    enum: Object.values(CheckpointStatus),
    default: CheckpointStatus.Draft,
    index: true,
  })
  status: CheckpointStatus;

  @Prop({
    type: String,
    enum: Object.values(CheckpointOutcome),
    default: CheckpointOutcome.NotEvaluated,
  })
  outcome: CheckpointOutcome;

  @Prop({ default: 0, min: 0, max: 100 })
  progress: number;

  @Prop({ min: 0 })
  weight?: number;

  @Prop()
  startDate?: Date;

  @Prop()
  targetDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;
}

export const CheckpointSchema = SchemaFactory.createForClass(Checkpoint);
CheckpointSchema.index({ ownerId: 1, parentType: 1, parentId: 1 });
CheckpointSchema.index({ parentId: 1, code: 1 }, { unique: true });
