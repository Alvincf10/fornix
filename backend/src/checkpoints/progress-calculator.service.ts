import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProjectsService } from '../projects/projects.service.js';
import { ResearchService } from '../research/research.service.js';
import { CheckpointParentType } from './checkpoint.enums.js';
import { averageCheckpointProgress } from './progress-math.js';
import { Checkpoint, CheckpointDocument } from './schemas/checkpoint.schema.js';

@Injectable()
export class ProgressCalculatorService {
  constructor(
    @InjectModel(Checkpoint.name)
    private readonly checkpointModel: Model<CheckpointDocument>,
    private readonly researchService: ResearchService,
    private readonly projectsService: ProjectsService,
  ) {}

  async recalculateParent(
    ownerId: string,
    parentType: CheckpointParentType,
    parentId: string,
  ): Promise<number> {
    const checkpoints = await this.checkpointModel
      .find({
        ownerId: new Types.ObjectId(ownerId),
        parentType,
        parentId: new Types.ObjectId(parentId),
      })
      .exec();

    const progress = averageCheckpointProgress(checkpoints);

    if (parentType === CheckpointParentType.Research) {
      await this.researchService.setProgress(ownerId, parentId, progress);
    } else {
      await this.projectsService.setProgress(ownerId, parentId, progress);
    }

    return progress;
  }
}
