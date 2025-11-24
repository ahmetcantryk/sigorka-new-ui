"use client";
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import YGButton from '../common/YGButton';
import YGSelect from '../common/YGSelect';
import YGLoadingProgress from '../common/YGLoadingProgress';
import YGErrorState from '../common/YGErrorState';
import YGGuaranteeModal from '../common/YGGuaranteeModal';
import { Tooltip, Typography } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// DataLayer helper functions
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

interface YGQuoteComparisonStepProps {
  onNext: () => void;
  onBack: () => void;
}

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

type CoverageValueType = 'DECIMAL' | 'PERCENT' | 'UNDEFINED' | 'INCLUDED';

interface CoverageValue {
  $type: CoverageValueType;
  value?: number;
}

type CoverageFieldValue = CoverageValue | string | undefined | null;

interface KonutCoverageBase {
  $type?: string;
  productBranch?: string;
  sigortaKapsami?: string | null;
}

type KonutCoverage = KonutCoverageBase & {
  [key: string]: CoverageFieldValue;
};

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
  initialCoverage: KonutCoverage | null;
  insuranceServiceProviderCoverage: KonutCoverage | null;
  pdfCoverage: KonutCoverage | null;
  optimalCoverage?: KonutCoverage | null;
  state: 'WAITING' | 'ACTIVE' | 'FAILED';
  needsInvestigationByCompany: boolean;
  hasVocationalDiscount: boolean;
  hasUndamagedDiscount: boolean;
  revised: boolean;
  errorMessage: string | null;
  policyId: string | null;
  coverageGroupName?: string;

  // Processed fields
  company?: string;
  price?: number;
  coverage?: number;
  features?: string[];
  logo?: string;
  insuranceCompanyGuarantees?: Guarantee[];
  proposalId?: string; // Hangi proposal'dan geldiğini belirtmek için
}

interface ProcessedQuote extends Quote {
  selectedInstallmentNumber: number;
  hasCoverageDetails: boolean;
}

const guaranteeLabels: Record<string, string> = {
  binaBedeli: 'Bina Bedeli',
  esyaBedeli: 'Eşya Bedeli',
  elektronikCihazBedeli: 'Elektronik Cihaz Bedeli',
  izolasyonBedeli: 'İzolasyon Bedeli',
  camBedeli: 'Cam Bedeli',
  enflasyon: 'Enflasyon Oranı',
  sigortaKapsami: 'Sigorta Kapsamı',
  binaYanginYildirimInfilak: 'Bina Yangın Yıldırım İnfilak',
  yanginMaliMesuliyet: 'Yangın Mali Mesuliyet',
  firtina: 'Fırtına',
  karAgirligi: 'Kar Ağırlığı',
  duman: 'Duman',
  yerKaymasi: 'Yer Kayması',
  dolu: 'Dolu',
  dahiliSu: 'Dahili Su',
  karaVeHavaTasitlariCarpmasi: 'Kara ve Hava Taşıtları Çarpması',
  enkazKaldirmaMasraflari: 'Enkaz Kaldırma Masrafları',
  ferdiKaza: 'Ferdi Kaza',
  hukuksalKoruma: 'Hukuksal Koruma',
  selSuBaskini: 'Sel Su Baskını',
  camKirilmasi: 'Cam Kırılması',
  hirsizlik: 'Hırsızlık',
  kiraKaybi: 'Kira Kaybı',
  ikametgahDegisikligiMasraflari: 'İkametgâh Değişikliği Masrafları',
  enflasyonKlozu: 'Enflasyon Klozu',
  elektronikCihaz: 'Elektronik Cihaz',
  izolasyon: 'İzolasyon',
  tesisatVeElektrikArizalari: 'Tesisat ve Elektrik Arızaları',
  cilingirHizmetleri: 'Çilingir Hizmetleri',
  kombiVeKlimaBakimi: 'Kombi ve Klima Bakımı'
};

const formatLabel = (key: string): string => {
  if (guaranteeLabels[key]) return guaranteeLabels[key];

  const normalized = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .trim()
      .toLocaleLowerCase('tr-TR');

  return normalized.charAt(0).toLocaleUpperCase('tr-TR') + normalized.slice(1);
};

const enumValueSpecialCases: Record<string, string> = {
  'sadece_esya': 'Sadece Eşya',
};

const enumWordSpecialCases: Record<string, string> = {
  esya: 'Eşya',
};

const formatEnumValue = (value: string): string => {
  const normalizedValue = value.toLocaleLowerCase('tr-TR');

  if (enumValueSpecialCases[normalizedValue]) {
    return enumValueSpecialCases[normalizedValue];
  }

  return normalizedValue
      .split('_')
      .map((word) => {
        const lowerWord = word.toLocaleLowerCase('tr-TR');
        if (enumWordSpecialCases[lowerWord]) {
          return enumWordSpecialCases[lowerWord];
        }
        return lowerWord.charAt(0).toLocaleUpperCase('tr-TR') + lowerWord.slice(1);
      })
      .join(' ');
};

const isCoverageValue = (value: CoverageFieldValue): value is CoverageValue => {
  return typeof value === 'object' && value !== null && '$type' in value;
};

const normalizeCoverageGroupName = (name?: string | null): string | undefined => {
  if (!name) return undefined;
  const normalized = name.toLocaleLowerCase('tr-TR');

  switch (normalized) {
    case 'bronz':
      return 'Gümüş';
    case 'gümüş':
    case 'gumus':
      return 'Altın';
    case 'altın':
    case 'altin':
      return 'Platin';
    case 'platin':
      return 'Platin';
    default:
      return name;
  }
};

const convertKonutCoverageToGuarantees = (coverage: KonutCoverage | null): Guarantee[] => {
  if (!coverage) return [];

  const guarantees: Guarantee[] = [];
  let guaranteeId = 1;

  const excludedKeys = new Set([
    'enflasyon',
    'sigortaKapsami',
    'binaYanginYildirimInfilak'
  ]);

  Object.entries(coverage).forEach(([key, value]) => {
    if (key === '$type' || key === 'productBranch') return;
    if (excludedKeys.has(key)) return;

    const label = formatLabel(key);

    if (typeof value === 'object' && value !== null && '$type' in value) {
      const coverageValue = value as CoverageValue;

      if (coverageValue.$type === 'DECIMAL' && coverageValue.value !== undefined) {
        guarantees.push({
          insuranceGuaranteeId: guaranteeId.toString(),
          label,
          valueText: coverageValue.value.toLocaleString('tr-TR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }) + ' ₺',
          amount: coverageValue.value
        });
        guaranteeId++;
      } else if (coverageValue.$type === 'PERCENT' && coverageValue.value !== undefined) {
        guarantees.push({
          insuranceGuaranteeId: guaranteeId.toString(),
          label,
          valueText: `%${coverageValue.value}`,
          amount: 0
        });
        guaranteeId++;
      } else if (coverageValue.$type === 'INCLUDED') {
        guarantees.push({
          insuranceGuaranteeId: guaranteeId.toString(),
          label,
          valueText: 'Dahil',
          amount: 0
        });
        guaranteeId++;
      }
    } else if (typeof value === 'string' && value.trim().length > 0) {
      guarantees.push({
        insuranceGuaranteeId: guaranteeId.toString(),
        label,
        valueText: formatEnumValue(value),
        amount: 0
      });
      guaranteeId++;
    }
  });

  return guarantees.sort((a, b) => a.label.localeCompare(b.label, 'tr-TR'));
};

type LegacyCoverageField =
    | 'binaBedeli'
    | 'esyaBedeli'
    | 'elektronikCihazBedeli'
    | 'izolasyonBedeli'
    | 'camBedeli'
    | 'enflasyon';

const legacyCoverageFields: LegacyCoverageField[] = [
  'binaBedeli',
  'esyaBedeli',
  'elektronikCihazBedeli',
  'izolasyonBedeli',
  'camBedeli',
  'enflasyon'
];

export default function YGQuoteComparisonStep({ onNext, onBack }: YGQuoteComparisonStepProps) {
  const { accessToken } = useAuthStore();
  const [quotes, setQuotes] = useState<ProcessedQuote[]>([]);
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'price' | 'company'>('price');
  const [agencyConfig, setAgencyConfig] = useState<any>(null);
  const progressRef = useRef(0);
  const [selectedQuoteForModal, setSelectedQuoteForModal] = useState<ProcessedQuote | null>(null);
  const [isGuaranteeModalOpen, setIsGuaranteeModalOpen] = useState(false);

  useEffect(() => {
    // Fetch agency config
    const fetchAgencyConfig = async () => {
      try {
        const response = await fetch('/defaultAgencyConfig.json');
        const config = await response.json();
        setAgencyConfig(config);
      } catch (err) {
        console.error('Failed to load agency config:', err);
      }
    };
    fetchAgencyConfig();
  }, []);

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

      const sortedPremiums = [...uniquePremiums].sort(
          (a, b) => a.installmentNumber - b.installmentNumber
      );

      const formattedPremiums = sortedPremiums.map((premium) => ({
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

      let mergedCoverage: KonutCoverage | null = quote.optimalCoverage ?? null;

      if (!mergedCoverage && (quote.pdfCoverage || quote.insuranceServiceProviderCoverage || quote.initialCoverage)) {
        const getBestValue = (field: LegacyCoverageField): CoverageValue => {
          const pickValue = (source?: KonutCoverage | null): CoverageValue | null => {
            const candidate = source?.[field];
            if (isCoverageValue(candidate) && candidate.$type !== 'UNDEFINED') {
              return candidate;
            }
            return null;
          };

          return pickValue(quote.pdfCoverage) ||
              pickValue(quote.insuranceServiceProviderCoverage) ||
              pickValue(quote.initialCoverage) ||
              { $type: 'UNDEFINED' };
        };

        const fallbackCoverage: KonutCoverage = {
          $type: 'konut',
          productBranch: quote.pdfCoverage?.productBranch || quote.insuranceServiceProviderCoverage?.productBranch || quote.initialCoverage?.productBranch || ''
        };

        legacyCoverageFields.forEach((field) => {
          fallbackCoverage[field] = getBestValue(field) as CoverageValue;
        });

        mergedCoverage = fallbackCoverage;
      }

      const guarantees = convertKonutCoverageToGuarantees(mergedCoverage);

      const mainCoverage = guarantees.find(g =>
          g.label.includes('Bina') || g.insuranceGuaranteeId === '1'
      );
      const coverage = mainCoverage?.amount ?? 0;

      const features = guarantees
          .filter((g) => g.insuranceGuaranteeId !== '1' && g.label !== 'Bina Bedeli')
          .map((g) => g.label);

      const normalizedCoverageGroupName = normalizeCoverageGroupName(quote.coverageGroupName);

      return {
        ...quote,
        premiums: formattedPremiums,
        company: company?.name || `Sigorta Şirketi #${quote.insuranceCompanyId}`,
        coverage,
        features,
        logo: company?.logo || `https://storage.dogasigorta.com/app-1/insurup-b2c-company/${quote.insuranceCompanyId}.png`,
        selectedInstallmentNumber: initialSelectedInstallment,
        insuranceCompanyGuarantees: guarantees,
        coverageGroupName: normalizedCoverageGroupName,
        hasCoverageDetails: Boolean(mergedCoverage),
      };
    });
  };

  useEffect(() => {
    if (!agencyConfig) return;

    let isPollingActive = true;
    let pollInterval: NodeJS.Timeout | null = null;
    let progressInterval: NodeJS.Timeout | null = null;
    const startTime = Date.now();
    const LOADING_DURATION = 60000; // 60 saniye

    // Multiple proposal ID'lerini localStorage'dan al
    const proposalIdsJson = localStorage.getItem('yuvamGuvendeProposalIds');
    let proposalIdsToUse: string[] = [];

    if (proposalIdsJson) {
      try {
        proposalIdsToUse = JSON.parse(proposalIdsJson);
      } catch (e) {
        console.error('Proposal ID\'leri parse edilemedi:', e);
        // Fallback: Eski key'i kontrol et (geriye dönük uyumluluk)
        const oldProposalId = localStorage.getItem('yuvamGuvendeProposalId');
        if (oldProposalId) {
          proposalIdsToUse = [oldProposalId];
        }
      }
    } else {
      // Fallback: Eski key'i kontrol et
      const oldProposalId = localStorage.getItem('yuvamGuvendeProposalId');
      if (oldProposalId) {
        proposalIdsToUse = [oldProposalId];
      }
    }

    // Config'den yuvamguvende product ID'lerini al
    const allowedProductIds = agencyConfig.homepage.partners.companies.flatMap((company: any) =>
        company.products.yuvamguvende || []
    );

    // Progress loading başlat (0'dan 100'e 1 dakika)
    const startProgressLoading = () => {
      setLoadingProgress(0);
      progressRef.current = 0;
      const progressStep = 100 / (LOADING_DURATION / 100); // 100ms'de bir güncelle

      progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          const newProgress = Math.min(prev + progressStep, 99); // 100'e ulaşmasın, polling bitince manuel 100
          progressRef.current = newProgress;
          return newProgress;
        });
      }, 100);
    };

    const fetchCompanies = async () => {
      if (!accessToken) {
        throw new Error('Yetkilendirme anahtarı bulunamadı.');
      }

      const rawCompanyResponse = await fetchWithAuth(API_ENDPOINTS.COMPANIES, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!rawCompanyResponse.ok) {
        const errorText = await rawCompanyResponse.text();
        throw new Error(`Şirket bilgileri alınamadı: ${rawCompanyResponse.status} ${errorText}`);
      }

      const companyData = await rawCompanyResponse.json();
      if (!Array.isArray(companyData)) {
        throw new Error('Şirket bilgileri format hatalı.');
      }

      return companyData;
    };

    const fetchQuotes = async (currentCompanies: InsuranceCompany[]) => {
      if (!proposalIdsToUse || proposalIdsToUse.length === 0 || !accessToken) return;

      try {
        const proposalPromises = proposalIdsToUse.map(async (proposalId: string) => {
          try {
            const rawProposalResponse = await fetchWithAuth(
                API_ENDPOINTS.PROPOSALS_ID(proposalId),
                {
                  method: 'GET',
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: 'application/json',
                  },
                }
            );

            if (!rawProposalResponse.ok) {
              console.warn(`Proposal bilgileri alınamadı (proposalId: ${proposalId}): ${rawProposalResponse.status}`);
              return null;
            }

            const proposalData = await rawProposalResponse.json();
            const productsData = proposalData.products as Quote[];

            if (!Array.isArray(productsData)) {
              console.warn(`Ürünler API yanıtı beklenen formatta değil (proposalId: ${proposalId})`);
              return null;
            }

            const productsWithProposalId = productsData.map((quote: Quote) => ({
              ...quote,
              proposalId: proposalId,
            }));

            return productsWithProposalId;
          } catch (err) {
            console.warn(`Proposal çekme hatası (proposalId: ${proposalId}):`, err);
            return null;
          }
        });

        const allProductsArrays = await Promise.all(proposalPromises);

        const allProducts: Quote[] = [];
        for (const productsArray of allProductsArrays) {
          if (productsArray !== null && Array.isArray(productsArray)) {
            allProducts.push(...productsArray);
          }
        }

        if (allProducts.length === 0) {
          throw new Error('Hiçbir teklif bulunamadı.');
        }

        const processedQuotes = processQuotesData(allProducts, currentCompanies);

        // Config'deki product ID'lere göre filtrele
        const filteredQuotes = processedQuotes.filter(quote =>
            quote.state === 'ACTIVE' && allowedProductIds.includes(quote.productId)
        );

        setQuotes(filteredQuotes);

        // Polling kontrolü için relevant quotes (tüm proposal'lardan)
        const relevantQuotes = processedQuotes.filter(q => allowedProductIds.includes(q.productId));

        // Tüm proposal'lardaki ilgili teklifler finalize oldu mu kontrol et
        const allRelevantQuotesFinalized = relevantQuotes.length > 0 && relevantQuotes.every(
            (quote) => quote.state === 'FAILED' || quote.state === 'ACTIVE'
        );

        const elapsedTime = Date.now() - startTime;
        const timeoutReached = elapsedTime >= 60000; // 1 dakika
        
        // Eğer hiç relevant quote yoksa ve 15 saniye geçtiyse, polling'i durdur
        const noQuotesTimeout = relevantQuotes.length === 0 && elapsedTime >= 15000; // 15 saniye
        
        // Eğer tüm teklifler FAILED ise de durdur
        const allFailed = relevantQuotes.length > 0 && relevantQuotes.every(quote => quote.state === 'FAILED');

        if (allRelevantQuotesFinalized || timeoutReached || noQuotesTimeout || allFailed) {
          const hasSuccessfulQuotes = filteredQuotes.length > 0;

          // Analytics
          if (hasSuccessfulQuotes) {
            pushToDataLayer({
              event: "konut_formsubmit",
              form_name: "konut_teklif_basarili",
            });
          } else {
            pushToDataLayer({
              event: "konut_formsubmit",
              form_name: "konut_teklif_basarisiz",
            });
          }

          // Progress loading'i durdur ve smooth 2 saniyede 100'e çık
          if (progressInterval) {
            clearInterval(progressInterval);
          }

          // Smooth animasyon ile 100'e çık
          const animateTo100 = () => {
            const currentProgress = progressRef.current;
            const targetProgress = 100;
            const duration = 2000; // 2 saniye
            const startTime = Date.now();

            const animate = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const newProgress = currentProgress + (targetProgress - currentProgress) * progress;
              setLoadingProgress(newProgress);

              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                // Animasyon bittiğinde loading'i kapat
                setTimeout(() => {
                  if (pollInterval) {
                    clearInterval(pollInterval);
                  }
                  setIsLoading(false);
                }, 300);
              }
            };

            animate();
          };

          animateTo100();
          return;
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Teklifler alınırken bir hata oluştu.');
        setQuotes([]); // Hata durumunda quotes'u boşalt

        if (progressInterval) {
          clearInterval(progressInterval);
        }

        // Smooth animasyon ile 100'e çık
        const animateTo100 = () => {
          const currentProgress = progressRef.current;
          const targetProgress = 100;
          const duration = 2000; // 2 saniye
          const startTime = Date.now();

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const newProgress = currentProgress + (targetProgress - currentProgress) * progress;
            setLoadingProgress(newProgress);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setTimeout(() => {
                setIsLoading(false);
              }, 300);
            }
          };

          animate();
        };

        animateTo100();

        if (pollInterval) {
          clearInterval(pollInterval);
        }
      }
    };

    const startPolling = async () => {
      if (!proposalIdsToUse || proposalIdsToUse.length === 0) {
        setError('Teklif ID bulunamadı. Lütfen önceki adıma dönün.');
        setQuotes([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      startProgressLoading();

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

        if (progressInterval) {
          clearInterval(progressInterval);
        }

        // Smooth animasyon ile 100'e çık
        const animateTo100 = () => {
          const currentProgress = progressRef.current;
          const targetProgress = 100;
          const duration = 2000; // 2 saniye
          const startTime = Date.now();

          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const newProgress = currentProgress + (targetProgress - currentProgress) * progress;
            setLoadingProgress(newProgress);

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setTimeout(() => {
                setIsLoading(false);
              }, 300);
            }
          };

          animate();
        };

        animateTo100();
      }
    };

    startPolling();

    return () => {
      isPollingActive = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [accessToken, agencyConfig]);

  const handleInstallmentChange = (quoteId: string, installmentNumber: number) => {
    setQuotes((prevQuotes) =>
        prevQuotes.map((quote) =>
            quote.id === quoteId
                ? { ...quote, selectedInstallmentNumber: installmentNumber }
                : quote
        )
    );
  };

  const getSelectedPremium = (quote: ProcessedQuote | null): Premium | undefined => {
    if (!quote) return undefined;
    return quote.premiums.find((p) => p.installmentNumber === quote.selectedInstallmentNumber);
  };

  // Logo URL'sine göre max-height belirleme
  const getLogoMaxHeight = (logoUrl: string | undefined): number => {
    if (!logoUrl) return 40; // Varsayılan

    const url = logoUrl.toLowerCase();

    if (url.includes('hdi-katilim-sigorta')) {
      return 50;
    } else if (url.includes('bereket_sigorta_logo') || url.includes('bereket-sigorta')) {
      return 30;
    } else if (url.includes('turkiye-katilim-sigorta')) {
      return 60;
    }

    return 40; // Varsayılan
  };

  const sortQuotes = (quotes: ProcessedQuote[]): ProcessedQuote[] => {
    if (sortOption === 'price') {
      return [...quotes].sort((a, b) => {
        const aPremium = getSelectedPremium(a);
        const bPremium = getSelectedPremium(b);

        if (!aPremium || !bPremium) return 0;
        // Artan sıralama: en uygun fiyat üstte (Gümüş → Altın → Platin)
        return aPremium.grossPremium - bPremium.grossPremium;
      });
    } else {
      return [...quotes].sort((a, b) => {
        return (a.company || '').localeCompare(b.company || '');
      });
    }
  };

  // Fiyata göre kategori belirleme fonksiyonu
  const getQuoteCategory = (quotes: ProcessedQuote[], currentQuote: ProcessedQuote): string => {
    if (quotes.length < 3) {
      // Eğer 3'ten az teklif varsa, ilk teklife "Popüler" ver
      return quotes.indexOf(currentQuote) === 0 ? 'Popüler' : '';
    }

    // Azalan sıralama: En yüksek fiyat en üstte
    const sortedByPrice = [...quotes].sort((a, b) => {
      const aPremium = getSelectedPremium(a);
      const bPremium = getSelectedPremium(b);
      if (!aPremium || !bPremium) return 0;
      return bPremium.grossPremium - aPremium.grossPremium;
    });

    const index = sortedByPrice.indexOf(currentQuote);

    if (index === 0) {
      return 'Platin'; // En yüksek fiyat (en üstte)
    } else if (index === sortedByPrice.length - 1) {
      return 'Gümüş'; // En düşük fiyat (en altta)
    } else {
      return 'Altın'; // Orta fiyat
    }
  };

  const handlePurchase = (quoteId: string) => {
    const selectedFullQuote = quotes.find(q => q.id === quoteId);
    if (selectedFullQuote && selectedFullQuote.state === 'ACTIVE') {
      // Quote objesinden proposalId'yi al, yoksa fallback
      const proposalId = selectedFullQuote.proposalId || (() => {
        const proposalIdsJson = localStorage.getItem('yuvamGuvendeProposalIds');
        if (proposalIdsJson) {
          try {
            const proposalIds = JSON.parse(proposalIdsJson);
            return proposalIds[0] || null;
          } catch (e) {
            return localStorage.getItem('yuvamGuvendeProposalId');
          }
        }
        return localStorage.getItem('yuvamGuvendeProposalId');
      })();

      if (!proposalId) {
        setError("Proposal ID bulunamadı. Lütfen tekrar deneyin.");
        return;
      }

      const purchaseData = {
        ...selectedFullQuote,
        proposalId: proposalId,
        proposalProductId: selectedFullQuote.id,
        productId: selectedFullQuote.id
      };

      localStorage.setItem('selectedQuoteForPurchase', JSON.stringify(purchaseData));
      localStorage.setItem('selectedInstallmentForPurchase', selectedFullQuote.selectedInstallmentNumber.toString());
      onNext();
    } else {
      setError("Bu teklif şu anda satın alım için uygun değil veya aktif değil.");
    }
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
        const errorData = await response.json();
        throw new Error(errorData.errors?.[0] || 'Döküman görüntülenirken bir hata oluştu');
      }

      const data = await response.json();
      if (data.url) {
        // URL'den PDF'i fetch edip blob olarak aç
        const pdfResponse = await fetch(data.url);
        if (!pdfResponse.ok) {
          throw new Error('PDF dosyası indirilemedi');
        }

        const blob = await pdfResponse.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');

        // Bellek temizliği için URL'yi revoke et (biraz gecikme ile)
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
        }, 1000);
      } else {
        throw new Error("Döküman URL'si bulunamadı");
      }
    } catch (error) {
      setError('Belge görüntülenirken bir hata oluştu.');
    }
  };

  const handleOpenGuaranteeModal = (quote: ProcessedQuote) => {
    setSelectedQuoteForModal(quote);
    setIsGuaranteeModalOpen(true);
  };

  const handleCloseGuaranteeModal = () => {
    setIsGuaranteeModalOpen(false);
    setSelectedQuoteForModal(null);
  };

  const sortedQuotes = sortQuotes(quotes);

  return (
      <div className="yg-form-content">
        {/* Başlık ve separator sadece loading veya quotes varsa göster */}
        {(isLoading || quotes.length > 0) && (
            <>
              <span className="yg-form-title">Size Uygun Planı Seçin</span>
              <p className="yg-form-subtitle">
                Size en uygun Konut Sigortası teklifini seçip hemen satın alabilirsiniz
              </p>
              <div className="yg-form-separator"></div>
            </>
        )}

        {isLoading ? (
            <YGLoadingProgress percentage={loadingProgress} message="Teklifler yükleniyor" />
        ) : quotes.length === 0 ? (
            <>
              <YGErrorState
                  title="Uygun Teklif Bulunamadı"
                  subtitle="Konut bilgilerinize göre uygun teklif bulunamadı. Bilgilerinizi kontrol edip tekrar deneyebilirsiniz veya müşteri iletişim merkezi numaramızdan bize ulaşabilirsiniz."
                  onAction={() => {
                    window.location.href = 'tel:08504044444';
                  }}
                  actionText="İletişim Merkezi: 0850 404 04 04"
              />
              
              <div className="yg-button-container" style={{ justifyContent: 'flex-start', marginTop: '20px' }}>
                <YGButton onClick={onBack}>
                  Geri Dön
                </YGButton>
              </div>
            </>
        ) : (
            <>
              <div className="yg-quote-cards">
                {sortedQuotes.map((quote) => {
                  const currentPremium = getSelectedPremium(quote);
                  const quoteCategory = getQuoteCategory(sortedQuotes, quote);

                  return (
                      <div key={quote.id} className="yg-quote-card">
                        {quote.coverageGroupName?.includes('Platin') && <div className="yg-quote-popular-badge">Popüler</div>}
                        <div className="yg-quote-card-inner">
                          {/* Sol: Paket Badge */}
                          <div className="yg-quote-company-section">
                            {quote.coverageGroupName && (
                                <div className="yg-quote-badge">{quote.coverageGroupName}</div>
                            )}
                          </div>
                          {/* Orta: Fiyat, Taksit, Vergi */}
                          <div className="yg-quote-price-section">
                            <div className="yg-quote-price">
                              {currentPremium?.formattedGrossPremium || '0,00'} ₺
                            </div>
                            <div className="yg-quote-price-details">
                              <div className="yg-quote-installment-wrapper">
                                <YGSelect
                                    name={`installment-${quote.id}`}
                                    value={quote.selectedInstallmentNumber}
                                    onChange={(e) => handleInstallmentChange(quote.id, parseInt(e.target.value))}
                                    options={quote.premiums.map(p => ({
                                      value: p.installmentNumber,
                                      label: p.installmentNumber === 1 ? 'Peşin Ödeme' : `${p.installmentNumber} Taksit`
                                    }))}
                                    className="yg-quote-installment-select"
                                />
                              </div>
                              <Tooltip title="Vergi ve harçlar dahil toplam fiyat">
                                <Typography
                                    variant="caption"
                                    sx={{
                                      ml: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      fontFamily: "'Source Sans 3', system-ui, -apple-system, sans-serif",
                                      fontSize: '12px',
                                      color: '#666',
                                      cursor: 'help',
                                      gap: '4px'
                                    }}
                                >
                                  <InfoOutlinedIcon sx={{ fontSize: '12px', mr: 0 }} />
                                  Vergiler Dahil
                                </Typography>
                              </Tooltip>
                            </div>
                          </div>
                          {/* 3. Teklif Belgesi ve Teminatlar */}
                          <div className="yg-quote-actions-section">
                            <button
                                className="yg-quote-doc-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Quote objesinden proposalId'yi al
                                  const proposalId = quote.proposalId || (() => {
                                    // Fallback: localStorage'dan al
                                    const proposalIdsJson = localStorage.getItem('yuvamGuvendeProposalIds');
                                    if (proposalIdsJson) {
                                      try {
                                        const proposalIds = JSON.parse(proposalIdsJson);
                                        return proposalIds[0] || null;
                                      } catch (e) {
                                        return localStorage.getItem('yuvamGuvendeProposalId');
                                      }
                                    }
                                    return localStorage.getItem('yuvamGuvendeProposalId');
                                  })();
                                  if (proposalId) {
                                    handleViewDocument(proposalId, quote.id);
                                  }
                                }}
                            >
                              <img
                                  src="/images/landing/teklif-belgesi.svg"
                                  alt="Teklif Belgesi"
                                  style={{ width: '10px', height: 'auto' }}
                              />
                              Teklif Belgesi
                            </button>
                            <button
                                className="yg-quote-premium-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenGuaranteeModal(quote);
                                }}
                            >
                              <img
                                  src="/images/landing/info.svg"
                                  alt="Teminatlar"
                                  style={{ width: '10px', height: 'auto' }}
                              />
                              Teminatlar
                            </button>
                          </div>
                          {/* 4. Satın Al */}
                          <div className="yg-quote-purchase-section">
                            <YGButton onClick={() => handlePurchase(quote.id)} className="yg-quote-purchase-btn">Satın Al</YGButton>
                          </div>
                        </div>
                      </div>
                  );
                })}
              </div>

              <div className="yg-quote-cards-disclaimer">
                *Tüm planlar; yangın, su baskını, hırsızlık, cam kırılması ve elektrik arızalarını kapsar. Ayrıca montaj, bakım ve onarım destekleri ücretsizdir.
              </div>

              <div className="yg-button-container" style={{ justifyContent: 'flex-start', marginTop: '20px' }}>
                <YGButton onClick={onBack}>
                  Geri Dön
                </YGButton>
              </div>
            </>
        )}

        {/* Teminat Detayları Modal */}
        <YGGuaranteeModal
            isOpen={isGuaranteeModalOpen}
            onClose={handleCloseGuaranteeModal}
            companyName={selectedQuoteForModal?.company}
            coverageGroupName={selectedQuoteForModal?.coverageGroupName}
            guarantees={selectedQuoteForModal?.insuranceCompanyGuarantees}
            currentPremium={getSelectedPremium(selectedQuoteForModal)?.formattedGrossPremium}
            installmentText={
              selectedQuoteForModal
                  ? getSelectedPremium(selectedQuoteForModal)?.installmentNumber === 1
                      ? 'Peşin Ödeme'
                      : `${getSelectedPremium(selectedQuoteForModal)?.installmentNumber} Taksit`
                  : undefined
            }
            hasCoverageDetails={selectedQuoteForModal?.hasCoverageDetails}
        />
      </div>
  );
}

