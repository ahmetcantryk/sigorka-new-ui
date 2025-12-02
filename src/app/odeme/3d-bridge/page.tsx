"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function ThreeDSecureBridgePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'processing' | 'redirecting'>('loading');
  const [message, setMessage] = useState('3D güvenlik doğrulaması başlatılıyor...');

  useEffect(() => {
    
    // URL parametrelerinden session token'ı al
    const sessionToken = searchParams.get('sessionToken');
    const returnPath = searchParams.get('returnPath') || '/kasko-sigortasi';
    const merchantPaymentId = searchParams.get('merchantPaymentId');
    
    if (!sessionToken) {
      setMessage('Session token bulunamadı. Ana sayfaya yönlendiriliyor...');
      setTimeout(() => {
        router.push(returnPath);
      }, 2000);
      return;
    }


    // Kart bilgilerini localStorage'dan al (geçici olarak)
    const tempCardData = localStorage.getItem('temp_card_data_for_3d');
    
    if (!tempCardData) {
      setMessage('Kart bilgileri bulunamadı. Ana sayfaya yönlendiriliyor...');
      setTimeout(() => {
        router.push(returnPath);
      }, 2000);
      return;
    }

    const cardInfo = JSON.parse(tempCardData);
    
    // Güvenlik için kart verilerini hemen sil
    localStorage.removeItem('temp_card_data_for_3d');
    
    setStatus('processing');
    setMessage('Banka 3D doğrulama sayfası açılıyor...');

    // 3D doğrulama işlemini başlat
    initiate3DProcess(sessionToken, cardInfo, returnPath, merchantPaymentId);

  }, [searchParams, router]);

  const initiate3DProcess = async (
    sessionToken: string, 
    cardInfo: any, 
    returnPath: string,
    merchantPaymentId: string | null
  ) => {
    try {
      // 3D doğrulama başlat
      const response = await fetch('/api/paratika/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionToken,
          cardInfo
        })
      });

      if (!response.ok) {
        throw new Error('3D doğrulama başlatılamadı');
      }

      const result = await response.json();
      
      if (!result.success || !result.html) {
        throw new Error('3D doğrulama sayfası alınamadı');
      }

      
      // Başarı bilgisini localStorage'a kaydet (return callback için)
      localStorage.setItem('bridge_return_data', JSON.stringify({
        returnPath,
        merchantPaymentId,
        sessionToken,
        timestamp: Date.now()
      }));

      // Mevcut sayfayı 3D HTML ile değiştir
      document.open();
      document.write(result.html);
      document.close();

      // URL'i callback olarak ayarla (banka dönüşünde buraya gelecek)
      const callbackUrl = `${window.location.origin}/odeme/3d-bridge/callback`;

    } catch (error: any) {
      setStatus('redirecting');
      setMessage(`Hata: ${error.message}. Ana sayfaya yönlendiriliyor...`);
      
      // 3 saniye bekle, sonra ana sayfaya dön
      setTimeout(() => {
        const returnData = {
          success: false,
          error: error.message
        };
        
        // Ana sayfaya hata bilgisiyle dön
        localStorage.setItem('payment_result', JSON.stringify(returnData));
        router.push(returnPath);
      }, 3000);
    }
  };

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
        maxWidth: '500px',
        width: '100%',
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        textAlign: 'center',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
      }}>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🔄</div>
            <h2>3D Güvenlik Doğrulaması</h2>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              3D güvenlik doğrulaması hazırlanıyor...
              <br />
              Lütfen sayfayı kapatmayın.
            </p>
          </>
        )}
        
        {status === 'processing' && (
          <>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🏦</div>
            <h2>Banka Sayfasına Yönlendiriliyor</h2>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              Banka 3D doğrulama sayfası açılıyor...
              <br />
              Doğrulama tamamlandıktan sonra otomatik olarak geri döneceksiniz.
            </p>
            <div style={{ 
              margin: '20px 0',
              padding: '10px',
              background: '#e3f2fd',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#1976d2'
            }}>
              💡 Güvenlik doğrulaması tamamlandıktan sonra
              <br />
              otomatik olarak satın alma sayfasına döneceksiniz.
            </div>
          </>
        )}
        
        {status === 'redirecting' && (
          <>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>↩️</div>
            <h2>Ana Sayfaya Dönülüyor</h2>
            <p style={{ color: '#666' }}>{message}</p>
          </>
        )}
        
        <div style={{
          marginTop: '30px',
          padding: '15px',
          background: '#f5f5f5',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#888'
        }}>
          🔒 Bu sayfa güvenli bir köprü sayfasıdır.
          <br />
          Kart bilgileriniz saklanmaz.
        </div>
      </div>
    </div>
  );
} 