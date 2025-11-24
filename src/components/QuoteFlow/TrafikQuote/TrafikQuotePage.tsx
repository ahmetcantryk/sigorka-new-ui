"use client";
import { Box, Container, Paper, Step, StepLabel, Stepper, useMediaQuery, useTheme } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import AssetInfoStep from './steps/AssetInfoStep';
import PersonalInfoStep from './steps/PersonalInfoStep';
import PurchaseStep from './steps/PurchaseStep';
import QuoteComparisonStep from './steps/QuoteComparisonStep';
import { useAuthStore } from '../../../store/useAuthStore';
import MobileStepper from '../MobileStepper';
import { useParams } from 'next/navigation';
import { fetchWithAuth } from '../../../services/fetchWithAuth';

const steps = ['Kişisel Bilgiler', 'Araç Bilgileri', 'Teklif Karşılaştırma', 'Poliçeleştir'];

const stepComponents = [PersonalInfoStep, AssetInfoStep, QuoteComparisonStep, PurchaseStep];

const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function TrafikQuotePage() {
  const { accessToken } = useAuthStore();
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { proposalId: urlProposalId } = useParams<{ proposalId?: string }>();
  const [proposalId, setProposalId] = useState<string | null>(urlProposalId || null);

  const handleNext = () => {
    setActiveStep((prevStep) => Math.min(prevStep + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prevStep) => Math.max(prevStep - 1, 0));
  };

  const getStepProps = () => {
    const commonProps = {
      onNext: handleNext,
      onBack: handleBack,
      isFirstStep: activeStep === 0,
      isLastStep: activeStep === steps.length - 1,
      proposalId,
    };

    // Add proposalId only for QuoteComparisonStep
    if (activeStep === 2) {
      return {
        ...commonProps,
        onSelectQuote: (quoteId: string) => {
          // You might want to add quote selection logic here
        },
      };
    }

    return commonProps;
  };

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
                    <CurrentStepComponent {...getStepProps()} />
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
