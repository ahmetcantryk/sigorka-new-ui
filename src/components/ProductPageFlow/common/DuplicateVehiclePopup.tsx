/**
 * Duplicate Vehicle Popup
 * 
 * Araç zaten mevcut olduğunda gösterilen popup
 * Tüm branşlar için ortak kullanılır (Kasko, Trafik, vb.)
 */

'use client';

import React from 'react';

interface DuplicateVehiclePopupProps {
  isOpen: boolean;
  plateNumber: string;
  onClose: () => void;
  onUpdateExisting: () => void;
}

const DuplicateVehiclePopup: React.FC<DuplicateVehiclePopupProps> = ({
  isOpen,
  plateNumber,
  onClose,
  onUpdateExisting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="pp-modal-overlay" onClick={onClose}>
      <div className="pp-modal-content pp-duplicate-vehicle-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pp-modal-close" onClick={onClose}>×</button>
        
        <div className="pp-duplicate-vehicle-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#F59E0B" strokeWidth="2"/>
            <path d="M12 8V12" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="#F59E0B"/>
          </svg>
        </div>
        
        <h3 className="pp-duplicate-vehicle-title">Araç Zaten Mevcut</h3>
        
        <p className="pp-duplicate-vehicle-message">
          <strong>{plateNumber}</strong> plakalı araç mevcut, mevcut araç varlığını güncelleyerek teklife devam edebilirsiniz.
        </p>
        
        <div className="pp-duplicate-vehicle-actions">
          <button 
            className="pp-btn-primary" 
            onClick={onUpdateExisting}
          >
            Mevcut Aracı Güncelle
          </button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateVehiclePopup;

