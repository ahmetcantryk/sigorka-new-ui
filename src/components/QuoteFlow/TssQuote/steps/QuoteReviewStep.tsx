// import CompareArrowsIcon from '@mui/icons-material/CompareArrows'; // Kullanılmıyor
import ListAltIcon from '@mui/icons-material/ListAlt';
import CloseIcon from '@mui/icons-material/Close';
import { FileText } from 'lucide-react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  Alert,
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
  Paper,
  AlertTitle,
} from '@mui/material';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../../../store/useAuthStore';
import { useAgencyConfig } from '../../../../context/AgencyConfigProvider';
import { useParams, useRouter } from 'next/navigation';
import { fetchWithAuth } from '../../../../services/fetchWithAuth';
import { API_BASE_URL, API_ENDPOINTS } from '../../../../config/api';

interface QuoteComparisonStepProps {
  proposalId: string | null;
  onBack?: () => void;
  handleContinue?: () => void;
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

interface ProcessedQuote extends Quote {
  selectedInstallmentNumber: number;
}

export default function QuoteComparisonStep({
  proposalId: initialProposalId,
  onBack,
  handleContinue,
}: QuoteComparisonStepProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [quotes, setQuotes] = useState<ProcessedQuote[]>([]);
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuoteForModal, setSelectedQuoteForModal] = useState<ProcessedQuote | null>(null);
  const agencyConfig = useAgencyConfig();
  const params = useParams();
  const router = useRouter();
  const [proposalId, setProposalId] = useState<string | null>(initialProposalId || null);

  useEffect(() => {
    const urlProposalId = params?.proposalId as string | undefined;
    const storedProposalId = localStorage.getItem('proposalIdForTss');
    if (storedProposalId) {
      setProposalId(storedProposalId);
    } else if (urlProposalId) {
      setProposalId(urlProposalId);
    } else {
      setError('TSS teklif ID bilgisi bulunamadı. Lütfen önceki adıma dönüp tekrar deneyin.');
      setIsLoading(false);
    }
  }, [params]);

  const processQuotesData = useCallback((quotesData: Quote[], currentCompanies: InsuranceCompany[]): ProcessedQuote[] => {
    if (!Array.isArray(quotesData)) {
      return [];
    }
    return quotesData.map((quote: Quote) => {
      const company = currentCompanies.find((c) => c.id === quote.insuranceCompanyId);

      const uniquePremiums = quote.premiums.reduce((acc: Premium[], current) => {
        const isDuplicate = acc.some(
          (item) => item.installmentNumber === current.installmentNumber
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

      const initialSelectedInstallment =
        formattedPremiums.length > 0 ? formattedPremiums[0].installmentNumber : 1;

      const coverage =
        quote.insuranceCompanyGuarantees.find((g) => g.insuranceGuaranteeId === '1')
          ?.amount ?? 0;

      const features = quote.insuranceCompanyGuarantees
        .filter((g) => g.insuranceGuaranteeId !== '1')
        .map((g) => g.label);

      return {
        ...quote,
        premiums: formattedPremiums,
        company: company?.name || `Sigorta Şirketi #${quote.insuranceCompanyId}`,
        coverage,
        features,
        logo:
          company?.logo ||
          `https://storage.dogasigorta.com/app-1/insurup-b2c-company/${quote.insuranceCompanyId}.png`,
        selectedInstallmentNumber: initialSelectedInstallment,
      };
    });
  }, []);

  const getSelectedPremium = useCallback((quote: ProcessedQuote): Premium | undefined => {
    return quote.premiums.find((p) => p.installmentNumber === quote.selectedInstallmentNumber);
  }, []);

  const sortQuotes = useCallback((quotesToSort: ProcessedQuote[]): ProcessedQuote[] => {
    return [...quotesToSort].sort((a, b) => {
      const aPremium = getSelectedPremium(a);
      const bPremium = getSelectedPremium(b);
      
      if (!aPremium || !bPremium) return 0;
      return aPremium.grossPremium - bPremium.grossPremium;
    });
  }, [getSelectedPremium]);

  const filterQuotesByProductIds = (quotes: ProcessedQuote[]) => {
    const allowedProductIds = agencyConfig.homepage.partners.companies.flatMap(
      (company) =>
        (company.products as { tss?: number[] }).tss ?? []
    );
    return quotes.filter(
      (quote) =>
        allowedProductIds.includes(quote.productId) &&
        (quote.state === 'ACTIVE' || quote.state === 'WAITING')
    );
  };

  useEffect(() => {
    let isPollingActive = true;
    let pollInterval: NodeJS.Timeout | null = null;
    const startTime = Date.now();

    const fetchCompaniesAndQuotes = async () => {
      if (!proposalId) return;
      
      const currentAccessToken = useAuthStore.getState().accessToken;
      if (!currentAccessToken) {
        setError('Yetkilendirme anahtarı bulunamadı.');
        setIsLoading(false);
        return;
      }

      try {
        // Şirketleri sadece bir kez çek
        let currentCompanies = companies;
        if (currentCompanies.length === 0) {
          const rawCompanyResponse = await fetchWithAuth(`${API_BASE_URL}/api/insurance-companies`, {
            headers: { Authorization: `Bearer ${currentAccessToken}` },
          });
          if (!rawCompanyResponse.ok) throw new Error('Şirket bilgileri alınamadı.');
          currentCompanies = await rawCompanyResponse.json();
          setCompanies(currentCompanies);
        }

        // Teklifleri çek
        const rawProductsResponse = await fetchWithAuth(
          `${API_BASE_URL}${API_ENDPOINTS.PROPOSALS_ID(proposalId)}`,
          { headers: { Authorization: `Bearer ${currentAccessToken}` } }
        );
        if (!rawProductsResponse.ok) throw new Error('Proposal bilgileri alınamadı.');
        const proposalData = await rawProductsResponse.json();
        const productsData = proposalData.products;

        if (!Array.isArray(productsData)) {
            throw new Error('Ürünler API yanıtı beklenen formatta değil.');
        }

        const processedQuotes = processQuotesData(productsData, currentCompanies);

        const activeQuotes = processedQuotes.filter(quote => quote.state === 'ACTIVE');
        setQuotes(sortQuotes(activeQuotes));
        
        const allowedProductIds = agencyConfig.homepage.partners.companies.flatMap(
            (c) => (c.products as { tss?: number[] }).tss ?? []
        );
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
            if (pollInterval) {
                clearInterval(pollInterval);
            }
            setIsLoading(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Teklifler alınırken bir hata oluştu.');
        setIsLoading(false);
        if (pollInterval) clearInterval(pollInterval);
      }
    };

    const startPolling = () => {
        if (!proposalId) {
            setError('Teklif ID bulunamadı.');
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setError(null);
        
        fetchCompaniesAndQuotes(); // İlk çağrı
        
        pollInterval = setInterval(() => {
            if (isPollingActive) {
                fetchCompaniesAndQuotes();
            }
        }, 5000);
    };

    startPolling();

    return () => {
      isPollingActive = false;
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [proposalId, agencyConfig, companies, processQuotesData, sortQuotes]);

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

  const handleOpenModal = (quote: ProcessedQuote) => {
    setSelectedQuoteForModal(quote);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuoteForModal(null);
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

  const handleViewDocument = async (proposalId: string, productId: string) => {
    try {
      const tokenToUse = useAuthStore.getState().accessToken || '';
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/proposals/${proposalId}/products/${productId}/documents/preinfoform`,
        { headers: { Authorization: `Bearer ${tokenToUse}` } }
      );
      if (!response.ok) throw new Error('Belge indirilemedi');
      const data = await response.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        throw new Error("Döküman URL'si bulunamadı");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Belge görüntülenirken bir hata oluştu.');
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Teklifler Yükleniyor...</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {quotes.length > 0 ? (
            quotes.map((quote) => (
              <Grid item xs={12} key={quote.id}>
                <Card
                  variant="outlined"
                  sx={{
                    mb: 2,
                    border: selectedQuote === quote.id ? '2px solid' : '1px solid',
                    borderColor: selectedQuote === quote.id ? 'primary.main' : 'grey.300',
                    cursor: 'pointer',
                  }}
                  onClick={() => handleQuoteSelect(quote.id)}
                >
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={3}>
                        <Box sx={{ textAlign: 'center' }}>
                          <img
                            src={quote.logo}
                            alt={quote.company}
                            style={{
                              maxHeight: '40px',
                              objectFit: 'contain',
                              marginBottom: '8px',
                            }}
                          />
                          <Typography variant="subtitle1" fontWeight="bold">
                            {quote.company}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={12} sm={6}>
                            <Typography variant="h5" fontWeight="bold" color="primary">
                              {getSelectedPremium(quote)?.formattedGrossPremium} ₺
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl fullWidth size="small">
                              <Select
                                value={quote.selectedInstallmentNumber}
                                onChange={(e) =>
                                  handleInstallmentChange(
                                    quote.id,
                                    e.target.value as number
                                  )
                                }
                              >
                                {quote.premiums.map((premium) => (
                                  <MenuItem
                                    key={premium.installmentNumber}
                                    value={premium.installmentNumber}
                                  >
                                    {premium.installmentNumber === 1
                                      ? `Peşin: ${premium.formattedGrossPremium} ₺`
                                      : `${premium.installmentNumber} Taksit: ${premium.formattedGrossPremium} ₺`}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          </Grid>
                        </Grid>
                      </Grid>

                      <Grid item xs={12} md={3}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          {quote.state === 'FAILED' ? (
                            <Alert severity="error" sx={{ width: '100%', my:1 }}>
                              {quote.errorMessage || 'Bu teklif alınamadı.'}
                            </Alert>
                          ) : (
                            <>
                              <Tooltip title="Teminat Detayları">
                                <IconButton onClick={(e) => { e.stopPropagation(); handleOpenModal(quote); }}>
                                  <ListAltIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Teklif Formu">
                                <IconButton
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDocument(proposalId || '', quote.id)
                                  }}
                                >
                                  <FileText />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </Grid>

                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">
                <AlertTitle>Uygun Teklif Bulunamadı</AlertTitle>
                Girdiğiniz bilgilere uygun bir teklif bulunamadı.
              </Alert>
            </Grid>
          )}
        </Grid>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        {onBack && (
          <Button variant="outlined" onClick={onBack}>
            Geri
          </Button>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={handleContinue}
          disabled={!selectedQuote || isLoading}
        >
          Devam Et
        </Button>
      </Box>

      {selectedQuoteForModal && (
        <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedQuoteForModal.company} - Teminat Detayları
            <IconButton
              aria-label="close"
              onClick={handleCloseModal}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Teminat Adı</TableCell>
                    <TableCell align="right">Limit / Değer</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedQuoteForModal.insuranceCompanyGuarantees.map((guarantee) => (
                    <TableRow key={guarantee.insuranceGuaranteeId}>
                      <TableCell>{guarantee.label}</TableCell>
                      <TableCell align="right">{formatGuaranteeValue(guarantee)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Kapat</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}
