import SaglikPurchasePageComponent from '@/components/QuoteFlow/pages/SaglikPurchasePage';
import { Suspense } from 'react';

// Dinamik sayfalar için (önerilen)
export const dynamic = 'force-dynamic';

export default function SaglikPurchaseRoutePage() {
  return (
    <Suspense fallback={<div>Yükleniyor... (Doktorum Benimle Satın Alma)</div>}>
      <SaglikPurchasePageComponent />
    </Suspense>
  );
}

