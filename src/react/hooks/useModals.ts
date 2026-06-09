import { useCallback, useEffect, useState } from 'react';

import { lockBodyScroll, unlockBodyScroll } from '../../utils/scrollLock';
import { isClient } from '../../utils/ssr';

export function useModals(showFormModal: boolean) {
  const [showTypeSelectionModal, setShowTypeSelectionModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | undefined>(undefined);

  const closeTypeSelectionModal = useCallback(() => {
    setShowTypeSelectionModal(false);
    setSelectedPosition(undefined);
  }, []);

  useEffect(() => {
    if (!isClient()) {
      return;
    }
    if (showFormModal || showTypeSelectionModal) {
      lockBodyScroll();
    } else {
      unlockBodyScroll();
    }
  }, [showFormModal, showTypeSelectionModal]);

  return {
    showTypeSelectionModal,
    setShowTypeSelectionModal,
    selectedPosition,
    setSelectedPosition,
    closeTypeSelectionModal,
  };
}
