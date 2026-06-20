import { CSS_CLASSES } from '../../../../src/utils/constants';
import { flushPromises } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountBlockBuilder } from '../helpers/mountBlockBuilder';

const hookedBlockType = {
  type: 'hooked',
  label: 'Hooked block',
  fields: [
    { field: 'title', label: 'Title', type: 'text', defaultValue: '' },
    { field: 'internal', label: 'Internal', type: 'text', defaultValue: '' },
  ],
  formHooks: {
    async onFormOpen({ setField }: { setField: (name: string, value: unknown) => void }) {
      setField('title', 'from-open-hook');
    },
    async onBeforeSave({
      formData,
    }: {
      formData: Record<string, unknown>;
    }) {
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

describe('BlockBuilder formHooks', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('onFormOpen hydrates formData before editing', async () => {
    const wrapper = mountBlockBuilder({ blockTypes: [hookedBlockType as any] });

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();
    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();
    await flushPromises();

    expect((wrapper.find('#field-title').element as HTMLInputElement).value).toBe('from-open-hook');

    wrapper.unmount();
  });

  it('onBeforeSave transforms props written to the block', async () => {
    const wrapper = mountBlockBuilder({ blockTypes: [hookedBlockType as any] });

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();
    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();
    await flushPromises();

    await wrapper.find(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`).trigger('click');
    await flushPromises();
    await flushPromises();

    expect(wrapper.find(`.${CSS_CLASSES.BLOCK}`).exists()).toBe(true);
    expect(wrapper.text()).toContain('from-open-hook-saved');
    expect(wrapper.text()).not.toContain('internal');

    wrapper.unmount();
  });

  it('onBeforeSave cancel keeps modal open and does not create block', async () => {
    const cancelBlockType = {
      ...hookedBlockType,
      formHooks: {
        async onBeforeSave() {
          return { props: {}, cancel: true };
        },
      },
    };

    const wrapper = mountBlockBuilder({ blockTypes: [cancelBlockType as any] });

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();
    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();

    await wrapper.find(`.${CSS_CLASSES.MODAL_FOOTER} .${CSS_CLASSES.BTN_PRIMARY}`).trigger('click');
    await flushPromises();
    await flushPromises();

    expect(wrapper.findAll(`.${CSS_CLASSES.BLOCK}`)).toHaveLength(0);
    expect(wrapper.find(`.${CSS_CLASSES.MODAL}`).exists()).toBe(true);

    wrapper.unmount();
  });

  it('onFormOpen error closes modal', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const failingBlockType = {
      ...hookedBlockType,
      formHooks: {
        async onFormOpen() {
          throw new Error('load failed');
        },
      },
    };

    const wrapper = mountBlockBuilder({ blockTypes: [failingBlockType as any] });

    await wrapper.find(`.${CSS_CLASSES.ADD_BLOCK_BTN}`).trigger('click');
    await flushPromises();
    await wrapper.find(`.${CSS_CLASSES.BLOCK_TYPE_CARD}`).trigger('click');
    await flushPromises();
    await flushPromises();

    expect(alertSpy).toHaveBeenCalled();
    expect(wrapper.find(`.${CSS_CLASSES.MODAL}`).exists()).toBe(false);

    wrapper.unmount();
  });
});
