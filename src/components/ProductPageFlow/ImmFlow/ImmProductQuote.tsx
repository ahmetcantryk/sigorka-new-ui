/**
 * ImmProductQuote
 * 
 * İMM teklif karşılaştırma componenti
 * Trafik'ten birebir adapte edildi
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';

// Components
import QuoteLoadingScreen from '@/components/common/QuoteLoadingScreen';
import QuoteComparisonModal from '../shared/QuoteComparisonModal';
import { ImmQuoteList } from './components/quote';
import { ImmStepper } from './components/common';

// Hooks
import { useImmQuotes } from './hooks/useImmQuotes';

// Utils
import { prepareImmPurchaseData, saveImmPurchaseDataToStorage, getSelectedImmPremium } from './utils/quoteUtils';
import { pushImmPurchaseClick } from './utils/dataLayerUtils';
import { isIOS, createPlaceholderWindow, fetchAndOpenPdf } from '../shared/utils/pdfUtils';

// Types
import type { ProcessedImmQuote } from './types';

interface ImmProductQuoteProps {
  proposalId: string;
  onBack?: () => void;
  onPurchaseClick?: (quoteId: string) => void;
}

const ImmProductQuote = ({ proposalId, onBack, onPurchaseClick }: ImmProductQuoteProps) => {
  const accessToken = useAuthStore((state) => state.accessToken);

  // Hook'tan teklif verilerini al
  const {
    quotes,
    isLoading,
    error,
    progress,
    handleInstallmentChange,
  } = useImmQuotes(proposalId);

  // Modal states
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
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

  // Handlers
  const handlePurchase = (quoteId: string, installmentNumber?: number) => {
    console.log('🛒 handlePurchase called with quoteId:', quoteId, 'installmentNumber:', installmentNumber);

    const selectedFullQuote = quotes.find(q => q.id === quoteId);

    if (selectedFullQuote && selectedFullQuote.state === 'ACTIVE') {
      // Eğer karşılaştırma modalından taksit bilgisi geldiyse, quote'u override et
      const quoteForPurchase = installmentNumber !== undefined 
        ? { ...selectedFullQuote, selectedInstallmentNumber: installmentNumber }
        : selectedFullQuote;
      
      const purchaseData = prepareImmPurchaseData(quoteForPurchase, proposalId);
      saveImmPurchaseDataToStorage(purchaseData, proposalId);

      console.log('✅ Purchase data saved to localStorage:', purchaseData);

      // DataLayer push
      const premium = getSelectedImmPremium(quoteForPurchase);
      pushImmPurchaseClick(quoteId, selectedFullQuote.company, premium?.grossPremium);

      // Callback
      if (onPurchaseClick) {
        console.log('✅ Calling onPurchaseClick callback');
        onPurchaseClick(quoteId);
      } else {
        console.log('⚠️ No onPurchaseClick callback, redirecting to new page');
        window.location.href = `/imm/purchase/${proposalId}`;
      }
    } else {
      // console.error('❌ Quote not found or not active:', quoteId);
    }
  };

  const handleOpenComparisonModal = () => {
    setIsComparisonModalOpen(true);
  };

  const handleCloseComparisonModal = () => {
    setIsComparisonModalOpen(false);
  };

  const handleViewDocument = async (proposalIdParam: string, productIdParam: string) => {
    if (!accessToken) return;
    
    // iOS için popup blocker'ı aşmak için kullanıcı etkileşimi sırasında window aç
    const placeholderWindow = isIOS() ? createPlaceholderWindow() : null;
    
    setLoadingDocumentQuoteId(productIdParam);
    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.PROPOSAL_PRODUCT_DOCUMENT(proposalIdParam, productIdParam),
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) {
        throw new Error('Döküman görüntülenirken bir hata oluştu');
      }

      const data = await response.json();
      if (data.url) {
        await fetchAndOpenPdf(data.url, placeholderWindow);
      }
    } catch (error) {
      console.error('Document view error:', error);
      // Hata durumunda placeholder window'u kapat
      if (placeholderWindow && !placeholderWindow.closed) {
        placeholderWindow.close();
      }
    } finally {
      setLoadingDocumentQuoteId(null);
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <>
        <div className="product-page-flow-container">
          <ImmStepper activeStep={2} />

          <div className="product-page-form pp-form-wide">
            <QuoteLoadingScreen
              title="İMM Sigortası Teklifleri"
              subtitle="Size en uygun İMM Sigortası teklifini seçip hemen satın alabilirsiniz."
              description="Anlaşmalı şirketlerimizden size özel teklifler alınıyor..."
              progress={progress}
            />
          </div>
        </div>
      </>
    );
  }

  // Render error state
  if (error || quotes.length === 0) {
    return (
      <>
        <div className="product-page-flow-container">
          <ImmStepper activeStep={2} />

          <div className="product-page-form pp-form-wide">
            <div className="pp-card">
              <div className="pp-quote-error-container">
                <div className="pp-quote-error-content">
                  <span className='pp-card-title'>İMM Sigortası Teklifleri</span>
                </div>
                <img src="/images/product-detail/error-x.svg" alt="İMM Sigortası Teklifleri" className="pp-error-image" />
                <span className="pp-error-card-title"><span className="pp-error-ups">Ups!</span> Uygun teklif bulunamadı</span>
                <p className="pp-error-message-card-desc">
                  Araç bilgilerinize göre uygun teklif bulunamadı. Bilgilerinizi kontrol edip tekrar deneyebilirsiniz.
                </p>
                {onBack && (
                  <div className="pp-button-group">
                    <button className="pp-btn-submit" onClick={onBack}>
                      Araç Bilgilerini Güncelle
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main render
  return (
    <>
      <div className="product-page-flow-container">
        <ImmStepper activeStep={2} />

        <div className="product-page-form pp-form-wide">
          <ImmQuoteList
            quotes={quotes}
            proposalId={proposalId}
            onInstallmentChange={handleInstallmentChange}
            onPurchase={handlePurchase}
            onViewDocument={handleViewDocument}
            onOpenComparisonModal={handleOpenComparisonModal}
            loadingDocumentQuoteId={loadingDocumentQuoteId}
          />
        </div>
      </div>

      {/* Comparison Modal */}
      <QuoteComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={handleCloseComparisonModal}
        allQuotes={quotes as any}
        onPurchase={handlePurchase}
      />
    </>
  );
};

export default ImmProductQuote;
