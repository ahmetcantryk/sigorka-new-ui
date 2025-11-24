"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { API_ENDPOINTS } from '@/config/api';
import PersonalInfoStep from './steps/PersonalInfoStep';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import MobileStepper from '@/components/QuoteFlow/MobileStepper';
import { AnimatePresence, motion } from 'framer-motion';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';
import '../../../styles/form-style.css';

// Props tipleri (Geçici olarak buraya eklendi)
interface PersonalInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  formData?: Record<string, unknown>;
  updateFormData?: (data: Record<string, unknown>) => void;
  initialMode: 'login' | 'additionalInfo';
}

// Enum tanımları
enum Gender {
  Unknown = 0,
  Male = 1,
  Female = 2,
  Other = 3,
}
enum MaritalStatus {
  Unknown = 0,
  Single = 1,
  Married = 2,
  Divorced = 3,
  Widowed = 4,
}
enum EducationStatus {
  Unknown = 0,
  PrimarySchool = 1,
  MiddleSchool = 2,
  HighSchool = 3,
  University = 4,
  Graduate = 5,
  Doctorate = 6,
}
enum Nationality {
  Unknown = 0,
  Turkish = 1,
  Other = 2,
}
enum Job {
  Unknown = 0,
  Banker = 1,
  CorporateEmployee = 2,
  LtdEmployee = 3,
  Police = 4,
  MilitaryPersonnel = 5,
  RetiredSpouse = 6,
  Teacher = 7,
  Doctor = 8,
  Pharmacist = 9,
  Nurse = 10,
  HealthcareWorker = 11,
  Lawyer = 12,
  Judge = 13,
  Prosecutor = 14,
  Freelancer = 15,
  Farmer = 16,
  Instructor = 17,
  ReligiousOfficial = 18,
  AssociationManager = 19,
  Officer = 20,
  Retired = 21,
  Housewife = 22,
}

// Adımlar
const steps = ['Kişisel Bilgiler', 'Teklif Karşılaştırma','Poliçeleştir'];

// Adım bileşenleri
const stepComponents = [PersonalInfoStep];

// Framer Motion page transition
const pageTransition = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

// FormData yapısı
interface FormData {
  personalInfo: Record<string, unknown>;
}

// Bu seçenekler artık kullanılmıyor - coverageGroupIds ile default teklifler çıkacak

export default function AcilSaglikQuotePage() {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    personalInfo: {},
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [personalInfoMode, setPersonalInfoMode] = useState<'login' | 'additionalInfo'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { customerId, accessToken } = useAuthStore();
  const agencyConfig = useAgencyConfig();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const params = useParams();

  const getCoverageGroupIds = (branch: string): string[] | null => {
    if (!agencyConfig?.coverageGroupIds) {
      return null;
    }
    
    const coverageIds = agencyConfig.coverageGroupIds[branch as keyof typeof agencyConfig.coverageGroupIds];
    return coverageIds && coverageIds.length > 0 ? coverageIds : null;
  };

  useEffect(() => {
    const fetchWithAuthProfileAndSetInitialStep = async () => {
      if (accessToken) {
        setProfileLoading(true);
        try {
          const response = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (response.ok) {
            const profileData = await response.json();

            setFormData((prev) => ({
              ...prev,
              personalInfo: {
                identityNumber: profileData.identityNumber || '',
                email: profileData.primaryEmail || '',
                phoneNumber: profileData.primaryPhoneNumber?.number || '',
                birthDate: profileData.birthDate || '',
                job: profileData.job?.reference || Job.Unknown,
                fullName: profileData.fullName || '',
                cityReference: profileData.city?.value || '',
                districtReference: profileData.district?.value || '',
              },
            }));

            const isFullNameMissing =
                !profileData.fullName || profileData.fullName.trim() === '';
            const isCityMissing = !profileData.city?.value;
            const isDistrictMissing = !profileData.district?.value;
            const hasMissingInfo =
                isFullNameMissing || isCityMissing || isDistrictMissing;

            if (hasMissingInfo) {
              setPersonalInfoMode('additionalInfo');
              setActiveStep(0);
            } else {
      }
    } else {
            setPersonalInfoMode('login');
            setActiveStep(0);
          }
        } catch (error) {
          setPersonalInfoMode('login');
          setActiveStep(0);
        } finally {
          setProfileLoading(false);
        }
      } else {
        setPersonalInfoMode('login');
        setActiveStep(0);
        setProfileLoading(false);
      }
    };
    fetchWithAuthProfileAndSetInitialStep();
  }, [accessToken]);

  const updateFormData = useCallback(
      (stepKey: keyof Omit<FormData, 'additionalInfo'>, data: Record<string, unknown>) => {
        setFormData((prev) => ({
          ...prev,
          [stepKey]: {
            ...prev[stepKey],
            ...data,
          },
        }));
      },
      []
  );

  const handleGetQuotesAndNavigate = async (): Promise<void> => {
    if (!customerId || !accessToken) {
      alert('Lütfen tekrar giriş yapınız.');
      return;
    }

    try {
      const tokenToUse = accessToken;

      // Kullanıcının istediği format: coverage null, coverageGroupIds ile default teklif
      const requestData = {
        $type: 'saglik',
        insurerCustomerId: customerId,
        insuredCustomerId: customerId,
        coverageGroupIds: getCoverageGroupIds('saglik'),
        coverage: null,
        channel: 'WEBSITE',
      };


      const proposalEndpoint = API_ENDPOINTS.PROPOSALS_CREATE;
      if (!proposalEndpoint) {
        alert('Teklif oluşturma servisi yapılandırılamadı.');
        return;
      }

      const response = await fetchWithAuth(proposalEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenToUse}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        const newProposalId = result.proposalId || result.id;
        if (newProposalId) {
          localStorage.setItem('proposalIdForSaglik', newProposalId);
          router.push(`/saglik/quote-comparison/${newProposalId}`);
        } else {
          alert('Teklif oluşturuldu ancak teklif ID alınamadı.');
        }
      } else {
        const errorText = await response.text();
        alert(`Teklif oluşturulurken bir hata oluştu: ${errorText || response.statusText}`);
      }
    } catch (error) {
      alert('Teklif oluşturulurken bir hata oluştu.');
    }
  };

  const handleNext = async (stepData?: Record<string, unknown>) => {
    if (activeStep === 0) {
      if (stepData) {
        updateFormData('personalInfo', stepData);
      }
      // PersonalInfoStep'ten sonra direkt proposal oluştur ve quote comparison'a git
      await handleGetQuotesAndNavigate();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const getStepProps = (index: number) => {
    const commonProps: any = {
      onNext: handleNext,
      onBack: handleBack,
      isFirstStep: activeStep === 0,
      isLastStep: activeStep === steps.length - 1,
    };

    if (index === 0) {
      commonProps.formData = formData.personalInfo;
      commonProps.updateFormData = (data: Record<string, unknown>) =>
          updateFormData('personalInfo', data);
      commonProps.initialMode = personalInfoMode;
    }

    return commonProps;
  };

  const CurrentStepComponent = stepComponents[activeStep];

  if (profileLoading) {
    return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
          <Typography ml={2}>Profil bilgileri yükleniyor...</Typography>
        </Box>
    );
  }

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
                      {CurrentStepComponent && <CurrentStepComponent {...getStepProps(activeStep)} />}
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
