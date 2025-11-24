import React, { useState, useEffect, useCallback } from 'react';
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

// Interface'ler
interface ApiCityResponse {
  value: string;
  text: string;
}
interface ApiDistrictResponse {
  value: string;
  text: string;
}

interface AdditionalInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  formData?: Record<string, unknown>;
  updateFormData?: (data: Record<string, unknown>) => void;
}

// Validasyon şeması
const validationSchema = yup.object({
  firstName: yup.string().required('Ad zorunludur'),
  lastName: yup.string().required('Soyad zorunludur'),
  cityReference: yup.string().required('İl seçimi zorunludur'),
  districtReference: yup.string().required('İlçe seçimi zorunludur'),
});

export default function AdditionalInfoStep({
  onNext,
  onBack,
  formData: initialFormData,
  updateFormData,
}: AdditionalInfoStepProps) {
  const [cityOptions, setCityOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [districtOptions, setDistrictOptions] = useState<Array<{ value: string; label: string }>>(
    []
  );
  const { accessToken } = useAuthStore();
  const [hasAutoAdvanced, setHasAutoAdvanced] = useState(false);

  // Şehirleri çekmek için useEffect
  useEffect(() => {
    const fetchWithAuthCities = async () => {
      if (!accessToken) return;
      try {
        const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_CITIES, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.ok) {
          const data: ApiCityResponse[] = await response.json();
          setCityOptions(data.map((city) => ({ value: city.value, label: city.text })));
        } else {
        }
      } catch (error) {
      }
    };
    fetchWithAuthCities();
  }, [accessToken]);

  // İlçeleri yüklemek için fonksiyon
  const loadDistricts = useCallback(
    async (cityId: string) => {
      if (!accessToken || !cityId) {
        setDistrictOptions([]);
        return;
      }
      try {
        const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_DISTRICTS(cityId), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (response.ok) {
          const data: ApiDistrictResponse[] = await response.json();
          setDistrictOptions(
            data.map((district) => ({ value: district.value, label: district.text }))
          );
        } else {
          setDistrictOptions([]);
        }
      } catch (error) {
        setDistrictOptions([]);
      }
    },
    [accessToken]
  );

  const formik = useFormik({
    initialValues: {
      firstName: (initialFormData?.firstName as string) || '',
      lastName: (initialFormData?.lastName as string) || '',
      cityReference: (initialFormData?.cityReference as string) || '',
      districtReference: (initialFormData?.districtReference as string) || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (updateFormData) {
        updateFormData(values);
      }
      onNext();
    },
  });

  // İl değiştiğinde ilçeleri yükleme
  useEffect(() => {
    if (formik.values.cityReference) {
      loadDistricts(formik.values.cityReference);
    } else {
      setDistrictOptions([]);
    }
  }, [formik.values.cityReference, loadDistricts]);

  // Başlangıçta il seçiliyse ilçeleri yükle
  useEffect(() => {
    const initialCityRef = initialFormData?.cityReference as string;
    if (initialCityRef) {
      loadDistricts(initialCityRef);
    }
   
  }, [initialFormData?.cityReference, loadDistricts]);

  // Otomatik ilerleme kontrolü için useEffect
  useEffect(() => {
    if (!hasAutoAdvanced && initialFormData) {
      const { firstName, lastName, cityReference, districtReference } = initialFormData;
      if (firstName && lastName && cityReference && districtReference) {
        setHasAutoAdvanced(true);
        onNext();
      } else {
      }
    }
  }, [initialFormData, onNext, hasAutoAdvanced]);


  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Typography variant="h5" component="h2" gutterBottom>
        Eksik Bilgileriniz
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Devam etmek için lütfen eksik bilgilerinizi tamamlayınız.
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Ad, Soyad, İl, İlçe alanları */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Ad"
            id="firstName"
            name="firstName"
            value={formik.values.firstName}
            onChange={(e) => {
              const value = e.target.value;
              // Sadece harf ve boşluk karakterlerine izin ver
              const filteredValue = value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '');
              const upperCaseValue = filteredValue.toUpperCase();
              formik.setFieldValue('firstName', upperCaseValue);
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
            helperText={formik.touched.firstName && formik.errors.firstName}
            disabled={!!initialFormData?.firstName}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Soyad"
            id="lastName"
            name="lastName"
            value={formik.values.lastName}
            onChange={(e) => {
              const value = e.target.value;
              // Sadece harf ve boşluk karakterlerine izin ver
              const filteredValue = value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '');
              const upperCaseValue = filteredValue.toUpperCase();
              formik.setFieldValue('lastName', upperCaseValue);
            }}
            onBlur={formik.handleBlur}
            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
            disabled={!!initialFormData?.lastName}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={cityOptions}
            getOptionLabel={(option) => option.label}
            value={
              cityOptions.find((option) => option.value === formik.values.cityReference) || null
            }
            onChange={(_, newValue) => {
              formik.setFieldValue('cityReference', newValue ? newValue.value : '');
              formik.setFieldValue('districtReference', '');
              formik.setFieldTouched('cityReference', true);
              loadDistricts(newValue ? newValue.value : '');
            }}
            disabled={!!initialFormData?.cityReference}
            renderInput={(params) => (
              <TextField
                {...params}
                label="İl"
                error={formik.touched.cityReference && Boolean(formik.errors.cityReference)}
                helperText={formik.touched.cityReference && formik.errors.cityReference}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={districtOptions}
            getOptionLabel={(option) => option.label}
            value={
              districtOptions.find((option) => option.value === formik.values.districtReference) ||
              null
            }
            onChange={(_, newValue) => {
              formik.setFieldValue('districtReference', newValue ? newValue.value : '');
              formik.setFieldTouched('districtReference', true);
            }}
            disabled={
              !formik.values.cityReference || districtOptions.length === 0 || !!initialFormData?.districtReference
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="İlçe"
                error={formik.touched.districtReference && Boolean(formik.errors.districtReference)}
                helperText={formik.touched.districtReference && formik.errors.districtReference}
              />
            )}
          />
        </Grid>
      </Grid>

      {/* Butonlar */}
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
          {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Devam Et'}
        </Button>
      </Box>
    </Box>
  );
}
