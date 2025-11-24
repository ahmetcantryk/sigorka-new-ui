import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Grid,
  Typography,
  CircularProgress,
  TextField,
  Autocomplete,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuthStore } from '../../../../store/useAuthStore';
import { API_ENDPOINTS } from '../../../../config/api';
import { fetchWithAuth } from '../../../../services/fetchWithAuth';
import { updateCustomerHealthInfo } from '../../../../utils/authHelper';
// DataLayer helper functions
declare global {
  interface Window {
    dataLayer: any[];
  }
}

const pushToDataLayer = (eventData: any) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventData);
  } else {
  }
};

// Enumlar
enum Gender { Unknown = 0, Male = 1, Female = 2, Other = 3 }
enum MaritalStatus { Unknown = 0, Single = 1, Married = 2, Divorced = 3, Widowed = 4 }
enum EducationStatus { Unknown = 0, PrimarySchool = 1, MiddleSchool = 2, HighSchool = 3, University = 4, Graduate = 5, Doctorate = 6 }
enum Nationality { Unknown = 0, Turkish = 1, Other = 2 }

// Bu seçenekler artık kullanılmıyor - coverageGroupIds ile default teklifler çıkacak

// Helper function for safe parsing
function safeParseEnum<T extends number>(
  value: string | number | null | undefined,
  enumType: Record<string, T | string>,
  defaultValue: T
): T {
   if (value === null || value === undefined) {
    return defaultValue;
  }
  if (typeof value === 'string') {
    const upperValue = value.toUpperCase();
    if (upperValue in enumType) {
      const enumValue = enumType[upperValue];
      if (typeof enumValue === 'number') {
        return enumValue as T;
      }
    }
    const parsedNumber = parseInt(value, 10);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!isNaN(parsedNumber) && (Object.values(enumType) as any[]).includes(parsedNumber)) {
      return parsedNumber as T;
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof value === 'number' && (Object.values(enumType) as any[]).includes(value)) {
    return value as T;
  }
  return defaultValue;
}

interface HealthInfoStepProps {
  onNext: (healthData: Record<string, unknown>) => void;
  onBack: () => void;
  formData?: Record<string, unknown>;
  updateFormData?: (data: Record<string, unknown>) => void;
}

// Validasyon şeması (Formatlama düzeltildi)
const validationSchema = yup.object({
  height: yup.number().typeError('Boy sayısal olmalıdır').positive('Boy pozitif olmalıdır').required('Boy zorunludur'),
  weight: yup.number().typeError('Kilo sayısal olmalıdır').positive('Kilo pozitif olmalıdır').required('Kilo zorunludur'),
});

export default function HealthInfoStep({
  onNext,
  onBack,
  formData: initialOverallFormData,
  updateFormData,
}: HealthInfoStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { customerId, accessToken } = useAuthStore();
  const [initialValues, setInitialValues] = useState<{ height: string | number | null; weight: string | number | null }>({ height: null, weight: null });

  const getInitialValue = <T,>(key: string, defaultValue: T): T => {
      return (initialOverallFormData?.[key] as T) ?? defaultValue;
  };

  const [initialHealthData, setInitialHealthData] = useState(() => ({
    gender: safeParseEnum(getInitialValue<string | number | null>('gender', null), Gender, Gender.Unknown),
    maritalStatus: safeParseEnum(getInitialValue<string | number | null>('maritalStatus', null), MaritalStatus, MaritalStatus.Unknown),
    nationality: safeParseEnum(getInitialValue<string | number | null>('nationality', null), Nationality, Nationality.Turkish),
    educationStatus: safeParseEnum(getInitialValue<string | number | null>('educationStatus', null), EducationStatus, EducationStatus.Unknown),
    height: getInitialValue<number | string>('height', ''),
    weight: getInitialValue<number | string>('weight', ''),
  }));

  const formik = useFormik({
    initialValues: initialHealthData,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      
      // TSS step 2 event tetikleme
      pushToDataLayer({
        event: "tss_formsubmit",
        form_name: "tss_step2",
      });
      
      onNext(values);
    },
  });

  // Sağlık bilgilerini güncelleme fonksiyonu
  const updateHealthInfo = async (height: number | string, weight: number | string) => {
    if (!customerId || !accessToken) return;

    try {
      setIsUpdating(true);
      await updateCustomerHealthInfo(Number(height), Number(weight), customerId);
    } catch (error) {
      console.error('Sağlık bilgileri güncellenirken hata:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Height değeri blur olduğunda güncelleme
  const handleHeightBlur = () => {
    formik.handleBlur('height');
    if (formik.values.height && formik.values.weight && formik.values.height !== initialValues.height) {
      updateHealthInfo(formik.values.height, formik.values.weight);
      setInitialValues(prev => ({ ...prev, height: formik.values.height }));
    }
  };

  // Weight değeri blur olduğunda güncelleme
  const handleWeightBlur = () => {
    formik.handleBlur('weight');
    if (formik.values.height && formik.values.weight && formik.values.weight !== initialValues.weight) {
      updateHealthInfo(formik.values.height, formik.values.weight);
      setInitialValues(prev => ({ ...prev, weight: formik.values.weight }));
    }
  };

  // İlk yüklemede API'den gelen değerleri kaydet
  useEffect(() => {
    const fetchWithAuthHealthInfo = async () => {
      if (customerId && accessToken) {
        setIsLoading(true);
        try {
          const response = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_HEALTH_INFO(customerId), {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (response.ok) {
            const data = await response.json();
            setInitialValues({ height: data.height, weight: data.weight });
            setInitialHealthData(prev => ({
                ...prev,
                height: prev.height || data.height || '',
                weight: prev.weight || data.weight || '',
            }));
          } else if (response.status !== 404) {
          }
        } catch (error) {
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchWithAuthHealthInfo();
  }, [customerId, accessToken]);


  // Enum seçeneklerini Autocomplete için hazırla
  const genderAutocompleteOptions = Object.entries(Gender)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({ label: key, value: value as Gender }));

  const maritalStatusAutocompleteOptions = Object.entries(MaritalStatus)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({ label: key, value: value as MaritalStatus }));

  const educationStatusAutocompleteOptions = Object.entries(EducationStatus)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({ label: key, value: value as EducationStatus }));

  const nationalityAutocompleteOptions = Object.entries(Nationality)
    .filter(([key]) => isNaN(Number(key)))
    .map(([key, value]) => ({ label: key, value: value as Nationality }));

  // Artık tedavi planı ve hastane ağı seçenekleri kullanılmıyor


  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Typography variant="h5" component="h2" gutterBottom>
        Sağlık Bilgileriniz
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Lütfen ek sağlık bilgilerinizi giriniz.
      </Typography>

      {isLoading && (
         <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
           <CircularProgress />
           <Typography sx={{ ml: 2 }}>Sağlık bilgileri yükleniyor...</Typography>
         </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
        {/* Boy ve Kilo Alanları */}
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <TextField
              fullWidth
              label="Boy (cm)"
              id="height"
              name="height"
              type="number"
              value={formik.values.height}
              onChange={(e) => {
                const value = e.target.value;
                // Sadece sayı ve nokta karakterlerine izin ver
                const filteredValue = value.replace(/[^0-9.]/g, '');
                formik.setFieldValue('height', filteredValue);
              }}
              onBlur={handleHeightBlur}
              error={formik.touched.height && Boolean(formik.errors.height)}
              helperText={formik.touched.height && formik.errors.height}
              disabled={isLoading || isUpdating}
              InputProps={{
                endAdornment: (isLoading || isUpdating) && (
                  <CircularProgress size={20} />
                ),
              }}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <TextField
              fullWidth
              label="Kilo (kg)"
              id="weight"
              name="weight"
              type="number"
              value={formik.values.weight}
              onChange={(e) => {
                const value = e.target.value;
                // Sadece sayı ve nokta karakterlerine izin ver
                const filteredValue = value.replace(/[^0-9.]/g, '');
                formik.setFieldValue('weight', filteredValue);
              }}
              onBlur={handleWeightBlur}
              error={formik.touched.weight && Boolean(formik.errors.weight)}
              helperText={formik.touched.weight && formik.errors.weight}
              disabled={isLoading || isUpdating}
              InputProps={{
                endAdornment: (isLoading || isUpdating) && (
                  <CircularProgress size={20} />
                ),
              }}
            />
          </Box>
        </Box>

        {/* Tedavi planı ve hastane ağı alanları kaldırıldı - default olarak coverageGroupIds kullanılacak */}
      </Box>

      {/* Butonlar (Formatlama Düzeltildi) */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            minWidth: 200,
            height: 48,
            borderRadius: 2,
            ml: 'auto',
            textTransform: 'none',
          }}
          disabled={formik.isSubmitting || !formik.isValid}
        >
          {formik.isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Devam Et'
          )}
        </Button>
      </Box>
    </Box>
  );
} 