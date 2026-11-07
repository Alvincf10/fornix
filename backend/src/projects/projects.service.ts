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
import { slugify } from '../common/utils/slugify.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { ListProjectDto } from './dto/list-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { ProjectStatus } from './project.enums.js';
import { Project, ProjectDocument } from './schemas/project.schema.js';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly projectModel: Model<ProjectDocument>,
  ) {}

  async create(ownerId: string, dto: CreateProjectDto): Promise<ProjectDocument> {
    const baseSlug = slugify(dto.slug?.trim() || dto.title);
    const slug = await this.uniqueSlug(ownerId, baseSlug);

    try {
      return await this.projectModel.create({
        ...this.mapDates(dto),
        title: dto.title.trim(),
        slug,
        description: dto.description?.trim() ?? '',
        objective: dto.objective?.trim() ?? '',
        category: dto.category,
        status: dto.status ?? ProjectStatus.Planning,
        priority: dto.priority,
        tags: dto.tags ?? [],
        ownerId: new Types.ObjectId(ownerId),
        progress: 0,
      });
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('Project slug already exists');
      }
      throw error;
    }
  }

  async findAll(
    ownerId: string,
    query: ListProjectDto,
  ): Promise<PaginatedResult<ProjectDocument>> {
    const { page, limit, skip } = paginate(query.page, query.limit);
    const filter = this.buildFilter(ownerId, query);

    const [items, total] = await Promise.all([
      this.projectModel
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.projectModel.countDocuments(filter).exec(),
    ]);

    return { items, total, page, limit };
  }

  async findOne(ownerId: string, id: string): Promise<ProjectDocument> {
    const item = await this.projectModel
      .findOne({ _id: id, ownerId: new Types.ObjectId(ownerId) })
      .exec();
    if (!item) {
      throw new NotFoundException('Project not found');
    }
    return item;
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateProjectDto,
  ): Promise<ProjectDocument> {
    const item = await this.findOne(ownerId, id);

    if (dto.title !== undefined) {
      item.title = dto.title.trim();
    }
    if (dto.description !== undefined) {
      item.description = dto.description.trim();
    }
    if (dto.objective !== undefined) {
      item.objective = dto.objective.trim();
    }
    if (dto.category !== undefined) {
      item.category = dto.category;
    }
    if (dto.status !== undefined) {
      item.status = dto.status;
    }
    if (dto.priority !== undefined) {
      item.priority = dto.priority;
    }
    if (dto.tags !== undefined) {
      item.tags = dto.tags;
    }
    if (dto.startDate !== undefined) {
      item.startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    }
    if (dto.targetDate !== undefined) {
      item.targetDate = dto.targetDate ? new Date(dto.targetDate) : undefined;
    }
    if (dto.slug !== undefined || dto.title !== undefined) {
      const baseSlug = slugify(dto.slug?.trim() || item.title);
      if (baseSlug !== item.slug) {
        item.slug = await this.uniqueSlug(ownerId, baseSlug, item.id);
      }
    }

    try {
      return await item.save();
    } catch (error) {
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('Project slug already exists');
      }
      throw error;
    }
  }

  async archive(ownerId: string, id: string): Promise<ProjectDocument> {
    return this.update(ownerId, id, { status: ProjectStatus.Archived });
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const result = await this.projectModel
      .deleteOne({ _id: id, ownerId: new Types.ObjectId(ownerId) })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Project not found');
    }
  }

  countByOwner(ownerId: string, filter: Record<string, unknown> = {}) {
    return this.projectModel
      .countDocuments({ ownerId: new Types.ObjectId(ownerId), ...filter })
      .exec();
  }

  listRecent(ownerId: string, limit = 5) {
    return this.projectModel
      .find({
        ownerId: new Types.ObjectId(ownerId),
        status: { $ne: ProjectStatus.Archived },
      })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .exec();
  }

  async setProgress(ownerId: string, id: string, progress: number) {
    await this.projectModel
      .updateOne(
        { _id: id, ownerId: new Types.ObjectId(ownerId) },
        { $set: { progress: Math.max(0, Math.min(100, Math.round(progress))) } },
      )
      .exec();
  }

  private buildFilter(
    ownerId: string,
    query: ListProjectDto,
  ): Record<string, unknown> {
    const filter: Record<string, unknown> = {
      ownerId: new Types.ObjectId(ownerId),
    };

    const wantArchived = query.archived === 'true' || query.status === ProjectStatus.Archived;
    if (wantArchived) {
      filter.status = ProjectStatus.Archived;
    } else if (query.status) {
      filter.status = query.status;
    } else {
      filter.status = { $ne: ProjectStatus.Archived };
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.q?.trim()) {
      const q = query.q.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $elemMatch: { $regex: q, $options: 'i' } } },
      ];
    }

    return filter;
  }

  private async uniqueSlug(
    ownerId: string,
    base: string,
    excludeId?: string,
  ): Promise<string> {
    let candidate = base;
    let n = 2;
    while (true) {
      const existing = await this.projectModel
        .findOne({
          ownerId: new Types.ObjectId(ownerId),
          slug: candidate,
          ...(excludeId ? { _id: { $ne: excludeId } } : {}),
        })
        .select('_id')
        .exec();
      if (!existing) {
        return candidate;
      }
      candidate = `${base}-${n}`;
      n += 1;
    }
  }

  private mapDates(dto: CreateProjectDto | UpdateProjectDto) {
    return {
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
    };
  }
}
