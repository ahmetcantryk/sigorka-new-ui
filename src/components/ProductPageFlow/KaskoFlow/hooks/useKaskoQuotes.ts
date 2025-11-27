/**
 * Kasko Flow - useKaskoQuotes Hook
 * 
 * Teklif verilerini yönetir: fetch, polling, state management
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { POLLING_CONFIG } from '../config/kaskoConstants';
import { processQuotesData, areAllQuotesFinalized, hasWaitingQuotes } from '../utils/quoteUtils';
import { pushKaskoQuoteSuccess, pushKaskoQuoteFailed } from '../utils/dataLayerUtils';
import type { ProcessedQuote, InsuranceCompany, Quote } from '../types';

interface UseKaskoQuotesResult {
  quotes: ProcessedQuote[];
  companies: InsuranceCompany[];
  isLoading: boolean;
  error: string | null;
  progress: number;
  handleInstallmentChange: (quoteId: string, installmentNumber: number) => void;
}

export const useKaskoQuotes = (proposalId: string): UseKaskoQuotesResult => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const agencyConfig = useAgencyConfig();

  const [quotes, setQuotes] = useState<ProcessedQuote[]>([]);
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(POLLING_CONFIG.INITIAL_PROGRESS);
  const [isFinishing, setIsFinishing] = useState(false);

  // Refs
  const selectedInstallmentsRef = useRef<Record<string, number>>({});
  const firstActiveQuoteTimeRef = useRef<number | null>(null);
  const progressStartTimeRef = useRef<number>(0);
  const progressAtFirstActiveRef = useRef<number | null>(null);

  // Installment değişikliği
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

  // Progress interval
  useEffect(() => {
    if (!isLoading) return;

    if (progressStartTimeRef.current === 0) {
      progressStartTimeRef.current = Date.now();
    }

    const progressInterval = setInterval(() => {
      setProgress(prevProgress => {
        let newProgress = prevProgress;

        if (isFinishing && firstActiveQuoteTimeRef.current && progressAtFirstActiveRef.current !== null) {
          const timeSinceFirstActive = Date.now() - firstActiveQuoteTimeRef.current;
          const baseProgress = progressAtFirstActiveRef.current;
          const remainingProgress = 100 - baseProgress;

          if (timeSinceFirstActive >= POLLING_CONFIG.FINISH_DURATION) {
            newProgress = 100;
          } else {
            const progressRatio = timeSinceFirstActive / POLLING_CONFIG.FINISH_DURATION;
            newProgress = Math.min(
              Math.ceil(baseProgress + (remainingProgress * progressRatio)),
              100
            );
          }
        } else {
          const elapsedTime = Date.now() - progressStartTimeRef.current;
          const elapsedSeconds = elapsedTime / 1000;
          const calculatedProgress = Math.min(
            POLLING_CONFIG.INITIAL_PROGRESS + Math.floor(elapsedSeconds * (69 / 180)),
            99
          );
          newProgress = calculatedProgress;
        }

        return Math.max(prevProgress, newProgress);
      });
    }, 500);

    return () => clearInterval(progressInterval);
  }, [isLoading, isFinishing]);

  // Progress %100'e ulaştığında loading'i kapat
  useEffect(() => {
    if (progress >= 100 && isLoading && isFinishing) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setIsFinishing(false);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress, isLoading, isFinishing]);

  // Fetch companies and quotes with polling
  useEffect(() => {
    let isPollingActive = true;
    let pollInterval: NodeJS.Timeout | null = null;
    const startTime = Date.now();

    const fetchCompanies = async () => {
      const currentAccessToken = useAuthStore.getState().accessToken;
      if (!currentAccessToken) {
        throw new Error('Yetkilendirme anahtarı bulunamadı.');
      }

      const rawCompanyResponse = await fetchWithAuth(API_ENDPOINTS.COMPANIES, {
        headers: { Authorization: `Bearer ${currentAccessToken}` },
      });

      if (!rawCompanyResponse.ok) {
        throw new Error(`Şirket bilgileri alınamadı: ${rawCompanyResponse.status}`);
      }

      return await rawCompanyResponse.json();
    };

    const fetchQuotes = async (currentCompanies: InsuranceCompany[]) => {
      if (!proposalId) return;

      const currentAccessToken = useAuthStore.getState().accessToken;
      if (!currentAccessToken) return;

      try {
        const rawProductsResponse = await fetchWithAuth(
          API_ENDPOINTS.PROPOSALS_ID(proposalId),
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${currentAccessToken}`,
              Accept: 'application/json',
            },
          }
        );

        if (!rawProductsResponse.ok) {
          throw new Error(`Proposal bilgileri alınamadı: ${rawProductsResponse.status}`);
        }

        const proposalData = await rawProductsResponse.json();
        const productsData = proposalData.products as Quote[];

        const processedQuotes = processQuotesData(productsData, currentCompanies);

        const allowedProductIds = agencyConfig.homepage.partners.companies.flatMap(
          c => c.products.kasko || []
        );

        const filteredQuotes = processedQuotes.filter(
          quote => quote.state === 'ACTIVE' && allowedProductIds.includes(quote.productId)
        );

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

        const relevantQuotes = processedQuotes.filter(q => allowedProductIds.includes(q.productId));
        const hasWaiting = hasWaitingQuotes(relevantQuotes);
        const allFinalized = areAllQuotesFinalized(relevantQuotes);

        const timeoutReached = elapsedTime >= POLLING_CONFIG.TIMEOUT;
        const hasActiveQuote = filteredQuotes.length > 0;

        // İlk active teklif geldiğinde
        if (hasActiveQuote && firstActiveQuoteTimeRef.current === null && !isFinishing) {
          firstActiveQuoteTimeRef.current = Date.now();
          const currentElapsedSeconds = (Date.now() - progressStartTimeRef.current) / 1000;
          const currentProgress = Math.min(
            POLLING_CONFIG.INITIAL_PROGRESS + Math.floor(currentElapsedSeconds * (69 / 180)),
            99
          );
          progressAtFirstActiveRef.current = currentProgress;
          setIsFinishing(true);
        }

        // Timeout
        if (timeoutReached) {
          if (filteredQuotes.length > 0) {
            pushKaskoQuoteSuccess();
          } else {
            pushKaskoQuoteFailed();
          }

          if (pollInterval) clearInterval(pollInterval);
          if (isLoading && !isFinishing) setIsLoading(false);
          return;
        }

        // Tüm teklifler finalize
        if (allFinalized && !hasWaiting) {
          if (filteredQuotes.length > 0) {
            pushKaskoQuoteSuccess();
          } else {
            pushKaskoQuoteFailed();
          }

          if (pollInterval) clearInterval(pollInterval);
          if (!isLoading) return;
          setIsLoading(false);
          return;
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Teklifler alınırken bir hata oluştu.');
        setIsLoading(false);
        if (pollInterval) clearInterval(pollInterval);
      }
    };

    const startPolling = async () => {
      if (!proposalId) {
        setError('Teklif ID bulunamadı.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const companyData = await fetchCompanies();
        setCompanies(companyData);

        await fetchQuotes(companyData);

        const interval = setInterval(async () => {
          if (isPollingActive) {
            await fetchQuotes(companyData);
          }
        }, POLLING_CONFIG.INTERVAL);

        pollInterval = interval;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir sorun oluştu.');
        setQuotes([]);
        setIsLoading(false);
      }
    };

    startPolling();

    return () => {
      isPollingActive = false;
      if (pollInterval) clearInterval(pollInterval);
      firstActiveQuoteTimeRef.current = null;
      progressAtFirstActiveRef.current = null;
    };
  }, [proposalId, agencyConfig]);

  return {
    quotes,
    companies,
    isLoading,
    error,
    progress,
    handleInstallmentChange,
  };
};

