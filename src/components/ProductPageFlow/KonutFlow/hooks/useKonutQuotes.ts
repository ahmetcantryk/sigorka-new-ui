/**
 * Konut Flow - useKonutQuotes Hook
 * 
 * Konut tekliflerini yönetir
 * TSS Flow polling mantığı ile güncellendi
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';
import { pushKonutQuoteSuccess, pushKonutQuoteFailed } from '../utils/dataLayerUtils';
import type { KonutCoverage } from '../types';

// Re-export KonutCoverage for use in other components
export type { KonutCoverage };

// Error types for better handling
export type QuoteErrorType = 'AUTH_ERROR' | 'TIMEOUT' | 'NO_QUOTES' | 'NETWORK_ERROR' | 'UNKNOWN';

export interface Premium {
    installmentNumber: number;
    netPremium: number;
    grossPremium: number;
    commission: number;
    exchangeRate: number;
    currency: string;
    insuranceCompanyProposalNumber: string;
    formattedNetPremium?: string;
    formattedGrossPremium?: string;
}

export interface Guarantee {
    insuranceGuaranteeId: string;
    label: string;
    valueText: string | null;
    amount: number;
    isIncluded?: boolean;
}

export interface Quote {
    id: string;
    insuranceCompanyId: number;
    productId: number;
    premiums: Premium[];
    insuranceCompanyGuarantees: Guarantee[];
    state: 'WAITING' | 'ACTIVE' | 'FAILED';
    needsInvestigationByCompany: boolean;
    hasVocationalDiscount: boolean;
    hasUndamagedDiscount: boolean;
    revised: boolean;
    errorMessage: string | null;
    policyId: string | null;
    discountModels: Record<string, unknown>[];
    optimalCoverage?: KonutCoverage | null;
    coverageGroupName?: string;

    company?: string;
    price?: number;
    coverage?: number;
    features?: string[];
    logo?: string;
}

export interface ProcessedQuote extends Quote {
    selectedInstallmentNumber: number;
    productBranch?: string;
}

interface InsuranceCompany {
    id: number;
    name: string;
    logo: string | null;
    enabled: boolean;
}

// Konut Loading Config - TSS ile aynı mantık
const KONUT_LOADING_CONFIG = {
    INITIAL_PROGRESS: 30,                // Loading %30'dan başlar
    POLL_INTERVAL: 5000,                 // 5 saniyede bir polling
    TIMEOUT: 180000,                     // 3 dakika timeout
    BACKGROUND_POLLING_DURATION: 30000,  // 30 saniye - İlk active teklif sonrası arka plan polling süresi
};

export const useKonutQuotes = (proposalId: string | null) => {
    const accessToken = useAuthStore((state) => state.accessToken);
    const logout = useAuthStore((state) => state.logout);
    const agencyConfig = useAgencyConfig();

    const [quotes, setQuotes] = useState<ProcessedQuote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<QuoteErrorType | null>(null);
    const [progress, setProgress] = useState(KONUT_LOADING_CONFIG.INITIAL_PROGRESS);

    // Refs for polling management
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(Date.now());
    const backgroundPollingRef = useRef<NodeJS.Timeout | null>(null);
    const backgroundPollingStartRef = useRef<number | null>(null);
    const eventFiredRef = useRef(false);
    const loadingClosedRef = useRef(false);
    const selectedInstallmentsRef = useRef<Record<string, number>>({});

    // Handle auth error - logout and redirect to step 1
    const handleAuthError = useCallback(() => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        if (backgroundPollingRef.current) clearInterval(backgroundPollingRef.current);
        setError('Oturum süreniz dolmuştur. Lütfen tekrar giriş yapınız.');
        setErrorType('AUTH_ERROR');
        setIsLoading(false);
        logout();
    }, [logout]);

    const processQuotesData = useCallback((quotesData: Quote[], currentCompanies: InsuranceCompany[]): ProcessedQuote[] => {
        return quotesData.map((quote: Quote) => {
            const company = currentCompanies.find((c) => c.id === quote.insuranceCompanyId);

            const uniquePremiums = quote.premiums.reduce((acc: Premium[], current) => {
                const isDuplicate = acc.some(item =>
                    item.installmentNumber === current.installmentNumber
                );
                if (!isDuplicate) {
                    acc.push(current);
                }
                return acc;
            }, []);

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

            // Preserve selected installment if already set
            const existingInstallment = selectedInstallmentsRef.current[quote.id];
            const initialSelectedInstallment = existingInstallment || 
                (formattedPremiums.length > 0 ? formattedPremiums[0].installmentNumber : 1);
            
            const coverage = 0;
            const features = ['Konut sigortası ile evinizi ve eşyalarınızı güvence altına alın.'];

            return {
                ...quote,
                premiums: formattedPremiums,
                company: company?.name || `Sigorta Şirketi #${quote.insuranceCompanyId}`,
                coverage,
                features,
                logo: company?.logo || `https://storage.dogasigorta.com/app-1/insurup-b2c-company/${quote.insuranceCompanyId}.png`,
                selectedInstallmentNumber: initialSelectedInstallment,
                insuranceCompanyGuarantees: [],
                productBranch: 'KONUT',
            };
        });
    }, []);

    const fetchCompanies = useCallback(async () => {
        if (!accessToken) {
            handleAuthError();
            throw new Error('AUTH_ERROR');
        }
        const response = await fetchWithAuth(API_ENDPOINTS.COMPANIES, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        if (response.status === 401) {
            handleAuthError();
            throw new Error('AUTH_ERROR');
        }
        
        if (!response.ok) throw new Error('Şirket bilgileri alınamadı');
        return await response.json();
    }, [accessToken, handleAuthError]);

    const fetchQuotes = useCallback(async (currentCompanies: InsuranceCompany[], isBackgroundFetch: boolean = false) => {
        if (!proposalId || !accessToken) return;

        try {
            const response = await fetchWithAuth(API_ENDPOINTS.PROPOSALS_ID(proposalId), {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (response.status === 401) {
                handleAuthError();
                return;
            }

            if (!response.ok) throw new Error('Proposal bilgileri alınamadı');

            const proposalData = await response.json();
            const productsData = proposalData.products as Quote[];

            if (!Array.isArray(productsData)) throw new Error('Ürünler API yanıtı beklenen formatta değil.');

            const processedQuotes = processQuotesData(productsData, currentCompanies);
            const allowedProductIds = agencyConfig.homepage.partners.companies.flatMap(c => c.products.konut || []);

            const relevantQuotes = processedQuotes.filter(q => allowedProductIds.includes(q.productId));
            const filteredQuotes = relevantQuotes.filter(quote => quote.state === 'ACTIVE');

            // Sort by price
            const sortedQuotes = filteredQuotes.sort((a, b) => {
                const aPremium = a.premiums.find(p => p.installmentNumber === a.selectedInstallmentNumber);
                const bPremium = b.premiums.find(p => p.installmentNumber === b.selectedInstallmentNumber);
                return (aPremium?.grossPremium || 0) - (bPremium?.grossPremium || 0);
            });

            setQuotes(sortedQuotes);

            // Arka plan fetch'inde sadece quotes'u güncelle, loading state'i değiştirme
            if (isBackgroundFetch) {
                return;
            }

            const elapsedTime = Date.now() - startTimeRef.current;
            const timeoutReached = elapsedTime >= KONUT_LOADING_CONFIG.TIMEOUT;
            const hasActiveQuote = filteredQuotes.length > 0;

            // İlk active teklif geldiğinde - HEMEN loading'i kapat
            if (hasActiveQuote && !loadingClosedRef.current) {
                loadingClosedRef.current = true;
                setProgress(100);
                setIsLoading(false);
                console.log('🔄 Konut: İlk active teklif geldi, loading kapatıldı');

                // DataLayer event
                if (!eventFiredRef.current) {
                    pushKonutQuoteSuccess();
                    eventFiredRef.current = true;
                }

                // Ana polling'i durdur
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                }

                // Arka plan polling başlat - 30 saniye daha devam et
                if (!backgroundPollingRef.current) {
                    backgroundPollingStartRef.current = Date.now();
                    console.log('🔄 Konut: Arka plan polling başlatılıyor (30 saniye)');

                    const bgInterval = setInterval(async () => {
                        const bgElapsed = Date.now() - (backgroundPollingStartRef.current || Date.now());

                        // 30 saniye dolunca durdur
                        if (bgElapsed >= KONUT_LOADING_CONFIG.BACKGROUND_POLLING_DURATION) {
                            console.log('🔄 Konut: Arka plan polling tamamlandı (30 saniye doldu)');
                            if (backgroundPollingRef.current) {
                                clearInterval(backgroundPollingRef.current);
                                backgroundPollingRef.current = null;
                            }
                            return;
                        }

                        // Sessizce teklifleri güncelle
                        try {
                            const bgResponse = await fetchWithAuth(API_ENDPOINTS.PROPOSALS_ID(proposalId), {
                                headers: { Authorization: `Bearer ${accessToken}` },
                            });

                            if (bgResponse.ok) {
                                const bgData = await bgResponse.json();
                                const bgProducts = bgData.products as Quote[];
                                if (Array.isArray(bgProducts)) {
                                    const bgProcessed = processQuotesData(bgProducts, currentCompanies);
                                    const bgFiltered = bgProcessed
                                        .filter(q => allowedProductIds.includes(q.productId))
                                        .filter(q => q.state === 'ACTIVE')
                                        .sort((a, b) => {
                                            const aP = a.premiums.find(p => p.installmentNumber === a.selectedInstallmentNumber);
                                            const bP = b.premiums.find(p => p.installmentNumber === b.selectedInstallmentNumber);
                                            return (aP?.grossPremium || 0) - (bP?.grossPremium || 0);
                                        });
                                    setQuotes(bgFiltered);
                                }
                            }
                        } catch (bgErr) {
                            console.error('Arka plan polling hatası:', bgErr);
                        }
                    }, KONUT_LOADING_CONFIG.POLL_INTERVAL);

                    backgroundPollingRef.current = bgInterval;
                }

                return;
            }

            // Timeout reached - hiç active teklif gelmedi
            if (timeoutReached) {
                if (!eventFiredRef.current) {
                    pushKonutQuoteFailed();
                    eventFiredRef.current = true;
                }
                if (pollIntervalRef.current) {
                    clearInterval(pollIntervalRef.current);
                    pollIntervalRef.current = null;
                }
                setIsLoading(false);
                setProgress(100);
                setErrorType('NO_QUOTES');
                return;
            }

            // Progress güncelle
            const progressRange = 100 - KONUT_LOADING_CONFIG.INITIAL_PROGRESS;
            const totalRelevant = relevantQuotes.length;
            const finalized = relevantQuotes.filter(q => q.state === 'ACTIVE' || q.state === 'FAILED').length;
            const completionRatio = totalRelevant > 0 ? finalized / totalRelevant : 0;
            const newProgress = KONUT_LOADING_CONFIG.INITIAL_PROGRESS + Math.round(completionRatio * progressRange);
            setProgress(prev => Math.max(prev, newProgress));

        } catch (err: any) {
            console.error(err);
            if (err?.message === 'AUTH_ERROR') {
                return;
            }
            setError('Teklifler alınırken bir hata oluştu.');
            setErrorType('NETWORK_ERROR');
            setIsLoading(false);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
    }, [proposalId, accessToken, agencyConfig, handleAuthError, processQuotesData]);

    // Progress animation effect
    useEffect(() => {
        if (!isLoading) return;

        const progressInterval = setInterval(() => {
            setProgress((prevProgress) => {
                const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
                // 3 dakikada %30'dan %99'a kadar ilerle
                const calculatedProgress = Math.min(
                    KONUT_LOADING_CONFIG.INITIAL_PROGRESS + Math.floor(elapsedSeconds * (69 / 180)),
                    99
                );
                return Math.max(prevProgress, calculatedProgress);
            });
        }, 500);

        return () => clearInterval(progressInterval);
    }, [isLoading]);

    useEffect(() => {
        let isMounted = true;
        let pollInterval: NodeJS.Timeout | null = null;

        const startPolling = async () => {
            if (!proposalId) {
                setError('Teklif ID bulunamadı.');
                setIsLoading(false);
                return;
            }

            // Reset refs
            startTimeRef.current = Date.now();
            loadingClosedRef.current = false;
            eventFiredRef.current = false;

            try {
                const companies = await fetchCompanies();
                await fetchQuotes(companies);

                // Ana polling başlat
                const interval = setInterval(() => {
                    if (isMounted && !loadingClosedRef.current) {
                        fetchQuotes(companies);
                    }
                }, KONUT_LOADING_CONFIG.POLL_INTERVAL);

                pollInterval = interval;
                pollIntervalRef.current = interval;
            } catch (err: any) {
                if (err?.message === 'AUTH_ERROR') {
                    return;
                }
                if (isMounted) {
                    setError('Veriler yüklenirken bir sorun oluştu.');
                    setErrorType('NETWORK_ERROR');
                    setIsLoading(false);
                }
            }
        };

        startPolling();

        return () => {
            isMounted = false;
            if (pollInterval) clearInterval(pollInterval);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            if (backgroundPollingRef.current) clearInterval(backgroundPollingRef.current);
        };
    }, [proposalId, fetchCompanies, fetchQuotes]);

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

    return {
        quotes,
        isLoading,
        error,
        errorType,
        progress,
        handleInstallmentChange
    };
};
