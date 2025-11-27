import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Dropdown } from 'primereact/dropdown';
import CoverageTooltip from './CoverageTooltip';

// Define interfaces locally or import if they are shared. 
interface ComparisonQuote {
    id: string;
    company?: string;
    logo?: string;
    coverageGroupName?: string;
    premiums: any[];
    insuranceCompanyGuarantees?: any[];
    selectedInstallmentNumber: number;
    [key: string]: any;
}

interface QuoteComparisonModalProps {
    isOpen: boolean;
    onClose: () => void;
    allQuotes: ComparisonQuote[];
    onPurchase: (quoteId: string) => void;
    agencyPhoneNumber?: string;
}

const QuoteComparisonModal: React.FC<QuoteComparisonModalProps> = ({
    isOpen,
    onClose,
    allQuotes,
    onPurchase,
    agencyPhoneNumber = '0850 404 04 04'
}) => {
    const [selectedQuotes, setSelectedQuotes] = useState<(ComparisonQuote | null)[]>([]);
    const [slotInstallments, setSlotInstallments] = useState<number[]>([]);

    // State for custom installment dropdown visibility
    const [openInstallmentDropdownIndex, setOpenInstallmentDropdownIndex] = useState<number | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number, left: number, width: number } | null>(null);
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Refs for Quote Selection Dropdowns to control their visibility
    const quoteDropdownRefs = useRef<(Dropdown | null)[]>([]);

    // Initialize selected quotes when modal opens or quotes change
    useEffect(() => {
        if (isOpen && allQuotes.length > 0) {
            // Sort by price (ascending)
            const sortedQuotes = [...allQuotes].sort((a, b) => {
                const priceA = a.premiums.find(p => p.installmentNumber === 1)?.grossPremium || 0;
                const priceB = b.premiums.find(p => p.installmentNumber === 1)?.grossPremium || 0;
                return priceA - priceB;
            });

            // Determine number of slots: min 2, max 4
            const numberOfSlots = Math.min(Math.max(sortedQuotes.length, 2), 4);

            const initialSelection = sortedQuotes.slice(0, numberOfSlots);

            // Fill with null if we have fewer quotes than 2
            while (initialSelection.length < numberOfSlots) {
                initialSelection.push(null as any);
            }

            setSelectedQuotes(initialSelection);
            setSlotInstallments(initialSelection.map(q => q ? q.selectedInstallmentNumber : 1));
        }
    }, [isOpen, allQuotes]);

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (openInstallmentDropdownIndex !== null) {
                const target = event.target as HTMLElement;
                // Check if click is inside the dropdown menu (which is in a portal)
                const isInsideMenu = target.closest('.pp-comp-installment-menu-portal');
                // Check if click is on the button
                const isButton = target.closest('.pp-comp-installment-button');

                if (!isInsideMenu && !isButton) {
                    setOpenInstallmentDropdownIndex(null);
                }
            }
        };

        // Handle scroll to update position or close
        const handleScroll = () => {
            if (openInstallmentDropdownIndex !== null) {
                // Option 1: Close on scroll
                setOpenInstallmentDropdownIndex(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('scroll', handleScroll, true); // Capture scroll events
        window.addEventListener('resize', handleScroll);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('scroll', handleScroll, true);
            window.removeEventListener('resize', handleScroll);
        };
    }, [openInstallmentDropdownIndex]);

    if (!isOpen) return null;

    const handleQuoteChange = (index: number, quoteId: string) => {
        const newQuote = allQuotes.find(q => q.id === quoteId) || null;
        const newSelectedQuotes = [...selectedQuotes];
        newSelectedQuotes[index] = newQuote;
        setSelectedQuotes(newSelectedQuotes);

        // Reset installment for this slot
        const newInstallments = [...slotInstallments];
        newInstallments[index] = newQuote ? newQuote.selectedInstallmentNumber : 1;
        setSlotInstallments(newInstallments);
    };

    const handleInstallmentChange = (index: number, installment: number) => {
        const newInstallments = [...slotInstallments];
        newInstallments[index] = installment;
        setSlotInstallments(newInstallments);
        setOpenInstallmentDropdownIndex(null); // Close dropdown after selection
    };

    const toggleInstallmentDropdown = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();

        // Close other installment dropdowns
        if (openInstallmentDropdownIndex !== null && openInstallmentDropdownIndex !== index) {
            setOpenInstallmentDropdownIndex(null);
        }

        if (openInstallmentDropdownIndex === index) {
            setOpenInstallmentDropdownIndex(null);
        } else {
            const button = buttonRefs.current[index];
            if (button) {
                const rect = button.getBoundingClientRect();
                // Fixed positioning doesn't need scrollY/scrollX offset
                setDropdownPosition({
                    top: rect.bottom,
                    left: rect.left,
                    width: Math.max(rect.width, 180) // Minimum width for readability
                });
                setOpenInstallmentDropdownIndex(index);
            }
        }
    };

    // Handle Quote Selection Dropdown Show
    const handleQuoteDropdownShow = (index: number) => {
        // Close other quote dropdowns
        quoteDropdownRefs.current.forEach((ref, i) => {
            if (i !== index && ref) {
                // PrimeReact Dropdown doesn't always expose a clean 'hide' method in types, 
                // but it exists on the instance. Casting to any to avoid TS errors if types are incomplete.
                (ref as any).hide?.();
            }
        });

        // Also close installment dropdown if open
        setOpenInstallmentDropdownIndex(null);
    };

    const formatPrice = (amount: number) => {
        return amount.toLocaleString('tr-TR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }) + ' ₺';
    };

    const formatGuaranteeValue = (guarantee: any): string => {
        if (!guarantee) return '-';
        if (guarantee.valueText) {
            return guarantee.valueText;
        }
        if (guarantee.amount) {
            return formatPrice(guarantee.amount);
        }
        return '-';
    };

    // Collect all unique guarantee labels
    const allGuaranteeLabels = Array.from(new Set(
        selectedQuotes
            .filter(q => q !== null)
            .flatMap(q => q!.insuranceCompanyGuarantees || [])
            .map(g => g.label)
    )).sort();

    // Get options for a specific slot
    const getQuoteOptions = (currentSlotIndex: number) => {
        const selectedIdsInOtherSlots = selectedQuotes
            .filter((_, index) => index !== currentSlotIndex)
            .map(q => q?.id)
            .filter(id => id !== undefined);

        return allQuotes
            .filter(q => !selectedIdsInOtherSlots.includes(q.id))
            .map(q => {
                const premium = q.premiums.find(p => p.installmentNumber === 1);
                const price = premium ? formatPrice(premium.grossPremium) : '';
                return {
                    label: `${q.company || ''} - ${price}`,
                    value: q.id,
                    price: price
                };
            });
    };

    // Template to show only price when selected
    const selectedValueTemplate = (option: any, props: any) => {
        if (option) {
            // Truncate text if too long
            return <span className="pp-comp-dropdown-selected-text">{option.label}</span>;
        }
        return <span>{props.placeholder}</span>;
    };

    const itemTemplate = (option: any) => {
        return (
            <div className="flex align-items-center">
                <div>{option.label}</div>
            </div>
        );
    };

    return (
        <div className="pp-comp-modal-overlay" onClick={onClose}>
            {/* Close Button Outside */}
            <button className="pp-comp-modal-close-outside" onClick={onClose}>
                <span>Kapat</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            <div className="pp-comp-modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Mobil için: Header + Dropdown seçimi aynı bölümde */}
                <div className="pp-comp-header-section">
                    <div className="pp-comp-header">
                        <h2 className="pp-comp-title">Teklif Karşılaştırması</h2>
                        <p className="pp-comp-subtitle">Karşılaştırmak istediğiniz teklifleri seçin</p>
                    </div>

                    {/* Mobil Dropdown Seçimi */}
                    <div className="pp-comp-mobile-selectors">
                        {selectedQuotes.map((quote, index) => {
                            const currentOptions = getQuoteOptions(index);
                            return (
                                <div key={`mobile-select-${index}`} className="pp-comp-mobile-selector">
                                    <Dropdown
                                        value={quote?.id}
                                        options={currentOptions}
                                        onChange={(e) => handleQuoteChange(index, e.value)}
                                        onShow={() => handleQuoteDropdownShow(index)}
                                        placeholder="Teklif Seçin"
                                        className="pp-comp-dropdown"
                                        panelClassName="pp-comp-dropdown-panel"
                                        valueTemplate={selectedValueTemplate}
                                        itemTemplate={itemTemplate}
                                        appendTo={document.body}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="pp-comp-content">
                    <table className="pp-comp-table">
                        <colgroup>
                            <col className="pp-comp-col-label" />
                            {selectedQuotes.map((_, i) => (
                                <col key={i} className="pp-comp-col-data" />
                            ))}
                        </colgroup>

                        <thead>
                            {/* Row 1: Dropdowns - Desktop only */}
                            <tr className="pp-comp-desktop-only">
                                <th className="pp-comp-th-dropdown"></th>
                                {selectedQuotes.map((quote, index) => {
                                    const currentOptions = getQuoteOptions(index);
                                    return (
                                        <th key={`select-${index}`} className="pp-comp-th-dropdown">
                                            <Dropdown
                                                ref={(el) => quoteDropdownRefs.current[index] = el}
                                                value={quote?.id}
                                                options={currentOptions}
                                                onChange={(e) => handleQuoteChange(index, e.value)}
                                                onShow={() => handleQuoteDropdownShow(index)}
                                                placeholder="Teklif Seçin"
                                                className="pp-comp-dropdown"
                                                panelClassName="pp-comp-dropdown-panel"
                                                valueTemplate={selectedValueTemplate}
                                                itemTemplate={itemTemplate}
                                                appendTo={document.body}
                                            />
                                        </th>
                                    );
                                })}
                            </tr>

                            {/* Row 2: Brand Logo & Price */}
                            <tr>
                                <th className="pp-comp-th-info"></th>
                                {selectedQuotes.map((quote, index) => {
                                    const currentInstallment = slotInstallments[index];
                                    const selectedPremium = quote?.premiums.find((p: any) => p.installmentNumber === currentInstallment);

                                    return (
                                        <th key={`info-${index}`} className="pp-comp-th-info">
                                            {quote ? (
                                                <div className="pp-comp-info-container">
                                                    <div className="pp-comp-logo-wrapper">
                                                        <img src={`https://storage.dogasigorta.com/app-1/insurup-b2c-company/${quote.insuranceCompanyId}.png`} alt={quote.company} className="pp-comp-logo" />
                                                    </div>
                                                    <div className="pp-comp-price">
                                                        {selectedPremium ? formatPrice(selectedPremium.grossPremium) : '-'}
                                                    </div>

                                                    {/* Custom Installment Dropdown */}
                                                    <div className="pp-comp-installment-wrapper">
                                                        <button
                                                            ref={el => buttonRefs.current[index] = el}
                                                            onClick={(e) => toggleInstallmentDropdown(index, e)}
                                                            className="pp-comp-installment-button"
                                                        >
                                                            <span>
                                                                {currentInstallment === 1
                                                                    ? 'Peşin Ödeme'
                                                                    : `${currentInstallment} Taksit`}
                                                            </span>
                                                            <svg className="pp-chevron-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="pp-comp-info-container text-gray-400">
                                                    Teklif Seçilmedi
                                                </div>
                                            )}
                                        </th>
                                    );
                                })}
                            </tr>

                            {/* Row 3: Action Header (Teal Bar) */}
                            <tr className="pp-comp-sticky-header">
                                <th className="pp-comp-th-action-label">
                                    Teminat Adı
                                </th>
                                {selectedQuotes.map((quote, index) => (
                                    <th key={`action-${index}`} className="pp-comp-th-action-btn">
                                        {quote && (
                                            <button
                                                className="pp-comp-btn-buy"
                                                onClick={() => onPurchase(quote.id)}
                                            >
                                                Satın Al
                                            </button>
                                        )}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {allGuaranteeLabels.map((label, rowIndex) => (
                                <tr key={rowIndex} className="pp-comp-row">
                                    <td className="pp-comp-cell-label">
                                        <div className="pp-comp-label-content">
                                            <span className="pp-comp-label-text">{label}</span>
                                            <CoverageTooltip branch="kasko" coverageKey={label} className="pp-comp-info-icon" />
                                        </div>
                                    </td>
                                    {selectedQuotes.map((quote, colIndex) => {
                                        if (!quote) return <td key={colIndex} className="pp-comp-cell-value"></td>;

                                        const guarantee = quote.insuranceCompanyGuarantees?.find((g: any) => g.label === label);
                                        const value = formatGuaranteeValue(guarantee);
                                        const isIncluded = value === 'Dahil' || value === 'Limitsiz' || value === 'Rayiç' || (guarantee?.amount > 0);

                                        return (
                                            <td key={colIndex} className="pp-comp-cell-value">
                                                <span className={isIncluded ? 'pp-comp-text-included' : 'pp-comp-text-default'}>
                                                    {value}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Portal for Installment Dropdown */}
            {openInstallmentDropdownIndex !== null && dropdownPosition && selectedQuotes[openInstallmentDropdownIndex] && createPortal(
                <div
                    className="pp-comp-installment-menu-portal"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    style={{
                        position: 'fixed',
                        top: dropdownPosition.top + 2,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width,
                        zIndex: 10010,
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                        maxHeight: '200px',
                        overflowY: 'auto'
                    }}
                >
                    {selectedQuotes[openInstallmentDropdownIndex]!.premiums.map((premium: any) => (
                        <button
                            key={premium.installmentNumber}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleInstallmentChange(openInstallmentDropdownIndex, premium.installmentNumber);
                            }}
                            className="pp-comp-installment-item"
                        >
                            {premium.installmentNumber === 1 ? (
                                'Peşin Ödeme'
                            ) : (
                                `${premium.installmentNumber} x ${(premium.grossPremium / premium.installmentNumber).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`
                            )}
                        </button>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );
};

export default QuoteComparisonModal;
