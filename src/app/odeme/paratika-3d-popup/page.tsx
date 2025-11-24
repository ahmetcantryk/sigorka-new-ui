"use client";

import React, { useEffect, useState } from 'react';

export default function Paratika3DPopupPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [status, setStatus] = useState<'waiting' | 'processing' | 'success' | 'error'>('waiting');
  const [message, setMessage] = useState('3D doğrulama işlemi devam ediyor...');

  useEffect(() => {
    
    // URL parametrelerini kontrol et
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    

    // Sayfa içeriğini kontrol et
    checkPageContent();
    
    // Form submit işlemlerini yakala
    interceptFormSubmits();
    
    // URL değişikliklerini dinle
    listenForUrlChanges();
    
    // Periyodik kontrol başlat
    const checkInterval = setInterval(() => {
      checkForResult();
    }, 1000);

    // Cleanup
    return () => {
      clearInterval(checkInterval);
    };
  }, []);

  // Sayfa içeriğini kontrol et
  const checkPageContent = () => {
    const currentContent = document.body.innerHTML;
    
    
    // Başarı/hata mesajlarını ara
    if (currentContent.includes('İşlem Başarılı') || 
        currentContent.includes('İşlem Tamamlandı') ||
        currentContent.includes('Başarılı') ||
        currentContent.includes('Success')) {
      
      handleSuccess();
      return;
    }
    
    if (currentContent.includes('İşlem Başarısız') || 
        currentContent.includes('Hata') ||
        currentContent.includes('Error') ||
        currentContent.includes('Failed')) {
      
      handleError('İşlem başarısız oldu');
      return;
    }

    // Form varsa, kullanıcının doldurmasını bekle
    const forms = document.querySelectorAll('form');
    if (forms.length > 0) {
      setStatus('waiting');
      setMessage('Lütfen formu doldurun ve doğrulama işlemini tamamlayın');
      setIsLoading(false);
    }
  };

  // Form submit işlemlerini yakala
  const interceptFormSubmits = () => {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        setStatus('processing');
        setMessage('Doğrulama işleniyor, lütfen bekleyin...');
        setIsLoading(true);
      });
    });
  };

  // URL değişikliklerini dinle
  const listenForUrlChanges = () => {
    let currentUrl = window.location.href;
    
    const checkUrlChange = () => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        
        // Yeni URL'i kontrol et
        setTimeout(() => {
          checkPageContent();
        }, 1000);
      }
    };
    
    setInterval(checkUrlChange, 500);
  };

  // Sonuç kontrolü
  const checkForResult = () => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Paratika callback parametrelerini kontrol et
    const responseCode = urlParams.get('responseCode') || urlParams.get('ResponseCode');
    const mdStatus = urlParams.get('mdStatus') || urlParams.get('MdStatus');
    const responseMsg = urlParams.get('responseMsg') || urlParams.get('ResponseMsg');
    
    if (responseCode) {
      
      if (responseCode === '00' && (mdStatus === '1' || mdStatus === '1')) {
        handleSuccess({
          responseCode,
          mdStatus,
          responseMsg,
          ...Object.fromEntries(urlParams.entries())
        });
      } else {
        handleError(responseMsg || 'Doğrulama başarısız');
      }
    }
  };

  // Başarı durumu
  const handleSuccess = (result?: any) => {
    setStatus('success');
    setMessage('3D doğrulama başarıyla tamamlandı! Ana sayfaya yönlendiriliyor...');
    setIsLoading(false);
    
    
    // Parent window'a başarı mesajı gönder
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage({
        type: 'PARATIKA_3D_RESULT',
        success: true,
        result: result || { status: 'success' }
      }, window.location.origin);
    }
    
    // Popup'ı kapat
    setTimeout(() => {
      window.close();
    }, 2000);
  };

  // Hata durumu
  const handleError = (errorMessage: string) => {
    setStatus('error');
    setMessage(`Doğrulama başarısız: ${errorMessage}`);
    setIsLoading(false);
    
    
    // Parent window'a hata mesajı gönder
    if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
        type: 'PARATIKA_3D_RESULT',
        success: false,
        error: errorMessage
                }, window.location.origin);
    }
    
    // Popup'ı kapat
    setTimeout(() => {
                window.close();
    }, 3000);
  };

  // Kullanıcı popup'ı kapatmaya çalışırsa
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (window.opener && !window.opener.closed) {
                window.opener.postMessage({
          type: 'PARATIKA_3D_CLOSED'
                }, window.location.origin);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
        <div style={{ 
      minHeight: '100vh', 
          display: 'flex', 
      alignItems: 'center', 
          justifyContent: 'center', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '400px', 
        width: '100%', 
        background: 'white', 
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        {status === 'waiting' && (
          <>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔐</div>
            <h2>3D Güvenlik Doğrulaması</h2>
            <p style={{ color: '#666' }}>{message}</p>
          </>
        )}
        
        {status === 'processing' && (
          <>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>⏳</div>
            <h2>İşleniyor...</h2>
            <p style={{ color: '#666' }}>{message}</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div style={{ fontSize: '60px', marginBottom: '20px', color: '#4caf50' }}>✅</div>
            <h2 style={{ color: '#4caf50' }}>İşlem Başarılı!</h2>
            <p style={{ color: '#666' }}>{message}</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div style={{ fontSize: '60px', marginBottom: '20px', color: '#f44336' }}>❌</div>
            <h2 style={{ color: '#f44336' }}>İşlem Başarısız</h2>
            <div style={{ 
              background: '#ffebee', 
              border: '1px solid #f44336', 
              borderRadius: '8px',
              padding: '15px',
              marginTop: '20px',
              color: '#d32f2f'
            }}>
              {message}
        </div>
          </>
      )}
      </div>
    </div>
  );
} 