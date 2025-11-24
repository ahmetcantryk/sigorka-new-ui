# Sigorka Next.js Proje Kuralları ve Yeni Yapı Mimarisi

## 📋 Proje Genel Bakış

Bu dokuman, Sigorka Next.js sigorta projesinde yapılacak köklü değişiklikler için kuralları ve mimariyi tanımlar.

---

## 🎯 Değişiklik Hedefi

**Müşteri İsteği:** Teklif formlarını ve satın alma süreçlerini ürün detay sayfalarına (örn: `/urunler/kasko-sigortasi`) taşımak, URL'de query parameter kullanarak tüm durumları yönetmek.

### Mevcut Yapı
```
/kasko-teklif (2 step: login + form) 
  → /kasko/quote-comparison/[proposalId] (teklif karşılaştırma)
  → /purchase/[proposalId]/[productId] (satın alma)
  → /odeme-sonuc (sonuç)
```

### Yeni Yapı
```
/kasko-sigortasi                    → Form + Ürün detayı (default)
  ?proposalId=xxx                   → Teklif detayı göster
  ?purchaseId=xxx                   → Satın alma ekranı göster
```

---

## 🏗️ Mimari Kurallar

### 1. SSR (Server-Side Rendering) Korunmalıdır
- **ASLA** SSR yapısını bozmamalısınız
- Tüm sayfalar SEO için SSR destekli olmalıdır
- `page.tsx` dosyaları metadata içermeli
- Client-side işlemler `"use client"` direktifi ile ayrı dosyalarda olmalı

### 2. Klasör Yapısı ve Organizasyon

```
src/
├── components/
│   ├── QuoteFlow/              # Mevcut form componentleri (KORUNACAK)
│   │   ├── KaskoQuote/
│   │   ├── TrafikQuote/
│   │   └── ...
│   │
│   ├── ProductPageFlow/        # YENİ: Ürün sayfası için flow componentleri
│   │   ├── KaskoFlow/
│   │   │   ├── KaskoProductForm.tsx         # Stil-sız kasko formu
│   │   │   ├── KaskoProductQuoteView.tsx    # Teklif görüntüleme
│   │   │   ├── KaskoProductPurchase.tsx     # Satın alma
│   │   │   └── index.ts
│   │   │
│   │   ├── TrafikFlow/
│   │   ├── KonutFlow/
│   │   └── shared/             # Ortak componentler
│   │       ├── ProductFormWrapper.tsx
│   │       ├── QuoteViewWrapper.tsx
│   │       └── PurchaseWrapper.tsx
│   │
│   └── common/
│       └── ProductPageManager.tsx  # URL state yöneticisi
│
├── app/
│   ├── kasko-teklif/           # Mevcut (KORUNACAK)
│   │   ├── page.tsx
│   │   └── client.tsx
│   │
│   └── kasko-sigortasi/        # GÜNCELLENECEK
│       ├── page.tsx            # SSR metadata
│       └── client.tsx          # Dynamic content manager
```

### 3. Component Kategorileri

#### A. Mevcut Componentler (KORUNACAK)
- `src/components/QuoteFlow/*` → Mevcut teklif formları
- Hiçbir değişiklik yapılmamalı
- Mevcut `/kasko-teklif` gibi sayfalar çalışmaya devam etmeli

#### B. Yeni Componentler (OLUŞTURULACAK)
- `src/components/ProductPageFlow/*` → Ürün sayfası için özel componentler
- Stil-sız (headless) versiyonlar
- Custom CSS ile stillendirilecek (MUI kullanılmayacak)

### 4. URL Query Parameter Yapısı

#### Query Parameter Tipleri
```typescript
interface ProductPageQuery {
  mode?: 'form' | 'quote' | 'purchase';
  proposalId?: string;
  purchaseId?: string;
  step?: string;  // form içinde adım yönetimi
}
```

#### Kullanım Örnekleri
```
/kasko-sigortasi                           → Form + İçerik (default)
/kasko-sigortasi?step=2                    → Form 2. adım
/kasko-sigortasi?proposalId=abc123         → Teklif detayı
/kasko-sigortasi?purchaseId=xyz789         → Satın alma
```

#### URL Yönetimi Kuralları
1. **Next.js Router kullan:** `useSearchParams()` hook'u ile
2. **SSR Uyumlu:** `searchParams` prop'u ile server-side'da da erişilebilir
3. **Shallow Routing:** Sayfa refresh olmadan URL güncelle
4. **History API:** Geri butonu düzgün çalışmalı

---

## 🔧 Implementasyon Kuralları

### 1. Form Componentleri

#### Stil-sız Form Oluşturma
```typescript
// ❌ YANLIŞ: MUI kullanma
import { TextField, Button } from '@mui/material';

// ✅ DOĞRU: Native HTML + Custom CSS
interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, value, onChange, error }) => (
  <div className="form-input">
    <label className="form-input__label">{label}</label>
    <input 
      type="text"
      className="form-input__field"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
    {error && <span className="form-input__error">{error}</span>}
  </div>
);
```

#### Form State Yönetimi
- **Formik kullan:** Mevcut yapıyla tutarlılık için
- **Yup validation:** Form validasyonu için
- **Local Storage:** Geçici veri saklama (user refresh durumu)

### 2. API Entegrasyonları

#### ProposalId Oluşturma
```typescript
// Mevcut flow ile aynı
const createProposal = async (vehicleData) => {
  const response = await fetchWithAuth(API_ENDPOINTS.PROPOSALS_CREATE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      $type: 'kasko',
      vehicleId: vehicleData.id,
      productBranch: 'KASKO',
      insurerCustomerId: customerId,
      insuredCustomerId: customerId,
      coverageGroupIds: getCoverageGroupIds('kasko'),
      channel: 'WEBSITE',
    })
  });
  
  const result = await response.json();
  return result.proposalId || result.id;
};
```

#### URL Güncelleme
```typescript
// ProposalId oluştuktan sonra URL'i güncelle
const handleProposalCreated = (proposalId: string) => {
  const params = new URLSearchParams(window.location.search);
  params.set('proposalId', proposalId);
  params.delete('mode'); // form mode'unu kaldır
  
  router.push(`/urunler/kasko-sigortasi?${params.toString()}`, { 
    shallow: true 
  });
};
```

### 3. Component Lifecycle

#### Page Manager Component
```typescript
'use client';

import { useSearchParams } from 'next/navigation';

const KaskoProductPageManager = () => {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const proposalId = searchParams.get('proposalId');
  const purchaseId = searchParams.get('purchaseId');

  // Öncelik sırası: purchaseId > proposalId > mode > default
  if (purchaseId) {
    return <KaskoProductPurchase purchaseId={purchaseId} />;
  }
  
  if (proposalId) {
    return <KaskoProductQuoteView proposalId={proposalId} />;
  }
  
  if (mode === 'form') {
    return <KaskoProductForm />;
  }

  // Default: Ürün detayı
  return <KaskoProductDetailContent />;
};
```

### 4. Performans Optimizasyonları

#### Code Splitting
```typescript
// Lazy loading ile büyük componentleri yükle
const KaskoProductForm = dynamic(() => import('./KaskoProductForm'), {
  loading: () => <FormSkeleton />,
  ssr: false // Client-only form
});

const KaskoProductQuoteView = dynamic(() => import('./KaskoProductQuoteView'), {
  loading: () => <QuoteSkeleton />,
  ssr: true // SEO için SSR
});
```

#### Data Fetching
```typescript
// SWR veya React Query kullan (caching için)
const { data: proposalData, error } = useSWR(
  proposalId ? `/api/proposals/${proposalId}` : null,
  fetcher,
  {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  }
);
```

---

## 🎨 Styling Kuralları

### 1. CSS Yapısı
```
src/styles/
├── product-flow/
│   ├── product-page-flow.css       # Tüm ürün detay sayfaları için genel CSS
│   ├── quote-view.css
│   └── purchase.css
└── variables.css
```

### 2. CSS Naming Convention (BEM)
```css
/* Block */
.kasko-form { }

/* Element */
.kasko-form__input { }
.kasko-form__button { }

/* Modifier */
.kasko-form__input--error { }
.kasko-form__button--disabled { }
```

### 3. Responsive Design
```css
/* Mobile First Approach */
.kasko-form {
  padding: 1rem;
}

@media (min-width: 768px) {
  .kasko-form {
    padding: 2rem;
  }
}

@media (min-width: 1024px) {
  .kasko-form {
    padding: 3rem;
  }
}
```

---

## 📱 Responsive & UX Kuralları

### 1. Mobile Öncelikli
- Her component önce mobile için tasarlanmalı
- Touch-friendly buton boyutları (min 44x44px)
- Form inputları mobile'da kolay doldurulabilir olmalı

### 2. Loading States
```typescript
interface LoadingState {
  isLoading: boolean;
  loadingMessage?: string;
  progress?: number;
}

// Her async işlem için loading state göster
const [loadingState, setLoadingState] = useState<LoadingState>({
  isLoading: false
});
```

### 3. Error Handling
```typescript
interface ErrorState {
  hasError: boolean;
  errorMessage?: string;
  errorType?: 'validation' | 'api' | 'network';
}

// Kullanıcı dostu hata mesajları
const getErrorMessage = (error: any): string => {
  if (error.type === 'validation') {
    return 'Lütfen tüm alanları kontrol edin.';
  }
  if (error.type === 'network') {
    return 'Bağlantı hatası. Lütfen tekrar deneyin.';
  }
  return 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
};
```

---

## 🔒 Güvenlik Kuralları

### 1. Authentication
- Her API isteğinde token kontrolü
- Token expire durumunda refresh
- Yetkisiz erişimlerde login'e yönlendir

### 2. Data Validation
- Client-side ve server-side validation
- XSS koruması için input sanitization
- CSRF token kullanımı

---

## 🧪 Test Kuralları

### 1. Her Component Test Edilmeli
```typescript
// Component test example
describe('KaskoProductForm', () => {
  it('should render form fields correctly', () => {
    render(<KaskoProductForm />);
    expect(screen.getByLabelText('Plaka')).toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(<KaskoProductForm />);
    const submitButton = screen.getByText('Devam Et');
    fireEvent.click(submitButton);
    await waitFor(() => {
      expect(screen.getByText('Bu alan zorunludur')).toBeInTheDocument();
    });
  });
});
```

### 2. SSR Test
```typescript
// SSR sayfalarının düzgün render olduğunu test et
describe('Kasko Sigortasi Page SSR', () => {
  it('should render with metadata', async () => {
    const { container } = await render(
      <KaskoSigortasiPage searchParams={{}} />
    );
    expect(container).toMatchSnapshot();
  });
});
```

---

## 📊 Analytics & Tracking

### 1. DataLayer Events
```typescript
// Her önemli aksiyonda dataLayer push
const pushFormEvent = (eventName: string, formData: any) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: eventName,
      form_name: 'kasko_product_page',
      ...formData
    });
  }
};

// Kullanım
pushFormEvent('kasko_form_start', { step: 1 });
pushFormEvent('kasko_form_complete', { proposalId });
```

---

## ✅ Checklist

### Geliştirme Öncesi
- [ ] Mevcut kod yedeklendi
- [ ] Component yapısı planlandı
- [ ] API endpoint'leri doğrulandı
- [ ] CSS yapısı tasarlandı

### Geliştirme Sırası
- [ ] ProductPageManager component oluşturuldu
- [ ] URL query parameter management implementasyonu
- [ ] Stil-sız form componentleri oluşturuldu
- [ ] API entegrasyonları tamamlandı
- [ ] CSS stilleri eklendi
- [ ] Error handling implementasyonu
- [ ] Loading states eklendi

### Test
- [ ] SSR düzgün çalışıyor
- [ ] URL parametreleri doğru çalışıyor
- [ ] Form submission başarılı
- [ ] Teklif görüntüleme çalışıyor
- [ ] Satın alma akışı tamamlanıyor
- [ ] Mobile responsive
- [ ] Browser back button çalışıyor
- [ ] Error states doğru gösteriliyor

### Deployment Öncesi
- [ ] Performance optimizasyonu
- [ ] SEO kontrolleri
- [ ] Analytics events test edildi
- [ ] Cross-browser test
- [ ] Production build test

---

## 🚨 YAPILMAMASI GEREKENLER

1. ❌ Mevcut `/kasko-teklif` sayfasını silme/bozma
2. ❌ `src/components/QuoteFlow/*` içindeki dosyaları değiştirme
3. ❌ SSR yapısını bozan değişiklikler
4. ❌ MUI kullanarak yeni componentler oluşturma
5. ❌ Mevcut API endpoint'lerini değiştirme
6. ❌ localStorage key'lerini değiştirme (backward compatibility)
7. ❌ Authentication flow'u bozmak

---

## 📞 Teknik Detaylar

### Next.js Version
- Next.js 15.3.1
- React 19.0.0
- TypeScript

### Key Dependencies
- Formik: Form yönetimi
- Yup: Validation
- Zustand: State management
- SWR/React Query: Data fetching (önerilen)

### API Base URL
```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.insurup.com';
```

### Environment Variables
```
NEXT_PUBLIC_API_BASE_URL=https://api.insurup.com
```

---

## 📝 Notlar

1. **Backward Compatibility:** Mevcut kullanıcılar eski URL'leri kullanabilmeli
2. **SEO:** Yeni yapı SEO dostu olmalı
3. **Performance:** Sayfa yüklenme süreleri optimize edilmeli
4. **Accessibility:** WCAG 2.1 AA standartlarına uygun
5. **Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge)

---

## 🔄 Versiyon Geçmişi

- v1.0 (2024-11-20): İlk dokuman oluşturuldu
- Gelecek güncellemeler bu bölüme eklenecek

---

Bu dokuman proje boyunca rehber olarak kullanılmalı ve güncel tutulmalıdır.

