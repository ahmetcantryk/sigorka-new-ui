"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ParatikaTestSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Başarılı callback parametrelerini localStorage'a kaydet
    localStorage.setItem('paratika_merchantPaymentId', '0AoJoBTEO013');
    localStorage.setItem('paratika_sessionToken', 'gle8K1NgNwBDXOT6');
    
    // Test sonuç parametreleriyle 3D verify sayfasına yönlendir
    const params = new URLSearchParams({
      sessionToken: 'gle8K1NgNwBDXOT6',
      responseCode: '00',
      responseMsg: 'Approved',
      auth3DToken: '6IKCX6OHAWIMYXGM',
      mdStatus: '1',
      merchantPaymentId: '0AoJoBTEO013',
      source: 'test_success'
    });

    const targetUrl = `/odeme/paratika-3d-verify?${params.toString()}`;
    
    router.replace(targetUrl);
  }, [router]);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>3D Test Başarılı ✅</h1>
      <p>Başarılı ödeme simülasyonu başlatılıyor...</p>
      <p>Paratika 3D verify sayfasına yönlendiriliyorsunuz...</p>
    </div>
  );
} 