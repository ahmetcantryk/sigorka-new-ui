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
  pushToDataLayer({
    event: "kasko_formsubmit",
    form_name: "kasko_step1"
  });
};

/**
 * Kasko Step 2 tamamlandığında
 */
export const pushKaskoStep2Complete = (): void => {
  pushToDataLayer({
    event: "kasko_formsubmit",
    form_name: "kasko_step2"
  });
};

/**
 * Kasko teklif başarılı
 */
export const pushKaskoQuoteSuccess = (): void => {
  pushToDataLayer({
    event: "kasko_formsubmit",
    form_name: "kasko_teklif_basarili"
  });
};

/**
 * Kasko teklif başarısız
 */
export const pushKaskoQuoteFailed = (): void => {
  pushToDataLayer({
    event: "kasko_formsubmit",
    form_name: "kasko_teklif_basarisiz"
  });
};

/**
 * Kasko satın al butonu tıklandığında
 */
export const pushKaskoPurchaseClick = (
  quoteId: string,
  company: string | undefined,
  price: number | undefined
): void => {
  pushToDataLayer({
    event: "kasko_purchase_click",
    quote_id: quoteId,
    company: company,
    price: price
  });
};

