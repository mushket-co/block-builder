import { CSS_CLASSES } from '../../../utils/constants';
import { BlockScrollService } from '../BlockScrollService';

describe('BlockScrollService', () => {
  let service: BlockScrollService;

  beforeEach(() => {
    service = BlockScrollService.getInstance();
    document.body.innerHTML = '';
  });

  test('cancelPending aborts in-flight scrollToBlockWhenReady', async () => {
    const scrollRoot = document.createElement('div');
    scrollRoot.id = 'block-builder-blocks';
    scrollRoot.style.height = '200px';
    scrollRoot.style.overflowY = 'auto';

    const block = document.createElement('div');
    block.className = CSS_CLASSES.BLOCK;
    block.dataset.blockId = 'block-1';
    block.textContent = 'Block';

    scrollRoot.append(block);
    document.body.append(scrollRoot);

    Object.defineProperty(scrollRoot, 'scrollHeight', { value: 500, configurable: true });
    Object.defineProperty(scrollRoot, 'clientHeight', { value: 200, configurable: true });

    const scrollTopSpy = jest.spyOn(scrollRoot, 'scrollTop', 'set');

    const session = service.beginSession();
    const scrollPromise = service.scrollToBlockWhenReady('block-1', { behavior: 'auto' }, session);
    service.cancelPending();

    await scrollPromise;

    expect(scrollTopSpy).not.toHaveBeenCalled();
  });
});
