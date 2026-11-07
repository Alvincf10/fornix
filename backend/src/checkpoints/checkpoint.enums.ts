export enum CheckpointParentType {
  Research = 'research',
  Project = 'project',
}

export enum CheckpointStatus {
  Draft = 'Draft',
  Planned = 'Planned',
  InProgress = 'In Progress',
  Blocked = 'Blocked',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  OnHold = 'On Hold',
}

export enum CheckpointOutcome {
  NotEvaluated = 'Not Evaluated',
  Success = 'Success',
  Partial = 'Partial',
  Failed = 'Failed',
  Inconclusive = 'Inconclusive',
}

export enum CheckpointCreateMode {
  Quick = 'quick',
  Detailed = 'detailed',
}
