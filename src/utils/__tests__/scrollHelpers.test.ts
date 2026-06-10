import { CSS_CLASSES } from '../constants';
import { getScrollContainer, scrollToElement } from '../scrollHelpers';

describe('scrollHelpers', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('getScrollContainer', () => {
    test('находит ближайший overflow-контейнер', () => {
      document.body.innerHTML = `
        <div id="scroll-root" style="height: 200px; overflow-y: auto;">
          <div id="child">Content</div>
        </div>
      `;

      const child = document.getElementById('child') as HTMLElement;
      const container = getScrollContainer(child);

      expect(container?.id).toBe('scroll-root');
    });
  });

  describe('scrollToElement', () => {
    test('prefers explicit scroll container over auto-detected parent', async () => {
      const outer = document.createElement('div');
      outer.style.height = '200px';
      outer.style.overflowY = 'auto';

      const inner = document.createElement('div');
      inner.style.height = '200px';
      inner.style.overflowY = 'auto';

      const block = document.createElement('div');
      block.textContent = 'Block';

      inner.append(block);
      outer.append(inner);
      document.body.append(outer);

      Object.defineProperty(outer, 'scrollHeight', { value: 500, configurable: true });
      Object.defineProperty(outer, 'clientHeight', { value: 200, configurable: true });
      Object.defineProperty(inner, 'scrollHeight', { value: 500, configurable: true });
      Object.defineProperty(inner, 'clientHeight', { value: 200, configurable: true });

      const outerSpy = jest.spyOn(outer, 'scrollTop', 'set');
      const innerSpy = jest.spyOn(inner, 'scrollTop', 'set');

      await scrollToElement(block, { behavior: 'auto', container: inner, offset: 10 });

      expect(innerSpy).toHaveBeenCalled();
      expect(outerSpy).not.toHaveBeenCalled();
    });
  });
});
