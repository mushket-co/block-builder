import { CSS_CLASSES } from '../../../../src/utils/constants';
import { fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { cleanupReactTestHost, renderBlockBuilder } from '../helpers/renderBlockBuilder';

const hookedBlockType = {
  type: 'hooked',
  label: 'Hooked block',
  fields: [
    { field: 'title', label: 'Title', type: 'text', defaultValue: '' },
    { field: 'internal', label: 'Internal', type: 'text', defaultValue: '' },
  ],
  defaultSettings: {},
  defaultProps: { title: '', internal: '' },
  formHooks: {
    async onFormOpen({ setField }: { setField: (name: string, value: unknown) => void }) {
      setField('title', 'from-open-hook');
    },
    async onBeforeSave({ formData }: { formData: Record<string, unknown> }) {
      const { internal, ...rest } = formData;
      return {
        props: {
          ...rest,
          title: `${String(formData.title)}-saved`,
        },
      };
    },
  },
};

describe('BlockBuilder formHooks (React)', () => {
  afterEach(() => {
    cleanupReactTestHost();
    vi.restoreAllMocks();
  });

  it('onFormOpen hydrates formData before editing', async () => {
    const { host } = renderBlockBuilder({ blockTypes: [hookedBlockType as any] });

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.ADD_BLOCK_BTN}`)!);
    fireEvent.click(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`)!);

    await waitFor(() => {
      const input = host.querySelector('#field-title') as HTMLInputElement;
      expect(input?.value).toBe('from-open-hook');
    });
  });

  it('onBeforeSave transforms props written to the block', async () => {
    const { host } = renderBlockBuilder({ blockTypes: [hookedBlockType as any] });

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.ADD_BLOCK_BTN}`)!);
    fireEvent.click(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`)!);

    await waitFor(() => {
      expect((host.querySelector('#field-title') as HTMLInputElement)?.value).toBe('from-open-hook');
    });

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`)!);

    await waitFor(() => {
      expect(host.querySelectorAll(`.${CSS_CLASSES.BLOCK}`)).toHaveLength(1);
      expect(host.textContent).toContain('from-open-hook-saved');
    });
  });

  it('onBeforeSave cancel keeps modal open', async () => {
    const cancelBlockType = {
      ...hookedBlockType,
      formHooks: {
        async onBeforeSave() {
          return { props: {}, cancel: true };
        },
      },
    };

    const { host } = renderBlockBuilder({ blockTypes: [cancelBlockType as any] });

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.ADD_BLOCK_BTN}`)!);
    fireEvent.click(host.querySelector(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`)!);

    await waitFor(() => {
      expect(host.querySelector(`.${CSS_CLASSES.MODAL}`)).toBeTruthy();
    });

    fireEvent.click(host.querySelector(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`)!);

    await waitFor(() => {
      expect(host.querySelectorAll(`.${CSS_CLASSES.BLOCK}`)).toHaveLength(0);
      expect(host.querySelector(`.${CSS_CLASSES.MODAL}`)).toBeTruthy();
    });
  });
});
