/**
 * Konut Flow - DataLayer Utility Fonksiyonları
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

// ==================== KONUT EVENTS ====================

/**
 * Konut Step 1 tamamlandığında
 */
export const pushKonutStep1Complete = (): void => {
  const eventData = {
    event: "konut_formsubmit",
    form_name: "konut_step1"
  };
  console.log('%c🏡 KONUT EVENT: Step 1 Tamamlandı', 'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;', eventData);
  pushToDataLayer(eventData);
};

/**
 * Konut Step 2 tamamlandığında
 */
export const pushKonutStep2Complete = (): void => {
  const eventData = {
    event: "konut_formsubmit",
    form_name: "konut_step2"
  };
  console.log('%c🏡 KONUT EVENT: Step 2 Tamamlandı', 'background: #2196F3; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;', eventData);
  pushToDataLayer(eventData);
};

/**
 * Konut teklif başarılı
 */
export const pushKonutQuoteSuccess = (): void => {
  const eventData = {
    event: "konut_formsubmit",
    form_name: "konut_teklif_basarili"
  };
  console.log('%c🏡 KONUT EVENT: Teklif Başarılı ✅', 'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;', eventData);
  pushToDataLayer(eventData);
};

/**
 * Konut teklif başarısız
 */
export const pushKonutQuoteFailed = (): void => {
  const eventData = {
    event: "konut_formsubmit",
    form_name: "konut_teklif_basarisiz"
  };
  console.log('%c🏡 KONUT EVENT: Teklif Başarısız ❌', 'background: #f44336; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;', eventData);
  pushToDataLayer(eventData);
};

/**
 * Konut satın al butonu tıklandığında
 */
export const pushKonutPurchaseClick = (
  quoteId: string,
  company: string | undefined,
  price: number | undefined
): void => {
  const eventData = {
    event: "konut_satinal",
    quote_id: quoteId,
    company: company,
    price: price
  };
  console.log('%c🏡 KONUT EVENT: Satın Al Tıklandı 🛒', 'background: #FF9800; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;', eventData);
  pushToDataLayer(eventData);
};

/**
 * Konut ödeme başarılı
 */
export const pushKonutPaymentSuccess = (): void => {
  const eventData = {
    event: "konut_satinal",
    form_name: "konut_odeme_basarili"
  };
  console.log('%c🏡 KONUT EVENT: Ödeme Başarılı 💳✅', 'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;', eventData);
  pushToDataLayer(eventData);
};

/**
 * Konut ödeme başarısız
 */
export const pushKonutPaymentFailed = (errorMessage?: string): void => {
  const eventData = {
    event: "konut_satinal",
    form_name: "konut_odeme_basarisiz"
  };
  console.log('%c🏡 KONUT EVENT: Ödeme Başarısız 💳❌', 'background: #f44336; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;', eventData);
  pushToDataLayer(eventData);
};
