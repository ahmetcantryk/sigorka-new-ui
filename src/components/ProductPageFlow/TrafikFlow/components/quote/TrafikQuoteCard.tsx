/**
 * Trafik Flow - Quote Card Bileşeni
 * 
 * Tek bir trafik teklif kartını render eder
 * 
 * Ana teminatlar (sıralama):
 * 1. Yol Yardım: tik ile gösterilir
 * 2. Hukuksal Koruma: sayı ile gösterilir
 * 3. İMM: sayı ile gösterilir
 */

'use client';

import { useState } from 'react';
import type { ProcessedTrafikQuote } from '../../types';
import {
  getMainTrafikCoverages,
  getAdditionalTrafikCoverages,
  isTrafikCoverageIncluded,
  shouldShowTrafikTickX,
  getTrafikCoverageDisplayValue,
  formatTrafikGuaranteeValue,
} from '../../utils/coverageUtils';
import { getSelectedTrafikPremium } from '../../utils/quoteUtils';
import CoverageTooltip from '@/components/ProductPageFlow/shared/CoverageTooltip';

interface TrafikQuoteCardProps {
  quote: ProcessedTrafikQuote;
  proposalId: string;
  onInstallmentChange: (quoteId: string, installmentNumber: number) => void;
  onPurchase: (quoteId: string) => void;
  onOpenModal: (quote: ProcessedTrafikQuote) => void;
  onViewDocument: (proposalId: string, productId: string) => void;
}

const TrafikQuoteCard = ({
  quote,
  proposalId,
  onInstallmentChange,
  onPurchase,
  onOpenModal,
  onViewDocument,
}: TrafikQuoteCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInstallmentsOpen, setIsInstallmentsOpen] = useState(false);

  const currentPremium = getSelectedTrafikPremium(quote);
  const mainCoverages = getMainTrafikCoverages(quote);
  const additionalCoverages = getAdditionalTrafikCoverages(quote);

  const handleInstallmentSelect = (installmentNumber: number) => {
    onInstallmentChange(quote.id, installmentNumber);
    setIsInstallmentsOpen(false);
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
            />
          </div>
        </div>

        {/* Divider */}
        <div className="pp-quote-divider" />

        {/* BÖLÜM 2: Ana 3 Teminat (Yol Yardım, Hukuksal Koruma, İMM) */}
        <div className="pp-quote-section pp-quote-main-coverages">
          {mainCoverages.map((guarantee, index) => {
            const displayValue = getTrafikCoverageDisplayValue(guarantee);
            const isIncluded = isTrafikCoverageIncluded(guarantee);
            const showTickXIcon = shouldShowTrafikTickX(guarantee);

            return (
              <div key={index} className="pp-coverage-row">
                <span className="pp-coverage-label">
                  {guarantee.label}
                  <CoverageTooltip branch="trafik" coverageKey={guarantee.label || ''} />
                </span>
                {showTickXIcon ? (
                  <img
                    src={isIncluded
                      ? "/images/product-detail/teminat-tick.svg"
                      : "/images/product-detail/teminat-x.svg"
                    }
                    alt={isIncluded ? "Dahil" : "Dahil Değil"}
                    className="pp-coverage-icon-status"
                  />
                ) : (
                  <span className="pp-coverage-value-text">
                    {displayValue || '-'}
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
            onClick={() => onPurchase(quote.id)}
          >
            Satın Al
          </button>
        </div>
      </div>

      {/* Details Toggle - Sadece Teminatlar (Kampanyalar yok) */}
      <div className="pp-quote-details-toggle">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`pp-details-toggle-button ${isExpanded ? 'pp-toggle-expanded' : 'pp-toggle-collapsed'}`}
        >
          <span className={isExpanded ? 'pp-toggle-text-less' : 'pp-toggle-text-more'}>
            {isExpanded ? 'Daha Az' : 'Teklif Detayları'}
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
            {/* Teminatlar - Tab yok, direkt göster */}
            <div className="pp-tab-content">
              <div className="pp-coverages-layout">
                {/* Teminatlar Grid - Tüm teminatları göster (UNDEFINED olanlar X ile) */}
                <div className="pp-coverages-grid">
                  {quote.insuranceCompanyGuarantees?.map((guarantee) => {
                    const displayValue = formatTrafikGuaranteeValue(guarantee);
                    const isIncluded = isTrafikCoverageIncluded(guarantee);
                    const showTick = displayValue === 'Dahil';
                    const showX = displayValue === 'Dahil Değil' || displayValue === '-';

                    return (
                      <div key={guarantee.insuranceGuaranteeId} className="pp-coverage-item">
                        <span className="pp-coverage-item-label">
                          {guarantee.label}
                          <CoverageTooltip branch="trafik" coverageKey={guarantee.label || ''} />
                        </span>
                        <div className="pp-coverage-item-value">
                          {showTick ? (
                            <img
                              src="/images/product-detail/teminat-tick.svg"
                              alt="Dahil"
                              className="pp-coverage-item-icon"
                            />
                          ) : showX ? (
                            <img
                              src="/images/product-detail/teminat-x.svg"
                              alt="Dahil Değil"
                              className="pp-coverage-item-icon"
                            />
                          ) : (
                            <span className="pp-coverage-item-price">{displayValue}</span>
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
                  >
                    <i className="icon-teklif-button pp-btn-icon"></i>
                    <span>Teklif Belgesi</span>
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

export default TrafikQuoteCard;
