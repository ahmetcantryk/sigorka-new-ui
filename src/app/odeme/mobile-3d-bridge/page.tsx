"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Mobile3DBridgePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Mobil 3D doğrulama hazırlanıyor...');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Mobil cihaz kontrolü
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
      setIsMobile(mobile);
      
    };

    checkMobile();
  }, []);

  useEffect(() => {
    const initMobilePayment = async () => {
      const sessionToken = searchParams.get('sessionToken');
      const returnPath = searchParams.get('returnPath') || '/kasko-teklif';
      
      if (!sessionToken) {
        setStatus('error');
        setMessage('Session token bulunamadı');
        setTimeout(() => router.push(returnPath), 3000);
        return;
      }

      const tempData = localStorage.getItem('temp_3d_payment_data');
      if (!tempData) {
        setStatus('error');
        setMessage('Ödeme verisi bulunamadı');
        setTimeout(() => router.push(returnPath), 3000);
        return;
      }

      const paymentData = JSON.parse(tempData);
      localStorage.removeItem('temp_3d_payment_data');
      
      setStatus('processing');
      setMessage('Banka sayfası açılıyor...');

      try {
        const response = await fetch('/api/paratika/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionToken: paymentData.sessionToken,
            cardInfo: paymentData.cardInfo
          })
        });

        const result = await response.json();
        
        if (result.success && result.html) {
          localStorage.setItem('mobile_bridge_return', JSON.stringify({
            returnPath,
            sessionToken,
            timestamp: Date.now()
          }));

          setTimeout(() => {
            document.open();
            document.write(result.html);
            document.close();
          }, 2000);
        } else {
          throw new Error('3D doğrulama başlatılamadı');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Hata oluştu');
        setTimeout(() => router.push(returnPath), 3000);
      }
    };

    initMobilePayment();
  }, [searchParams, router]);

  // Sayfa değişikliklerini dinle (3D callback'i yakalamak için)
  useEffect(() => {
    const checkForCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const responseCode = urlParams.get('responseCode') || urlParams.get('ResponseCode');
      const mdStatus = urlParams.get('mdStatus') || urlParams.get('MdStatus');
      const responseMsg = urlParams.get('responseMsg') || urlParams.get('ResponseMsg');

      if (responseCode) {
        
        const returnData = localStorage.getItem('mobile_bridge_return');
        if (!returnData) {
          return;
        }

        const { returnPath } = JSON.parse(returnData);
        
        if (responseCode === '00' && mdStatus === '1') {
          // Başarılı
          setStatus('success');
          setMessage('3D doğrulama başarılı! Ana sayfaya dönülüyor...');
          
          localStorage.setItem('payment_result', JSON.stringify({
            success: true,
            result: Object.fromEntries(urlParams.entries())
          }));
          
          setTimeout(() => {
            localStorage.removeItem('mobile_bridge_return');
            router.push(returnPath);
          }, 2000);
        } else {
          // Başarısız
          setStatus('error');
          setMessage(`3D doğrulama başarısız: ${responseMsg || 'Bilinmeyen hata'}`);
          localStorage.removeItem('mobile_bridge_return');
          localStorage.removeItem('paratika_3d_result');
          localStorage.removeItem('paratika_3d_error');
          localStorage.removeItem('paratika_3d_status');
          localStorage.removeItem('paratika3dHtmlContent');
          localStorage.removeItem('paratika_merchantPaymentId');
          localStorage.removeItem('paratikaSessionToken');
          localStorage.removeItem('paratika_3d_url');
          localStorage.removeItem('paratika_3d_params');
          
          localStorage.setItem('payment_result', JSON.stringify({
            success: false,
            error: responseMsg || 'Doğrulama başarısız'
          }));
          
          setTimeout(() => {
            localStorage.removeItem('mobile_bridge_return');
            router.push(returnPath);
          }, 3000);
        }
      }
    };

    // Periyodik kontrol
    const checkInterval = setInterval(checkForCallback, 1000);
    
    return () => clearInterval(checkInterval);
  }, [router]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading': return '🔄';
      case 'processing': return '🏦';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '📱';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isMobile 
        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: isMobile ? '350px' : '500px',
        width: '100%',
        background: 'white',
        borderRadius: '16px',
        padding: isMobile ? '30px 20px' : '40px',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.2)'
      }}>
        {/* Cihaz Bilgisi */}
        <div style={{
          display: 'inline-block',
          padding: '6px 12px',
          background: isMobile ? '#e3f2fd' : '#fff3e0',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: isMobile ? '#1976d2' : '#f57c00',
          marginBottom: '20px'
        }}>
          {isMobile ? '📱 MOBİL CİHAZ' : '💻 MASAÜSTÜ CİHAZ'}
        </div>

        {/* Status Icon */}
        <div style={{
          fontSize: '80px',
          marginBottom: '20px',
          lineHeight: '1'
        }}>
          {getStatusIcon()}
        </div>

        {/* Title */}
        <h2 style={{
          margin: '0 0 15px 0',
          color: getStatusColor(),
          fontSize: isMobile ? '20px' : '24px'
        }}>
          {status === 'loading' && 'Hazırlanıyor'}
          {status === 'processing' && 'Banka Doğrulaması'}
          {status === 'success' && 'İşlem Başarılı'}
          {status === 'error' && 'İşlem Başarısız'}
        </h2>

        {/* Message */}
        <p style={{
          color: '#666',
          lineHeight: '1.6',
          fontSize: isMobile ? '14px' : '16px',
          margin: '0 0 25px 0'
        }}>
          {message}
        </p>

        {/* Mobile-specific info */}
        {isMobile && status === 'waiting_user' && (
          <div style={{
            background: '#e8f5e8',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            fontSize: '14px',
            color: '#2e7d32'
          }}>
            📱 <strong>Mobil Kullanıcı Bilgisi:</strong>
            <br />
            Doğrulama tamamlandıktan sonra otomatik olarak
            satın alma sayfasına döneceksiniz.
          </div>
        )}

        {/* Progress indicators */}
        {(status === 'loading' || status === 'processing') && (
          <div style={{
            width: '100%',
            height: '4px',
            background: '#e0e0e0',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              animation: 'progress 2s ease-in-out infinite'
            }} />
          </div>
        )}

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            marginTop: '25px',
            padding: '12px',
            background: '#f8f9fa',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#6c757d',
            textAlign: 'left'
          }}>
            <strong>Debug Info:</strong>
            <br />
            Status: {status}
            <br />
            Mobile: {isMobile ? 'Yes' : 'No'}
            <br />
            Screen: {window.innerWidth}x{window.innerHeight}
            <br />
            UA: {navigator.userAgent.substring(0, 50)}...
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
} 