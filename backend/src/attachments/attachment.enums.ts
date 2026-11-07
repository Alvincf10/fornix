export enum AttachmentParentType {
  Research = 'research',
  Project = 'project',
  Checkpoint = 'checkpoint',
  ProgressEntry = 'progress_entry',
  Documentation = 'documentation',
}

export const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/json',
  'application/x-yaml',
  'text/yaml',
  'text/csv',
  'application/zip',
  'application/x-zip-compressed',
  'text/x-log',
  'application/octet-stream',
]);

export const ALLOWED_EXTENSIONS = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.pdf',
  '.txt',
  '.md',
  '.json',
  '.yaml',
  '.yml',
  '.zip',
  '.log',
  '.csv',
]);
