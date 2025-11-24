"use client";

import React, { useRef, useEffect, useState } from 'react';

interface SimpleIframe3DProps {
  htmlContent: string;
  orderId?: string;
  onSuccess: (result: any) => void;
  onError: (error: string) => void;
  onClose: () => void;
}

export default function SimpleIframe3D({
  htmlContent,
  orderId,
  onSuccess,
  onError,
  onClose
}: SimpleIframe3DProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentStage, setCurrentStage] = useState<'loading' | 'processing' | 'waiting'>('loading');
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!htmlContent) return;

    
    // PostMessage listener ekle
    const handlePostMessage = (event: MessageEvent) => {
      
      if (event.data && event.data.type === 'PARATIKA_3D_ERROR') {
        onError(event.data.message || 'Doğrulama başarısız');
        return;
      }
      
      if (event.data && event.data.type === 'PARATIKA_3D_SUCCESS') {
        onSuccess(event.data);
        return;
      }
      
      // İframe'den gelen modal kapatma mesajı
      if (event.data && event.data.type === 'CLOSE_PAYMENT_MODAL') {
        
        if (event.data.error) {
          onError(event.data.message || 'İşlem başarısız');
        } else {
          onSuccess(event.data);
        }
        return;
      }
    };

    window.addEventListener('message', handlePostMessage);
    
    parseAndLoadContent();
    
    // localStorage sürekli kontrol başlat
    startLocalStoragePolling();
    
    // Cleanup function
    return () => {
      window.removeEventListener('message', handlePostMessage);
    };
  }, [htmlContent, orderId]);

  const parseAndLoadContent = () => {
    
    // HTML'i temizle
    const cleanHtml = htmlContent
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .trim();

    // okUrl'i bul
    const okUrlMatch = cleanHtml.match(/value="([^"]*success3d[^"]*)"/i);
    if (okUrlMatch) {
      const okUrl = okUrlMatch[1];
      
      const tokenMatch = okUrl.match(/success3d\/([^\/\?]+)/);
      if (tokenMatch) {
        const sessionToken = tokenMatch[1];
      }
    }

    // merchantPaymentId'yi bul
    const merchantPaymentIdMatch = cleanHtml.match(/name="MERCHANTPAYMENTID"[^>]*value="([^"]*)"/i);
    if (merchantPaymentIdMatch) {
      const paymentId = merchantPaymentIdMatch[1];
    }

    // iframe'e HTML'i yükle
    setTimeout(() => {
      const iframe = iframeRef.current;
      if (iframe) {
        iframe.srcdoc = cleanHtml;
      }
    }, 100);
  };

  const handleIframeLoad = () => {
    setLoading(false);
    setCurrentStage('processing');
    
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      // Form'u submit et
      if (iframe.contentDocument) {
        const form = iframe.contentDocument.getElementById('3dForm') as HTMLFormElement;
        if (form) {
          form.submit();
          
          // URL monitoring başlat
          startUrlMonitoring();
        }
      }
    } catch (error) {
    }
  };

  const startLocalStoragePolling = () => {
    if (isPolling) return;
    
    setIsPolling(true);
    
    const pollingInterval = setInterval(() => {
      try {
        // 3D doğrulama sonucunu kontrol et
        const status = localStorage.getItem('paratika_3d_status');
        const result = localStorage.getItem('paratika_3d_result');
        
        if (status === 'success' && result) {
          clearInterval(pollingInterval);
          setIsPolling(false);
          
          const resultData = JSON.parse(result);
          onSuccess({
            ...resultData,
            success: true,
            source: 'localStorage_polling'
          });
          return;
        }
        
        if (status === 'error') {
          clearInterval(pollingInterval);
          setIsPolling(false);
          const errorMsg = localStorage.getItem('paratika_3d_error') || 'Doğrulama başarısız';
          onError(errorMsg);
          return;
        }
        
        // Satın alma tamamlanma durumunu kontrol et
        const purchaseStatus = localStorage.getItem('paratika_purchase_status');
        if (purchaseStatus === 'success') {
          clearInterval(pollingInterval);
          setIsPolling(false);
          setCurrentStage('waiting');
          
          // Modal'ı otomatik kapat
          setTimeout(() => {
            onSuccess({
              success: true,
              source: 'purchase_completed',
              message: 'Satın alma işlemi başarıyla tamamlandı'
            });
          }, 1000);
          return;
        }
        
        if (purchaseStatus === 'error') {
          clearInterval(pollingInterval);
          setIsPolling(false);
          const errorMsg = localStorage.getItem('paratika_purchase_error') || 'Satın alma başarısız';
          onError(errorMsg);
          return;
        }
        
      } catch (error) {
      }
    }, 200); // 200ms'de bir kontrol et (cache sorunu için)

    // 10 dakika sonra timeout
    setTimeout(() => {
      clearInterval(pollingInterval);
      if (isPolling) {
        setIsPolling(false);
        onError('İşlem zaman aşımına uğradı');
      }
    }, 600000);
  };

  const startUrlMonitoring = () => {
    setCurrentStage('waiting');
    
    let checkCount = 0;
    const maxChecks = 300; // 10 dakika (2 saniyede bir)
    let lastSrc = '';
    let otpPhaseDetected = false;

    const urlChecker = setInterval(() => {
      checkCount++;
      
      try {
        const iframe = iframeRef.current;
        if (!iframe) return;
        
        const currentSrc = iframe.src;
        
        // SRC değişikliğini log'la
        if (currentSrc !== lastSrc) {
          lastSrc = currentSrc;
        }

        // Banka domain kontrolü - OTP phase detection
        if (currentSrc && (currentSrc.includes('halkbank.com.tr') || currentSrc.includes('garanti.com.tr'))) {
          if (!otpPhaseDetected) {
            otpPhaseDetected = true;
            setCurrentStage('waiting');
          }
        }

        // Success pattern'leri kontrol et - Paratika success3d URL'leri
        if (currentSrc && currentSrc.includes('vpos.paratika.com.tr/paratika/api/v2/success3d/')) {
          clearInterval(urlChecker);
          
          // Success3d URL'inden session token çıkar
          const tokenMatch = currentSrc.match(/success3d\/([^\/\?]+)/);
          const sessionToken = tokenMatch ? tokenMatch[1] : '';
          
          
          // localStorage'a kaydet
          localStorage.setItem('paratika_3d_status', 'success');
          localStorage.setItem('paratika_3d_result', JSON.stringify({
            url: currentSrc,
            sessionToken: sessionToken,
            success: true,
            source: 'direct_url'
          }));
          
          return;
        }

        // Fail pattern'leri kontrol et
        if (currentSrc && currentSrc.includes('vpos.paratika.com.tr/paratika/api/v2/fail3d/')) {
          clearInterval(urlChecker);
          
          localStorage.setItem('paratika_3d_status', 'error');
          localStorage.setItem('paratika_3d_error', '3D doğrulama başarısız');
          
          return;
        }

        // Sigorka verify sayfası kontrolü
        if (currentSrc && currentSrc.includes('/odeme/paratika-3d-verify')) {
          clearInterval(urlChecker);
          setCurrentStage('processing');
          return;
        }

        // Cross-origin location kontrol
        try {
          const location = iframe.contentWindow?.location.href;
          if (location && location !== 'about:blank') {
          }
        } catch (e) {
          // Cross-origin, normal davranış
        }

      } catch (error) {
      }

      // Timeout kontrolü
      if (checkCount >= maxChecks) {
        clearInterval(urlChecker);
        onError('3D doğrulama zaman aşımı');
      }
    }, 2000);
  };

  if (!isOpen) return null;

  const getStageMessage = () => {
    switch (currentStage) {
      case 'loading':
        return '🔍 3D doğrulama formu yükleniyor...';
      case 'processing':
        return '📋 Satın alma işleminiz devam etmektedir...';
      case 'waiting':
        return '⏳ Lütfen bankadan gelen doğrulama kodunu girin';
      default:
        return '🔐 3D güvenli ödeme işlemi';
    }
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-container">
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">🔐 3D Güvenli Ödeme</h2>
          </div>

          {/* Info Bar */}
          <div className="modal-info">
            <span style={{ 
              color: currentStage === 'processing' ? '#ff9800' : 
                     currentStage === 'waiting' ? '#2196f3' : '#666'
            }}>
              {getStageMessage()}
            </span>
          </div>

          {/* iframe Container */}
          <div className="iframe-container">
            {loading && (
              <div className="loading-overlay">
                <div className="loading-spinner" />
                <div className="loading-text">3D Form yükleniyor...</div>
              </div>
            )}
            
            <iframe
              ref={iframeRef}
              onLoad={handleIframeLoad}
              className="payment-iframe"
              sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups allow-popups-to-escape-sandbox"
              title="3D Secure Payment"
            />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .modal-container {
          width: 90%;
          height: 85%;
          max-width: 900px;
          max-height: 650px;
          background-color: white;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .modal-header {
          padding: 16px 24px;
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .modal-title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          text-align: center;
        }
        
        .modal-info {
          padding: 12px 24px;
          background-color: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
          font-size: 14px;
          font-weight: 500;
          text-align: center;
          min-height: 24px;
        }
        
        .iframe-container {
          flex: 1;
          position: relative;
          background-color: #fff;
        }
        
        .loading-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 1;
        }
        
        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4CAF50;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }
        
        .loading-text {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }
        
        .payment-iframe {
          width: 100%;
          height: 100%;
          border: none;
          background-color: white;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Mobile Responsive */
        @media (max-width: 768px) {
          .modal-overlay {
            padding: 10px;
          }
          
          .modal-container {
            width: 100%;
            height: 100%;
            max-width: none;
            max-height: none;
            border-radius: 0;
          }
          
          .modal-header {
            padding: 14px 16px;
          }
          
          .modal-title {
            font-size: 16px;
          }
          
          .modal-info {
            padding: 10px 16px;
            font-size: 13px;
          }
          
          .loading-spinner {
            width: 36px;
            height: 36px;
          }
          
          .loading-text {
            font-size: 13px;
          }
        }
        
        /* Small Mobile */
        @media (max-width: 480px) {
          .modal-overlay {
            padding: 5px;
          }
          
          .modal-header {
            padding: 12px 14px;
          }
          
          .modal-title {
            font-size: 15px;
          }
          
          .modal-info {
            padding: 8px 14px;
            font-size: 12px;
          }
        }
        
        /* Landscape Mobile */
        @media (max-width: 768px) and (orientation: landscape) {
          .modal-container {
            height: 100vh;
          }
          
          .modal-header {
            padding: 10px 16px;
          }
          
          .modal-info {
            padding: 8px 16px;
          }
        }
      `}</style>
    </>
  );
} 