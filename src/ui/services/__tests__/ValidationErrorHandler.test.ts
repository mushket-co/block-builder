import { CSS_CLASSES } from '../../../utils/constants';
import { ValidationErrorHandler } from '../ValidationErrorHandler';

async function flushValidationHandlerTimers(initialDelay = 350): Promise<void> {
  jest.advanceTimersByTime(initialDelay);
  await Promise.resolve();
  jest.advanceTimersByTime(150);
  await Promise.resolve();
  jest.advanceTimersByTime(100);
  await Promise.resolve();
}

describe('ValidationErrorHandler', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    document.body.innerHTML = '';
  });

  test('expands collapsed repeater item for top-level repeater errors', async () => {
    document.body.innerHTML = `
      <div class="${CSS_CLASSES.MODAL_CONTENT}">
        <div class="${CSS_CLASSES.MODAL_BODY}">
          <div class="${CSS_CLASSES.FORM_GROUP} ${CSS_CLASSES.ERROR}">
            <span class="${CSS_CLASSES.ERROR}">Required</span>
          </div>
        </div>
      </div>
    `;

    const expandItem = jest.fn();
    const handler = new ValidationErrorHandler(
      new Map([
        [
          'categories',
          {
            isItemCollapsed: () => true,
            expandItem,
          },
        ],
      ])
    );

    await handler.handleValidationErrors({
      'categories[0].name': ['Name is required'],
    });

    await flushValidationHandlerTimers();

    expect(expandItem).toHaveBeenCalledWith(0);
  });

  test('expands nested repeater accordion for nested field errors', async () => {
    document.body.innerHTML = `
      <div class="${CSS_CLASSES.MODAL_CONTENT}">
        <div class="${CSS_CLASSES.MODAL_BODY}">
          <div data-field-name="categories">
            <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM}">
              <div data-field-name="products">
                <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM}">
                  <button class="${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_COLLAPSE}">▼</button>
                </div>
                <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_COLLAPSED}">
                  <button class="${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_COLLAPSE}">▼</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const clickSpy = jest.spyOn(HTMLElement.prototype, 'click');
    const handler = new ValidationErrorHandler(
      new Map([
        [
          'categories',
          {
            isItemCollapsed: () => false,
            expandItem: jest.fn(),
          },
        ],
      ])
    );

    await handler.handleValidationErrors({
      'categories[0].products[1].title': ['Title is required'],
    });

    await flushValidationHandlerTimers();

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });
});
