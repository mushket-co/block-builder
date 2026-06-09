export function isClient(): boolean {
  return typeof window !== 'undefined';
}

export function isServer(): boolean {
  return !isClient();
}

/**
 * До завершения гидрации inline-spacing должен совпадать с SSR (desktop breakpoint).
 * Включается в BlockBuilder.onMounted, чтобы window.innerWidth не ломал hydration.
 */
let viewportBreakpointDetectionEnabled = false;

export function enableViewportBreakpointDetection(): void {
  viewportBreakpointDetectionEnabled = true;
}

export function isViewportBreakpointDetectionEnabled(): boolean {
  return viewportBreakpointDetectionEnabled;
}

/** Для тестов */
export function resetViewportBreakpointDetection(): void {
  viewportBreakpointDetectionEnabled = false;
}
