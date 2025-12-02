

'use client';

import { useState } from 'react';
import type { ProcessedQuote, Premium } from '../../hooks/useKonutQuotes';
import type { KonutCoverage } from '../../types';
import CoverageTooltip from '@/components/ProductPageFlow/shared/CoverageTooltip';
import { pushKonutPurchaseClick } from '../../utils/dataLayerUtils';

// API field to label mapping - Ana teminatlar için kısa isimler
const KONUT_COVERAGE_LABELS_SHORT: Record<string, string> = {
    hirsizlik: 'Eşya',
    elektronikCihaz: 'Elektronik Cihaz',
    tesisatVeElektrikArizalari: 'Tesisat ve Elektrik Arızaları',
    cilingirHizmetleri: 'Çilingir Hizmetleri',
};

// API field to label mapping - Detay/Tab/Modal için bedelli isimler
const KONUT_COVERAGE_LABELS: Record<string, string> = {
    camKirilmasi: 'Cam Bedeli',
    elektronikCihaz: 'Elektronik Cihaz Bedeli',
    tesisatVeElektrikArizalari: 'Tesisat ve Elektrik Arızaları',
    cilingirHizmetleri: 'Çilingir Hizmetleri',
    binaYanginYildirimInfilak: 'Bina Yangın Yıldırım İnfilak',
    yanginMaliMesuliyet: 'Yangın Mali Mesuliyet',
    firtina: 'Fırtına',
    karAgirligi: 'Kar Ağırlığı',
    duman: 'Duman',
    yerKaymasi: 'Yer Kayması',
    dolu: 'Dolu',
    dahiliSu: 'Dahili Su',
    karaVeHavaTasitlariCarpmasi: 'Kara ve Hava Taşıtları Çarpması',
    enkazKaldirmaMasraflari: 'Enkaz Kaldırma Masrafları',
    ferdiKaza: 'Ferdi Kaza',
    hukuksalKoruma: 'Hukuksal Koruma',
    selSuBaskini: 'Sel Su Baskını',
    hirsizlik: 'Eşya Bedeli',
    kiraKaybi: 'Kira Kaybı',
    ikametgahDegisikligiMasraflari: 'İkametgah Değişikliği Masrafları',
    izolasyon: 'İzolasyon Bedeli',
    kombiVeKlimaBakimi: 'Kombi ve Klima Bakımı',
};

// Main coverages (first 4 on card) - Eşya (hirsizlik), Elektronik Cihaz, Tesisat, Çilingir
const MAIN_COVERAGE_KEYS = ['hirsizlik', 'elektronikCihaz', 'tesisatVeElektrikArizalari', 'cilingirHizmetleri'];

// All coverages for expanded view (tab/modal) - bedelleriyle gösterilecek
const ALL_COVERAGE_KEYS = [
    'hirsizlik', // Eşya Bedeli
    'elektronikCihaz', // Elektronik Cihaz Bedeli
    'camKirilmasi', // Cam Bedeli
    'izolasyon', // İzolasyon Bedeli
    'binaYanginYildirimInfilak',
    'yanginMaliMesuliyet',
    'firtina',
    'karAgirligi',
    'duman',
    'yerKaymasi',
    'dolu',
    'dahiliSu',
    'karaVeHavaTasitlariCarpmasi',
    'enkazKaldirmaMasraflari',
    'ferdiKaza',
    'hukuksalKoruma',
    'selSuBaskini',
    'tesisatVeElektrikArizalari',
    'cilingirHizmetleri',
    'kiraKaybi',
    'ikametgahDegisikligiMasraflari',
    'kombiVeKlimaBakimi',
];

// Format coverage value from API response
const formatCoverageValue = (value: any): { text: string; isIncluded: boolean } => {
    if (!value) return { text: 'Dahil Değil', isIncluded: false };

    if (typeof value === 'object' && value.$type) {
        switch (value.$type) {
            case 'DECIMAL':
                return { 
                    text: `${value.value?.toLocaleString('tr-TR')} ₺`, 
                    isIncluded: true 
                };
            case 'NUMBER':
                return { 
                    text: `${value.value} Adet`, 
                    isIncluded: true 
                };
            case 'PERCENT':
                return { 
                    text: `%${value.value}`, 
                    isIncluded: true 
                };
            case 'INCLUDED':
                return { text: 'Dahil', isIncluded: true };
            case 'LIMITLESS':
                return { text: 'Limitsiz', isIncluded: true };
            case 'NOT_INCLUDED':
            case 'UNDEFINED':
                return { text: 'Dahil Değil', isIncluded: false };
            default:
                return { text: '-', isIncluded: false };
        }
    }

    // String or number value
    if (typeof value === 'number') {
        return { text: `${value.toLocaleString('tr-TR')} ₺`, isIncluded: true };
    }

    return { text: String(value), isIncluded: true };
};

// Get coverages from API response (for main card - short labels)
const getMainCoveragesFromApi = (coverage: KonutCoverage | null | undefined, keys: string[]) => {
    if (!coverage) return [];

    return keys
        .filter(key => coverage[key as keyof KonutCoverage] !== undefined)
        .map(key => {
            const value = coverage[key as keyof KonutCoverage];
            const formatted = formatCoverageValue(value);
            return {
                key,
                label: KONUT_COVERAGE_LABELS_SHORT[key] || KONUT_COVERAGE_LABELS[key] || key,
                ...formatted,
            };
        });
};

// Get coverages from API response (for tab/modal - full labels with amounts)
// Tüm teminatları göster, undefined olanlar da dahil (boş değer ile)
const getCoveragesFromApi = (coverage: KonutCoverage | null | undefined, keys: string[]) => {
    if (!coverage) return [];

    return keys.map(key => {
        const value = coverage[key as keyof KonutCoverage];
        // Değer yoksa veya undefined ise boş göster
        if (value === undefined || value === null) {
            return {
                key,
                label: KONUT_COVERAGE_LABELS[key] || key,
                text: '',
                isIncluded: false,
                isUndefined: true,
            };
        }
        const formatted = formatCoverageValue(value);
        // UNDEFINED type kontrolü
        const isUndefined = typeof value === 'object' && value.$type === 'UNDEFINED';
        return {
            key,
            label: KONUT_COVERAGE_LABELS[key] || key,
            ...formatted,
            isUndefined,
        };
    });
};

interface KonutQuoteCardProps {
    quote: ProcessedQuote;
    proposalId: string;
    onInstallmentChange: (quoteId: string, installmentNumber: number) => void;
    onPurchase: (quoteId: string) => void;
    onViewDocument: (productId: string) => void;
    isLoadingDocument?: boolean;
    onOpenModal?: () => void;
}

const KonutQuoteCard = ({
    quote,
    proposalId,
    onInstallmentChange,
    onPurchase,
    onViewDocument,
    isLoadingDocument = false,
    onOpenModal,
}: KonutQuoteCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isInstallmentsOpen, setIsInstallmentsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'campaigns' | 'coverages'>('campaigns');

    const currentPremium = quote.premiums.find(p => p.installmentNumber === quote.selectedInstallmentNumber);
    
    // Get coverages from optimalCoverage
    const coverage = quote.optimalCoverage;
    const mainCoverages = getMainCoveragesFromApi(coverage, MAIN_COVERAGE_KEYS);
    const extraCoverages = getCoveragesFromApi(coverage, ALL_COVERAGE_KEYS);

    const handleInstallmentSelect = (installmentNumber: number) => {
        onInstallmentChange(quote.id, installmentNumber);
        setIsInstallmentsOpen(false);
    };

    const handlePurchase = () => {
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
        pushKonutPurchaseClick(quote.id, quote.company, currentPremium?.grossPremium);
        
        onPurchase(quote.id);
    };

    return (
        <div className="pp-quote-card">
            {/* Konut Badge */}
            <div className="pp-quote-tier-badge">
                <span>Konut Sigortası</span>
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

                {/* BÖLÜM 2: Ana 4 Teminat */}
                <div className="pp-quote-section pp-quote-main-coverages">
                    {mainCoverages.map((coverage, index) => (
                        <div key={index} className="pp-coverage-row">
                            <span className="pp-coverage-label">
                                {coverage.label}
                                <CoverageTooltip branch="konut" coverageKey={coverage.key} />
                            </span>
                            {coverage.isIncluded ? (
                                <img
                                    src="/images/product-detail/teminat-tick.svg"
                                    alt="Dahil"
                                    className="pp-coverage-icon-status"
                                />
                            ) : (
                                // optimalCoverage'dan gelen değer undefined/null ise boş bırak
                                <span className="pp-coverage-value-text">&nbsp;</span>
                            )}
                        </div>
                    ))}
                </div>
                <div className="pp-quote-divider" />
                <div className="pp-quote-section pp-quote-additional-coverages">
                   
                </div>

                {/* Divider */}
                <div className="pp-quote-divider" />

                {/* BÖLÜM 4: Fiyat ve Taksit */}
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
                        {isExpanded ? 'Daha Az' : 'Kampanyalar & Teklif Detayları'}
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
                        <div className="pp-details-tabs">
                            <button
                                className={`pp-details-tab ${activeTab === 'campaigns' ? 'pp-tab-active' : ''}`}
                                onClick={() => setActiveTab('campaigns')}
                            >
                                Kampanyalar
                            </button>
                            <button
                                className={`pp-details-tab ${activeTab === 'coverages' ? 'pp-tab-active' : ''}`}
                                onClick={() => setActiveTab('coverages')}
                            >
                                Teminatlar
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'campaigns' ? (
                            <div className="pp-tab-content">
                                <div className="pp-campaigns-grid">
                                    {/* Kampanya Kutusu - A101 Hediye Çeki */}
                                    <div className="pp-campaign-box">
                                        <div className="pp-campaign-header">
                                            <span className="pp-campaign-title">Katılım Konut Sigortası yaptırana A101'den 1000 TL'lik hediye çeki!</span>
                                        </div>
                                        <p className="pp-campaign-desc">
                                            Konut sigortanızı yaptırın, poliçe primine göre 200 TL'den 1.000 TL'ye varan A101 dijital hediye çeki kazanın!
                                        </p>
                                        <div className="pp-campaign-footer">
                                            <label className="pp-campaign-radio">
                                                <input type="radio" name={`campaign-${quote.id}`} value="a101-hediye" defaultChecked />
                                                <span className="pp-campaign-radio-label">Kampanyayı Seç</span>
                                            </label>
                                            <a href="/kampanyalar/a101-hediye-ceki-kampanyasi" target="_blank" className="pp-campaign-link">
                                                Detaylı Bilgi
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                                </svg>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="pp-tab-content">
                                <div className="pp-coverages-layout">
                                    {/* Ek Konut Teminatları - Text formatında değer göster */}
                                    <div className="pp-coverages-grid">
                                        {extraCoverages.map((coverage, index) => (
                                            <div key={index} className="pp-coverage-item">
                                                <span className="pp-coverage-item-label">
                                                    {coverage.label}
                                                    <CoverageTooltip branch="konut" coverageKey={coverage.key} />
                                                </span>
                                                <div className="pp-coverage-item-value">
                                                    {coverage.isUndefined || !coverage.isIncluded ? (
                                                        // UNDEFINED veya NOT_INCLUDED ise boş bırak
                                                        <span className="pp-coverage-value-text">&nbsp;</span>
                                                    ) : coverage.text === 'Dahil' || coverage.text === 'Limitsiz' ? (
                                                        <img
                                                            src="/images/product-detail/teminat-tick.svg"
                                                            alt="Dahil"
                                                            className="pp-coverage-item-icon"
                                                        />
                                                    ) : (
                                                        <span className="pp-coverage-value-text">{coverage.text}</span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Butonlar */}
                                    <div className="pp-coverages-actions">
                                        {onOpenModal && (
                                            <button
                                                className="pp-coverage-action-btn pp-btn-details"
                                                onClick={onOpenModal}
                                            >
                                                <i className="icon-info-button pp-btn-icon"></i>
                                                <span>Teminat Detayları</span>
                                            </button>
                                        )}
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
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default KonutQuoteCard;

