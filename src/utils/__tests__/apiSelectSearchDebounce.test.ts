import {
  API_SELECT_DEBOUNCE_MS_DEFAULT,
  clearApiSelectDebounceTimer,
  resolveApiSelectDebounceMs,
  scheduleApiSelectSearch,
} from '../apiSelectSearchDebounce';

describe('apiSelectSearchDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('resolveApiSelectDebounceMs возвращает 0 по умолчанию', () => {
    expect(API_SELECT_DEBOUNCE_MS_DEFAULT).toBe(0);
    expect(resolveApiSelectDebounceMs()).toBe(0);
    expect(resolveApiSelectDebounceMs(undefined)).toBe(0);
    expect(resolveApiSelectDebounceMs(1500)).toBe(1500);
  });

  test('scheduleApiSelectSearch без debounce вызывает action сразу', () => {
    const timerRef = { current: null as ReturnType<typeof setTimeout> | null };
    const action = jest.fn();

    scheduleApiSelectSearch(timerRef, 0, action);

    expect(action).toHaveBeenCalledTimes(1);
    expect(timerRef.current).toBeNull();
  });

  test('scheduleApiSelectSearch с debounce откладывает action', () => {
    const timerRef = { current: null as ReturnType<typeof setTimeout> | null };
    const action = jest.fn();

    scheduleApiSelectSearch(timerRef, 300, action);
    expect(action).not.toHaveBeenCalled();

    jest.advanceTimersByTime(299);
    expect(action).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(action).toHaveBeenCalledTimes(1);
    expect(timerRef.current).toBeNull();
  });

  test('clearApiSelectDebounceTimer отменяет отложенный action', () => {
    const timerRef = { current: null as ReturnType<typeof setTimeout> | null };
    const action = jest.fn();

    scheduleApiSelectSearch(timerRef, 300, action);
    clearApiSelectDebounceTimer(timerRef);

    jest.advanceTimersByTime(300);
    expect(action).not.toHaveBeenCalled();
  });
});
