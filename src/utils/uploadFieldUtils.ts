import type { IFileUploadConfig } from '../core/types/form';

export type TUploadFieldVariant = 'image' | 'file';

export interface IUploadFieldSource {
  fileUploadConfig?: IFileUploadConfig;
}

export function resolveUploadConfig(field?: IUploadFieldSource): IFileUploadConfig {
  return field?.fileUploadConfig || {};
}

export function getUploadUrl(value: unknown): string {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>;
    return String(record.src || record.url || '');
  }
  return '';
}

export function normalizeUploadItems(value: unknown, multiple: boolean): string[] {
  if (!multiple) {
    const url = getUploadUrl(value);
    return url ? [url] : [];
  }

  if (Array.isArray(value)) {
    return value.map(item => getUploadUrl(item)).filter(Boolean);
  }

  const single = getUploadUrl(value);
  return single ? [single] : [];
}

export function serializeUploadValue(items: string[], multiple: boolean): string | string[] {
  if (multiple) {
    return items;
  }
  return items[0] || '';
}

export function getMaxUploadCount(config: IFileUploadConfig, multiple: boolean): number {
  if (!multiple) {
    return 1;
  }
  return config.maxCount ?? Number.POSITIVE_INFINITY;
}

export function getMaxUploadCountErrorMessage(maxCount: number): string {
  return `Максимальное количество файлов: ${maxCount}`;
}

export interface IPartitionFilesForUploadResult {
  filesToUpload: File[];
  maxCountExceeded: boolean;
  maxCount: number;
  rejectedCount: number;
}

export function partitionFilesForUpload(
  selectedFiles: File[],
  currentItemsCount: number,
  config: IFileUploadConfig,
  multiple: boolean
): IPartitionFilesForUploadResult {
  const maxCount = getMaxUploadCount(config, multiple);
  const remainingSlots = Math.max(0, maxCount - currentItemsCount);

  if (!multiple) {
    const rejectedCount = Math.max(0, selectedFiles.length - 1);
    return {
      filesToUpload: selectedFiles.slice(0, 1),
      maxCountExceeded: rejectedCount > 0,
      maxCount: 1,
      rejectedCount,
    };
  }

  const filesToUpload = selectedFiles.slice(0, remainingSlots);
  const rejectedCount = selectedFiles.length - filesToUpload.length;

  return {
    filesToUpload,
    maxCountExceeded: rejectedCount > 0,
    maxCount,
    rejectedCount,
  };
}

export function canAddUploadItems(
  items: string[],
  config: IFileUploadConfig,
  multiple: boolean
): boolean {
  return items.length < getMaxUploadCount(config, multiple);
}

export function getDefaultAccept(variant: TUploadFieldVariant, config: IFileUploadConfig): string {
  if (config.accept) {
    return config.accept;
  }
  return variant === 'image' ? 'image/*' : '*/*';
}

export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

export function isImageUploadUrl(url: string): boolean {
  if (!url) {
    return false;
  }
  if (url.startsWith('data:image/')) {
    return true;
  }
  return /\.(png|jpe?g|gif|webp|svg|bmp|ico)(\?.*)?$/i.test(url);
}

export function shouldShowUploadImagePreview(
  variant: TUploadFieldVariant,
  url: string
): boolean {
  if (variant === 'file') {
    return false;
  }

  return variant === 'image' || isImageUploadUrl(url);
}

export function getFileNameFromUrl(url: string): string {
  if (!url) {
    return '';
  }

  if (url.startsWith('data:')) {
    const mimeMatch = url.match(/^data:([^;,]+)/);
    const extension = mimeMatch?.[1]?.split('/')[1] || 'file';
    return `file.${extension}`;
  }

  try {
    const pathname = new URL(url, 'http://localhost').pathname;
    const name = pathname.split('/').pop() || '';
    return decodeURIComponent(name);
  } catch {
    const parts = url.split('/');
    return parts[parts.length - 1] || url;
  }
}

export function getFileExtensionBadge(url: string): string {
  const fileName = getFileNameFromUrl(url);
  const extension = fileName.includes('.') ? fileName.split('.').pop()?.trim() : '';
  return extension ? extension.slice(0, 4).toUpperCase() : 'FILE';
}

export function validateUploadFile(
  file: File,
  config: IFileUploadConfig,
  variant: TUploadFieldVariant
): string | null {
  const maxFileSize = config.maxFileSize || 10 * 1024 * 1024;

  if (variant === 'image' && !isImageMimeType(file.type)) {
    return 'Пожалуйста, выберите файл изображения';
  }

  if (file.size > maxFileSize) {
    return `Размер файла не должен превышать ${Math.round(maxFileSize / 1024 / 1024)}MB`;
  }

  return null;
}

export async function uploadFileToServer(
  file: File,
  config: IFileUploadConfig
): Promise<unknown> {
  const uploadUrl = config.uploadUrl;
  if (!uploadUrl) {
    throw new Error('uploadUrl не указан в конфигурации');
  }

  const uploadHeaders = config.uploadHeaders || {};
  const fileParamName = config.fileParamName || 'file';

  const formData = new FormData();
  formData.append(fileParamName, file);

  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: uploadHeaders,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Ошибка загрузки: ${response.statusText}`);
  }

  const responseData = await response.json();

  if (config.responseMapper) {
    return config.responseMapper(responseData);
  }

  return responseData;
}

export async function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', event => resolve(String(event.target?.result || '')));
    reader.addEventListener('error', () => reject(new Error('Ошибка при чтении файла')));
    reader.readAsDataURL(file);
  });
}

export async function processUploadFile(
  file: File,
  config: IFileUploadConfig,
  variant: TUploadFieldVariant
): Promise<unknown> {
  const validationError = validateUploadFile(file, config, variant);
  if (validationError) {
    throw new Error(validationError);
  }

  if (config.uploadUrl) {
    return uploadFileToServer(file, config);
  }

  if (variant === 'image') {
    return readFileAsDataUrl(file);
  }

  throw new Error('uploadUrl не указан в конфигурации');
}
