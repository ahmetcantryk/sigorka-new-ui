import TrafikQuoteComparisonPage from '@/components/QuoteFlow/pages/TrafikQuoteComparisonPage';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default function TrafikQuoteComparisonRoutePage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <TrafikQuoteComparisonPage />
    </Suspense>
  );
} 