import DaskQuoteComparisonPageComponent from '@/components/QuoteFlow/pages/DaskQuoteComparisonPage';
import { Suspense } from 'react';
import '../../../../styles/form-style.css';
// Dinamik sayfalar için (önerilen)
export const dynamic = 'force-dynamic';

export default function DaskQuoteComparisonRoutePage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <DaskQuoteComparisonPageComponent />
    </Suspense>
  );
} 