"use client";

import { Box, Container, Paper, Step, StepLabel, Stepper, useMediaQuery, useTheme } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import PersonalInfoStep from './steps/PersonalInfoStep';
import RequestStep from './steps/RequestStep';
import { useAuthStore } from '@/store/useAuthStore';
import MobileStepper from '@/components/QuoteFlow/MobileStepper';
import { useParams } from 'next/navigation';
import "../../../styles/form-style.css"

const steps = ['Kişisel Bilgiler', 'Talep Oluştur'];

const stepComponents = [PersonalInfoStep, RequestStep];

const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function OzelSaglikQuotePage() {
  const { accessToken, isAuthenticated } = useAuthStore();
  const [activeStep, setActiveStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const params = useParams();
  const [proposalId, setProposalId] = useState<string | null>(null);

  useEffect(() => {
  }, [activeStep]);

  const handleStepChange = (newStep: number, isAutomatic: boolean = false) => {
    const stepName = steps[newStep];
    
    setActiveStep(newStep);
  };

  const handleNext = useCallback(() => {
    if (isTransitioning) {
      return;
    }

    setIsTransitioning(true);
    const newStep = Math.min(activeStep + 1, steps.length - 1);
    handleStepChange(newStep);

    // Geçişin tamamlanması için kısa bir süre sonra kilidi kaldır
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400); // Animasyon süresinden biraz daha uzun

  }, [activeStep, isTransitioning]);

  const handleBack = useCallback(() => {
    const newStep = Math.max(activeStep - 1, 0);
    handleStepChange(newStep);
  }, [activeStep]);

  const getStepProps = () => {
    const commonProps: any = {
      onNext: handleNext,
      onBack: handleBack,
      isFirstStep: activeStep === 0,
      isLastStep: activeStep === steps.length - 1,
    };

    // Ozel Sağlık için özel props - gerekli değil şu an için
    // Her iki step de sadece temel props'ları kullanıyor

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