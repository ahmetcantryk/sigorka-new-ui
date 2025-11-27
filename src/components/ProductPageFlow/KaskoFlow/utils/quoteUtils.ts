/**
 * Kasko Flow - Quote (Teklif) Utility Fonksiyonları
 * 
 * Teklif verilerini işleme, sıralama ve filtreleme fonksiyonları
 */

import type { Quote, ProcessedQuote, Premium, InsuranceCompany } from '../types';
import { convertCoverageToGuarantees } from './coverageUtils';

// ==================== TEKLİF İŞLEME ====================

/**
 * Ham quote verilerini işlenmiş quote'lara dönüştürür
 */
export const processQuotesData = (
  quotesData: Quote[],
  companies: InsuranceCompany[]
): ProcessedQuote[] => {
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

    // Teminatları işle
    const allCoverages = [
      { coverage: quote.optimalCoverage, type: 'optimal' },
      { coverage: quote.pdfCoverage, type: 'pdf' },
      { coverage: quote.insuranceServiceProviderCoverage, type: 'insurance' },
      { coverage: quote.initialCoverage, type: 'initial' }
    ].filter(item => item.coverage !== null);

    const guarantees = allCoverages.length > 0
      ? convertCoverageToGuarantees(allCoverages[0].coverage)
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
export const getSelectedPremium = (quote: ProcessedQuote): Premium | undefined => {
  return quote.premiums.find((p) => p.installmentNumber === quote.selectedInstallmentNumber);
};

// ==================== FİLTRELEME VE SIRALAMA ====================

/**
 * Quote'ları filtreler
 */
export const filterQuotes = (
  quotes: ProcessedQuote[],
  filter: string
): ProcessedQuote[] => {
  if (filter === 'Filtrele' || filter === 'Tümü') {
    return quotes;
  }
  return quotes.filter(quote => quote.coverageGroupName === filter);
};

/**
 * Quote'ları sıralar
 */
export const sortQuotes = (
  quotes: ProcessedQuote[],
  sortType: string
): ProcessedQuote[] => {
  if (sortType === 'Fiyata Göre Sırala') {
    return quotes;
  }

  return [...quotes].sort((a, b) => {
    const priceA = getSelectedPremium(a)?.grossPremium || 0;
    const priceB = getSelectedPremium(b)?.grossPremium || 0;

    if (sortType === 'Fiyata Göre Artan') {
      return priceA - priceB;
    } else {
      return priceB - priceA;
    }
  });
};

/**
 * Benzersiz coverage group isimlerini döndürür
 */
export const getUniqueCoverageGroups = (quotes: ProcessedQuote[]): string[] => {
  return Array.from(
    new Set(
      quotes
        .map(q => q.coverageGroupName)
        .filter((name): name is string => Boolean(name))
    )
  );
};

// ==================== TEKLİF DURUMU KONTROL ====================

/**
 * Tüm tekliflerin finalize olup olmadığını kontrol eder
 */
export const areAllQuotesFinalized = (quotes: Quote[]): boolean => {
  return quotes.length > 0 && quotes.every(
    (quote) => quote.state === 'FAILED' || quote.state === 'ACTIVE'
  );
};

/**
 * Bekleyen teklif var mı kontrol eder
 */
export const hasWaitingQuotes = (quotes: Quote[]): boolean => {
  return quotes.some(quote => quote.state === 'WAITING');
};

/**
 * Aktif teklif var mı kontrol eder
 */
export const hasActiveQuotes = (quotes: ProcessedQuote[]): boolean => {
  return quotes.length > 0;
};

// ==================== SATIN ALMA VERİSİ HAZIRLAMA ====================

/**
 * Satın alma için gerekli veriyi hazırlar
 */
export const preparePurchaseData = (
  quote: ProcessedQuote,
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
export const savePurchaseDataToStorage = (
  purchaseData: Record<string, any>,
  proposalId: string
): void => {
  localStorage.setItem('selectedQuoteForPurchase', JSON.stringify(purchaseData));
  localStorage.setItem('currentProposalId', proposalId);
  localStorage.setItem('proposalIdForKasko', proposalId || '');
  localStorage.setItem('selectedProductIdForKasko', purchaseData.id);
};

