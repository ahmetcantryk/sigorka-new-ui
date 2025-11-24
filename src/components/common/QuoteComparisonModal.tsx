"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  useTheme,
  alpha,
  useMediaQuery,
  Card,
  CardContent,
  Stack
} from '@mui/material';
import {
  Close as CloseIcon,
  CompareArrows as CompareArrowsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useState } from 'react';

// Genel Quote interface'i - farklı sigorta türleri için kullanılabilir
export interface QuoteForComparison {
  id: string;
  company?: string;
  logo?: string;
  premiums: Array<{
    installmentNumber: number;
    grossPremium: number;
    formattedGrossPremium?: string;
  }>;
  insuranceCompanyGuarantees?: Array<{
    insuranceGuaranteeId: string;
    label: string;
    valueText: string | null;
    amount: number;
  }>;
  coverageGroupName?: string;
  selectedInstallmentNumber: number;
}

interface QuoteComparisonModalProps {
  open: boolean;
  onClose: () => void;
  quotes: QuoteForComparison[];
  title: string;
  onPurchase?: (quoteId: string) => void;
  maxQuotes?: number;
}

const QuoteComparisonModal: React.FC<QuoteComparisonModalProps> = ({
  open,
  onClose,
  quotes,
  title,
  onPurchase,
  maxQuotes = 3
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedQuotes, setSelectedQuotes] = useState<string[]>([]);

  // Seçili teklifleri toggle et
  const toggleQuoteSelection = (quoteId: string) => {
    setSelectedQuotes(prev => {
      if (prev.includes(quoteId)) {
        // Eğer teklif zaten seçiliyse, çıkar
        return prev.filter(id => id !== quoteId);
      } else if (prev.length < maxQuotes) {
        // Eğer limit dolmadıysa, ekle
        return [...prev, quoteId];
      } else {
        // Eğer limit dolduysa, en eski seçimi çıkarıp yenisini ekle
        return [...prev.slice(1), quoteId];
      }
    });
  };

  // Seçili teklifleri al
  const getSelectedQuotesData = () => {
    return quotes.filter(quote => selectedQuotes.includes(quote.id));
  };

  // Premium bilgisini al
  const getSelectedPremium = (quote: QuoteForComparison) => {
    return quote.premiums.find(p => p.installmentNumber === quote.selectedInstallmentNumber);
  };

  // Tüm teminatları topla (unique)
  const getAllGuarantees = () => {
    const allGuarantees = new Map<string, string>();
    
    getSelectedQuotesData().forEach(quote => {
      quote.insuranceCompanyGuarantees?.forEach(guarantee => {
        if (!allGuarantees.has(guarantee.label)) {
          allGuarantees.set(guarantee.label, guarantee.label);
        }
      });
    });

    return Array.from(allGuarantees.keys()).sort();
  };

  // Belirli bir teklif için teminat değeri al
  const getGuaranteeValue = (quote: QuoteForComparison, guaranteeLabel: string) => {
    const guarantee = quote.insuranceCompanyGuarantees?.find(g => g.label === guaranteeLabel);
    if (!guarantee) return '-';
    
    if (guarantee.valueText) return guarantee.valueText;
    if (guarantee.amount) {
      return guarantee.amount.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + ' ₺';
    }
    return '-';
  };

  const selectedQuotesData = getSelectedQuotesData();
  const allGuarantees = getAllGuarantees();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : '90vh',
          height: isMobile ? '100vh' : 'auto'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        pb: 2
      }}>
        <CompareArrowsIcon color="primary" />
                  <Box sx={{ flex: 1 }}>
            <Typography variant="h6" component="div">
              {title} - Teklif Karşılaştırması
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Karşılaştırmak için en fazla {maxQuotes} teklif seçebilirsiniz. {maxQuotes} teklif seçtikten sonra yeni bir teklif seçerseniz, en eski seçim otomatik olarak kaldırılır.
            </Typography>
          </Box>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ color: 'grey.500' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {quotes.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Karşılaştırılacak teklif bulunamadı.
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* Teklif Seçim Bölümü */}
            <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Karşılaştırmak İstediğiniz Teklifleri Seçin
                {selectedQuotes.length >= maxQuotes && (
                  <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1, fontWeight: 'normal' }}>
                    (Yeni seçim yapmak için mevcut seçimleri değiştirebilirsiniz)
                  </Typography>
                )}
              </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 2,
                  mt: 2
                }}>
                  {quotes.map(quote => {
                    const isSelected = selectedQuotes.includes(quote.id);
                    const premium = getSelectedPremium(quote);
                    
                    return (
                      <Card
                        key={quote.id}
                        sx={{
                          minWidth: 250,
                          cursor: 'pointer',
                          border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          bgcolor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                          '&:hover': {
                            borderColor: 'primary.main',
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[4]
                          },
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => toggleQuoteSelection(quote.id)}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            {quote.logo ? (
                              <Box
                                component="img"
                                src={quote.logo}
                                alt={quote.company}
                                sx={{ height: 30, maxWidth: 80, objectFit: 'contain' }}
                              />
                            ) : (
                              <Box sx={{ 
                                width: 40, 
                                height: 30, 
                                bgcolor: 'action.hover', 
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                🏢
                              </Box>
                            )}
                            <Typography variant="subtitle2" fontWeight="medium">
                              {quote.company}
                            </Typography>
                          </Box>
                          
                          {quote.coverageGroupName && (
                            <Chip
                              label={quote.coverageGroupName}
                              size="small"
                              sx={{ mb: 1, fontSize: '0.7rem' }}
                            />
                          )}
                          
                          <Typography variant="h6" color="primary.main" fontWeight="bold">
                            {premium?.formattedGrossPremium} ₺
                          </Typography>
                          
                          <Typography variant="caption" color="text.secondary">
                            {premium?.installmentNumber === 1 ? 'Peşin' : `${premium?.installmentNumber} Taksit`}
                          </Typography>
                          
                          {isSelected && (
                            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CheckCircleIcon color="primary" fontSize="small" />
                              <Typography variant="caption" color="primary.main" fontWeight="medium">
                                Seçildi ({selectedQuotes.indexOf(quote.id) + 1}. sırada)
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </Box>
              </Box>

            {/* Karşılaştırma Tablosu */}
            {selectedQuotesData.length > 0 && (
              <Box sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight="medium" gutterBottom sx={{ mb: 3 }}>
                  Seçili Teklifler Karşılaştırması ({selectedQuotesData.length} teklif)
                </Typography>

                {/* Desktop Karşılaştırma Tablosu */}
                <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                  <TableContainer 
                    component={Paper} 
                    sx={{ 
                      maxHeight: 600, 
                      overflow: 'auto',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2
                    }}
                  >
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ 
                            fontWeight: 'bold', 
                            bgcolor: 'background.paper',
                            minWidth: 200,
                            position: 'sticky',
                            left: 0,
                            top: 0,
                            zIndex: 3,
                            borderRight: '2px solid',
                            borderColor: 'divider',
                            boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
                          }}>
                            Özellik
                          </TableCell>
                          {selectedQuotesData.map(quote => (
                            <TableCell 
                              key={quote.id} 
                              align="center" 
                              sx={{ 
                                fontWeight: 'bold',
                                minWidth: 200,
                                bgcolor: 'background.paper',
                                position: 'sticky',
                                top: 0,
                                zIndex: 2
                              }}
                            >
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                {quote.logo ? (
                                  <Box
                                    component="img"
                                    src={quote.logo}
                                    alt={quote.company}
                                    sx={{ height: 32, maxWidth: 100, objectFit: 'contain' }}
                                  />
                                ) : (
                                  <Typography variant="body2" fontWeight="bold">
                                    {quote.company}
                                  </Typography>
                                )}
                                {quote.coverageGroupName && (
                                  <Chip
                                    label={quote.coverageGroupName}
                                    size="small"
                                    sx={{ fontSize: '0.7rem' }}
                                  />
                                )}
                              </Box>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Fiyat Karşılaştırması */}
                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                          <TableCell sx={{ 
                            fontWeight: 'bold',
                            position: 'sticky',
                            left: 0,
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                            zIndex: 1,
                            borderRight: '2px solid',
                            borderColor: 'divider',
                            boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
                          }}>
                            Fiyat
                          </TableCell>
                          {selectedQuotesData.map(quote => {
                            const premium = getSelectedPremium(quote);
                            return (
                              <TableCell key={quote.id} align="center">
                                <Box>
                                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                                    {premium?.formattedGrossPremium} ₺
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {premium?.installmentNumber === 1 ? 'Peşin' : `${premium?.installmentNumber} Taksit`}
                                  </Typography>
                                </Box>
                              </TableCell>
                            );
                          })}
                        </TableRow>

                        {/* Teminat Karşılaştırması */}
                        {allGuarantees.map(guaranteeLabel => (
                          <TableRow key={guaranteeLabel}>
                            <TableCell sx={{ 
                              fontWeight: 'medium',
                              position: 'sticky',
                              left: 0,
                              bgcolor: 'background.paper',
                              zIndex: 1,
                              borderRight: '2px solid',
                              borderColor: 'divider',
                              boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
                            }}>
                              {guaranteeLabel}
                            </TableCell>
                            {selectedQuotesData.map(quote => {
                              const value = getGuaranteeValue(quote, guaranteeLabel);
                              const hasValue = value !== '-' && value !== 'Belirsiz' && value !== 'Dahil Değil';
                              
                              return (
                                <TableCell key={quote.id} align="center">
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                    {hasValue && value !== 'Yok' && (
                                      <CheckCircleIcon 
                                        fontSize="small" 
                                        sx={{ color: 'success.main' }} 
                                      />
                                    )}
                                    {(value === '-' || value === 'Dahil Değil' || value === 'Yok') && (
                                      <CancelIcon 
                                        fontSize="small" 
                                        sx={{ color: 'error.main' }} 
                                      />
                                    )}
                                    <Typography 
                                      variant="body2" 
                                      color={hasValue && value !== 'Yok' ? 'text.primary' : 'text.secondary'}
                                      fontWeight={hasValue && value !== 'Yok' ? 'medium' : 'normal'}
                                    >
                                      {value}
                                    </Typography>
                                  </Box>
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                {/* Mobile Karşılaştırma Kartları */}
                <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                  <Stack spacing={3}>
                    {selectedQuotesData.map(quote => {
                      const premium = getSelectedPremium(quote);
                      return (
                        <Card key={quote.id} sx={{ border: '1px solid', borderColor: 'divider' }}>
                          <CardContent>
                            {/* Başlık */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                              {quote.logo ? (
                                <Box
                                  component="img"
                                  src={quote.logo}
                                  alt={quote.company}
                                  sx={{ height: 32, maxWidth: 100, objectFit: 'contain' }}
                                />
                              ) : (
                                <Typography variant="subtitle1" fontWeight="bold">
                                  {quote.company}
                                </Typography>
                              )}
                              {quote.coverageGroupName && (
                                <Chip
                                  label={quote.coverageGroupName}
                                  size="small"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>

                            {/* Fiyat */}
                            <Box sx={{ 
                              p: 2, 
                              bgcolor: alpha(theme.palette.primary.main, 0.05), 
                              borderRadius: 1, 
                              mb: 2 
                            }}>
                              <Typography variant="h6" color="primary.main" fontWeight="bold">
                                {premium?.formattedGrossPremium} ₺
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {premium?.installmentNumber === 1 ? 'Peşin' : `${premium?.installmentNumber} Taksit`}
                              </Typography>
                            </Box>

                            {/* Teminatlar */}
                            <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                              Teminatlar
                            </Typography>
                            <Stack spacing={1}>
                              {allGuarantees.map(guaranteeLabel => {
                                const value = getGuaranteeValue(quote, guaranteeLabel);
                                const hasValue = value !== '-' && value !== 'Belirsiz' && value !== 'Dahil Değil';
                                
                                return (
                                  <Box 
                                    key={guaranteeLabel}
                                    sx={{ 
                                      display: 'flex', 
                                      justifyContent: 'space-between', 
                                      alignItems: 'center',
                                      p: 1,
                                      bgcolor: 'background.default',
                                      borderRadius: 1
                                    }}
                                  >
                                    <Typography variant="body2">
                                      {guaranteeLabel}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      {hasValue && value !== 'Yok' && (
                                        <CheckCircleIcon 
                                          fontSize="small" 
                                          sx={{ color: 'success.main' }} 
                                        />
                                      )}
                                      {(value === '-' || value === 'Dahil Değil' || value === 'Yok') && (
                                        <CancelIcon 
                                          fontSize="small" 
                                          sx={{ color: 'error.main' }} 
                                        />
                                      )}
                                      <Typography 
                                        variant="body2" 
                                        color={hasValue && value !== 'Yok' ? 'text.primary' : 'text.secondary'}
                                        fontWeight={hasValue && value !== 'Yok' ? 'medium' : 'normal'}
                                      >
                                        {value}
                                      </Typography>
                                    </Box>
                                  </Box>
                                );
                              })}
                            </Stack>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </Stack>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          width: '100%',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Typography variant="caption" color="text.secondary">
            <InfoIcon fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
            Teminat detayları sigorta şirketlerinden alınan bilgiler doğrultusunda gösterilmektedir.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button onClick={onClose} variant="outlined">
              Kapat
            </Button>
            {selectedQuotesData.length > 0 && onPurchase && (
              <Button
                variant="contained"
                onClick={() => {
                  // En düşük fiyatlı teklifi otomatik seç
                  const cheapestQuote = selectedQuotesData.reduce((prev, curr) => {
                    const prevPremium = getSelectedPremium(prev);
                    const currPremium = getSelectedPremium(curr);
                    return (currPremium?.grossPremium || 0) < (prevPremium?.grossPremium || 0) ? curr : prev;
                  });
                  onPurchase(cheapestQuote.id);
                  onClose();
                }}
              >
                En Uygun Teklifi Seç
              </Button>
            )}
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default QuoteComparisonModal;
