import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TextareaField } from '../../../../src/react/components/form-fields/TextareaField';
import { cleanupReactTestHost, renderWithHost } from '../helpers/renderWithHost';

describe('TextareaField (React)', () => {
  afterEach(() => {
    cleanupReactTestHost();
  });

  it('renders label and calls onChange on input', () => {
    const onChange = vi.fn();

    renderWithHost(
      <TextareaField
        fieldId="field-content"
        label="Content"
        modelValue=""
        required={true}
        onChange={onChange}
      />
    );

    expect(screen.getByText('Content')).toBeTruthy();
    expect(screen.getByRole('textbox').id).toBe('field-content');

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Test value' } });

    expect(onChange).toHaveBeenCalledWith('Test value');
  });
});
