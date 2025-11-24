import TssQuoteComparisonPageComponent from '@/components/QuoteFlow/pages/TssQuoteComparisonPage';
import { Suspense } from 'react';

// Dinamik sayfalar için (önerilen)
export const dynamic = 'force-dynamic';

export default function TssQuoteComparisonRoutePage() {
  return (
    <Suspense fallback={<div>Yükleniyor... (TSS Karşılaştırma)</div>}>
      <TssQuoteComparisonPageComponent />
    </Suspense>
  );
} 