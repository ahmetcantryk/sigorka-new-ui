/**
 * Kasko Flow - DataLayer Utility Fonksiyonları
 * 
 * Google Tag Manager DataLayer push işlemleri
 */

// DataLayer type declaration
declare global {
  interface Window {
    dataLayer: any[];
  }
}

/**
 * DataLayer'a event push eder
 */
export const pushToDataLayer = (eventData: any): void => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventData);
  }
};

// ==================== KASKO EVENTS ====================

/**
 * Kasko Step 1 tamamlandığında
 */
export const pushKaskoStep1Complete = (): void => {
  const eventData = {
    event: "kasko_formsubmit",
    form_name: "kasko_step1"
  };
  console.log('📊 DataLayer Push - Kasko Step 1:', eventData);
  pushToDataLayer(eventData);
};

/**
 * Kasko Step 2 tamamlandığında
 */
export const pushKaskoStep2Complete = (): void => {
  const eventData = {
    event: "kasko_formsubmit",
    form_name: "kasko_step2"
  };
  console.log('📊 DataLayer Push - Kasko Step 2:', eventData);
  pushToDataLayer(eventData);
};

/**
 * Kasko teklif başarılı
 */
export const pushKaskoQuoteSuccess = (): void => {
  const eventData = {
    event: "kasko_formsubmit",
    form_name: "kasko_teklif_basarili"
  };
  console.log('📊 DataLayer Push - Kasko Quote Success:', eventData);
  pushToDataLayer(eventData);
};

/**
 * Kasko teklif başarısız
 */
export const pushKaskoQuoteFailed = (): void => {
  const eventData = {
    event: "kasko_formsubmit",
    form_name: "kasko_teklif_basarisiz"
  };
  console.log('📊 DataLayer Push - Kasko Quote Failed:', eventData);
  pushToDataLayer(eventData);
};

/**
 * Kasko satın al butonu tıklandığında
 */
export const pushKaskoPurchaseClick = (
  quoteId: string,
  company: string | undefined,
  price: number | undefined
): void => {
  const eventData = {
    event: "kasko_satinal",
    quote_id: quoteId,
    company: company,
    price: price
  };
  console.log('📊 DataLayer Push - Kasko Purchase Click:', eventData);
  pushToDataLayer(eventData);
};

/**
 * Kasko ödeme başarılı
 */
export const pushKaskoPaymentSuccess = (): void => {
  const eventData = {
    event: "kasko_satinal",
    form_name: "kasko_odeme_basarili"
  };
  console.log('📊 DataLayer Push - Kasko Payment Success:', eventData);
  pushToDataLayer(eventData);
};

/**
 * Kasko ödeme başarısız
 */
export const pushKaskoPaymentFailed = (errorMessage?: string): void => {
  const eventData = {
    event: "kasko_satinal",
    form_name: "kasko_odeme_basarisiz"
  };
  console.log('📊 DataLayer Push - Kasko Payment Failed:', eventData);
  pushToDataLayer(eventData);
};

