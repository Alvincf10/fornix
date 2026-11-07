import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProgressEntriesController } from '../progress-entries/progress-entries.controller.js';
import { ProgressEntriesService } from '../progress-entries/progress-entries.service.js';
import {
  ProgressEntry,
  ProgressEntrySchema,
} from '../progress-entries/schemas/progress-entry.schema.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ResearchModule } from '../research/research.module.js';
import { CheckpointsController } from './checkpoints.controller.js';
import { CheckpointsService } from './checkpoints.service.js';
import { ProgressCalculatorService } from './progress-calculator.service.js';
import { Checkpoint, CheckpointSchema } from './schemas/checkpoint.schema.js';

@Module({
  imports: [
    ResearchModule,
    ProjectsModule,
    MongooseModule.forFeature([
      { name: Checkpoint.name, schema: CheckpointSchema },
      { name: ProgressEntry.name, schema: ProgressEntrySchema },
    ]),
  ],
  controllers: [CheckpointsController, ProgressEntriesController],
  providers: [CheckpointsService, ProgressCalculatorService, ProgressEntriesService],
  exports: [CheckpointsService, ProgressEntriesService],
})
export class CheckpointsModule {}
