/**
 * Trafik Flow - DataLayer Utility Fonksiyonları
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
 * Trafik Step 1 (Kişisel Bilgiler) tamamlandığında
 */
export const pushTrafikStep1Complete = (): void => {
  const eventData = {
    event: "trafik_formsubmit",
    form_name: "trafik_step1"
  };
  console.log('📊 DataLayer Push - Trafik Step 1:', eventData);
  pushToDataLayer(eventData);
};

/**
 * Trafik Step 2 (Araç Bilgileri) tamamlandığında
 */
export const pushTrafikStep2Complete = (): void => {
  const eventData = {
    event: "trafik_formsubmit",
    form_name: "trafik_step2"
  };
  console.log('📊 DataLayer Push - Trafik Step 2:', eventData);
  pushToDataLayer(eventData);
};

// ==================== TEKLİF EVENT'LERİ ====================

/**
 * Trafik teklif başarılı
 */
export const pushTrafikQuoteSuccess = (): void => {
  const eventData = {
    event: "trafik_formsubmit",
    form_name: "trafik_teklif_basarili"
  };
  console.log('📊 DataLayer Push - Trafik Quote Success:', eventData);
  pushToDataLayer(eventData);
};

/**
 * Trafik teklif başarısız
 */
export const pushTrafikQuoteFailed = (): void => {
  const eventData = {
    event: "trafik_formsubmit",
    form_name: "trafik_teklif_basarisiz"
  };
  console.log('📊 DataLayer Push - Trafik Quote Failed:', eventData);
  pushToDataLayer(eventData);
};

// ==================== SATIN ALMA EVENT'LERİ ====================

/**
 * Trafik satın al tıklandığında
 */
export const pushTrafikPurchaseClick = (
  quoteId: string,
  company: string | undefined,
  price: number | undefined
): void => {
  const eventData = {
    event: "trafik_satinal",
    quote_id: quoteId,
    company: company,
    price: price
  };
  console.log('📊 DataLayer Push - Trafik Purchase Click:', eventData);
  pushToDataLayer(eventData);
};

/**
 * Trafik ödeme başarılı
 */
export const pushTrafikPaymentSuccess = (): void => {
  const eventData = {
    event: "trafik_satinal",
    form_name: "trafik_odeme_basarili"
  };
  console.log('📊 DataLayer Push - Trafik Payment Success:', eventData);
  pushToDataLayer(eventData);
};

/**
 * Trafik ödeme başarısız
 */
export const pushTrafikPaymentFailed = (errorMessage?: string): void => {
  const eventData = {
    event: "trafik_satinal",
    form_name: "trafik_odeme_basarisiz"
  };
  console.log('📊 DataLayer Push - Trafik Payment Failed:', eventData);
  pushToDataLayer(eventData);
};

