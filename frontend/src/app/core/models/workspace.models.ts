export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export type ResearchCategory =
  | 'Cybersecurity'
  | 'Hardware'
  | 'Firmware'
  | 'Reverse Engineering'
  | 'Networking'
  | 'Embedded Systems'
  | 'Software'
  | 'Infrastructure'
  | 'Other';

export type ResearchStatus =
  | 'Idea'
  | 'Planned'
  | 'In Progress'
  | 'On Hold'
  | 'Completed'
  | 'Archived';

export type ProjectStatus =
  | 'Planning'
  | 'In Progress'
  | 'On Hold'
  | 'Completed'
  | 'Cancelled'
  | 'Archived';

export type ResearchItem = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  objective: string;
  category: ResearchCategory;
  status: ResearchStatus;
  priority: Priority;
  tags: string[];
  startDate?: string;
  targetDate?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
};

export type ProjectItem = {
  _id: string;
  title: string;
  slug: string;
  description: string;
  objective: string;
  category: ResearchCategory;
  status: ProjectStatus;
  priority: Priority;
  tags: string[];
  startDate?: string;
  targetDate?: string;
  progress: number;
  createdAt: string;
  updatedAt: string;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
};

export type DocumentationStatus = 'Draft' | 'Published' | 'Archived';
export type DocumentationParentType = 'none' | 'research' | 'project' | 'checkpoint';

export type DocumentationItem = {
  _id: string;
  title: string;
  content: Record<string, unknown>;
  category: string;
  tags: string[];
  parentType: DocumentationParentType;
  parentId?: string;
  checkpointId?: string;
  status: DocumentationStatus;
  createdAt: string;
  updatedAt: string;
};

export const RESEARCH_CATEGORIES: ResearchCategory[] = [
  'Cybersecurity',
  'Hardware',
  'Firmware',
  'Reverse Engineering',
  'Networking',
  'Embedded Systems',
  'Software',
  'Infrastructure',
  'Other',
];

export const RESEARCH_STATUSES: ResearchStatus[] = [
  'Idea',
  'Planned',
  'In Progress',
  'On Hold',
  'Completed',
  'Archived',
];

export const PROJECT_STATUSES: ProjectStatus[] = [
  'Planning',
  'In Progress',
  'On Hold',
  'Completed',
  'Cancelled',
  'Archived',
];

export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High', 'Critical'];

export type CheckpointParentType = 'research' | 'project';

export type CheckpointStatus =
  | 'Draft'
  | 'Planned'
  | 'In Progress'
  | 'Blocked'
  | 'Completed'
  | 'Cancelled'
  | 'On Hold';

export type CheckpointOutcome =
  | 'Not Evaluated'
  | 'Success'
  | 'Partial'
  | 'Failed'
  | 'Inconclusive';

export type ProgressEntryType =
  | 'Activity'
  | 'Finding'
  | 'Experiment'
  | 'Issue'
  | 'Note'
  | 'Decision';

export type CheckpointItem = {
  _id: string;
  code: string;
  title: string;
  description: string;
  parentType: CheckpointParentType;
  parentId: string;
  objective: string;
  methodology: string;
  expectedResult: string;
  tools: string[];
  initialNotes: string;
  status: CheckpointStatus;
  outcome: CheckpointOutcome;
  progress: number;
  weight?: number;
  startDate?: string;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type DashboardOverview = {
  totals: {
    research: number;
    activeResearch: number;
    activeProjects: number;
    activeCheckpoints: number;
    documents?: number;
  };
  recentResearch: ResearchItem[];
  recentProjects: ProjectItem[];
  recentDocuments: DocumentationItem[];
  recentCheckpoints?: CheckpointItem[];
  recentActivities: unknown[];
  note?: string;
};

export type ProgressEntryItem = {
  _id: string;
  checkpointId: string;
  title: string;
  content: string;
  entryType: ProgressEntryType;
  occurredAt: string;
  tools: string[];
  createdAt: string;
};

export const CHECKPOINT_STATUSES: CheckpointStatus[] = [
  'Draft',
  'Planned',
  'In Progress',
  'Blocked',
  'Completed',
  'Cancelled',
  'On Hold',
];

export const CHECKPOINT_OUTCOMES: CheckpointOutcome[] = [
  'Not Evaluated',
  'Success',
  'Partial',
  'Failed',
  'Inconclusive',
];

export const ENTRY_TYPES: ProgressEntryType[] = [
  'Activity',
  'Finding',
  'Experiment',
  'Issue',
  'Note',
  'Decision',
];

export const DOC_STATUSES: DocumentationStatus[] = ['Draft', 'Published', 'Archived'];

export const DOC_PARENT_TYPES: DocumentationParentType[] = [
  'none',
  'research',
  'project',
  'checkpoint',
];

export const EMPTY_TIPTAP_DOC: Record<string, unknown> = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
};


