import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CheckpointsService } from '../checkpoints/checkpoints.service.js';
import { CreateProgressEntryDto } from './dto/create-progress-entry.dto.js';
import { UpdateProgressEntryDto } from './dto/update-progress-entry.dto.js';
import { ProgressEntryType } from './entry.enums.js';
import {
  ProgressEntry,
  ProgressEntryDocument,
} from './schemas/progress-entry.schema.js';

@Injectable()
export class ProgressEntriesService {
  constructor(
    @InjectModel(ProgressEntry.name)
    private readonly entryModel: Model<ProgressEntryDocument>,
    private readonly checkpointsService: CheckpointsService,
  ) {}

  async create(
    ownerId: string,
    checkpointId: string,
    dto: CreateProgressEntryDto,
  ): Promise<ProgressEntryDocument> {
    await this.checkpointsService.findOne(ownerId, checkpointId);

    return this.entryModel.create({
      checkpointId: new Types.ObjectId(checkpointId),
      title: dto.title.trim(),
      content: dto.content?.trim() ?? '',
      entryType: dto.entryType ?? ProgressEntryType.Note,
      occurredAt: dto.occurredAt ? new Date(dto.occurredAt) : new Date(),
      tools: dto.tools ?? [],
      attachmentIds: [],
      ownerId: new Types.ObjectId(ownerId),
    });
  }

  async listForCheckpoint(ownerId: string, checkpointId: string) {
    await this.checkpointsService.findOne(ownerId, checkpointId);

    return this.entryModel
      .find({
        checkpointId: new Types.ObjectId(checkpointId),
        ownerId: new Types.ObjectId(ownerId),
      })
      .sort({ occurredAt: -1, createdAt: -1 })
      .exec();
  }

  async findOne(ownerId: string, id: string): Promise<ProgressEntryDocument> {
    const item = await this.entryModel
      .findOne({ _id: id, ownerId: new Types.ObjectId(ownerId) })
      .exec();
    if (!item) {
      throw new NotFoundException('Progress entry not found');
    }
    return item;
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateProgressEntryDto,
  ): Promise<ProgressEntryDocument> {
    const item = await this.findOne(ownerId, id);

    if (dto.title !== undefined) item.title = dto.title.trim();
    if (dto.content !== undefined) item.content = dto.content.trim();
    if (dto.entryType !== undefined) item.entryType = dto.entryType;
    if (dto.occurredAt !== undefined) item.occurredAt = new Date(dto.occurredAt);
    if (dto.tools !== undefined) item.tools = dto.tools;

    return item.save();
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const result = await this.entryModel
      .deleteOne({ _id: id, ownerId: new Types.ObjectId(ownerId) })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Progress entry not found');
    }
  }
}
