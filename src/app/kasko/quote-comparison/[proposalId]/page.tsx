import KaskoQuoteComparisonPageComponent from '@/components/QuoteFlow/pages/KaskoQuoteComparisonPage';
import { Suspense } from 'react';

// Dinamik sayfalar için (önerilen)
export const dynamic = 'force-dynamic';

export default function KaskoQuoteComparisonRoutePage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <KaskoQuoteComparisonPageComponent />
    </Suspense>
  );
} 