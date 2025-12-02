/**
 * TSS Flow - useTssQuotes Hook
 * 
 * TSS'e özel polling yapısı:
 * - İlk active teklif geldiğinde loading hemen kapanır
 * - Arka planda 30 saniye daha polling devam eder (sessizce güncelleme)
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { TSS_POLLING_CONFIG } from '../config/tssConstants';
import { convertTssCoverageToGuarantees, mergeTssCoverages } from '../utils/coverageUtils';
import { pushTssQuoteSuccess, pushTssQuoteFailed } from '../utils/dataLayerUtils';
import type { Quote, ProcessedQuote, InsuranceCompany, Premium } from '../types';

interface UseTssQuotesResult {
    quotes: ProcessedQuote[];
    companies: InsuranceCompany[];
    isLoading: boolean;
    error: string | null;
    progress: number;
    handleInstallmentChange: (quoteId: string, installmentNumber: number) => void;
}

// 401 hatası durumunda sayfaya yönlendirme
const redirectToFormPage = () => {
    if (typeof window !== 'undefined') {
        window.location.href = '/tamamlayici-saglik-sigortasi';
    }
};

export const useTssQuotes = (proposalId: string): UseTssQuotesResult => {
    const agencyConfig = useAgencyConfig();

    const [quotes, setQuotes] = useState<ProcessedQuote[]>([]);
    const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(TSS_POLLING_CONFIG.INITIAL_PROGRESS);

    // Refs
    const selectedInstallmentsRef = useRef<Record<string, number>>({});
    const progressStartTimeRef = useRef<number>(0);
    const backgroundPollingRef = useRef<NodeJS.Timeout | null>(null);
    const backgroundPollingStartRef = useRef<number | null>(null);
    const eventFiredRef = useRef(false);
    const loadingClosedRef = useRef(false);

    // Get TSS product IDs from agency config
    const getTssProductIds = useCallback((): number[] => {
        return agencyConfig.homepage.partners.companies.flatMap(
            (company) => company.products.tss || []
        );
    }, [agencyConfig]);

    // Handle installment change
    const handleInstallmentChange = useCallback((quoteId: string, installmentNumber: number) => {
        selectedInstallmentsRef.current[quoteId] = installmentNumber;

        setQuotes((prevQuotes) =>
            prevQuotes.map((quote) =>
                quote.id === quoteId
                    ? { ...quote, selectedInstallmentNumber: installmentNumber }
                    : quote
            )
        );
    }, []);

    // Process quotes data
    const processQuotesData = useCallback(
        (quotesData: Quote[], currentCompanies: InsuranceCompany[]): ProcessedQuote[] => {
            return quotesData.map((quote) => {
                const company = currentCompanies.find((c) => c.id === quote.insuranceCompanyId);

                // Unique premiums
                const uniquePremiums = quote.premiums.reduce((acc: Premium[], current) => {
                    const isDuplicate = acc.some(
                        (item) => item.installmentNumber === current.installmentNumber
                    );
                    if (!isDuplicate) {
                        acc.push(current);
                    }
                    return acc;
                }, []);

                // Format premiums
                const formattedPremiums = uniquePremiums.map((premium) => ({
                    ...premium,
                    formattedNetPremium: premium.netPremium.toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
                    formattedGrossPremium: premium.grossPremium.toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
                }));

                const initialSelectedInstallment =
                    formattedPremiums.length > 0 ? formattedPremiums[0].installmentNumber : 1;

                // Merge coverages - optimalCoverage öncelikli!
                const mergedCoverage = mergeTssCoverages(
                    quote.optimalCoverage,  // optimalCoverage en öncelikli
                    quote.pdfCoverage,
                    quote.insuranceServiceProviderCoverage,
                    quote.initialCoverage
                );

                // Convert to guarantees
                const guarantees = convertTssCoverageToGuarantees(mergedCoverage);

                return {
                    ...quote,
                    premiums: formattedPremiums,
                    company: company?.name || `Sigorta Şirketi #${quote.insuranceCompanyId}`,
                    logo:
                        company?.logo ||
                        `https://storage.dogasigorta.com/app-1/insurup-b2c-company/${quote.insuranceCompanyId}.png`,
                    selectedInstallmentNumber: initialSelectedInstallment,
                    insuranceCompanyGuarantees: guarantees,
                    productBranch: 'TSS',
                    // optimalCoverage'ı da taşı (TssQuoteCard'da kullanılacak)
                    optimalCoverage: quote.optimalCoverage || mergedCoverage,
                };
            });
        },
        []
    );

    // Check if all quotes are finalized
    const areAllQuotesFinalized = (quotes: ProcessedQuote[]): boolean => {
        return quotes.every((quote) => quote.state === 'FAILED' || quote.state === 'ACTIVE');
    };

    // Check if there are waiting quotes
    const hasWaitingQuotes = (quotes: ProcessedQuote[]): boolean => {
        return quotes.some((quote) => quote.state === 'WAITING');
    };

    // Progress interval - Loading sırasında progress artışı
    useEffect(() => {
        if (!isLoading) return;

        if (progressStartTimeRef.current === 0) {
            progressStartTimeRef.current = Date.now();
        }

        const progressInterval = setInterval(() => {
            setProgress((prevProgress) => {
                // Normal progress artışı (3 dakikada %30'dan %99'a)
                const elapsedTime = Date.now() - progressStartTimeRef.current;
                const elapsedSeconds = elapsedTime / 1000;
                const calculatedProgress = Math.min(
                    TSS_POLLING_CONFIG.INITIAL_PROGRESS + Math.floor(elapsedSeconds * (69 / 180)),
                    99
                );
                return Math.max(prevProgress, calculatedProgress);
            });
        }, 500);

        return () => clearInterval(progressInterval);
    }, [isLoading]);

    // Main polling effect
    useEffect(() => {
        let isPollingActive = true;
        let pollInterval: NodeJS.Timeout | null = null;
        const startTime = Date.now();

        const allowedProductIds = getTssProductIds();

        console.log('🔄 TSS Polling başlatılıyor, proposalId:', proposalId);
        console.log('🔄 TSS Allowed product IDs:', allowedProductIds);

        // Fetch companies
        const fetchCompanies = async (): Promise<InsuranceCompany[]> => {
            const currentAccessToken = useAuthStore.getState().accessToken;
            if (!currentAccessToken) {
                redirectToFormPage();
                throw new Error('Yetkilendirme anahtarı bulunamadı.');
            }

            const response = await fetchWithAuth(API_ENDPOINTS.COMPANIES, {
                headers: { Authorization: `Bearer ${currentAccessToken}` },
            });

            // 401 Unauthorized
            if (response.status === 401) {
                console.log('⚠️ TSS: 401 Unauthorized - Oturum süresi dolmuş');
                redirectToFormPage();
                throw new Error('Oturum süresi dolmuş.');
            }

            if (!response.ok) {
                throw new Error(`Şirket bilgileri alınamadı: ${response.status}`);
            }

            return await response.json();
        };

        // Fetch quotes
        const fetchQuotes = async (currentCompanies: InsuranceCompany[]) => {
            if (!proposalId) return;

            const currentAccessToken = useAuthStore.getState().accessToken;
            if (!currentAccessToken) return;

            try {
                const response = await fetchWithAuth(API_ENDPOINTS.PROPOSALS_ID(proposalId), {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${currentAccessToken}`,
                        Accept: 'application/json',
                    },
                });

                // 401 Unauthorized
                if (response.status === 401) {
                    console.log('⚠️ TSS: 401 Unauthorized - Oturum süresi dolmuş');
                    redirectToFormPage();
                    throw new Error('Oturum süresi dolmuş.');
                }

                if (!response.ok) {
                    throw new Error(`Proposal bilgileri alınamadı: ${response.status}`);
                }

                const proposalData = await response.json();
                const productsData = proposalData.products as Quote[];

                console.log('📥 TSS Quotes response:', {
                    totalProducts: productsData?.length || 0,
                    products: productsData?.map((p) => ({
                        id: p.id,
                        state: p.state,
                        productId: p.productId,
                        companyId: p.insuranceCompanyId,
                        hasOptimalCoverage: !!(p as any).optimalCoverage,
                        optimalCoverageKeys: (p as any).optimalCoverage ? Object.keys((p as any).optimalCoverage) : [],
                        optimalCoverage: (p as any).optimalCoverage,
                    })),
                });

                const processedQuotes = processQuotesData(productsData, currentCompanies);

                // Filter by allowed product IDs and ACTIVE state
                const filteredQuotes = processedQuotes.filter(
                    (quote) => quote.state === 'ACTIVE' && allowedProductIds.includes(quote.productId)
                );

                console.log('📊 TSS Filtered quotes:', {
                    processed: processedQuotes.length,
                    active: filteredQuotes.length,
                    states: processedQuotes.map((q) => ({ id: q.id, state: q.state, productId: q.productId })),
                });

                // Update quotes state (preserve installment selections)
                setQuotes((prevQuotes) => {
                    return filteredQuotes.map((newQuote) => {
                        const savedInstallment = selectedInstallmentsRef.current[newQuote.id];
                        if (savedInstallment) {
                            return { ...newQuote, selectedInstallmentNumber: savedInstallment };
                        }

                        const existingQuote = prevQuotes.find((q) => q.id === newQuote.id);
                        if (existingQuote) {
                            return { ...newQuote, selectedInstallmentNumber: existingQuote.selectedInstallmentNumber };
                        }
                        return newQuote;
                    });
                });

                const elapsedTime = Date.now() - startTime;

                // Check quote states
                const relevantQuotes = processedQuotes.filter((q) => allowedProductIds.includes(q.productId));
                const hasWaiting = hasWaitingQuotes(relevantQuotes);
                const allFinalized = areAllQuotesFinalized(relevantQuotes);

                const timeoutReached = elapsedTime >= TSS_POLLING_CONFIG.TIMEOUT;
                const hasActiveQuote = filteredQuotes.length > 0;

                // İlk active teklif geldiğinde - HEMEN loading'i kapat
                if (hasActiveQuote && !loadingClosedRef.current) {
                    loadingClosedRef.current = true;
                    setProgress(100);
                    setIsLoading(false);
                    console.log('🔄 TSS: İlk active teklif geldi, loading kapatıldı');

                    // DataLayer event
                    if (!eventFiredRef.current) {
                        pushTssQuoteSuccess();
                        eventFiredRef.current = true;
                    }

                    // Ana polling'i durdur
                    if (pollInterval) {
                        clearInterval(pollInterval);
                        pollInterval = null;
                    }

                    // Arka planda 30 saniye daha polling başlat
                    if (!backgroundPollingRef.current) {
                        backgroundPollingStartRef.current = Date.now();
                        console.log('🔄 TSS: Arka plan polling başlatılıyor (30 saniye)...');

                        const bgInterval = setInterval(async () => {
                            const bgElapsed = Date.now() - (backgroundPollingStartRef.current || Date.now());

                            // 30 saniye dolunca durdur
                            if (bgElapsed >= TSS_POLLING_CONFIG.BACKGROUND_POLLING_DURATION) {
                                console.log('🔄 TSS: Arka plan polling tamamlandı (30 saniye doldu)');
                                if (backgroundPollingRef.current) {
                                    clearInterval(backgroundPollingRef.current);
                                    backgroundPollingRef.current = null;
                                }
                                return;
                            }

                            // Sessizce teklifleri güncelle
                            try {
                                const bgAccessToken = useAuthStore.getState().accessToken;
                                if (!bgAccessToken) return;

                                const bgResponse = await fetchWithAuth(API_ENDPOINTS.PROPOSALS_ID(proposalId), {
                                    method: 'GET',
                                    headers: {
                                        Authorization: `Bearer ${bgAccessToken}`,
                                        Accept: 'application/json',
                                    },
                                });

                                if (!bgResponse.ok) return;

                                const bgData = await bgResponse.json();
                                const bgProductsData = bgData.products as Quote[];
                                const bgProcessedQuotes = processQuotesData(bgProductsData, currentCompanies);

                                const bgFilteredQuotes = bgProcessedQuotes.filter(
                                    (quote) => quote.state === 'ACTIVE' && allowedProductIds.includes(quote.productId)
                                );

                                // Sessizce state'i güncelle
                                setQuotes((prevQuotes) => {
                                    return bgFilteredQuotes.map((newQuote) => {
                                        const savedInstallment = selectedInstallmentsRef.current[newQuote.id];
                                        if (savedInstallment) {
                                            return { ...newQuote, selectedInstallmentNumber: savedInstallment };
                                        }
                                        const existingQuote = prevQuotes.find((q) => q.id === newQuote.id);
                                        if (existingQuote) {
                                            return { ...newQuote, selectedInstallmentNumber: existingQuote.selectedInstallmentNumber };
                                        }
                                        return newQuote;
                                    });
                                });

                                console.log('🔄 TSS: Arka plan güncelleme yapıldı, aktif teklif sayısı:', bgFilteredQuotes.length);
                            } catch (err) {
                                console.log('🔄 TSS: Arka plan polling hatası (yoksayıldı):', err);
                            }
                        }, TSS_POLLING_CONFIG.INTERVAL);

                        backgroundPollingRef.current = bgInterval;
                    }

                    return;
                }

                // Timeout reached - hiç active teklif gelmedi
                if (timeoutReached) {
                    if (!eventFiredRef.current) {
                        if (filteredQuotes.length > 0) {
                            pushTssQuoteSuccess();
                        } else {
                            pushTssQuoteFailed();
                        }
                        eventFiredRef.current = true;
                    }

                    if (pollInterval) clearInterval(pollInterval);
                    setIsLoading(false);
                    return;
                }

                // Tüm teklifler finalize oldu ama hiç active yok
                if (allFinalized && !hasWaiting && !hasActiveQuote) {
                    if (!eventFiredRef.current) {
                        pushTssQuoteFailed();
                        eventFiredRef.current = true;
                    }

                    if (pollInterval) clearInterval(pollInterval);
                    setIsLoading(false);
                    return;
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Teklifler alınırken bir hata oluştu.');
                setIsLoading(false);
                if (pollInterval) clearInterval(pollInterval);
            }
        };

        // Start polling
        const startPolling = async () => {
            if (!proposalId) {
                setError('Teklif ID bulunamadı.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);
            loadingClosedRef.current = false;
            eventFiredRef.current = false;

            try {
                const companyData = await fetchCompanies();
                setCompanies(companyData);

                await fetchQuotes(companyData);

                const interval = setInterval(async () => {
                    if (isPollingActive) {
                        await fetchQuotes(companyData);
                    }
                }, TSS_POLLING_CONFIG.INTERVAL);

                pollInterval = interval;
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir sorun oluştu.');
                setQuotes([]);
                setIsLoading(false);
            }
        };

        startPolling();

        // Cleanup
        return () => {
            isPollingActive = false;
            if (pollInterval) clearInterval(pollInterval);
            if (backgroundPollingRef.current) {
                clearInterval(backgroundPollingRef.current);
                backgroundPollingRef.current = null;
            }
            backgroundPollingStartRef.current = null;
        };
    }, [proposalId, agencyConfig, getTssProductIds, processQuotesData]);

    return {
        quotes,
        companies,
        isLoading,
        error,
        progress,
        handleInstallmentChange,
    };
};

export default useTssQuotes;
