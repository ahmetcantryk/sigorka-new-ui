"use client";

import { Box, Container, Paper, Step, StepLabel, Stepper, useMediaQuery, useTheme } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import PersonalInfoStep from '@/components/QuoteFlow/ImmQuote/steps/PersonalInfoStep';
import AssetInfoStep from '@/components/QuoteFlow/ImmQuote/steps/AssetInfoStep';
import QuoteComparisonStep from '@/components/QuoteFlow/ImmQuote/steps/QuoteComparisonStep';
import PurchaseStep from '@/components/QuoteFlow/ImmQuote/steps/PurchaseStep'; // Eğer varsa
import { useAuthStore } from '@/store/useAuthStore';
import MobileStepper from '@/components/QuoteFlow/MobileStepper';
import { useParams, useRouter } from 'next/navigation';


const steps = ['Kişisel Bilgiler', 'Araç Bilgileri', 'Teklif Karşılaştırma', 'Poliçeleştir'];

const stepComponents = [PersonalInfoStep, AssetInfoStep, QuoteComparisonStep, PurchaseStep];

const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function ImmQuoteClient() {
  const { accessToken } = useAuthStore();
  const [activeStep, setActiveStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const router = useRouter();
  const params = useParams();
  const urlProposalId = params?.proposalId as string | undefined;
  const [proposalId, setProposalId] = useState<string | null>(urlProposalId || null);

  useEffect(() => {
    if (urlProposalId) {
      setProposalId(urlProposalId);
    }
  }, [urlProposalId]);

  useEffect(() => {
  }, [activeStep]);

  const handleNext = useCallback(() => {
    if (isTransitioning) {
      return;
    }

    // Teklif karşılaştırma adımında (step 2) yönlendirme yap
    if (activeStep === 1) { // Araç bilgileri adımından sonra
      const currentProposalId = proposalId || localStorage.getItem('proposalIdForImm');
      if (currentProposalId) {
        router.push(`/imm/quote-comparison/${currentProposalId}`);
        return;
      }
    }

    setIsTransitioning(true);
    setActiveStep((prevStep) => {
      const newStep = Math.min(prevStep + 1, steps.length - 1);
      if (prevStep === newStep) {
        // Adım değişmediyse (zaten son adımdaysak veya bir hata varsa)
        // Kilidi hemen kaldırabiliriz, ancak setTimeout yine de çalışacak.
        // Bu durumu ayrıca ele almak daha iyi olabilir, şimdilik böyle bırakalım.
      }
      return newStep;
    });

    // Geçişin tamamlanması için kısa bir süre sonra kilidi kaldır
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400); // Animasyon süresinden biraz daha uzun

  }, [setActiveStep, isTransitioning, activeStep, proposalId, router]);

  const handleBack = useCallback(() => {
    setActiveStep((prevStep) => {
      const newStep = Math.max(prevStep - 1, 0);
      return newStep;
    });
  }, [setActiveStep]);



  const getStepProps = () => {
    const commonProps: any = {
      onNext: handleNext,
      onBack: handleBack,
      isFirstStep: activeStep === 0,
      isLastStep: activeStep === steps.length - 1,
      // proposalId state'i burada iletiliyor.
    };
    
    // Aktif adıma göre proposalId'yi ekle/kontrol et
    if (activeStep === 0 || activeStep === 1) { // PersonalInfoStep or AssetInfoStep
        // Bu adımlar proposalId'yi oluşturabilir veya güncelleyebilir.
        // Bu adımlar içerisinde proposalId local storage'a kaydediliyor.
    }

    if (activeStep === 2) { // QuoteComparisonStep
      commonProps.proposalId = proposalId || localStorage.getItem('proposalIdForImm');
      commonProps.onSelectQuote = (quoteId: string) => {
        // handleNext(); // Optionally move to next step after selection
      };
    }

    if (activeStep === 3) { // PurchaseStep
        commonProps.proposalId = proposalId || localStorage.getItem('proposalIdForImm');
    }

    return commonProps;
  };

  const CurrentStepComponent = stepComponents[activeStep];

  return (
    <>
      <div className="min-h-screen bg-gray-50 form-background">
        <div className="flex min-h-screen items-center justify-center pb-8">
          <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
              {isMobile ? (
                <MobileStepper steps={steps} activeStep={activeStep} />
              ) : (
                <Stepper
                  activeStep={activeStep}
                  sx={{
                    mb: 4,
                    '& .MuiStepLabel-root .Mui-completed': {
                      color: 'primary.main',
                    },
                    '& .MuiStepLabel-root .Mui-active': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              )}

              <Box sx={{ mt: 4 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={pageTransition}
                    transition={{ duration: 0.3 }}
                  >
                    {CurrentStepComponent && <CurrentStepComponent {...getStepProps()} />}
                  </motion.div>
                </AnimatePresence>
              </Box>
            </Paper>
          </Container>
        </div>
      </div>
    </>
  );
} 