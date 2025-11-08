


export function nextRenderFrame(): Promise<void> {
  return new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(() => resolve(), 16);
    }
  });
}


export function nextTick(): Promise<void> {
  return Promise.resolve();
}


export function waitForElement(selector: string, timeout: number = 1000): Promise<HTMLElement | null> {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element as HTMLElement);
      return;
    }

    const observer = new MutationObserver((mutations, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        resolve(element as HTMLElement);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}


export async function afterRender(callback: () => void | Promise<void>): Promise<void> {
  await nextRenderFrame();
  await callback();
}
