/**
 * DASK Flow - Product Quote Component
 * 
 * DASK tekliflerini listeler ve satın alma işlemlerini yönetir
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useDaskQuotes, QuoteErrorType } from './hooks/useDaskQuotes';
import DaskQuoteList from './components/quote/DaskQuoteList';
import QuoteLoadingScreen from '@/components/common/QuoteLoadingScreen';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { isIOS, createPlaceholderWindow, fetchAndOpenPdf } from '../shared/utils/pdfUtils';

// DASK Stepper Component
const DaskStepper = ({ activeStep }: { activeStep: number }) => (
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

interface DaskProductQuoteProps {
    proposalId: string;
    onPurchaseClick: (quoteId: string) => void;
    onBack: () => void;
    onRestart?: () => void; // For auth error - redirect to step 1
}

const DaskProductQuote = ({ proposalId, onPurchaseClick, onBack, onRestart }: DaskProductQuoteProps) => {
    const { quotes, isLoading, error, errorType, progress, handleInstallmentChange } = useDaskQuotes(proposalId);

    const [loadingDocumentQuoteId, setLoadingDocumentQuoteId] = useState<string | null>(null);

    // Sayfa yüklendiğinde en üste scroll
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Teklifler yüklendiğinde de scroll
    useEffect(() => {
        if (!isLoading && quotes.length > 0) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [isLoading, quotes.length]);

    // Handle auth error - redirect to step 1
    useEffect(() => {
        if (errorType === 'AUTH_ERROR' && onRestart) {
            // Small delay to show error message before redirect
            const timer = setTimeout(() => {
                onRestart();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [errorType, onRestart]);

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

    // Loading state
    if (isLoading) {
        return (
            <div className="product-page-flow-container">
                <DaskStepper activeStep={2} />
                <div className="product-page-form pp-form-wide">
                    <QuoteLoadingScreen
                        title="DASK Sigortası Teklifleri"
                        subtitle="Size en uygun DASK Sigortası teklifini seçip hemen satın alabilirsiniz."
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
                <DaskStepper activeStep={2} />
                <div className="product-page-form pp-form-wide">
                    <div className="pp-card">
                        <div className="pp-quote-error-container">
                            <div className="pp-quote-error-content">
                                <span className='pp-card-title'>DASK Sigortası Teklifleri</span>
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
                <DaskStepper activeStep={2} />
                <div className="product-page-form pp-form-wide">
                    <div className="pp-card">
                        <div className="pp-quote-error-container">
                            <div className="pp-quote-error-content">
                                <span className='pp-card-title'>DASK Sigortası Teklifleri</span>
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
            <DaskStepper activeStep={2} />

            <div className="product-page-form pp-form-wide">
                <DaskQuoteList
                    quotes={quotes}
                    proposalId={proposalId}
                    onInstallmentChange={handleInstallmentChange}
                    onPurchase={onPurchaseClick}
                    onViewDocument={handleViewDocument}
                    loadingDocumentQuoteId={loadingDocumentQuoteId}
                />
            </div>
        </div>
    );
};

export default DaskProductQuote;
