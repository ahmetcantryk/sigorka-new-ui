// Basit UTM yakalama ve saklama yardımcıları

export type AdvertisingInfo = {
  advertisingSource?: string | null;
  advertisingCampaign?: string | null;
};

const STORAGE_KEY = 'sigorka_advertising_info';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function parseUtmFromUrl(url?: string): AdvertisingInfo {
  try {
    const targetUrl = url || (isBrowser() ? window.location.href : '');
    if (!targetUrl) return {};
    const u = new URL(targetUrl);
    const source = u.searchParams.get('utm_source');
    const medium = u.searchParams.get('utm_medium');
    const campaign = u.searchParams.get('utm_campaign');
    
    let combinedSource = source;
    if (source && medium) {
      combinedSource = `${source} - ${medium}`;
    }
    
    return {
      advertisingSource: combinedSource || undefined,
      advertisingCampaign: campaign || undefined,
    };
  } catch {
    return {};
  }
}

export function saveAdvertisingInfo(info: AdvertisingInfo): void {
  if (!isBrowser()) return;
  try {
    const existing = getAdvertisingInfo();
    const merged: AdvertisingInfo = {
      advertisingSource: info.advertisingSource ?? existing.advertisingSource ?? null,
      advertisingCampaign: info.advertisingCampaign ?? existing.advertisingCampaign ?? null,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // yut
  }
}

export function getAdvertisingInfo(): AdvertisingInfo {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      advertisingSource: parsed?.advertisingSource ?? null,
      advertisingCampaign: parsed?.advertisingCampaign ?? null,
    };
  } catch {
    return {};
  }
}

export function captureUtmFromCurrentUrl(): AdvertisingInfo {
  const info = parseUtmFromUrl();
  if (info.advertisingSource || info.advertisingCampaign) {
    saveAdvertisingInfo(info);
  }
  return getAdvertisingInfo();
}



