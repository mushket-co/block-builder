import { useEffect, useRef, useState } from 'react';

import type { ICustomFieldRendererRegistry } from '../../core/ports/CustomFieldRenderer';
import type { IFormFieldConfig } from '../../core/types/form';
import { CSS_CLASSES } from '../../utils/constants';
import { getFieldError } from '../../utils/formFieldHelpers';

interface ICustomFieldRendererInstance {
  destroy?: () => void;
  setValue?: (value: unknown) => void;
  getValue?: () => unknown;
  setError?: (error: string | null) => void;
}

interface ICustomFieldProps {
  field: IFormFieldConfig;
  modelValue?: unknown;
  formErrors?: Record<string, string[]>;
  customFieldRendererRegistry?: ICustomFieldRendererRegistry;
  isFieldRequired?: (field: IFormFieldConfig) => boolean;
  onChange: (value: unknown) => void;
}

export function CustomField({
  field,
  modelValue,
  formErrors = {},
  customFieldRendererRegistry,
  isFieldRequired,
  onChange,
}: ICustomFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererInstanceRef = useRef<ICustomFieldRendererInstance | null>(null);
  const onChangeRef = useRef(onChange);
  const isFieldRequiredRef = useRef(isFieldRequired);
  const fieldRef = useRef(field);
  const formErrorsRef = useRef(formErrors);
  const [initError, setInitError] = useState<string | null>(null);

  const rendererId = field.customFieldConfig?.rendererId || '';
  const fieldName = field.field;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    isFieldRequiredRef.current = isFieldRequired;
  }, [isFieldRequired]);

  useEffect(() => {
    fieldRef.current = field;
  }, [field]);

  useEffect(() => {
    formErrorsRef.current = formErrors;
  }, [formErrors]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !customFieldRendererRegistry || !rendererId) {
      return;
    }

    const renderer = customFieldRendererRegistry.get(rendererId);
    if (!renderer) {
      setInitError(`Рендерер "${rendererId}" не зарегистрирован`);
      return;
    }

    let cancelled = false;
    setInitError(null);

    const initializeRenderer = async () => {
      const currentField = fieldRef.current;
      const fieldError = getFieldError(currentField, formErrorsRef.current);

      const context = {
        fieldName: currentField.field,
        label: currentField.label,
        value: modelValue ?? currentField.defaultValue,
        required: isFieldRequiredRef.current?.(currentField) ?? false,
        options: currentField.customFieldConfig?.options,
        error: fieldError || undefined,
        onChange: (newValue: unknown) => {
          onChangeRef.current(newValue);
        },
        onError: (error: string | null) => {
          setInitError(error);
        },
      };

      try {
        const instance = await renderer.render(container, context);
        if (cancelled) {
          instance?.destroy?.();
          return;
        }

        if (rendererInstanceRef.current?.destroy) {
          rendererInstanceRef.current.destroy();
        }
        rendererInstanceRef.current = instance;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Ошибка инициализации кастомного поля';
        setInitError(message);
        console.error(`[CustomField] ${fieldName}:`, error);
      }
    };

    void initializeRenderer();

    return () => {
      cancelled = true;
      const instance = rendererInstanceRef.current;
      rendererInstanceRef.current = null;
      if (instance?.destroy) {
        queueMicrotask(() => {
          instance.destroy?.();
        });
      }
    };
  }, [fieldName, rendererId, customFieldRendererRegistry]);

  useEffect(() => {
    const instance = rendererInstanceRef.current;
    const fieldError = getFieldError(field, formErrors);
    if (instance?.setError) {
      instance.setError(fieldError || null);
    }
  }, [field, formErrors]);

  useEffect(() => {
    const instance = rendererInstanceRef.current;
    if (instance?.setValue && modelValue !== undefined) {
      try {
        const currentValue = instance.getValue ? instance.getValue() : undefined;
        if (currentValue !== modelValue) {
          instance.setValue(modelValue);
        }
      } catch (error) {
        console.warn(`[CustomField] setValue failed for "${fieldName}":`, error);
      }
    }
  }, [fieldName, modelValue]);

  if (initError) {
    return (
      <div className={CSS_CLASSES.CUSTOM_FIELD_CONTAINER}>
        <div className={CSS_CLASSES.BB_ERROR_BOX}>❌ {initError}</div>
      </div>
    );
  }

  return <div ref={containerRef} className={CSS_CLASSES.CUSTOM_FIELD_CONTAINER} />;
}
