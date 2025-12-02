/**
 * TSS Flow - Quote List Bileşeni
 * 
 * Teklif listesini ve filtreleme/sıralama kontrollerini render eder
 * Kasko QuoteList ile birebir aynı yapıda
 */

'use client';

import { useState, useMemo } from 'react';
import TssQuoteCard from './TssQuoteCard';
import { TssQuoteListProps, ProcessedQuote } from '../../types';

const TssQuoteList = ({
    quotes,
    proposalId,
    onInstallmentChange,
    onPurchase,
    onOpenModal,
    onViewDocument,
    onOpenComparisonModal,
    loadingDocumentQuoteId,
}: TssQuoteListProps) => {
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortOpen, setSortOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('Filtrele');
    const [selectedSort, setSelectedSort] = useState('Fiyata Göre Artan');

    // Coverage group'ları al
    const coverageGroups = useMemo(() => {
        const groups = new Set<string>();
        quotes.forEach(q => {
            if (q.coverageGroupName) {
                groups.add(q.coverageGroupName);
            }
        });
        return Array.from(groups);
    }, [quotes]);

    // Filtreleme
    const filteredQuotes = useMemo(() => {
        if (selectedFilter === 'Filtrele') return quotes;
        return quotes.filter(q => q.coverageGroupName === selectedFilter);
    }, [quotes, selectedFilter]);

    // Sıralama
    const sortedQuotes = useMemo(() => {
        const sorted = [...filteredQuotes];
        
        if (selectedSort === 'Fiyata Göre Artan') {
            sorted.sort((a, b) => {
                const aPremium = a.premiums.find(p => p.installmentNumber === a.selectedInstallmentNumber);
                const bPremium = b.premiums.find(p => p.installmentNumber === b.selectedInstallmentNumber);
                return (aPremium?.grossPremium || 0) - (bPremium?.grossPremium || 0);
            });
        } else if (selectedSort === 'Fiyata Göre Azalan') {
            sorted.sort((a, b) => {
                const aPremium = a.premiums.find(p => p.installmentNumber === a.selectedInstallmentNumber);
                const bPremium = b.premiums.find(p => p.installmentNumber === b.selectedInstallmentNumber);
                return (bPremium?.grossPremium || 0) - (aPremium?.grossPremium || 0);
            });
        }

        // ACTIVE teklifler önce, WAITING sonra
        sorted.sort((a, b) => {
            if (a.state === 'ACTIVE' && b.state !== 'ACTIVE') return -1;
            if (a.state !== 'ACTIVE' && b.state === 'ACTIVE') return 1;
            return 0;
        });

        return sorted;
    }, [filteredQuotes, selectedSort]);

    // En az 2 aktif teklif yoksa karşılaştırma butonu disabled
    const activeQuotesCount = quotes.filter(q => q.state === 'ACTIVE').length;
    const isCompareDisabled = activeQuotesCount < 2;

    return (
        <div className="pp-card">
            {/* Title */}
            <h2 className="pp-quote-title">Tamamlayıcı Sağlık Sigortası Teklifleri</h2>

            {/* Top Controls */}
            <div className="pp-quote-controls">
                <button 
                    className="pp-btn-compare" 
                    onClick={onOpenComparisonModal}
                    disabled={isCompareDisabled}
                    title={isCompareDisabled ? 'Karşılaştırma için en az 2 aktif teklif gereklidir' : ''}
                >
                    <svg className="pp-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <span className="pp-text-desktop">Teklifleri Karşılaştır</span>
                    <span className="pp-text-mobile">Karşılaştır</span>
                </button>

                <div className="pp-quote-filters">
                    {/* Filter Dropdown */}
                    {coverageGroups.length > 0 && (
                        <div className="pp-dropdown-wrapper">
                            <button
                                onClick={() => {
                                    setFilterOpen(!filterOpen);
                                    setSortOpen(false);
                                }}
                                className="pp-filter-button pp-filter"
                            >
                                <span>{selectedFilter}</span>
                                <svg className="pp-chevron" fill="none" viewBox="0 0 9 5">
                                    <path d="M8.49399 0.256643C8.41273 0.175281 8.31625 0.110738 8.21005 0.0667015C8.10385 0.0226655 7.99003 0 7.87507 0C7.76012 0 7.64629 0.0226655 7.5401 0.0667015C7.4339 0.110738 7.33742 0.175281 7.25616 0.256643L4.58099 2.93293C4.52629 2.98765 4.45212 3.01838 4.37478 3.01838C4.29744 3.01838 4.22327 2.98765 4.16857 2.93293L1.49399 0.256643C1.32992 0.0923918 1.10736 8.53478e-05 0.87528 3.06166e-05C0.643196 -2.41147e-05 0.420596 0.0921772 0.256449 0.256351C0.092302 0.420526 5.47242e-05 0.643224 2.43402e-08 0.875456C-5.46755e-05 1.10769 0.0920879 1.33043 0.256157 1.49468L2.93132 4.17155C3.12091 4.36128 3.34599 4.51179 3.59371 4.61447C3.84143 4.71715 4.10694 4.77 4.37507 4.77C4.64321 4.77 4.90871 4.71715 5.15643 4.61447C5.40415 4.51179 5.62924 4.36128 5.81882 4.17155L8.49399 1.49468C8.65803 1.33049 8.75018 1.10783 8.75018 0.875663C8.75018 0.643496 8.65803 0.420835 8.49399 0.256643Z" fill="currentColor" />
                                </svg>
                            </button>
                            {filterOpen && (
                                <div className="pp-dropdown-menu">
                                    <button onClick={() => { setSelectedFilter('Filtrele'); setFilterOpen(false); }}>Tümü</button>
                                    {coverageGroups.map(groupName => (
                                        <button key={groupName} onClick={() => { setSelectedFilter(groupName); setFilterOpen(false); }}>
                                            {groupName}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sort Dropdown */}
                    <div className="pp-dropdown-wrapper">
                        <button
                            onClick={() => {
                                setSortOpen(!sortOpen);
                                setFilterOpen(false);
                            }}
                            className="pp-filter-button pp-filter-price"
                        >
                            <span className="pp-text-desktop">{selectedSort}</span>
                            <span className="pp-text-mobile">Sırala</span>
                            <svg className="pp-chevron" fill="none" viewBox="0 0 9 5">
                                <path d="M8.49399 0.256643C8.41273 0.175281 8.31625 0.110738 8.21005 0.0667015C8.10385 0.0226655 7.99003 0 7.87507 0C7.76012 0 7.64629 0.0226655 7.5401 0.0667015C7.4339 0.110738 7.33742 0.175281 7.25616 0.256643L4.58099 2.93293C4.52629 2.98765 4.45212 3.01838 4.37478 3.01838C4.29744 3.01838 4.22327 2.98765 4.16857 2.93293L1.49399 0.256643C1.32992 0.0923918 1.10736 8.53478e-05 0.87528 3.06166e-05C0.643196 -2.41147e-05 0.420596 0.0921772 0.256449 0.256351C0.092302 0.420526 5.47242e-05 0.643224 2.43402e-08 0.875456C-5.46755e-05 1.10769 0.0920879 1.33043 0.256157 1.49468L2.93132 4.17155C3.12091 4.36128 3.34599 4.51179 3.59371 4.61447C3.84143 4.71715 4.10694 4.77 4.37507 4.77C4.64321 4.77 4.90871 4.71715 5.15643 4.61447C5.40415 4.51179 5.62924 4.36128 5.81882 4.17155L8.49399 1.49468C8.65803 1.33049 8.75018 1.10783 8.75018 0.875663C8.75018 0.643496 8.65803 0.420835 8.49399 0.256643Z" fill="currentColor" />
                            </svg>
                        </button>
                        {sortOpen && (
                            <div className="pp-dropdown-menu">
                                <button onClick={() => { setSelectedSort('Fiyata Göre Artan'); setSortOpen(false); }}>Fiyata Göre Artan</button>
                                <button onClick={() => { setSelectedSort('Fiyata Göre Azalan'); setSortOpen(false); }}>Fiyata Göre Azalan</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quote Cards */}
            <div className="pp-quotes-list">
                {sortedQuotes.map((quote) => (
                    <TssQuoteCard
                        key={quote.id}
                        quote={quote}
                        proposalId={proposalId}
                        onInstallmentChange={onInstallmentChange}
                        onPurchase={onPurchase}
                        onOpenModal={onOpenModal}
                        onViewDocument={onViewDocument}
                        isLoadingDocument={loadingDocumentQuoteId === quote.id}
                    />
                ))}
            </div>
        </div>
    );
};

export default TssQuoteList;
