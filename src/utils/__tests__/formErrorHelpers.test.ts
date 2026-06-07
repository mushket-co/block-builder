import { CSS_CLASSES } from '../constants';
import {
  findFieldElement,
  getFirstErrorKey,
  parseErrorKey,
  scrollToFirstError,
} from '../formErrorHelpers';

jest.mock('../scrollHelpers', () => ({
  scrollToElement: jest.fn(),
}));

import { scrollToElement } from '../scrollHelpers';

describe('formErrorHelpers', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('parseErrorKey', () => {
    test('returns flat field info for simple keys', () => {
      expect(parseErrorKey('title')).toEqual({
        fieldKey: 'title',
        isRepeaterField: false,
      });
    });

    test('parses top-level repeater field path', () => {
      expect(parseErrorKey('items[0].title')).toEqual({
        fieldKey: 'items[0].title',
        isRepeaterField: true,
        repeaterFieldName: 'items',
        repeaterIndex: 0,
        nestedFieldName: 'title',
        nestedPath: 'title',
      });
    });

    test('parses nested repeater field path', () => {
      expect(parseErrorKey('categories[0].products[1].name')).toEqual({
        fieldKey: 'categories[0].products[1].name',
        isRepeaterField: true,
        repeaterFieldName: 'categories',
        repeaterIndex: 0,
        nestedFieldName: 'products',
        nestedPath: 'products[1].name',
      });
    });
  });

  describe('getFirstErrorKey', () => {
    test('returns null for empty errors', () => {
      expect(getFirstErrorKey({})).toBeNull();
    });

    test('prefers top-level fields over repeater fields', () => {
      const firstKey = getFirstErrorKey({
        'items[0].title': ['Required'],
        title: ['Required'],
      });

      expect(firstKey).toBe('title');
    });

    test('sorts nested repeater paths deterministically', () => {
      const firstKey = getFirstErrorKey({
        'categories[1].products[0].name': ['Required'],
        'categories[0].products[1].name': ['Required'],
      });

      expect(firstKey).toBe('categories[0].products[1].name');
    });
  });

  describe('findFieldElement', () => {
    test('finds flat field by data-field-name', () => {
      document.body.innerHTML = `
        <div class="container">
          <div class="${CSS_CLASSES.FORM_GROUP}" data-field-name="title">
            <input name="title" />
          </div>
        </div>
      `;

      const container = document.body.querySelector('.container') as HTMLElement;
      const element = findFieldElement(container, parseErrorKey('title'));

      expect(element?.dataset.fieldName).toBe('title');
    });

    test('finds repeater item field by full path', () => {
      document.body.innerHTML = `
        <div class="container">
          <div class="${CSS_CLASSES.REPEATER_CONTROL_CONTAINER}" data-field-name="items">
            <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM}">
              <div class="${CSS_CLASSES.FORM_GROUP}" data-field-name="items[0].title">
                <input name="items[0].title" />
              </div>
            </div>
          </div>
        </div>
      `;

      const container = document.body.querySelector('.container') as HTMLElement;
      const element = findFieldElement(container, parseErrorKey('items[0].title'));

      expect(element?.dataset.fieldName).toBe('items[0].title');
    });

    test('finds nested repeater field inside parent item', () => {
      document.body.innerHTML = `
        <div class="container">
          <div data-field-name="categories">
            <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM}">
              <div class="${CSS_CLASSES.REPEATER_CONTROL_CONTAINER}" data-field-name="categories[0].products">
                <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM}">
                  <div class="${CSS_CLASSES.FORM_GROUP}" data-field-name="name">
                    <input name="name" />
                  </div>
                </div>
                <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM}">
                  <div class="${CSS_CLASSES.FORM_GROUP}" data-field-name="name">
                    <input name="name" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

      const container = document.body.querySelector('.container') as HTMLElement;
      const element = findFieldElement(
        container,
        parseErrorKey('categories[0].products[1].name')
      );

      expect(element).toBeTruthy();
    });
  });

  describe('scrollToFirstError', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    test('returns parsed info for the first error key', () => {
      const container = document.createElement('div');

      const result = scrollToFirstError(container, { title: ['Required'] });

      expect(result).toEqual(parseErrorKey('title'));
    });

    test('delegates scroll to scrollHelpers.scrollToElement', () => {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="${CSS_CLASSES.FORM_GROUP} ${CSS_CLASSES.ERROR}" data-field-name="title">
          <input name="title" />
        </div>
      `;

      scrollToFirstError(
        container,
        { title: ['Required'] },
        { behavior: 'auto', autoFocus: false, scrollContainer: container }
      );

      jest.advanceTimersByTime(300);

      expect(scrollToElement).toHaveBeenCalled();
    });
  });
});
