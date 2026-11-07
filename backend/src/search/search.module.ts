import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Checkpoint,
  CheckpointSchema,
} from '../checkpoints/schemas/checkpoint.schema.js';
import {
  Documentation,
  DocumentationSchema,
} from '../documentations/schemas/documentation.schema.js';
import {
  ProgressEntry,
  ProgressEntrySchema,
} from '../progress-entries/schemas/progress-entry.schema.js';
import { Project, ProjectSchema } from '../projects/schemas/project.schema.js';
import { Research, ResearchSchema } from '../research/schemas/research.schema.js';
import { SearchController } from './search.controller.js';
import { SearchService } from './search.service.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Research.name, schema: ResearchSchema },
      { name: Project.name, schema: ProjectSchema },
      { name: Checkpoint.name, schema: CheckpointSchema },
      { name: ProgressEntry.name, schema: ProgressEntrySchema },
      { name: Documentation.name, schema: DocumentationSchema },
    ]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
