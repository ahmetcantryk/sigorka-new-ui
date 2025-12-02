/**
 * useProductPageQuery Hook
 * 
 * URL query parametrelerini yönetir ve ürün sayfası modunu belirler
 */

'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { ProductPageMode, ProductPageQuery } from '../types';

// Sayfa üstüne scroll yapan yardımcı fonksiyon
const scrollToTop = () => {
  // Küçük bir gecikme ile scroll yap (DOM güncellemesi için)
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
};

export const useProductPageQuery = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Query parametrelerini parse et
  const query: ProductPageQuery = useMemo(() => {
    return {
      proposalId: searchParams.get('proposalId') || undefined,
      purchaseId: searchParams.get('purchaseId') || undefined,
      step: searchParams.get('step') || undefined,
    };
  }, [searchParams]);

  // Aktif modu belirle (öncelik sırasına göre)
  const activeMode: ProductPageMode = useMemo(() => {
    if (query.purchaseId) return 'purchase';
    if (query.proposalId) return 'quote';
    return 'default';
  }, [query]);

  // URL'i güncelle (shallow routing)
  const updateQuery = useCallback((updates: Partial<ProductPageQuery>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Güncellemeleri uygula
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [searchParams, pathname, router]);

  // Forma geç (artık sadece default sayfaya yönlendir)
  const navigateToForm = useCallback((step?: string) => {
    if (step) {
      const params = new URLSearchParams();
      params.set('step', step);
      const newUrl = `${pathname}?${params.toString()}`;
      router.push(newUrl, { scroll: false });
    } else {
      router.push(pathname, { scroll: false });
    }
  }, [pathname, router]);

  // Teklif detayına geç
  const navigateToQuote = useCallback((proposalId: string) => {
    const params = new URLSearchParams();
    params.set('proposalId', proposalId);
    
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
    scrollToTop();
  }, [pathname, router]);

  // Satın alma ekranına geç
  const navigateToPurchase = useCallback((purchaseId: string, proposalId?: string) => {
    const params = new URLSearchParams();
    params.set('purchaseId', purchaseId);
    
    // proposalId varsa ekle (ya parametre olarak ya da mevcut query'den)
    const currentProposalId = proposalId || query.proposalId;
    if (currentProposalId) {
      params.set('proposalId', currentProposalId);
    }
    
    const newUrl = `${pathname}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
    scrollToTop();
  }, [pathname, router, query.proposalId]);

  // Default içeriğe dön
  const navigateToDefault = useCallback(() => {
    router.push(pathname, { scroll: false });
    scrollToTop();
  }, [pathname, router]);

  return {
    query,
    activeMode,
    updateQuery,
    navigateToForm,
    navigateToQuote,
    navigateToPurchase,
    navigateToDefault,
  };
};

