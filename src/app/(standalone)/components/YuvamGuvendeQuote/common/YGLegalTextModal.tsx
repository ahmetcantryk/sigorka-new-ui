"use client";
import React, { useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';

interface YGLegalTextModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export default function YGLegalTextModal({ 
  isOpen, 
  onClose, 
  title, 
  content 
}: YGLegalTextModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      <div className="yg-legal-modal-overlay" onClick={handleBackdropClick}>
        <div className="yg-legal-modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="yg-legal-modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
          <div className="yg-legal-modal-header">
            <span className="yg-legal-modal-title">{title}</span>
          </div>
          <div className="yg-legal-modal-content">
            <div 
              className="yg-legal-modal-body"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

