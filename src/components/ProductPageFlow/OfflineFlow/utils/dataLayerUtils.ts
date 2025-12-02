/**
 * Offline Flow - DataLayer Utils
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

/**
 * Branş için dataLayer event'i gönderir
 */
export const pushBranchDataLayer = (
  eventPrefix: string,
  formName: string
): void => {
  pushToDataLayer({
    event: `${eventPrefix}_formsubmit`,
    form_name: `${eventPrefix}_${formName}`,
  });
};

/**
 * Step 1 tamamlandığında event gönderir
 */
export const pushOfflineStep1Complete = (eventPrefix: string): void => {
  pushBranchDataLayer(eventPrefix, 'step1');
};

/**
 * Talep oluşturulduğunda event gönderir
 */
export const pushOfflineRequestCreated = (eventPrefix: string): void => {
  pushBranchDataLayer(eventPrefix, 'talep_olusturuldu');
};

/**
 * Talep başarısız olduğunda event gönderir
 */
export const pushOfflineRequestFailed = (eventPrefix: string): void => {
  pushBranchDataLayer(eventPrefix, 'talep_basarisiz');
};

