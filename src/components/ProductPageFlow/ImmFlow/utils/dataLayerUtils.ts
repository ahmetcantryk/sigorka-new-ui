/**
 * Imm Flow - DataLayer Utility Fonksiyonları
 * 
 * GTM event'leri için yardımcı fonksiyonlar
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

// ==================== FORM STEP EVENT'LERİ ====================

/**
 * İMM Step 1 (Kişisel Bilgiler) tamamlandığında
 */
export const pushImmStep1Complete = (): void => {
  const eventData = {
    event: "imm_formsubmit",
    form_name: "imm_step1"
  };
  console.log('📊 DataLayer Push - İMM Step 1:', eventData);
  pushToDataLayer(eventData);
};

/**
 * İMM Step 2 (Araç Bilgileri) tamamlandığında
 */
export const pushImmStep2Complete = (): void => {
  const eventData = {
    event: "imm_formsubmit",
    form_name: "imm_step2"
  };
  console.log('📊 DataLayer Push - İMM Step 2:', eventData);
  pushToDataLayer(eventData);
};

// ==================== TEKLİF EVENT'LERİ ====================

/**
 * İMM teklif başarılı
 */
export const pushImmQuoteSuccess = (): void => {
  const eventData = {
    event: "imm_formsubmit",
    form_name: "imm_teklif_basarili"
  };
  console.log('📊 DataLayer Push - İMM Quote Success:', eventData);
  pushToDataLayer(eventData);
};

/**
 * İMM teklif başarısız
 */
export const pushImmQuoteFailed = (): void => {
  const eventData = {
    event: "imm_formsubmit",
    form_name: "imm_teklif_basarisiz"
  };
  console.log('📊 DataLayer Push - İMM Quote Failed:', eventData);
  pushToDataLayer(eventData);
};

// ==================== SATIN ALMA EVENT'LERİ ====================

/**
 * İMM satın al tıklandığında
 */
export const pushImmPurchaseClick = (
  quoteId: string,
  company: string | undefined,
  price: number | undefined
): void => {
  const eventData = {
    event: "imm_satinal",
    quote_id: quoteId,
    company: company,
    price: price
  };
  console.log('📊 DataLayer Push - İMM Purchase Click:', eventData);
  pushToDataLayer(eventData);
};

/**
 * İMM ödeme başarılı
 */
export const pushImmPaymentSuccess = (): void => {
  const eventData = {
    event: "imm_satinal",
    form_name: "imm_odeme_basarili"
  };
  console.log('📊 DataLayer Push - İMM Payment Success:', eventData);
  pushToDataLayer(eventData);
};

/**
 * İMM ödeme başarısız
 */
export const pushImmPaymentFailed = (errorMessage?: string): void => {
  const eventData = {
    event: "imm_satinal",
    form_name: "imm_odeme_basarisiz"
  };
  console.log('📊 DataLayer Push - İMM Payment Failed:', eventData);
  pushToDataLayer(eventData);
};

