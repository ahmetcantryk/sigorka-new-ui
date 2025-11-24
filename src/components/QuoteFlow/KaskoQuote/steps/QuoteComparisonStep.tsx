"use client";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { FileText, ShieldCheck, AlertCircle } from 'lucide-react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
  Alert,
  AlertTitle,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  alpha,
  Chip,
  Stack,
  Divider,
  Skeleton,
  useTheme,
  styled,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useAgencyConfig } from '../../../../context/AgencyConfigProvider';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import QuoteComparisonModal, { QuoteForComparison } from '@/components/common/QuoteComparisonModal';

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

const CompanyLogoWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(0.5),
  '& img': {
    maxHeight: 40,
    maxWidth: 100,
    objectFit: 'contain',
    borderRadius: 4,
  }
}));

const PriceTag = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
}));

const FeatureChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  borderRadius: 4,
  height: 24,
  fontSize: '0.75rem',
}));

const InstallmentButton = styled(FormControl)(({ theme }) => ({
  minWidth: 'auto',
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: theme.palette.primary.main,
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
  onPurchaseClick?: (quoteId: string) => void;
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

// Yeni API format için coverage interface'leri
interface CoverageValue {
  $type: 'LIMITLESS' | 'DECIMAL' | 'UNDEFINED' | 'HIGHEST_LIMIT' | 'NOT_INCLUDED' | 'INCLUDED' | 'NONE';
  value?: number;
}

interface KiralArac {
  undefined: boolean;
  yillikKullanimSayisi: number | null;
  tekSeferlikGunSayisi: number | null;
  aracSegment: string | null;
}

interface KaskoCoverage {
  $type: 'kasko';
  immLimitiAyrimsiz: CoverageValue;
  ferdiKazaVefat: CoverageValue;
  ferdiKazaSakatlik: CoverageValue;
  ferdiKazaTedaviMasraflari: CoverageValue;
  anahtarKaybi: CoverageValue;
  maneviTazminat: CoverageValue;
  onarimServisTuru: string;
  yedekParcaTuru: string;
  camKirilmaMuafeyeti: CoverageValue;
  kiralikArac: KiralArac;
  hukuksalKorumaAracaBagli?: CoverageValue;
  ozelEsya?: CoverageValue;
  sigaraMaddeZarari?: CoverageValue;
  patlayiciMaddeZarari?: CoverageValue;
  kemirgenZarari?: CoverageValue;
  yukKaymasiZarari?: CoverageValue;
  eskime?: CoverageValue;
  hasarsizlikIndirimKoruma?: CoverageValue;
  yurtdisiKasko?: CoverageValue;
  aracCalinmasi?: CoverageValue;
  anahtarCalinmasi?: CoverageValue;
  hukuksalKorumaSurucuyeBagli?: CoverageValue;
  miniOnarim?: CoverageValue;
  yolYardim?: CoverageValue;
  yanlisAkaryakitDolumu?: CoverageValue;
  yanma?: CoverageValue;
  carpma?: CoverageValue;
  carpisma?: CoverageValue;
  glkhhTeror?: CoverageValue;
  grevLokavt?: CoverageValue;
  dogalAfetler?: CoverageValue;
  hirsizlik?: CoverageValue;
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
  initialCoverage: KaskoCoverage | null;
  insuranceServiceProviderCoverage: KaskoCoverage | null;
  pdfCoverage: KaskoCoverage | null;
  state: 'WAITING' | 'ACTIVE' | 'FAILED';
  needsInvestigationByCompany: boolean;
  hasVocationalDiscount: boolean;
  hasUndamagedDiscount: boolean;
  revised: boolean;
  errorMessage: string | null;
  policyId: string | null;
  coverageGroupName?: string; // Yeni eklenen alan

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

// Coverage'ı Guarantee array'ine dönüştürme fonksiyonu
const convertCoverageToGuarantees = (coverage: KaskoCoverage | null): Guarantee[] => {
  if (!coverage) return [];

  const guarantees: Guarantee[] = [];
  let guaranteeId = 1;

  // Tüm olası teminat alanlarını tanımla (sabit sayı için)
  const allPossibleFields = [
    'immLimitiAyrimsiz',
    'ferdiKazaVefat',
    'ferdiKazaSakatlik',
    'ferdiKazaTedaviMasraflari',
    'anahtarKaybi',
    'maneviTazminat',
    'onarimServisTuru',
    'yedekParcaTuru',
    'camKirilmaMuafeyeti',
    'kiralikArac',
    'hukuksalKorumaAracaBagli',
    'ozelEsya',
    'sigaraMaddeZarari',
    'patlayiciMaddeZarari',
    'kemirgenZarari',
    'yukKaymasiZarari',
    'eskime',
    'hasarsizlikIndirimKoruma',
    'yurtdisiKasko',
    'aracCalinmasi',
    'anahtarCalinmasi',
    'hukuksalKorumaSurucuyeBagli',
    'miniOnarim',
    'yolYardim',
    'yanlisAkaryakitDolumu',
    'yanma',
    'carpma',
    'carpisma',
    'glkhhTeror',
    'grevLokavt',
    'dogalAfetler',
    'hirsizlik'
  ];

  // Kapsamlı teminat etiketleri Türkçe
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
    hasarsizlikIndirimKoruma: 'Hasarızlık İndirim Koruma',
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
    hirsizlik: 'Hırsızlık'
  };

  // Service türü etiketleri
  const serviceTypeLabels: Record<string, string> = {
    'OZEL_SERVIS': 'Özel Servis',
    'YETKILI_SERVIS': 'Yetkili Servis',
    'ANLASMALI_YETKILI_SERVIS': 'Anlaşmalı Yetkili Servis',
    'SIGORTALI_BELIRLER': 'Sigortalı Belirler',
    'BELIRSIZ': 'Belirsiz'
  };

  // Parça türü etiketleri
  const partTypeLabels: Record<string, string> = {
    'ORIJINAL_PARCA': 'Orijinal Parça',
    'ESDEGER_PARCA': 'Eşdeğer Parça',
    'MUADIL_PARCA': 'Muadil Parça',
    'BELIRSIZ': 'Belirsiz'
  };

  // Araç segmenti etiketleri
  const segmentLabels: Record<string, string> = {
    'SEGMENTE_SEGMENT': 'Segment E Segment',
    'NONE': 'Yok'
  };

  // Coverage objelerini Guarantee array'ine dönüştür
  Object.entries(coverage).forEach(([key, value]) => {
    if (key === '$type' || key === 'productBranch') return;

    const label = coverageLabels[key] || key;

    // Kiralık araç özel işlemi
    if (key === 'kiralikArac') {
      if (typeof value === 'object' && value !== null && '$type' in value) {
        const kiralikArac = value as any;
        if (kiralikArac.$type === 'DEFINED') {
          guarantees.push({
            insuranceGuaranteeId: guaranteeId.toString(),
            label: 'Kiralık Araç',
            valueText: `${kiralikArac.yillikKullanimSayisi || 0} kez/yıl, ${kiralikArac.tekSeferlikGunSayisi || 0} gün`,
            amount: 0
          });
          guaranteeId++;
          
          if (kiralikArac.aracSegment) {
            guarantees.push({
              insuranceGuaranteeId: guaranteeId.toString(),
              label: 'Kiralık Araç Segmenti',
              valueText: segmentLabels[kiralikArac.aracSegment] || kiralikArac.aracSegment,
              amount: 0
            });
            guaranteeId++;
          }
        } else if (kiralikArac.$type === 'NONE') {
          guarantees.push({
            insuranceGuaranteeId: guaranteeId.toString(),
            label: 'Kiralık Araç',
            valueText: 'Dahil Değil',
            amount: 0
          });
          guaranteeId++;
        }
      }
      return;
    }

    // String değerler (onarimServisTuru, yedekParcaTuru)
    if (key === 'onarimServisTuru') {
      guarantees.push({
        insuranceGuaranteeId: guaranteeId.toString(),
        label,
        valueText: serviceTypeLabels[value as string] || value as string,
        amount: 0
      });
      guaranteeId++;
      return;
    }

    if (key === 'yedekParcaTuru') {
      guarantees.push({
        insuranceGuaranteeId: guaranteeId.toString(),
        label,
        valueText: partTypeLabels[value as string] || value as string,
        amount: 0
      });
      guaranteeId++;
      return;
    }

    // CoverageValue objeleri
    if (typeof value === 'object' && value !== null && '$type' in value) {
      const coverageValue = value as CoverageValue;
      
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
          
        case 'NONE':
          guarantees.push({
            insuranceGuaranteeId: guaranteeId.toString(),
            label,
            valueText: 'Yok',
            amount: 0
          });
          break;
          
        case 'UNDEFINED':
          // UNDEFINED teminatları "Belirsiz" olarak göster
          guarantees.push({
            insuranceGuaranteeId: guaranteeId.toString(),
            label,
            valueText: 'Belirsiz',
            amount: 0
          });
          break;
          
        default:
          // Bilinmeyen tip için varsayılan değer
          guarantees.push({
            insuranceGuaranteeId: guaranteeId.toString(),
            label,
            valueText: coverageValue.$type,
            amount: 0
          });
      }
      
      guaranteeId++;
    }
  });

  // Eksik alanları "Belirsiz" olarak ekle (sabit teminat sayısı için)
  allPossibleFields.forEach(field => {
    const existingGuarantee = guarantees.find(g => g.label === coverageLabels[field]);
    if (!existingGuarantee) {
      guarantees.push({
        insuranceGuaranteeId: guaranteeId.toString(),
        label: coverageLabels[field] || field,
        valueText: 'Belirsiz',
        amount: 0
      });
      guaranteeId++;
    }
  });

  // Teminatları alfabetik sıraya göre sırala
  return guarantees.sort((a, b) => a.label.localeCompare(b.label));
};

export default function QuoteComparisonStep({
  proposalId: initialProposalId,
  onSelectQuote,
  onPurchaseClick,
}: QuoteComparisonStepProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [quotes, setQuotes] = useState<ProcessedQuote[]>([]);
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuoteForModal, setSelectedQuoteForModal] = useState<ProcessedQuote | null>(null);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  const [sortOption, setSortOption] = useState<'price' | 'company'>('price');
  const [showOnlyBestOffers] = useState(false);
  const [hoveredQuote, setHoveredQuote] = useState<string | null>(null);
  const theme = useTheme();
  const agencyConfig = useAgencyConfig();
  const params = useParams();
  const router = useRouter();
  const [proposalId, setProposalId] = useState<string | null>(initialProposalId || null);
  const [bestOffers, setBestOffers] = useState<ProcessedQuote[]>([]);

  const proposalIdToUse = initialProposalId || params?.proposalId as string | undefined || localStorage.getItem('proposalIdForKasko');

  useEffect(() => {
    const storedProposalId = localStorage.getItem('proposalIdForKasko');
    if (storedProposalId) {
      setProposalId(storedProposalId);
    } else if (params?.proposalId) {
      const pid = Array.isArray(params.proposalId) ? params.proposalId[0] : params.proposalId;
      setProposalId(pid || null);
    } else {
      setError('Kasko teklif ID bilgisi bulunamadı. Lütfen önceki adıma dönüp tekrar deneyin.');
      setIsLoading(false);
    }
  }, [params.proposalId]);

  // processQuotesData yardımcı fonksiyonu - Yeni API formatı için güncellenmiş
  const processQuotesData = (quotesData: Quote[], currentCompanies: InsuranceCompany[]): ProcessedQuote[] => {
    // Kapsamlı teminat etiketleri Türkçe
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
      hasarsizlikIndirimKoruma: 'Hasarızlık İndirim Koruma',
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
      hirsizlik: 'Hırsızlık'
    };

    // Service türü etiketleri
    const serviceTypeLabels: Record<string, string> = {
      'OZEL_SERVIS': 'Özel Servis',
      'YETKILI_SERVIS': 'Yetkili Servis',
      'ANLASMALI_YETKILI_SERVIS': 'Anlaşmalı Yetkili Servis',
      'SIGORTALI_BELIRLER': 'Sigortalı Belirler',
      'BELIRSIZ': 'Belirsiz'
    };

    // Parça türü etiketleri
    const partTypeLabels: Record<string, string> = {
      'ORIJINAL_PARCA': 'Orijinal Parça',
      'ESDEGER_PARCA': 'Eşdeğer Parça',
      'MUADIL_PARCA': 'Muadil Parça',
      'BELIRSIZ': 'Belirsiz'
    };

    // Araç segmenti etiketleri
    const segmentLabels: Record<string, string> = {
      'SEGMENTE_SEGMENT': 'Segment E Segment',
      'NONE': 'Yok'
    };

    return quotesData.map((quote: Quote) => {
      const company = currentCompanies.find((c) => c.id === quote.insuranceCompanyId);
      
      // uniquePremiums mantığı, eğer aynı taksit numarasına sahip birden fazla premium geliyorsa
      // ve bu istenmiyorsa kullanılabilir. Genellikle API'den zaten doğru veri gelmesi beklenir.
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

      // Yeni API formatından teminat bilgilerini çıkar
      // 3 parametreyi kıyaslayıp sadece değer sahip olanları göster
      let guarantees: Guarantee[] = [];
      
      // Tüm coverage'ları topla
      const allCoverages = [
        { coverage: quote.pdfCoverage, type: 'pdf' },
        { coverage: quote.insuranceServiceProviderCoverage, type: 'insurance' },
        { coverage: quote.initialCoverage, type: 'initial' }
      ].filter(item => item.coverage !== null);
      
      if (allCoverages.length > 0) {
        // İlk coverage'dan tüm alanları al
        const firstCoverage = allCoverages[0].coverage;
        const allFields = Object.keys(firstCoverage).filter(key => key !== '$type' && key !== 'productBranch');
        
        // Her alan için en iyi değeri bul
        allFields.forEach(field => {
          let bestValue: any = null;
          
          // Öncelik sırasına göre değer ara
          for (const { coverage } of allCoverages) {
            if (coverage && coverage[field as keyof KaskoCoverage]) {
              const value = coverage[field as keyof KaskoCoverage];
              
              // UNDEFINED değilse bu değeri kullan
              if (typeof value === 'object' && value !== null && '$type' in value) {
                if (value.$type !== 'UNDEFINED') {
                  bestValue = value;
                  break;
                }
              } else if (typeof value === 'string' && value !== 'UNDEFINED') {
                bestValue = value;
                break;
              }
            }
          }
          
          // Eğer geçerli bir değer bulunduysa guarantees'e ekle
          if (bestValue !== null) {
            const label = coverageLabels[field] || field;
            
            if (field === 'kiralikArac') {
              if (typeof bestValue === 'object' && bestValue !== null && '$type' in bestValue) {
                if (bestValue.$type === 'DEFINED') {
                  guarantees.push({
                    insuranceGuaranteeId: guarantees.length + 1 + '',
                    label: 'Kiralık Araç',
                    valueText: `${bestValue.yillikKullanimSayisi || 0} kez/yıl, ${bestValue.tekSeferlikGunSayisi || 0} gün`,
                    amount: 0
                  });
                  
                  if (bestValue.aracSegment) {
                    guarantees.push({
                      insuranceGuaranteeId: guarantees.length + 1 + '',
                      label: 'Kiralık Araç Segmenti',
                      valueText: segmentLabels[bestValue.aracSegment] || bestValue.aracSegment,
                      amount: 0
                    });
                  }
                } else if (bestValue.$type === 'NONE') {
                  guarantees.push({
                    insuranceGuaranteeId: guarantees.length + 1 + '',
                    label: 'Kiralık Araç',
                    valueText: 'Dahil Değil',
                    amount: 0
                  });
                }
              }
            } else if (field === 'onarimServisTuru') {
              guarantees.push({
                insuranceGuaranteeId: guarantees.length + 1 + '',
                label,
                valueText: serviceTypeLabels[bestValue as string] || bestValue as string,
                amount: 0
              });
            } else if (field === 'yedekParcaTuru') {
              guarantees.push({
                insuranceGuaranteeId: guarantees.length + 1 + '',
                label,
                valueText: partTypeLabels[bestValue as string] || bestValue as string,
                amount: 0
              });
            } else if (typeof bestValue === 'object' && bestValue !== null && '$type' in bestValue) {
              const coverageValue = bestValue as CoverageValue;
              
              switch (coverageValue.$type) {
                case 'LIMITLESS':
                  guarantees.push({
                    insuranceGuaranteeId: guarantees.length + 1 + '',
                    label,
                    valueText: 'Limitsiz',
                    amount: 0
                  });
                  break;
                  
                case 'HIGHEST_LIMIT':
                  guarantees.push({
                    insuranceGuaranteeId: guarantees.length + 1 + '',
                    label,
                    valueText: 'Rayiç',
                    amount: 0
                  });
                  break;
                  
                case 'DECIMAL':
                  if (coverageValue.value !== undefined) {
                    guarantees.push({
                      insuranceGuaranteeId: guarantees.length + 1 + '',
                      label,
                      valueText: null,
                      amount: coverageValue.value
                    });
                  }
                  break;
                  
                case 'INCLUDED':
                  guarantees.push({
                    insuranceGuaranteeId: guarantees.length + 1 + '',
                    label,
                    valueText: 'Dahil',
                    amount: 0
                  });
                  break;
                  
                case 'NOT_INCLUDED':
                  guarantees.push({
                    insuranceGuaranteeId: guarantees.length + 1 + '',
                    label,
                    valueText: 'Dahil Değil',
                    amount: 0
                  });
                  break;
                  
                case 'NONE':
                  guarantees.push({
                    insuranceGuaranteeId: guarantees.length + 1 + '',
                    label,
                    valueText: 'Yok',
                    amount: 0
                  });
                  break;
              }
            }
          }
        });
      }

      // Ana teminat tutarını bul (kasko değeri için IMM veya ilk teminat)
      const mainCoverage = guarantees.find(g => 
        g.label.includes('İMM') || g.insuranceGuaranteeId === '1'
      );
      const coverage = mainCoverage?.amount ?? 0;

      // Diğer teminatları features olarak kullan
      const features = guarantees
        .filter((g) => g.insuranceGuaranteeId !== '1' && g.label !== 'İMM Limitli / Limitsiz')
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
    });
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
        const rawProductsResponse = await fetchWithAuth(
          API_ENDPOINTS.PROPOSALS_ID(proposalIdToUse),
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
        
        if (!Array.isArray(productsData)) {
          throw new Error('Ürünler API yanıtı beklenen formatta değil.');
        }

        const processedQuotes = processQuotesData(productsData, currentCompanies);
        
        // Config'de tanımlı productId'leri al
        const allowedProductIds = agencyConfig.homepage.partners.companies.flatMap(c => c.products.kasko || []);
        
        // Hem ACTIVE hem de config'de tanımlı olanları filtrele
        const filteredQuotes = processedQuotes.filter(quote => 
          quote.state === 'ACTIVE' && allowedProductIds.includes(quote.productId)
        );
        
        // Kullanıcıya sadece filtrelenmiş quotes'ları göster
        setQuotes(sortQuotes(filteredQuotes));
        setBestOffers(getBestOffers(filteredQuotes));
        
        // En az bir ACTIVE teklif varsa loading'i false yap
        const hasActiveQuote = filteredQuotes.length > 0;
        if (hasActiveQuote) {
          setIsLoading(false);
        }
        
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
          setIsLoading(false);
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
        setError(err instanceof Error ? err.message : 'Veriler yüklenirken bir sorun oluştu.');
        setQuotes([]);
        setBestOffers([]);
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
  }, [proposalIdToUse, agencyConfig]);

  const filterQuotesByProductIds = (quotes: ProcessedQuote[]) => {
    const allowedProductIds = agencyConfig.homepage.partners.companies.flatMap((company) => 
      company.products.kasko || []
    );
    return quotes.filter((quote) => 
      allowedProductIds.includes(quote.productId) && 
      quote.state === 'ACTIVE'
    );
  };

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

  const handlePurchase = (quoteId: string) => {
    const selectedFullQuote = quotes.find(q => q.id === quoteId);
    
    // YENİ LOGLAR
    if (selectedFullQuote) {
    }
    // YENİ LOGLAR SONU

    if (selectedFullQuote && selectedFullQuote.state === 'ACTIVE') {
      // PurchaseStep için gerekli alanları ekleyerek selectedQuoteForPurchase'ı hazırla
      const purchaseData = {
        ...selectedFullQuote,
        proposalId: proposalId, // proposalId'yi ekliyoruz
        proposalProductId: selectedFullQuote.id, // proposalProductId olarak id'yi kullanıyoruz
        productId: selectedFullQuote.id // productId olarak da id'yi kullanıyoruz (string olarak)
      };
      
      localStorage.setItem('selectedQuoteForPurchase', JSON.stringify(purchaseData));
      // Ana teklif ID'si (proposalId state'inden) localStorage'a yazılıyor.
      localStorage.setItem('proposalIdForKasko', proposalId || '');
      localStorage.setItem('selectedProductIdForKasko', quoteId); 

      if (onSelectQuote) {
        onSelectQuote(quoteId);
      }
      
      // Use onPurchaseClick if provided, otherwise fallback to router.push
      if (onPurchaseClick) {
        onPurchaseClick(quoteId);
      } else {
        router.push(`/purchase/${proposalId}/${quoteId}`);
      }
    } else {
      setError("Bu teklif şu anda satın alım için uygun değil veya aktif değil.");
    }
  };

  const getSelectedPremium = (quote: ProcessedQuote): Premium | undefined => {
    return quote.premiums.find((p) => p.installmentNumber === quote.selectedInstallmentNumber);
  };
  

  
  const sortQuotes = (quotes: ProcessedQuote[]): ProcessedQuote[] => {
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
  };
  
  const getBestOffers = (quotes: ProcessedQuote[]): ProcessedQuote[] => {
    // Always return all quotes for now
    return quotes;
  };
  
  const getHighlightColor = (quote: ProcessedQuote) => {
    // Best offer no longer gets a highlight background
    return 'transparent';
  };

  const isBestOffer = (sortedQuotes: ProcessedQuote[], currentQuoteId: string) => {
    return sortedQuotes.length > 0 && sortedQuotes[0].id === currentQuoteId;
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuoteForModal(null);
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
    } catch (error) {
        setError('Belge görüntülenirken bir hata oluştu.');
    }
  };

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h1" fontWeight="600" gutterBottom>
          Kasko Sigortası Teklifleri
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
          Size en uygun Kasko Sigortası teklifini seçip hemen satın alabilirsiniz
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
          {sortQuotes(getBestOffers(quotes.filter(q => q.state === 'ACTIVE'))).map((quote) => {
            const currentPremium = getSelectedPremium(quote);
            const isFailed = quote.state === 'FAILED';
            const isWaiting = quote.state === 'WAITING';
            const isHovered = hoveredQuote === quote.id;
            const isSelected = selectedQuote === quote.id;
            const highlightColor = getHighlightColor(quote);
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
                  {/* Best Offer Badge - her zaman sola, coverage badge'i yanında */}
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
                        left: 16, // Her zaman sola
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
                        left: sortOption === 'price' && 
                              quotes.filter(q => q.state === 'ACTIVE').length > 1 &&
                              best ? 140 : 16, // En Uygun Fiyat badge'i varsa onun yanında, yoksa sola
                        fontWeight: 'medium',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        zIndex: 1,
                        backgroundColor: '#1976d2',
                        color: 'white',
                        '& .MuiChip-label': {
                          color: 'white'
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
                                  setSelectedQuoteForModal(quote);
                                  setIsModalOpen(true);
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
                      </Box>
                    </Box>

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
            <Typography variant="subtitle2" component="span">Kasko Sigortası Hakkında</Typography>
          </Box>
          Kasko Sigortası, aracınızı çarpma, çizilme, yanma, sel, deprem gibi pek çok riske karşı güvence altına alır. Araç değerinize ve ihtiyaçlarınıza en uygun kasko teklifini seçerek hemen satın alabilirsiniz.
        </Typography>
      </Box>

      {selectedQuoteForModal && (
        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          aria-labelledby="guarantee-dialog-title"
          maxWidth="md"
          fullWidth
          PaperProps={{ 
            sx: { 
              borderRadius: { xs: 2, sm: 3 },
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              m: { xs: 1, sm: 2 },
              height: { xs: '90vh', sm: 'auto' },
              maxHeight: { xs: '90vh', sm: '90vh' }
            } 
          }}
        >
          <DialogTitle 
            id="guarantee-dialog-title"
            sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: { xs: 1, sm: 1.5 },
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              py: { xs: 1, sm: 1.5 },
              px: { xs: 1.5, sm: 3 },
              minHeight: 'auto'
            }}
          >
            <ShieldCheck size={20} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" component="span" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                {selectedQuoteForModal.company}
              </Typography>
              <Typography variant="body2" color="text.secondary" component="div" sx={{ fontSize: { xs: '0.7rem', sm: '0.8rem' } }}>
                Teminat Detayları
              </Typography>
            </Box>
            
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                right: { xs: 8, sm: 16 },
                top: { xs: 8, sm: 16 },
                color: (theme) => theme.palette.grey[500],
                p: 0.5
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          
          <DialogContent dividers sx={{ p: 0 }}>
            {selectedQuoteForModal.insuranceCompanyGuarantees &&
            selectedQuoteForModal.insuranceCompanyGuarantees.length > 0 ? (
              <Box>
                <Box sx={{ px: { xs: 1.5, sm: 3 }, py: { xs: 1.5, sm: 2 }, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'flex-start', sm: 'center' }, 
                    flexWrap: 'wrap', 
                    gap: { xs: 1, sm: 2 } 
                  }}>
                    <Box sx={{ flex: 1, minWidth: { xs: 'auto', sm: 240 } }}>
                      <CompanyLogoWrapper>
                        {selectedQuoteForModal.logo ? (
                          <Box
                            component="img"
                            src={selectedQuoteForModal.logo}
                            alt={selectedQuoteForModal.company}
                            sx={{ height: { xs: 32, sm: 40 } }}
                          />
                        ) : (
                          <Box 
                            sx={{ 
                              bgcolor: 'action.hover', 
                              borderRadius: 1,
                              width: { xs: 40, sm: 50 },
                              height: { xs: 32, sm: 40 },
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
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                            {selectedQuoteForModal.company}
                          </Typography>
                          {selectedQuoteForModal.coverageGroupName && (
                            <Chip
                              label={selectedQuoteForModal.coverageGroupName}
                              size="small"
                              variant="outlined"
                              sx={{
                                backgroundColor: '#1976d2',
                                color: 'white',
                                '& .MuiChip-label': {
                                  color: 'white',
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                },
                                mt: 0.5,
                                height: { xs: 20, sm: 24 }
                              }}
                            />
                          )}
                        </Box>
                      </CompanyLogoWrapper>
                    </Box>
                    <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, mt: { xs: 1, sm: 0 } }}>
                      <Typography variant="h6" color="primary.main" fontWeight="bold" sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
                        {getSelectedPremium(selectedQuoteForModal)?.formattedGrossPremium} ₺
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        {getSelectedPremium(selectedQuoteForModal)?.installmentNumber === 1 
                          ? 'Peşin Ödeme' 
                          : `${getSelectedPremium(selectedQuoteForModal)?.installmentNumber} Taksit`}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                              
                {/* Desktop Table */}
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <TableContainer>
                    <Table stickyHeader aria-label="teminat tablosu">
                                                                <TableHead>
                        <TableRow>
                          <TableCell sx={{ 
                            fontWeight: 'bold', 
                            fontSize: '0.875rem',
                            py: 2
                          }}>
                            Teminat Adı
                          </TableCell>
                          <TableCell align="right" sx={{ 
                            fontWeight: 'bold', 
                            fontSize: '0.875rem',
                            py: 2
                          }}>
                            Limit / Değer
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedQuoteForModal.insuranceCompanyGuarantees
                          ?.filter(guarantee => {
                            // "Belirsiz" değerleri filtrele
                            const value = formatGuaranteeValue(guarantee);
                            return value !== 'Belirsiz';
                          })
                          .sort((a, b) => a.label.localeCompare(b.label))
                          .map((guarantee) => (
                          <TableRow 
                            key={guarantee.insuranceGuaranteeId}
                            sx={{ 
                              '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.1) },
                            }}
                          >
                            <TableCell component="th" scope="row" sx={{ py: 1.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <VerifiedOutlinedIcon 
                                  fontSize="small" 
                                  color="primary" 
                                  sx={{ mr: 1, opacity: 0.7 }} 
                                />
                                {guarantee.label}
                              </Box>
                            </TableCell>
                            <TableCell align="right" sx={{ py: 1.5, fontWeight: 'medium' }}>
                              {formatGuaranteeValue(guarantee)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Mobile Cards */}
                <Box sx={{ display: { xs: 'block', sm: 'none' }, p: 1 }}>
                  {/* Mobile Header */}
                  <Box sx={{ 
                    bgcolor: 'primary.main', 
                    color: 'white', 
                    p: 1.5, 
                    mb: 1, 
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.875rem' }}>
                      Teminat Adı
                    </Typography>
                    <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '0.875rem' }}>
                      Limit / Değer
                    </Typography>
                  </Box>
                  
                  {selectedQuoteForModal.insuranceCompanyGuarantees
                    ?.filter(guarantee => {
                      // "Belirsiz" değerleri filtrele
                      const value = formatGuaranteeValue(guarantee);
                      return value !== 'Belirsiz';
                    })
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .map((guarantee) => (
                    <Card 
                      key={guarantee.insuranceGuaranteeId}
                      sx={{ 
                        mb: 0.5,
                        p: 1.5,
                        '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.1) },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                          <VerifiedOutlinedIcon 
                            fontSize="small" 
                            color="primary" 
                            sx={{ mr: 1, opacity: 0.7, flexShrink: 0 }} 
                          />
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: '0.8rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {guarantee.label}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="body2" 
                          fontWeight="medium" 
                          sx={{ 
                            fontSize: '0.8rem',
                            ml: 1,
                            flexShrink: 0
                          }}
                        >
                          {formatGuaranteeValue(guarantee)}
                        </Typography>
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary" align="center">
                  Bu teklif için detaylı teminat bilgisi bulunmamaktadır.
                </Typography>
              </Box>
            )}
          </DialogContent>
          
          <DialogActions sx={{ 
            p: { xs: 1.5, sm: 2 }, 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            gap: { xs: 1.5, sm: 0 }
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              Teminat detayları sigorta şirketinin teklif belgesinden ve servislerinden alınan değerler aracılığıyla sunulmaktadır. Daha detaylı sorularınız için{' '}
              <a 
                href={`tel:${agencyConfig.phone?.primary?.replace(/\s/g, '') || '08504040404'}`}
                style={{ 
                  color: agencyConfig.theme.primaryColor, 
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                {agencyConfig.phone?.primary || '0850 404 04 04'}
              </a>
              {' '}numaralı telefon numarasından müşteri temsilcilerimize ulaşabilirsiniz.
            </Typography>
            
            <Box >
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  handleCloseModal();
                  handlePurchase(selectedQuoteForModal.id);
                }}
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  bgcolor: agencyConfig.theme.primaryColor,
                  '&:hover': {
                    bgcolor: alpha(agencyConfig.theme.primaryColor, 0.9),
                  },
                  width: { xs: '100%', sm: '160px' },
                  whiteSpace: 'nowrap',
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
                disableElevation
              >
                Satın Al
              </Button>
            </Box>
          </DialogActions>
        </Dialog>
      )}

      {/* Karşılaştırma Modal'ı */}
      <QuoteComparisonModal
        open={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        quotes={convertQuotesForComparison(quotes.filter(q => q.state === 'ACTIVE'))}
        title="Kasko Sigortası"
        onPurchase={handlePurchase}
        maxQuotes={3}
      />

      {/* "Önceki Adıma Dön" butonu kaldırıldı */}
    </>
  );
}
