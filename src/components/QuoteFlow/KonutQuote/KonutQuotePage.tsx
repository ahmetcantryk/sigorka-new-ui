"use client";

import { Box, Container, Paper, Step, StepLabel, Stepper, useMediaQuery, useTheme } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import AssetInfoStep from './steps/PropertyInfoStep';
import PersonalInfoStep from './steps/PersonalInfoStep';
import PurchaseStep from './steps/PurchaseStep';
import QuoteComparisonStep from './steps/QuoteComparisonStep';
import { useAuthStore } from '@/store/useAuthStore';
import MobileStepper from '@/components/QuoteFlow/MobileStepper';
import { useParams } from 'next/navigation';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import "../../../styles/form-style.css"
const steps = ['Kişisel Bilgiler', 'Konut Bilgileri', 'Teklif Karşılaştırma', 'Poliçeleştir'];

const stepComponents = [PersonalInfoStep, AssetInfoStep, QuoteComparisonStep, PurchaseStep];

const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function KonutQuotePage() {
  const { accessToken } = useAuthStore();
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const params = useParams();
  const urlProposalId = params?.proposalId as string | undefined;
  const [proposalId, setProposalId] = useState<string | null>(null);

  useEffect(() => {
    if (urlProposalId) {
      setProposalId(urlProposalId);
    }
  }, [urlProposalId]);

  const handleNext = useCallback(() => {
    setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  }, []);

  const getStepProps = useCallback(() => {
    const commonProps: any = {
      onNext: handleNext,
      onBack: handleBack,
      isFirstStep: activeStep === 0,
      isLastStep: activeStep === steps.length - 1,
    };

    if (activeStep === 2) {
      commonProps.proposalId = proposalId || localStorage.getItem('proposalIdForKonut');
      commonProps.onSelectQuote = (quoteId: string) => {
      };
    } else if (activeStep === 3) {
      commonProps.proposalId = proposalId || localStorage.getItem('proposalIdForKonut');
    }

    return commonProps;
  }, [activeStep, handleBack, handleNext, proposalId]);

  const CurrentStepComponent = stepComponents[activeStep];

  return (
      <>
        <div className="quote-page min-h-screen bg-gray-50 form-background">
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