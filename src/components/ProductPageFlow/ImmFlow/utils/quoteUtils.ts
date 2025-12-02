/**
 * Imm Flow - Quote (Teklif) Utility Fonksiyonları
 * 
 * Teklif verilerini işleme, sıralama ve filtreleme fonksiyonları
 * NOT: İMM'de teminat ve kampanya gösterilmiyor
 */

import type { ImmQuote, ProcessedImmQuote, InsuranceCompany, Premium } from '../types';

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
 * NOT: İMM'de teminat işlenmez
 */
export const processImmQuotesData = (
  quotesData: ImmQuote[],
  companies: InsuranceCompany[]
): ProcessedImmQuote[] => {
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

    return {
      ...quote,
      premiums: formattedPremiums,
      company: company?.name || `Sigorta Şirketi #${quote.insuranceCompanyId}`,
      logo: `https://storage.dogasigorta.com/app-1/insurup-b2c-company/${quote.insuranceCompanyId}.png`,
      selectedInstallmentNumber: initialSelectedInstallment,
      productBranch: 'IMM',
    };
  });
};

/**
 * Seçili taksit premium'unu döndürür
 */
export const getSelectedImmPremium = (quote: ProcessedImmQuote): Premium | undefined => {
  return quote.premiums.find((p) => p.installmentNumber === quote.selectedInstallmentNumber);
};

/**
 * İMM limitini formatlar
 */
export const getImmLimit = (quote: ProcessedImmQuote): string => {
  if (!quote.initialCoverage) return '-';
  
  const coverage = quote.initialCoverage;
  const immLimit = (coverage as any).immLimitiAyrimsiz;
  
  if (!immLimit) return '-';
  
  // Limitsiz kontrolü
  if (typeof immLimit === 'object' && immLimit.$type === 'LIMITLESS') {
    return 'Limitsiz';
  }
  
  // Sayısal değer
  if (typeof immLimit === 'number') {
    return immLimit.toLocaleString('tr-TR') + ' ₺';
  }
  
  // Limited tip
  if (typeof immLimit === 'object' && immLimit.$type === 'LIMITED' && immLimit.limit) {
    return immLimit.limit.toLocaleString('tr-TR') + ' ₺';
  }
  
  return '-';
};

/**
 * İMM limitini formatlar (sayı olarak)
 */
export const formatImmLimit = (value: any): string => {
  if (!value) return '-';
  
  if (typeof value === 'object' && value.$type === 'LIMITLESS') {
    return 'Limitsiz';
  }
  
  if (typeof value === 'number') {
    return value.toLocaleString('tr-TR') + ' ₺';
  }
  
  if (typeof value === 'object' && value.$type === 'LIMITED' && value.limit) {
    return value.limit.toLocaleString('tr-TR') + ' ₺';
  }
  
  return '-';
};

/**
 * İMM tekliflerini fiyata göre sıralar
 */
export const sortImmQuotesByPrice = (quotes: ProcessedImmQuote[], ascending: boolean = true): ProcessedImmQuote[] => {
  return [...quotes].sort((a, b) => {
    const priceA = getSelectedImmPremium(a)?.grossPremium || 0;
    const priceB = getSelectedImmPremium(b)?.grossPremium || 0;
    return ascending ? priceA - priceB : priceB - priceA;
  });
};

/**
 * Aktif İMM tekliflerini filtreler
 */
export const filterActiveImmQuotes = (quotes: ProcessedImmQuote[]): ProcessedImmQuote[] => {
  return quotes.filter(q => q.state === 'ACTIVE');
};

// ==================== SATIN ALMA VERİSİ HAZIRLAMA ====================

/**
 * Satın alma için gerekli veriyi hazırlar
 */
export const prepareImmPurchaseData = (
  quote: ProcessedImmQuote,
  proposalId: string
): Record<string, any> => {
  return {
    id: quote.id,
    company: quote.company,
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
export const saveImmPurchaseDataToStorage = (
  purchaseData: Record<string, any>,
  proposalId: string
): void => {
  localStorage.setItem('selectedQuoteForPurchaseImm', JSON.stringify(purchaseData));
  localStorage.setItem('currentProposalIdImm', proposalId);
  localStorage.setItem('proposalIdForImm', proposalId || '');
  localStorage.setItem('selectedProductIdForImm', purchaseData.id);
};

