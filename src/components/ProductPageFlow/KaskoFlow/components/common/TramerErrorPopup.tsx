/**
 * Kasko Flow - Tramer Error Popup Bileşeni
 */

'use client';

interface TramerErrorPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const TramerErrorPopup = ({ isOpen, onClose }: TramerErrorPopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="pp-modal-overlay" onClick={onClose}>
      <div className="pp-modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="pp-modal-title">Bilgilendirme</span>
        <p className="pp-modal-description">
          Araç bilgileri otomatik olarak getirilemedi. Lütfen manuel olarak giriş yapınız.
        </p>
        <button
          type="button"
          className="pp-btn-verify"
          onClick={onClose}
        >
          Tamam
        </button>
      </div>
    </div>
  );
};

export default TramerErrorPopup;

