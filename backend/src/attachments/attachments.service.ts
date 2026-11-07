import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PaginatedResult,
  paginate,
} from '../common/dto/pagination-query.dto.js';
import { AttachmentParentType } from './attachment.enums.js';
import { ListAttachmentDto } from './dto/list-attachment.dto.js';
import { validateUploadFile } from './file-validation.js';
import { Attachment, AttachmentDocument } from './schemas/attachment.schema.js';
import { StorageService } from './storage.service.js';

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectModel(Attachment.name)
    private readonly attachmentModel: Model<AttachmentDocument>,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  async upload(
    ownerId: string,
    parentType: AttachmentParentType,
    parentId: string,
    file?: Express.Multer.File,
  ): Promise<AttachmentDocument> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const maxSize = this.configService.getOrThrow<number>('storage.maxUploadSize');
    const validation = validateUploadFile({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      maxSize,
    });
    if (!validation.ok) {
      throw new BadRequestException(validation.reason);
    }

    const mimeType = validation.mimeType;
    const storageKey = this.storageService.buildKey(ownerId, file.originalname);
    await this.storageService.upload(storageKey, file.buffer, mimeType);

    return this.attachmentModel.create({
      originalName: file.originalname,
      mimeType,
      size: file.size,
      storageKey,
      parentType,
      parentId: new Types.ObjectId(parentId),
      ownerId: new Types.ObjectId(ownerId),
    });
  }

  async findAll(
    ownerId: string,
    query: ListAttachmentDto,
  ): Promise<PaginatedResult<AttachmentDocument>> {
    const { page, limit, skip } = paginate(query.page, query.limit);
    const filter: Record<string, unknown> = {
      ownerId: new Types.ObjectId(ownerId),
    };
    if (query.parentType) filter.parentType = query.parentType;
    if (query.parentId) filter.parentId = new Types.ObjectId(query.parentId);

    const [items, total] = await Promise.all([
      this.attachmentModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.attachmentModel.countDocuments(filter).exec(),
    ]);

    return { items, total, page, limit };
  }

  async findOne(ownerId: string, id: string): Promise<AttachmentDocument> {
    const item = await this.attachmentModel
      .findOne({ _id: id, ownerId: new Types.ObjectId(ownerId) })
      .exec();
    if (!item) {
      throw new NotFoundException('Attachment not found');
    }
    return item;
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const item = await this.findOne(ownerId, id);
    await this.storageService.delete(item.storageKey);
    await this.attachmentModel.deleteOne({ _id: item._id }).exec();
  }

  async openStream(ownerId: string, id: string) {
    const item = await this.findOne(ownerId, id);
    const object = await this.storageService.getObject(item.storageKey);
    return { item, ...object };
  }
}
