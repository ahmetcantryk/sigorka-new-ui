import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';
import { pushDaskQuoteSuccess, pushDaskQuoteFailed } from '../utils/dataLayerUtils';

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

    company?: string;
    price?: number;
    coverage?: number;
    features?: string[];
    logo?: string;
}

export interface ProcessedQuote extends Quote {
    selectedInstallmentNumber: number;
}

interface InsuranceCompany {
    id: number;
    name: string;
    logo: string | null;
    enabled: boolean;
}

// DASK Loading Config
const DASK_LOADING_CONFIG = {
    INITIAL_PROGRESS: 30, // Loading %30'dan başlar
    POLL_INTERVAL: 5000,  // 5 saniyede bir polling
    TIMEOUT: 300000,      // 5 dakika timeout
};

export const useDaskQuotes = (proposalId: string | null) => {
    const accessToken = useAuthStore((state) => state.accessToken);
    const logout = useAuthStore((state) => state.logout);
    const agencyConfig = useAgencyConfig();

    const [quotes, setQuotes] = useState<ProcessedQuote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [errorType, setErrorType] = useState<QuoteErrorType | null>(null);
    const [progress, setProgress] = useState(DASK_LOADING_CONFIG.INITIAL_PROGRESS); // %30'dan başla

    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const startTimeRef = useRef<number>(Date.now());

    // Handle auth error - logout and redirect to step 1
    const handleAuthError = useCallback(() => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        setError('Oturum süreniz dolmuştur. Lütfen tekrar giriş yapınız.');
        setErrorType('AUTH_ERROR');
        setIsLoading(false);
        // Logout user
        logout();
    }, [logout]);

    const processQuotesData = (quotesData: Quote[], currentCompanies: InsuranceCompany[]): ProcessedQuote[] => {
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

            const initialSelectedInstallment = formattedPremiums.length > 0 ? formattedPremiums[0].installmentNumber : 1;
            const coverage = 0;
            const features = ['Deprem sonucunda oluşan hasar ödenir ve bu bedel de metrekare x bina inşa değeri olacak şekilde hesaplanır.'];

            return {
                ...quote,
                premiums: formattedPremiums,
                company: company?.name || `Sigorta Şirketi #${quote.insuranceCompanyId}`,
                coverage,
                features,
                logo: company?.logo || `https://storage.dogasigorta.com/app-1/insurup-b2c-company/${quote.insuranceCompanyId}.png`,
                selectedInstallmentNumber: initialSelectedInstallment,
                insuranceCompanyGuarantees: [],
            };
        });
    };

    const fetchCompanies = async () => {
        if (!accessToken) {
            handleAuthError();
            throw new Error('AUTH_ERROR');
        }
        const response = await fetchWithAuth(API_ENDPOINTS.COMPANIES, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        
        // 401 Unauthorized - session expired
        if (response.status === 401) {
            handleAuthError();
            throw new Error('AUTH_ERROR');
        }
        
        if (!response.ok) throw new Error('Şirket bilgileri alınamadı');
        return await response.json();
    };

    const fetchQuotes = async (currentCompanies: InsuranceCompany[]) => {
        if (!proposalId || !accessToken) return;

        try {
            const response = await fetchWithAuth(API_ENDPOINTS.PROPOSALS_ID(proposalId), {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // 401 Unauthorized - session expired
            if (response.status === 401) {
                handleAuthError();
                return;
            }

            if (!response.ok) throw new Error('Proposal bilgileri alınamadı');

            const proposalData = await response.json();
            const productsData = proposalData.products as Quote[];

            if (!Array.isArray(productsData)) throw new Error('Ürünler API yanıtı beklenen formatta değil.');

            const processedQuotes = processQuotesData(productsData, currentCompanies);
            const allowedProductIds = agencyConfig.homepage.partners.companies.flatMap(c => c.products.dask || []);

            const relevantQuotes = processedQuotes.filter(q => allowedProductIds.includes(q.productId));
            const filteredQuotes = relevantQuotes.filter(quote => quote.state === 'ACTIVE');

            setQuotes(filteredQuotes.sort((a, b) => {
                const aPremium = a.premiums.find(p => p.installmentNumber === a.selectedInstallmentNumber);
                const bPremium = b.premiums.find(p => p.installmentNumber === b.selectedInstallmentNumber);
                return (aPremium?.grossPremium || 0) - (bPremium?.grossPremium || 0);
            }));

            // Calculate progress based on finalized quotes
            // Progress: 30 (başlangıç) -> 100 (tamamlandı)
            const totalRelevant = relevantQuotes.length;
            const finalized = relevantQuotes.filter(q => q.state === 'ACTIVE' || q.state === 'FAILED').length;
            
            // Progress hesaplama: %30'dan başla, %100'e kadar git
            const progressRange = 100 - DASK_LOADING_CONFIG.INITIAL_PROGRESS; // 70
            const completionRatio = totalRelevant > 0 ? finalized / totalRelevant : 0;
            const newProgress = DASK_LOADING_CONFIG.INITIAL_PROGRESS + Math.round(completionRatio * progressRange);
            setProgress(prev => Math.max(prev, newProgress));

            const allFinalized = totalRelevant > 0 && finalized === totalRelevant;
            const timeoutReached = Date.now() - startTimeRef.current >= DASK_LOADING_CONFIG.TIMEOUT;

            if (allFinalized || timeoutReached) {
                if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
                setIsLoading(false);
                setProgress(100);
                
                // DataLayer push - Teklif başarılı/başarısız
                if (filteredQuotes.length > 0) {
                    pushDaskQuoteSuccess();
                } else {
                    pushDaskQuoteFailed();
                }
            }
        } catch (err: any) {
            console.error(err);
            if (err?.message === 'AUTH_ERROR') {
                // Already handled in handleAuthError
                return;
            }
            setError('Teklifler alınırken bir hata oluştu.');
            setErrorType('NETWORK_ERROR');
            setIsLoading(false);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const startPolling = async () => {
            if (!proposalId) {
                setError('Teklif ID bulunamadı.');
                setIsLoading(false);
                return;
            }

            try {
                const companies = await fetchCompanies();
                await fetchQuotes(companies);

                pollIntervalRef.current = setInterval(() => {
                    if (isMounted) fetchQuotes(companies);
                }, DASK_LOADING_CONFIG.POLL_INTERVAL);
            } catch (err: any) {
                if (err?.message === 'AUTH_ERROR') {
                    // Already handled
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
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [proposalId, agencyConfig]);

    const handleInstallmentChange = (quoteId: string, installmentNumber: number) => {
        setQuotes((prevQuotes) =>
            prevQuotes.map((quote) =>
                quote.id === quoteId
                    ? { ...quote, selectedInstallmentNumber: installmentNumber }
                    : quote
            )
        );
    };

    return {
        quotes,
        isLoading,
        error,
        errorType,
        progress,
        handleInstallmentChange
    };
};

