import { CSS_CLASSES } from './constants';

type TScrollLockHandler = () => void;

let customLockHandler: TScrollLockHandler | null = null;
let customUnlockHandler: TScrollLockHandler | null = null;

export function setScrollLockHandlers(handlers: {
  lock?: TScrollLockHandler;
  unlock?: TScrollLockHandler;
}): void {
  customLockHandler = handlers.lock || null;
  customUnlockHandler = handlers.unlock || null;
}

export function lockBodyScroll(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  if (customLockHandler) {
    customLockHandler();
    return;
  }

  const body = document.body;
  const html = document.documentElement;
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

  body.classList.add(CSS_CLASSES.BB_LOCK_SCROLL);
  html.classList.add(CSS_CLASSES.BB_LOCK_SCROLL);
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
  }
}

export function unlockBodyScroll(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  if (customUnlockHandler) {
    customUnlockHandler();
    return;
  }

  const body = document.body;
  const html = document.documentElement;

  body.classList.remove(CSS_CLASSES.BB_LOCK_SCROLL);
  html.classList.remove(CSS_CLASSES.BB_LOCK_SCROLL);
  body.style.paddingRight = '';
}
