/**
 * KaskoProductQuote
 * 
 * Test klasöründeki tasarımla teklif karşılaştırma componenti
 * QuoteComparisonStep.tsx'den API entegrasyonu alındı
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import CoverageDetailsModal from '../shared/CoverageDetailsModal';
import QuoteComparisonModal from '../shared/QuoteComparisonModal';
import QuoteLoadingScreen from '@/components/common/QuoteLoadingScreen';
import CoverageTooltip from '../shared/CoverageTooltip';

// DataLayer helper
declare global {
  interface Window {
    dataLayer: any[];
  }
}

const pushToDataLayer = (eventData: any) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventData);
  }
};

// Types from QuoteComparisonStep
interface InsuranceCompany {
  id: number;
  name: string;
  logo: string | null;
  enabled: boolean;
}

interface Premium {
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

interface CoverageValue {
  $type: 'LIMITLESS' | 'DECIMAL' | 'UNDEFINED' | 'HIGHEST_LIMIT' | 'NOT_INCLUDED' | 'INCLUDED' | 'NONE';
  value?: number;
}

interface KaskoCoverage {
  $type: 'kasko';
  [key: string]: any;
}

interface Guarantee {
  insuranceGuaranteeId: string;
  label: string;
  valueText: string | null;
  amount: number;
}

interface Quote {
  id: string;
  insuranceCompanyId: number;
  productId: number;
  premiums: Premium[];
  initialCoverage: KaskoCoverage | null;
  insuranceServiceProviderCoverage: KaskoCoverage | null;
  pdfCoverage: KaskoCoverage | null;
  optimalCoverage: KaskoCoverage | null;
  state: 'WAITING' | 'ACTIVE' | 'FAILED';
  needsInvestigationByCompany: boolean;
  hasVocationalDiscount: boolean;
  hasUndamagedDiscount: boolean;
  revised: boolean;
  errorMessage: string | null;
  policyId: string | null;
  coverageGroupName?: string;
  company?: string;
  price?: number;
  coverage?: number;
  features?: string[];
  logo?: string;
  insuranceCompanyGuarantees?: Guarantee[];
}

interface ProcessedQuote extends Quote {
  selectedInstallmentNumber: number;
}

interface KaskoProductQuoteProps {
  proposalId: string;
  onBack?: () => void;
  onPurchaseClick?: (quoteId: string) => void;
}

const KaskoProductQuote = ({ proposalId, onBack, onPurchaseClick }: KaskoProductQuoteProps) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const agencyConfig = useAgencyConfig();

  const [quotes, setQuotes] = useState<ProcessedQuote[]>([]);
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  // Filter & Sort states
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Filtrele');
  const [selectedSort, setSelectedSort] = useState('Fiyata Göre Sırala');

  // Ref to persist selected installments across polls/renders
  const selectedInstallmentsRef = useRef<Record<string, number>>({});

  // Details expansion states
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);
  const [installmentsOpen, setInstallmentsOpen] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<Record<string, 'campaigns' | 'coverages'>>({});

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuoteForModal, setSelectedQuoteForModal] = useState<ProcessedQuote | null>(null);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  // Coverage'ı Guarantee array'ine dönüştürme fonksiyonu (QuoteComparisonStep'ten)
  const convertCoverageToGuarantees = (coverage: KaskoCoverage | null): Guarantee[] => {
    if (!coverage) return [];

    const guarantees: Guarantee[] = [];
    let guaranteeId = 1;

    const coverageLabels: Record<string, string> = {
      immLimitiAyrimsiz: 'İMM Limitli / Limitsiz',
      ferdiKazaVefat: 'Ferdi Kaza Vefat',
      ferdiKazaSakatlik: 'Ferdi Kaza Sakatlık',
      ferdiKazaTedaviMasraflari: 'Ferdi Kaza Tedavi Masrafları',
      anahtarKaybi: 'Anahtar Kaybı',
      maneviTazminat: 'Manevi Tazminat',
      onarimServisTuru: 'Onarım Servis Türü',
      yedekParcaTuru: 'Yedek Parça Türü',
      camKirilmaMuafeyeti: 'Cam Kırılma Muafiyeti',
      hukuksalKorumaAracaBagli: 'Hukuksal Koruma (Araca Bağlı)',
      ozelEsya: 'Özel Eşya',
      sigaraMaddeZarari: 'Sigara/Madde Zararı',
      patlayiciMaddeZarari: 'Patlayıcı Madde Zararı',
      kemirgenZarari: 'Kemirgen Zararı',
      yukKaymasiZarari: 'Yük Kayması Zararı',
      eskime: 'Eskime',
      hasarsizlikIndirimKoruma: 'Hasarsızlık İndirim Koruma',
      yurtdisiKasko: 'Yurtdışı Kasko',
      aracCalinmasi: 'Araç Çalınması',
      anahtarCalinmasi: 'Anahtar Çalınması',
      hukuksalKorumaSurucuyeBagli: 'Hukuksal Koruma (Sürücüye Bağlı)',
      miniOnarim: 'Mini Onarım',
      yolYardim: 'Yol Yardım',
      yanlisAkaryakitDolumu: 'Yanlış Akaryakıt Dolumu',
      yanma: 'Yanma',
      carpma: 'Çarpma',
      carpisma: 'Çarpışma',
      glkhhTeror: 'GLKHH Terör',
      grevLokavt: 'Grev/Lokavt',
      dogalAfetler: 'Doğal Afetler',
      hirsizlik: 'Hırsızlık',
      kiralikArac: 'Kiralık Araç'
    };

    Object.entries(coverage).forEach(([key, value]) => {
      if (key === '$type' || key === 'productBranch') return;

      const label = coverageLabels[key] || key;

      // Handle String Values (e.g. "ANLASMALI_OZEL_SERVIS")
      if (typeof value === 'string') {
        let formattedValue = value;
        if (value === 'ANLASMALI_OZEL_SERVIS') formattedValue = 'Anlaşmalı Özel Servis';
        else if (value === 'ANLASMALI_YETKILI_SERVIS') formattedValue = 'Anlaşmalı Yetkili Servis';
        else if (value === 'TUM_YETKILI_SERVISLER') formattedValue = 'Tüm Yetkili Servisler';
        else if (value === 'ORIJINAL_PARCA') formattedValue = 'Orijinal Parça';
        else if (value === 'ESDEGER_PARCA') formattedValue = 'Eşdeğer Parça';
        else {
          // Fallback: Replace underscores with spaces and Title Case
          formattedValue = value.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
          });
        }

        guarantees.push({
          insuranceGuaranteeId: guaranteeId.toString(),
          label,
          valueText: formattedValue,
          amount: 0
        });
        guaranteeId++;
        return;
      }

      if (typeof value === 'object' && value !== null && '$type' in value) {
        const coverageValue = value as any; // Using any to access dynamic properties like yillikKullanimSayisi

        switch (coverageValue.$type) {
          case 'LIMITLESS':
            guarantees.push({
              insuranceGuaranteeId: guaranteeId.toString(),
              label,
              valueText: 'Limitsiz',
              amount: 0
            });
            break;
          case 'HIGHEST_LIMIT':
          case 'MARKET_VALUE': // Added MARKET_VALUE handling
            guarantees.push({
              insuranceGuaranteeId: guaranteeId.toString(),
              label,
              valueText: 'Rayiç',
              amount: 0
            });
            break;
          case 'DECIMAL':
            if (coverageValue.value !== undefined) {
              guarantees.push({
                insuranceGuaranteeId: guaranteeId.toString(),
                label,
                valueText: null,
                amount: coverageValue.value
              });
            }
            break;
          case 'INCLUDED':
            guarantees.push({
              insuranceGuaranteeId: guaranteeId.toString(),
              label,
              valueText: 'Dahil',
              amount: 0
            });
            break;
          case 'NOT_INCLUDED':
            guarantees.push({
              insuranceGuaranteeId: guaranteeId.toString(),
              label,
              valueText: 'Dahil Değil',
              amount: 0
            });
            break;
          case 'DEFINED':
            // Handle Kiralık Araç specifically
            if (key === 'kiralikArac') {
              const { yillikKullanimSayisi, tekSeferlikGunSayisi, aracSegment } = coverageValue;
              if (yillikKullanimSayisi && tekSeferlikGunSayisi && aracSegment) {
                guarantees.push({
                  insuranceGuaranteeId: guaranteeId.toString(),
                  label,
                  valueText: `${yillikKullanimSayisi}x${tekSeferlikGunSayisi} ${aracSegment} Segment`,
                  amount: 0
                });
              }
            }
            break;
        }

        guaranteeId++;
      }
    });

    return guarantees.sort((a, b) => a.label.localeCompare(b.label));
  };

  // Process quotes data (QuoteComparisonStep'ten)
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

      // Teminatları işle
      let guarantees: Guarantee[] = [];

      const allCoverages = [
        { coverage: quote.optimalCoverage, type: 'optimal' },
        { coverage: quote.pdfCoverage, type: 'pdf' },
        { coverage: quote.insuranceServiceProviderCoverage, type: 'insurance' },
        { coverage: quote.initialCoverage, type: 'initial' }
      ].filter(item => item.coverage !== null);

      if (allCoverages.length > 0) {
        const firstCoverage = allCoverages[0].coverage;
        guarantees = convertCoverageToGuarantees(firstCoverage);
      }

      return {
        ...quote,
        premiums: formattedPremiums,
        company: company?.name || `Sigorta Şirketi #${quote.insuranceCompanyId}`,
        logo: company?.logo || `https://storage.dogasigorta.com/app-1/insurup-b2c-company/${quote.insuranceCompanyId}.png`,
        selectedInstallmentNumber: initialSelectedInstallment,
        insuranceCompanyGuarantees: guarantees,
      };
    });
  };

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

      const companyData = await rawCompanyResponse.json();
      return companyData;
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

        const allowedProductIds = agencyConfig.homepage.partners.companies.flatMap(c => c.products.kasko || []);

        const filteredQuotes = processedQuotes.filter(quote =>
          quote.state === 'ACTIVE' && allowedProductIds.includes(quote.productId)
        );

        setQuotes((prevQuotes) => {
          return filteredQuotes.map((newQuote) => {
            // First check if we have a saved preference in ref
            const savedInstallment = selectedInstallmentsRef.current[newQuote.id];
            if (savedInstallment) {
              return {
                ...newQuote,
                selectedInstallmentNumber: savedInstallment,
              };
            }

            // Fallback to existing quote state (though ref should cover it)
            const existingQuote = prevQuotes.find((q) => q.id === newQuote.id);
            if (existingQuote) {
              return {
                ...newQuote,
                selectedInstallmentNumber: existingQuote.selectedInstallmentNumber,
              };
            }
            return newQuote;
          });
        });

        // Progress calculation - 3 dakika (180000ms) boyunca 1-2-3-4 şeklinde artacak
        const elapsedTime = Date.now() - startTime;
        const calculatedProgress = Math.min(Math.floor((elapsedTime / 180000) * 100), 99);
        setProgress(calculatedProgress);

        const relevantQuotes = processedQuotes.filter(q => allowedProductIds.includes(q.productId));
        const allRelevantQuotesFinalized = relevantQuotes.length > 0 && relevantQuotes.every(
          (quote) => quote.state === 'FAILED' || quote.state === 'ACTIVE'
        );

        const timeoutReached = elapsedTime >= 180000; // 3 dakika (180000ms)

        // Config'de tanımlı üründen teklif geldi mi kontrol et
        const hasActiveQuote = filteredQuotes.length > 0;

        if (allRelevantQuotesFinalized || timeoutReached || hasActiveQuote) {
          const hasSuccessfulQuotes = filteredQuotes.length > 0;

          if (hasSuccessfulQuotes) {
            pushToDataLayer({
              event: "kasko_formsubmit",
              form_name: "kasko_teklif_basarili"
            });
          } else {
            pushToDataLayer({
              event: "kasko_formsubmit",
              form_name: "kasko_teklif_basarisiz"
            });
          }

          if (pollInterval) {
            clearInterval(pollInterval);
          }

          // Dinamik 3 saniyede %100'e çık ve sonra kapat
          setIsFinishing(true);
          
          const currentProgress = calculatedProgress;
          const remainingProgress = 100 - currentProgress;
          
          // Kalan progress'e göre dinamik süre hesapla
          // Minimum 1 saniye, maksimum 3 saniye
          const animationDuration = Math.max(1000, Math.min(3000, remainingProgress * 30));
          const steps = Math.ceil(animationDuration / 100); // 100ms aralıklarla
          const progressIncrement = remainingProgress / steps;
          
          let step = 0;
          const finishInterval = setInterval(() => {
            step++;
            const newProgress = Math.min(currentProgress + (progressIncrement * step), 100);
            setProgress(Math.floor(newProgress));
            
            if (step >= steps || newProgress >= 100) {
              clearInterval(finishInterval);
              setProgress(100);
              // 100'e ulaştıktan sonra 500ms bekle ve loading'i kapat
              setTimeout(() => {
                setIsLoading(false);
                setIsFinishing(false);
              }, 500);
            }
          }, 100);

          return;
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Teklifler alınırken bir hata oluştu.');
        setIsLoading(false);
        if (pollInterval) {
          clearInterval(pollInterval);
        }
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
        }, 5000);

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
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [proposalId, agencyConfig]);

  const handleInstallmentChange = (quoteId: string, installmentNumber: number) => {
    // Update ref immediately
    selectedInstallmentsRef.current[quoteId] = installmentNumber;

    setQuotes((prevQuotes) =>
      prevQuotes.map((quote) =>
        quote.id === quoteId
          ? { ...quote, selectedInstallmentNumber: installmentNumber }
          : quote
      )
    );
    setInstallmentsOpen({ ...installmentsOpen, [quoteId]: false });
  };

  const getSelectedPremium = (quote: ProcessedQuote): Premium | undefined => {
    return quote.premiums.find((p) => p.installmentNumber === quote.selectedInstallmentNumber);
  };

  // Kasko için önemli 3 teminatı bul
  const getMainCoverages = (quote: ProcessedQuote) => {
    const coverages = quote.insuranceCompanyGuarantees || [];
    const camKirilma = coverages.find(g => g.label === 'Cam Kırılma Muafiyeti');
    const yolYardim = coverages.find(g => g.label === 'Yol Yardım');
    const aracCalinmasi = coverages.find(g => g.label === 'Araç Çalınması');

    // UNDEFINED teminatları filtrele
    return [camKirilma, yolYardim, aracCalinmasi]
      .filter(Boolean)
      .filter(g => g!.valueText !== 'Tanımsız') as Guarantee[];
  };

  // Kasko için ek indirim/teminatları bul (dinamik)
  const getAdditionalCoverages = (quote: ProcessedQuote) => {
    const items: Array<{ label: string; rate?: number }> = [];

    // Meslek İndirimi - sadece true ise göster
    if (quote.hasVocationalDiscount) {
      items.push({ label: 'Meslek İndirimi' });
    }

    // Hasarsızlık İndirimi - true ise rate ile göster
    if (quote.hasUndamagedDiscount && (quote as any).hasUndamagedDiscountRate) {
      const rate = (quote as any).hasUndamagedDiscountRate;
      items.push({
        label: 'Hasarsızlık',
        rate: rate
      });
    }

    return items;
  };

  // 3. bölge gösterilmeli mi kontrol et
  const shouldShowAdditionalSection = (quote: ProcessedQuote): boolean => {
    return quote.hasVocationalDiscount || quote.hasUndamagedDiscount;
  };

  // Teminat dahil mi kontrol et
  const isCoverageIncluded = (guarantee: Guarantee): boolean => {
    return guarantee.valueText === 'Dahil' ||
      guarantee.valueText === 'Limitsiz' ||
      guarantee.valueText === 'Rayiç' ||
      guarantee.amount > 0;
  };

  const formatGuaranteeValue = (guarantee: Guarantee): string => {
    if (guarantee.valueText) {
      return guarantee.valueText;
    }
    if (guarantee.amount) {
      return (
        guarantee.amount.toLocaleString('tr-TR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + ' ₺'
      );
    }
    return '-';
  };

  const handlePurchase = (quoteId: string) => {
    console.log('🛒 handlePurchase called with quoteId:', quoteId);
    
    const selectedFullQuote = quotes.find(q => q.id === quoteId);
    
    if (selectedFullQuote && selectedFullQuote.state === 'ACTIVE') {
      const purchaseData = {
        id: quoteId,
        company: selectedFullQuote.company,
        coverage: selectedFullQuote.coverage,
        features: selectedFullQuote.features,
        premiums: selectedFullQuote.premiums,
        selectedInstallmentNumber: selectedFullQuote.selectedInstallmentNumber,
        insuranceCompanyId: selectedFullQuote.insuranceCompanyId,
        productId: selectedFullQuote.productId,
        proposalProductId: quoteId,
        proposalId: proposalId,
      };

      // LocalStorage'a kaydet (PurchaseStepNew için gerekli)
      localStorage.setItem('selectedQuoteForPurchase', JSON.stringify(purchaseData));
      localStorage.setItem('currentProposalId', proposalId);
      localStorage.setItem('proposalIdForKasko', proposalId || '');
      localStorage.setItem('selectedProductIdForKasko', quoteId);

      console.log('✅ Purchase data saved to localStorage:', purchaseData);

      // DataLayer push
      pushToDataLayer({
        event: "kasko_purchase_click",
        quote_id: quoteId,
        company: selectedFullQuote.company,
        price: selectedFullQuote.premiums.find(p => p.installmentNumber === selectedFullQuote.selectedInstallmentNumber)?.grossPremium
      });

      // onPurchaseClick callback varsa çağır (aynı sayfada step değişimi için)
      if (onPurchaseClick) {
        console.log('✅ Calling onPurchaseClick callback');
        onPurchaseClick(quoteId);
      } else {
        console.log('⚠️ No onPurchaseClick callback, redirecting to new page');
        // Fallback - yeni sayfaya yönlendir
        window.location.href = `/kasko/purchase/${proposalId}`;
      }
    } else {
      console.error('❌ Quote not found or not active:', quoteId);
    }
  };

  const handleOpenModal = (quote: ProcessedQuote) => {
    setSelectedQuoteForModal(quote);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuoteForModal(null);
  };

  const handleOpenComparisonModal = () => {
    setIsComparisonModalOpen(true);
  };

  const handleCloseComparisonModal = () => {
    setIsComparisonModalOpen(false);
  };

  const handleViewDocument = async (proposalIdParam: string, productIdParam: string) => {
    if (!accessToken) return;
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.PROPOSAL_PRODUCT_DOCUMENT(proposalIdParam, productIdParam), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Döküman görüntülenirken bir hata oluştu');
      }

      const data = await response.json();
      if (data.url) {
        const pdfResponse = await fetch(data.url);
        const blob = await pdfResponse.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');

        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 1000);
      }
    } catch (error) {
      console.error('Document view error:', error);
    }
  };

  // Render loading state (inline, step korunur)
  if (isLoading) {
    return (
      <>
        <div className="product-page-flow-container">
          {/* Stepper - Her zaman görünür */}
          <div className="pp-stepper">
            <div className="pp-step completed">
              <div className="pp-step-visual">
                <span>1</span>
              </div>
              <div className="pp-step-label">
                <span>Kişisel</span>
                <span>Bilgiler</span>
              </div>
            </div>

            <div className="pp-step completed">
              <div className="pp-step-visual">
                <span>2</span>
              </div>
              <div className="pp-step-label">
                <span>Araç</span>
                <span>Bilgileri</span>
              </div>
            </div>

            <div className="pp-step active">
              <div className="pp-step-visual">
                <span>3</span>
              </div>
              <div className="pp-step-label">
                <span>Teklif</span>
                <span>Karşılaştırma</span>
              </div>
            </div>

            <div className="pp-step">
              <div className="pp-step-visual">
                <span>4</span>
              </div>
              <div className="pp-step-label">
                <span>Ödeme</span>
              </div>
            </div>
          </div>

          <div className="product-page-form pp-form-wide">
            <QuoteLoadingScreen
              title="Kasko Sigortası Teklifleri"
              subtitle="Size en uygun Kasko Sigortası teklifini seçip hemen satın alabilirsiniz."
              description="Anlaşmalı şirketlerimizden size özel teklifler alınıyor..."
              progress={progress}
            />
          </div>
        </div>
      </>
    );
  }

  // Render error state (inline, step korunur)
  if (error || quotes.length === 0) {
    return (
      <>
        <div className="product-page-flow-container">
          {/* Stepper */}
          <div className="pp-stepper">
            <div className="pp-step completed">
              <div className="pp-step-visual">
                <span>1</span>
              </div>
              <div className="pp-step-label">
                <span>Kişisel</span>
                <span>Bilgiler</span>
              </div>
            </div>

            <div className="pp-step completed">
              <div className="pp-step-visual">
                <span>2</span>
              </div>
              <div className="pp-step-label">
                <span>Araç</span>
                <span>Bilgileri</span>
              </div>
            </div>

            <div className="pp-step active">
              <div className="pp-step-visual">
                <span>3</span>
              </div>
              <div className="pp-step-label">
                <span>Teklif</span>
                <span>Karşılaştırma</span>
              </div>
            </div>

            <div className="pp-step">
              <div className="pp-step-visual">
                <span>4</span>
              </div>
              <div className="pp-step-label">
                <span>Ödeme</span>
              </div>
            </div>
          </div>

          <div className="product-page-form pp-form-wide">
            <div className="pp-card">
              <div className="pp-quote-error-container">
                <div className="pp-quote-error-content">  
                <span className='pp-card-title'>Kasko Sigortası Teklifleri</span> 
                </div>
                <img src="/images/product-detail/error-x.svg" alt="Kasko Sigortası Teklifleri" className="pp-error-image" />
                <span className="pp-error-card-title">Ups! Uygun teklif bulunamadı</span> 
                <p className="pp-error-message-card-desc">
                  Araç bilgilerinize göre uygun teklif bulunamadı. Bilgilerinizi kontrol edip tekrar deneyebilirsiniz.
                </p>
                {onBack && (
                  <button className="pp-btn-submit" onClick={onBack}>
                    Araç Bilgilerini Güncelle
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Main render
  return (
    <>
      <div className="product-page-flow-container">
        {/* Stepper - Her zaman görünür */}
        <div className="pp-stepper">
          <div className="pp-step completed">
            <div className="pp-step-visual">
              <span>1</span>
            </div>
            <div className="pp-step-label">
              <span>Kişisel</span>
              <span>Bilgiler</span>
            </div>
          </div>

          <div className="pp-step completed">
            <div className="pp-step-visual">
              <span>2</span>
            </div>
            <div className="pp-step-label">
              <span>Araç</span>
              <span>Bilgileri</span>
            </div>
          </div>

          <div className="pp-step active">
            <div className="pp-step-visual">
              <span>3</span>
            </div>
            <div className="pp-step-label">
              <span>Teklif</span>
              <span>Karşılaştırma</span>
            </div>
          </div>

          <div className="pp-step">
            <div className="pp-step-visual">
              <span>4</span>
            </div>
            <div className="pp-step-label">
              <span>Ödeme</span>
            </div>
          </div>
        </div>

        <div className="product-page-form pp-form-wide">
          <div className="pp-card">
            {/* Title */}
            <h1 className="pp-quote-title">Kasko Sigortası Teklifleri</h1>

            {/* Top Controls */}
            <div className="pp-quote-controls">
              <button className="pp-btn-compare" onClick={handleOpenComparisonModal}>
                <svg className="pp-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Teklifleri Karşılaştır</span>
              </button>

              <div className="pp-quote-filters">
                {/* Filter Dropdown */}
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
                      {Array.from(new Set(quotes.map(q => q.coverageGroupName).filter(Boolean))).map(groupName => (
                        <button key={groupName} onClick={() => { setSelectedFilter(groupName!); setFilterOpen(false); }}>
                          {groupName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="pp-dropdown-wrapper">
                  <button
                    onClick={() => {
                      setSortOpen(!sortOpen);
                      setFilterOpen(false);
                    }}
                    className="pp-filter-button pp-filter-price"
                  >
                    <span>{selectedSort}</span>
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

            {/* Insurance Offers */}
            <div className="pp-quotes-list">
              {quotes
                .filter(quote => selectedFilter === 'Filtrele' || selectedFilter === 'Tümü' || quote.coverageGroupName === selectedFilter)
                .sort((a, b) => {
                  if (selectedSort === 'Fiyata Göre Sırala') return 0;

                  const priceA = getSelectedPremium(a)?.grossPremium || 0;
                  const priceB = getSelectedPremium(b)?.grossPremium || 0;

                  // Calculate installment price if needed
                  const finalPriceA = a.selectedInstallmentNumber > 1 ? priceA / a.selectedInstallmentNumber : priceA;
                  const finalPriceB = b.selectedInstallmentNumber > 1 ? priceB / b.selectedInstallmentNumber : priceB;

                  if (selectedSort === 'Fiyata Göre Artan') {
                    return priceA - priceB; // Compare total gross premium
                  } else {
                    return priceB - priceA;
                  }
                })
                .map((quote) => {
                  const currentPremium = getSelectedPremium(quote);
                  const isExpanded = expandedQuoteId === quote.id;
                  const isInstallmentsOpen = installmentsOpen[quote.id] || false;

                  const mainCoverages = getMainCoverages(quote);
                  const additionalCoverages = getAdditionalCoverages(quote);

                  return (
                    <div key={quote.id} className="pp-quote-card">
                      {/* Tier Badge - Quote Card'ın direkt içinde */}
                      {quote.coverageGroupName && (
                        <div className="pp-quote-tier-badge">
                          <span>{quote.coverageGroupName}</span>
                        </div>
                      )}

                      <div className="pp-quote-main">
                        {/* BÖLÜM 1: Company Logo */}
                        <div className="pp-quote-section pp-quote-logo-section">
                          <div className="pp-quote-logo-container">
                            <img
                              alt={quote.company}
                              className="pp-quote-logo"
                              src={quote.logo}
                            />
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="pp-quote-divider" />

                        {/* BÖLÜM 2: Ana 3 Teminat (Cam Kırılması, Yol Yardım, Araç Çalınması) */}
                        <div className="pp-quote-section pp-quote-main-coverages">
                          {mainCoverages.map((guarantee, index) => (
                            <div key={index} className="pp-coverage-row">
                              <span className="pp-coverage-label">
                                {guarantee.label}
                                <CoverageTooltip branch="kasko" coverageKey={guarantee.label || ''} />
                              </span>
                              <img
                                src={isCoverageIncluded(guarantee)
                                  ? "/images/product-detail/teminat-tick.svg"
                                  : "/images/product-detail/teminat-x.svg"
                                }
                                alt={isCoverageIncluded(guarantee) ? "Dahil" : "Dahil Değil"}
                                className="pp-coverage-icon-status"
                              />
                            </div>
                          ))}
                        </div>

                        {/* BÖLÜM 3: İndirimler (Dinamik - sadece varsa göster) */}
                        {/* BÖLÜM 3: İndirimler (Dinamik - sadece varsa göster) */}
                        {/* Divider - Sadece içerik varsa göster */}
                        {shouldShowAdditionalSection(quote) && (
                          <div className="pp-quote-divider" />
                        )}

                        <div className="pp-quote-section pp-quote-additional-coverages">
                          {additionalCoverages.map((item, index) => (
                            <div key={index} className="pp-coverage-row">
                              <span className="pp-coverage-label">
                                {item.rate !== undefined ? (
                                  <>
                                    <strong>%{item.rate}</strong> {item.label}
                                  </>
                                ) : (
                                  item.label
                                )}
                              </span>
                              <img
                                src="/images/product-detail/teminat-tick-dark.svg"
                                alt="Dahil"
                                className="pp-coverage-icon-dark"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Divider */}
                        <div className="pp-quote-divider" />

                        {/* BÖLÜM 4: Fiyat ve Taksit */}
                        <div className="pp-quote-section pp-quote-price-section">
                          <p className="pp-quote-price">
                            {currentPremium?.formattedGrossPremium} ₺
                          </p>

                          {/* Installments Dropdown */}
                          <div className="pp-dropdown-wrapper">
                            <button
                              onClick={() => setInstallmentsOpen({ ...installmentsOpen, [quote.id]: !isInstallmentsOpen })}
                              className="pp-installments-button"
                            >
                              <span>
                                {quote.selectedInstallmentNumber === 1
                                  ? 'Peşin Ödeme'
                                  : `${quote.selectedInstallmentNumber} Taksit`}
                              </span>
                              <svg className="pp-chevron-small" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {isInstallmentsOpen && (
                              <div className="pp-dropdown-menu pp-installments-menu">
                                {quote.premiums.map((premium) => (
                                  <button
                                    key={premium.installmentNumber}
                                    onClick={() => handleInstallmentChange(quote.id, premium.installmentNumber)}
                                  >
                                    {premium.installmentNumber === 1 ? (
                                      'Peşin Ödeme'
                                    ) : (
                                      `${premium.installmentNumber} x ${(premium.grossPremium / premium.installmentNumber).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL`
                                    )}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="pp-quote-divider" />

                        {/* BÖLÜM 5: Satın Al Butonu */}
                        <div className="pp-quote-section pp-quote-buy-section">
                          <button
                            className="pp-btn-buy"
                            onClick={() => handlePurchase(quote.id)}
                          >
                            Satın Al
                          </button>
                        </div>
                      </div>

                      {/* Details Toggle */}
                      <div className="pp-quote-details-toggle">
                        <button
                          onClick={() => setExpandedQuoteId(isExpanded ? null : quote.id)}
                          className="pp-details-toggle-button"
                        >
                          <span>{isExpanded ? 'Daha Az' : 'Kampanyalar & Teklif Detayları'}</span>
                          <svg
                            className={`pp-chevron-small ${isExpanded ? 'pp-chevron-rotated' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isExpanded && (
                          <div className="pp-quote-details-content">
                            {/* Tab Buttons */}
                            <div className="pp-details-tabs">
                              <button
                                className={`pp-details-tab ${(activeTab[quote.id] || 'campaigns') === 'campaigns' ? 'pp-tab-active' : ''}`}
                                onClick={() => setActiveTab({ ...activeTab, [quote.id]: 'campaigns' })}
                              >
                                Kampanyalar
                              </button>
                              <button
                                className={`pp-details-tab ${(activeTab[quote.id] || 'campaigns') === 'coverages' ? 'pp-tab-active' : ''}`}
                                onClick={() => setActiveTab({ ...activeTab, [quote.id]: 'coverages' })}
                              >
                                Teminatlar
                              </button>
                            </div>

                            {/* Tab Content */}
                            {(activeTab[quote.id] || 'campaigns') === 'campaigns' ? (
                              <div className="pp-tab-content">
                                <p className="pp-no-campaigns">Kampanya bulunmamaktadır.</p>
                              </div>
                            ) : (
                              <div className="pp-tab-content">
                                <div className="pp-coverages-layout">
                                  {/* Sol ve Orta Bölge: Teminatlar */}
                                  <div className="pp-coverages-grid">
                                    {quote.insuranceCompanyGuarantees
                                      ?.filter((g) => formatGuaranteeValue(g) !== 'Belirsiz')
                                      .map((guarantee) => {
                                        const displayValue = formatGuaranteeValue(guarantee);
                                        const showTick = displayValue === 'Dahil' || displayValue === 'Limitsiz' || displayValue === 'Rayiç';
                                        const showX = displayValue === 'Dahil Değil' || displayValue === '-';

                                        return (
                                          <div key={guarantee.insuranceGuaranteeId} className="pp-coverage-item">
                                            <span className="pp-coverage-item-label">
                                              {guarantee.label}
                                              <CoverageTooltip branch="kasko" coverageKey={guarantee.label || ''} />
                                            </span>
                                            <div className="pp-coverage-item-value">
                                              {showTick && !['Limitsiz', 'Rayiç'].includes(displayValue) && (
                                                <img
                                                  src="/images/product-detail/teminat-tick.svg"
                                                  alt="Dahil"
                                                  className="pp-coverage-item-icon"
                                                />
                                              )}
                                              {showX && (
                                                <img
                                                  src="/images/product-detail/teminat-x.svg"
                                                  alt="Dahil Değil"
                                                  className="pp-coverage-item-icon"
                                                />
                                              )}
                                              {!showX && (displayValue !== 'Dahil' || ['Limitsiz', 'Rayiç'].includes(displayValue)) && (
                                                <span className="pp-coverage-item-price">{displayValue}</span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}

                                  </div>

                                  {/* Sağ Bölge: Butonlar */}
                                  <div className="pp-coverages-actions">
                                    <button
                                      className="pp-coverage-action-btn pp-btn-details"
                                      onClick={() => handleOpenModal(quote)}
                                    >
                                      <i className="icon-info-button pp-btn-icon"></i>
                                      <span>Teminat Detayları</span>
                                    </button>
                                    <button
                                      className="pp-coverage-action-btn pp-btn-document"
                                      onClick={() => handleViewDocument(proposalId, quote.id)}
                                    >
                                      <i className="icon-teklif-button pp-btn-icon"></i>
                                      <span>Teklif Belgesi</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Teminat Detayları Modal */}
      <CoverageDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        quote={quotes.find(q => q.id === selectedQuoteForModal?.id) || selectedQuoteForModal}
        onPurchase={handlePurchase}
        onInstallmentChange={handleInstallmentChange}
        agencyPhoneNumber={agencyConfig.agency?.contact?.phone?.primary || '0850 404 04 04'}
      />
      {/* Comparison Modal */}
      <QuoteComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={handleCloseComparisonModal}
        allQuotes={quotes}
        onPurchase={handlePurchase}
      />
    </>
  );
};

export default KaskoProductQuote;

