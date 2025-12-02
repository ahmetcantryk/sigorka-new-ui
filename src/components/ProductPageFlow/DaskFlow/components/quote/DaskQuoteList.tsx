/**
 * DASK Flow - Quote List Bileşeni
 * 
 * Teklif listesini render eder (DASK fiyatları sabit olduğu için sıralama yok)
 */

'use client';

import React from 'react';
import { ProcessedQuote } from '../../hooks/useDaskQuotes';
import DaskQuoteCard from './DaskQuoteCard';

interface DaskQuoteListProps {
    quotes: ProcessedQuote[];
    proposalId: string;
    onInstallmentChange: (quoteId: string, installmentNumber: number) => void;
    onPurchase: (quoteId: string) => void;
    onViewDocument: (productId: string) => void;
    loadingDocumentQuoteId?: string | null;
}

export const DaskQuoteList: React.FC<DaskQuoteListProps> = ({
    quotes,
    proposalId,
    onInstallmentChange,
    onPurchase,
    onViewDocument,
    loadingDocumentQuoteId,
}) => {
    return (
        <div className="pp-card">
            {/* Title */}
            <h2 className="pp-quote-title">DASK Sigortası Teklifleri</h2>

            {/* Quote Cards */}
            <div className="pp-quotes-list">
                {quotes.map((quote) => (
                    <DaskQuoteCard
                        key={quote.id}
                        quote={quote}
                        proposalId={proposalId}
                        onInstallmentChange={onInstallmentChange}
                        onPurchase={onPurchase}
                        onViewDocument={onViewDocument}
                        isLoadingDocument={loadingDocumentQuoteId === quote.id}
                    />
                ))}
            </div>
        </div>
    );
};

export default DaskQuoteList;
