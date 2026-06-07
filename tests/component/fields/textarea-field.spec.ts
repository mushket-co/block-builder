import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import TextareaField from '../../../src/ui/components/form-fields/TextareaField.vue';

describe('TextareaField', () => {
  it('renders label and emits value on input', async () => {
    const wrapper = mount(TextareaField, {
      props: {
        fieldId: 'field-content',
        label: 'Content',
        modelValue: '',
        required: true,
      },
    });

    expect(wrapper.find('label').text()).toContain('Content');
    expect(wrapper.find('textarea').element.id).toBe('field-content');

    await wrapper.find('textarea').setValue('Test value');

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Test value']);
  });
});
