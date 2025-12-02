/**
 * KaskoProductQuote
 * 
 * Teklif karşılaştırma componenti
 * Refactored: Utility fonksiyonları ve hook'lar ayrıştırıldı
 */

'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';

// Components
import QuoteLoadingScreen from '@/components/common/QuoteLoadingScreen';
import CoverageDetailsModal from '../shared/CoverageDetailsModal';
import QuoteComparisonModal from '../shared/QuoteComparisonModal';
import { QuoteList } from './components/quote';
import { KaskoStepper } from './components/common';

// Hooks
import { useKaskoQuotes } from './hooks/useKaskoQuotes';

// Utils
import { preparePurchaseData, savePurchaseDataToStorage, getSelectedPremium } from './utils/quoteUtils';
import { pushKaskoPurchaseClick } from './utils/dataLayerUtils';
import { isIOS, createPlaceholderWindow, fetchAndOpenPdf } from '../shared/utils/pdfUtils';

// Types
import type { ProcessedQuote } from './types';

interface KaskoProductQuoteProps {
  proposalId: string;
  onBack?: () => void;
  onPurchaseClick?: (quoteId: string) => void;
}

const KaskoProductQuote = ({ proposalId, onBack, onPurchaseClick }: KaskoProductQuoteProps) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const agencyConfig = useAgencyConfig();

  // Hook'tan teklif verilerini al
  const {
    quotes,
    isLoading,
    error,
    progress,
    handleInstallmentChange,
  } = useKaskoQuotes(proposalId);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuoteForModal, setSelectedQuoteForModal] = useState<ProcessedQuote | null>(null);
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
      
      const purchaseData = preparePurchaseData(quoteForPurchase, proposalId);
      savePurchaseDataToStorage(purchaseData, proposalId);

      console.log('✅ Purchase data saved to localStorage:', purchaseData);

      // DataLayer push
      const premium = getSelectedPremium(quoteForPurchase);
      pushKaskoPurchaseClick(quoteId, selectedFullQuote.company, premium?.grossPremium);

      // Callback
      if (onPurchaseClick) {
        console.log('✅ Calling onPurchaseClick callback');
        onPurchaseClick(quoteId);
      } else {
        console.log('⚠️ No onPurchaseClick callback, redirecting to new page');
        window.location.href = `/kasko/purchase/${proposalId}`;
      }
    } else {
      console.error('❌ Quote not found or not active:', quoteId);
    }
  };

  const handleOpenModal = (quote: ProcessedQuote) => {
    setSelectedQuoteForModal(quote);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuoteForModal(null);
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
          <KaskoStepper activeStep={2} />

          <div className="product-page-form pp-form-wide">
            <QuoteLoadingScreen
              title="Kasko Sigortası Teklifleri"
              subtitle="Size en uygun Kasko Sigortası teklifini seçip hemen satın alabilirsiniz."
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
          <KaskoStepper activeStep={2} />

          <div className="product-page-form pp-form-wide">
            <div className="pp-card">
              <div className="pp-quote-error-container">
                <div className="pp-quote-error-content">
                  <span className='pp-card-title'>Kasko Sigortası Teklifleri</span>
                </div>
                <img src="/images/product-detail/error-x.svg" alt="Kasko Sigortası Teklifleri" className="pp-error-image" />
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
        <KaskoStepper activeStep={2} />

        <div className="product-page-form pp-form-wide">
          <QuoteList
            quotes={quotes}
            proposalId={proposalId}
            onInstallmentChange={handleInstallmentChange}
            onPurchase={handlePurchase}
            onOpenModal={handleOpenModal}
            onViewDocument={handleViewDocument}
            onOpenComparisonModal={handleOpenComparisonModal}
            loadingDocumentQuoteId={loadingDocumentQuoteId}
          />
        </div>
      </div>

      {/* Teminat Detayları Modal */}
      <CoverageDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        quote={quotes.find(q => q.id === selectedQuoteForModal?.id) || selectedQuoteForModal}
        onPurchase={handlePurchase}
        onInstallmentChange={handleInstallmentChange}
        agencyPhoneNumber={agencyConfig.agency?.contact?.phone?.primary || '0850 404 04 04'}
      />

      {/* Comparison Modal */}
      <QuoteComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={handleCloseComparisonModal}
        allQuotes={quotes}
        onPurchase={handlePurchase}
      />
    </>
  );
};

export default KaskoProductQuote;
