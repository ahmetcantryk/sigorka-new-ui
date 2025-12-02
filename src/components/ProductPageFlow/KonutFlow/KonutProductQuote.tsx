/**
 * Konut Flow - Product Quote Component
 * 
 * Konut tekliflerini listeler ve karşılaştırma/satın alma işlemlerini yönetir
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useKonutQuotes, QuoteErrorType } from './hooks/useKonutQuotes';
import KonutQuoteList from './components/quote/KonutQuoteList';
import QuoteLoadingScreen from '@/components/common/QuoteLoadingScreen';
import QuoteComparisonModal from '../shared/QuoteComparisonModal';
import CoverageDetailsModal from '../shared/CoverageDetailsModal';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';
import { isIOS, createPlaceholderWindow, fetchAndOpenPdf } from '../shared/utils/pdfUtils';
import type { ProcessedQuote, KonutCoverage } from './hooks/useKonutQuotes';

// Konut Stepper Component
const KonutStepper = ({ activeStep }: { activeStep: number }) => (
    <div className="pp-stepper">
        <div className={`pp-step ${activeStep > 0 ? 'completed' : activeStep === 0 ? 'active' : ''}`}>
            <div className="pp-step-visual"><span>1</span></div>
            <div className="pp-step-label"><span>Kişisel</span><span>Bilgiler</span></div>
        </div>
        <div className={`pp-step ${activeStep > 1 ? 'completed' : activeStep === 1 ? 'active' : ''}`}>
            <div className="pp-step-visual"><span>2</span></div>
            <div className="pp-step-label"><span>Konut</span><span>Bilgileri</span></div>
        </div>
        <div className={`pp-step ${activeStep > 2 ? 'completed' : activeStep === 2 ? 'active' : ''}`}>
            <div className="pp-step-visual"><span>3</span></div>
            <div className="pp-step-label"><span>Teklif</span><span>Karşılaştırma</span></div>
        </div>
        <div className={`pp-step ${activeStep > 3 ? 'completed' : activeStep === 3 ? 'active' : ''}`}>
            <div className="pp-step-visual"><span>4</span></div>
            <div className="pp-step-label"><span>Ödeme</span></div>
        </div>
    </div>
);

// Coverage labels for Konut - Teminat Detay ve Karşılaştırma için bedelli isimler
const KONUT_COVERAGE_LABELS: Record<string, string> = {
    hirsizlik: 'Eşya Bedeli',
    elektronikCihaz: 'Elektronik Cihaz Bedeli',
    camKirilmasi: 'Cam Bedeli',
    izolasyon: 'İzolasyon Bedeli',
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
    kiraKaybi: 'Kira Kaybı',
    ikametgahDegisikligiMasraflari: 'İkametgah Değişikliği Masrafları',
    kombiVeKlimaBakimi: 'Kombi ve Klima Bakımı',
};

// Format coverage value for modal display
const formatCoverageValue = (value: any): string => {
    if (!value) return 'Dahil Değil';

    if (typeof value === 'object' && value.$type) {
        switch (value.$type) {
            case 'DECIMAL':
                return `${value.value?.toLocaleString('tr-TR')} ₺`;
            case 'NUMBER':
                return `${value.value} Adet`;
            case 'PERCENT':
                return `%${value.value}`;
            case 'INCLUDED':
                return 'Dahil';
            case 'LIMITLESS':
                return 'Limitsiz';
            case 'NOT_INCLUDED':
            case 'UNDEFINED':
                return 'Dahil Değil';
            default:
                return '-';
        }
    }

    if (typeof value === 'number') {
        return `${value.toLocaleString('tr-TR')} ₺`;
    }

    return String(value);
};

interface KonutProductQuoteProps {
    proposalId: string;
    onPurchaseClick: (quoteId: string) => void;
    onBack: () => void;
    onRestart?: () => void;
}

const KonutProductQuote = ({ proposalId, onPurchaseClick, onBack, onRestart }: KonutProductQuoteProps) => {
    const { quotes, isLoading, error, errorType, progress, handleInstallmentChange } = useKonutQuotes(proposalId);
    const agencyConfig = useAgencyConfig();

    const [selectedQuotesForComparison, setSelectedQuotesForComparison] = useState<string[]>([]);
    const [showComparison, setShowComparison] = useState(false);
    const [loadingDocumentQuoteId, setLoadingDocumentQuoteId] = useState<string | null>(null);
    
    // Coverage details modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedQuoteForModal, setSelectedQuoteForModal] = useState<ProcessedQuote | null>(null);

    // Handle auth error - redirect to step 1
    useEffect(() => {
        if (errorType === 'AUTH_ERROR' && onRestart) {
            const timer = setTimeout(() => {
                onRestart();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [errorType, onRestart]);

    // Purchase handler - karşılaştırma modalından gelen taksit bilgisini destekler
    const handlePurchase = (quoteId: string, installmentNumber?: number) => {
        console.log('🛒 handlePurchase called with quoteId:', quoteId, 'installmentNumber:', installmentNumber);

        const selectedFullQuote = quotes.find(q => q.id === quoteId);

        if (selectedFullQuote && selectedFullQuote.state === 'ACTIVE') {
            // Eğer karşılaştırma modalından taksit bilgisi geldiyse, quote'u override et
            // Aksi halde mevcut selectedInstallmentNumber kullan
            const quoteForPurchase = installmentNumber !== undefined 
                ? { ...selectedFullQuote, selectedInstallmentNumber: installmentNumber }
                : selectedFullQuote;
            
            // Storage'a güncellenmiş quote'u kaydet
            localStorage.setItem('selectedKonutQuote', JSON.stringify(quoteForPurchase));
            
            // Original callback'i çağır
            onPurchaseClick(quoteId);
        }
    };

    const handleCompareToggle = (quoteId: string) => {
        setSelectedQuotesForComparison(prev => {
            if (prev.includes(quoteId)) {
                return prev.filter(id => id !== quoteId);
            }
            if (prev.length >= 4) {
                return prev;
            }
            return [...prev, quoteId];
        });
    };

    const handleOpenComparisonModal = () => {
        if (quotes.length < 2) {
            return;
        }
        setShowComparison(true);
    };

    const handleOpenModal = (quote: ProcessedQuote) => {
        setSelectedQuoteForModal(quote);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedQuoteForModal(null);
    };

    const handleViewDocument = async (productId: string) => {
        // iOS için popup blocker'ı aşmak için kullanıcı etkileşimi sırasında window aç
        const placeholderWindow = isIOS() ? createPlaceholderWindow() : null;
        
        setLoadingDocumentQuoteId(productId);
        try {
            const response = await fetchWithAuth(API_ENDPOINTS.PROPOSAL_PRODUCT_DOCUMENT(proposalId, productId));
            if (!response.ok) throw new Error('Belge alınamadı');

            const data = await response.json();
            if (data.url) {
                await fetchAndOpenPdf(data.url, placeholderWindow);
            }
        } catch (err) {
            console.error(err);
            // Hata durumunda placeholder window'u kapat
            if (placeholderWindow && !placeholderWindow.closed) {
                placeholderWindow.close();
            }
        } finally {
            setLoadingDocumentQuoteId(null);
        }
    };

    // Filter quotes for modal
    const comparisonQuotes = selectedQuotesForComparison.length > 0
        ? quotes.filter(q => selectedQuotesForComparison.includes(q.id))
        : quotes;

    // Transform quotes for CoverageDetailsModal - convert optimalCoverage to guarantees format
    const getQuoteWithKonutCoverages = (quote: ProcessedQuote | null) => {
        if (!quote) return null;
        
        const coverage = quote.optimalCoverage;
        if (!coverage) {
            return {
                ...quote,
                insuranceCompanyGuarantees: [],
            };
        }

        const guarantees = Object.keys(KONUT_COVERAGE_LABELS)
            .filter(key => coverage[key as keyof KonutCoverage] !== undefined)
            .map((key, index) => {
                const value = coverage[key as keyof KonutCoverage];
                return {
                    insuranceGuaranteeId: `konut-${index}`,
                    label: KONUT_COVERAGE_LABELS[key],
                    valueText: formatCoverageValue(value),
                    amount: 0,
                    coverageKey: key,  // Info icon için coverage key
                    branch: 'konut',   // Info icon için branch
                };
            });

        return {
            ...quote,
            insuranceCompanyGuarantees: guarantees,
        };
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="product-page-flow-container">
                <KonutStepper activeStep={2} />
                <div className="product-page-form pp-form-wide">
                    <QuoteLoadingScreen
                        title="Konut Sigortası Teklifleri"
                        subtitle="Size en uygun Konut Sigortası teklifini seçip hemen satın alabilirsiniz."
                        description="Anlaşmalı şirketlerimizden size özel teklifler alınıyor..."
                        progress={progress}
                    />
                </div>
            </div>
        );
    }

    // Auth error - show message and redirect
    if (errorType === 'AUTH_ERROR') {
        return (
            <div className="product-page-flow-container">
                <KonutStepper activeStep={2} />
                <div className="product-page-form pp-form-wide">
                    <div className="pp-card">
                        <div className="pp-quote-error-container">
                            <div className="pp-quote-error-content">
                                <span className='pp-card-title'>Konut Sigortası Teklifleri</span>
                            </div>
                            <img src="/images/product-detail/error-x.svg" alt="Oturum Hatası" className="pp-error-image" />
                            <span className="pp-error-card-title">
                                <span className="pp-error-ups">Ups!</span> Oturum Süreniz Doldu
                            </span>
                            <p className="pp-error-message-card-desc">
                                Oturum süreniz dolmuştur. Lütfen tekrar giriş yapınız.
                            </p>
                            <div className="pp-button-group">
                                <button className="pp-btn-submit" onClick={onRestart || onBack}>
                                    Baştan Başla
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error or no quotes - "Ups" screen
    if (error || quotes.length === 0) {
        return (
            <div className="product-page-flow-container">
                <KonutStepper activeStep={2} />
                <div className="product-page-form pp-form-wide">
                    <div className="pp-card">
                        <div className="pp-quote-error-container">
                            <div className="pp-quote-error-content">
                                <span className='pp-card-title'>Konut Sigortası Teklifleri</span>
                            </div>
                            <img src="/images/product-detail/error-x.svg" alt="Hata" className="pp-error-image" />
                            <span className="pp-error-card-title">
                                <span className="pp-error-ups">Ups!</span> Uygun teklif bulunamadı
                            </span>
                            <p className="pp-error-message-card-desc">
                                Konut bilgilerinize göre uygun teklif bulunamadı. Bilgilerinizi kontrol edip tekrar deneyebilirsiniz.
                            </p>
                            <div className="pp-button-group">
                                <button className="pp-btn-submit" onClick={onBack}>
                                    Konut Bilgilerini Güncelle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main render - quotes list
    return (
        <div className="product-page-flow-container">
            <KonutStepper activeStep={2} />

            <div className="product-page-form pp-form-wide">
                <KonutQuoteList
                    quotes={quotes}
                    proposalId={proposalId}
                    onInstallmentChange={handleInstallmentChange}
                    onPurchase={handlePurchase}
                    onViewDocument={handleViewDocument}
                    loadingDocumentQuoteId={loadingDocumentQuoteId}
                    onOpenComparisonModal={handleOpenComparisonModal}
                    onOpenModal={handleOpenModal}
                />
            </div>

            {/* Teminat Detayları Modal */}
            <CoverageDetailsModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                quote={getQuoteWithKonutCoverages(quotes.find(q => q.id === selectedQuoteForModal?.id) || selectedQuoteForModal) as any}
                onPurchase={handlePurchase}
                onInstallmentChange={handleInstallmentChange}
                agencyPhoneNumber={agencyConfig.agency?.contact?.phone?.primary || '0850 404 04 04'}
            />

            {/* Comparison Modal */}
            {showComparison && (
                <QuoteComparisonModal
                    isOpen={showComparison}
                    onClose={() => setShowComparison(false)}
                    allQuotes={comparisonQuotes.map(q => getQuoteWithKonutCoverages(q)) as any[]}
                    onPurchase={handlePurchase}
                />
            )}
        </div>
    );
};

export default KonutProductQuote;
