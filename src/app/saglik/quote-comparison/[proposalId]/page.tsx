import SaglikQuoteComparisonPageComponent from '@/components/QuoteFlow/pages/SaglikQuoteComparisonPage';
import { Suspense } from 'react';

// Dinamik sayfalar için (önerilen)
export const dynamic = 'force-dynamic';

export default function SaglikQuoteComparisonRoutePage() {
  return (
    <Suspense fallback={<div>Yükleniyor... (Doktorum Benimle Karşılaştırma)</div>}>
      <SaglikQuoteComparisonPageComponent />
    </Suspense>
  );
}

