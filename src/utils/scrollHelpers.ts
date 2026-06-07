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

export function scrollToElement(
  element: HTMLElement,
  options: {
    offset?: number;
    behavior?: ScrollBehavior;
    container?: HTMLElement;
  } = {}
): void {
  const { offset = 20, behavior = 'smooth', container } = options;
  const scrollContainer = container ?? getScrollContainer(element);

  if (!scrollContainer) {
    scrollElementInWindow(element, offset, behavior);
    return;
  }

  const performScroll = () => {
    const elementRect = element.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();

    const elementTopRelativeToContainer =
      elementRect.top - containerRect.top + scrollContainer.scrollTop;
    const targetScrollTop = elementTopRelativeToContainer - offset;

    const maxScrollTop = Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);
    const finalScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));

    if (behavior === 'smooth') {
      smoothScrollElement(scrollContainer, finalScrollTop);
    } else {
      scrollContainer.scrollTop = finalScrollTop;
    }
  };

  if (behavior === 'smooth') {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        performScroll();
      });
    });
  } else {
    performScroll();
  }
}

function scrollElementInWindow(
  element: HTMLElement,
  offset: number,
  behavior: ScrollBehavior
): void {
  const elementRect = element.getBoundingClientRect();
  const targetPosition = elementRect.top + window.pageYOffset - offset;

  if (behavior === 'smooth') {
    try {
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth',
      });
    } catch {
      smoothScrollWindow(targetPosition);
    }
    return;
  }

  window.scrollTo(0, targetPosition);
}

function smoothScrollWindow(targetPosition: number): void {
  const startPosition = window.pageYOffset || window.scrollY;
  const distance = targetPosition - startPosition;

  if (Math.abs(distance) < 1) {
    return;
  }

  const duration = Math.min(Math.abs(distance) * 0.5, 800);
  let start: number | null = null;

  function step(timestamp: number): void {
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
    }
  }

  window.requestAnimationFrame(step);
}

function smoothScrollElement(element: HTMLElement, targetScrollTop: number): void {
  const startPosition = element.scrollTop;
  const distance = targetScrollTop - startPosition;

  if (Math.abs(distance) < 1) {
    return;
  }

  const duration = Math.min(Math.max(Math.abs(distance) * 0.5, 300), 1000);
  let start: number | null = null;
  let rafId: number | null = null;
  let isCancelled = false;

  const cancel = () => {
    isCancelled = true;
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
      rafId = null;
    }
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

    if (percentage < 1 && !isCancelled) {
      rafId = window.requestAnimationFrame(step);
    } else {
      element.scrollTop = targetScrollTop;
      rafId = null;
    }
  };

  rafId = window.requestAnimationFrame(step);

  setTimeout(() => {
    if (rafId !== null && !isCancelled) {
      cancel();
      element.scrollTop = targetScrollTop;
    }
  }, duration + 100);
}

export async function waitForElementScrollSettled(element: HTMLElement): Promise<void> {
  await waitForScrollSettled(element);
}
