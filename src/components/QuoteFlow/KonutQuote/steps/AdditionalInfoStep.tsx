import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  FormControlLabel,
  Switch,
  FormHelperText,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useState } from 'react';
import { useAuthStore } from '../../../../store/useAuthStore';

interface AdditionalInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  formData?: any; // Önceki form verilerini almak için
  updateFormData?: (data: any) => void; // Form verilerini güncellemek için
}

const validationSchema = yup.object({
  hasPreviousPolicy: yup.boolean(),
  previousPolicyNumber: yup.string().when('hasPreviousPolicy', {
    is: true,
    then: () => yup.string().required('Önceki poliçe numarası gereklidir'),
    otherwise: () => yup.string(),
  }),
  hasDamage: yup.boolean(),
  damageDate: yup.date().when('hasDamage', {
    is: true,
    then: () =>
      yup
        .date()
        .required('Hasar tarihi gereklidir')
        .max(new Date(), 'Hasar tarihi bugünden ileri bir tarih olamaz'),
    otherwise: () => yup.date(),
  }),
  policyStartDate: yup
    .date()
    .required('Poliçe başlangıç tarihi gereklidir')
    .min(new Date(), 'Poliçe başlangıç tarihi bugünden önce olamaz'),
  additionalNotes: yup.string().max(500, 'Notlar 500 karakterden fazla olamaz'),
});

export default function AdditionalInfoStep({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
  updateFormData,
  formData = {},
}: AdditionalInfoStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Token almak için auth store'u kullanıyoruz
  const token = useAuthStore((state) => state.accessToken);
  const customerId = useAuthStore((state) => state.customerId);

  // Poliçenin başlayabileceği en erken tarih (bugün)
  const today = new Date().toISOString().split('T')[0];

  // 30 gün sonrası için tarih hesaplama
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  const maxDate = futureDate.toISOString().split('T')[0];

  const formik = useFormik({
    initialValues: {
      hasPreviousPolicy: formData.hasPreviousPolicy || false,
      previousPolicyNumber: formData.previousPolicyNumber || '',
      hasDamage: formData.hasDamage || false,
      damageDate: formData.damageDate || '',
      policyStartDate: formData.policyStartDate || today,
      additionalNotes: formData.additionalNotes || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);

      try {
        // Form verilerini güncelle
        if (updateFormData) {
          updateFormData(values);
        }

        // Buraya isteğe bağlı olarak bir API çağrısı eklenebilir
        // API'ye token eklemek için:
        // const response = await axios.post('/api/validate-additional-info', values, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });

        // API çağrısını simüle ediyoruz
        setTimeout(() => {
          setIsSubmitting(false);
          onNext();
        }, 1000);
      } catch (error) {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Konut Sigortası için Ek Bilgiler
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph align="center">
         Konut Sigortası teklifiniz için gerekli ek bilgileri doldurunuz.
      </Typography>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Mevcut Poliçe Bilgileri
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <FormControlLabel
            control={
              <Switch
                id="hasPreviousPolicy"
                name="hasPreviousPolicy"
                checked={formik.values.hasPreviousPolicy}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                color="primary"
                disabled={isSubmitting}
              />
            }
            label="Mevcut Konut Poliçem Var"
          />
          <FormHelperText>
            Halihazırda devam eden bir Konut poliçeniz varsa işaretleyiniz
          </FormHelperText>
        </Box>

        {formik.values.hasPreviousPolicy && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: '250px' }}>
              <TextField
                fullWidth
                id="previousPolicyNumber"
                name="previousPolicyNumber"
                label="Mevcut Poliçe Numarası"
                value={formik.values.previousPolicyNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.previousPolicyNumber && Boolean(formik.errors.previousPolicyNumber)
                }
                helperText={formik.touched.previousPolicyNumber && formik.errors.previousPolicyNumber as string}
                disabled={isSubmitting}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: '250px' }} />
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Hasar Bilgileri
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <FormControlLabel
            control={
              <Switch
                id="hasDamage"
                name="hasDamage"
                checked={formik.values.hasDamage}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                color="primary"
                disabled={isSubmitting}
              />
            }
            label="Deprem Hasarı Mevcut"
          />
          <FormHelperText>
            Gayrimenkulünüz daha önce depremden hasar gördüyse işaretleyiniz
          </FormHelperText>
        </Box>

        {formik.values.hasDamage && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: '250px' }}>
              <TextField
                fullWidth
                id="damageDate"
                name="damageDate"
                label="Hasar Tarihi"
                type="date"
                value={formik.values.damageDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.damageDate && Boolean(formik.errors.damageDate)}
                helperText={formik.touched.damageDate && formik.errors.damageDate as string}
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  max: today,
                }}
                disabled={isSubmitting}
              />
            </Box>
            <Box sx={{ flex: 1, minWidth: '250px' }} />
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Poliçe Bilgileri
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: '250px' }}>
            <TextField
              fullWidth
              id="policyStartDate"
              name="policyStartDate"
              label="Poliçe Başlangıç Tarihi"
              type="date"
              value={formik.values.policyStartDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.policyStartDate && Boolean(formik.errors.policyStartDate)}
              helperText={formik.touched.policyStartDate && formik.errors.policyStartDate as string}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: today,
                max: maxDate,
              }}
              disabled={isSubmitting}
            />
            <FormHelperText>
              Poliçenizin başlamasını istediğiniz tarihi seçiniz (en fazla 30 gün sonrası)
            </FormHelperText>
          </Box>
          <Box sx={{ flex: 1, minWidth: '250px' }} />
        </Box>
      </Box>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" gutterBottom>
        Ek Notlar
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: '250px' }}>
            <TextField
              fullWidth
              id="additionalNotes"
              name="additionalNotes"
              label="Eklemek İstediğiniz Bilgiler (İsteğe Bağlı)"
              value={formik.values.additionalNotes}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.additionalNotes && Boolean(formik.errors.additionalNotes)}
              helperText={
                formik.touched.additionalNotes
                  ? (formik.errors.additionalNotes as string) 
                  : 'Konut sigortası teklifinizle ilgili eklemek istediğiniz bilgileri buraya yazabilirsiniz'
              }
              multiline
              rows={4}
              inputProps={{
                maxLength: 500,
              }}
              disabled={isSubmitting}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: '250px' }} />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button variant="outlined" color="inherit" onClick={onBack} disabled={isSubmitting}>
          Geri
        </Button>
        <Button type="submit" variant="contained" color="primary" disabled={isSubmitting} sx={{
          minWidth: 200,
          height: 48,
          borderRadius: 2,
          ml: 'auto',
          textTransform: 'none',
        }}>
          {isSubmitting ? (
            <>
              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
              İşleniyor...
            </>
          ) : (
            'Devam Et'
          )}
        </Button>
      </Box>
    </Box>
  );
}
