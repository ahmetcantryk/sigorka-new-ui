import ImmQuoteComparisonPageComponent from '@/components/QuoteFlow/pages/ImmQuoteComparisonPage';
import { Suspense } from 'react';

// Dinamik sayfalar için (önerilen)
export const dynamic = 'force-dynamic';

export default function ImmQuoteComparisonRoutePage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <ImmQuoteComparisonPageComponent />
    </Suspense>
  );
} 