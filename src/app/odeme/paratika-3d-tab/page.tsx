"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Alert, CircularProgress, Box, Container } from '@mui/material';

export default function Paratika3DTabPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [merchantPaymentId, setMerchantPaymentId] = useState<string | null>(null);

  // Paratika result HTML'ini parse et
  const parseParatikaResult = (html: string) => {
    try {
      
      // HTML'den merchantResultPage div'ini bul
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const resultDiv = doc.getElementById('merchantResultPage');
      
      let resultText = '';
      if (resultDiv) {
        resultText = resultDiv.innerHTML;
      } else {
        // Fallback: tüm HTML'i kontrol et
        resultText = html;
      }
      
      
      // <br> etiketlerini satır sonları ile değiştir
      const lines = resultText.split('<br>').map(line => line.replace(/<[^>]*>/g, '').trim()).filter(line => line.length > 0);
      
      const result: any = {};
      
      lines.forEach(line => {
        if (line.includes(':')) {
          const [key, ...valueParts] = line.split(':');
          const value = valueParts.join(':').trim();
          const cleanKey = key.trim();
          
          result[cleanKey] = value;
          
        }
      });
      
      // Başarı durumunu kontrol et
      const isSuccess = result.responseCode === '00' && (result.mdStatus === '1' || result.mdStatus === 1);
      result.isSuccess = isSuccess;
      
      
      return result;
    } catch (error) {
      return null;
    }
  };

  // Result'tan callback simüle et
  const simulateCallbackFromResult = async (merchantPaymentId: string, resultData: any) => {
    try {
      
      // Callback verisini hazırla
      const callbackData = {
        success: resultData.isSuccess || (resultData.responseCode === '00' && resultData.mdStatus === '1'),
        responseCode: resultData.responseCode || '01',
        responseMsg: resultData.responseMsg || 'Unknown',
        sessionToken: resultData.sessionToken || '',
        auth3DToken: resultData.auth3DToken || '',
        mdStatus: resultData.mdStatus || '0',
        mdErrorMsg: resultData.mdErrorMsg || '',
        allowedUrl: resultData.allowedUrl || '',
        merchantPaymentId: merchantPaymentId,
        timestamp: new Date().toISOString(),
        source: 'paratika_result_page'
      };
      
      
      // Callback API'sine POST et
      const response = await fetch('/api/paratika/callback', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Source': 'paratika-3d-tab'
        },
        body: JSON.stringify(callbackData)
      });
      
      const responseText = await response.text();
      
      if (response.ok) {
        const result = JSON.parse(responseText);
        
        // Ayrıca global storage'a da kaydet (backup)
        if (typeof window !== 'undefined') {
          const globalCallbacks = (window as any).paratikaCallbacks || new Map();
          globalCallbacks.set(merchantPaymentId, callbackData);
          (window as any).paratikaCallbacks = globalCallbacks;
          
          // localStorage'a da kaydet
          localStorage.setItem(`paratika_callback_${merchantPaymentId}`, JSON.stringify(callbackData));
          localStorage.setItem('paratika_last_callback', JSON.stringify(callbackData));
          
        }
        
        return true;
      } else {
        return false;
      }
      
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        // 🎯 İlk olarak mevcut sayfada result var mı kontrol et
        const currentPageContent = document.body.innerHTML;
        const merchantId = localStorage.getItem('paratika_merchantPaymentId') || `MERCHANT_${Date.now()}`;
        
        setMerchantPaymentId(merchantId);
        
        
        // Eğer sayfa zaten result page ise direkt parse et
        if (currentPageContent.includes('merchantResultPage') || 
            currentPageContent.includes('sessionToken:') || 
            currentPageContent.includes('responseCode:')) {
          
          
          const resultData = parseParatikaResult(currentPageContent);
          
          if (resultData) {
            
            // Callback simüle et
            const callbackSuccess = await simulateCallbackFromResult(merchantId, resultData);
            
            if (callbackSuccess) {
              // Success/fail durumuna göre yönlendir
              if (resultData.isSuccess) {
                setTimeout(() => {
                  window.location.href = '/odeme/paratika-3d-verify';
                }, 2000);
              } else {
                setTimeout(() => {
                  window.location.href = `/odeme/hata?error=${encodeURIComponent(resultData.responseMsg || 'Doğrulama başarısız')}`;
                }, 2000);
              }
              return;
            }
          }
        }
        
        // localStorage'dan 3D verilerini al
        const htmlContent = localStorage.getItem('paratika3dHtmlContent');
        const directUrl = localStorage.getItem('paratika_3d_url');
        const formParamsStr = localStorage.getItem('paratika_3d_params');


        if (!merchantId) {
          throw new Error('Merchant Payment ID bulunamadı');
        }

        // Stratejiler sırasıyla dene
        let success = false;

        // 1. Direct URL varsa onu kullan
        if (directUrl) {
          try {
            window.location.href = directUrl;
            return;
          } catch (error) {
          }
        } else {
        }

        // 2. Form parametreleri varsa kullan
        if (formParamsStr) {
          try {
            const formParams = JSON.parse(formParamsStr);
            
            // Form oluştur ve gönder
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = formParams.action || 'https://vpos.paratika.com.tr/paratika/api/v2/direct-charge';
            
            
            Object.keys(formParams).forEach(key => {
              if (key !== 'action') {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = formParams[key];
                form.appendChild(input);
              }
            });
            
            document.body.appendChild(form);
            form.submit();
            success = true;
          } catch (error) {
          }
        } else {
        }

        // 3. HTML content varsa render et
        if (!success && htmlContent) {
          try {
            
            // Önce Paratika result sayfası mı kontrol et
            if (htmlContent.includes('merchantResultPage') || htmlContent.includes('sessionToken:')) {
              const resultData = parseParatikaResult(htmlContent);
              
              if (resultData) {
                
                // Callback simüle et
                await simulateCallbackFromResult(merchantId, resultData);
                
                // Success sayfasına yönlendir
                if (resultData.responseCode === '00' && resultData.mdStatus === '1') {
                  setTimeout(() => {
                    window.location.href = '/odeme/paratika-success';
                  }, 1000);
                  success = true;
                } else {
                  window.location.href = `/odeme/hata?error=${encodeURIComponent(resultData.responseMsg || 'Doğrulama başarısız')}`;
                  success = true;
                }
              }
            } else {
              // Normal form işlemi
              const parser = new DOMParser();
              const doc = parser.parseFromString(htmlContent, 'text/html');
              const form = doc.querySelector('form');
              
              if (form && form.action) {
                document.body.innerHTML = htmlContent;
                const renderForm = document.querySelector('form') as HTMLFormElement;
                if (renderForm) {
                  renderForm.submit();
                  success = true;
                }
              } else {
                // Form yoksa da HTML'i direkt render et ve hata vermesin
                document.body.innerHTML = htmlContent;
                success = true;
              }
            }
          } catch (error) {
            setError('3D doğrulama sayfası yüklenemedi: ' + (error instanceof Error ? error.message : String(error)));
          }
        } else if (!success) {
        }

        if (!success) {
          throw new Error('Hiçbir 3D stratejisi başarılı olmadı');
        } else {
        }

        // Callback polling başlat
        startCallbackPolling(merchantId);
        
        // Eğer 3D işlemi başarılı olmuş ama callback gelmemişse manuel kontrol
        setTimeout(() => {
          checkManualCallback(merchantId);
        }, 10000); // 10 saniye sonra manuel kontrol

      } catch (error) {
        setError(error instanceof Error ? error.message : 'Bilinmeyen hata');
      } finally {
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const checkManualCallback = async (merchantId: string) => {
    try {
      // 🎯 URL'i sürekli kontrol et (success3d/fail3d)
      const checkUrl = () => {
        try {
          let currentUrl = '';
          try {
            currentUrl = window.location.href;
          } catch (urlError) {
            return false;
          }
          
          
          // Paratika success URL'lerini kontrol et
          if (currentUrl.includes('success3d') || currentUrl.includes('/paratika/api/v2/success3d/')) {
            
            // Callback sayfasına güvenli şekilde yönlendir
            try {
              setTimeout(() => {
                window.location.href = '/odeme/paratika-3d-verify';
              }, 1000);
            } catch (redirectError) {
              // Fallback: parent window'a mesaj gönder
              try {
                window.parent.postMessage({ type: 'PARATIKA_SUCCESS' }, '*');
              } catch (messageError) {
              }
            }
            return true;
          }
          
          // Paratika fail URL'lerini kontrol et
          if (currentUrl.includes('fail3d') || currentUrl.includes('/paratika/api/v2/fail3d/') || currentUrl.includes('error')) {
            
            // Hata sayfasına güvenli şekilde yönlendir
            try {
              setTimeout(() => {
                window.location.href = '/odeme/hata?error=' + encodeURIComponent('3D doğrulama başarısız');
              }, 1000);
            } catch (redirectError) {
              // Fallback: parent window'a mesaj gönder
              try {
                window.parent.postMessage({ type: 'PARATIKA_ERROR', error: '3D doğrulama başarısız' }, '*');
              } catch (messageError) {
              }
            }
            return false;
          }
          
          return false;
        } catch (urlError) {
          return false;
        }
      };
      
      // İlk URL kontrolü
      if (checkUrl()) {
        return;
      }

      // Periyodik URL kontrolü başlat
      const urlCheckInterval = setInterval(() => {
        if (checkUrl()) {
          clearInterval(urlCheckInterval);
        }
      }, 2000);

      // 5 dakika sonra timeout
      setTimeout(() => {
        clearInterval(urlCheckInterval);
      }, 300000);
      
      
      // Callback API'sine manuel istek gönder
      const response = await fetch(`/api/paratika/check-callback?merchantPaymentId=${merchantId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        if (result.data.success) {
          window.location.href = '/odeme/paratika-success';
        } else {
          window.location.href = `/odeme/hata?error=${encodeURIComponent(result.data.responseMsg || 'Ödeme başarısız')}`;
        }
      } else {
        // Callback henüz gelmemişse, transaction query ile kontrol et
        const queryResponse = await fetch('/api/paratika/query-transaction', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ merchantPaymentId: merchantId })
        });
        
        if (queryResponse.ok) {
          const queryResult = await queryResponse.json();
          
          if (queryResult.success && queryResult.data?.transactionList?.length > 0) {
            const transaction = queryResult.data.transactionList[0];
            if (transaction.transactionStatus === 'FA') {
              window.location.href = '/odeme/paratika-success';
            } else {
              setError(`İşlem durumu: ${transaction.transactionStatus}`);
            }
          }
        }
      }
      
    } catch (error) {
      setError('Ödeme durumu kontrol edilemedi');
    }
  };

  const startCallbackPolling = (merchantId: string) => {
    let checkCount = 0;
    const maxChecks = 60; // 3 dakika boyunca kontrol et
    
    const checkCallback = async () => {
      try {
        const response = await fetch(`/api/paratika/check-callback?merchantPaymentId=${merchantId}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          
          if (result.data.success) {
            // Başarılı - success sayfasına yönlendir
            window.location.href = '/odeme/paratika-success';
          } else {
            // Başarısız - hata sayfasına yönlendir
            window.location.href = `/odeme/hata?error=${encodeURIComponent(result.data.responseMsg || 'Ödeme başarısız')}`;
          }
          return true;
        }
        return false;
      } catch (error) {
        return false;
      }
    };

    const checkInterval = setInterval(async () => {
      checkCount++;
      
      const completed = await checkCallback();
      
      if (completed || checkCount >= maxChecks) {
        clearInterval(checkInterval);
        
        if (checkCount >= maxChecks) {
          window.location.href = '/odeme/hata?error=' + encodeURIComponent('Ödeme kontrolü zaman aşımına uğradı');
        }
      }
    }, 3000);

    // Sayfa kapatılırken interval'ı temizle
    window.addEventListener('beforeunload', () => {
      clearInterval(checkInterval);
    });
  };

  if (error) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
        <Card>
          <CardContent>
            <Alert severity="error">
              <Typography variant="h6" gutterBottom>
                3D Doğrulama Hatası
              </Typography>
              <Typography variant="body2">
                {error}
              </Typography>
            </Alert>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          3D Güvenli Ödeme İşleniyor...
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Lütfen bu sayfayı kapatmayın
        </Typography>
        
        {/* Debug bilgileri */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1, textAlign: 'left' }}>
          <Typography variant="subtitle2" gutterBottom>
            🔍 Debug Bilgileri:
          </Typography>
          <Typography variant="body2" component="pre" sx={{ fontSize: '0.8rem' }}>
            {`Merchant Payment ID: ${merchantPaymentId || 'Yok'}
URL: ${typeof window !== 'undefined' ? window.location.href : 'N/A'}
Has merchantResultPage: ${typeof window !== 'undefined' && document.body.innerHTML.includes('merchantResultPage') ? 'Evet' : 'Hayır'}
Has sessionToken: ${typeof window !== 'undefined' && document.body.innerHTML.includes('sessionToken:') ? 'Evet' : 'Hayır'}
Has responseCode: ${typeof window !== 'undefined' && document.body.innerHTML.includes('responseCode:') ? 'Evet' : 'Hayır'}

📦 localStorage Verileri:
- paratika3dHtmlContent: ${typeof window !== 'undefined' && localStorage.getItem('paratika3dHtmlContent') ? 'Var (' + (localStorage.getItem('paratika3dHtmlContent')?.length || 0) + ' karakter)' : 'Yok'}
- paratika_3d_url: ${typeof window !== 'undefined' ? localStorage.getItem('paratika_3d_url') || 'Yok' : 'N/A'}
- paratika_3d_params: ${typeof window !== 'undefined' && localStorage.getItem('paratika_3d_params') ? 'Var' : 'Yok'}
- paratika_merchantPaymentId: ${typeof window !== 'undefined' ? localStorage.getItem('paratika_merchantPaymentId') || 'Yok' : 'N/A'}

HTML Preview (ilk 500 karakter):\n${typeof window !== 'undefined' && localStorage.getItem('paratika3dHtmlContent') ? localStorage.getItem('paratika3dHtmlContent')?.substring(0, 500) : 'Yok'}`}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2 }}>
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            3D Güvenli Ödeme
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isLoading 
              ? '3D doğrulama sayfası yükleniyor...'
              : `Ödeme işlemi devam ediyor... (${merchantPaymentId})`
            }
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Lütfen bu sekmeyi kapatmayın.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
} 