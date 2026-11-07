import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Checkpoint } from '../checkpoints/schemas/checkpoint.schema.js';
import { Documentation } from '../documentations/schemas/documentation.schema.js';
import { ProgressEntry } from '../progress-entries/schemas/progress-entry.schema.js';
import { Project } from '../projects/schemas/project.schema.js';
import { Research } from '../research/schemas/research.schema.js';
import { paginate } from '../common/dto/pagination-query.dto.js';
import { SearchQueryDto, SearchType } from './dto/search-query.dto.js';

export type SearchHit = {
  type: Exclude<SearchType, SearchType.All>;
  id: string;
  title: string;
  snippet?: string;
  status?: string;
  category?: string;
  parentType?: string;
  parentId?: string;
  updatedAt?: Date;
};

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Research.name) private readonly researchModel: Model<Research>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(Checkpoint.name) private readonly checkpointModel: Model<Checkpoint>,
    @InjectModel(ProgressEntry.name)
    private readonly entryModel: Model<ProgressEntry>,
    @InjectModel(Documentation.name)
    private readonly documentationModel: Model<Documentation>,
  ) {}

  async search(ownerId: string, query: SearchQueryDto) {
    const q = query.q.trim();
    const type = query.type ?? SearchType.All;
    const { page, limit } = paginate(query.page, query.limit);
    const owner = new Types.ObjectId(ownerId);
    const regex = new RegExp(this.escapeRegex(q), 'i');

    const tasks: Array<Promise<SearchHit[]>> = [];

    if (type === SearchType.All || type === SearchType.Research) {
      tasks.push(this.searchResearch(owner, regex, query));
    }
    if (type === SearchType.All || type === SearchType.Projects) {
      tasks.push(this.searchProjects(owner, regex, query));
    }
    if (type === SearchType.All || type === SearchType.Checkpoints) {
      tasks.push(this.searchCheckpoints(owner, regex, query));
    }
    if (type === SearchType.All || type === SearchType.Entries) {
      tasks.push(this.searchEntries(owner, regex));
    }
    if (type === SearchType.All || type === SearchType.Documentation) {
      tasks.push(this.searchDocs(owner, regex, query));
    }

    const groups = await Promise.all(tasks);
    const merged = groups
      .flat()
      .sort((a, b) => {
        const at = a.updatedAt?.getTime() ?? 0;
        const bt = b.updatedAt?.getTime() ?? 0;
        return bt - at;
      });

    const total = merged.length;
    const start = (page - 1) * limit;
    const items = merged.slice(start, start + limit);

    return { items, total, page, limit, q };
  }

  private async searchResearch(
    ownerId: Types.ObjectId,
    regex: RegExp,
    query: SearchQueryDto,
  ): Promise<SearchHit[]> {
    const filter: Record<string, unknown> = {
      ownerId,
      $or: [{ title: regex }, { description: regex }, { tags: regex }],
    };
    if (query.category) filter.category = query.category;
    if (query.status) filter.status = query.status;

    const rows = await this.researchModel
      .find(filter)
      .select('title description status category updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean()
      .exec();

    return rows.map((row) => {
      const stamped = row as typeof row & { updatedAt?: Date };
      return {
        type: SearchType.Research,
        id: String(row._id),
        title: row.title,
        snippet: row.description?.slice(0, 160),
        status: row.status,
        category: row.category,
        updatedAt: stamped.updatedAt,
      };
    });
  }

  private async searchProjects(
    ownerId: Types.ObjectId,
    regex: RegExp,
    query: SearchQueryDto,
  ): Promise<SearchHit[]> {
    const filter: Record<string, unknown> = {
      ownerId,
      $or: [{ title: regex }, { description: regex }, { tags: regex }],
    };
    if (query.category) filter.category = query.category;
    if (query.status) filter.status = query.status;

    const rows = await this.projectModel
      .find(filter)
      .select('title description status category updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean()
      .exec();

    return rows.map((row) => {
      const stamped = row as typeof row & { updatedAt?: Date };
      return {
        type: SearchType.Projects,
        id: String(row._id),
        title: row.title,
        snippet: row.description?.slice(0, 160),
        status: row.status,
        category: row.category,
        updatedAt: stamped.updatedAt,
      };
    });
  }

  private async searchCheckpoints(
    ownerId: Types.ObjectId,
    regex: RegExp,
    query: SearchQueryDto,
  ): Promise<SearchHit[]> {
    const filter: Record<string, unknown> = {
      ownerId,
      $or: [{ title: regex }, { description: regex }, { code: regex }, { objective: regex }],
    };
    if (query.status) filter.status = query.status;

    const rows = await this.checkpointModel
      .find(filter)
      .select('code title description status parentType parentId updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean()
      .exec();

    return rows.map((row) => {
      const stamped = row as typeof row & { updatedAt?: Date };
      return {
        type: SearchType.Checkpoints,
        id: String(row._id),
        title: `${row.code} · ${row.title}`,
        snippet: row.description?.slice(0, 160),
        status: row.status,
        parentType: row.parentType,
        parentId: String(row.parentId),
        updatedAt: stamped.updatedAt,
      };
    });
  }

  private async searchEntries(
    ownerId: Types.ObjectId,
    regex: RegExp,
  ): Promise<SearchHit[]> {
    const rows = await this.entryModel
      .find({
        ownerId,
        $or: [{ title: regex }, { content: regex }],
      })
      .select('title content entryType checkpointId createdAt')
      .sort({ occurredAt: -1 })
      .limit(50)
      .lean()
      .exec();

    return rows.map((row) => {
      const stamped = row as typeof row & { createdAt?: Date };
      return {
        type: SearchType.Entries,
        id: String(row._id),
        title: row.title,
        snippet: row.content?.slice(0, 160),
        status: row.entryType,
        parentType: 'checkpoint',
        parentId: String(row.checkpointId),
        updatedAt: stamped.createdAt,
      };
    });
  }

  private async searchDocs(
    ownerId: Types.ObjectId,
    regex: RegExp,
    query: SearchQueryDto,
  ): Promise<SearchHit[]> {
    const filter: Record<string, unknown> = {
      ownerId,
      $or: [{ title: regex }, { category: regex }, { tags: regex }, { searchText: regex }],
    };
    if (query.status) filter.status = query.status;
    if (query.category) filter.category = query.category;

    const rows = await this.documentationModel
      .find(filter)
      .select('title category status searchText updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean()
      .exec();

    return rows.map((row) => {
      const stamped = row as typeof row & { updatedAt?: Date; searchText?: string };
      return {
        type: SearchType.Documentation,
        id: String(row._id),
        title: row.title,
        snippet: stamped.searchText?.slice(0, 160),
        status: row.status,
        category: row.category,
        updatedAt: stamped.updatedAt,
      };
    });
  }

  private escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
