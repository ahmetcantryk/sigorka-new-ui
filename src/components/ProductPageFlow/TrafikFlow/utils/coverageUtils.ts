/**
 * Trafik Flow - Teminat (Coverage) Utility Fonksiyonları
 * 
 * Teminat verilerini işleme, formatlama ve dönüştürme fonksiyonları
 */

import {
  TRAFIK_COVERAGE_LABELS,
  TRAFIK_NUMERIC_COVERAGES,
  TRAFIK_TICK_COVERAGES,
  TRAFIK_DETAIL_COVERAGE_ORDER,
} from '../config/trafikConstants';
import type { TrafikCoverage, Guarantee, ProcessedTrafikQuote, CoverageValue } from '../types';

// ==================== TEMİNAT DÖNÜŞTÜRME ====================

/**
 * Coverage objesini Guarantee array'ine dönüştürür
 */
export const convertTrafikCoverageToGuarantees = (coverage: TrafikCoverage | null): Guarantee[] => {
  if (!coverage) return [];

  const guarantees: Guarantee[] = [];
  let guaranteeId = 1;

  Object.entries(coverage).forEach(([key, value]) => {
    if (key === '$type' || key === 'productBranch') return;

    const label = TRAFIK_COVERAGE_LABELS[key] || key;

    // Object değerler için işleme (CoverageValue)
    if (typeof value === 'object' && value !== null && '$type' in value) {
      const guarantee = processTrafikCoverageValue(key, label, value, guaranteeId);
      if (guarantee) {
        guarantees.push(guarantee);
        guaranteeId++;
      }
    }
  });

  // Sıralama: Önce detay sıralamasına göre, sonra alfabetik
  return guarantees.sort((a, b) => {
    const keyA = Object.entries(TRAFIK_COVERAGE_LABELS).find(([_, v]) => v === a.label)?.[0] || '';
    const keyB = Object.entries(TRAFIK_COVERAGE_LABELS).find(([_, v]) => v === b.label)?.[0] || '';
    
    const indexA = TRAFIK_DETAIL_COVERAGE_ORDER.indexOf(keyA);
    const indexB = TRAFIK_DETAIL_COVERAGE_ORDER.indexOf(keyB);
    
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.label.localeCompare(b.label, 'tr');
  });
};

/**
 * Coverage value objesini işleyerek Guarantee döndürür
 */
const processTrafikCoverageValue = (
  key: string,
  label: string,
  coverageValue: CoverageValue,
  id: number
): Guarantee | null => {
  const baseGuarantee = {
    insuranceGuaranteeId: id.toString(),
    label,
  };

  switch (coverageValue.$type) {
    case 'LIMITLESS':
      return { ...baseGuarantee, valueText: 'Limitsiz', amount: 0 };

    case 'HIGHEST_LIMIT':
      return { ...baseGuarantee, valueText: 'En Yüksek Limit', amount: 0 };

    case 'DECIMAL':
      return {
        ...baseGuarantee,
        valueText: coverageValue.value !== undefined ? null : 'Dahil Değil',
        amount: coverageValue.value !== undefined ? coverageValue.value : 0
      };

    case 'INCLUDED':
      return { ...baseGuarantee, valueText: 'Dahil', amount: 0 };

    case 'NOT_INCLUDED':
      return { ...baseGuarantee, valueText: 'Dahil Değil', amount: 0 };

    case 'UNDEFINED':
      return { ...baseGuarantee, valueText: 'Dahil Değil', amount: 0 };

    default:
      return { ...baseGuarantee, valueText: 'Dahil Değil', amount: 0 };
  }
};

// ==================== ANA TEMİNATLAR (QUOTE CARD) ====================

/**
 * Quote kartında gösterilecek ana 3 teminatı döndürür
 * Sıralama: Yol Yardım (tik), Hukuksal Koruma (sayı), İMM (sayı)
 */
export const getMainTrafikCoverages = (quote: ProcessedTrafikQuote): Guarantee[] => {
  const coverages = quote.insuranceCompanyGuarantees || [];

  const defaultGuarantee = (label: string, isIncluded: boolean = false): Guarantee => ({
    insuranceGuaranteeId: `default-${label}`,
    label,
    valueText: isIncluded ? 'Dahil' : 'Dahil Değil',
    amount: 0
  });

  // Yol Yardım (Çekici Hizmeti) - Tik ile gösterilir
  const yolYardim = coverages.find(g =>
    g.label === 'Yol Yardım' ||
    g.label === 'Çekici Hizmeti'
  );

  // Hukuksal Koruma - Sayı ile gösterilir
  const hukuksalKoruma = coverages.find(g =>
    g.label === 'Hukuksal Koruma Araca Bağlı' ||
    g.label === 'Hukuksal Koruma'
  );

  // İMM - Sayı ile gösterilir
  const imm = coverages.find(g =>
    g.label === 'İMM' ||
    g.label === 'İMM Kombine'
  );

  // Sıralama: Yol Yardım en başta
  return [
    yolYardim || defaultGuarantee('Yol Yardım', false),
    hukuksalKoruma || defaultGuarantee('Hukuksal Koruma', false),
    imm || defaultGuarantee('İMM', false),
  ];
};

/**
 * Ek indirim/teminatları döndürür
 * Not: Trafikte meslek indirimi yok, sadece hasarsızlık indirimi var
 */
export const getAdditionalTrafikCoverages = (quote: ProcessedTrafikQuote): Array<{
  label: string;
  rate?: number;
  hasValue: boolean;
}> => {
  const items: Array<{ label: string; rate?: number; hasValue: boolean }> = [];

  // Hasarsızlık İndirimi (Kasko'daki gibi hasUndamagedDiscount ve hasUndamagedDiscountRate kontrol edilir)
  const hasUndamaged = quote.hasUndamagedDiscount === true;
  const undamagedRate = (quote as any).hasUndamagedDiscountRate;
  
  items.push({
    label: 'Hasarsızlık',
    rate: hasUndamaged && undamagedRate ? undamagedRate : undefined,
    hasValue: hasUndamaged
  });

  return items;
};

// ==================== TEMİNAT KONTROL FONKSİYONLARI ====================

/**
 * Teminatın dahil olup olmadığını kontrol eder
 */
export const isTrafikCoverageIncluded = (guarantee: Guarantee): boolean => {
  return (
    guarantee.valueText === 'Dahil' ||
    guarantee.valueText === 'Limitsiz' ||
    guarantee.valueText === 'En Yüksek Limit' ||
    guarantee.amount > 0 ||
    (guarantee.valueText !== null &&
      guarantee.valueText !== 'Dahil Değil' &&
      guarantee.valueText !== 'Belirsiz')
  ) || false;
};

/**
 * Teminatın sayı ile mi tik ile mi gösterileceğini belirler
 * true = tik/x göster, false = sayı/değer göster
 */
export const shouldShowTrafikTickX = (guarantee: Guarantee): boolean => {
  // Yol Yardım için tik göster
  if (guarantee.label === 'Yol Yardım' || guarantee.label === 'Çekici Hizmeti') {
    return true;
  }
  return false;
};

/**
 * Teminat değerini gösterim için formatlar
 */
export const getTrafikCoverageDisplayValue = (guarantee: Guarantee): string | null => {
  // Tik gösterilecek teminatlar için null döndür
  if (shouldShowTrafikTickX(guarantee)) {
    return null;
  }

  // Sayısal değer varsa formatla
  if (guarantee.amount > 0) {
    return guarantee.amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }) + ' ₺';
  }

  // Text değer varsa döndür
  return guarantee.valueText || '-';
};

/**
 * Teminat değerini formatlar (detay görünümü için)
 */
export const formatTrafikGuaranteeValue = (guarantee: Guarantee): string => {
  if (guarantee.valueText) {
    return guarantee.valueText;
  }

  if (guarantee.amount) {
    return guarantee.amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' ₺';
  }

  return '-';
};

