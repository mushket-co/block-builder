import type { IBlockAnchorConfig } from '../../core/types/form';
import { CSS_CLASSES } from '../../utils/constants';
import {
  buildBlockAnchorOptions,
  isBlockAnchorHash,
} from '../../utils/blockAnchorHelpers';
import { useMemo } from 'react';

import { useBlockAnchorContext } from '../context/blockAnchorContext';
import { useUiStrings } from '../context/uiStringsContext';
import { CustomDropdown } from './CustomDropdown';

interface IBlockAnchorFieldProps {
  fieldId: string;
  modelValue?: string;
  label?: string;
  required?: boolean;
  error?: string;
  showLabel?: boolean;
  blockAnchorConfig?: IBlockAnchorConfig;
  onChange: (value: string) => void;
}

export function BlockAnchorField({
  fieldId,
  modelValue = '',
  label = '',
  required = false,
  error = '',
  showLabel = true,
  blockAnchorConfig,
  onChange,
}: IBlockAnchorFieldProps) {
  const uiStrings = useUiStrings();
  const anchorContext = useBlockAnchorContext();
  const allowCustomUrl = blockAnchorConfig?.allowCustomUrl === true;

  const blockOptions = useMemo(
    () =>
      buildBlockAnchorOptions(anchorContext, blockAnchorConfig).map((option: { value: string; label: string }) => ({
        value: option.value,
        label: option.label,
        disabled: false,
      })),
    [anchorContext, blockAnchorConfig]
  );

  const knownBlockIds = useMemo(
    () => new Set(anchorContext.blocks.map(block => block.id)),
    [anchorContext.blocks]
  );

  const value = String(modelValue ?? '');
  const selectedBlockValue = isBlockAnchorHash(value, knownBlockIds) ? value : null;
  const customUrlValue = !value || isBlockAnchorHash(value, knownBlockIds) ? '' : value;

  const dropdownPlaceholder = blockAnchorConfig?.placeholder || uiStrings.blockAnchorPlaceholder;

  return (
    <>
      {showLabel ? (
        <label htmlFor={fieldId} className={CSS_CLASSES.FORM_LABEL}>
          {label}
          {required ? <span className={CSS_CLASSES.REQUIRED}>*</span> : null}
        </label>
      ) : null}

      <CustomDropdown
        modelValue={selectedBlockValue}
        options={blockOptions}
        placeholder={dropdownPlaceholder}
        clearable
        invalid={Boolean(error)}
        onChange={nextValue => {
          if (nextValue === null || nextValue === '') {
            onChange(allowCustomUrl ? customUrlValue : '');
            return;
          }
          onChange(String(nextValue));
        }}
      />

      {allowCustomUrl ? (
        <input
          id={fieldId}
          type="text"
          className={`${CSS_CLASSES.FORM_CONTROL} ${CSS_CLASSES.BLOCK_ANCHOR_CUSTOM}`}
          value={customUrlValue}
          placeholder={uiStrings.blockAnchorCustomUrlPlaceholder}
          onChange={event => onChange(event.target.value)}
        />
      ) : null}
    </>
  );
}
