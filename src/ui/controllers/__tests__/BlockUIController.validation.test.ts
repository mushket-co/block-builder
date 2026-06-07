import { CSS_CLASSES, ERROR_RENDER_DELAY_MS, REPEATER_ACCORDION_ANIMATION_DELAY_MS } from '../../../utils/constants';
import * as formErrorHelpers from '../../../utils/formErrorHelpers';
import { BlockManagementUseCase } from '../../../core/use-cases/BlockManagementUseCase';
import { ApiSelectUseCase } from '../../../core/use-cases/ApiSelectUseCase';
import { BlockUIController, IBlockUIControllerConfig } from '../BlockUIController';

jest.mock('../../../utils/copyToClipboard', () => ({
  copyToClipboard: jest.fn().mockResolvedValue(true),
}));

describe('BlockUIController validation flow', () => {
  let controller: BlockUIController;
  let mockUseCase: jest.Mocked<BlockManagementUseCase>;
  let mockApiSelectUseCase: jest.Mocked<ApiSelectUseCase>;
  let container: HTMLDivElement;

  beforeEach(async () => {
    jest.spyOn(formErrorHelpers, 'scrollToFirstError').mockReturnValue(null);

    container = document.createElement('div');
    container.id = 'validation-test-container';
    document.body.appendChild(container);

    mockUseCase = {
      getAllBlocks: jest.fn().mockResolvedValue([]),
      getBlock: jest.fn(),
      createBlock: jest.fn(),
      updateBlock: jest.fn(),
      deleteBlock: jest.fn(),
      duplicateBlock: jest.fn(),
      setBlockLocked: jest.fn(),
      setBlockVisible: jest.fn(),
      reorderBlocks: jest.fn(),
      getComponentRegistry: jest.fn().mockReturnValue({
        get: jest.fn(),
        has: jest.fn(),
      }),
    } as any;

    mockApiSelectUseCase = {
      fetchItems: jest.fn(),
      validateConfig: jest.fn(),
    } as any;

    const config: IBlockUIControllerConfig = {
      containerId: 'validation-test-container',
      blockConfigs: {
        text: {
          title: 'Text block',
          spacingOptions: { enabled: false },
          fields: [
            {
              field: 'content',
              label: 'Content',
              type: 'textarea',
              rules: [{ type: 'required', message: 'Content is required' }],
            },
          ],
        },
        cards: {
          title: 'Cards',
          spacingOptions: { enabled: false },
          fields: [
            {
              field: 'cards',
              label: 'Cards',
              type: 'repeater',
              repeaterConfig: {
                itemTitle: 'Card',
                fields: [
                  {
                    field: 'title',
                    label: 'Title',
                    type: 'text',
                    rules: [{ type: 'required', message: 'Title is required' }],
                  },
                ],
              },
            },
          ],
        },
      },
      useCase: mockUseCase,
      apiSelectUseCase: mockApiSelectUseCase,
    };

    (window as any).blockBuilder = {};
    controller = new BlockUIController(config);
    await controller.init();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    delete (window as any).blockBuilder;
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  test('keeps create modal open and shows errors for empty required field', async () => {
    controller.showAddBlockForm('text');

    const submitButton = document.querySelector('[data-action="submitModal"]') as HTMLButtonElement;
    submitButton.click();
    await Promise.resolve();
    await Promise.resolve();

    expect(mockUseCase.createBlock).not.toHaveBeenCalled();
    expect(document.querySelector(`.${CSS_CLASSES.FORM_ERRORS}[data-field="content"]`)).toBeTruthy();
    expect(document.querySelector(`#block-builder-modal`)).toBeTruthy();
  });

  test('scrolls to first top-level validation error', async () => {
    jest.useFakeTimers();

    controller.showAddBlockForm('text');

    const submitButton = document.querySelector('[data-action="submitModal"]') as HTMLButtonElement;
    submitButton.click();
    await Promise.resolve();

    jest.advanceTimersByTime(ERROR_RENDER_DELAY_MS);
    await Promise.resolve();

    expect(formErrorHelpers.scrollToFirstError).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      { content: ['Content is required'] },
      expect.objectContaining({
        offset: 40,
        behavior: 'smooth',
        autoFocus: true,
      })
    );
  });

  test('expands collapsed repeater item when repeater field has validation error', async () => {
    jest.useFakeTimers();

    const expandItem = jest.fn();
    const mockRenderer = {
      isItemCollapsed: jest.fn().mockReturnValue(true),
      expandItem,
      updateErrors: jest.fn(),
    };

    (controller as any).repeaterRenderers.set('cards', mockRenderer);

    document.body.insertAdjacentHTML(
      'beforeend',
      `
      <div class="${CSS_CLASSES.MODAL_BODY}">
        <div class="${CSS_CLASSES.REPEATER_CONTROL_CONTAINER}" data-field-name="cards">
          <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM}">
            <div class="${CSS_CLASSES.REPEATER_CONTROL_ITEM_FIELDS}"></div>
          </div>
        </div>
      </div>
    `
    );

    (controller as any).handleScrollToFirstError({
      'cards[0].title': ['Title is required'],
    });

    expect(expandItem).toHaveBeenCalledWith(0);

    jest.advanceTimersByTime(REPEATER_ACCORDION_ANIMATION_DELAY_MS + 100 + ERROR_RENDER_DELAY_MS + 100);
    await Promise.resolve();

    expect(mockRenderer.updateErrors).toHaveBeenCalled();
  });
});
