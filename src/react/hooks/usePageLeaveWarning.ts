import { useCallback, useEffect, useRef } from 'react';

import type { IBlock } from '../../core/types';
import {
  attachPageLeaveWarning,
  haveBlocksChanged,
  shouldActivatePageLeaveWarning,
} from '../../utils/unsavedChangesGuard';

interface IUsePageLeaveWarningOptions {
  enabled?: boolean;
  isEdit?: boolean;
  baselineBlocks: IBlock[];
  currentBlocks: IBlock[];
}

export function usePageLeaveWarning({
  enabled = false,
  isEdit = true,
  baselineBlocks,
  currentBlocks,
}: IUsePageLeaveWarningOptions) {
  const baselineRef = useRef(baselineBlocks);
  const isEditRef = useRef(isEdit);

  useEffect(() => {
    baselineRef.current = baselineBlocks;
  }, [baselineBlocks]);

  useEffect(() => {
    isEditRef.current = isEdit;
  }, [isEdit]);

  useEffect(() => {
    if (!shouldActivatePageLeaveWarning({ warnOnPageLeave: enabled, isEdit })) {
      return;
    }

    const shouldWarn = () => {
      if (!shouldActivatePageLeaveWarning({ warnOnPageLeave: enabled, isEdit: isEditRef.current })) {
        return false;
      }
      return haveBlocksChanged(baselineRef.current, currentBlocks);
    };

    return attachPageLeaveWarning(shouldWarn);
  }, [enabled, isEdit, currentBlocks]);

  const markAsSaved = useCallback((blocks: IBlock[]) => {
    baselineRef.current = [...blocks];
  }, []);

  return { markAsSaved };
}
