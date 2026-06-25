import { CSS_CLASSES } from '../constants';
import { countValidationErrors, focusElement } from '../formErrorHelpers';

describe('formErrorHelpers', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('countValidationErrors', () => {
    test('returns 0 for empty errors', () => {
      expect(countValidationErrors({})).toBe(0);
    });

    test('sums all field error messages', () => {
      expect(
        countValidationErrors({
          title: ['Required'],
          items: ['Too few', 'Invalid format'],
        })
      ).toBe(3);
    });
  });

  describe('focusElement', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    test('focuses input inside form group', () => {
      document.body.innerHTML = `
        <div class="form-group">
          <input type="text" />
        </div>
      `;
      const group = document.querySelector('.form-group') as HTMLElement;
      const input = group.querySelector('input') as HTMLInputElement;
      const focusSpy = jest.spyOn(input, 'focus');

      focusElement(group);
      jest.advanceTimersByTime(300);

      expect(focusSpy).toHaveBeenCalled();
      expect(input.classList.contains('field-error-highlight')).toBe(true);
    });

    test('highlights image upload field without focusing', () => {
      document.body.innerHTML = `<div class="${CSS_CLASSES.IMAGE_UPLOAD_FIELD}"></div>`;
      const field = document.querySelector(`.${CSS_CLASSES.IMAGE_UPLOAD_FIELD}`) as HTMLElement;

      focusElement(field);
      jest.advanceTimersByTime(300);

      expect(field.classList.contains(CSS_CLASSES.ERROR)).toBe(true);
      expect(field.classList.contains('field-error-highlight')).toBe(true);
    });
  });
});
