"use client";
import React, { useEffect } from 'react';
import CloseIcon from '@mui/icons-material/Close';

interface Guarantee {
  insuranceGuaranteeId: string;
  label: string;
  valueText: string | null;
  amount: number;
}

interface YGGuaranteeModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName?: string;
  coverageGroupName?: string;
  guarantees?: Guarantee[];
  currentPremium?: string;
  installmentText?: string;
  hasCoverageDetails?: boolean;
}

export default function YGGuaranteeModal({ 
  isOpen, 
  onClose, 
  companyName,
  coverageGroupName,
  guarantees,
  currentPremium,
  installmentText,
  hasCoverageDetails
}: YGGuaranteeModalProps) {
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

  const formatGuaranteeValue = (guarantee: Guarantee): string => {
    if (guarantee.valueText) {
      return guarantee.valueText;
    }
    if (guarantee.amount) {
      return (
        guarantee.amount.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + ' ₺'
      );
    }
    return '-';
  };

  const infoMessage = (
    <>
      Teminat detayları sigorta şirketinin teklif belgesinden ve servislerinden alınan değerler aracılığıyla sunulmaktadır. Daha detaylı sorularınız için{' '}
      <a href="tel:08504040404" className="yg-guarantee-phone-link">0850 404 04 04</a> numaralı telefon numarasından müşteri temsilcilerimize ulaşabilirsiniz.
    </>
  );
  const shouldShowOnlyInfo = hasCoverageDetails === false;
  const filteredGuarantees = guarantees
    ?.filter((guarantee) => {
      const value = formatGuaranteeValue(guarantee);
      return value !== 'Belirsiz' && value !== '-';
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <>
      <div className="yg-legal-modal-overlay" onClick={handleBackdropClick}>
        <div className="yg-guarantee-modal-container" onClick={(e) => e.stopPropagation()}>
          <button className="yg-legal-modal-close" onClick={onClose}>
            <CloseIcon />
          </button>
          
          <div className="yg-guarantee-modal-header">
            <div className="yg-guarantee-modal-info">
              <div className="yg-guarantee-modal-company">{companyName}</div>
              {coverageGroupName && (
                <div className="yg-guarantee-modal-badge">{coverageGroupName}</div>
              )}
            </div>
            {currentPremium && (
              <div className="yg-guarantee-modal-price-section">
                <div className="yg-guarantee-modal-price">{currentPremium} ₺</div>
                {installmentText && (
                  <div className="yg-guarantee-modal-installment">{installmentText}</div>
                )}
              </div>
            )}
          </div>
          
          <div className="yg-guarantee-modal-content">
            {shouldShowOnlyInfo ? (
              <div className="yg-guarantee-disclaimer">
                {infoMessage}
              </div>
            ) : (
              <>
                {filteredGuarantees && filteredGuarantees.length > 0 ? (
                  <table className="yg-guarantee-table">
                    <tbody>
                      {filteredGuarantees.map((guarantee) => (
                        <tr key={guarantee.insuranceGuaranteeId} className="yg-guarantee-row">
                          <td>
                            <div className="yg-guarantee-label">
                              {guarantee.label}
                            </div>
                          </td>
                          <td>
                            <div className="yg-guarantee-value">
                              {formatGuaranteeValue(guarantee)}
                              <span className="yg-guarantee-icon">✓</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="yg-guarantee-empty">
                    Bu teklif için detaylı teminat bilgisi bulunmamaktadır.
                  </div>
                )}
                
                <div className="yg-guarantee-disclaimer">
                  {infoMessage}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

