import { fireEvent, waitFor } from '@testing-library/react';
import { useRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BlockFormFields } from '../../../../src/react/components/BlockFormFields';
import { UniversalValidator } from '../../../../src/utils/universalValidation';
import { isFieldVisible } from '../../../../src/utils/formFieldHelpers';
import { repeaterBlockType, repeaterToggleBlockType } from '../../../fixtures/minimal-block-configs';
import { cleanupReactTestHost, renderWithHost } from '../helpers/renderWithHost';

function RepeaterFormHarness({
  blockType,
}: {
  blockType: typeof repeaterBlockType | typeof repeaterToggleBlockType;
}) {
  const field = blockType.fields[0];
  const [formData, setFormData] = useState<Record<string, unknown>>({
    [field.field]: field.defaultValue,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const handleSubmit = () => {
    const currentFormData = formDataRef.current;
    const validation = UniversalValidator.validateForm(
      currentFormData,
      blockType.fields,
      (fieldConfig, itemData) => isFieldVisible(fieldConfig, currentFormData, itemData)
    );
    setFormErrors(validation.errors);
  };

  return (
    <div>
      <BlockFormFields
        fields={blockType.fields}
        currentBlockType={blockType}
        formData={formData}
        formErrors={formErrors}
        onFieldChange={(name, value) => setFormData(prev => ({ ...prev, [name]: value }))}
      />
      <button type="button" className="submit-test" onClick={handleSubmit}>
        Submit
      </button>
      <span data-testid="error-count">{Object.keys(formErrors).length}</span>
      <span data-testid="form-has-link">
        {String(
          (formData[field.field] as Array<{ hasLink?: boolean }> | undefined)?.[0]?.hasLink
        )}
      </span>
    </div>
  );
}

describe('BlockFormFields (React)', () => {
  afterEach(() => {
    cleanupReactTestHost();
  });

  it('validator rejects empty linkUrl when hasLink is true in repeater item', () => {
    const formData = { slides: [{ title: 'Slide 1', hasLink: true, linkUrl: '' }] };
    const validation = UniversalValidator.validateForm(
      formData,
      repeaterToggleBlockType.fields,
      (field, itemData) => isFieldVisible(field, formData, itemData)
    );

    expect(validation.isValid).toBe(false);
    expect(Object.keys(validation.errors).length).toBeGreaterThan(0);
  });

  it('validates newly added repeater item', async () => {
    const { host } = renderWithHost(<RepeaterFormHarness blockType={repeaterBlockType} />);

    fireEvent.click(host.querySelector('.bb-repeater-control__add-btn')!);
    fireEvent.click(host.querySelector('.submit-test')!);

    await waitFor(() => {
      expect(Number(host.querySelector('[data-testid="error-count"]')?.textContent)).toBeGreaterThan(
        0
      );
      expect(host.querySelector('.bb-form-errors, .bb-error')).toBeTruthy();
    });
  });

  it('propagates toggle change to formData', async () => {
    const onFieldChange = vi.fn();
    const field = repeaterToggleBlockType.fields[0];

    const { host } = renderWithHost(
      <BlockFormFields
        fields={repeaterToggleBlockType.fields}
        currentBlockType={repeaterToggleBlockType}
        formData={{ [field.field]: field.defaultValue }}
        formErrors={{}}
        onFieldChange={onFieldChange}
      />
    );

    const repeater = host.querySelector('[data-field-name="slides"]')!;
    fireEvent.click(repeater.querySelector('.bb-toggle-control__button')!);

    await waitFor(() => {
      expect(onFieldChange).toHaveBeenCalledWith('slides', [
        { title: 'Slide 1', hasLink: true, linkUrl: '' },
      ]);
    });
  });

  it('validates toggle-dependent repeater field', async () => {
    const { host } = renderWithHost(<RepeaterFormHarness blockType={repeaterToggleBlockType} />);

    const repeater = host.querySelector('[data-field-name="slides"]')!;
    fireEvent.click(repeater.querySelector('.bb-toggle-control__button')!);

    await waitFor(() => {
      expect(repeater.querySelector('.bb-toggle-control__body')).toBeTruthy();
      expect(host.querySelector('[data-testid="form-has-link"]')?.textContent).toBe('true');
    });

    fireEvent.click(host.querySelector('.submit-test')!);

    await waitFor(() => {
      expect(Number(host.querySelector('[data-testid="error-count"]')?.textContent)).toBeGreaterThan(
        0
      );
      expect(host.querySelector('.bb-form-errors, .bb-error')).toBeTruthy();
    });
  });
});
