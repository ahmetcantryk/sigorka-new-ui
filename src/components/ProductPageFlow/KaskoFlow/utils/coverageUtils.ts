/**
 * Kasko Flow - Teminat (Coverage) Utility Fonksiyonları
 * 
 * Teminat verilerini işleme, formatlama ve dönüştürme fonksiyonları
 */

import { COVERAGE_LABELS, SERVICE_TYPE_LABELS, PART_TYPE_LABELS } from '../config/kaskoConstants';
import type { KaskoCoverage, Guarantee, ProcessedQuote } from '../types';

// ==================== TEMİNAT DÖNÜŞTÜRME ====================

/**
 * Coverage objesini Guarantee array'ine dönüştürür
 */
export const convertCoverageToGuarantees = (coverage: KaskoCoverage | null): Guarantee[] => {
  if (!coverage) return [];

  const guarantees: Guarantee[] = [];
  let guaranteeId = 1;

  Object.entries(coverage).forEach(([key, value]) => {
    if (key === '$type' || key === 'productBranch') return;

    const label = COVERAGE_LABELS[key] || key;

    // String değerler için işleme
    if (typeof value === 'string') {
      const formattedValue = formatStringCoverageValue(key, value);
      guarantees.push({
        insuranceGuaranteeId: guaranteeId.toString(),
        label,
        valueText: formattedValue,
        amount: 0
      });
      guaranteeId++;
      return;
    }

    // Object değerler için işleme
    if (typeof value === 'object' && value !== null && '$type' in value) {
      const guarantee = processCoverageValue(key, label, value, guaranteeId);
      if (guarantee) {
        guarantees.push(guarantee);
        guaranteeId++;
      }
    }
  });

  return guarantees.sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * String coverage değerini formatlar
 */
const formatStringCoverageValue = (key: string, value: string): string => {
  // Servis türleri
  if (key === 'onarimServisTuru') {
    return SERVICE_TYPE_LABELS[value] || formatGenericString(value);
  }

  // Parça türleri
  if (key === 'yedekParcaTuru') {
    return PART_TYPE_LABELS[value] || formatGenericString(value);
  }

  // Genel string değerler
  return PART_TYPE_LABELS[value] || formatGenericString(value);
};

/**
 * Generic string değeri formatlar (alt çizgileri boşluğa çevirir, title case yapar)
 */
const formatGenericString = (value: string): string => {
  let formatted = value.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
  
  // Türkçe karakter düzeltmeleri
  formatted = formatted.replace(/Sigortali/g, 'Sigortalı');
  formatted = formatted.replace(/Ozel/g, 'Özel');
  
  return formatted;
};

/**
 * Coverage value objesini işleyerek Guarantee döndürür
 */
const processCoverageValue = (
  key: string,
  label: string,
  coverageValue: any,
  id: number
): Guarantee | null => {
  const baseGuarantee = {
    insuranceGuaranteeId: id.toString(),
    label: key === 'camKirilmaMuafeyeti' ? 'Cam Hasarı' : label,
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
      return { ...baseGuarantee, valueText: 'Dahil Değil', amount: 0 };

    case 'DEFINED':
      if (key === 'kiralikArac') {
        const { yillikKullanimSayisi, tekSeferlikGunSayisi } = coverageValue;
        if (yillikKullanimSayisi && tekSeferlikGunSayisi) {
          return {
            insuranceGuaranteeId: id.toString(),
            label: 'İkame Araç',
            valueText: `Yılda ${yillikKullanimSayisi} kez ${tekSeferlikGunSayisi} gün`,
            amount: 0
          };
        }
        return {
          insuranceGuaranteeId: id.toString(),
          label: 'İkame Araç',
          valueText: 'Dahil Değil',
          amount: 0
        };
      }
      return { ...baseGuarantee, valueText: 'Dahil', amount: 0 };

    default:
      return { ...baseGuarantee, valueText: 'Dahil Değil', amount: 0 };
  }
};

// ==================== ANA TEMİNATLAR ====================

/**
 * Quote kartında gösterilecek ana 4 teminatı döndürür
 */
export const getMainCoverages = (quote: ProcessedQuote): Guarantee[] => {
  const coverages = quote.insuranceCompanyGuarantees || [];

  const defaultGuarantee = (label: string): Guarantee => ({
    insuranceGuaranteeId: `default-${label}`,
    label,
    valueText: null,
    amount: 0
  });

  const immLimiti = coverages.find(g =>
    g.label === 'İMM Limiti' ||
    g.label === 'İMM Limiti (Ayrımsız)' ||
    g.label === 'İMM Limitli / Limitsiz'
  );

  const camHasari = coverages.find(g =>
    g.label === 'Cam Hasarı' ||
    g.label === 'Cam Kırılma Muafiyeti'
  );

  const servisGecerliligi = coverages.find(g =>
    g.label === 'Servis Geçerliliği' ||
    g.label === 'Onarım Servis Türü'
  );

  const ikameArac = coverages.find(g =>
    g.label === 'İkame Araç' ||
    g.label === 'Kiralık Araç'
  );

  return [
    camHasari || defaultGuarantee('Cam Hasarı'),
    immLimiti || defaultGuarantee('İMM Limiti'),
    servisGecerliligi || defaultGuarantee('Servis Geçerliliği'),
    ikameArac || defaultGuarantee('İkame Araç')
  ];
};

/**
 * Ek indirim/teminatları döndürür
 */
export const getAdditionalCoverages = (quote: ProcessedQuote): Array<{
  label: string;
  rate?: number;
  hasValue: boolean;
}> => {
  const items: Array<{ label: string; rate?: number; hasValue: boolean }> = [];

  // Meslek İndirimi
  items.push({
    label: 'Meslek İndirimi',
    hasValue: quote.hasVocationalDiscount
  });

  // Hasarsızlık İndirimi
  const hasUndamaged = quote.hasUndamagedDiscount && (quote as any).hasUndamagedDiscountRate;
  items.push({
    label: 'Hasarsızlık',
    rate: hasUndamaged ? (quote as any).hasUndamagedDiscountRate : undefined,
    hasValue: hasUndamaged
  });

  return items;
};

// ==================== TEMİNAT KONTROL FONKSİYONLARI ====================

/**
 * Teminatın dahil olup olmadığını kontrol eder
 */
export const isCoverageIncluded = (guarantee: Guarantee): boolean => {
  if (guarantee.label === 'Cam Hasarı') {
    return guarantee.valueText === 'Dahil';
  }

  return (
    guarantee.valueText === 'Dahil' ||
    guarantee.valueText === 'Limitsiz' ||
    guarantee.valueText === 'Rayiç' ||
    guarantee.amount > 0 ||
    (guarantee.valueText !== null &&
      guarantee.valueText !== 'Dahil Değil' &&
      guarantee.valueText !== 'Belirsiz')
  ) || false;
};

/**
 * Tick/X gösterilecek mi kontrol eder (sadece Cam Hasarı için)
 */
export const shouldShowTickX = (guarantee: Guarantee): boolean => {
  return guarantee.label === 'Cam Hasarı';
};

/**
 * Teminat değerini gösterim için formatlar
 */
export const getCoverageDisplayValue = (guarantee: Guarantee): string | null => {
  // İMM Limiti
  if (
    guarantee.label === 'İMM Limiti' ||
    guarantee.label === 'İMM Limiti (Ayrımsız)' ||
    guarantee.label === 'İMM Limitli / Limitsiz'
  ) {
    if (guarantee.amount > 0) {
      return guarantee.amount.toLocaleString('tr-TR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }) + ' ₺';
    }
    return guarantee.valueText || '-';
  }

  // İkame Araç
  if (guarantee.label === 'İkame Araç' || guarantee.label === 'Kiralık Araç') {
    return guarantee.valueText || '-';
  }

  // Servis Geçerliliği
  if (guarantee.label === 'Servis Geçerliliği' || guarantee.label === 'Onarım Servis Türü') {
    return guarantee.valueText || '-';
  }

  // Cam Hasarı için null (tick/x gösterilir)
  return null;
};

/**
 * Teminat değerini formatlar (detay görünümü için)
 */
export const formatGuaranteeValue = (guarantee: Guarantee): string => {
  if (guarantee.valueText) {
    let text = guarantee.valueText;

    // Alt çizgileri boşluğa çevir
    text = text.replace(/_/g, ' ');

    // Title case
    text = text.split(' ').map((word: string) => {
      if (word.length === 0) return word;
      const skipWords = ['Dahil', 'Değil', 'Limitsiz', 'Rayiç', 'Özel', 'Servis', 'Orijinal', 'Parça', 'Eşdeğer'];
      if (skipWords.includes(word)) return word;
      return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1).toLocaleLowerCase('tr-TR');
    }).join(' ');

    // Türkçe karakter düzeltmeleri
    text = text.replace(/Sigortali/gi, 'Sigortalı');
    text = text.replace(/Ozel/gi, 'Özel');

    return text;
  }

  if (guarantee.amount) {
    return guarantee.amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + ' ₺';
  }

  return '-';
};

