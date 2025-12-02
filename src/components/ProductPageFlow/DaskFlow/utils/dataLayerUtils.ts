/**
 * DASK Flow - DataLayer Utility Fonksiyonları
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

// ==================== DASK EVENTS ====================

/**
 * DASK Step 1 tamamlandığında
 */
export const pushDaskStep1Complete = (): void => {
  const eventData = {
    event: "dask_formsubmit",
    form_name: "dask_step1"
  };
  console.log('%c🏠 DASK EVENT: Step 1 Tamamlandı', 'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;', eventData);
  pushToDataLayer(eventData);
};

/**
 * DASK Step 2 tamamlandığında
 */
export const pushDaskStep2Complete = (): void => {
  const eventData = {
    event: "dask_formsubmit",
    form_name: "dask_step2"
  };
  console.log('%c🏠 DASK EVENT: Step 2 Tamamlandı', 'background: #2196F3; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;', eventData);
  pushToDataLayer(eventData);
};

/**
 * DASK teklif başarılı
 */
export const pushDaskQuoteSuccess = (): void => {
  const eventData = {
    event: "dask_formsubmit",
    form_name: "dask_teklif_basarili"
  };
  console.log('%c🏠 DASK EVENT: Teklif Başarılı ✅', 'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;', eventData);
  pushToDataLayer(eventData);
};

/**
 * DASK teklif başarısız
 */
export const pushDaskQuoteFailed = (): void => {
  const eventData = {
    event: "dask_formsubmit",
    form_name: "dask_teklif_basarisiz"
  };
  console.log('%c🏠 DASK EVENT: Teklif Başarısız ❌', 'background: #f44336; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;', eventData);
  pushToDataLayer(eventData);
};

/**
 * DASK satın al butonu tıklandığında
 */
export const pushDaskPurchaseClick = (
  quoteId: string,
  company: string | undefined,
  price: number | undefined
): void => {
  const eventData = {
    event: "dask_satinal",
    quote_id: quoteId,
    company: company,
    price: price
  };
  console.log('%c🏠 DASK EVENT: Satın Al Tıklandı 🛒', 'background: #FF9800; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;', eventData);
  pushToDataLayer(eventData);
};

/**
 * DASK ödeme başarılı
 */
export const pushDaskPaymentSuccess = (): void => {
  const eventData = {
    event: "dask_satinal",
    form_name: "dask_odeme_basarili"
  };
  console.log('%c🏠 DASK EVENT: Ödeme Başarılı 💳✅', 'background: #4CAF50; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;', eventData);
  pushToDataLayer(eventData);
};

/**
 * DASK ödeme başarısız
 */
export const pushDaskPaymentFailed = (errorMessage?: string): void => {
  const eventData = {
    event: "dask_satinal",
    form_name: "dask_odeme_basarisiz"
  };
  console.log('%c🏠 DASK EVENT: Ödeme Başarısız 💳❌', 'background: #f44336; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;', eventData);
  pushToDataLayer(eventData);
};

