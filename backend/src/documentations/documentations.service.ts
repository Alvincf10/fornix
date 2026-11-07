import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PaginatedResult,
  paginate,
} from '../common/dto/pagination-query.dto.js';
import { extractTiptapText } from '../common/utils/tiptap-text.js';
import {
  DocumentationParentType,
  DocumentationStatus,
} from './documentation.enums.js';
import { CreateDocumentationDto } from './dto/create-documentation.dto.js';
import { ListDocumentationDto } from './dto/list-documentation.dto.js';
import { UpdateDocumentationDto } from './dto/update-documentation.dto.js';
import {
  Documentation,
  DocumentationDocument,
} from './schemas/documentation.schema.js';

const EMPTY_DOC = { type: 'doc', content: [{ type: 'paragraph' }] };

@Injectable()
export class DocumentationsService {
  constructor(
    @InjectModel(Documentation.name)
    private readonly documentationModel: Model<DocumentationDocument>,
  ) {}

  create(ownerId: string, dto: CreateDocumentationDto) {
    const content = dto.content ?? EMPTY_DOC;
    return this.documentationModel.create({
      title: dto.title.trim(),
      content,
      searchText: extractTiptapText(content),
      category: dto.category?.trim() ?? '',
      tags: dto.tags ?? [],
      parentType: dto.parentType ?? DocumentationParentType.None,
      parentId: dto.parentId ? new Types.ObjectId(dto.parentId) : undefined,
      checkpointId: dto.checkpointId
        ? new Types.ObjectId(dto.checkpointId)
        : undefined,
      status: dto.status ?? DocumentationStatus.Draft,
      ownerId: new Types.ObjectId(ownerId),
    });
  }

  async findAll(
    ownerId: string,
    query: ListDocumentationDto,
  ): Promise<PaginatedResult<DocumentationDocument>> {
    const { page, limit, skip } = paginate(query.page, query.limit);
    const filter = this.buildFilter(ownerId, query);

    const [items, total] = await Promise.all([
      this.documentationModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.documentationModel.countDocuments(filter).exec(),
    ]);

    return { items, total, page, limit };
  }

  async findOne(ownerId: string, id: string): Promise<DocumentationDocument> {
    const item = await this.documentationModel
      .findOne({ _id: id, ownerId: new Types.ObjectId(ownerId) })
      .exec();
    if (!item) {
      throw new NotFoundException('Documentation not found');
    }
    return item;
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateDocumentationDto,
  ): Promise<DocumentationDocument> {
    const item = await this.findOne(ownerId, id);

    if (dto.baseUpdatedAt) {
      const base = new Date(dto.baseUpdatedAt).getTime();
      const current = new Date(
        (item as DocumentationDocument & { updatedAt: Date }).updatedAt,
      ).getTime();
      if (current > base) {
        throw new ConflictException({
          message: 'Documentation was updated elsewhere',
          serverUpdatedAt: (item as DocumentationDocument & { updatedAt: Date })
            .updatedAt,
        });
      }
    }

    if (dto.title !== undefined) item.title = dto.title.trim();
    if (dto.content !== undefined) {
      item.content = dto.content;
      item.searchText = extractTiptapText(dto.content);
    }
    if (dto.category !== undefined) item.category = dto.category.trim();
    if (dto.tags !== undefined) item.tags = dto.tags;
    if (dto.parentType !== undefined) item.parentType = dto.parentType;
    if (dto.parentId !== undefined) {
      item.parentId = dto.parentId ? new Types.ObjectId(dto.parentId) : undefined;
    }
    if (dto.checkpointId !== undefined) {
      item.checkpointId = dto.checkpointId
        ? new Types.ObjectId(dto.checkpointId)
        : undefined;
    }
    if (dto.status !== undefined) item.status = dto.status;

    return item.save();
  }

  async archive(ownerId: string, id: string) {
    return this.update(ownerId, id, { status: DocumentationStatus.Archived });
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const result = await this.documentationModel
      .deleteOne({ _id: id, ownerId: new Types.ObjectId(ownerId) })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Documentation not found');
    }
  }

  listRecent(ownerId: string, limit = 5) {
    return this.documentationModel
      .find({
        ownerId: new Types.ObjectId(ownerId),
        status: { $ne: DocumentationStatus.Archived },
      })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .select('title status category updatedAt parentType parentId')
      .exec();
  }

  countByOwner(ownerId: string, filter: Record<string, unknown> = {}) {
    return this.documentationModel
      .countDocuments({
        ownerId: new Types.ObjectId(ownerId),
        ...filter,
      })
      .exec();
  }


  private buildFilter(
    ownerId: string,
    query: ListDocumentationDto,
  ): Record<string, unknown> {
    const filter: Record<string, unknown> = {
      ownerId: new Types.ObjectId(ownerId),
    };

    const wantArchived =
      query.archived === 'true' || query.status === DocumentationStatus.Archived;
    if (wantArchived) {
      filter.status = DocumentationStatus.Archived;
    } else if (query.status) {
      filter.status = query.status;
    } else {
      filter.status = { $ne: DocumentationStatus.Archived };
    }

    if (query.parentType) {
      filter.parentType = query.parentType;
    }
    if (query.parentId) {
      filter.parentId = new Types.ObjectId(query.parentId);
    }
    if (query.checkpointId) {
      filter.checkpointId = new Types.ObjectId(query.checkpointId);
    }
    if (query.q?.trim()) {
      const q = query.q.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { tags: { $elemMatch: { $regex: q, $options: 'i' } } },
      ];
    }

    return filter;
  }
}
