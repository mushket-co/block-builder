import type { IFormData } from '../../core/types/common';
import type { IFormFieldConfig, IRepeaterItemFieldConfig } from '../../core/types/form';
import { UniversalValidator } from '../universalValidation';
import {
  applyFormErrors,
  ReactiveFormValidationTracker,
} from '../reactiveFormValidation';

describe('ReactiveFormValidationTracker', () => {
  const fields: IFormFieldConfig[] = [
    {
      field: 'title',
      type: 'text',
      label: 'Title',
      rules: [{ type: 'required', message: 'Required' }],
    },
    {
      field: 'subtitle',
      type: 'text',
      label: 'Subtitle',
      rules: [{ type: 'required', message: 'Required' }],
    },
  ];

  test('does not revalidate before touch', () => {
    const tracker = new ReactiveFormValidationTracker();
    const formData: IFormData = { title: '', subtitle: '' };

    expect(tracker.revalidateIfTouched(formData, fields)).toBeNull();
  });

  test('revalidates entire form after touch', () => {
    const tracker = new ReactiveFormValidationTracker();
    tracker.touch();

    const firstPass = tracker.revalidateIfTouched({ title: '', subtitle: '' }, fields);
    expect(firstPass).toEqual({
      title: ['Required'],
      subtitle: ['Required'],
    });

    const secondPass = tracker.revalidateIfTouched({ title: 'Hello', subtitle: '' }, fields);
    expect(secondPass).toEqual({
      subtitle: ['Required'],
    });
  });

  test('reset disables reactive validation', () => {
    const tracker = new ReactiveFormValidationTracker();
    tracker.touch();
    tracker.reset();

    expect(tracker.revalidateIfTouched({ title: '', subtitle: '' }, fields)).toBeNull();
  });

  test('applyFormErrors replaces target errors object', () => {
    const target: Record<string, string[]> = {
      title: ['Old error'],
      stale: ['Should be removed'],
    };

    applyFormErrors(target, {
      subtitle: ['Required'],
    });

    expect(target).toEqual({
      subtitle: ['Required'],
    });
  });

  test('respects dependsOn visibility during reactive revalidation', () => {
    const tracker = new ReactiveFormValidationTracker();
    tracker.touch();

    const dependentFields: IFormFieldConfig[] = [
      {
        field: 'enabled',
        type: 'checkbox',
        label: 'Enabled',
      },
      {
        field: 'note',
        type: 'text',
        label: 'Note',
        dependsOn: { field: 'enabled', value: true },
        rules: [{ type: 'required', message: 'Required' }],
      },
    ];

    const errors = tracker.revalidateIfTouched(
      { enabled: false, note: '' },
      dependentFields,
      (field, itemData) => {
        const data = (itemData || { enabled: false }) as Record<string, unknown>;
        if (!field.dependsOn) {
          return true;
        }
        return data[field.dependsOn.field] === field.dependsOn.value;
      }
    );

    expect(errors).toEqual({});
  });
});
