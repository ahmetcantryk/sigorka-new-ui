"use client";
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { FileText, AlertCircle } from 'lucide-react';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Tooltip,
    Typography,
    Alert,
    AlertTitle,
    Select,
    MenuItem,
    FormControl,
    alpha,
    Chip,
    Stack,
    Divider,
    Collapse,
    Skeleton,
    styled,
} from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useAgencyConfig } from '../../../../context/AgencyConfigProvider';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import QuoteComparisonModal, { QuoteForComparison } from '@/components/common/QuoteComparisonModal';

// DataLayer helper functions
declare global {
    interface Window {
        dataLayer: Record<string, unknown>[];
    }
}

const pushToDataLayer = (eventData: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push(eventData);
    } else {
    }
};

// Styled components for enhanced UI
const StyledQuoteCard = styled(Card)(() => ({
    position: 'relative',
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    overflow: 'visible',
    '&:hover': {
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        transform: 'translateY(-2px)',
    }
}));

const CompanyLogoWrapper = styled(Box)(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    marginBottom: 4,
    '& img': {
        maxHeight: 40,
        maxWidth: 100,
        objectFit: 'contain',
        borderRadius: 4,
    }
}));

const PriceTag = styled(Box)(() => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
}));

const FeatureChip = styled(Chip)(() => ({
    margin: 4,
    borderRadius: 4,
    height: 24,
    fontSize: '0.75rem',
}));

const InstallmentButton = styled(FormControl)(() => ({
    minWidth: 'auto',
    '& .MuiOutlinedInput-root': {
        borderRadius: 8,
        transition: 'all 0.2s ease',
        '&:hover': {
            borderColor: 'primary.main',
        },
        '& .MuiSelect-select': {
            padding: '6px 14px',
            paddingRight: '32px',
            fontSize: '0.875rem',
        }
    }
}));

const PurchaseButton = styled(Button)(() => ({
    borderRadius: 8,
    fontWeight: 600,
    padding: '8px 16px',
    boxShadow: 'none',
    textTransform: 'none',
    transition: 'all 0.2s ease',
}));

const DocumentButton = styled(Button)(() => ({
    borderRadius: 8,
    padding: '6px 12px',
    textTransform: 'none',
    fontSize: '0.8125rem',
}));

interface QuoteComparisonStepProps {
    proposalId: string | null;
    onNext?: () => void;
    onBack?: () => void;
    onSelectQuote?: (quoteId: string) => void;
    isFirstStep?: boolean;
    isLastStep?: boolean;
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

// Yeni API format için İMM coverage interface'leri
interface ImmLimitValue {
    $type: 'LIMITLESS' | 'UNDEFINED' | 'DECIMAL';
    value?: number;
}

interface KiralikArac {
    undefined: boolean;
    yillikKullanimSayisi: number | null;
    tekSeferlikGunSayisi: number | null;
    aracSegment: string | null;
}

interface ImmCoverage {
    $type: 'imm';
    immLimitiAyrimsiz: ImmLimitValue;
    kiralikArac: KiralikArac;
    tasinanYuk: string;
    productBranch: string;
}

// Eski Guarantee interface'i (compatibility için)
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
    initialCoverage: ImmCoverage | null;
    insuranceServiceProviderCoverage: ImmCoverage | null;
    pdfCoverage: ImmCoverage | null;
    state: 'WAITING' | 'ACTIVE' | 'FAILED';
    needsInvestigationByCompany: boolean;
    hasVocationalDiscount: boolean;
    hasUndamagedDiscount: boolean;
    revised: boolean;
    errorMessage: string | null;
    policyId: string | null;
    coverageGroupName?: string; // Yeni eklenen alan
    discountModels?: Record<string, unknown>[];

    // Processed fields
    company?: string;
    price?: number;
    coverage?: number;
    features?: string[];
    logo?: string;
    insuranceCompanyGuarantees?: Guarantee[]; // Compatibility için processed field
}

interface ProcessedQuote extends Quote {
    selectedInstallmentNumber: number;
}

// Coverage'da gerçek değerler olup olmadığını kontrol eden yardımcı fonksiyon
const hasValidImmCoverage = (coverage: ImmCoverage | null): boolean => {
    if (!coverage) return false;

    return !!(coverage.immLimitiAyrimsiz &&
        (coverage.immLimitiAyrimsiz.$type === 'LIMITLESS' ||
            (coverage.immLimitiAyrimsiz.$type === 'DECIMAL' && coverage.immLimitiAyrimsiz.value !== undefined)));
};

// İMM Coverage'ı Guarantee array'ine dönüştürme fonksiyonu
const convertImmCoverageToGuarantees = (coverage: ImmCoverage | null): Guarantee[] => {
    if (!coverage) return [];

    const guarantees: Guarantee[] = [];
    const guaranteeId = 1;

    // İMM Limiti - immLimitiAyrimsiz'dan gerçek değeri oku
    let valueText = 'Limitsiz';
    let amount = 0;

    if (coverage.immLimitiAyrimsiz) {
        if (coverage.immLimitiAyrimsiz.$type === 'LIMITLESS') {
            valueText = 'Limitsiz';
            amount = 0;
        } else if (coverage.immLimitiAyrimsiz.$type === 'DECIMAL' && coverage.immLimitiAyrimsiz.value) {
            const limitValue = coverage.immLimitiAyrimsiz.value;
            amount = limitValue;
            
            // Tutarı doğrudan formatla
            valueText = limitValue.toLocaleString('tr-TR');
        }
    }

    guarantees.push({
        insuranceGuaranteeId: guaranteeId.toString(),
        label: 'İMM Limiti',
        valueText: valueText,
        amount: amount
    });
    // Diğer teminatlar (taşınan yük, kiralık araç vs.) geçici olarak gizlendi

    return guarantees;
};

export default function QuoteComparisonStep({
    proposalId: initialProposalId,
    onSelectQuote,
}: QuoteComparisonStepProps) {
    const accessToken = useAuthStore((state) => state.accessToken);
    const [quotes, setQuotes] = useState<ProcessedQuote[]>([]);
    const [, setCompanies] = useState<InsuranceCompany[]>([]);
    const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedQuotes, setExpandedQuotes] = useState<Record<string, boolean>>({});
    const [sortOption, setSortOption] = useState<'price' | 'company'>('price');
    const [hoveredQuote, setHoveredQuote] = useState<string | null>(null);
    const agencyConfig = useAgencyConfig();
    const params = useParams();
    const router = useRouter();
    const [proposalId, setProposalId] = useState<string | null>(initialProposalId || null);
    const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

    const proposalIdToUse = initialProposalId || params?.proposalId as string | undefined || localStorage.getItem('proposalIdForImm');

    const getSelectedPremium = (quote: ProcessedQuote): Premium | undefined => {
        return quote.premiums.find((p) => p.installmentNumber === quote.selectedInstallmentNumber);
    };

    const sortQuotes = useCallback((quotes: ProcessedQuote[]): ProcessedQuote[] => {
        if (sortOption === 'price') {
            return [...quotes].sort((a, b) => {
                const aPremium = getSelectedPremium(a);
                const bPremium = getSelectedPremium(b);

                if (!aPremium || !bPremium) return 0;
                return aPremium.grossPremium - bPremium.grossPremium;
            });
        } else {
            return [...quotes].sort((a, b) => {
                return (a.company || '').localeCompare(b.company || '');
            });
        }
    }, [sortOption]);

    useEffect(() => {
        const storedProposalId = localStorage.getItem('proposalIdForImm');
        if (storedProposalId) {
            setProposalId(storedProposalId);
        } else if (params?.proposalId) {
            const pid = Array.isArray(params.proposalId) ? params.proposalId[0] : params.proposalId;
            setProposalId(pid || null);
        } else {
            setError('imm teklif ID bilgisi bulunamadı. Lütfen önceki adıma dönüp tekrar deneyin.');
            setIsLoading(false);
        }
    }, [params.proposalId]);

    // processQuotesData yardımcı fonksiyonu - Yeni İMM API formatı için güncellenmiş
    const processQuotesData = (quotesData: Quote[], currentCompanies: InsuranceCompany[]): ProcessedQuote[] => {
        return quotesData.map((quote: Quote) => {
            try {
                const company = currentCompanies.find((c) => c.id === quote.insuranceCompanyId);

                // Güvenli premium kontrolü
                const premiums = Array.isArray(quote.premiums) ? quote.premiums : [];

                // uniquePremiums mantığı, eğer aynı taksit numarasına sahip birden fazla premium geliyorsa
                // ve bu istenmiyorsa kullanılabilir. Genellikle API'den zaten doğru veri gelmesi beklenir.
                const uniquePremiums = premiums.reduce((acc: Premium[], current) => {
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
                    formattedNetPremium: (premium.netPremium || 0).toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
                    formattedGrossPremium: (premium.grossPremium || 0).toLocaleString('tr-TR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    }),
                }));

                const initialSelectedInstallment = formattedPremiums.length > 0 ? formattedPremiums[0].installmentNumber : 1;

                // Yeni İMM API formatından teminat bilgilerini çıkar
                // Öncelik sırası: pdfCoverage > insuranceServiceProviderCoverage > initialCoverage
                // Ancak sadece gerçek değerler içeren coverage'ları kullan
                let coverageToUse: ImmCoverage | null = null;

                if (hasValidImmCoverage(quote.pdfCoverage)) {
                    coverageToUse = quote.pdfCoverage;
                } else if (hasValidImmCoverage(quote.insuranceServiceProviderCoverage)) {
                    coverageToUse = quote.insuranceServiceProviderCoverage;
                } else if (hasValidImmCoverage(quote.initialCoverage)) {
                    coverageToUse = quote.initialCoverage;
                }

                const guarantees = convertImmCoverageToGuarantees(coverageToUse);

                // Ana teminat tutarını bul (İMM için ilk guarantee'nin amount'ı veya limitsizse 0)
                const mainCoverage = guarantees.find(g =>
                    g.label.includes('İMM Limiti') || g.insuranceGuaranteeId === '1'
                );
                const coverage = mainCoverage?.amount ?? 0;

                // Diğer teminatları features olarak kullan
                const features = guarantees
                    .filter((g) => g.insuranceGuaranteeId !== '1' && g.label !== 'İMM Limiti')
                    .map((g) => g.label);

                return {
                    ...quote,
                    premiums: formattedPremiums,
                    company: company?.name || `Sigorta Şirketi #${quote.insuranceCompanyId}`,
                    coverage,
                    features,
                    logo: company?.logo || `https://storage.dogasigorta.com/app-1/insurup-b2c-company/${quote.insuranceCompanyId}.png`,
                    selectedInstallmentNumber: initialSelectedInstallment,
                    insuranceCompanyGuarantees: guarantees, // Yeni coverage'dan dönüştürülmüş guarantees
                };
            } catch {
                // Hatalı teklifi geçerli bir formatta döndür
                return {
                    ...quote,
                    premiums: [],
                    company: `Sigorta Şirketi #${quote.insuranceCompanyId}`,
                    coverage: 0,
                    features: [],
                    logo: `https://storage.dogasigorta.com/app-1/insurup-b2c-company/${quote.insuranceCompanyId}.png`,
                    selectedInstallmentNumber: 1,
                    insuranceCompanyGuarantees: [],
                    state: 'FAILED' as const, // Hatalı teklifleri FAILED olarak işaretle
                };
            }
        }).filter(quote => quote !== null); // Null teklifleri filtrele
    };

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
            if (!proposalIdToUse) return;

            const currentAccessToken = useAuthStore.getState().accessToken;
            if (!currentAccessToken) return;

            try {
                        const rawProposalResponse = await fetchWithAuth(
          API_ENDPOINTS.PROPOSALS_ID(proposalIdToUse),
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${currentAccessToken}`,
              Accept: 'application/json',
            },
          }
        );

        if (!rawProposalResponse.ok) {
          throw new Error(`Proposal bilgileri alınamadı: ${rawProposalResponse.status}`);
        }

        const proposalData = await rawProposalResponse.json();
        const productsData = proposalData.products as Quote[];

                if (!Array.isArray(productsData)) {
                    throw new Error('Ürünler API yanıtı beklenen formatta değil.');
                }

                const processedQuotes = processQuotesData(productsData, currentCompanies);

                // Config'de tanımlı productId'leri al
                const allowedProductIds = agencyConfig.homepage.partners.companies.flatMap(c => c.products.imm || []);

                // Hem ACTIVE hem de config'de tanımlı olanları filtrele
                const filteredQuotes = processedQuotes.filter(quote =>
                    quote.state === 'ACTIVE' && allowedProductIds.includes(quote.productId)
                );

                // Kullanıcıya sadece filtrelenmiş quotes'ları göster
                setQuotes(sortQuotes(filteredQuotes));

                // Polling kontrolü için relevantQuotes (aynı logic)
                const relevantQuotes = processedQuotes.filter(q => allowedProductIds.includes(q.productId));

                const allRelevantQuotesFinalized = relevantQuotes.length > 0 && relevantQuotes.every(
                    (quote) => quote.state === 'FAILED' || quote.state === 'ACTIVE'
                );

                const elapsedTime = Date.now() - startTime;
                const timeoutReached = elapsedTime >= 300000; // 5 dakika

                if (allRelevantQuotesFinalized || timeoutReached) {
                    if (allRelevantQuotesFinalized) {
                    }
                    if (timeoutReached) {
                    }

                    // Check if there are any successful quotes and trigger dataLayer event
                    const hasSuccessfulQuotes = filteredQuotes.length > 0;

                    if (hasSuccessfulQuotes) {
                        pushToDataLayer({
                            event: "imm_formsubmit",
                            form_name: "imm_teklif_basarili"
                        });
                    } else {
                        pushToDataLayer({
                            event: "imm_formsubmit",
                            form_name: "imm_teklif_basarisiz"
                        });
                    }

                    if (pollInterval) {
                        clearInterval(pollInterval);
                    }
                    setIsLoading(false);
                    return;
                }

            } catch {
                // Kullanıcıya teknik hata detayları gösterme, sadece genel mesaj
                // setError yerine daha nazik bir yaklaşım - teklifler gelmediyse sadece loading'i kapat
                setIsLoading(false);
                if (pollInterval) {
                    clearInterval(pollInterval);
                }
            }
        };

        const startPolling = async () => {
            if (!proposalIdToUse) {
                setError('Teklif ID bulunamadı. Lütfen önceki adıma dönün.');
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
                // Kullanıcıya teknik hata gösterme
                setQuotes([]);
                setIsLoading(false);
                // Sadece kritik durumlar için setError kullan
                if (err instanceof Error && err.message.includes('proposalId')) {
                    setError('Teklif bilgilerinize ulaşılamıyor. Lütfen sayfayı yenileyin veya önceki adıma dönün.');
                }
            }
        };

        startPolling();

        return () => {
            isPollingActive = false;
            if (pollInterval) {
                clearInterval(pollInterval);
            }
        };
    }, [proposalIdToUse, agencyConfig, sortQuotes]);

    const handleQuoteSelect = (quoteId: string) => {
        setSelectedQuote(quoteId);
    };

    const handleInstallmentChange = (quoteId: string, installmentNumber: number) => {
        setQuotes((prevQuotes) =>
            prevQuotes.map((quote) =>
                quote.id === quoteId
                    ? { ...quote, selectedInstallmentNumber: installmentNumber }
                    : quote
            )
        );
    };


    // Karşılaştırma modal'ı için teklifleri dönüştür
    const convertQuotesForComparison = (quotes: ProcessedQuote[]): QuoteForComparison[] => {
        return quotes.map(quote => ({
            id: quote.id,
            company: quote.company,
            logo: quote.logo,
            premiums: quote.premiums,
            insuranceCompanyGuarantees: quote.insuranceCompanyGuarantees,
            coverageGroupName: quote.coverageGroupName,
            selectedInstallmentNumber: quote.selectedInstallmentNumber
        }));
    };

    const handlePurchase = (quoteId: string) => {
        const selectedFullQuote = quotes.find(q => q.id === quoteId);
        if (selectedFullQuote && selectedFullQuote.state === 'ACTIVE') {
            // PurchaseStep için gerekli alanları ekleyerek selectedQuoteForPurchase'ı hazırla
            const purchaseData = {
                ...selectedFullQuote,
                proposalId: proposalId, // proposalId'yi ekliyoruz
                proposalProductId: selectedFullQuote.id, // proposalProductId olarak id'yi kullanıyoruz
                productId: selectedFullQuote.id // productId olarak da id'yi kullanıyoruz (string olarak)
            };
            
            localStorage.setItem('selectedQuoteForPurchase', JSON.stringify(purchaseData));
            localStorage.setItem('selectedInstallmentForPurchase', selectedFullQuote.selectedInstallmentNumber.toString());
            if (onSelectQuote) {
                onSelectQuote(quoteId);
            }
            router.push(`/purchase/${proposalId}/${quoteId}`);
        } else {
            setError("Bu teklif şu anda satın alım için uygun değil veya aktif değil.");
        }
    };

    const toggleQuoteExpand = (quoteId: string) => {
        setExpandedQuotes(prev => ({
            ...prev,
            [quoteId]: !prev[quoteId]
        }));
    };

    const getHighlightColor = () => {
        // Best offer no longer gets a highlight background
        return 'transparent';
    };

    const isBestOffer = (sortedQuotes: ProcessedQuote[], currentQuoteId: string) => {
        return sortedQuotes.length > 0 && sortedQuotes[0].id === currentQuoteId;
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
        } catch {
            setError('Belge görüntülenirken bir hata oluştu.');
        }
    };

    return (
        <>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" component="h1" fontWeight="600" gutterBottom>
                    İMM Sigortası Teklifleri
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    Size en uygun İMM sigortası teklifini seçip hemen satın alabilirsiniz
                </Typography>

                {/* Filtering and Sorting Controls */}
                <Box sx={{
                    mt: 3,
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2
                }}>
                    {/* Karşılaştırma Butonu */}
                    <Box>
                        {quotes.length > 1 && (
                            <Button
                                variant="outlined"
                                startIcon={<CompareArrowsIcon />}
                                onClick={() => setIsComparisonModalOpen(true)}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 'medium',
                                    borderColor: agencyConfig.theme.primaryColor,
                                    color: agencyConfig.theme.primaryColor,
                                    '&:hover': {
                                        borderColor: agencyConfig.theme.primaryColor,
                                        bgcolor: alpha(agencyConfig.theme.primaryColor, 0.05),
                                    }
                                }}
                            >
                                Teklifleri Karşılaştır
                            </Button>
                        )}
                    </Box>

                    {/* Sıralama Kontrolü */}
                    <FormControl size="small">
                        <Select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as 'price' | 'company')}
                            sx={{
                                minWidth: 150,
                                borderRadius: 2,
                                fontSize: '0.875rem',
                                '& .MuiSelect-select': { py: 1 }
                            }}
                        >
                            <MenuItem value="price">Fiyata Göre Sırala</MenuItem>
                            <MenuItem value="company">A&apos;dan Z&apos;ye Sırala</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>

            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                >
                    {error}
                </Alert>
            )}

            {isLoading ? (
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    my: 8,
                    gap: 3
                }}>
                    <CircularProgress size={48} thickness={4} />
                    <Box textAlign="center">
                        <Typography variant="h6" fontWeight="medium" gutterBottom>
                            Teklifler Hazırlanıyor
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Anlaşmalı şirketlerimizden size özel teklifler alınıyor...
                        </Typography>
                    </Box>
                </Box>
            ) : quotes.length === 0 ? (
                <Alert
                    severity="info"
                    sx={{
                        mb: 3,
                        py: 2,
                        borderRadius: 2,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }}
                >
                    <AlertTitle>Uygun Teklif Bulunamadı</AlertTitle>
                    Araç bilgilerinize göre uygun teklif bulunamadı. Bilgilerinizi kontrol edip tekrar deneyebilirsiniz.
                </Alert>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {sortQuotes(quotes.filter(q => q.state === 'ACTIVE')).map((quote) => {
                        const currentPremium = getSelectedPremium(quote);
                        const isFailed = quote.state === 'FAILED';
                        const isWaiting = quote.state === 'WAITING';
                        const isExpanded = expandedQuotes[quote.id] || false;
                        const isHovered = hoveredQuote === quote.id;
                        const isSelected = selectedQuote === quote.id;
                        const highlightColor = getHighlightColor();
                        const best = isBestOffer(sortQuotes(quotes.filter(q => q.state === 'ACTIVE')), quote.id);

                        return (
                            <Box key={quote.id} sx={{ width: '100%' }}>
                                <StyledQuoteCard
                                    elevation={isHovered || isSelected ? 3 : 1}
                                    onMouseEnter={() => setHoveredQuote(quote.id)}
                                    onMouseLeave={() => setHoveredQuote(null)}
                                    onClick={() => !isFailed && !isWaiting && handleQuoteSelect(quote.id)}
                                    sx={{
                                        cursor: isFailed || isWaiting ? 'default' : 'pointer',
                                        border: isSelected
                                            ? `2px solid ${agencyConfig.theme.primaryColor}`
                                            : isFailed
                                                ? '1px solid rgba(211, 47, 47, 0.3)'
                                                : isWaiting
                                                    ? '1px solid rgba(0, 0, 0, 0.12)'
                                                    : `1px solid rgba(0, 0, 0, 0.08)`,
                                        opacity: isFailed ? 0.8 : 1,
                                        backgroundColor: isSelected
                                            ? alpha(agencyConfig.theme.primaryColor, 0.04)
                                            : highlightColor
                                    }}
                                >
                                    {/* Best Offer Badge - only show when sorting by price and there's more than one active quote */}
                                    {sortOption === 'price' &&
                                        quotes.filter(q => q.state === 'ACTIVE').length > 1 &&
                                        best && (
                                            <Chip
                                                label="En Uygun Fiyat"
                                                color="success"
                                                size="small"
                                                icon={<CheckCircleOutlineIcon />}
                                                sx={{
                                                    position: 'absolute',
                                                    top: -12,
                                                    left: 16,
                                                    fontWeight: 'medium',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                    zIndex: 1
                                                }}
                                            />
                                        )}
                                    
                                    {/* Coverage Group Name Badge - En Uygun Fiyat badge'inin yanında */}
                                    {quote.coverageGroupName && (
                                        <Chip
                                            label={quote.coverageGroupName}
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: -12,
                                                left: quote.coverageGroupName && sortOption === 'price' && quotes.filter(q => q.state === 'ACTIVE').length > 1 && best ? 140 : 16,
                                                fontWeight: 'medium',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                zIndex: 1,
                                                bgcolor: '#1976d2',
                                                color: 'white',
                                                '& .MuiChip-label': {
                                                    fontSize: '0.75rem'
                                                }
                                            }}
                                        />
                                    )}

                                    <CardContent sx={{ p: 2.5 }}>
                                        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                                            {/* Company & Logo Section */}
                                            <Box sx={{ flex: 3.5, minWidth: 0, mb: { xs: 2, md: 0 } }}>
                                                <CompanyLogoWrapper>
                                                    {quote.logo ? (
                                                        <Box
                                                            component="img"
                                                            src={quote.logo}
                                                            alt={quote.company}
                                                            sx={{ height: 40 }}
                                                        />
                                                    ) : (
                                                        <Box
                                                            sx={{
                                                                bgcolor: 'action.hover',
                                                                borderRadius: 1,
                                                                width: 50,
                                                                height: 40,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center'
                                                            }}
                                                        >
                                                            <Typography variant="h5" component="span">
                                                                🚗
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight="bold">
                                                            {quote.company}
                                                        </Typography>
                                                    </Box>
                                                </CompanyLogoWrapper>
                                            </Box>
                                            {/* Price Section */}
                                            <Box sx={{ flex: 3.5, minWidth: 0, mb: { xs: 2, md: 0 } }}>
                                                <PriceTag>
                                                    {isWaiting ? (
                                                        <>
                                                            <Skeleton variant="text" width={120} height={36} />
                                                            <Skeleton variant="text" width={90} height={24} />
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                                                <Typography
                                                                    variant="h5"
                                                                    color="primary.main"
                                                                    fontWeight="700"
                                                                    sx={{ mr: 1 }}
                                                                >
                                                                    {currentPremium?.formattedGrossPremium
                                                                        ? `${currentPremium.formattedGrossPremium} ₺`
                                                                        : 'Fiyat Yok'}
                                                                </Typography>

                                                                {currentPremium?.installmentNumber && currentPremium.installmentNumber > 1 && (
                                                                    <Chip
                                                                        size="small"
                                                                        label={`${currentPremium.installmentNumber} Taksit`}
                                                                        color="default"
                                                                        variant="outlined"
                                                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                                                    />
                                                                )}
                                                            </Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                                                <InstallmentButton size="small">
                                                                    <Select
                                                                        value={quote.selectedInstallmentNumber}
                                                                        onChange={(e) => handleInstallmentChange(quote.id, e.target.value as number)}
                                                                        renderValue={(value) => (
                                                                            <Typography variant="body2">
                                                                                {value === 1 ? 'Peşin Ödeme' : `${value} Taksit`}
                                                                            </Typography>
                                                                        )}
                                                                        IconComponent={ExpandMoreIcon}
                                                                        sx={{
                                                                            fontSize: '0.8rem',
                                                                            '.MuiSvgIcon-root': { fontSize: '1rem' }
                                                                        }}
                                                                    >
                                                                        {quote.premiums.map((premium) => (
                                                                            <MenuItem
                                                                                key={premium.installmentNumber}
                                                                                value={premium.installmentNumber}
                                                                            >
                                                                                <Typography variant="body2">
                                                                                    {premium.installmentNumber === 1
                                                                                        ? `Peşin: ${premium.formattedGrossPremium} ₺`
                                                                                        : `${premium.installmentNumber} Taksit: ${premium.formattedGrossPremium} ₺`}
                                                                                </Typography>
                                                                            </MenuItem>
                                                                        ))}
                                                                    </Select>
                                                                </InstallmentButton>
                                                                <Tooltip title="Vergi ve harçlar dahil toplam fiyat">
                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.secondary"
                                                                        sx={{ ml: 1, display: 'flex', alignItems: 'center' }}
                                                                    >
                                                                        <InfoOutlinedIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                                                                        Vergiler Dahil
                                                                    </Typography>
                                                                </Tooltip>
                                                            </Box>
                                                        </>
                                                    )}
                                                </PriceTag>
                                            </Box>
                                            {/* Features & Actions Section */}
                                            <Box sx={{ flex: 5, minWidth: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                                                <Box>
                                                    {!isWaiting && (
                                                        <Stack direction="row" spacing={1} flexWrap="wrap">
                                                            <DocumentButton
                                                                variant="text"
                                                                startIcon={<FileText size={16} />}
                                                                color="primary"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleViewDocument(proposalId || '', quote.id);
                                                                }}
                                                            >
                                                                Teklif Belgesi
                                                            </DocumentButton>
                                                            <DocumentButton
                                                                variant="text"
                                                                startIcon={<InfoOutlinedIcon fontSize="small" />}
                                                                color="primary"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    toggleQuoteExpand(quote.id);
                                                                }}
                                                            >
                                                                Teminatlar
                                                            </DocumentButton>
                                                        </Stack>
                                                    )}
                                                </Box>
                                                {!isFailed && !isWaiting && (
                                                    <PurchaseButton
                                                        variant="outlined"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handlePurchase(quote.id);
                                                        }}
                                                        sx={{
                                                            color: 'text.primary',
                                                            borderColor: 'divider',
                                                            '&:hover': {
                                                                color: agencyConfig.theme.primaryColor,
                                                                borderColor: agencyConfig.theme.primaryColor,
                                                                bgcolor: alpha(agencyConfig.theme.primaryColor, 0.05),
                                                                transform: 'translateY(-1px)',
                                                            },
                                                        }}
                                                    >
                                                        Satın Al
                                                    </PurchaseButton>
                                                )}
                                                {isWaiting && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <CircularProgress size={20} sx={{ mr: 1 }} />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Hazırlanıyor...
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                        {/* Expandable Details Section */}
                                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                            <Divider sx={{ my: 2 }} />
                                            <Box sx={{ pt: 1 }}>
                                                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                    Teminat Bilgileri
                                                </Typography>
                                                <Box sx={{ mt: 1 }}>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                        {quote.insuranceCompanyGuarantees?.map((guarantee) => (
                                                            <FeatureChip
                                                                key={guarantee.insuranceGuaranteeId}
                                                                label={`${guarantee.label}: ${formatGuaranteeValue(guarantee)}`}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Collapse>
                                        {isFailed && (
                                            <Alert
                                                severity="error"
                                                variant="outlined"
                                                icon={<AlertCircle size={24} />}
                                                sx={{
                                                    mt: 2,
                                                    borderRadius: 2
                                                }}
                                            >
                                                <Typography variant="body2">
                                                    {quote.errorMessage || 'Bu teklif şu anda kullanılamıyor. Lütfen başka bir teklif seçin.'}
                                                </Typography>
                                            </Alert>
                                        )}
                                    </CardContent>
                                </StyledQuoteCard>
                            </Box>
                        );
                    })}
                </Box>
            )}

            {/* Information Section */}
            <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <InfoOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                        <Typography variant="subtitle2" component="span">İMM Sigortası Hakkında</Typography>
                    </Box>
                    İMM (İhtiyari Mali Mesuliyet) Sigortası, trafik sigortasının teminat limitlerini aşan durumlarda karşı tarafa verilen maddi ve bedeni zararları güvence altına alır. İhtiyacınıza ve bütçenize uygun İMM teklifini seçin, karşılaştırın, hemen satın alın.
                </Typography>
            </Box>

            {/* Karşılaştırma Modal'ı */}
            <QuoteComparisonModal
                open={isComparisonModalOpen}
                onClose={() => setIsComparisonModalOpen(false)}
                quotes={convertQuotesForComparison(quotes.filter(q => q.state === 'ACTIVE'))}
                title="İMM Sigortası"
                onPurchase={handlePurchase}
                maxQuotes={3}
            />

            {/* "Önceki Adıma Dön" butonu kaldırıldı */}
        </>
    );
}
