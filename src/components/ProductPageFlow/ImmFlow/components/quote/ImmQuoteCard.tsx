/**
 * İMM Flow - Quote Card Bileşeni
 * 
 * Tek bir İMM teklif kartını render eder
 * Trafik yapısından adapte edildi
 * 
 * Ana teminatlar (sıralama - paket bazlı sabit değerler):
 * 1. İMM Limiti
 * 2. Hukuki Koruma (Araca Bağlı)
 * 3. Hukuki Koruma (Sürücüye Bağlı)
 * 4. Yetkili Olmayan Kişilere Çektirme
 */

'use client';

import { useState } from 'react';
import type { ProcessedImmQuote } from '../../types';
import { getSelectedImmPremium } from '../../utils/quoteUtils';
import { getImmPackageCoverages, IMM_MAIN_COVERAGE_LABELS } from '../../config/immConstants';
import CoverageTooltip from '@/components/ProductPageFlow/shared/CoverageTooltip';

interface ImmQuoteCardProps {
  quote: ProcessedImmQuote;
  proposalId: string;
  onInstallmentChange: (quoteId: string, installmentNumber: number) => void;
  onPurchase: (quoteId: string) => void;
  onViewDocument: (proposalId: string, productId: string) => void;
  isLoadingDocument?: boolean;
}

const ImmQuoteCard = ({
  quote,
  proposalId,
  onInstallmentChange,
  onPurchase,
  onViewDocument,
  isLoadingDocument = false,
}: ImmQuoteCardProps) => {
  const [isInstallmentsOpen, setIsInstallmentsOpen] = useState(false);

  const currentPremium = getSelectedImmPremium(quote);
  
  // Paket ismine göre sabit teminatları al
  const packageCoverages = getImmPackageCoverages(quote.coverageGroupName);

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
    localStorage.setItem('selectedQuoteForPurchaseImm', JSON.stringify(quoteDataForPurchase));
    localStorage.setItem('selectedInstallmentNumber', quote.selectedInstallmentNumber.toString());
    
    onPurchase(quote.id);
  };

  // Ana 4 teminat
  const mainCoverages = [
    { label: IMM_MAIN_COVERAGE_LABELS.immLimit, value: packageCoverages.immLimit },
    { label: IMM_MAIN_COVERAGE_LABELS.hukukiKorumaAraca, value: packageCoverages.hukukiKorumaAraca },
    { label: IMM_MAIN_COVERAGE_LABELS.hukukiKorumaSurucu, value: packageCoverages.hukukiKorumaSurucu },
    { label: IMM_MAIN_COVERAGE_LABELS.yetkiliOlmayanCektirme, value: packageCoverages.yetkiliOlmayanCektirme },
  ];

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
            />
          </div>
        </div>

        {/* Divider */}
        <div className="pp-quote-divider" />

        {/* BÖLÜM 2: Ana 4 Teminat (Paket bazlı sabit değerler) */}
        <div className="pp-quote-section pp-quote-main-coverages pp-quote-main-coverages-4 small-quotes">
          {mainCoverages.map((coverage, index) => (
            <div key={index} className="pp-coverage-row">
              <span className="pp-coverage-label">
                {coverage.label}
                <CoverageTooltip branch="imm" coverageKey={coverage.label} />
              </span>
              {coverage.value && coverage.value !== '-' ? (
                <span className="pp-coverage-value-text">
                  {coverage.value}
                </span>
              ) : (
                // Değer yoksa veya '-' ise boş bırak
                <span className="pp-coverage-value-text">&nbsp;</span>
              )}
            </div>
          ))}
        </div>

        {/* Divider */}

        {/* BÖLÜM 2.5: Teklif Belgesi Butonu */}
        <div className="pp-quote-section pp-quote-document-section">
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

export default ImmQuoteCard;
