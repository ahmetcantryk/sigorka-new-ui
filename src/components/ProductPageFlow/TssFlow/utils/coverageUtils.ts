/**
 * TSS Flow - Coverage Utils
 * 
 * API Response yapısına göre optimize edilmiş
 */

import { TssCoverage, Guarantee } from '../types';
import { 
    TSS_COVERAGE_LABELS, 
    TSS_MAIN_COVERAGES, 
    TSS_ALL_COVERAGES,
    TEDAVI_SEKLI_LABELS,
    TEDAVI_SEKLI_COVERAGE_MAP,
    TSS_COVERAGE_DESCRIPTIONS,
} from '../config/tssConstants';

/**
 * Teminat değerinin dahil olup olmadığını kontrol et
 * API Response yapısına göre:
 * - { $type: "NOT_INCLUDED" } → false
 * - { $type: "UNDEFINED" } → false
 * - { $type: "LIMITLESS" } → true
 * - { $type: "NUMBER", value: X } → true
 * - { $type: "DECIMAL", value: X } → true
 */
export const isCoverageIncluded = (value: any): boolean => {
    if (value === null || value === undefined) return false;
    
    // Object değerler
    if (typeof value === 'object' && value !== null) {
        const type = value.$type;
        // Dahil değil durumları
        if (type === 'UNDEFINED' || type === 'NOT_INCLUDED' || type === 'NOT_COVERED' || type === 'EXCLUDED') {
            return false;
        }
        // LIMITLESS, NUMBER, DECIMAL, LIMITED, COUNT gibi değerler dahil
        return true;
    }
    
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value > 0;
    if (typeof value === 'string') {
        return value !== 'YOK' && value !== 'EXCLUDED' && value !== 'NOT_COVERED' && 
               value !== 'BILINMIYOR' && value !== 'UNDEFINED' && value !== 'NOT_INCLUDED' && value !== '';
    }
    return false;
};

/**
 * Coverage değerini formatla
 * API Response yapısı:
 * - { $type: "NUMBER", value: 8 } → "8 Adet"
 * - { $type: "DECIMAL", value: 150000 } → "150.000 ₺"
 * - { $type: "LIMITLESS" } → "Limitsiz"
 * - { $type: "NOT_INCLUDED" } → "Dahil Değil"
 * - { $type: "UNDEFINED" } → "Dahil Değil"
 */
export const formatCoverageValue = (key: string, value: any): { text: string; isIncluded: boolean } => {
    // Null veya undefined
    if (value === null || value === undefined) {
        return { text: 'Dahil Değil', isIncluded: false };
    }
    
    // Object değerler (API'den gelen yapı)
    if (typeof value === 'object' && value !== null) {
        const type = value.$type;
        
        switch (type) {
            // Dahil değil durumları
            case 'NOT_INCLUDED':
            case 'NOT_COVERED':
            case 'EXCLUDED':
                // Poliçede gerçekten olmayan teminatlar → X ile gösterilecek
                return { text: 'Dahil Değil', isIncluded: false };

            case 'UNDEFINED':
                // InsurScan/pdf tarafından okunamayan veya belirsiz teminatlar
                // → satır görünsün ama karşılığı boş kalsın (ne tik ne çarpı)
                return { text: '', isIncluded: false };
            
            // Limitsiz
            case 'LIMITLESS':
            case 'UNLIMITED':
                return { text: 'Limitsiz', isIncluded: true };
            
            // Sayısal değer (adet)
            case 'NUMBER':
            case 'COUNT':
                if (value.value !== undefined && value.value !== null) {
                    return { text: `${value.value} Adet`, isIncluded: true };
                }
                if (value.count !== undefined && value.count !== null) {
                    return { text: `${value.count} Adet`, isIncluded: true };
                }
                return { text: 'Dahil', isIncluded: true };
            
            // Ondalık değer (para)
            case 'DECIMAL':
            case 'LIMITED':
                if (value.value !== undefined && value.value !== null) {
                    return { 
                        text: `${value.value.toLocaleString('tr-TR')} ₺`, 
                        isIncluded: true 
                    };
                }
                if (value.limit !== undefined && value.limit !== null) {
                    return { 
                        text: `${value.limit.toLocaleString('tr-TR')} ₺`, 
                        isIncluded: true 
                    };
                }
                return { text: 'Limitli', isIncluded: true };
            
            // Dahil durumları
            case 'INCLUDED':
            case 'COVERED':
                return { text: 'Dahil', isIncluded: true };
            
            default:
                // saglikPaketi gibi nested object'ler
                if (value.tedaviSekli) {
                    return { 
                        text: TEDAVI_SEKLI_LABELS[value.tedaviSekli] || value.tedaviSekli, 
                        isIncluded: true 
                    };
                }
                // Eğer value özelliği varsa kullan
                if (value.value !== undefined && value.value !== null) {
                    if (typeof value.value === 'number') {
                        return { text: `${value.value}`, isIncluded: true };
                    }
                    return { text: String(value.value), isIncluded: true };
                }
                return { text: 'Dahil Değil', isIncluded: false };
        }
    }
    
    
    // Boolean değerler
    if (typeof value === 'boolean') {
        return { text: value ? 'Dahil' : 'Dahil Değil', isIncluded: value };
    }
    
    // Sayısal değerler
    if (typeof value === 'number') {
        if (value === 0) {
            return { text: 'Dahil Değil', isIncluded: false };
        }
        return { text: `${value} Adet`, isIncluded: true };
    }
    
    // String değerler
    if (typeof value === 'string') {
        // InsurScan/pdf okuyamadığı / belirsiz durumlar
        if (value === 'BILINMIYOR' || value === 'UNDEFINED') {
            return { text: '', isIncluded: false };
        }
        if (value === '' || value === 'NOT_INCLUDED') {
            return { text: 'Dahil Değil', isIncluded: false };
        }
        if (value === 'VAR' || value === 'INCLUDED') {
            return { text: 'Dahil', isIncluded: true };
        }
        if (value === 'YOK' || value === 'EXCLUDED') {
            return { text: 'Dahil Değil', isIncluded: false };
        }
        if (value === 'LIMITLESS' || value === 'UNLIMITED') {
            return { text: 'Limitsiz', isIncluded: true };
        }
        return { text: value, isIncluded: true };
    }
    
    return { text: 'Dahil Değil', isIncluded: false };
};

/**
 * saglikPaketi.tedaviSekli'ne göre yatarakTedavi ve ayaktaTedavi durumunu belirle
 */
const getTedaviCoverageStatus = (coverage: TssCoverage | null): { yatarakTedavi: boolean; ayaktaTedavi: boolean } => {
    if (!coverage?.saglikPaketi?.tedaviSekli) {
        return { yatarakTedavi: false, ayaktaTedavi: false };
    }
    
    const tedaviSekli = coverage.saglikPaketi.tedaviSekli;
    return TEDAVI_SEKLI_COVERAGE_MAP[tedaviSekli] || { yatarakTedavi: false, ayaktaTedavi: false };
};

/**
 * Kartta gösterilecek ana teminatları getir (ilk 3)
 * 
 * API Response'a göre:
 * - yatarakTedavi: Önce coverage.yatarakTedavi'ye bak, yoksa saglikPaketi.tedaviSekli'ne bak
 * - ayaktaTedavi: Önce coverage.ayaktaTedavi'ye bak, yoksa saglikPaketi.tedaviSekli'ne bak
 * - doktorMuayene: coverage.doktorMuayene'ye bak
 */
export const getMainCoverages = (coverage: TssCoverage | null): Guarantee[] => {
    if (!coverage) return [];
    
    const tedaviStatus = getTedaviCoverageStatus(coverage);
    const mainGuarantees: Guarantee[] = [];
    let guaranteeId = 1;
    
    TSS_MAIN_COVERAGES.forEach((key) => {
        const label = TSS_COVERAGE_LABELS[key] || key;
        let isIncluded = false;
        let valueText = 'Dahil Değil';
        
        if (key === 'yatarakTedavi') {
            // Önce doğrudan yatarakTedavi değerine bak
            const directValue = coverage.yatarakTedavi;
            if (directValue && typeof directValue === 'object' && directValue.$type !== 'UNDEFINED' && directValue.$type !== 'NOT_INCLUDED') {
                const formatted = formatCoverageValue(key, directValue);
                isIncluded = formatted.isIncluded;
                valueText = formatted.text;
            } else {
                // Yoksa saglikPaketi.tedaviSekli'ne bak
                isIncluded = tedaviStatus.yatarakTedavi;
                valueText = isIncluded ? 'Limitsiz' : 'Dahil Değil';
            }
        } else if (key === 'ayaktaTedavi') {
            // Önce doğrudan ayaktaTedavi değerine bak
            const directValue = coverage.ayaktaTedavi;
            if (directValue && typeof directValue === 'object' && directValue.$type !== 'UNDEFINED' && directValue.$type !== 'NOT_INCLUDED') {
                const formatted = formatCoverageValue(key, directValue);
                isIncluded = formatted.isIncluded;
                valueText = formatted.text;
            } else {
                // Yoksa saglikPaketi.tedaviSekli'ne bak
                isIncluded = tedaviStatus.ayaktaTedavi;
                // Ayakta tedavi sayısı varsa göster
                if (isIncluded && coverage.saglikPaketi?.ayaktaYillikTedaviSayisi) {
                    valueText = `${coverage.saglikPaketi.ayaktaYillikTedaviSayisi} Adet/Yıl`;
                } else {
                    valueText = isIncluded ? 'Dahil' : 'Dahil Değil';
                }
            }
        } else {
            // Diğer teminatlar için normal kontrol
            const value = coverage[key as keyof TssCoverage];
            const formatted = formatCoverageValue(key, value);
            isIncluded = formatted.isIncluded;
            valueText = formatted.text;
        }
        
        mainGuarantees.push({
            insuranceGuaranteeId: guaranteeId.toString(),
            label,
            valueText,
            amount: 0,
            isIncluded,
        } as Guarantee & { isIncluded: boolean });
        guaranteeId++;
    });
    
    return mainGuarantees;
};

/**
 * Modal'da gösterilecek tüm teminatları getir
 * Tüm UNDEFINED/NOT_INCLUDED olanlar da dahil - X olarak gösterilecek
 * 
 * API Response'a göre tüm değerler formatlanır
 */
export const getAllCoverages = (coverage: TssCoverage | null): Guarantee[] => {
    if (!coverage) return [];
    
    const tedaviStatus = getTedaviCoverageStatus(coverage);
    const allGuarantees: Guarantee[] = [];
    let guaranteeId = 1;
    
    TSS_ALL_COVERAGES.forEach((key) => {
        const label = TSS_COVERAGE_LABELS[key] || key;
        let isIncluded = false;
        let valueText = 'Dahil Değil';
        
        if (key === 'yatarakTedavi') {
            // Önce doğrudan yatarakTedavi değerine bak
            const directValue = coverage.yatarakTedavi;
            if (directValue && typeof directValue === 'object' && directValue.$type !== 'UNDEFINED' && directValue.$type !== 'NOT_INCLUDED') {
                const formatted = formatCoverageValue(key, directValue);
                isIncluded = formatted.isIncluded;
                valueText = formatted.text;
            } else {
                // Yoksa saglikPaketi.tedaviSekli'ne bak
                isIncluded = tedaviStatus.yatarakTedavi;
                valueText = isIncluded ? 'Limitsiz' : 'Dahil Değil';
            }
        } else if (key === 'ayaktaTedavi') {
            // Önce doğrudan ayaktaTedavi değerine bak
            const directValue = coverage.ayaktaTedavi;
            if (directValue && typeof directValue === 'object' && directValue.$type !== 'UNDEFINED' && directValue.$type !== 'NOT_INCLUDED') {
                const formatted = formatCoverageValue(key, directValue);
                isIncluded = formatted.isIncluded;
                valueText = formatted.text;
            } else {
                // Yoksa saglikPaketi.tedaviSekli'ne bak
                isIncluded = tedaviStatus.ayaktaTedavi;
                if (isIncluded && coverage.saglikPaketi?.ayaktaYillikTedaviSayisi) {
                    valueText = `${coverage.saglikPaketi.ayaktaYillikTedaviSayisi} Adet/Yıl`;
                } else {
                    valueText = isIncluded ? 'Dahil' : 'Dahil Değil';
                }
            }
        } else {
            // Diğer teminatlar - API'den gelen object yapısına göre
            const value = coverage[key as keyof TssCoverage];
            const formatted = formatCoverageValue(key, value);
            isIncluded = formatted.isIncluded;
            valueText = formatted.text;
        }
        
        allGuarantees.push({
            insuranceGuaranteeId: guaranteeId.toString(),
            label,
            valueText,
            amount: 0,
            isIncluded,
        } as Guarantee & { isIncluded: boolean });
        guaranteeId++;
    });
    
    return allGuarantees;
};

/**
 * API'den gelen TSS Coverage'ı Guarantee array'ine dönüştürme
 */
export const convertTssCoverageToGuarantees = (coverage: TssCoverage | null): Guarantee[] => {
    return getAllCoverages(coverage);
};

/**
 * Coverage'ı birleştirme (optimalCoverage > pdfCoverage > insuranceServiceProviderCoverage > initialCoverage)
 * optimalCoverage her zaman öncelikli!
 */
export const mergeTssCoverages = (
    optimalCoverage: TssCoverage | null,
    pdfCoverage: TssCoverage | null,
    insuranceServiceProviderCoverage: TssCoverage | null,
    initialCoverage: TssCoverage | null
): TssCoverage | null => {
    // En az bir coverage olmalı
    if (!optimalCoverage && !pdfCoverage && !insuranceServiceProviderCoverage && !initialCoverage) {
        return null;
    }
    
    const allKeys = new Set<string>();
    
    // Tüm key'leri topla - optimalCoverage dahil
    [optimalCoverage, pdfCoverage, insuranceServiceProviderCoverage, initialCoverage].forEach(cov => {
        if (cov) {
            Object.keys(cov).forEach(key => allKeys.add(key));
        }
    });
    
    const mergedCoverage: any = { $type: 'tss' };

    allKeys.forEach(key => {
        if (key === '$type') return;
        
        // Öncelik sırası: optimalCoverage > pdfCoverage > insuranceServiceProviderCoverage > initialCoverage
        for (const src of [optimalCoverage, pdfCoverage, insuranceServiceProviderCoverage, initialCoverage]) {
            if (!src) continue;
            const value = (src as any)[key];
            
            // Geçerli bir değer varsa kullan
            if (value !== null && value !== undefined) {
                // UNDEFINED type'ı atla, daha iyi bir değer arayalım
                if (typeof value === 'object' && value.$type === 'UNDEFINED') {
                    continue;
                }
                mergedCoverage[key] = value;
                break;
            }
        }
        
        // Hiçbir kaynakta geçerli değer yoksa, ilk bulunan değeri al
        if (!(key in mergedCoverage)) {
            for (const src of [optimalCoverage, pdfCoverage, insuranceServiceProviderCoverage, initialCoverage]) {
                if (src && key in (src as any)) {
                    mergedCoverage[key] = (src as any)[key];
                    break;
                }
            }
        }
    });

    return mergedCoverage as TssCoverage;
};

/**
 * Teminat değerini formatla (basit versiyon)
 */
export const formatGuaranteeValue = (guarantee: Guarantee): string => {
    if (guarantee.valueText) {
        return guarantee.valueText;
    }
    if (guarantee.amount) {
        return guarantee.amount.toLocaleString('tr-TR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }
    return 'Dahil Değil';
};

/**
 * Teminat açıklamasını getir
 */
export const getCoverageDescription = (key: string): string | null => {
    return TSS_COVERAGE_DESCRIPTIONS[key] || null;
};

/**
 * Label'dan API key'ini bul
 */
export const getApiKeyFromLabel = (label: string): string | null => {
    for (const [key, value] of Object.entries(TSS_COVERAGE_LABELS)) {
        if (value === label) {
            return key;
        }
    }
    return null;
};
