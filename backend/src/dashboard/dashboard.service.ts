import { Injectable } from '@nestjs/common';
import { CheckpointsService } from '../checkpoints/checkpoints.service.js';
import { DocumentationsService } from '../documentations/documentations.service.js';
import { ProjectsService } from '../projects/projects.service.js';
import { ProjectStatus } from '../projects/project.enums.js';
import { ResearchService } from '../research/research.service.js';
import { ResearchStatus } from '../research/research.enums.js';
import { DocumentationStatus } from '../documentations/documentation.enums.js';


@Injectable()
export class DashboardService {
  constructor(
    private readonly researchService: ResearchService,
    private readonly projectsService: ProjectsService,
    private readonly checkpointsService: CheckpointsService,
    private readonly documentationsService: DocumentationsService,
  ) {}

  async overview(ownerId: string) {
    const activeProjectStatuses = [
      ProjectStatus.Planning,
      ProjectStatus.InProgress,
      ProjectStatus.OnHold,
    ];
    const activeResearchStatuses = [
      ResearchStatus.Idea,
      ResearchStatus.Planned,
      ResearchStatus.InProgress,
      ResearchStatus.OnHold,
    ];

    const [
      researchTotal,
      activeProjects,
      activeCheckpoints,
      recentResearch,
      recentProjects,
      recentDocuments,
      recentCheckpoints,
      activeResearch,
      documentsTotal,
    ] = await Promise.all([
      this.researchService.countByOwner(ownerId, {
        status: { $ne: ResearchStatus.Archived },
      }),
      this.projectsService.countByOwner(ownerId, {
        status: { $in: activeProjectStatuses },
      }),
      this.checkpointsService.countActive(ownerId),
      this.researchService.listRecent(ownerId, 5),
      this.projectsService.listRecent(ownerId, 5),
      this.documentationsService.listRecent(ownerId, 5),
      this.checkpointsService.listRecent(ownerId, 5),
      this.researchService.countByOwner(ownerId, {
        status: { $in: activeResearchStatuses },
      }),
      this.documentationsService.countByOwner(ownerId, {
        status: { $ne: DocumentationStatus.Archived },
      }),
    ]);


    return {
      totals: {
        research: researchTotal,
        activeResearch,
        activeProjects,
        activeCheckpoints,
        documents: documentsTotal,
      },
      recentResearch,
      recentProjects,
      recentDocuments,
      recentCheckpoints,
      recentActivities: [],
    };
  }
}

