import { useRef, useState } from 'react';

import type { ICustomFieldFormScope } from '../../core/ports/CustomFieldRenderer';
import type { IFileImportConfig } from '../../core/types/form';
import {
  applyFileImportMergeRules,
  formatFileImportMergeMessage,
} from '../../utils/fileImportMerge';
import { CSS_CLASSES } from '../../utils/constants';
import { Icon } from './icons/Icon';

interface IFileImportFieldProps {
  label?: string;
  error?: string;
  fileImportConfig: IFileImportConfig;
  formScope: ICustomFieldFormScope;
}

function validateImportFile(file: File, config: IFileImportConfig): string | null {
  const maxSizeMb = config.maxSizeMb ?? 5;
  const maxBytes = maxSizeMb * 1024 * 1024;

  if (file.size > maxBytes) {
    return `Размер файла не должен превышать ${maxSizeMb}MB`;
  }

  if (config.accept?.length) {
    const fileName = file.name.toLowerCase();
    const matches = config.accept.some(pattern => {
      const normalized = pattern.toLowerCase().trim();
      if (normalized.startsWith('.')) {
        return fileName.endsWith(normalized);
      }
      return file.type === normalized;
    });

    if (!matches) {
      return `Допустимые форматы: ${config.accept.join(', ')}`;
    }
  }

  return null;
}

async function uploadImportFile(file: File, config: IFileImportConfig): Promise<unknown> {
  const formData = new FormData();
  formData.append(config.formDataKey || 'file', file);

  const response = await fetch(config.uploadUrl, {
    method: 'POST',
    headers: config.uploadHeaders || {},
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Ошибка загрузки: ${response.statusText}`);
  }

  const responseData = await response.json();
  return config.responseMapper ? config.responseMapper(responseData) : responseData;
}

export function FileImportField({
  label = '',
  error = '',
  fileImportConfig,
  formScope,
}: IFileImportFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [importNotice, setImportNotice] = useState('');

  const accept = fileImportConfig.accept?.join(',') || '*/*';
  const displayError = error || localError;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file || isLoading) {
      return;
    }

    const validationError = validateImportFile(file, fileImportConfig);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError('');
    setImportNotice('');
    setIsLoading(true);

    try {
      const data = await uploadImportFile(file, fileImportConfig);

      let mergeStats;
      if (fileImportConfig.merge?.length) {
        mergeStats = applyFileImportMergeRules(formScope, data, fileImportConfig.merge);
      }

      if (fileImportConfig.onImport) {
        await fileImportConfig.onImport({ data, formScope, mergeStats });
      } else if (!fileImportConfig.merge?.length) {
        throw new Error('fileImportConfig: укажите merge и/или onImport');
      }

      const message = formatFileImportMergeMessage(mergeStats || []);
      if (message) {
        setImportNotice(message);
      }
    } catch (uploadError) {
      setLocalError(
        uploadError instanceof Error ? uploadError.message : 'Ошибка импорта файла'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={CSS_CLASSES.FILE_IMPORT_FIELD}>
      {label ? <div className={CSS_CLASSES.FORM_LABEL}>{label}</div> : null}
      <button
        type="button"
        className={`${CSS_CLASSES.BTN} ${CSS_CLASSES.BTN_SECONDARY}`}
        disabled={isLoading}
        onClick={() => inputRef.current?.click()}
      >
        {isLoading ? (
          <Icon name="loader" width={14} height={14} className="bb-icon--spin" />
        ) : null}
        <span>{isLoading ? 'Загрузка…' : 'Выберите файл'}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        hidden
        disabled={isLoading}
        onChange={handleFileChange}
      />
      {displayError ? (
        <div className={CSS_CLASSES.FORM_ERRORS}>
          <span className={CSS_CLASSES.ERROR}>{displayError}</span>
        </div>
      ) : null}
      {importNotice ? (
        <div className={CSS_CLASSES.FILE_IMPORT_NOTICE}>{importNotice}</div>
      ) : null}
    </div>
  );
}
