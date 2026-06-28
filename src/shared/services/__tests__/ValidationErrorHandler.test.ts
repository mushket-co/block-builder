import { CSS_CLASSES } from '../../../utils/constants';
import { getIconHTML } from '../../../shared/icons/sprite';
import { ValidationErrorHandler } from '../ValidationErrorHandler';

jest.mock('../../../utils/scheduling', () => ({
  afterPaint: jest.fn().mockResolvedValue(undefined),
}));

async function flushValidationHandlerTimers(initialDelay = 350): Promise<void> {
  await jest.advanceTimersByTimeAsync(initialDelay);
  await jest.advanceTimersByTimeAsync(150);
  await jest.advanceTimersByTimeAsync(100);
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
          <div class="${CSS_CLASSES.REPEATER_CONTROL}" data-field-name="categories">
            <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEMS}">
              <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM}">
                <div class="${CSS_CLASSES.REPEATER_CONTROL}" data-field-name="products">
                  <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEMS}">
                    <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM}">
                      <div class="${CSS_CLASSES.REPEATER_CONTROL}" data-field-name="tags">
                        <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEMS}">
                          <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM}"></div>
                          <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM}"></div>
                        </div>
                      </div>
                    </div>
                    <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_COLLAPSED}">
                      <button class="${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_COLLAPSE}">${getIconHTML('chevronDown', 12)}</button>
                    </div>
                  </div>
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

  test('expands triple-nested tag repeater accordion for tag field errors', async () => {
    document.body.innerHTML = `
      <div class="${CSS_CLASSES.MODAL_CONTENT}">
        <div class="${CSS_CLASSES.MODAL_BODY}">
          <div class="${CSS_CLASSES.REPEATER_CONTROL}" data-field-name="categories">
            <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEMS}">
              <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM}">
                <div class="${CSS_CLASSES.REPEATER_CONTROL}" data-field-name="products">
                  <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEMS}">
                    <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM}">
                      <div class="${CSS_CLASSES.REPEATER_CONTROL}" data-field-name="tags">
                        <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEMS}">
                          <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM}"></div>
                          <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM} ${CSS_CLASSES.REPEATER_CONTROL_ITEM_COLLAPSED}">
                            <button class="${CSS_CLASSES.REPEATER_CONTROL_ITEM_BTN_COLLAPSE}">${getIconHTML('chevronDown', 12)}</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
      'categories[0].products[0].tags[1].name': ['Name is required'],
    });

    await flushValidationHandlerTimers();

    expect(clickSpy).toHaveBeenCalled();
    clickSpy.mockRestore();
  });

  test('navigateToValidationError reuses scroll flow with shorter delay', async () => {
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

    await handler.navigateToValidationError({
      'categories[0].name': ['Name is required'],
    });

    jest.advanceTimersByTime(100);
    await Promise.resolve();
    jest.advanceTimersByTime(150);
    await Promise.resolve();
    jest.advanceTimersByTime(100);
    await Promise.resolve();

    expect(expandItem).toHaveBeenCalledWith(0);
  });
});
