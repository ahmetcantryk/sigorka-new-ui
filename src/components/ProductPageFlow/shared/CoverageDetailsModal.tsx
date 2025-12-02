import React, { useState, useEffect, useRef } from 'react';
import CoverageTooltip from './CoverageTooltip';

interface CoverageDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    quote: any; // Using any for now to avoid complex type dependency chains
    onPurchase: (quoteId: string, installmentNumber?: number) => void;
    onInstallmentChange: (quoteId: string, installment: number) => void;
    agencyPhoneNumber?: string;
}

const CoverageDetailsModal: React.FC<CoverageDetailsModalProps> = ({
    isOpen,
    onClose,
    quote,
    onPurchase,
    onInstallmentChange,
    agencyPhoneNumber = '0850 404 04 04'
}) => {
    const [isInstallmentOpen, setIsInstallmentOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsInstallmentOpen(false);
            }
        };

        if (isInstallmentOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isInstallmentOpen]);

    if (!isOpen || !quote) return null;

    const selectedPremium = quote.premiums.find((p: any) => p.installmentNumber === quote.selectedInstallmentNumber);

    const formatGuaranteeValue = (guarantee: any): string => {
        // Belirsiz değerler için boş döndür
        if (guarantee?.valueText === 'Belirsiz') {
            return '';
        }
        if (guarantee?.valueText) {
            return guarantee.valueText;
        }
        if (guarantee?.amount) {
            return (
                guarantee.amount.toLocaleString('tr-TR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }) + ' ₺'
            );
        }
        return '';
    };

    // Branch bilgisini quote'dan al (trafik, kasko, tss veya konut)
    const getBranch = (): string => {
        // Quote'un productBranch'ini kontrol et
        if (quote?.productBranch === 'TRAFIK' || quote?.productBranch === 'trafik') {
            return 'trafik';
        }
        if (quote?.productBranch === 'TSS' || quote?.productBranch === 'tss') {
            return 'tss';
        }
        if (quote?.productBranch === 'KONUT' || quote?.productBranch === 'konut') {
            return 'konut';
        }
        return 'kasko'; // Default kasko
    };

    const handleInstallmentSelect = (installmentNumber: number) => {
        onInstallmentChange(quote.id, installmentNumber);
        setIsInstallmentOpen(false);
    };

    return (
        <div className="pp-coverage-modal-overlay" onClick={onClose}>
            {/* Close Button Outside */}
            <button className="pp-coverage-modal-close-outside" onClick={onClose}>
                <span>Kapat</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            <div className="pp-coverage-modal-container" onClick={(e) => e.stopPropagation()}>

                {/* Header Title */}
                <div className="pp-coverage-modal-title">
                    Teminat Detayları
                </div>

                {/* Top Card Area */}
                <div className="pp-coverage-modal-top-card">
                    <div className="pp-coverage-modal-logo-area">
                        {quote.logo ? (
                            <img src={`https://storage.dogasigorta.com/app-1/insurup-b2c-company/${quote.insuranceCompanyId}.png`} alt={quote.company} className="pp-coverage-modal-logo" />
                        ) : (
                            <div className="pp-coverage-modal-logo-placeholder">{quote.company}</div>
                        )}
                    </div>

                    {/* Discount Badge - Example Logic */}
                    {quote.hasUndamagedDiscount && (
                        <div className="pp-coverage-modal-discount-badge">
                            %{quote.hasUndamagedDiscountRate || 10} Hasarsızlık İndirimi
                        </div>
                    )}

                    <div className="pp-coverage-modal-price-area">
                        <div className="pp-coverage-modal-price">
                            {selectedPremium?.formattedGrossPremium || selectedPremium?.grossPremium + ' ₺'}
                        </div>

                        {/* Custom Installment Dropdown */}
                        <div className="pp-coverage-modal-installment" ref={dropdownRef}>
                            <button
                                className="pp-coverage-installments-button"
                                onClick={() => setIsInstallmentOpen(!isInstallmentOpen)}
                            >
                                <span>
                                    {quote.selectedInstallmentNumber === 1
                                        ? 'Peşin Ödeme'
                                        : `${quote.selectedInstallmentNumber} Taksit`}
                                </span>
                                <svg
                                    className={`pp-chevron-small ${isInstallmentOpen ? 'pp-chevron-rotated' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isInstallmentOpen && (
                                <div className="pp-coverage-installments-menu">
                                    {quote.premiums.map((premium: any) => (
                                        <button
                                            key={premium.installmentNumber}
                                            className={`pp-coverage-installment-option ${premium.installmentNumber === quote.selectedInstallmentNumber ? 'selected' : ''}`}
                                            onClick={() => handleInstallmentSelect(premium.installmentNumber)}
                                        >
                                            {premium.installmentNumber === 1 ? (
                                                'Peşin Ödeme'
                                            ) : (
                                                `${premium.installmentNumber} x ${(premium.grossPremium / premium.installmentNumber).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scrollable Content Wrapper */}
                <div className="pp-coverage-modal-scroll-content">
                    {/* Table Header */}
                    <div className="pp-coverage-modal-table-header">
                        <div className="pp-header-cell-left">Teminat Adı</div>
                        <div className="pp-header-cell-right">Limit / Değer</div>
                    </div>

                    {/* Table Body */}
                    <div className="pp-coverage-modal-table-body">
                        {quote.insuranceCompanyGuarantees
                            ?.sort((a: any, b: any) => a.label.localeCompare(b.label))
                            .map((guarantee: any) => {
                                const value = formatGuaranteeValue(guarantee);
                                // Modalda her zaman text göster (tick/X yok)
                                const displayText = value || (guarantee.isIncluded ? 'Dahil' : 'Dahil Değil');
                                
                                return (
                                    <div key={guarantee.insuranceGuaranteeId} className="pp-coverage-modal-row">
                                        <div className="pp-row-cell-left">
                                            {guarantee.label}
                                            <CoverageTooltip branch={guarantee.branch || getBranch()} coverageKey={guarantee.coverageKey || guarantee.label} />
                                        </div>
                                        <div className="pp-row-cell-right">
                                            {displayText}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Footer */}
                <div className="pp-coverage-modal-footer">
                    <div className="pp-coverage-modal-disclaimer">
                        Teminat detayları sigorta şirketinin teklif belgesinden ve servislerinden alınan değerler aracılığıyla sunulmaktadır. Daha detaylı sorularınız için <a href={`tel:${agencyPhoneNumber.replace(/\s/g, '')}`}>{agencyPhoneNumber}</a> numaralı telefon numarasından müşteri temsilcilerimize ulaşabilirsiniz.
                    </div>
                    <button
                        className="pp-coverage-modal-buy-btn"
                        onClick={() => onPurchase(quote.id)}
                    >
                        Satın Al
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CoverageDetailsModal;
