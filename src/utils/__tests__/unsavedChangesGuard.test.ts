import type { IBlockDto } from '../../core/types';
import {
  attachPageLeaveWarning,
  createUnsavedChangesTracker,
  haveBlocksChanged,
  shouldActivatePageLeaveWarning,
} from '../unsavedChangesGuard';

const createBlock = (overrides: Partial<IBlockDto> = {}): IBlockDto => ({
  id: 'block-1',
  type: 'text',
  settings: {},
  props: { title: 'Hello' },
  visible: true,
  locked: false,
  order: 0,
  metadata: {
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-06-01T00:00:00.000Z'),
    version: 1,
  },
  ...overrides,
});

describe('unsavedChangesGuard', () => {
  test('shouldActivatePageLeaveWarning выключен при isEdit: false', () => {
    expect(shouldActivatePageLeaveWarning({ warnOnPageLeave: true, isEdit: false })).toBe(false);
    expect(shouldActivatePageLeaveWarning({ warnOnPageLeave: true, isEdit: true })).toBe(true);
    expect(shouldActivatePageLeaveWarning({ warnOnPageLeave: true })).toBe(true);
    expect(shouldActivatePageLeaveWarning({ warnOnPageLeave: false, isEdit: true })).toBe(false);
  });

  test('возвращает false для одинаковых блоков', () => {
    const initial = [createBlock()];
    const current = [createBlock({ metadata: { createdAt: new Date(), updatedAt: new Date(), version: 2 } })];

    expect(haveBlocksChanged(initial, current)).toBe(false);
  });

  test('возвращает true при изменении props', () => {
    const initial = [createBlock()];
    const current = [createBlock({ props: { title: 'Changed' } })];

    expect(haveBlocksChanged(initial, current)).toBe(true);
  });

  test('возвращает true при изменении порядка блоков', () => {
    const initial = [
      createBlock({ id: 'a', order: 0 }),
      createBlock({ id: 'b', order: 1 }),
    ];
    const current = [
      createBlock({ id: 'b', order: 0 }),
      createBlock({ id: 'a', order: 1 }),
    ];

    expect(haveBlocksChanged(initial, current)).toBe(true);
  });

  test('сбрасывает dirty-состояние через tracker', () => {
    const tracker = createUnsavedChangesTracker([createBlock()]);
    const changed = [createBlock({ props: { title: 'Changed' } })];

    expect(tracker.isDirty(changed)).toBe(true);
    tracker.resetBaseline(changed);
    expect(tracker.isDirty(changed)).toBe(false);
  });

  test('attachPageLeaveWarning возвращает noop вне браузера', () => {
    const detach = attachPageLeaveWarning(() => true);
    expect(() => detach()).not.toThrow();
  });
});
