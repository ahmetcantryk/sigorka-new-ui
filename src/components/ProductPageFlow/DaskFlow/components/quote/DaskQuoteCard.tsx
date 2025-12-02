/**
 * DASK Flow - Quote Card Bileşeni
 * 
 * Tek bir DASK teklif kartını render eder
 * Teminatlar sabit olarak tanımlıdır (API'den gelmez)
 */

'use client';

import { useState } from 'react';
import type { ProcessedQuote, Premium } from '../../hooks/useDaskQuotes';
import CoverageTooltip from '@/components/ProductPageFlow/shared/CoverageTooltip';
import { pushDaskPurchaseClick } from '../../utils/dataLayerUtils';

// DASK Teminatları - Sabit (API'den gelmez, her zaman bu değerler kullanılır)
export const DASK_COVERAGES = {
    // Kart üzerinde gösterilecek ilk 3 teminat
    main: [
        { label: 'Deprem Bina', included: true },
        { label: 'Deprem Yangın', included: true },
        { label: 'Deprem İnfilak', included: true },
    ],
    // Genişletilmiş bölümde gösterilecek ek teminatlar (main'de olmayanlar)
    extra: [
        { label: 'Deprem Tsunami', included: true },
        { label: 'Deprem Yer Kayması', included: true },
    ],
};

interface DaskQuoteCardProps {
    quote: ProcessedQuote;
    proposalId: string;
    onInstallmentChange: (quoteId: string, installmentNumber: number) => void;
    onPurchase: (quoteId: string) => void;
    onViewDocument: (productId: string) => void;
    isLoadingDocument?: boolean;
}

const DaskQuoteCard = ({
    quote,
    proposalId,
    onInstallmentChange,
    onPurchase,
    onViewDocument,
    isLoadingDocument = false,
}: DaskQuoteCardProps) => {
    const [isInstallmentsOpen, setIsInstallmentsOpen] = useState(false);

    const currentPremium = quote.premiums.find(p => p.installmentNumber === quote.selectedInstallmentNumber);

    const handleInstallmentSelect = (installmentNumber: number) => {
        onInstallmentChange(quote.id, installmentNumber);
        setIsInstallmentsOpen(false);
    };

    const handlePurchase = () => {
        // Seçilen taksit bilgisini localStorage'a kaydet
        const quoteDataForPurchase = {
            id: quote.id,
            company: quote.company,
            insuranceCompanyId: quote.insuranceCompanyId,
            productId: quote.productId,
            premiums: quote.premiums,
            selectedInstallmentNumber: quote.selectedInstallmentNumber,
            proposalProductId: quote.id,
            proposalId: proposalId,
            insuranceCompanyLogo: quote.logo,
        };
        localStorage.setItem('selectedQuoteForPurchase', JSON.stringify(quoteDataForPurchase));
        localStorage.setItem('selectedInstallmentNumber', quote.selectedInstallmentNumber.toString());
        
        // DataLayer push - Satın Al tıklandı
        pushDaskPurchaseClick(quote.id, quote.company, currentPremium?.grossPremium);
        
        onPurchase(quote.id);
    };

    return (
        <div className="pp-quote-card">
            {/* DASK Badge */}
            <div className="pp-quote-tier-badge">
                <span>Zorunlu Deprem Sigortası</span>
            </div>

            <div className="pp-quote-main">
                {/* BÖLÜM 1: Company Logo */}
                <div className="pp-quote-section pp-quote-logo-section">
                    <div className="pp-quote-logo-container">
                        <img
                            alt={quote.company}
                            className="pp-quote-logo"
                            src={quote.logo}
                            style={quote.logo?.includes('hdi-katilim') ? { width: '65px' } : undefined}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = '/images/company-placeholder.png';
                            }}
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="pp-quote-divider" />

                {/* BÖLÜM 2: Ana 3 Teminat (Deprem Bina, Deprem Yangın, Deprem İnfilak) */}
                <div className="pp-quote-section pp-quote-main-coverages small-quotes">
                    {DASK_COVERAGES.main.map((coverage, index) => (
                        <div key={index} className="pp-coverage-row">
                            <span className="pp-coverage-label">
                                {coverage.label}
                                <CoverageTooltip branch="dask" coverageKey={coverage.label} />
                            </span>
                            <img
                                src="/images/product-detail/teminat-tick.svg"
                                alt="Dahil"
                                className="pp-coverage-icon-status"
                            />
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="pp-quote-divider" />

                {/* BÖLÜM 2.5: Teklif Belgesi Butonu */}
                <div className="pp-quote-section pp-quote-document-section">
                    <button
                        className="pp-coverage-action-btn pp-btn-document"
                        onClick={() => onViewDocument(quote.id)}
                        disabled={isLoadingDocument}
                    >
                        {isLoadingDocument ? (
                            <>
                                <div className="pp-spinner pp-btn-spinner"></div>
                                <span>Yükleniyor...</span>
                            </>
                        ) : (
                            <>
                                <i className="icon-teklif-button pp-btn-icon"></i>
                                <span>Teklif Belgesi</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Divider */}
                <div className="pp-quote-divider" />

                {/* BÖLÜM 3: Fiyat ve Taksit */}
                <div className="pp-quote-section pp-quote-price-section">
                    <p className="pp-quote-price">
                        {currentPremium?.formattedGrossPremium} ₺
                    </p>

                    {/* Installments Dropdown */}
                    <div className="pp-dropdown-wrapper">
                        <button
                            onClick={() => setIsInstallmentsOpen(!isInstallmentsOpen)}
                            className="pp-installments-button"
                        >
                            <span>
                                {quote.selectedInstallmentNumber === 1
                                    ? 'Peşin Ödeme'
                                    : `${quote.selectedInstallmentNumber} Taksit`}
                            </span>
                            <svg className="pp-chevron-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {isInstallmentsOpen && (
                            <div className="pp-dropdown-menu pp-installments-menu">
                                {quote.premiums.map((premium) => (
                                    <button
                                        key={premium.installmentNumber}
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
              
                {/* Divider */}
                <div className="pp-quote-divider" />

                {/* BÖLÜM 4: Satın Al Butonu */}
                <div className="pp-quote-section pp-quote-buy-section">
                    <button
                        className="pp-btn-buy"
                        onClick={handlePurchase}
                    >
                        Satın Al
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DaskQuoteCard;

