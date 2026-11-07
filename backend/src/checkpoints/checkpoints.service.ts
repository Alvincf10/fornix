import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  PaginatedResult,
  paginate,
} from '../common/dto/pagination-query.dto.js';
import { ProjectsService } from '../projects/projects.service.js';
import { ResearchService } from '../research/research.service.js';
import {
  CheckpointCreateMode,
  CheckpointOutcome,
  CheckpointParentType,
  CheckpointStatus,
} from './checkpoint.enums.js';
import { CreateCheckpointDto } from './dto/create-checkpoint.dto.js';
import { ListCheckpointDto } from './dto/list-checkpoint.dto.js';
import { UpdateCheckpointDto } from './dto/update-checkpoint.dto.js';
import { ProgressCalculatorService } from './progress-calculator.service.js';
import { Checkpoint, CheckpointDocument } from './schemas/checkpoint.schema.js';

@Injectable()
export class CheckpointsService {
  constructor(
    @InjectModel(Checkpoint.name)
    private readonly checkpointModel: Model<CheckpointDocument>,
    private readonly researchService: ResearchService,
    private readonly projectsService: ProjectsService,
    private readonly progressCalculator: ProgressCalculatorService,
  ) {}

  async create(ownerId: string, dto: CreateCheckpointDto): Promise<CheckpointDocument> {
    await this.assertParent(ownerId, dto.parentType, dto.parentId);

    const mode = dto.mode ?? CheckpointCreateMode.Quick;
    if (mode === CheckpointCreateMode.Detailed && !dto.objective?.trim()) {
      throw new BadRequestException('Detailed checkpoint requires an objective');
    }

    const code = await this.nextCode(dto.parentId);
    const created = await this.checkpointModel.create({
      code,
      title: dto.title.trim(),
      description: dto.description?.trim() ?? '',
      parentType: dto.parentType,
      parentId: new Types.ObjectId(dto.parentId),
      objective: dto.objective?.trim() ?? '',
      methodology: dto.methodology?.trim() ?? '',
      expectedResult: dto.expectedResult?.trim() ?? '',
      tools: dto.tools ?? [],
      initialNotes: dto.initialNotes?.trim() ?? '',
      status: dto.status ?? CheckpointStatus.Draft,
      outcome: dto.outcome ?? CheckpointOutcome.NotEvaluated,
      progress: dto.progress ?? 0,
      weight: dto.weight,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
      ownerId: new Types.ObjectId(ownerId),
    });

    await this.progressCalculator.recalculateParent(
      ownerId,
      created.parentType,
      created.parentId.toString(),
    );

    return created;
  }

  async findAll(
    ownerId: string,
    query: ListCheckpointDto,
  ): Promise<PaginatedResult<CheckpointDocument>> {
    const { page, limit, skip } = paginate(query.page, query.limit);
    const filter: Record<string, unknown> = {
      ownerId: new Types.ObjectId(ownerId),
    };

    if (query.parentType) {
      filter.parentType = query.parentType;
    }
    if (query.parentId) {
      filter.parentId = new Types.ObjectId(query.parentId);
    }
    if (query.status) {
      filter.status = query.status;
    }
    if (query.q?.trim()) {
      const q = query.q.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { code: { $regex: q, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.checkpointModel
        .find(filter)
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.checkpointModel.countDocuments(filter).exec(),
    ]);

    return { items, total, page, limit };
  }

  async findOne(ownerId: string, id: string): Promise<CheckpointDocument> {
    const item = await this.checkpointModel
      .findOne({ _id: id, ownerId: new Types.ObjectId(ownerId) })
      .exec();
    if (!item) {
      throw new NotFoundException('Checkpoint not found');
    }
    return item;
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateCheckpointDto,
  ): Promise<CheckpointDocument> {
    const item = await this.findOne(ownerId, id);

    if (dto.title !== undefined) item.title = dto.title.trim();
    if (dto.description !== undefined) item.description = dto.description.trim();
    if (dto.objective !== undefined) item.objective = dto.objective.trim();
    if (dto.methodology !== undefined) item.methodology = dto.methodology.trim();
    if (dto.expectedResult !== undefined) {
      item.expectedResult = dto.expectedResult.trim();
    }
    if (dto.tools !== undefined) item.tools = dto.tools;
    if (dto.initialNotes !== undefined) item.initialNotes = dto.initialNotes.trim();
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.outcome !== undefined) item.outcome = dto.outcome;
    if (dto.progress !== undefined) item.progress = dto.progress;
    if (dto.weight !== undefined) item.weight = dto.weight;
    if (dto.startDate !== undefined) {
      item.startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    }
    if (dto.targetDate !== undefined) {
      item.targetDate = dto.targetDate ? new Date(dto.targetDate) : undefined;
    }

    const saved = await item.save();
    await this.progressCalculator.recalculateParent(
      ownerId,
      saved.parentType,
      saved.parentId.toString(),
    );
    return saved;
  }

  async remove(ownerId: string, id: string): Promise<void> {
    const item = await this.findOne(ownerId, id);
    await this.checkpointModel.deleteOne({ _id: item._id }).exec();
    await this.progressCalculator.recalculateParent(
      ownerId,
      item.parentType,
      item.parentId.toString(),
    );
  }

  countActive(ownerId: string) {
    return this.checkpointModel
      .countDocuments({
        ownerId: new Types.ObjectId(ownerId),
        status: {
          $in: [
            CheckpointStatus.Planned,
            CheckpointStatus.InProgress,
            CheckpointStatus.Blocked,
            CheckpointStatus.OnHold,
          ],
        },
      })
      .exec();
  }

  listRecent(ownerId: string, limit = 5) {
    return this.checkpointModel
      .find({
        ownerId: new Types.ObjectId(ownerId),
        status: { $ne: CheckpointStatus.Cancelled },
      })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .exec();
  }


  private async assertParent(
    ownerId: string,
    parentType: CheckpointParentType,
    parentId: string,
  ) {
    if (parentType === CheckpointParentType.Research) {
      await this.researchService.findOne(ownerId, parentId);
      return;
    }
    await this.projectsService.findOne(ownerId, parentId);
  }

  private async nextCode(parentId: string): Promise<string> {
    const count = await this.checkpointModel
      .countDocuments({ parentId: new Types.ObjectId(parentId) })
      .exec();
    return `CP-${String(count + 1).padStart(3, '0')}`;
  }
}
