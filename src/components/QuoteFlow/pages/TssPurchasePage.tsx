"use client"; // Next.js için gerekli direktif

import React, { useEffect } from 'react';
import { Container, Paper, Box, Typography } from '@mui/material';
import { useRouter, useParams } from 'next/navigation'; // react-router-dom yerine next/navigation
import Header from '@/components/Header'; // Güncellenmiş Header import yolu
import PurchaseStep from '@/components/QuoteFlow/TssQuote/steps/PurchaseStep'; // Güncellenmiş import yolu ve bileşen adı

export default function TssPurchasePageComponent() { // Bileşen adı güncellendi (RoutePage -> PageComponent)
  const router = useRouter();
  const params = useParams(); // useParams tipi belirtmeye gerek yok, Next.js kendi hallediyor

  const proposalId = Array.isArray(params?.proposalId) ? params.proposalId[0] : params?.proposalId as string | undefined;
  const quoteId = Array.isArray(params?.quoteId) ? params.quoteId[0] : params?.quoteId as string | undefined; // productId -> quoteId

  const handleNext = () => {
    // Örnek: router.push(`/tss/payment-result/${proposalId}`);
  };

  useEffect(() => {
    if (proposalId && quoteId) {
      // localStorage'a kaydetme işlemleri burada kalabilir veya PurchaseStep içinde yönetilebilir.
      // Kasko'da seçilen teklif bilgisi localStorage'dan okunuyordu.
      // TssQuoteComparisonPage'de zaten 'selectedTssQuoteForPurchase' kaydediliyor.
    } else {
      // router.push('/tss-teklif'); // Eksik parametre durumunda ana sayfaya yönlendir
    }
  }, [proposalId, quoteId, router]);

  if (!proposalId || !quoteId) {
    // Parametreler yüklenene kadar veya eksikse bir yükleme/hata durumu gösterilebilir
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography>Teklif bilgileri yükleniyor veya eksik...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Box sx={{ pt: { xs: 8, sm: 10, md: 12 } }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
            <PurchaseStep
              proposalId={proposalId}
              quoteId={quoteId}
              onNext={handleNext}
              onBack={() => router.back()}
            />
          </Paper>
        </Container>
      </Box>
    </Box>
  );
} 