import { extname } from 'node:path';
import { ALLOWED_EXTENSIONS, ALLOWED_MIME_TYPES } from './attachment.enums.js';

export type FileValidationInput = {
  originalName: string;
  mimeType?: string;
  size: number;
  maxSize: number;
};

export type FileValidationResult =
  | { ok: true; extension: string; mimeType: string }
  | { ok: false; reason: string };

export function validateUploadFile(
  input: FileValidationInput,
): FileValidationResult {
  if (input.size > input.maxSize) {
    return {
      ok: false,
      reason: `File exceeds max size of ${input.maxSize} bytes`,
    };
  }

  const extension = extname(input.originalName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return {
      ok: false,
      reason: `File extension ${extension} is not allowed`,
    };
  }

  const mimeType = input.mimeType || 'application/octet-stream';
  const octetAllowed =
    mimeType === 'application/octet-stream' &&
    ['.log', '.csv', '.md', '.yaml', '.yml'].includes(extension);

  if (!ALLOWED_MIME_TYPES.has(mimeType) && !octetAllowed) {
    return {
      ok: false,
      reason: `MIME type ${mimeType} is not allowed`,
    };
  }

  return { ok: true, extension, mimeType };
}
