import { CSS_CLASSES } from '../../utils/constants';
import {
  ALL_SPACING_TYPES,
  DEFAULT_BREAKPOINTS,
  SPACING_LABELS,
  type ISpacingData,
} from '../../utils/spacingHelpers';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface ISpacingBreakpoint {
  name: string;
  label: string;
  maxWidth?: number;
}

interface ISpacingControlProps {
  modelValue?: ISpacingData;
  label?: string;
  fieldName: string;
  spacingTypes?: string[];
  min?: number;
  max?: number;
  step?: number;
  breakpoints?: ISpacingBreakpoint[] | null;
  required?: boolean;
  showPreview?: boolean;
  onChange: (value: ISpacingData) => void;
}

function buildInitialSpacingData(
  breakpoints: ISpacingBreakpoint[],
  spacingTypes: string[],
  modelValue?: ISpacingData
): ISpacingData {
  const initialData: ISpacingData = {};

  breakpoints.forEach(bp => {
    initialData[bp.name] = {};
    spacingTypes.forEach(spacingType => {
      const existingValue = modelValue?.[bp.name]?.[spacingType];
      initialData[bp.name][spacingType] = existingValue !== undefined ? existingValue : 0;
    });
  });

  return initialData;
}

export function SpacingControl({
  modelValue,
  label = 'Отступы',
  fieldName,
  spacingTypes,
  min = 0,
  max = 200,
  step = 1,
  breakpoints,
  required = false,
  showPreview = true,
  onChange,
}: ISpacingControlProps) {
  const allBreakpoints = useMemo(() => {
    if (breakpoints && breakpoints.length > 0) {
      return [...breakpoints];
    }
    return DEFAULT_BREAKPOINTS;
  }, [breakpoints]);

  const availableSpacingTypes = useMemo(() => {
    return spacingTypes && spacingTypes.length > 0 ? spacingTypes : ALL_SPACING_TYPES;
  }, [spacingTypes]);

  const [currentBreakpoint, setCurrentBreakpoint] = useState(() => allBreakpoints[0]?.name ?? '');
  const [spacingData, setSpacingData] = useState<ISpacingData>(() =>
    buildInitialSpacingData(allBreakpoints, availableSpacingTypes, modelValue)
  );
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (modelValue && Object.keys(modelValue).length > 0) {
      setSpacingData({ ...modelValue });
    }
  }, [modelValue]);

  useEffect(() => {
    const currentExists = allBreakpoints.some(bp => bp.name === currentBreakpoint);
    if (!currentExists && allBreakpoints.length > 0) {
      setCurrentBreakpoint(allBreakpoints[0].name);
    }
  }, [allBreakpoints, currentBreakpoint]);

  const getFieldId = (spacingType: string) => {
    return `${fieldName}-${spacingType}-${currentBreakpoint}`;
  };

  const getSpacingLabel = (spacingType: string) => {
    return SPACING_LABELS[spacingType] || spacingType;
  };

  const getSpacingValue = (spacingType: string) => {
    return spacingData?.[currentBreakpoint]?.[spacingType] || 0;
  };

  const updateSpacingValue = useCallback(
    (spacingType: string, value: number) => {
      setSpacingData(prev => {
        const next = { ...prev };
        if (!next[currentBreakpoint]) {
          next[currentBreakpoint] = {};
        }
        next[currentBreakpoint] = { ...next[currentBreakpoint], [spacingType]: value };
        queueMicrotask(() => {
          onChangeRef.current(next);
        });
        return next;
      });
    },
    [currentBreakpoint]
  );

  const handleSpacingChange = (spacingType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10);
    updateSpacingValue(spacingType, value);
  };

  const handleValueInputChange = (spacingType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number.parseInt(event.target.value, 10);

    if (Number.isNaN(value)) {
      value = 0;
    }
    if (value < min) {
      value = min;
    }
    if (value > max) {
      value = max;
    }

    updateSpacingValue(spacingType, value);
  };

  const getCSSVariablesPreview = () => {
    const lines: string[] = [];

    allBreakpoints.forEach(bp => {
      const bpData = spacingData[bp.name] || {};
      const hasValues = Object.values(bpData).some(v => (v as number) > 0);

      if (!hasValues) {
        return;
      }

      if (bp.maxWidth) {
        lines.push(`@media (max-width: ${bp.maxWidth}px) {`);
      }

      availableSpacingTypes.forEach(spacingType => {
        const value = bpData[spacingType];
        if ((value as number) > 0) {
          const varName = `--${fieldName}-${spacingType}`;
          const line = bp.maxWidth ? `  ${varName}: ${value}px;` : `${varName}: ${value}px;`;
          lines.push(line);
        }
      });

      if (bp.maxWidth) {
        lines.push('}');
      }
    });

    return lines.join('\n') || '/* Нет заданных отступов */';
  };

  return (
    <div className={CSS_CLASSES.SPACING_CONTROL}>
      <div className={CSS_CLASSES.SPACING_CONTROL_HEADER}>
        <label className={CSS_CLASSES.SPACING_CONTROL_LABEL}>
          {label}
          {required ? <span className={CSS_CLASSES.REQUIRED}>*</span> : null}
        </label>
      </div>

      <div className={CSS_CLASSES.SPACING_CONTROL_BREAKPOINTS}>
        {allBreakpoints.map(bp => (
          <button
            key={bp.name}
            type="button"
            className={[
              CSS_CLASSES.SPACING_CONTROL_BREAKPOINT_BTN,
              currentBreakpoint === bp.name ? CSS_CLASSES.SPACING_CONTROL_BREAKPOINT_BTN_ACTIVE : '',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => setCurrentBreakpoint(bp.name)}
          >
            {bp.label}
          </button>
        ))}
      </div>

      <div className={CSS_CLASSES.SPACING_CONTROL_GROUPS}>
        {availableSpacingTypes.map(spacingType => (
          <div key={spacingType} className={CSS_CLASSES.SPACING_CONTROL_GROUP}>
            <label htmlFor={getFieldId(spacingType)} className={CSS_CLASSES.SPACING_CONTROL_GROUP_LABEL}>
              {getSpacingLabel(spacingType)}
            </label>

            <div className={CSS_CLASSES.SPACING_CONTROL_SLIDER_WRAPPER}>
              <input
                id={getFieldId(spacingType)}
                type="range"
                className={CSS_CLASSES.SPACING_CONTROL_SLIDER}
                min={min}
                max={max}
                step={step}
                value={getSpacingValue(spacingType)}
                onChange={event => handleSpacingChange(spacingType, event)}
              />
              <input
                type="number"
                className={CSS_CLASSES.SPACING_CONTROL_VALUE_INPUT}
                min={min}
                max={max}
                step={step}
                value={getSpacingValue(spacingType)}
                onChange={event => handleValueInputChange(spacingType, event)}
              />
              <span className={CSS_CLASSES.SPACING_CONTROL_UNIT}>px</span>
            </div>
          </div>
        ))}
      </div>

      {showPreview ? (
        <div className={CSS_CLASSES.SPACING_CONTROL_PREVIEW}>
          <div className={CSS_CLASSES.SPACING_CONTROL_PREVIEW_TITLE}>CSS переменные:</div>
          <pre className={CSS_CLASSES.SPACING_CONTROL_PREVIEW_CODE}>{getCSSVariablesPreview()}</pre>
        </div>
      ) : null}
    </div>
  );
}
