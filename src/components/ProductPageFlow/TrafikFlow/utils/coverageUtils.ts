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
  TRAFIK_MANDATORY_COVERAGES,
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
    case 'MARKET_VALUE':
      return { ...baseGuarantee, valueText: 'Rayiç', amount: 0 };

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
      return { ...baseGuarantee, valueText: 'Belirsiz', amount: 0 };

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

  const defaultGuarantee = (label: string): Guarantee => ({
    insuranceGuaranteeId: `default-${label}`,
    label,
    valueText: 'Belirsiz', // Undefined durumunda Belirsiz olarak işaretle
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

  // Eğer teminat bulunamazsa veya belirsiz ise Belirsiz olarak işaretle
  const getOrDefault = (guarantee: Guarantee | undefined, label: string): Guarantee => {
    if (!guarantee) {
      return defaultGuarantee(label);
    }
    // Eğer teminat var ama belirsiz/undefined ise Belirsiz olarak işaretle
    if (guarantee.valueText === 'Belirsiz' || 
        (!guarantee.valueText && guarantee.amount === 0) ||
        (guarantee.valueText === 'Dahil Değil' && guarantee.amount === 0 && guarantee.insuranceGuaranteeId?.startsWith('default-'))) {
      return {
        ...guarantee,
        valueText: 'Belirsiz',
        amount: 0
      };
    }
    return guarantee;
  };

  // Sıralama: Yol Yardım en başta
  return [
    getOrDefault(yolYardim, 'Yol Yardım'),
    getOrDefault(hukuksalKoruma, 'Hukuksal Koruma'),
    getOrDefault(imm, 'İMM'),
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
    label: 'Hasarsızlık İndirimi',
    rate: hasUndamaged && undamagedRate ? undamagedRate : undefined,
    hasValue: hasUndamaged
  });

  return items;
};

// ==================== TEMİNAT KONTROL FONKSİYONLARI ====================

/**
 * Teminatın dahil olup olmadığını kontrol eder
 * INCLUDED, MARKET_VALUE, LIMITLESS = tick (dahil)
 * UNDEFINED, NOT_INCLUDED = X (dahil değil)
 */
export const isTrafikCoverageIncluded = (guarantee: Guarantee): boolean => {
  // MARKET_VALUE (Rayiç), INCLUDED (Dahil), LIMITLESS (Limitsiz) = tick
  if (
    guarantee.valueText === 'Dahil' ||
    guarantee.valueText === 'Limitsiz' ||
    guarantee.valueText === 'Rayiç'
  ) {
    return true;
  }

  // Sayısal değer varsa dahil
  if (guarantee.amount > 0) {
    return true;
  }

  // UNDEFINED (Belirsiz) veya NOT_INCLUDED (Dahil Değil) = X
  if (
    guarantee.valueText === 'Belirsiz' ||
    guarantee.valueText === 'Dahil Değil' ||
    guarantee.valueText === null
  ) {
    return false;
  }

  // Diğer text değerler varsa dahil
  return guarantee.valueText !== null;
};

/**
 * Ana teminat alanında Tick/X gösterilecek mi kontrol eder
 * Yol Yardım için her zaman tick/x göster
 * MARKET_VALUE (Rayiç) için ana teminatlarda tick göster
 */
export const shouldShowTrafikTickX = (guarantee: Guarantee): boolean => {
  // Yol Yardım için tik göster
  if (guarantee.label === 'Yol Yardım' || guarantee.label === 'Çekici Hizmeti') {
    return true;
  }
  // MARKET_VALUE (Rayiç) için ana teminatlarda tick göster
  if (guarantee.valueText === 'Rayiç') {
    return true;
  }
  return false;
};

/**
 * Teminat değerini gösterim için formatlar
 */
export const getTrafikCoverageDisplayValue = (guarantee: Guarantee): string | null => {
  // Belirsiz değerler için null döndür
  if (guarantee.valueText === 'Belirsiz') {
    return null;
  }

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
  return guarantee.valueText || null;
};

/**
 * Teminat değerini formatlar (detay görünümü için)
 */
export const formatTrafikGuaranteeValue = (guarantee: Guarantee): string => {
  // Belirsiz veya undefined değerler için boş döndür
  if (guarantee.valueText === 'Belirsiz') {
    return '';
  }

  if (guarantee.valueText) {
    return guarantee.valueText;
  }

  if (guarantee.amount) {
    return guarantee.amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' ₺';
  }

  return '';
};

/**
 * Zorunlu trafik teminatlarını otomatik olarak tik ile ekler
 * Eğer optimalCoverage'dan bu teminatlar gelmezse (undefined/belirsiz), otomatik olarak tik ile eklenir
 */
export const addMandatoryTrafikCoverages = (guarantees: Guarantee[]): Guarantee[] => {
  const existingLabels = guarantees.map(g => g.label);
  const mandatoryGuarantees: Guarantee[] = [];
  let guaranteeId = guarantees.length + 1;

  TRAFIK_MANDATORY_COVERAGES.forEach((key) => {
    const label = TRAFIK_COVERAGE_LABELS[key];
    
    // Eğer bu teminat zaten varsa ve belirsiz değilse, ekleme
    const existingGuarantee = guarantees.find(g => g.label === label);
    if (existingGuarantee && existingGuarantee.valueText !== 'Belirsiz') {
      return; // Zaten var ve belirsiz değil, ekleme
    }

    // Eğer bu teminat yoksa veya belirsiz ise, otomatik tik ile ekle
    if (!existingGuarantee || existingGuarantee.valueText === 'Belirsiz') {
      mandatoryGuarantees.push({
        insuranceGuaranteeId: `mandatory-${key}-${guaranteeId}`,
        label,
        valueText: 'Dahil', // Zorunlu olduğu için otomatik tik
        amount: 0
      });
      guaranteeId++;
    }
  });

  // Mevcut garantileri koru, sadece belirsiz olanları değiştir
  const updatedGuarantees = guarantees.map(g => {
    if (g.valueText === 'Belirsiz') {
      const mandatoryKey = Object.entries(TRAFIK_COVERAGE_LABELS).find(([_, v]) => v === g.label)?.[0];
      if (mandatoryKey && TRAFIK_MANDATORY_COVERAGES.includes(mandatoryKey)) {
        // Belirsiz olan zorunlu teminatı tik ile değiştir
        return {
          ...g,
          valueText: 'Dahil',
          amount: 0
        };
      }
    }
    return g;
  });

  // Yeni eklenen zorunlu teminatları ekle
  mandatoryGuarantees.forEach(mg => {
    if (!updatedGuarantees.find(g => g.label === mg.label)) {
      updatedGuarantees.push(mg);
    }
  });

  return updatedGuarantees;
};

