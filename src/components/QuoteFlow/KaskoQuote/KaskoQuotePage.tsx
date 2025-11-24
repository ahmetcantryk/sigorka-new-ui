"use client";

import { Box, Container, Paper, Step, StepLabel, Stepper, useMediaQuery, useTheme } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import AssetInfoStep from './steps/AssetInfoStep';
import PersonalInfoStep from './steps/PersonalInfoStep';
import PurchaseStep from './steps/PurchaseStep';
import QuoteComparisonStep from './steps/QuoteComparisonStep';
import { useAuthStore } from '@/store/useAuthStore';
import MobileStepper from '@/components/QuoteFlow/MobileStepper';
import { useParams } from 'next/navigation';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import "../../../styles/form-style.css"

const steps = ['Kişisel Bilgiler', 'Araç Bilgileri', 'Teklif Karşılaştırma', 'Poliçeleştir'];

const stepComponents = [PersonalInfoStep, AssetInfoStep, QuoteComparisonStep, PurchaseStep];

const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const logStepTransition = (stepNumber: number, stepName: string) => {
};

export default function KaskoQuotePage() {
  const { accessToken, isAuthenticated } = useAuthStore();
  const [activeStep, setActiveStep] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const hasAutoProgressed = useRef(false); // Track if automatic progression has occurred
  
  const params = useParams();
  const urlProposalId = params?.proposalId as string | undefined;
  const [proposalId, setProposalId] = useState<string | null>(null);

  // Initial setup and automatic step progression
  useEffect(() => {
    if (urlProposalId) {
      setProposalId(urlProposalId);
    }

    // Check if user is authenticated and automatically progress to step 2
    // Only do this once on initial load
    if (isAuthenticated && activeStep === 0 && !hasAutoProgressed.current) {
      hasAutoProgressed.current = true;
      handleStepChange(1, true); // true indicates automatic progression
    }
  }, [urlProposalId, isAuthenticated, activeStep]);

  const handleStepChange = (newStep: number, isAutomatic: boolean = false) => {
    const stepName = steps[newStep];
    
    // Log step transition
    logStepTransition(newStep, stepName);
    
    setActiveStep(newStep);
  };

  const handleNext = () => {
    const newStep = Math.min(activeStep + 1, steps.length - 1);
    handleStepChange(newStep);
  };

  const handleBack = () => {
    const newStep = Math.max(activeStep - 1, 0);
    handleStepChange(newStep);
  };

  // Handle purchase button click from QuoteComparison
  const handlePurchaseClick = (quoteId: string) => {
    
    // Progress to purchase step
    handleStepChange(3);
  };

  const getStepProps = () => {
    const commonProps: any = {
      onNext: handleNext,
      onBack: handleBack,
      isFirstStep: activeStep === 0,
      isLastStep: activeStep === steps.length - 1,
    };

    if (activeStep === 2) {
      commonProps.proposalId = proposalId || localStorage.getItem('proposalIdForKasko');
      commonProps.onSelectQuote = (quoteId: string) => {
      };
      commonProps.onPurchaseClick = handlePurchaseClick; // Add purchase click handler
    } else if (activeStep === 3) {
      commonProps.proposalId = proposalId || localStorage.getItem('proposalIdForKasko');
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
