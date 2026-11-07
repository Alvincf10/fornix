import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';
import {
  DocumentationParentType,
  DocumentationStatus,
} from '../documentation.enums.js';

export type DocumentationDocument = HydratedDocument<Documentation>;

@Schema({ timestamps: true, collection: 'documentations' })
export class Documentation {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ type: SchemaTypes.Mixed, default: () => ({ type: 'doc', content: [] }) })
  content: Record<string, unknown>;

  @Prop({ default: '', trim: true, index: true })
  searchText: string;

  @Prop({ default: '', trim: true })
  category: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({
    type: String,
    enum: Object.values(DocumentationParentType),
    default: DocumentationParentType.None,
    index: true,
  })
  parentType: DocumentationParentType;

  @Prop({ type: Types.ObjectId })
  parentId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Checkpoint' })
  checkpointId?: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(DocumentationStatus),
    default: DocumentationStatus.Draft,
    index: true,
  })
  status: DocumentationStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId: Types.ObjectId;
}

export const DocumentationSchema = SchemaFactory.createForClass(Documentation);
DocumentationSchema.index({ ownerId: 1, status: 1 });
DocumentationSchema.index({ ownerId: 1, parentType: 1, parentId: 1 });
DocumentationSchema.index({ ownerId: 1, title: 1 });
DocumentationSchema.index({ ownerId: 1, searchText: 1 });
