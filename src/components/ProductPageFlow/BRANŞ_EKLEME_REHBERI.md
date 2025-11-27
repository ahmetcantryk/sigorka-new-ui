# Yeni Branş Ekleme Rehberi

Bu döküman, mevcut Kasko akışı yapısını kullanarak yeni bir sigorta branşı (örn: Trafik Sigortası) ekleme adımlarını açıklar.

---

## 📁 Klasör Yapısı

Yeni branş için aşağıdaki klasör yapısını oluşturun:

```
src/components/ProductPageFlow/
├── KaskoFlow/           # Mevcut (referans)
├── TrafikFlow/          # YENİ
│   ├── config/
│   │   ├── index.ts
│   │   ├── trafikConstants.ts
│   │   └── trafikValidation.ts
│   ├── utils/
│   │   ├── index.ts
│   │   ├── coverageUtils.ts      # Branşa özel teminat işleme
│   │   ├── quoteUtils.ts         # Ortak kullanılabilir
│   │   └── dataLayerUtils.ts     # Branşa özel event'ler
│   ├── hooks/
│   │   ├── index.ts
│   │   ├── useTrafikQuotes.ts
│   │   └── useTrafikVehicle.ts   # Kasko ile paylaşılabilir
│   ├── components/
│   │   ├── index.ts
│   │   ├── steps/
│   │   │   ├── index.ts
│   │   │   ├── PersonalInfoStep.tsx    # Kasko'dan import edilebilir
│   │   │   ├── VehicleSelectionStep.tsx # Kasko'dan import edilebilir
│   │   │   └── AdditionalInfoStep.tsx   # Kasko'dan import edilebilir
│   │   ├── quote/
│   │   │   ├── index.ts
│   │   │   ├── TrafikQuoteCard.tsx
│   │   │   └── TrafikQuoteList.tsx
│   │   └── common/
│   │       ├── index.ts
│   │       └── TrafikStepper.tsx
│   ├── TrafikProductForm.tsx
│   ├── TrafikProductQuote.tsx
│   ├── types.ts
│   └── index.tsx
```

---

## 🔧 Adım Adım Uygulama

### 1. Config Dosyaları

#### `trafikConstants.ts`

```typescript
/**
 * Trafik Flow - Sabit Değerler ve Konfigürasyonlar
 */

import { VehicleUtilizationStyle, VehicleFuelType } from '@/types/enums/vehicleEnums';

// ==================== JOB (MESLEK) ====================
// Kasko'dan import edilebilir veya ortak bir dosyaya taşınabilir
export { Job, JOB_OPTIONS } from '../../KaskoFlow/config/kaskoConstants';

// ==================== ARAÇ KULLANIM ŞEKLİ ====================
// Trafik için farklı olabilir - gerekirse özelleştir
export { VEHICLE_USAGE_OPTIONS, FUEL_TYPE_OPTIONS } from '../../KaskoFlow/config/kaskoConstants';

// ==================== TRAFİK TEMİNAT ETİKETLERİ ====================
export const TRAFIK_COVERAGE_LABELS: Record<string, string> = {
  maddiHasar: 'Maddi Hasar',
  bedeniHasar: 'Bedeni Hasar',
  olum: 'Ölüm',
  tedaviGiderleri: 'Tedavi Giderleri',
  // Trafik'e özel teminatlar...
};

// ==================== FORM VARSAYILAN DEĞERLERİ ====================
export const TRAFIK_FORM_DEFAULTS = {
  identityNumber: '',
  email: '',
  phoneNumber: '',
  birthDate: '',
  job: 0, // Job.Unknown
  fullName: '',
  city: '',
  district: '',
  selectionType: 'new' as const,
  vehicleType: 'plated' as const,
  plateCity: '',
  plateCode: '',
  documentSerialCode: '',
  documentSerialNumber: '',
  brandCode: '',
  brand: '',
  modelCode: '',
  model: '',
  year: new Date().getFullYear().toString(),
  usageType: VehicleUtilizationStyle.PrivateCar,
  fuelType: VehicleFuelType.Diesel,
  engineNo: '',
  chassisNo: '',
  registrationDate: new Date().toISOString().split('T')[0],
  seatCount: '5',
};

// ==================== STEP KONFIGÜRASYONU ====================
export const TRAFIK_STEPS = [
  { id: 0, label: ['Kişisel', 'Bilgiler'] },
  { id: 1, label: ['Araç', 'Bilgileri'] },
  { id: 2, label: ['Teklif', 'Karşılaştırma'] },
  { id: 3, label: ['Ödeme'] },
];

// ==================== LOCAL STORAGE KEYS ====================
export const TRAFIK_STORAGE_KEYS = {
  PROPOSAL_ID: 'proposalIdForTrafik',
  SELECTED_QUOTE: 'selectedQuoteForPurchaseTrafik',
  CURRENT_PROPOSAL: 'currentProposalIdTrafik',
  SELECTED_PRODUCT: 'selectedProductIdForTrafik',
  INITIAL_EMAIL: 'trafikInitialEmail',
  INITIAL_JOB: 'trafikInitialJob',
  PERSONAL_INFO_COMPLETED: 'trafikPersonalInfoCompleted',
  CASE_CREATED: 'trafikCaseCreated',
};

// ==================== POLLING KONFIGÜRASYONU ====================
export const TRAFIK_POLLING_CONFIG = {
  INTERVAL: 5000,          // 5 saniye
  TIMEOUT: 180000,         // 3 dakika
  INITIAL_PROGRESS: 30,    // Başlangıç progress
  FINISH_DURATION: 30000,  // Active quote sonrası 30 saniye
};
```

#### `trafikValidation.ts`

```typescript
/**
 * Trafik Flow - Validation Şemaları
 * 
 * Kasko ile aynı validation kuralları kullanılabilir
 */

// Kasko'dan import et (aynı kurallar)
export {
  personalInfoValidationSchema,
  vehicleValidationSchema,
  additionalInfoValidationSchema,
  getValidationSchemaByStep,
  validateFormValues,
} from '../../KaskoFlow/config/kaskoValidation';

// Trafik'e özel validation gerekirse:
// import * as yup from 'yup';
// export const trafikSpecificSchema = yup.object({...});
```

---

### 2. Utils Dosyaları

#### `coverageUtils.ts`

```typescript
/**
 * Trafik Flow - Teminat Utility Fonksiyonları
 */

import { TRAFIK_COVERAGE_LABELS } from '../config/trafikConstants';
import type { TrafikCoverage, Guarantee, ProcessedQuote } from '../types';

// Trafik teminatlarını işleme
export const convertTrafikCoverageToGuarantees = (coverage: TrafikCoverage | null): Guarantee[] => {
  if (!coverage) return [];
  
  const guarantees: Guarantee[] = [];
  let guaranteeId = 1;

  Object.entries(coverage).forEach(([key, value]) => {
    if (key === '$type' || key === 'productBranch') return;

    const label = TRAFIK_COVERAGE_LABELS[key] || key;
    
    // Trafik'e özel value işleme...
    guarantees.push({
      insuranceGuaranteeId: guaranteeId.toString(),
      label,
      valueText: formatTrafikValue(value),
      amount: typeof value === 'number' ? value : 0
    });
    guaranteeId++;
  });

  return guarantees.sort((a, b) => a.label.localeCompare(b.label));
};

const formatTrafikValue = (value: any): string => {
  // Trafik'e özel formatlama...
  if (typeof value === 'number') {
    return value.toLocaleString('tr-TR') + ' ₺';
  }
  return value?.toString() || '-';
};

// Ana teminatlar (Trafik için farklı)
export const getMainTrafikCoverages = (quote: ProcessedQuote): Guarantee[] => {
  const coverages = quote.insuranceCompanyGuarantees || [];
  
  // Trafik için önemli teminatlar
  const maddiHasar = coverages.find(g => g.label === 'Maddi Hasar');
  const bedeniHasar = coverages.find(g => g.label === 'Bedeni Hasar');
  const olum = coverages.find(g => g.label === 'Ölüm');
  const tedavi = coverages.find(g => g.label === 'Tedavi Giderleri');

  const defaultGuarantee = (label: string): Guarantee => ({
    insuranceGuaranteeId: `default-${label}`,
    label,
    valueText: null,
    amount: 0
  });

  return [
    maddiHasar || defaultGuarantee('Maddi Hasar'),
    bedeniHasar || defaultGuarantee('Bedeni Hasar'),
    olum || defaultGuarantee('Ölüm'),
    tedavi || defaultGuarantee('Tedavi Giderleri'),
  ];
};
```

#### `dataLayerUtils.ts`

```typescript
/**
 * Trafik Flow - DataLayer Utility Fonksiyonları
 */

declare global {
  interface Window {
    dataLayer: any[];
  }
}

const pushToDataLayer = (eventData: any): void => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventData);
  }
};

// Trafik Step 1 tamamlandığında
export const pushTrafikStep1Complete = (): void => {
  pushToDataLayer({
    event: "trafik_formsubmit",
    form_name: "trafik_step1"
  });
};

// Trafik Step 2 tamamlandığında
export const pushTrafikStep2Complete = (): void => {
  pushToDataLayer({
    event: "trafik_formsubmit",
    form_name: "trafik_step2"
  });
};

// Trafik teklif başarılı
export const pushTrafikQuoteSuccess = (): void => {
  pushToDataLayer({
    event: "trafik_formsubmit",
    form_name: "trafik_teklif_basarili"
  });
};

// Trafik teklif başarısız
export const pushTrafikQuoteFailed = (): void => {
  pushToDataLayer({
    event: "trafik_formsubmit",
    form_name: "trafik_teklif_basarisiz"
  });
};

// Trafik satın al tıklandığında
export const pushTrafikPurchaseClick = (
  quoteId: string,
  company: string | undefined,
  price: number | undefined
): void => {
  pushToDataLayer({
    event: "trafik_purchase_click",
    quote_id: quoteId,
    company: company,
    price: price
  });
};
```

#### `quoteUtils.ts`

```typescript
/**
 * Trafik Flow - Quote Utility Fonksiyonları
 * 
 * Çoğu fonksiyon Kasko ile aynı - import edilebilir
 */

// Kasko'dan ortak fonksiyonları import et
export {
  getSelectedPremium,
  filterQuotes,
  sortQuotes,
  getUniqueCoverageGroups,
  areAllQuotesFinalized,
  hasWaitingQuotes,
  hasActiveQuotes,
  preparePurchaseData,
} from '../../KaskoFlow/utils/quoteUtils';

// Trafik'e özel: processQuotesData
import type { Quote, ProcessedQuote, InsuranceCompany } from '../types';
import { convertTrafikCoverageToGuarantees } from './coverageUtils';

export const processTrafikQuotesData = (
  quotesData: Quote[],
  companies: InsuranceCompany[]
): ProcessedQuote[] => {
  return quotesData.map((quote) => {
    const company = companies.find((c) => c.id === quote.insuranceCompanyId);

    // Premium işleme (Kasko ile aynı)
    const uniquePremiums = quote.premiums.reduce((acc: any[], current) => {
      const isDuplicate = acc.some(item => item.installmentNumber === current.installmentNumber);
      if (!isDuplicate) acc.push(current);
      return acc;
    }, []);

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

    // Trafik teminatlarını işle
    const guarantees = convertTrafikCoverageToGuarantees(quote.initialCoverage);

    return {
      ...quote,
      premiums: formattedPremiums,
      company: company?.name || `Sigorta Şirketi #${quote.insuranceCompanyId}`,
      logo: `https://storage.dogasigorta.com/app-1/insurup-b2c-company/${quote.insuranceCompanyId}.png`,
      selectedInstallmentNumber: formattedPremiums[0]?.installmentNumber || 1,
      insuranceCompanyGuarantees: guarantees,
    };
  });
};

// Trafik için localStorage kaydetme
export const saveTrafikPurchaseDataToStorage = (
  purchaseData: Record<string, any>,
  proposalId: string
): void => {
  localStorage.setItem('selectedQuoteForPurchaseTrafik', JSON.stringify(purchaseData));
  localStorage.setItem('currentProposalIdTrafik', proposalId);
  localStorage.setItem('proposalIdForTrafik', proposalId || '');
  localStorage.setItem('selectedProductIdForTrafik', purchaseData.id);
};
```

---

### 3. Types Dosyası

#### `types.ts`

```typescript
/**
 * Trafik Flow Types
 */

// Ortak type'ları Kasko'dan import et
export type {
  VehicleFormData,
  ExistingVehicle,
  InsuranceCompany,
  Premium,
  Guarantee,
} from '../../KaskoFlow/types';

// Trafik'e özel props
export interface TrafikFormProps {
  onProposalCreated: (proposalId: string) => void;
  onBack?: () => void;
}

export interface TrafikQuoteViewProps {
  proposalId: string;
  onPurchaseClick: (productId: string) => void;
  onBack?: () => void;
}

// Trafik Coverage (Kasko'dan farklı)
export interface TrafikCoverage {
  $type: 'trafik';
  maddiHasar?: number;
  bedeniHasar?: number;
  olum?: number;
  tedaviGiderleri?: number;
  productBranch: string;
}

// Trafik Quote
export interface Quote {
  id: string;
  insuranceCompanyId: number;
  productId: number;
  premiums: Premium[];
  initialCoverage: TrafikCoverage | null;
  state: 'WAITING' | 'ACTIVE' | 'FAILED';
  needsInvestigationByCompany: boolean;
  revised: boolean;
  errorMessage: string | null;
  policyId: string | null;
  coverageGroupName?: string;
  company?: string;
  price?: number;
  logo?: string;
  insuranceCompanyGuarantees?: Guarantee[];
}

export interface ProcessedQuote extends Quote {
  selectedInstallmentNumber: number;
}
```

---

### 4. Hooks

#### `useTrafikQuotes.ts`

```typescript
/**
 * Trafik Flow - useTrafikQuotes Hook
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { TRAFIK_POLLING_CONFIG } from '../config/trafikConstants';
import { processTrafikQuotesData } from '../utils/quoteUtils';
import { areAllQuotesFinalized, hasWaitingQuotes } from '../../KaskoFlow/utils/quoteUtils';
import { pushTrafikQuoteSuccess, pushTrafikQuoteFailed } from '../utils/dataLayerUtils';
import type { ProcessedQuote, InsuranceCompany, Quote } from '../types';

interface UseTrafikQuotesResult {
  quotes: ProcessedQuote[];
  companies: InsuranceCompany[];
  isLoading: boolean;
  error: string | null;
  progress: number;
  handleInstallmentChange: (quoteId: string, installmentNumber: number) => void;
}

export const useTrafikQuotes = (proposalId: string): UseTrafikQuotesResult => {
  // Kasko hook'u ile aynı mantık, sadece:
  // - TRAFIK_POLLING_CONFIG kullan
  // - processTrafikQuotesData kullan
  // - pushTrafikQuoteSuccess/Failed kullan
  // - agencyConfig.homepage.partners.companies.flatMap(c => c.products.trafik || [])
  
  // ... (Kasko hook'undan kopyala ve yukarıdaki değişiklikleri yap)
};
```

#### `useTrafikVehicle.ts`

```typescript
/**
 * Trafik Flow - useTrafikVehicle Hook
 * 
 * Kasko ile aynı - doğrudan import edilebilir
 */

export { useKaskoVehicle as useTrafikVehicle } from '../../KaskoFlow/hooks/useKaskoVehicle';
```

---

### 5. Components

#### Step Bileşenleri (Kasko'dan Paylaşım)

```typescript
// components/steps/index.ts

// Kasko step'lerini doğrudan kullan (aynı form alanları)
export {
  PersonalInfoStep,
  VehicleSelectionStep,
  AdditionalInfoStep,
} from '../../../KaskoFlow/components/steps';
```

#### Quote Bileşenleri

```typescript
// components/quote/TrafikQuoteCard.tsx

'use client';

import type { ProcessedQuote } from '../../types';
import { getMainTrafikCoverages } from '../../utils/coverageUtils';
// ... Kasko QuoteCard'dan adapte et, teminat gösterimini değiştir
```

#### Stepper

```typescript
// components/common/TrafikStepper.tsx

'use client';

import { TRAFIK_STEPS } from '../../config/trafikConstants';

interface TrafikStepperProps {
  activeStep: number;
}

const TrafikStepper = ({ activeStep }: TrafikStepperProps) => {
  return (
    <div className="pp-stepper">
      {TRAFIK_STEPS.map((step) => (
        <div
          key={step.id}
          className={`pp-step ${activeStep === step.id ? 'active' : ''} ${activeStep > step.id ? 'completed' : ''}`}
        >
          <div className="pp-step-visual">
            <span>{step.id + 1}</span>
          </div>
          <div className="pp-step-label">
            {step.label.map((text, index) => (
              <span key={index}>{text}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TrafikStepper;
```

---

### 6. Ana Bileşenler

#### `TrafikProductForm.tsx`

```typescript
/**
 * TrafikProductForm
 * 
 * Kasko form yapısından adapte edildi
 */

'use client';

import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
// ... imports

// Config
import { TRAFIK_FORM_DEFAULTS, TRAFIK_STORAGE_KEYS } from './config/trafikConstants';
import { personalInfoValidationSchema, vehicleValidationSchema } from './config/trafikValidation';

// Components
import { PersonalInfoStep, VehicleSelectionStep, AdditionalInfoStep } from './components/steps';
import { TrafikStepper } from './components/common';

// Hooks
import { useTrafikVehicle } from './hooks/useTrafikVehicle';

// Utils
import { pushTrafikStep1Complete, pushTrafikStep2Complete } from './utils/dataLayerUtils';

// ... Kasko form mantığı ile aynı, sadece:
// - TRAFIK_FORM_DEFAULTS kullan
// - TRAFIK_STORAGE_KEYS kullan
// - TrafikStepper kullan
// - pushTrafikStep1Complete/2Complete kullan
// - productBranch: 'TRAFIK' gönder
// - getCoverageGroupIds('trafik') kullan
```

#### `TrafikProductQuote.tsx`

```typescript
/**
 * TrafikProductQuote
 * 
 * Kasko quote yapısından adapte edildi
 */

'use client';

import { useState } from 'react';
// ... imports

import { useTrafikQuotes } from './hooks/useTrafikQuotes';
import { TrafikQuoteList } from './components/quote';
import { TrafikStepper } from './components/common';
import { pushTrafikPurchaseClick } from './utils/dataLayerUtils';
import { saveTrafikPurchaseDataToStorage } from './utils/quoteUtils';

// ... Kasko quote mantığı ile aynı, sadece:
// - useTrafikQuotes kullan
// - TrafikQuoteList kullan
// - TrafikStepper kullan
// - pushTrafikPurchaseClick kullan
// - saveTrafikPurchaseDataToStorage kullan
```

---

## ✅ Kontrol Listesi

Yeni branş eklerken kontrol edilecekler:

- [ ] `config/` klasörü oluşturuldu
  - [ ] `constants.ts` - Sabitler, enum'lar, dropdown seçenekleri
  - [ ] `validation.ts` - Yup şemaları
- [ ] `utils/` klasörü oluşturuldu
  - [ ] `coverageUtils.ts` - Teminat işleme (branşa özel)
  - [ ] `quoteUtils.ts` - Teklif işleme
  - [ ] `dataLayerUtils.ts` - GTM event'leri
- [ ] `hooks/` klasörü oluşturuldu
  - [ ] `useXxxQuotes.ts` - Teklif polling
  - [ ] `useXxxVehicle.ts` - Araç verileri (paylaşılabilir)
- [ ] `components/` klasörü oluşturuldu
  - [ ] `steps/` - Form adımları (paylaşılabilir)
  - [ ] `quote/` - Teklif kartları (branşa özel teminat gösterimi)
  - [ ] `common/` - Stepper, popup'lar
- [ ] `types.ts` - Type tanımları
- [ ] `index.tsx` - Export'lar
- [ ] Ana form bileşeni
- [ ] Ana quote bileşeni
- [ ] API endpoint'leri kontrol edildi
- [ ] localStorage key'leri benzersiz
- [ ] DataLayer event'leri benzersiz

---

## 🔄 Paylaşılabilir Bileşenler

Kasko ile paylaşılabilecek bileşenler:

| Bileşen | Paylaşım Durumu | Açıklama |
|---------|-----------------|----------|
| `PersonalInfoStep` | ✅ Doğrudan kullan | Aynı form alanları |
| `VehicleSelectionStep` | ✅ Doğrudan kullan | Aynı araç seçimi |
| `AdditionalInfoStep` | ✅ Doğrudan kullan | Aynı ek bilgiler |
| `useKaskoVehicle` | ✅ Doğrudan kullan | Aynı araç API'leri |
| `validation.ts` | ✅ Doğrudan kullan | Aynı kurallar |
| `QuoteCard` | ⚠️ Adapte et | Farklı teminat gösterimi |
| `coverageUtils` | ❌ Yeni yaz | Farklı teminat yapısı |
| `dataLayerUtils` | ❌ Yeni yaz | Farklı event isimleri |

---

## 📝 Notlar

1. **CSS Sınıfları**: Tüm `pp-*` sınıfları ortak kullanılır, yeni CSS yazmaya gerek yok.

2. **API Endpoint'leri**: `API_ENDPOINTS` dosyasında Trafik için endpoint varsa kullan, yoksa ekle.

3. **Agency Config**: `agencyConfig.homepage.partners.companies.flatMap(c => c.products.trafik || [])` şeklinde product ID'lerini al.

4. **Coverage Group IDs**: `getCoverageGroupIds('trafik')` fonksiyonu ile teminat gruplarını al.

5. **productBranch**: API isteklerinde `productBranch: 'TRAFIK'` gönder.

