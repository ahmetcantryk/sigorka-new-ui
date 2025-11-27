/**
 * Trafik Flow - Quote (Teklif) Utility Fonksiyonları
 * 
 * Teklif verilerini işleme, sıralama ve filtreleme fonksiyonları
 */

import type { TrafikQuote, ProcessedTrafikQuote, InsuranceCompany, Premium } from '../types';
import { convertTrafikCoverageToGuarantees } from './coverageUtils';

// Kasko'dan ortak fonksiyonları import et
export {
  filterQuotes,
  sortQuotes,
  getUniqueCoverageGroups,
  areAllQuotesFinalized,
  hasWaitingQuotes,
  hasActiveQuotes,
} from '../../KaskoFlow/utils/quoteUtils';

// ==================== TEKLİF İŞLEME ====================

/**
 * Ham quote verilerini işlenmiş quote'lara dönüştürür
 */
export const processTrafikQuotesData = (
  quotesData: TrafikQuote[],
  companies: InsuranceCompany[]
): ProcessedTrafikQuote[] => {
  return quotesData.map((quote) => {
    const company = companies.find((c) => c.id === quote.insuranceCompanyId);

    // Duplicate premium'ları temizle
    const uniquePremiums = quote.premiums.reduce((acc: Premium[], current) => {
      const isDuplicate = acc.some(item =>
        item.installmentNumber === current.installmentNumber
      );
      if (!isDuplicate) {
        acc.push(current);
      }
      return acc;
    }, []);

    // Premium'ları formatla
    const formattedPremiums = uniquePremiums.map((premium) => ({
      ...premium,
      formattedNetPremium: premium.netPremium.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      formattedGrossPremium: premium.grossPremium.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    }));

    const initialSelectedInstallment = formattedPremiums.length > 0
      ? formattedPremiums[0].installmentNumber
      : 1;

    // Teminatları işle - önce optimalCoverage, yoksa diğerleri
    const allCoverages = [
      { coverage: quote.optimalCoverage, type: 'optimal' },
      { coverage: quote.pdfCoverage, type: 'pdf' },
      { coverage: quote.insuranceServiceProviderCoverage, type: 'insurance' },
      { coverage: quote.initialCoverage, type: 'initial' }
    ].filter(item => item.coverage !== null);

    const guarantees = allCoverages.length > 0
      ? convertTrafikCoverageToGuarantees(allCoverages[0].coverage as any)
      : [];

    return {
      ...quote,
      premiums: formattedPremiums,
      company: company?.name || `Sigorta Şirketi #${quote.insuranceCompanyId}`,
      logo: `https://storage.dogasigorta.com/app-1/insurup-b2c-company/${quote.insuranceCompanyId}.png`,
      selectedInstallmentNumber: initialSelectedInstallment,
      insuranceCompanyGuarantees: guarantees,
    };
  });
};

/**
 * Seçili taksit premium'unu döndürür
 */
export const getSelectedTrafikPremium = (quote: ProcessedTrafikQuote): Premium | undefined => {
  return quote.premiums.find((p) => p.installmentNumber === quote.selectedInstallmentNumber);
};

// ==================== SATIN ALMA VERİSİ HAZIRLAMA ====================

/**
 * Satın alma için gerekli veriyi hazırlar
 */
export const prepareTrafikPurchaseData = (
  quote: ProcessedTrafikQuote,
  proposalId: string
): Record<string, any> => {
  return {
    id: quote.id,
    company: quote.company,
    coverage: quote.coverage,
    features: quote.features,
    premiums: quote.premiums,
    selectedInstallmentNumber: quote.selectedInstallmentNumber,
    insuranceCompanyId: quote.insuranceCompanyId,
    productId: quote.productId,
    proposalProductId: quote.id,
    proposalId: proposalId,
  };
};

/**
 * LocalStorage'a satın alma verisini kaydeder
 */
export const saveTrafikPurchaseDataToStorage = (
  purchaseData: Record<string, any>,
  proposalId: string
): void => {
  localStorage.setItem('selectedQuoteForPurchaseTrafik', JSON.stringify(purchaseData));
  localStorage.setItem('currentProposalIdTrafik', proposalId);
  localStorage.setItem('proposalIdForTrafik', proposalId || '');
  localStorage.setItem('selectedProductIdForTrafik', purchaseData.id);
};

