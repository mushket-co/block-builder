import type { ICustomFieldFormScope } from '../core/ports/CustomFieldRenderer';
import type {
  IFileImportMergeRule,
  IFileImportMergeStat,
} from '../core/types/form';

export interface IMergeImportedArrayResult<T> {
  merged: T[];
  added: number;
  skipped: number;
}

const defaultNormalizeDedupeKey = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim().toLowerCase();
};

export function getImportDataPath(data: unknown, path: string): unknown {
  if (!path) {
    return data;
  }

  return path.split('.').reduce<unknown>((acc, segment) => {
    if (acc === null || acc === undefined || typeof acc !== 'object') {
      return undefined;
    }
    return (acc as Record<string, unknown>)[segment];
  }, data);
}

export function mergeImportedArray<T extends Record<string, unknown>>(
  existing: T[],
  incoming: T[],
  options: {
    mode?: 'append' | 'replace';
    dedupeBy?: string;
    normalizeDedupeKey?: (value: unknown) => string;
  } = {}
): IMergeImportedArrayResult<T> {
  const mode = options.mode ?? 'append';
  const normalizeKey = options.normalizeDedupeKey ?? defaultNormalizeDedupeKey;

  if (mode === 'replace') {
    return {
      merged: [...incoming],
      added: incoming.length,
      skipped: 0,
    };
  }

  if (!options.dedupeBy) {
    return {
      merged: [...existing, ...incoming],
      added: incoming.length,
      skipped: 0,
    };
  }

  const dedupeField = options.dedupeBy;
  const seen = new Set(
    existing.map(item => normalizeKey(item[dedupeField])).filter(key => key.length > 0)
  );

  const merged = [...existing];
  let added = 0;
  let skipped = 0;

  incoming.forEach(item => {
    const key = normalizeKey(item[dedupeField]);
    if (key.length > 0 && seen.has(key)) {
      skipped += 1;
      return;
    }

    if (key.length > 0) {
      seen.add(key);
    }

    merged.push(item);
    added += 1;
  });

  return { merged, added, skipped };
}

export function applyFileImportMergeRules(
  formScope: ICustomFieldFormScope,
  data: unknown,
  rules: IFileImportMergeRule[]
): IFileImportMergeStat[] {
  return rules.map(rule => {
    const sourceKey = rule.sourceKey ?? rule.targetField;
    const sourceValue = getImportDataPath(data, sourceKey);
    const sourceArray = Array.isArray(sourceValue) ? sourceValue : [];

    const mapped = sourceArray.map((item, index) => {
      if (rule.mapItem) {
        return rule.mapItem(item, index, sourceArray);
      }
      if (item && typeof item === 'object') {
        return { ...(item as Record<string, unknown>) };
      }
      return { value: item };
    });

    const existingRaw = formScope.formData[rule.targetField];
    const existing = Array.isArray(existingRaw)
      ? (existingRaw as Record<string, unknown>[])
      : [];

    const mode = rule.mode ?? 'append';
    const { merged, added, skipped } = mergeImportedArray(existing, mapped, {
      mode,
      dedupeBy: rule.dedupeBy,
      normalizeDedupeKey: rule.normalizeDedupeKey,
    });

    formScope.setField(rule.targetField, merged);

    return {
      targetField: rule.targetField,
      mode,
      added,
      skipped,
      total: merged.length,
    };
  });
}

export function formatFileImportMergeMessage(stats: IFileImportMergeStat[]): string | null {
  if (!stats.length) {
    return null;
  }

  const parts = stats.map(stat => {
    const field = stat.targetField;
    if (stat.mode === 'replace') {
      return `${field}: заменено (${stat.total})`;
    }
    if (stat.skipped > 0) {
      return `${field}: +${stat.added}, пропущено дубликатов ${stat.skipped}`;
    }
    return `${field}: +${stat.added}`;
  });

  return parts.join(' · ');
}
