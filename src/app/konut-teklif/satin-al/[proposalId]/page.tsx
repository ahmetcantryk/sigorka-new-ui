"use client";
import PurchaseStep from '@/components/QuoteFlow/KonutQuote/steps/PurchaseStep';

interface PurchasePageProps {
  params: {
    proposalId: string;
  };
}

export default function PurchasePage({ params }: PurchasePageProps) {
  return (
    <PurchaseStep
      onNext={() => {}}
      onBack={() => {}}
      isFirstStep={false}
      isLastStep={true}
      proposalId={params.proposalId}
    />
  );
} 