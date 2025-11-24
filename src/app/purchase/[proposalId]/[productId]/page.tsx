"use client";

import { Container, Paper, Box, CircularProgress, Typography, Button } from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import React, { useEffect, useState, ComponentType } from 'react';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { useAuthStore } from '@/store/useAuthStore';
import '../../../../styles/form-style.css'

// Dinamik olarak yüklenecek PurchaseStep bileşenleri için bir tip tanımlayalım
interface PurchaseStepProps {
  onNext: () => void;
  proposalId?: string;
  productId?: string;
  // Gerekirse branşa özel ek proplar eklenebilir
  // branch?: string; 
}
type PurchaseStepComponentType = ComponentType<PurchaseStepProps>;

// Dinamik import sonucu için tip
interface PurchaseStepModule {
  default: PurchaseStepComponentType;
}

// API'den gelen product listesindeki bir ürünün tipini varsayalım
// Bu, API_ENDPOINTS.PROPOSAL_QUOTES yanıtındaki DaskQuoteProduct'a benzer olmalı
// veya sadece ilgili ID'leri içermeli
interface ApiProduct {
  id: string; // URL'deki productId ile eşleşecek olan ID (genellikle string)
  productId: number; // agencyConfig ile eşleşecek olan sayısal product ID
  // ... ürünle ilgili diğer alanlar ...
}

export default function GenericPurchasePage() {
  const router = useRouter();
  const params = useParams();
  const agencyConfig = useAgencyConfig();
  const { accessToken } = useAuthStore();

  const [determinedBranch, setDeterminedBranch] = useState<string | null>(null);
  const [CurrentPurchaseStep, setCurrentPurchaseStep] = useState<PurchaseStepComponentType | null>(null);
  const [nextPageUrl, setNextPageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const proposalIdFromUrl = params?.proposalId as string;
  const productIdFromUrl = params?.productId as string;

  useEffect(() => {
    const loadBranchSpecifics = async () => {
      setIsLoading(true);
      setError(null);

      if (!proposalIdFromUrl) {
        setError("URL'den Talep ID (proposalId) okunamadı.");
        setIsLoading(false);
        return;
      }
      if (!productIdFromUrl) {
        setError("URL'den Ürün ID (productId) okunamadı.");
        setIsLoading(false);
        return;
      }
      
      if (!agencyConfig || !agencyConfig.homepage?.partners?.companies) {
        setError("Acente yapılandırması yüklenemedi veya beklenen formatta değil.");
        setIsLoading(false);
        return;
      }
      if (!accessToken) {
        setError("Yetkilendirme anahtarı bulunamadı. Lütfen giriş yapın.");
        setIsLoading(false);
        return;
      }

      localStorage.setItem('currentProposalId', proposalIdFromUrl);
      localStorage.setItem('currentProductId', productIdFromUrl);

      let configProductId: number | null = null;
      let resolvedBranch: string | null = null; // resolvedBranch'i burada tanımla

      try {
        // 1. API'den ürün listesini çek
        const productsResponse = await fetchWithAuth(
          API_ENDPOINTS.PROPOSALS_ID(proposalIdFromUrl),
          {
            headers: { Authorization: `Bearer ${accessToken}` }
          }
        );

        const responseText = await productsResponse.clone().text();

        if (!productsResponse.ok) {
          const errorText = responseText;
          throw new Error(`Teklif detayları alınamadı (HTTP ${productsResponse.status}): ${errorText.substring(0,100)}`);
        }
        const proposalData = await productsResponse.json();
        const apiProducts = proposalData.products as ApiProduct[];
        
        // 2. API'den dönen listede, URL'nin ikinci segmenti (productIdFromUrl) ile eşleşen ürünü bul

        const selectedApiProduct = apiProducts.find(p => p.id === productIdFromUrl);

        if (!selectedApiProduct) {
          const availableProductIds = apiProducts.map(p => p.id);
          throw new Error(`API yanıtında URL'deki spesifik ürün ID'si (${productIdFromUrl}) ile eşleşen ürün bulunamadı. Ana teklif ID'si ${proposalIdFromUrl} için mevcut ürün ID'leri: ${availableProductIds.join(', ')}`);
        }
        // 3. Eşleşen ürünün agencyConfig'de kullanılacak productId'sini al
        //    Varsayım: selectedApiProduct.productId sayısal ve config için kullanılacak ID'dir.
        if (typeof selectedApiProduct.productId !== 'number') {
          throw new Error(`API'den gelen seçili ürünün 'productId' alanı sayısal değil veya eksik.`);
        }
        configProductId = selectedApiProduct.productId;

      } catch (apiError) {
        setError(apiError instanceof Error ? apiError.message : String(apiError));
        setIsLoading(false);
        return;
      }
      
      if (configProductId !== null) {
        for (const company of agencyConfig.homepage.partners.companies) {
          if (company.products) {
            for (const [branchKey, productIdsInConfig] of Object.entries(company.products)) {
              if (Array.isArray(productIdsInConfig) && productIdsInConfig.includes(configProductId)) {
                resolvedBranch = branchKey.toLowerCase(); // resolvedBranch'e ata
                break;
              }
            }
          }
          if (resolvedBranch) break;
        }
      }

      if (!resolvedBranch) {
        setError(`Ürün ID'si (${configProductId}) için acente yapılandırmasında bir branş eşleşmesi bulunamadı.`);
        setIsLoading(false);
        return;
      }
      
      setDeterminedBranch(resolvedBranch);

      // Eğer branş kasko ise, eski localStorage anahtarlarını da set et
      if (resolvedBranch === 'kasko') {
        localStorage.setItem('proposalIdForKasko', proposalIdFromUrl);
        localStorage.setItem('selectedProductIdForKasko', productIdFromUrl);
      }
      
      // Eğer branş seyahat-saglik ise, localStorage anahtarlarını set et
      if (resolvedBranch === 'seyahat-saglik') {
        localStorage.setItem('SeyahatSaglikProposalId', proposalIdFromUrl);
      }

      let purchaseStepModule: PurchaseStepModule | undefined;
      let redirectUrl = '';

      try {
        switch (resolvedBranch) {
          case 'dask':
            purchaseStepModule = await import('@/components/QuoteFlow/DaskQuote/steps/PurchaseStep') as PurchaseStepModule;
            redirectUrl = `/dask/odeme-sonuc?proposalId=${proposalIdFromUrl}`;
            break;
          case 'trafik':
            purchaseStepModule = await import('@/components/QuoteFlow/TrafikQuote/steps/PurchaseStep') as PurchaseStepModule;
            redirectUrl = `/trafik/odeme-sonuc?proposalId=${proposalIdFromUrl}`;
            break;
          case 'konut':
            purchaseStepModule = await import('@/components/QuoteFlow/KonutQuote/steps/PurchaseStep') as PurchaseStepModule;
            redirectUrl = `/konut/odeme-sonuc?proposalId=${proposalIdFromUrl}`;
            break;
          case 'kasko':
            purchaseStepModule = await import('@/components/QuoteFlow/KaskoQuote/steps/PurchaseStep') as PurchaseStepModule;
            redirectUrl = `/kasko/odeme-sonuc?proposalId=${proposalIdFromUrl}`;
            break;
          case 'tss': 
            purchaseStepModule = await import('@/components/QuoteFlow/TssQuote/steps/PurchaseStep') as PurchaseStepModule;
            redirectUrl = `/tss/odeme-sonuc?proposalId=${proposalIdFromUrl}`;
            break;
          case 'imm':
            purchaseStepModule = await import('@/components/QuoteFlow/ImmQuote/steps/PurchaseStep') as PurchaseStepModule;
            redirectUrl = `/imm/odeme-sonuc?proposalId=${proposalIdFromUrl}`;
            break;
          case 'seyahat-saglik':
            purchaseStepModule = await import('@/components/QuoteFlow/SeyahatSaglikQuote/steps/PurchaseStep') as PurchaseStepModule;
            redirectUrl = `/odeme-sonuc?type=SeyahatSaglik&proposalId=${proposalIdFromUrl}`;
            break;
          default:
            purchaseStepModule = await import('@/components/QuoteFlow/KaskoQuote/steps/PurchaseStep') as PurchaseStepModule;
            redirectUrl = `/kasko/odeme-sonuc?proposalId=${proposalIdFromUrl}`;
            break;
        }
        
        const loadedModule = purchaseStepModule;
        if (loadedModule && typeof loadedModule.default === 'function') {
          setCurrentPurchaseStep(() => loadedModule.default);
        } else {
          throw new Error(`${resolvedBranch} için PurchaseStep bileşeni yüklenemedi veya 'default' exportu geçerli bir fonksiyon değil.`);
        }
        setNextPageUrl(redirectUrl);

      } catch (e) {
        let errorMessage = `${resolvedBranch} branşı için satın alma adımı yüklenirken bir sorun oluştu.`;
        if (e instanceof Error) {
          errorMessage += ` (Detay: ${e.message})`;
        }
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (agencyConfig && accessToken) {
      loadBranchSpecifics();
    } else if (!accessToken && !isLoading) {
      setError("Yetkilendirme anahtarı bulunamadı. Lütfen tekrar giriş yapın.");
      setIsLoading(false);
    } else if (!agencyConfig && !isLoading) {
      setError("Acente yapılandırması yüklenemedi.");
      setIsLoading(false);
    }
  }, [proposalIdFromUrl, productIdFromUrl, agencyConfig, accessToken, router]); // router'ı bağımlılıklara ekledim

  const handleNext = () => {
    if (nextPageUrl) {
      router.push(nextPageUrl);
    } else {
      router.push('/'); 
    }
  };

  if (isLoading || (!CurrentPurchaseStep && !error && (!agencyConfig || !accessToken))) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress sx={{ mb: 2 }} />
        <Typography>Satın alma adımı hazırlanıyor...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p:3, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h6" color="error" gutterBottom>Bir Sorun Oluştu</Typography>
          <Typography>{error}</Typography>
          <Button variant="contained" onClick={() => router.push('/')} sx={{mt: 2}}>Ana Sayfaya Dön</Button>
        </Paper>
      </Box>
    );
  }

  if (!CurrentPurchaseStep) {
     return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', p:3, textAlign: 'center' }}>
         <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h6" color="error" gutterBottom>Yükleme Hatası</Typography>
          <Typography>Satın alma adımı bileşeni yüklenemedi. Lütfen sayfayı yenileyin veya destek ile iletişime geçin.</Typography>
          <Button variant="contained" onClick={() => router.push('/')} sx={{mt: 2}}>Ana Sayfaya Dön</Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Box sx={{ pt: { xs: 8, sm: 10, md: 12 } }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <CurrentPurchaseStep 
              onNext={handleNext} 
              proposalId={proposalIdFromUrl} 
              productId={productIdFromUrl}
            />
          </Paper>
        </Container>
      </Box>
    </Box>
  );
} 