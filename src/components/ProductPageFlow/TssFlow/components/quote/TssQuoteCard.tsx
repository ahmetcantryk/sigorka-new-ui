/**
 * TSS Flow - Quote Card Bileşeni
 * 
 * Tek bir teklif kartını render eder
 * Kasko QuoteCard ile birebir aynı yapıda
 */

'use client';

import { useState } from 'react';
import { TssQuoteCardProps, Guarantee } from '../../types';
import { getMainCoverages, getAllCoverages, formatGuaranteeValue, getApiKeyFromLabel } from '../../utils/coverageUtils';
import CoverageTooltip from '@/components/ProductPageFlow/shared/CoverageTooltip';
import { TSS_STORAGE_KEYS } from '../../config/tssConstants';

const TssQuoteCard = ({
    quote,
    proposalId,
    onInstallmentChange,
    onPurchase,
    onOpenModal,
    onViewDocument,
    isLoadingDocument = false,
}: TssQuoteCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isInstallmentsOpen, setIsInstallmentsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'coverages'>('coverages');

    const currentPremium = quote.premiums.find(
        (p) => p.installmentNumber === quote.selectedInstallmentNumber
    );

    // API'den gelen coverage'dan teminatları al - optimalCoverage öncelikli!
    const coverage = quote.optimalCoverage || quote.pdfCoverage || quote.insuranceServiceProviderCoverage || quote.initialCoverage;
    
    // Debug: Coverage kontrolü
    console.log('🔍 TssQuoteCard coverage debug:', {
        quoteId: quote.id,
        hasOptimalCoverage: !!quote.optimalCoverage,
        hasPdfCoverage: !!quote.pdfCoverage,
        hasInsuranceServiceProviderCoverage: !!quote.insuranceServiceProviderCoverage,
        hasInitialCoverage: !!quote.initialCoverage,
        selectedCoverage: coverage,
        coverageKeys: coverage ? Object.keys(coverage) : [],
    });
    
    const mainCoverages = getMainCoverages(coverage);
    const allCoverages = getAllCoverages(coverage);
    
    // Debug: Processed coverages
    console.log('🔍 TssQuoteCard processed coverages:', {
        quoteId: quote.id,
        mainCoverages: mainCoverages.map(c => ({ label: c.label, valueText: c.valueText, isIncluded: (c as any).isIncluded })),
        allCoveragesCount: allCoverages.length,
    });

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
            coverageGroupName: quote.coverageGroupName,
        };
        localStorage.setItem(TSS_STORAGE_KEYS.SELECTED_QUOTE, JSON.stringify(quoteDataForPurchase));
        localStorage.setItem('selectedInstallmentNumber', quote.selectedInstallmentNumber.toString());
        
        onPurchase(quote.id);
    };

    // Teminat değerinin dahil olup olmadığını kontrol et
    const isCoverageIncluded = (guarantee: Guarantee & { isIncluded?: boolean }): boolean => {
        // isIncluded özelliği varsa onu kullan (coverageUtils'den geliyor)
        if (guarantee.isIncluded !== undefined) {
            return guarantee.isIncluded;
        }
        // Yoksa valueText'e bak
        const value = guarantee.valueText || formatGuaranteeValue(guarantee);
        return value !== 'Dahil Değil' && value !== '-' && value !== 'Belirsiz' && value !== 'Kapsam Dışı';
    };

    // Değerin sadece tick mı yoksa sayısal değer mi gösterileceğini belirle
    const shouldShowTickOnly = (displayValue: string): boolean => {
        return displayValue === 'Dahil' || displayValue === 'Limitsiz';
    };

    // API key'ini label'dan al
    const getTooltipKey = (label: string): string => {
        return getApiKeyFromLabel(label) || label;
    };

    return (
        <div className="pp-quote-card">
            {/* Tier Badge */}
            {quote.coverageGroupName && (
                <div className="pp-quote-tier-badge">
                    <span>{quote.coverageGroupName}</span>
                </div>
            )}

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
                                (e.target as HTMLImageElement).src = '/images/default-company.png';
                            }}
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="pp-quote-divider" />

                {/* BÖLÜM 2: Ana 3 Teminat */}
                <div className="pp-quote-section pp-quote-main-coverages">
                    {mainCoverages.map((guarantee, index) => {
                        // valueText zaten coverageUtils'den formatlanmış geliyor
                        const displayValue = guarantee.valueText || formatGuaranteeValue(guarantee);
                        const isIncluded = isCoverageIncluded(guarantee as Guarantee & { isIncluded?: boolean });
                        const tooltipKey = getTooltipKey(guarantee.label);
                        const showTick = shouldShowTickOnly(displayValue);
                        // InsurScan/pdf tarafından okunamayan teminatlar için (boş değer)
                        const isUnknown = !isIncluded && (!displayValue || displayValue.trim() === '');

                        return (
                            <div key={index} className="pp-coverage-row">
                                <span className="pp-coverage-label">
                                    {guarantee.label}
                                    <CoverageTooltip branch="tss" coverageKey={tooltipKey} />
                                </span>
                                {isIncluded ? (
                                    showTick ? (
                                        <img
                                            src="/images/product-detail/teminat-tick.svg"
                                            alt="Dahil"
                                            className="pp-coverage-icon-status"
                                        />
                                    ) : (
                                        <span className="pp-coverage-value-text">
                                            {displayValue}
                                        </span>
                                    )
                                ) : (
                                    // optimalCoverage'dan gelen değer undefined/null ise boş bırak
                                    <span className="pp-coverage-value-text">&nbsp;</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Divider */}
                <div className="pp-quote-divider" />

                {/* BÖLÜM 4: Fiyat ve Taksit */}
                <div className="pp-quote-section pp-quote-price-section">
                    <p className="pp-quote-price">
                        {currentPremium?.formattedGrossPremium || currentPremium?.grossPremium?.toLocaleString('tr-TR')} ₺
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

                {/* BÖLÜM 5: Satın Al Butonu */}
                <div className="pp-quote-section pp-quote-buy-section">
                    <button
                        className="pp-btn-buy"
                        onClick={handlePurchase}
                    >
                        Satın Al
                    </button>
                </div>
            </div>

            {/* Details Toggle */}
            <div className="pp-quote-details-toggle">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`pp-details-toggle-button ${isExpanded ? 'pp-toggle-expanded' : 'pp-toggle-collapsed'}`}
                >
                    <span className={isExpanded ? 'pp-toggle-text-less' : 'pp-toggle-text-more'}>
                        {isExpanded ? 'Daha Az' : 'Teminatlar & Teklif Detayları'}
                    </span>
                    <svg
                        className={`pp-chevron-small ${isExpanded ? 'pp-chevron-rotated' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {isExpanded && (
                    <div className="pp-quote-details-content">
                        {/* Tab Buttons */}
                        {/* <div className="pp-details-tabs">
                            <button
                                className={`pp-details-tab ${activeTab === 'coverages' ? 'pp-tab-active' : ''}`}
                                onClick={() => setActiveTab('coverages')}
                            >
                                Teminatlar
                            </button>
                        </div> */}

                        {/* Tab Content */}
                        <div className="pp-tab-content">
                            <div className="pp-coverages-layout">
                                {/* Teminatlar Grid - Tüm teminatları göster (dahil olmayanlar X ile) */}
                                <div className="pp-coverages-grid">
                                    {allCoverages
                                        .filter((g) => {
                                            // Ana teminatlarda gösterilenleri filtrele
                                            const mainLabels = mainCoverages.map(c => c.label);
                                            return !mainLabels.includes(g.label);
                                        })
                                        .map((guarantee) => {
                                            // valueText zaten coverageUtils'den formatlanmış geliyor
                                            const displayValue = guarantee.valueText || formatGuaranteeValue(guarantee);
                                            const isIncluded = isCoverageIncluded(guarantee as Guarantee & { isIncluded?: boolean });
                                            const showTick = shouldShowTickOnly(displayValue);
                                            const tooltipKey = getTooltipKey(guarantee.label);
                                            // InsurScan/pdf tarafından okunamayan teminatlar için (boş değer)
                                            const isUnknown = !isIncluded && (!displayValue || displayValue.trim() === '');

                                            return (
                                                <div key={guarantee.insuranceGuaranteeId} className="pp-coverage-item">
                                                    <span className="pp-coverage-item-label">
                                                        {guarantee.label}
                                                        <CoverageTooltip branch="tss" coverageKey={tooltipKey} />
                                                    </span>
                                                    <div className="pp-coverage-item-value">
                                                        {isIncluded ? (
                                                            showTick ? (
                                                                <img
                                                                    src="/images/product-detail/teminat-tick.svg"
                                                                    alt="Dahil"
                                                                    className="pp-coverage-item-icon"
                                                                />
                                                            ) : (
                                                                <span className="pp-coverage-item-price">{displayValue}</span>
                                                            )
                                                        ) : (
                                                            // optimalCoverage'dan gelen değer undefined/null ise boş bırak
                                                            <span className="pp-coverage-item-price">&nbsp;</span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>

                                {/* Butonlar */}
                                <div className="pp-coverages-actions">
                                    <button
                                        className="pp-coverage-action-btn pp-btn-details"
                                        onClick={() => onOpenModal(quote)}
                                    >
                                        <i className="icon-info-button pp-btn-icon"></i>
                                        <span>Teminat Detayları</span>
                                    </button>
                                    <button
                                        className="pp-coverage-action-btn pp-btn-document"
                                        onClick={() => onViewDocument(proposalId, quote.id)}
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
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TssQuoteCard;
