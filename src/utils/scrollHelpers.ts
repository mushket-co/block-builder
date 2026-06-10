import { afterPaint, waitForLayoutStable, waitForScrollSettled } from './scheduling';
import { CSS_CLASSES } from './constants';

export function getBlocksLayoutRoot(): HTMLElement | null {
  return (
    document.querySelector(`#block-builder-blocks`) ??
    document.querySelector(`.${CSS_CLASSES.BLOCKS}`)
  ) as HTMLElement | null;
}

export function getBlockScrollMargins(options: {
  controlsFixedPosition?: 'top' | 'bottom';
} = {}): { offsetTop: number; offsetBottom: number } {
  const baseOffset = 24;
  const fixedControls = document.querySelector(
    `.${CSS_CLASSES.CONTROLS_FIXED_TOP}, .${CSS_CLASSES.CONTROLS_FIXED_BOTTOM}`
  ) as HTMLElement | null;
  const fixedControlsHeight = fixedControls?.getBoundingClientRect().height ?? 0;

  if (options.controlsFixedPosition === 'top') {
    return {
      offsetTop: baseOffset + fixedControlsHeight,
      offsetBottom: baseOffset,
    };
  }

  if (options.controlsFixedPosition === 'bottom') {
    return {
      offsetTop: baseOffset,
      offsetBottom: baseOffset + fixedControlsHeight,
    };
  }

  return {
    offsetTop: baseOffset,
    offsetBottom: baseOffset,
  };
}

export function getScrollContainer(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;

  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;

    if (
      overflowY === 'auto' ||
      overflowY === 'scroll' ||
      overflowX === 'auto' ||
      overflowX === 'scroll'
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return null;
}

export function isScrollableContainer(element: HTMLElement): boolean {
  return element.scrollHeight > element.clientHeight + 1;
}

export function getScrollableContainer(element: HTMLElement): HTMLElement | null {
  let parent = element.parentElement;

  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    const overflowX = style.overflowX;
    const hasOverflow =
      overflowY === 'auto' ||
      overflowY === 'scroll' ||
      overflowY === 'overlay' ||
      overflowX === 'auto' ||
      overflowX === 'scroll' ||
      overflowX === 'overlay';

    if (hasOverflow && isScrollableContainer(parent)) {
      return parent;
    }
    parent = parent.parentElement;
  }

  return null;
}

export function resolveBlockScrollContainer(element: HTMLElement): HTMLElement | null {
  return getScrollableContainer(element) ?? getScrollContainer(element);
}

export function stopOngoingScroll(container: HTMLElement): void {
  container.style.scrollBehavior = 'auto';
  container.scrollTop = container.scrollTop;
}

export async function restoreScrollPosition(
  container: HTMLElement,
  scrollTop: number,
  layoutRoot?: HTMLElement | null
): Promise<void> {
  stopOngoingScroll(container);
  container.scrollTop = scrollTop;
  await afterPaint();
  container.scrollTop = scrollTop;

  if (layoutRoot) {
    await waitForLayoutStable(layoutRoot);
  }

  stopOngoingScroll(container);
  container.scrollTop = scrollTop;
}

export async function scrollToElement(
  element: HTMLElement,
  options: {
    offset?: number;
    behavior?: ScrollBehavior;
    container?: HTMLElement;
  } = {}
): Promise<void> {
  const { offset = 20, behavior = 'smooth', container } = options;
  const scrollContainer = container ?? resolveBlockScrollContainer(element);

  if (!scrollContainer || !isScrollableContainer(scrollContainer)) {
    await scrollElementInWindow(element, offset, behavior);
    return;
  }

  await afterPaint();

  const elementRect = element.getBoundingClientRect();
  const containerRect = scrollContainer.getBoundingClientRect();

  const elementTopRelativeToContainer =
    elementRect.top - containerRect.top + scrollContainer.scrollTop;
  const targetScrollTop = elementTopRelativeToContainer - offset;

  const maxScrollTop = Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);
  const finalScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));

  if (behavior === 'smooth') {
    await smoothScrollElement(scrollContainer, finalScrollTop);
  } else {
    scrollContainer.scrollTop = finalScrollTop;
  }
}

async function scrollElementInWindow(
  element: HTMLElement,
  offset: number,
  behavior: ScrollBehavior
): Promise<void> {
  const elementRect = element.getBoundingClientRect();
  const targetPosition = elementRect.top + window.pageYOffset - offset;

  if (behavior === 'smooth') {
    try {
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
      await waitForScrollSettled(document.documentElement);
      return;
    } catch {
      await smoothScrollWindow(targetPosition);
    }
    return;
  }

  window.scrollTo(0, targetPosition);
}

function smoothScrollWindow(targetPosition: number): Promise<void> {
  const startPosition = window.pageYOffset || window.scrollY;
  const distance = targetPosition - startPosition;

  if (Math.abs(distance) < 1) {
    return Promise.resolve();
  }

  const duration = Math.min(Math.abs(distance) * 0.5, 800);

  return new Promise(resolve => {
    let start: number | null = null;

    const step = (timestamp: number): void => {
      if (!start) {
        start = timestamp;
      }
      const progress = timestamp - start;
      const percentage = Math.min(progress / duration, 1);
      const ease = 0.5 - Math.cos(percentage * Math.PI) / 2;
      const currentPosition = startPosition + distance * ease;
      window.scrollTo(0, currentPosition);
      if (percentage < 1) {
        window.requestAnimationFrame(step);
      } else {
        window.scrollTo(0, targetPosition);
        resolve();
      }
    };

    window.requestAnimationFrame(step);
  });
}

function smoothScrollElement(element: HTMLElement, targetScrollTop: number): Promise<void> {
  const startPosition = element.scrollTop;
  const distance = targetScrollTop - startPosition;

  if (Math.abs(distance) < 1) {
    element.scrollTop = targetScrollTop;
    return Promise.resolve();
  }

  const duration = Math.min(Math.max(Math.abs(distance) * 0.5, 300), 1000);

  return new Promise(resolve => {
    let start: number | null = null;
    let rafId: number | null = null;
    let isCancelled = false;

    const finish = (scrollTop: number) => {
      if (isCancelled) {
        return;
      }
      isCancelled = true;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      element.scrollTop = scrollTop;
      resolve();
    };

    const step = (timestamp: number): void => {
      if (isCancelled) {
        return;
      }

      if (!start) {
        start = timestamp;
      }

      const progress = timestamp - start;
      const percentage = Math.min(progress / duration, 1);
      const ease = 0.5 - Math.cos(percentage * Math.PI) / 2;
      const currentPosition = startPosition + distance * ease;

      element.scrollTop = currentPosition;

      if (percentage < 1) {
        rafId = window.requestAnimationFrame(step);
      } else {
        finish(targetScrollTop);
      }
    };

    rafId = window.requestAnimationFrame(step);

    window.setTimeout(() => {
      finish(targetScrollTop);
    }, duration + 100);
  });
}

export async function waitForElementScrollSettled(element: HTMLElement): Promise<void> {
  await waitForScrollSettled(element);
}
