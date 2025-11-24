import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  FormControlLabel,
  Checkbox,
  FormHelperText,
  Link,
} from '@mui/material';
import { useAuthStore } from '../../../../store/useAuthStore';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import '../../../../styles/form-style.css';
import { updateCustomerProfile } from '@/utils/authHelper';

const validationSchema = yup.object({
  email: yup.string().email('Geçerli bir e-posta giriniz').required('E-posta gereklidir'),
  phoneNumber: yup.string().required('Telefon numarası gereklidir'),
  acceptTerms: yup
    .boolean()
    .oneOf([true], "Devam etmek için KVKK ve Aydınlatma Metni'ni onaylamanız gerekmektedir"),
  acceptCommercial: yup
    .boolean()
    .oneOf([true], "Devam etmek için Ticari Elektronik İleti Metni'ni onaylamanız gerekmektedir"),
});

interface AdditionalInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
}

interface MernisData {
  fullName?: string;
  birthDate?: string;
  gender?: string;
  city?: {
    value: string;
    text: string;
  };
  district?: {
    value: string;
    text: string;
  };
  email?: string;
  phoneNumber?: string;
  maritalStatus?: string;
}

export default function AdditionalInfoStep({ onNext, onBack, isFirstStep }: AdditionalInfoStepProps) {
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [mernisData, setMernisData] = useState<MernisData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Next.js router.query kullanımı için state yönetimi
    const queryParams = new URLSearchParams(window.location.search);
    const mernisDataParam = queryParams.get('mernisData');
    const errorParam = queryParams.get('error');

    if (mernisDataParam) {
      try {
        setMernisData(JSON.parse(decodeURIComponent(mernisDataParam)));
      } catch (e) {
      }
    }
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, []);

  const formik = useFormik({
    initialValues: {
      email: mernisData?.email || '',
      phoneNumber: mernisData?.phoneNumber || '',
      acceptTerms: false,
      acceptCommercial: false,
    },
    enableReinitialize: true,
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      try {
        const customerId = localStorage.getItem('customerId');
        if (!customerId) {
          throw new Error('Müşteri ID bilgisi bulunamadı');
        }

        const updatePayload = {
          $type: 'individual',
          id: customerId,
          primaryEmail: values.email,
          primaryPhoneNumber: {
            number: values.phoneNumber,
            countryCode: 90,
          },
        };

        await updateCustomerProfile(updatePayload, customerId);

        onNext();
      } catch (error) {
        setError('İşlem sırasında bir hata oluştu: ' + (error as Error).message);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Typography variant="h5" gutterBottom>
        Eksik Bilgilerinizi Tamamlayın
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Kasko Sigortası teklifiniz için eksik bilgilerinizi doldurunuz
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 3 }}>
          {error}
        </Typography>
      )}

      {mernisData && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Mernis'ten Gelen Bilgiler
          </Typography>
          <Typography variant="body2">
            Ad Soyad: {mernisData.fullName || 'Eksik'}
          </Typography>
          <Typography variant="body2">
            Doğum Tarihi: {mernisData.birthDate || 'Eksik'}
          </Typography>
          <Typography variant="body2">
            Cinsiyet: {mernisData.gender || 'Eksik'}
          </Typography>
          <Typography variant="body2">
            İl: {mernisData.city?.text || 'Eksik'}
          </Typography>
          <Typography variant="body2">
            İlçe: {mernisData.district?.text || 'Eksik'}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* E-posta ve Telefon */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: '250px' }}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="E-posta"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              placeholder="E-posta adresinizi giriniz"
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: '250px' }}>
            <TextField
              fullWidth
              id="phoneNumber"
              name="phoneNumber"
              label="Telefon"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
              helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
              placeholder="Telefon numaranızı giriniz"
            />
          </Box>
        </Box>

        {/* KVKK ve Ticari İleti Onayları */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.acceptTerms}
                onChange={formik.handleChange}
                name="acceptTerms"
                color="primary"
              />
            }
            label={
              <Typography>
                <Link
                  href="/kvkk"
                  target="_blank"
                  underline="always"
                  sx={{ color: 'primary.main' }}
                >
                  Kişisel Verilerin İşlenmesi
                </Link>
                {' ve '}
                <Link
                  href="/aydinlatma-metni"
                  target="_blank"
                  underline="always"
                  sx={{ color: 'primary.main' }}
                >
                  Aydınlatma Metni
                </Link>
                'ni ve Açık Rıza Metni'ni okudum, onaylıyorum.
              </Typography>
            }
          />
          {formik.touched.acceptTerms && formik.errors.acceptTerms && (
            <FormHelperText error>{formik.errors.acceptTerms}</FormHelperText>
          )}

          <FormControlLabel
            control={
              <Checkbox
                checked={formik.values.acceptCommercial}
                onChange={formik.handleChange}
                name="acceptCommercial"
                color="primary"
              />
            }
            label={
              <Typography>
                <Link
                  href="/elektronik-ileti-onayi"
                  target="_blank"
                  underline="always"
                  sx={{ color: 'primary.main' }}
                >
                  Ticari Elektronik İleti Metni
                </Link>
                'ni okudum, onaylıyorum.
              </Typography>
            }
          />
          {formik.touched.acceptCommercial && formik.errors.acceptCommercial && (
            <FormHelperText error>{formik.errors.acceptCommercial}</FormHelperText>
          )}
        </Box>

        {/* Butonlar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          {!isFirstStep && (
            <Button
              variant="outlined"
              onClick={onBack}
              sx={{
                minWidth: 100,
                height: 48,
                borderRadius: 2,
                textTransform: 'none',
              }}
            >
              Geri
            </Button>
          )}
          <Button
            variant="contained"
            type="submit"
            sx={{
              minWidth: 200,
              height: 48,
              borderRadius: 2,
              ml: 'auto',
              textTransform: 'none',
            }}
          >
            Devam et
          </Button>
        </Box>
      </Box>
    </Box>
  );
} 