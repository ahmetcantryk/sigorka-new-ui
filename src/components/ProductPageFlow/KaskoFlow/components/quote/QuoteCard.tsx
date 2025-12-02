/**
 * Kasko Flow - Quote Card Bileşeni
 * 
 * Tek bir teklif kartını render eder
 */

'use client';

import { useState } from 'react';
import type { ProcessedQuote, Premium } from '../../types';
import {
  getMainCoverages,
  getAdditionalCoverages,
  isCoverageIncluded,
  shouldShowTickX,
  getCoverageDisplayValue,
  formatGuaranteeValue,
  convertCoverageToGuarantees,
} from '../../utils/coverageUtils';
import { getSelectedPremium } from '../../utils/quoteUtils';
import CoverageTooltip from '@/components/ProductPageFlow/shared/CoverageTooltip';

interface QuoteCardProps {
  quote: ProcessedQuote;
  proposalId: string;
  onInstallmentChange: (quoteId: string, installmentNumber: number) => void;
  onPurchase: (quoteId: string) => void;
  onOpenModal: (quote: ProcessedQuote) => void;
  onViewDocument: (proposalId: string, productId: string) => void;
  isLoadingDocument?: boolean;
}

const QuoteCard = ({
  quote,
  proposalId,
  onInstallmentChange,
  onPurchase,
  onOpenModal,
  onViewDocument,
  isLoadingDocument = false,
}: QuoteCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInstallmentsOpen, setIsInstallmentsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'coverages'>('campaigns');

  const currentPremium = getSelectedPremium(quote);
  const mainCoverages = getMainCoverages(quote);
  const additionalCoverages = getAdditionalCoverages(quote);
  
  // optimalCoverage'dan tüm teminatları al (UNDEFINED olanlar dahil)
  const allCoveragesFromOptimal = convertCoverageToGuarantees(quote.optimalCoverage || null);

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
      hasUndamagedDiscount: quote.hasUndamagedDiscount,
      hasUndamagedDiscountRate: quote.hasUndamagedDiscountRate,
    };
    localStorage.setItem('selectedQuoteForPurchase', JSON.stringify(quoteDataForPurchase));
    localStorage.setItem('selectedInstallmentNumber', quote.selectedInstallmentNumber.toString());
    
    onPurchase(quote.id);
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
            />
          </div>
        </div>

        {/* Divider */}
        <div className="pp-quote-divider" />

        {/* BÖLÜM 2: Ana 4 Teminat */}
        <div className="pp-quote-section pp-quote-main-coverages">
          {mainCoverages.map((guarantee, index) => {
            const displayValue = getCoverageDisplayValue(guarantee);
            const isIncluded = isCoverageIncluded(guarantee);
            const showTickXIcon = shouldShowTickX(guarantee);
            // DECIMAL type için amount > 0 ise undefined değil (valueText null olsa bile)
            const isUndefined = guarantee.valueText === 'Belirsiz' || (guarantee.valueText === null && guarantee.amount === 0);

            return (
              <div key={index} className="pp-coverage-row">
                <span className="pp-coverage-label">
                  {guarantee.label}
                  <CoverageTooltip branch="kasko" coverageKey={guarantee.label || ''} />
                </span>
                {showTickXIcon ? (
                  isIncluded ? (
                    <img
                      src="/images/product-detail/teminat-tick.svg"
                      alt="Dahil"
                      className="pp-coverage-icon-status"
                    />
                  ) : (
                    // optimalCoverage'dan gelen değer undefined/null ise boş bırak
                    <span className="pp-coverage-value-text">&nbsp;</span>
                  )
                ) : isUndefined ? (
                  // UNDEFINED/Belirsiz durumunda boş bırak
                  <span className="pp-coverage-value-text">&nbsp;</span>
                ) : (
                  <span className="pp-coverage-value-text">
                    {displayValue || ''}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* BÖLÜM 3: İndirimler */}
        <div className="pp-quote-divider" />
        <div className="pp-quote-section pp-quote-additional-coverages">
          {additionalCoverages.map((item, index) => (
            <div key={index} className="pp-coverage-row">
              <span className="pp-coverage-label">
                {item.hasValue && item.rate !== undefined ? (
                  <>
                    <strong>%{item.rate}</strong> {item.label}
                  </>
                ) : (
                  item.label
                )}
              </span>
              <img
                src={item.hasValue
                  ? "/images/product-detail/teminat-tick-dark.svg"
                  : "/images/product-detail/teminat-x.svg"
                }
                alt={item.hasValue ? "Dahil" : "Dahil Değil"}
                className={item.hasValue ? "pp-coverage-icon-dark" : "pp-coverage-icon-status"}
              />
            </div>
          ))}
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
                  {/* Kampanya Kutusu 1 */}
                  <div className="pp-campaign-box">
                    <div className="pp-campaign-header">
                      <span className="pp-campaign-title">En temiz kasko sigorka.com'da!<br /> Online teklif alın, hemen yaptırın.</span>
                    </div>
                    <p className="pp-campaign-desc">
                      Yılda 3 kez iç–dış araç yıkama, 1 kez periyodik bakım, 2 kez ozon sterilizasyonu ve sağlık hizmetleri ücretsiz!
                    </p>
                    <div className="pp-campaign-footer">
                      <label className="pp-campaign-radio">
                        <input type="radio" name={`campaign-${quote.id}`} value="car-wash" />
                        <span className="pp-campaign-radio-label">Kampanyayı Seç</span>
                      </label>
                      <a href="/kampanyalar/en-temiz-kasko-kampanyasi" target="_blank" className="pp-campaign-link">
                        Detaylı Bilgi
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  {/* Kampanya Kutusu 2 */}
                  <div className="pp-campaign-box">
                    <div className="pp-campaign-header">
                      <span className="pp-campaign-title">Katılım Kasko Sigortası Yaptırana 1000 TL'lik akaryakıt çeki hediye!</span>
                    </div>
                    <p className="pp-campaign-desc">
                      Katılım Kasko sigortanızı yaptırın, 1000 TL'ye varan akaryakıt çeki avantajından yararlanın.
                    </p>
                    <div className="pp-campaign-footer">
                      <label className="pp-campaign-radio">
                        <input type="radio" name={`campaign-${quote.id}`} value="window-film" />
                        <span className="pp-campaign-radio-label">Kampanyayı Seç</span>
                      </label>
                      <a href="/kampanyalar/yakit-ceki-kampanyasi" target="_blank" className="pp-campaign-link">
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
                  {/* Teminatlar Grid - optimalCoverage'dan tüm teminatları göster */}
                  <div className="pp-coverages-grid">
                    {allCoveragesFromOptimal
                      .filter((g) => {
                        // BÖLÜM 2'de gösterilen ana teminatları filtrele
                        const mainCoverageLabels = mainCoverages.map(c => c.label);
                        const isMainCoverage = mainCoverageLabels.some(label => {
                          if (g.label === label) return true;
                          if (label === 'Cam' && (g.label === 'Cam Kırılma Muafiyeti' || g.label === 'Cam')) return true;
                          if (label === 'İMM Limiti' && (g.label === 'İMM Limiti (Ayrımsız)' || g.label === 'İMM Limitli / Limitsiz')) return true;
                          if (label === 'Servis' && (g.label === 'Onarım Servis Türü')) return true;
                          if (label === 'İkame Araç' && (g.label === 'Kiralık Araç' || g.label === 'İkame Araç')) return true;
                          return false;
                        });
                        return !isMainCoverage;
                      })
                      .map((guarantee) => {
                        const displayValue = formatGuaranteeValue(guarantee);
                        const isUndefined = guarantee.valueText === 'Belirsiz';
                        const isNotIncluded = guarantee.valueText === 'Dahil Değil';
                        const showTick = displayValue === 'Dahil' || displayValue === 'Limitsiz' || displayValue === 'Rayiç';
                        const hasValue = displayValue && displayValue !== '' && !isUndefined && !isNotIncluded;

                        return (
                          <div key={guarantee.insuranceGuaranteeId} className="pp-coverage-item">
                            <span className="pp-coverage-item-label">
                              {guarantee.label}
                              <CoverageTooltip branch="kasko" coverageKey={guarantee.label || ''} />
                            </span>
                            <div className="pp-coverage-item-value">
                              {isUndefined || isNotIncluded ? (
                                // UNDEFINED veya NOT_INCLUDED ise boş bırak
                                <span className="pp-coverage-item-price">&nbsp;</span>
                              ) : showTick ? (
                                <img
                                  src="/images/product-detail/teminat-tick.svg"
                                  alt="Dahil"
                                  className="pp-coverage-item-icon"
                                />
                              ) : hasValue ? (
                                <span className="pp-coverage-item-price">{displayValue}</span>
                              ) : (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteCard;

