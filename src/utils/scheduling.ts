/**
 * Ожидание layout/paint после изменений DOM.
 *
 * Используем только requestAnimationFrame —
 * поддерживается во всех современных браузерах, включая Safari.
 *
 * Типичный порядок после renderBlocks:
 *   innerHTML → init → afterPaint (2× rAF) → scroll
 */

function scheduleNextFrame(callback: FrameRequestCallback): number {
  const scheduler = globalThis.requestAnimationFrame;
  if (typeof scheduler === 'function') {
    return scheduler(callback);
  }

  return globalThis.setTimeout(
    () => callback(globalThis.performance?.now?.() ?? Date.now()),
    0
  ) as unknown as number;
}

function waitNextFrame(): Promise<void> {
  return new Promise(resolve => {
    scheduleNextFrame(() => resolve());
  });
}

/** Два rAF — layout применён, paint выполнен. */
export async function afterPaint(): Promise<void> {
  await waitNextFrame();
  await waitNextFrame();
}

export async function waitForLayoutStable(
  element: HTMLElement,
  options: { maxFrames?: number; stableFrames?: number } = {}
): Promise<void> {
  const maxFrames = options.maxFrames ?? 24;
  const stableFramesRequired = options.stableFrames ?? 2;
  let stableCount = 0;
  let lastHeight = -1;

  for (let frame = 0; frame < maxFrames; frame++) {
    await waitNextFrame();
    const height = element.scrollHeight;

    if (height === lastHeight) {
      stableCount += 1;
      if (stableCount >= stableFramesRequired) {
        return;
      }
    } else {
      stableCount = 0;
      lastHeight = height;
    }
  }
}

export async function waitForScrollSettled(
  element: HTMLElement,
  options: { maxFrames?: number; stableFrames?: number } = {}
): Promise<void> {
  if (typeof element.addEventListener === 'function' && 'onscrollend' in element) {
    await new Promise<void>(resolve => {
      let settled = false;
      const finish = () => {
        if (settled) {
          return;
        }
        settled = true;
        element.removeEventListener('scrollend', finish);
        resolve();
      };

      element.addEventListener('scrollend', finish, { once: true });
      void waitForScrollTopStable(element, options).then(finish);
    });
    return;
  }

  await waitForScrollTopStable(element, options);
}

async function waitForScrollTopStable(
  element: HTMLElement,
  options: { maxFrames?: number; stableFrames?: number } = {}
): Promise<void> {
  const maxFrames = options.maxFrames ?? 60;
  const stableFramesRequired = options.stableFrames ?? 2;
  let stableCount = 0;
  let lastScrollTop = element.scrollTop;

  for (let frame = 0; frame < maxFrames; frame++) {
    await waitNextFrame();
    const currentScrollTop = element.scrollTop;

    if (currentScrollTop === lastScrollTop) {
      stableCount += 1;
      if (stableCount >= stableFramesRequired) {
        return;
      }
    } else {
      stableCount = 0;
      lastScrollTop = currentScrollTop;
    }
  }
}
