import { CSS_CLASSES } from '../../../utils/constants';
import { BlockScrollService } from '../BlockScrollService';

describe('BlockScrollService', () => {
  let service: BlockScrollService;

  beforeEach(() => {
    service = BlockScrollService.getInstance();
    document.body.innerHTML = '';
  });

  test('cancelPending aborts in-flight scrollToBlockWhenReady', async () => {
    document.body.innerHTML = `
      <div id="block-builder-blocks">
        <div class="${CSS_CLASSES.BLOCK}" data-block-id="block-1">Block</div>
      </div>
    `;

    const block = document.querySelector(
      `.${CSS_CLASSES.BLOCK}[data-block-id="block-1"]`
    ) as HTMLElement;
    const scrollIntoView = jest.fn();
    block.scrollIntoView = scrollIntoView;

    const session = service.beginSession();
    const scrollPromise = service.scrollToBlockWhenReady('block-1', { behavior: 'auto' }, session);
    service.cancelPending();

    await scrollPromise;

    expect(scrollIntoView).not.toHaveBeenCalled();
  });
});
