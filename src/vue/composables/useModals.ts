import { computed, ref } from 'vue';

import { lockBodyScroll, unlockBodyScroll } from '../../utils/scrollLock';

export function useModals() {
  const showModal = ref(false);
  const showTypeSelectionModal = ref(false);

  const isAnyModalOpen = computed(() => showModal.value || showTypeSelectionModal.value);

  const openModal = () => {
    showModal.value = true;
    lockBodyScroll();
  };

  const closeModal = () => {
    showModal.value = false;
    unlockBodyScroll();
  };

  const openTypeSelectionModal = () => {
    showTypeSelectionModal.value = true;
    lockBodyScroll();
  };

  const closeTypeSelectionModal = () => {
    showTypeSelectionModal.value = false;
    unlockBodyScroll();
  };

  return {
    showModal,
    showTypeSelectionModal,
    isAnyModalOpen,
    openModal,
    closeModal,
    openTypeSelectionModal,
    closeTypeSelectionModal,
  };
}
