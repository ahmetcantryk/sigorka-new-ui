import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { fetchWithAuth } from '../../../../services/fetchWithAuth';

interface TssPurchaseStepProps {
  proposalId?: string;
  productId?: string;
  onNext: () => void;
}

interface SelectedQuoteData {
  // QuoteReviewStep'ten localStorage'a kaydedilen veri yapısını buraya tanımlayın
  // Örnek:
  company?: string;
  premiums?: Array<{ installmentNumber: number; formattedGrossPremium?: string }>;
  selectedInstallmentNumber?: number;
  // ... diğer gerekli alanlar
}

export default function TssPurchaseStep({ proposalId, productId, onNext }: TssPurchaseStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuoteInfo, setSelectedQuoteInfo] = useState<SelectedQuoteData | null>(null);

  // 🧹 Satın alma ve Paratika süreciyle ilgili tüm localStorage verilerini temizle
  const cleanupLocalStorage = () => {
    
    // Paratika ile ilgili veriler
    localStorage.removeItem('paratika_3d_result');
    localStorage.removeItem('paratika_3d_status');
    localStorage.removeItem('paratika_3d_error');
    localStorage.removeItem('paratika3dHtmlContent');
    localStorage.removeItem('paratika_merchantPaymentId');
    localStorage.removeItem('paratikaSessionToken');
    localStorage.removeItem('paratika_3d_url');
    localStorage.removeItem('paratika_3d_params');
    
    // Purchase süreci ile ilgili veriler
    localStorage.removeItem('pendingPaymentData');
    localStorage.removeItem('purchaseReturnUrl');
    localStorage.removeItem('paratika_purchase_status');
    localStorage.removeItem('paratika_purchase_result');
    localStorage.removeItem('paratika_purchase_error');
    localStorage.removeItem('current_order_data');
    
    // TSS özel verileri
    localStorage.removeItem('proposalIdForTss');
    localStorage.removeItem('selectedProductIdForTss');
    localStorage.removeItem('selectedQuoteForTss');
    
  };

  useEffect(() => {
    // LocalStorage'dan seçilen teklif bilgilerini oku
    const storedData = localStorage.getItem('selectedQuoteForTss');
    if (storedData) {
      try {
        setSelectedQuoteInfo(JSON.parse(storedData));
      } catch (parseError) {
        setError('Seçilen teklif bilgileri okunamadı.');
      }
    } else {
      setError('Seçilen teklif bilgisi bulunamadı.');
    }
  }, []);

  const handlePurchase = async () => {
    setIsLoading(true);
    setError(null);

    // --- GERÇEK SATIN ALMA API ÇAĞRISI BURADA YAPILMALI ---
    // Örnek: const response = await fetchWithAuth('/api/tss/purchase', { ... });
    // Yanıta göre setError veya onNext çağrılmalı

    await new Promise(resolve => setTimeout(resolve, 1500)); // Simülasyon

    // Başarılı olursa:
    // localStorage.removeItem('selectedQuoteForTss'); // Temizle
    // localStorage.removeItem('proposalIdForTss');
    // localStorage.removeItem('selectedProductIdForTss');
    // onNext();

    // Başarısız olursa:
    // setError('Satın alma işlemi sırasında bir hata oluştu.');

    // Şimdilik sadece log basıp sonraki adıma geçelim (simülasyon)
    setIsLoading(false);
    onNext();
  };

  const selectedPremium = selectedQuoteInfo?.premiums?.find(
    (p) => p.installmentNumber === selectedQuoteInfo.selectedInstallmentNumber
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Satın Alma Onayı (TSS)
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {selectedQuoteInfo ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6">Seçilen Teklif Özeti</Typography>
          <Typography>Şirket: {selectedQuoteInfo.company || 'N/A'}</Typography>
          <Typography>Proposal ID: {proposalId || 'N/A'}</Typography>
          <Typography>Product (Teklif) ID: {productId || 'N/A'}</Typography>
          <Typography>
            Tutar: {selectedPremium?.formattedGrossPremium || 'N/A'} ( {selectedQuoteInfo.selectedInstallmentNumber === 1 ? 'Peşin' : `${selectedQuoteInfo.selectedInstallmentNumber} Taksit`} )
          </Typography>
          {/* Buraya poliçe detayları, ödeme bilgileri formu vb. eklenebilir */}
        </Box>
      ) : (
        !error && <CircularProgress /> // Hata yoksa ve bilgi yükleniyorsa göster
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handlePurchase}
        disabled={isLoading || !!error || !selectedQuoteInfo}
        sx={{ minWidth: 180, height: 48, borderRadius: 2, textTransform: 'none' }}
      >
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Satın Almayı Tamamla'}
      </Button>
    </Box>
  );
} 