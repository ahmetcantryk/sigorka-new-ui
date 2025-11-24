import {
  Box,
  Button,
  Divider,
  Grid,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import { useAuthStore } from '../../../../store/useAuthStore';
import { fetchWithAuth } from '../../../../services/fetchWithAuth';

interface QuoteReviewStepProps {
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  quoteData?: any; // API'den gelen teklif verilerini içerir
  loading?: boolean; // Tekliflerin yüklenme durumunu belirtir
  formData?: any; // Önceki form verilerini içerir
}

interface QuoteType {
  id: string;
  companyName: string;
  price: number;
  coverage: number;
  discount: number;
  recommended: boolean;
  features: string[];
}

// API'den veri yoksa kullanacağımız örnek teklif verileri
const mockQuotes = [
  {
    id: '1',
    companyName: 'Anadolu Sigorta',
    price: 890,
    coverage: 240000,
    discount: 15,
    recommended: true,
    features: ['7/24 Müşteri Hizmetleri', 'Online Hasar İhbarı', 'Anında Poliçe'],
  },
  {
    id: '2',
    companyName: 'Allianz Sigorta',
    price: 950,
    coverage: 240000,
    discount: 10,
    recommended: false,
    features: ['7/24 Müşteri Hizmetleri', 'Mobil Uygulama'],
  },
  {
    id: '3',
    companyName: 'Axa Sigorta',
    price: 870,
    coverage: 220000,
    discount: 20,
    recommended: false,
    features: ['Online Hasar İhbarı', 'WhatsApp Destek'],
  },
];

export default function QuoteReviewStep({
  onBack,
  isLastStep,
  quoteData,
  loading = false,
  formData,
}: QuoteReviewStepProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(loading);
  const [quotes, setQuotes] = useState<QuoteType[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<string | null>(null);
  const [processingPurchase, setProcessingPurchase] = useState(false);

  // Token almak için auth store'u kullanıyoruz
  const token = useAuthStore((state) => state.token);
  const customerData = useAuthStore((state) => state.customerData);

  // Component yüklendiğinde veya quoteData değiştiğinde teklifleri güncelleriz
  useEffect(() => {
    if (quoteData?.quotes) {
      setQuotes(quoteData.quotes);

      // Önerilen teklifi otomatik seçme
      const recommendedQuote = quoteData.quotes.find((q: QuoteType) => q.recommended);
      if (recommendedQuote) {
        setSelectedQuote(recommendedQuote.id);
      }

      setIsLoading(false);
    } else if (!loading) {
      // API'den veri yoksa örnek verileri kullanırız
      setQuotes(mockQuotes);

      // Önerilen teklifi otomatik seçme
      const recommendedQuote = mockQuotes.find((q) => q.recommended);
      if (recommendedQuote) {
        setSelectedQuote(recommendedQuote.id);
      }

      setIsLoading(false);
    }
  }, [quoteData, loading]);

  const handleQuoteSelect = (quoteId: string) => {
    setSelectedQuote(quoteId);
  };

  const handlePurchase = async () => {
    if (!selectedQuote || !token) return;

    setProcessingPurchase(true);

    try {
      // Seçilen teklifi buluyoruz
      const selectedQuoteData = quotes.find((q) => q.id === selectedQuote);

      // Satın alma isteği için verileri hazırlıyoruz
      const purchaseData = {
        quoteId: selectedQuote,
        personalInfo: formData?.personalInfo || {},
        propertyInfo: formData?.propertyInfo || {},
        additionalInfo: formData?.additionalInfo || {},
        quoteDetails: selectedQuoteData,
        customerId: customerData?.id || '',
      };

      // API çağrısı yapıyoruz (isteğe bağlı)
      // const response = await axios.post('/api/dask/purchase', purchaseData, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });

      // API çağrısını simüle ediyoruz
      setTimeout(() => {
        setProcessingPurchase(false);
        // Başarılı alımdan sonra poliçelere yönlendirme
        navigate('/dashboard/policies');
      }, 2000);
    } catch (error) {
      setProcessingPurchase(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Konut Sigortası Teklifleriniz
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph align="center">
        Size özel hazırlanmış Konut sigortası tekliflerini inceleyebilir ve size en uygun olanı
        seçebilirsiniz.
      </Typography>

      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            my: 6,
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Teklifler hazırlanıyor...
          </Typography>
        </Box>
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="subtitle2">
              Konut sigorta teklifleri karşılaştırma sonuçları
            </Typography>
            <Typography variant="body2">
              Gayrimenkul bilgilerinize göre belirlenen, size özel teklifler aşağıda
              listelenmektedir. Kendinize en uygun teklifi seçerek işleminize devam edebilirsiniz.
            </Typography>
          </Alert>

          <TableContainer component={Paper} sx={{ mb: 4, boxShadow: 3 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'primary.main' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sigorta Şirketi</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Teminat Tutarı</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Avantajlar</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', textAlign: 'right' }}>
                    Fiyat
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow
                    key={quote.id}
                    hover
                    selected={selectedQuote === quote.id}
                    onClick={() => handleQuoteSelect(quote.id)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: selectedQuote === quote.id ? 'primary.50' : 'inherit',
                      '&.Mui-selected': {
                        bgcolor: 'primary.50',
                      },
                      '&.Mui-selected:hover': {
                        bgcolor: 'primary.100',
                      },
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {quote.recommended && (
                          <StarIcon color="warning" fontSize="small" sx={{ mr: 1 }} />
                        )}
                        <Box>
                          <Typography variant="subtitle2">{quote.companyName}</Typography>
                          {quote.recommended && (
                            <Chip
                              label="Önerilen Teklif"
                              color="warning"
                              size="small"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{quote.coverage.toLocaleString('tr-TR')} ₺</TableCell>
                    <TableCell>
                      <Box>
                        {quote.features.map((feature, index) => (
                          <Typography
                            key={index}
                            variant="body2"
                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5, my: 0.5 }}
                          >
                            <CheckCircleOutlineIcon fontSize="small" color="primary" />
                            {feature}
                          </Typography>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Box>
                        {quote.discount > 0 && (
                          <Chip
                            label={`%${quote.discount} İndirim`}
                            color="success"
                            size="small"
                            sx={{ mb: 1 }}
                          />
                        )}
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          {quote.price.toLocaleString('tr-TR')} ₺
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant={selectedQuote === quote.id ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuoteSelect(quote.id);
                        }}
                      >
                        {selectedQuote === quote.id ? 'Seçildi' : 'Seç'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {selectedQuote && (
            <Paper variant="outlined" sx={{ p: 3, mb: 4 }}>
              <Typography variant="subtitle2" gutterBottom>
                Konut (Doğal Afet Sigortaları Kurumu) Hakkında Önemli Bilgiler
              </Typography>
              <Typography variant="body2" paragraph>
                DASK, 6305 Sayılı Afet Sigortaları Kanunu gereğince zorunlu bir sigorta ürünüdür.
                Bina tescil belgesine sahip tüm konutlar için yaptırılması zorunludur.
              </Typography>
              <Typography variant="body2">
                Seçtiğiniz poliçe, tapu işlemleri, elektrik ve su abonelik işlemleri için gerekli
                olacaktır.
              </Typography>
            </Paper>
          )}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={onBack}
              disabled={processingPurchase}
            >
              Geri
            </Button>
            <Button
              variant="contained"
              color="primary"
              disabled={!selectedQuote || processingPurchase}
              onClick={handlePurchase}
              startIcon={processingPurchase ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {processingPurchase ? 'İşleniyor...' : 'Satın Al'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
