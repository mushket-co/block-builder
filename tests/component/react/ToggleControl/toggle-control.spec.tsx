import { fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ToggleControl } from '../../../../src/react/components/ToggleControl';
import { cleanupReactTestHost, renderWithHost } from '../helpers/renderWithHost';

describe('ToggleControl (React)', () => {
  afterEach(() => {
    cleanupReactTestHost();
  });

  it('renders body slot when modelValue is true', () => {
    const { host } = renderWithHost(
      <ToggleControl modelValue={true} onChange={() => {}} label="Enable section">
        <div className="dependent-field">Dependent</div>
      </ToggleControl>
    );

    expect(host.querySelector('.bb-toggle-control__body')).toBeTruthy();
    expect(screen.getByText('Dependent')).toBeTruthy();
  });

  it('hides body slot when modelValue is false', () => {
    const { host } = renderWithHost(
      <ToggleControl modelValue={false} onChange={() => {}} label="Enable section">
        <div className="dependent-field">Dependent</div>
      </ToggleControl>
    );

    expect(host.querySelector('.bb-toggle-control__body')).toBeNull();
  });

  it('calls onChange when toggled', () => {
    const onChange = vi.fn();
    const { host } = renderWithHost(
      <ToggleControl modelValue={false} onChange={onChange} label="Enable section" />
    );

    fireEvent.click(host.querySelector('.bb-toggle-control__button')!);

    expect(onChange).toHaveBeenCalledWith(true);
  });
});
