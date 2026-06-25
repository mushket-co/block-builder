import { describe, expect, it } from 'vitest';

import {
  canAddUploadItems,
  getDefaultAccept,
  getFileNameFromUrl,
  getMaxUploadCountErrorMessage,
  getUploadUrl,
  normalizeUploadItems,
  partitionFilesForUpload,
  resolveUploadConfig,
  serializeUploadValue,
  validateUploadFile,
} from '../../src/utils/uploadFieldUtils';

describe('uploadFieldUtils', () => {
  it('resolves upload config from field config', () => {
    expect(resolveUploadConfig({ fileUploadConfig: { uploadUrl: '/a' } }).uploadUrl).toBe('/a');
  });

  it('normalizes single and multiple values', () => {
    expect(normalizeUploadItems('https://x/img.png', false)).toEqual(['https://x/img.png']);
    expect(normalizeUploadItems(['a', 'b'], true)).toEqual(['a', 'b']);
    expect(normalizeUploadItems({ src: 'https://x/img.png' }, false)).toEqual(['https://x/img.png']);
  });

  it('serializes values by multiple flag', () => {
    expect(serializeUploadValue(['a'], false)).toBe('a');
    expect(serializeUploadValue(['a', 'b'], true)).toEqual(['a', 'b']);
  });

  it('validates image files only for image variant', () => {
    const pdf = new File(['x'], 'doc.pdf', { type: 'application/pdf' });
    expect(validateUploadFile(pdf, { maxFileSize: 1024 }, 'image')).toContain('изображения');
    expect(validateUploadFile(pdf, { maxFileSize: 1024 }, 'file')).toBeNull();
  });

  it('returns default accept by variant', () => {
    expect(getDefaultAccept('image', {})).toBe('image/*');
    expect(getDefaultAccept('file', { accept: '.pdf' })).toBe('.pdf');
  });

  it('extracts file name from url', () => {
    expect(getFileNameFromUrl('https://cdn.test/files/report.pdf')).toBe('report.pdf');
  });

  it('limits gallery additions by maxCount', () => {
    expect(canAddUploadItems(['a'], { maxCount: 2 }, true)).toBe(true);
    expect(canAddUploadItems(['a', 'b'], { maxCount: 2 }, true)).toBe(false);
  });

  it('partitions selected files by maxCount and remaining slots', () => {
    const files = [
      new File(['a'], 'a.png'),
      new File(['b'], 'b.png'),
      new File(['c'], 'c.png'),
    ];

    expect(partitionFilesForUpload(files, 0, { maxCount: 2 }, true)).toEqual({
      filesToUpload: files.slice(0, 2),
      maxCountExceeded: true,
      maxCount: 2,
      rejectedCount: 1,
    });

    expect(partitionFilesForUpload(files, 1, { maxCount: 2 }, true)).toEqual({
      filesToUpload: files.slice(0, 1),
      maxCountExceeded: true,
      maxCount: 2,
      rejectedCount: 2,
    });

    expect(partitionFilesForUpload(files, 2, { maxCount: 2 }, true)).toEqual({
      filesToUpload: [],
      maxCountExceeded: true,
      maxCount: 2,
      rejectedCount: 3,
    });
  });

  it('returns maxCount error message', () => {
    expect(getMaxUploadCountErrorMessage(5)).toBe('Максимальное количество файлов: 5');
  });

  it('reads upload url from mapped response objects', () => {
    expect(getUploadUrl({ src: 'https://x/a.png' })).toBe('https://x/a.png');
  });
});
