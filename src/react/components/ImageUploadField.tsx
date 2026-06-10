import { useEffect, useId, useMemo, useRef, useState } from 'react';

import type { IImageUploadConfig } from '../../core/types/form';
import { CSS_CLASSES } from '../../utils/constants';

interface IImageUploadFieldProps {
  modelValue?: unknown;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  imageUploadConfig?: IImageUploadConfig;
  fieldNamePath?: string;
  dataRepeaterField?: string;
  dataRepeaterIndex?: number | string;
  dataRepeaterItemField?: string;
  onChange: (value: unknown) => void;
}

async function uploadFileToServer(file: File, config: IImageUploadConfig): Promise<unknown> {
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

export function ImageUploadField({
  modelValue,
  label = '',
  required = false,
  placeholder = '',
  error = '',
  imageUploadConfig,
  fieldNamePath: fieldNamePathProp,
  dataRepeaterField,
  dataRepeaterIndex,
  dataRepeaterItemField,
  onChange,
}: IImageUploadFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileError, setFileError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputId = useId();

  const fieldNamePath = useMemo(() => {
    if (fieldNamePathProp) {
      return fieldNamePathProp;
    }

    const parsedIndex =
      dataRepeaterIndex === undefined || dataRepeaterIndex === null
        ? undefined
        : typeof dataRepeaterIndex === 'number'
          ? dataRepeaterIndex
          : Number.parseInt(String(dataRepeaterIndex), 10);

    if (
      dataRepeaterField &&
      parsedIndex !== undefined &&
      !Number.isNaN(parsedIndex) &&
      dataRepeaterItemField
    ) {
      return `${dataRepeaterField}[${parsedIndex}].${dataRepeaterItemField}`;
    }

    return '';
  }, [fieldNamePathProp, dataRepeaterField, dataRepeaterIndex, dataRepeaterItemField]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    if (dataRepeaterField) {
      container.dataset.repeaterField = dataRepeaterField;
    } else {
      delete container.dataset.repeaterField;
    }

    if (dataRepeaterIndex !== undefined && dataRepeaterIndex !== null) {
      container.dataset.repeaterIndex = String(dataRepeaterIndex);
    } else {
      delete container.dataset.repeaterIndex;
    }

    if (dataRepeaterItemField) {
      container.dataset.repeaterItemField = dataRepeaterItemField;
    } else {
      delete container.dataset.repeaterItemField;
    }
  }, [dataRepeaterField, dataRepeaterIndex, dataRepeaterItemField]);

  const displayValue = useMemo(() => {
    const value = modelValue;
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value;
    }

    if (typeof value === 'object' && value !== null && 'src' in value) {
      return String((value as { src?: string }).src || '');
    }

    return '';
  }, [modelValue]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const config = imageUploadConfig || {};
    const maxFileSize = config.maxFileSize || 10 * 1024 * 1024;

    if (!file.type.startsWith('image/')) {
      setFileError('Пожалуйста, выберите файл изображения');
      return;
    }

    if (file.size > maxFileSize) {
      setFileError(`Размер файла не должен превышать ${Math.round(maxFileSize / 1024 / 1024)}MB`);
      return;
    }

    setFileError('');
    setIsLoading(true);

    try {
      if (config.uploadUrl) {
        const uploadedUrl = await uploadFileToServer(file, config);
        onChange(uploadedUrl);
      } else {
        const reader = new FileReader();
        reader.addEventListener('load', loadEvent => {
          const result = loadEvent.target?.result as string;
          onChange(result);
        });
        reader.addEventListener('error', () => {
          setFileError('Ошибка при чтении файла');
        });
        reader.readAsDataURL(file);
      }
    } catch (uploadError) {
      if (uploadError instanceof TypeError && uploadError.message === 'Failed to fetch') {
        setFileError('Не удалось подключиться к серверу загрузки. Проверьте, что API доступен.');
      } else {
        setFileError(
          uploadError instanceof Error ? uploadError.message : 'Ошибка при загрузке файла'
        );
      }
      if (config.onUploadError && uploadError instanceof Error) {
        config.onUploadError(uploadError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileError('');
  };

  return (
    <div
      ref={containerRef}
      className={[CSS_CLASSES.IMAGE_UPLOAD_FIELD, error ? CSS_CLASSES.ERROR : '']
        .filter(Boolean)
        .join(' ')}
      data-field-name={fieldNamePath || undefined}
    >
      {label ? (
        <label htmlFor={inputId} className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_LABEL}>
          {label}
          {required ? <span className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_REQUIRED}>*</span> : null}
        </label>
      ) : null}

      {displayValue ? (
        <div className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW}>
          <img
            src={displayValue}
            alt={label || 'Изображение'}
            className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_IMG}
          />
          <button
            type="button"
            className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_CLEAR}
            title="Удалить изображение"
            onClick={clearImage}
          >
            ×
          </button>
        </div>
      ) : null}

      <div className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE}>
        <input
          id={inputId}
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE_INPUT}
          onChange={handleFileChange}
        />
        <label
          htmlFor={inputId}
          className={[
            CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE_LABEL,
            isLoading ? CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE_LABEL_LOADING : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {isLoading ? (
            <span>⏳ Загрузка...</span>
          ) : (
            <span>{displayValue ? 'Изменить файл' : placeholder || 'Выберите изображение'}</span>
          )}
        </label>
        {fileError ? <span className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_ERROR}>{fileError}</span> : null}
      </div>
    </div>
  );
}
