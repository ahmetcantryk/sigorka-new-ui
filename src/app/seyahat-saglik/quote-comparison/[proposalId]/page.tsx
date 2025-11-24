import SeyahatSaglikQuoteComparisonPageComponent from '@/components/QuoteFlow/pages/SeyahatSaglikQuoteComparisonPage';
import { Suspense } from 'react';

// Dinamik sayfalar için (önerilen)
export const dynamic = 'force-dynamic';

export default function SeyahatSaglikQuoteComparisonRoutePage() {
  return (
    <Suspense fallback={<div>Yükleniyor... (Seyahat Sağlık Karşılaştırma)</div>}>
      <SeyahatSaglikQuoteComparisonPageComponent />
    </Suspense>
  );
}

