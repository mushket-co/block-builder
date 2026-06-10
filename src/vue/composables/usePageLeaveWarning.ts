import { onBeforeUnmount, watch, type Ref } from 'vue';

import type { IBlock } from '../../core/types';
import {
  attachPageLeaveWarning,
  haveBlocksChanged,
  shouldActivatePageLeaveWarning,
} from '../../utils/unsavedChangesGuard';

interface IUsePageLeaveWarningOptions {
  enabled: Ref<boolean | undefined>;
  isEdit?: Ref<boolean | undefined>;
  baselineBlocks: Ref<IBlock[]>;
  currentBlocks: Ref<IBlock[]>;
}

export function usePageLeaveWarning({
  enabled,
  isEdit,
  baselineBlocks,
  currentBlocks,
}: IUsePageLeaveWarningOptions) {
  let detachGuard: (() => void) | null = null;

  const isWarningActive = () =>
    shouldActivatePageLeaveWarning({
      warnOnPageLeave: enabled.value,
      isEdit: isEdit?.value,
    });

  const shouldWarn = () => {
    if (!isWarningActive()) {
      return false;
    }
    return haveBlocksChanged(baselineBlocks.value, currentBlocks.value);
  };

  const syncGuard = () => {
    detachGuard?.();
    detachGuard = null;

    if (!isWarningActive()) {
      return;
    }

    detachGuard = attachPageLeaveWarning(shouldWarn);
  };

  watch(
    () => [enabled.value, isEdit?.value] as const,
    syncGuard,
    { immediate: true }
  );

  onBeforeUnmount(() => {
    detachGuard?.();
    detachGuard = null;
  });

  const markAsSaved = () => {
    baselineBlocks.value = [...currentBlocks.value];
  };

  return { markAsSaved };
}
