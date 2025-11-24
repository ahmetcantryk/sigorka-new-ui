"use client";

import {
  Box,
  Button,
  Typography,
  FormHelperText,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuthStore } from '../../../../store/useAuthStore';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { useRouter } from 'next/navigation';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';
import CustomSelect from '../../../common/Input/CustomSelect';
import Input from '../../../common/Input/Input';

// DataLayer helper functions
declare global {
  interface Window {
    dataLayer: any[];
  }
}

const pushToDataLayer = (eventData: any) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(eventData);
  }
};

// TravelOption Enum (Backend'deki enum değerleriyle eşleşmeli)
enum TravelOption {
  SCHENGEN_STANDARD = 'SCHENGEN_STANDARD',
  ALL_WORLD = 'ALL_WORLD',
  ALL_WORLD_ANNUAL = 'ALL_WORLD_ANNUAL',
}

const travelOptionOptions = [
  { value: TravelOption.SCHENGEN_STANDARD, label: 'Schengen Standart (Avrupa)' },
  { value: TravelOption.ALL_WORLD, label: 'Tüm Dünya' },
  { value: TravelOption.ALL_WORLD_ANNUAL, label: 'Tüm Dünya - Yıllık Seyahat' },
];

// TravelCountry Enum - TravelCountry.cs dosyasındaki JsonStringEnumMemberName değerleri
// Schengen ülkeleri için TravelCountrySchengenExtensions kullanılacak
// Bu liste TravelCountrySchengenExtensions.cs dosyasındaki Schengen ülkeleriyle eşleşmelidir
const schengenCountries = [
  'AVUSTURYA',        // Avusturya
  'BELCIKA',          // Belçika
  'CEK_CUMHURIYETI', // Çek Cumhuriyeti
  'DANIMARKA',        // Danimarka
  'FINLANDIYA',       // Finlandiya
  'FRANSA',           // Fransa
  'ALMANYA',          // Almanya
  'ITALYA',           // İtalya
  'LUKSEMBURG',       // Lüksemburg
  'HOLLANDA',         // Hollanda
  'ISPANYA',          // İspanya
  'ISVEC',            // İsveç
  'IZLANDA',          // İzlanda
  'ISVICRE',          // İsviçre
  'BULGARISTAN',      // Bulgaristan
  'ESTONYA',          // Estonya
  'LETONYA',          // Letonya
  'LITVANYA',         // Litvanya
  'INGILTERE',        // İngiltere
  'HIRVATISTAN',      // Hırvatistan
];

// Popüler ülkeler ve tüm ülkeler listesi (TravelCountry enum'ından)
// Türkçe alfabetik sıraya göre sıralanmıştır
const travelCountryOptions = [
  { value: 'ABD', label: 'ABD' },
  { value: 'AFGANISTAN', label: 'Afganistan' },
  { value: 'ALMANYA', label: 'Almanya' },
  { value: 'ANDORRA', label: 'Andorra' },
  { value: 'ANGOLA', label: 'Angola' },
  { value: 'ANTIGUA_VE_BARBUDA', label: 'Antigua ve Barbuda' },
  { value: 'ARJANTIN', label: 'Arjantin' },
  { value: 'ARNAVUTLUK', label: 'Arnavutluk' },
  { value: 'AVUSTRALYA', label: 'Avustralya' },
  { value: 'AVUSTURYA', label: 'Avusturya' },
  { value: 'AZERBAYCAN', label: 'Azerbaycan' },
  { value: 'BAHAMA_ADALARI', label: 'Bahama Adaları' },
  { value: 'BAHREYN', label: 'Bahreyn' },
  { value: 'BANGLADES', label: 'Bangladeş' },
  { value: 'BARBADOS', label: 'Barbados' },
  { value: 'BATI_SAMOA', label: 'Batı Samoa' },
  { value: 'BELCIKA', label: 'Belçika' },
  { value: 'BELIZE', label: 'Belize' },
  { value: 'BENIN', label: 'Benin' },
  { value: 'BERMUDA', label: 'Bermuda' },
  { value: 'BEYAZ_RUSYA', label: 'Beyaz Rusya' },
  { value: 'BHUTAN', label: 'Bhutan' },
  { value: 'BIRLESIK_ARAP_EMIRLIKLERI', label: 'Birleşik Arap Emirlikleri' },
  { value: 'BOLIVYA', label: 'Bolivya' },
  { value: 'BOSNA_HERSEK', label: 'Bosna Hersek' },
  { value: 'BOTSWANA', label: 'Botswana' },
  { value: 'BREZILYA', label: 'Brezilya' },
  { value: 'BRUNEI', label: 'Brunei' },
  { value: 'BULGARISTAN', label: 'Bulgaristan' },
  { value: 'BURKINA_FASO', label: 'Burkina Faso' },
  { value: 'BURUNDI', label: 'Burundi' },
  { value: 'CAD', label: 'Çad' },
  { value: 'CAPE_VERDE', label: 'Cape Verde' },
  { value: 'CEK_CUMHURIYETI', label: 'Çek Cumhuriyeti' },
  { value: 'CEZAYIR', label: 'Cezayir' },
  { value: 'CIBUTI', label: 'Cibuti' },
  { value: 'CIN', label: 'Çin' },
  { value: 'DANIMARKA', label: 'Danimarka' },
  { value: 'DIGER', label: 'Diğer' },
  { value: 'ESTONYA', label: 'Estonya' },
  { value: 'FINLANDIYA', label: 'Finlandiya' },
  { value: 'FRANSA', label: 'Fransa' },
  { value: 'GUNEY_AFRIKA', label: 'Güney Afrika' },
  { value: 'GUNEY_KIBRIS', label: 'Güney Kıbrıs' },
  { value: 'GURCISTAN', label: 'Gürcistan' },
  { value: 'HAITI', label: 'Haiti' },
  { value: 'HINDISTAN', label: 'Hindistan' },
  { value: 'HIRVATISTAN', label: 'Hırvatistan' },
  { value: 'HOLLANDA', label: 'Hollanda' },
  { value: 'HONDURAS', label: 'Honduras' },
  { value: 'INDONEZYA', label: 'Endonezya' },
  { value: 'INGILTERE', label: 'İngiltere' },
  { value: 'IRAK', label: 'Irak' },
  { value: 'IRAN', label: 'İran' },
  { value: 'IRLANDA', label: 'İrlanda' },
  { value: 'ISRAIL', label: 'İsrail' },
  { value: 'ISPANYA', label: 'İspanya' },
  { value: 'ISVEC', label: 'İsveç' },
  { value: 'ISVICRE', label: 'İsviçre' },
  { value: 'ITALYA', label: 'İtalya' },
  { value: 'IZLANDA', label: 'İzlanda' },
  { value: 'JAMAIKA', label: 'Jamaika' },
  { value: 'JAPONYA', label: 'Japonya' },
  { value: 'KAMBOCYA', label: 'Kamboçya' },
  { value: 'KAMERUN', label: 'Kamerun' },
  { value: 'KANADA', label: 'Kanada' },
  { value: 'KATAR', label: 'Katar' },
  { value: 'KAZAKISTAN', label: 'Kazakistan' },
  { value: 'KENYA', label: 'Kenya' },
  { value: 'KIRGIZISTAN', label: 'Kırgızistan' },
  { value: 'KIRIBATI', label: 'Kiribati' },
  { value: 'KOLOMBIYA', label: 'Kolombiya' },
  { value: 'KOMORLAR', label: 'Komorlar' },
  { value: 'KONGO', label: 'Kongo' },
  { value: 'KORE_GUNEY', label: 'Kore Güney' },
  { value: 'KORE_KUZEY', label: 'Kore Kuzey' },
  { value: 'KOSTA_RIKA', label: 'Kosta Rika' },
  { value: 'KUBA', label: 'Küba' },
  { value: 'KUVEYT', label: 'Kuveyt' },
  { value: 'KUZEY_KIBRIS_TC', label: 'Kuzey Kıbrıs TC' },
  { value: 'LAOS', label: 'Laos' },
  { value: 'LESOTHO', label: 'Lesotho' },
  { value: 'LETONYA', label: 'Letonya' },
  { value: 'LIBERYA', label: 'Liberya' },
  { value: 'LIBYA', label: 'Libya' },
  { value: 'LIECHTENSTEIN', label: 'Liechtenstein' },
  { value: 'LITVANYA', label: 'Litvanya' },
  { value: 'LUBNAN', label: 'Lübnan' },
  { value: 'LUKSEMBURG', label: 'Lüksemburg' },
  { value: 'RUSYA', label: 'Rusya' },
  { value: 'TURKIYE', label: 'Türkiye' },
].sort((a, b) => {
  // Türkçe alfabetik sıralama için özel karakterleri düzelt
  const normalizeLabel = (label: string) => {
    return label
      .toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/İ/g, 'i')
      .replace(/I/g, 'i');
  };
  
  const labelA = normalizeLabel(a.label);
  const labelB = normalizeLabel(b.label);
  
  return labelA.localeCompare(labelB, 'tr');
});

// Helper function to check if a country is Schengen
const isSchengenCountry = (country: string): boolean => {
  return schengenCountries.includes(country);
};

interface TravelInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

interface TravelFormData {
  travelStartDate: string;
  travelEndDate: string;
  travelOption: TravelOption | '';
  travelCountry: string;
}

const TravelInfoStep = ({ onNext, onBack, isFirstStep, isLastStep }: TravelInfoStepProps) => {
  const { customerId, accessToken } = useAuthStore();
  const agencyConfig = useAgencyConfig();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSeverity, setNotificationSeverity] = useState<'success' | 'error'>('success');

  const getCoverageGroupIds = (branch: string): string[] | null => {
    if (!agencyConfig?.coverageGroupIds) {
      return null;
    }
    
    const coverageIds = agencyConfig.coverageGroupIds[branch as keyof typeof agencyConfig.coverageGroupIds];
    return coverageIds && coverageIds.length > 0 ? coverageIds : null;
  };

  const validationSchema = yup.object({
    travelStartDate: yup
      .string()
      .required('Seyahat başlangıç tarihi zorunludur')
      .test('is-future', 'Seyahat başlangıç tarihi bugünden ileri bir tarih olmalıdır', function(value) {
        if (!value) return false;
        const startDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return startDate >= today;
      }),
    travelEndDate: yup
      .string()
      .required('Seyahat bitiş tarihi zorunludur')
      .test('is-after-start', 'Seyahat bitiş tarihi başlangıç tarihinden sonra olmalıdır', function(value) {
        const { travelStartDate } = this.parent;
        if (!value || !travelStartDate) return false;
        const startDate = new Date(travelStartDate);
        const endDate = new Date(value);
        return endDate > startDate;
      }),
    travelOption: yup
      .string()
      .required('Seyahat seçeneği zorunludur')
      .oneOf(Object.values(TravelOption), 'Geçerli bir seyahat seçeneği seçiniz'),
    travelCountry: yup
      .string()
      .required('Seyahat ülkesi zorunludur')
      .test('schengen-validation', 'Schengen Standart seçildiğinde Schengen ülkesi seçmelisiniz', function(value) {
        const { travelOption } = this.parent;
        if (travelOption === TravelOption.SCHENGEN_STANDARD) {
          return value ? isSchengenCountry(value) : false;
        }
        return true;
      }),
  });

  const formik = useFormik<TravelFormData>({
    initialValues: {
      travelStartDate: '',
      travelEndDate: '',
      travelOption: '',
      travelCountry: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!customerId || !accessToken) {
        setError('Müşteri bilgisi veya oturum bilgisi bulunamadı. Lütfen tekrar giriş yapınız.');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Seyahat seçeneğine göre ülke kontrolü
        if (values.travelOption === TravelOption.SCHENGEN_STANDARD && !isSchengenCountry(values.travelCountry)) {
          setError('Schengen Standart seçeneği için Schengen ülkesi seçmelisiniz.');
          setIsLoading(false);
          return;
        }

        // Teklif oluşturma payload'ı
        const proposalPayload = {
          $type: 'seyahat-saglik',
          insurerCustomerId: customerId,
          insuredCustomerId: customerId,
          travelStartDate: values.travelStartDate,
          travelEndDate: values.travelEndDate,
          travelOption: values.travelOption,
          travelCountry: values.travelCountry,
          channel: 'WEBSITE',
          coverageGroupIds: null,
          coverageTable: null,
        };

        // Analytics event
        pushToDataLayer({
          event: 'seyahat_saglik_proposal_create',
          travel_option: values.travelOption,
          travel_country: values.travelCountry,
        });

        const response = await fetchWithAuth(API_ENDPOINTS.PROPOSALS_CREATE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(proposalPayload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `Teklif oluşturulamadı: ${response.status} ${response.statusText}`;
          
          try {
            const errorData = JSON.parse(errorText);
            if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
              errorMessage = errorData.errors[0];
            } else if (errorData.message) {
              errorMessage = errorData.message;
            }
          } catch (parseError) {
            // JSON parse hatası durumunda default mesaj kullan
          }
          
          throw new Error(errorMessage);
        }

        const result = await response.json();
        const newProposalId = result.proposalId || result.id;

        if (!newProposalId) {
          throw new Error('Teklif oluşturuldu ancak teklif ID alınamadı.');
        }

        localStorage.setItem('SeyahatSaglikProposalId', newProposalId);

        setNotificationMessage('Seyahat Sağlık Sigortası teklifi başarıyla oluşturuldu!');
        setNotificationSeverity('success');
        setShowNotification(true);

        // Başarılı teklif oluşturma - analytics event
        pushToDataLayer({
          event: 'seyahat_saglik_proposal_success',
          proposal_id: newProposalId,
        });

        // Quote comparison sayfasına yönlendir (Kasko gibi)
        setTimeout(() => {
          router.push(`/seyahat-saglik/quote-comparison/${newProposalId}`);
        }, 1000);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Teklif oluşturulurken bir hata oluştu';
        setNotificationMessage(errorMessage);
        setNotificationSeverity('error');
        setShowNotification(true);
        
        // Hata analytics event
        pushToDataLayer({
          event: 'seyahat_saglik_proposal_error',
          error_message: errorMessage,
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Seyahat seçeneğine göre ülke listesini filtrele
  const getFilteredCountries = () => {
    if (formik.values.travelOption === TravelOption.SCHENGEN_STANDARD) {
      return travelCountryOptions.filter(country => isSchengenCountry(country.value));
    }
    return travelCountryOptions;
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  return (
    <Box sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        Seyahat Bilgileri
      </Typography>

      <Snackbar
        open={showNotification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notificationSeverity}>
          {notificationMessage}
        </Alert>
      </Snackbar>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>

      <form onSubmit={formik.handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Seyahat Başlangıç ve Bitiş Tarihleri */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
              <Input
                label="Seyahat Başlangıç Tarihi"
                name="travelStartDate"
                type="date"
                value={formik.values.travelStartDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.travelStartDate && Boolean(formik.errors.travelStartDate)}
                helperText={formik.touched.travelStartDate ? String(formik.errors.travelStartDate) : undefined}
                required
              />
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
              <Input
                label="Seyahat Bitiş Tarihi"
                name="travelEndDate"
                type="date"
                value={formik.values.travelEndDate}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.travelEndDate && Boolean(formik.errors.travelEndDate)}
                helperText={formik.touched.travelEndDate ? String(formik.errors.travelEndDate) : undefined}
                required
              />
            </Box>
          </Box>

          {/* Seyahat Seçeneği ve Ülkesi */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
              <CustomSelect
                label="Seyahat Seçeneği"
                value={formik.values.travelOption}
                onChange={(value: string) => {
                  formik.setFieldValue('travelOption', value);
                  formik.setFieldTouched('travelOption', true);
                  // Seyahat seçeneği değiştiğinde ülke seçimini sıfırla
                  if (value !== TravelOption.SCHENGEN_STANDARD) {
                    formik.setFieldValue('travelCountry', '');
                  }
                }}
                error={formik.touched.travelOption ? String(formik.errors.travelOption || '') : undefined}
                options={travelOptionOptions}
                required
              />
              {formik.touched.travelOption && formik.errors.travelOption && (
                <FormHelperText error>{String(formik.errors.travelOption)}</FormHelperText>
              )}
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
              <CustomSelect
                label="Seyahat Ülkesi"
                value={formik.values.travelCountry}
                onChange={(value: string) => {
                  formik.setFieldValue('travelCountry', value);
                  formik.setFieldTouched('travelCountry', true);
                }}
                error={formik.touched.travelCountry ? String(formik.errors.travelCountry || '') : undefined}
                options={getFilteredCountries()}
                required
                disabled={!formik.values.travelOption}
              />
              {formik.touched.travelCountry && formik.errors.travelCountry && (
                <FormHelperText error>{String(formik.errors.travelCountry)}</FormHelperText>
              )}
              {formik.values.travelOption === TravelOption.SCHENGEN_STANDARD && (
                <FormHelperText>
                  Schengen Standart seçeneği için Schengen ülkelerinden birini seçmelisiniz.
                </FormHelperText>
              )}
            </Box>
          </Box>

          {/* Butonlar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant="outlined"
              onClick={onBack}
              disabled={isFirstStep || isLoading}
              sx={{ minWidth: 120 }}
            >
              Geri
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              sx={{ minWidth: 120 }}
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Oluşturuluyor...
                </>
              ) : (
                'Teklif Oluştur'
              )}
            </Button>
          </Box>
        </Box>
        </form>
        </>
      )}
    </Box>
  );
};

export default TravelInfoStep;

