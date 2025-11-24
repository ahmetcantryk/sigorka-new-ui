import TssPurchasePageComponent from '@/components/QuoteFlow/pages/TssPurchasePage';
import { Suspense } from 'react';

// Dinamik sayfalar için (önerilen)
export const dynamic = 'force-dynamic';

export default function TssPurchaseRoutePage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <TssPurchasePageComponent />
    </Suspense>
  );
} 