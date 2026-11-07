import { describe, expect, it } from 'vitest';
import { validateUploadFile } from './file-validation.js';

describe('validateUploadFile', () => {
  const base = {
    originalName: 'notes.txt',
    mimeType: 'text/plain',
    size: 100,
    maxSize: 1000,
  };

  it('accepts allowed text files', () => {
    const result = validateUploadFile(base);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mimeType).toBe('text/plain');
      expect(result.extension).toBe('.txt');
    }
  });

  it('rejects oversized files', () => {
    const result = validateUploadFile({ ...base, size: 2000 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('max size');
    }
  });

  it('rejects disallowed extensions', () => {
    const result = validateUploadFile({
      ...base,
      originalName: 'payload.exe',
      mimeType: 'application/octet-stream',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toContain('.exe');
    }
  });

  it('rejects disallowed MIME types', () => {
    const result = validateUploadFile({
      ...base,
      originalName: 'photo.png',
      mimeType: 'application/x-msdownload',
    });
    expect(result.ok).toBe(false);
  });

  it('allows octet-stream for log/csv/md/yaml', () => {
    const result = validateUploadFile({
      originalName: 'run.log',
      mimeType: 'application/octet-stream',
      size: 10,
      maxSize: 1000,
    });
    expect(result.ok).toBe(true);
  });
});
