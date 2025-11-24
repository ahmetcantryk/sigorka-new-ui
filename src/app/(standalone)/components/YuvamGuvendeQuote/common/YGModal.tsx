import React from 'react';

interface YGModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  allowBackdropClose?: boolean;
}

export default function YGModal({ isOpen, onClose, children, allowBackdropClose = false }: YGModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && allowBackdropClose) {
      onClose();
    }
  };

  return (
    <div className="yg-modal-overlay" onClick={handleBackdropClick}>
      <div className="yg-modal-content">
        {children}
      </div>
    </div>
  );
}



