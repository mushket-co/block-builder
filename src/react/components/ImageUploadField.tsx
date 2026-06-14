import { useEffect, useId, useMemo, useRef, useState } from 'react';

import type { IFileUploadConfig } from '../../core/types/form';
import { CSS_CLASSES } from '../../utils/constants';
import { Icon } from './icons/Icon';
import {
  canAddUploadItems,
  getDefaultAccept,
  getFileExtensionBadge,
  getFileNameFromUrl,
  getMaxUploadCountErrorMessage,
  getUploadUrl,
  normalizeUploadItems,
  partitionFilesForUpload,
  processUploadFile,
  resolveUploadConfig,
  serializeUploadValue,
  type TUploadFieldVariant,
} from '../../utils/uploadFieldUtils';

interface IImageUploadFieldProps {
  modelValue?: unknown;
  label?: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  variant?: TUploadFieldVariant;
  multiple?: boolean;
  fileUploadConfig?: IFileUploadConfig;
  fieldNamePath?: string;
  dataRepeaterField?: string;
  dataRepeaterIndex?: number | string;
  dataRepeaterItemField?: string;
  onChange: (value: unknown) => void;
}

export function ImageUploadField({
  modelValue,
  label = '',
  required = false,
  placeholder = '',
  error = '',
  variant = 'image',
  multiple = false,
  fileUploadConfig,
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

  const uploadConfig = useMemo(() => resolveUploadConfig({ fileUploadConfig }), [fileUploadConfig]);

  const isMultiple = multiple;
  const isFileVariant = variant === 'file';
  const accept = getDefaultAccept(variant, uploadConfig);
  const items = useMemo(() => normalizeUploadItems(modelValue, isMultiple), [modelValue, isMultiple]);
  const singleDisplayValue = items[0] || '';
  const canAddMore = canAddUploadItems(items, uploadConfig, isMultiple);

  const chooseButtonLabel = placeholder || (isFileVariant ? 'Выберите файл' : 'Выберите изображение');
  const changeButtonLabel = isFileVariant ? 'Заменить файл' : 'Изменить изображение';
  const addButtonLabel = isFileVariant ? 'Добавить файл' : 'Добавить';

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

  const emitValue = (nextItems: string[]) => {
    onChange(serializeUploadValue(nextItems, isMultiple));
  };

  const clearValue = () => {
    emitValue([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileError('');
  };

  const removeItem = (index: number) => {
    emitValue(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (!selectedFiles.length) {
      return;
    }

    const { filesToUpload, maxCountExceeded, maxCount } = partitionFilesForUpload(
      selectedFiles,
      items.length,
      uploadConfig,
      isMultiple
    );

    if (!filesToUpload.length) {
      if (maxCountExceeded) {
        setFileError(getMaxUploadCountErrorMessage(maxCount));
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setFileError('');
    setIsLoading(true);

    try {
      const uploadedItems: string[] = [];

      for (const file of filesToUpload) {
        const result = await processUploadFile(file, uploadConfig, variant);
        const url = getUploadUrl(result);
        if (url) {
          uploadedItems.push(url);
        }
      }

      if (!uploadedItems.length) {
        return;
      }

      if (isMultiple) {
        emitValue([...items, ...uploadedItems]);
      } else {
        emitValue([uploadedItems[0]]);
      }

      if (maxCountExceeded) {
        setFileError(getMaxUploadCountErrorMessage(maxCount));
      }
    } catch (uploadError) {
      if (uploadError instanceof TypeError && uploadError.message === 'Failed to fetch') {
        setFileError('Не удалось подключиться к серверу загрузки. Проверьте, что API доступен.');
      } else {
        setFileError(
          uploadError instanceof Error ? uploadError.message : 'Ошибка при загрузке файла'
        );
      }
      if (uploadConfig.onUploadError && uploadError instanceof Error) {
        uploadConfig.onUploadError(uploadError);
      }
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (isFileVariant) {
    return (
      <div
        ref={containerRef}
        className={[
          CSS_CLASSES.FILE_UPLOAD_FIELD,
          error ? CSS_CLASSES.ERROR : '',
          isMultiple ? CSS_CLASSES.FILE_UPLOAD_FIELD_MULTIPLE : '',
        ]
          .filter(Boolean)
          .join(' ')}
        data-field-name={fieldNamePath || undefined}
        data-upload-variant="file"
        data-upload-multiple={isMultiple ? 'true' : 'false'}
      >
        {label ? (
          <label htmlFor={inputId} className={CSS_CLASSES.FILE_UPLOAD_FIELD_LABEL}>
            {label}
            {required ? <span className={CSS_CLASSES.FILE_UPLOAD_FIELD_REQUIRED}>*</span> : null}
          </label>
        ) : null}

        {isMultiple && items.length ? (
          <ul className={CSS_CLASSES.FILE_UPLOAD_FIELD_LIST}>
            {items.map((itemUrl, index) => (
              <li key={`${itemUrl}-${index}`} className={CSS_CLASSES.FILE_UPLOAD_FIELD_ROW}>
                <span className={CSS_CLASSES.FILE_UPLOAD_FIELD_BADGE}>
                  {getFileExtensionBadge(itemUrl)}
                </span>
                <a
                  href={itemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={CSS_CLASSES.FILE_UPLOAD_FIELD_NAME}
                >
                  {getFileNameFromUrl(itemUrl)}
                </a>
                <button
                  type="button"
                  className={CSS_CLASSES.FILE_UPLOAD_FIELD_REMOVE}
                  title="Удалить"
                  onClick={() => removeItem(index)}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {!isMultiple && singleDisplayValue ? (
          <div className={CSS_CLASSES.FILE_UPLOAD_FIELD_ROW}>
            <span className={CSS_CLASSES.FILE_UPLOAD_FIELD_BADGE}>
              {getFileExtensionBadge(singleDisplayValue)}
            </span>
            <a
              href={singleDisplayValue}
              target="_blank"
              rel="noopener noreferrer"
              className={CSS_CLASSES.FILE_UPLOAD_FIELD_NAME}
            >
              {getFileNameFromUrl(singleDisplayValue)}
            </a>
            <button
              type="button"
              className={CSS_CLASSES.FILE_UPLOAD_FIELD_REMOVE}
              title="Удалить файл"
              onClick={clearValue}
            >
              Удалить
            </button>
          </div>
        ) : null}

        <div className={CSS_CLASSES.FILE_UPLOAD_FIELD_PICKER}>
          <input
            id={inputId}
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={isMultiple}
            className={CSS_CLASSES.FILE_UPLOAD_FIELD_INPUT}
            onChange={handleFileChange}
          />
          {!isMultiple || canAddMore ? (
            <label
              htmlFor={inputId}
              className={[
                CSS_CLASSES.BTN,
                CSS_CLASSES.BTN_OUTLINE,
                isLoading ? CSS_CLASSES.BTN_LOADING : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isLoading ? (
                '⏳ Загрузка...'
              ) : isMultiple ? (
                `+ ${addButtonLabel}`
              ) : singleDisplayValue ? (
                changeButtonLabel
              ) : (
                chooseButtonLabel
              )}
            </label>
          ) : null}
          {fileError ? <span className={CSS_CLASSES.FILE_UPLOAD_FIELD_ERROR}>{fileError}</span> : null}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={[
        CSS_CLASSES.IMAGE_UPLOAD_FIELD,
        error ? CSS_CLASSES.ERROR : '',
        isMultiple ? CSS_CLASSES.IMAGE_UPLOAD_FIELD_MULTIPLE : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-field-name={fieldNamePath || undefined}
      data-upload-variant="image"
      data-upload-multiple={isMultiple ? 'true' : 'false'}
    >
      {label ? (
        <label htmlFor={inputId} className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_LABEL}>
          {label}
          {required ? <span className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_REQUIRED}>*</span> : null}
        </label>
      ) : null}

      {isMultiple ? (
        <div className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_GALLERY}>
          {items.map((itemUrl, index) => (
            <div key={`${itemUrl}-${index}`} className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_GALLERY_ITEM}>
              <img
                src={itemUrl}
                alt={label || 'Изображение'}
                className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_IMG}
              />
              <button
                type="button"
                className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_CLEAR}
                title="Удалить"
                onClick={() => removeItem(index)}
              >
                <Icon name="close" width={14} height={14} />
              </button>
            </div>
          ))}

          {canAddMore ? (
            <label
              htmlFor={inputId}
              className={[
                CSS_CLASSES.IMAGE_UPLOAD_FIELD_GALLERY_ADD,
                isLoading ? CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE_LABEL_LOADING : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isLoading ? <span>⏳ Загрузка...</span> : <span>+ {addButtonLabel}</span>}
            </label>
          ) : null}
        </div>
      ) : null}

      {!isMultiple && singleDisplayValue ? (
        <div className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW}>
          <img
            src={singleDisplayValue}
            alt={label || 'Изображение'}
            className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_IMG}
          />
          <button
            type="button"
            className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_PREVIEW_CLEAR}
            title="Удалить изображение"
            onClick={clearValue}
          >
            <Icon name="close" width={14} height={14} />
          </button>
        </div>
      ) : null}

      <div className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE}>
        <input
          id={inputId}
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={isMultiple}
          className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_FILE_INPUT}
          onChange={handleFileChange}
        />
        {!isMultiple ? (
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
              <span>{singleDisplayValue ? changeButtonLabel : chooseButtonLabel}</span>
            )}
          </label>
        ) : null}
        {fileError ? <span className={CSS_CLASSES.IMAGE_UPLOAD_FIELD_ERROR}>{fileError}</span> : null}
      </div>
    </div>
  );
}
