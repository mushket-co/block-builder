export const API_SELECT_DEBOUNCE_MS_DEFAULT = 0;

export type TApiSelectDebounceTimer = ReturnType<typeof setTimeout> | null;

export interface IApiSelectDebounceTimerRef {
  current: TApiSelectDebounceTimer;
}

export function resolveApiSelectDebounceMs(debounceMs?: number): number {
  return debounceMs ?? API_SELECT_DEBOUNCE_MS_DEFAULT;
}

export function clearApiSelectDebounceTimer(timerRef: IApiSelectDebounceTimerRef): void {
  if (timerRef.current) {
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }
}

export function scheduleApiSelectSearch(
  timerRef: IApiSelectDebounceTimerRef,
  debounceMs: number,
  action: () => void
): void {
  clearApiSelectDebounceTimer(timerRef);

  if (debounceMs <= 0) {
    action();
    return;
  }

  timerRef.current = setTimeout(() => {
    timerRef.current = null;
    action();
  }, debounceMs);
}
