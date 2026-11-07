import { Module } from '@nestjs/common';
import { CheckpointsModule } from '../checkpoints/checkpoints.module.js';
import { DocumentationsModule } from '../documentations/documentations.module.js';
import { ProjectsModule } from '../projects/projects.module.js';
import { ResearchModule } from '../research/research.module.js';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';

@Module({
  imports: [ResearchModule, ProjectsModule, CheckpointsModule, DocumentationsModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

