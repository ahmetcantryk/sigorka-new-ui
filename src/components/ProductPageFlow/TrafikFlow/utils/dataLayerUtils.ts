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
  pushToDataLayer({
    event: "trafik_formsubmit",
    form_name: "trafik_step1"
  });
};

/**
 * Trafik Step 2 (Araç Bilgileri) tamamlandığında
 */
export const pushTrafikStep2Complete = (): void => {
  pushToDataLayer({
    event: "trafik_formsubmit",
    form_name: "trafik_step2"
  });
};

// ==================== TEKLİF EVENT'LERİ ====================

/**
 * Trafik teklif başarılı
 */
export const pushTrafikQuoteSuccess = (): void => {
  pushToDataLayer({
    event: "trafik_formsubmit",
    form_name: "trafik_teklif_basarili"
  });
};

/**
 * Trafik teklif başarısız
 */
export const pushTrafikQuoteFailed = (): void => {
  pushToDataLayer({
    event: "trafik_formsubmit",
    form_name: "trafik_teklif_basarisiz"
  });
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
  pushToDataLayer({
    event: "trafik_purchase_click",
    quote_id: quoteId,
    company: company,
    price: price
  });
};

/**
 * Trafik satın alma başarılı
 */
export const pushTrafikPurchaseSuccess = (
  policyId: string,
  company: string | undefined,
  price: number | undefined
): void => {
  pushToDataLayer({
    event: "trafik_purchase_success",
    policy_id: policyId,
    company: company,
    price: price
  });
};

/**
 * Trafik satın alma başarısız
 */
export const pushTrafikPurchaseFailed = (
  errorMessage: string
): void => {
  pushToDataLayer({
    event: "trafik_purchase_failed",
    error_message: errorMessage
  });
};

