/**
 * PDF Utility Functions
 * 
 * iOS ve diğer cihazlarda PDF açma işlemlerini yönetir
 */

/**
 * iOS cihaz tespiti
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

/**
 * Base64 string'i ArrayBuffer'a dönüştürür
 */
export const base64ToArrayBuffer = (base64String: string): Uint8Array => {
  const binaryString = atob(base64String);
  const byteArray = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    byteArray[i] = binaryString.charCodeAt(i);
  }
  
  return byteArray;
};

/**
 * iOS için placeholder window oluşturur
 * Popup blocker'ı aşmak için kullanıcı etkileşimi sırasında çağrılmalı
 */
export const createPlaceholderWindow = (): Window | null => {
  if (!isIOS()) return null;
  
  // iOS'ta popup blocker'ı aşmak için hemen bir pencere aç
  const placeholderWindow = window.open('about:blank', '_blank');
  
  if (placeholderWindow) {
    // Yükleniyor mesajı göster
    placeholderWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PDF Yükleniyor...</title>
          <style>
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: #f5f5f5;
            }
            .loader {
              text-align: center;
            }
            .spinner {
              width: 40px;
              height: 40px;
              border: 3px solid #e0e0e0;
              border-top-color: #6366f1;
              border-radius: 50%;
              animation: spin 1s linear infinite;
              margin: 0 auto 16px;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            .text {
              color: #666;
              font-size: 16px;
            }
          </style>
        </head>
        <body>
          <div class="loader">
            <div class="spinner"></div>
            <div class="text">PDF yükleniyor...</div>
          </div>
        </body>
      </html>
    `);
    placeholderWindow.document.close();
  }
  
  return placeholderWindow;
};

/**
 * PDF'i blob olarak açar (iOS ve diğer cihazlar için)
 * 
 * @param arrayBuffer - PDF dosyasının ArrayBuffer'ı
 * @param placeholderWindow - iOS için önceden açılmış placeholder window (opsiyonel)
 */
export const openPdfBlob = (
  arrayBuffer: ArrayBuffer, 
  placeholderWindow?: Window | null
): void => {
  const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
  const blobUrl = URL.createObjectURL(blob);
  
  if (isIOS() && placeholderWindow && !placeholderWindow.closed) {
    // iOS: Placeholder window'u PDF'e yönlendir
    placeholderWindow.location.href = blobUrl;
  } else {
    // Diğer cihazlar: Yeni sekmede aç
    window.open(blobUrl, '_blank');
  }
  
  // Bellek temizliği için URL'i 60 saniye sonra revoke et
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
  }, 60000);
};

/**
 * Base64 PDF'i açar (iOS ve diğer cihazlar için)
 * 
 * @param base64String - Base64 encoded PDF string
 * @param placeholderWindow - iOS için önceden açılmış placeholder window (opsiyonel)
 */
export const openPdfFromBase64 = (
  base64String: string,
  placeholderWindow?: Window | null
): void => {
  const arrayBuffer = base64ToArrayBuffer(base64String);
  openPdfBlob(arrayBuffer, placeholderWindow);
};

/**
 * URL'den PDF indirir ve açar (iOS ve diğer cihazlar için)
 * 
 * @param url - PDF dosyasının URL'i
 * @param placeholderWindow - iOS için önceden açılmış placeholder window (opsiyonel)
 */
export const fetchAndOpenPdf = async (
  url: string,
  placeholderWindow?: Window | null
): Promise<void> => {
  try {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    openPdfBlob(arrayBuffer, placeholderWindow);
  } catch (error) {
    console.error('PDF fetch error:', error);
    // Hata durumunda placeholder window'u kapat
    if (placeholderWindow && !placeholderWindow.closed) {
      placeholderWindow.close();
    }
    throw error;
  }
};
