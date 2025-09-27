// hooks/useLocationModals.ts
import { useState } from 'react';

export type ModalType = 'pickup' | 'drop' | null;

export const useLocationModals = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (type: ModalType) => {
    // Close any existing modal first
    setActiveModal(null);
    setTimeout(() => setActiveModal(type), 100); // Small delay to ensure proper closing
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return {
    activeModal,
    openModal,
    closeModal,
  };
};
