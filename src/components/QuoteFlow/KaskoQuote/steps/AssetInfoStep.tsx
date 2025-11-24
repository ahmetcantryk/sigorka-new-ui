import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Snackbar,
  Alert,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Autocomplete,
  Grid,
  InputAdornment,
} from '@mui/material';
import { useFormik } from 'formik';
import { useState, useEffect, useCallback, useRef } from 'react';
import * as yup from 'yup';
import { useAuthStore } from '../../../../store/useAuthStore';
import { VehicleUtilizationStyle, VehicleFuelType } from '../../../../types/enums/vehicleEnums';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { useAgencyConfig } from '@/context/AgencyConfigProvider';
import '../../../../styles/form-style.css';

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

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  plateNumber: string;
  vehicleType: string;
  utilizationStyle?: number;
  fuelType?: number;
  engineNumber?: string;
  chassisNumber?: string;
  documentSerial?: {
    code: string;
    number: string;
  };
  registrationDate?: string;
  seatNumber?: number;
}

// API'den dönen veri yapısını tanımla
interface ApiVehicleModel {
  brand?: { text?: string; value?: string };
  type?: { text?: string; value?: string };
  year?: number;
}

interface ApiVehiclePlate {
  city?: string;
  code?: string;
}

// Yeni eklenen interface
interface ProposalResult {
  proposalId?: string;
  id?: string; 
}

interface ApiVehicleResponse {
  id?: string;
  model?: ApiVehicleModel;
  plate?: ApiVehiclePlate;
  type?: string;
  utilizationStyle?: number;
  fuel?: {
    type?: number;
  };
  engineNumber?: string;
  chassisNumber?: string;
  documentSerial?: {
    code: string;
    number: string;
  };
  registrationDate?: string;
  seatNumber?: number;
}

interface BrandData {
  value: string;
  text: string;
}

interface ModelData {
  value: string;
  text: string;
}

interface CityData {
  value: string;
  text: string;
}

const validationSchema = yup.object({
  selectionType: yup.string(), // Formik değerlerinde olduğu için ekliyoruz
  vehicleType: yup.string(), // Formik değerlerinde olduğu için ekliyoruz
  documentSerialCode: yup.string().when(['vehicleType', 'selectionType'], {
    is: (vehicleType: string, selectionType: string) => vehicleType === 'plated' && selectionType === 'new',
    then: (schema) => schema
      .required('Belge seri kodu zorunludur')
      .length(2, 'Belge seri kodu 2 harf olmalıdır')
      .matches(/^[A-Z]{2}$/, 'Belge seri kodu sadece 2 büyük harf olmalıdır'),
    otherwise: (schema) => schema.nullable(),
  }),
  documentSerialNumber: yup.string().when(['vehicleType', 'selectionType'], {
    is: (vehicleType: string, selectionType: string) => vehicleType === 'plated' && selectionType === 'new',
    then: (schema) => schema
      .required('Belge seri numarası zorunludur')
      .length(6, 'Belge seri numarası 6 rakam olmalıdır')
      .matches(/^[0-9]{6}$/, 'Belge seri numarası sadece 6 rakam olmalıdır'),
    otherwise: (schema) => schema.nullable(),
  }),
  plateCity: yup.string().when('selectionType', {
    is: 'new',
    then: (schema) => schema.required('Plaka il kodu zorunludur'),
    otherwise: (schema) => schema.nullable(),
  }),
  plateCode: yup.string().when(['vehicleType', 'selectionType'], {
    is: (vehicleType: string, selectionType: string) => vehicleType === 'plated' && selectionType === 'new',
    then: (schema) => schema
      .required('Plaka zorunludur')
      .matches(/^([A-Z]{1}[0-9]{4}|[A-Z]{2}[0-9]{3}|[A-Z]{2}[0-9]{4}|[A-Z]{3}[0-9]{2}|[A-Z]{3}[0-9]{3})$/, 'Plaka formatı geçersiz. Geçerli formatlar: A1234, AB123, AB1234, ABC12, ABC123'),
    otherwise: (schema) => schema.nullable(),
  }),
  brandCode: yup.string().when('selectionType', {
    is: 'new',
    then: (schema) => schema.required('Marka seçimi zorunludur'),
    otherwise: (schema) => schema.nullable(),
  }),
  modelCode: yup.string().when('selectionType', {
    is: 'new',
    then: (schema) => schema.required('Model seçimi zorunludur'),
    otherwise: (schema) => schema.nullable(),
  }),
  year: yup.string().when('selectionType', {
    is: 'new',
    then: (schema) => schema
      .required('Model yılı zorunludur')
      .matches(/^[0-9]{4}$/, 'Model yılı 4 rakam olmalıdır')
      .test('year-range', 'Model yılı 1900 ile güncel yıl arasında olmalıdır', function(value) {
        if (!value) return false;
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        return year >= 1900 && year <= currentYear;
      }),
    otherwise: (schema) => schema.nullable(),
  }),
  usageType: yup.string().when('selectionType', {
    is: 'new',
    then: (schema) => schema.required('Kullanım şekli zorunludur'),
    otherwise: (schema) => schema.nullable(),
  }),
  fuelType: yup.string().when('selectionType', {
    is: 'new',
    then: (schema) => schema.required('Yakıt tipi zorunludur'),
    otherwise: (schema) => schema.nullable(),
  }),
  chassisNo: yup.string().when('selectionType', {
    is: 'new',
    then: (schema) =>
      schema
        .required('Şasi No zorunludur')
        .length(17, 'Şasi No 17 karakter olmalıdır')
        .matches(/^[A-ZİĞÜŞÖÇ0-9]{17}$/, 'Şasi No sadece harf ve rakam içermelidir'),
    otherwise: (schema) => schema.nullable(),
  }),
  engineNo: yup.string().when('selectionType', {
    is: 'new',
    then: (schema) =>
      schema
        .required('Motor No zorunludur')
        .min(6, 'Motor No en az 6 karakter olmalıdır')
        .max(20, 'Motor No en fazla 20 karakter olmalıdır')
        .matches(/^[A-ZİĞÜŞÖÇa-zığüşöç0-9]+$/, 'Motor No sadece harf ve rakam içermelidir'),
    otherwise: (schema) => schema.nullable(),
  }),
  registrationDate: yup.string().when('selectionType', {
    is: 'new',
    then: (schema) => schema.required('Tescil tarihi zorunludur'),
    otherwise: (schema) => schema.nullable(),
  }),
  seatCount: yup.string().when('selectionType', {
    is: 'new',
    then: (schema) => schema.required('Koltuk adedi zorunludur'),
    otherwise: (schema) => schema.nullable(),
  }),
});

interface AssetInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

// Kullanım şekli seçenekleri
const utilizationStyleOptions = [
  { value: VehicleUtilizationStyle.AgriculturalMachineExcludingTractor.toString(), label: 'Tarım Makinesi' },
  { value: VehicleUtilizationStyle.ClosedBedPickup.toString(), label: 'Kapalı Kasa Kamyonet' },
  { value: VehicleUtilizationStyle.DumpTruck.toString(), label: 'Damperli Kamyon' },
  { value: VehicleUtilizationStyle.HeavyMachinery.toString(), label: 'İş Makinesi' },
  { value: VehicleUtilizationStyle.LargeBus.toString(), label: "Otobüs (31'den fazla yolculu)" },
  { value: VehicleUtilizationStyle.MediumBus.toString(), label: 'Otobüs (18-30 yolculu)' },
  { value: VehicleUtilizationStyle.Motorcycle.toString(), label: 'Motosiklet' },
  { value: VehicleUtilizationStyle.OpenBodyTruck.toString(), label: 'Açık Kasa Kamyon' },
  { value: VehicleUtilizationStyle.PickupTruck.toString(), label: 'Açık Kasa Kamyonet' },
  { value: VehicleUtilizationStyle.PrivateCar.toString(), label: 'Hususi Otomobil' },
  { value: VehicleUtilizationStyle.PrivateMinibus.toString(), label: 'Özel Minibüs' },
  { value: VehicleUtilizationStyle.RouteMinibus.toString(), label: 'Hatlı Minibüs' },
  { value: VehicleUtilizationStyle.Tanker.toString(), label: 'Tanker' },
  { value: VehicleUtilizationStyle.Taxi.toString(), label: 'Taksi' },
  { value: VehicleUtilizationStyle.TowTruck.toString(), label: 'Çekici' },
  { value: VehicleUtilizationStyle.Trailer.toString(), label: 'Römork' },
  { value: VehicleUtilizationStyle.Tractor.toString(), label: 'Traktör' },
  { value: VehicleUtilizationStyle.Truck.toString(), label: 'Kapalı Kasa Kamyon' },
].sort((a, b) => a.label.localeCompare(b.label, 'tr'));

// Yakıt tipi enum'ını düzeltiyorum
const fuelTypeOptions = [
  { value: '1', label: 'Benzin' },
  { value: '2', label: 'Dizel' },
  { value: '3', label: 'LPG' },
  { value: '4', label: 'Elektrik' },
  { value: '5', label: 'Hibrit' }
];

export default function AssetInfoStep({
  onNext,
  onBack,
  isFirstStep,
  isLastStep,
}: AssetInfoStepProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectionType, setSelectionType] = useState<'existing' | 'new'>('new');
  const [vehicleType, setVehicleType] = useState<'plated' | 'unplated'>('plated');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [kaskoOldPolicy, setKaskoOldPolicy] = useState<any>(null);
  const [trafikOldPolicy, setTrafikOldPolicy] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSeverity, setNotificationSeverity] = useState<'success' | 'error'>('success');

  const { customerId: customerIdFromStore, accessToken } = useAuthStore();
  const agencyConfig = useAgencyConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [isModelsLoading, setIsModelsLoading] = useState(false); // Model yükleme için ayrı state
  const [modelError, setModelError] = useState<string | null>(null); // Model hata mesajı için state
  const [error, setError] = useState<string | null>(null);
  const [isTokenRefreshing, setIsTokenRefreshing] = useState(false);
  const tokenIntervalRef = useRef<number | null>(null);
  const [vehicleBrands, setVehicleBrands] = useState<Array<{ value: string; text: string; label?: string }>>([]);
  const [vehicleModels, setVehicleModels] = useState<Array<{ value: string; text: string; label?: string }>>([]);
  const [plateCities, setPlateCities] = useState<Array<{ value: string; text: string; label?: string }>>([]);
  const router = useRouter();

  const getCustomerIdFromAuthStorage = (): string | null => {
    const authStorageItem = localStorage.getItem('auth-storage');
    if (authStorageItem) {
      try {
        const authState = JSON.parse(authStorageItem).state;
        return authState?.customerId || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const getCoverageGroupIds = (branch: string): string[] | null => {
    if (!agencyConfig?.coverageGroupIds) {
      return null;
    }
    
    const coverageIds = agencyConfig.coverageGroupIds[branch as keyof typeof agencyConfig.coverageGroupIds];
    return coverageIds && coverageIds.length > 0 ? coverageIds : null;
  };

  // ME API kontrolü için useEffect
  useEffect(() => {
    let isMounted = true;
    const checkMissingInfo = async () => {
      if (accessToken && isMounted) {
        // Check if PersonalInfoStep was just completed to prevent infinite loop
        const personalInfoCompleted = localStorage.getItem('kaskoPersonalInfoCompleted');
        if (personalInfoCompleted === 'true') {
          // Clear the flag and skip the check
          localStorage.removeItem('kaskoPersonalInfoCompleted');
          return;
        }

        try {
          const rawResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });

          if (!isMounted) return;
            
          if (rawResponse.ok) {
            const data = await rawResponse.json() as { fullName?: string; title?: string; city?: {value: string}; district?: {value: string, text: string}};
            if (data) {
              // Check for both individual (fullName) and corporate (title) customer data
              const hasMissingInfo = (!data.fullName && !data.title) || !data.city?.value || !data.district?.value || !data.district?.text;
              if (hasMissingInfo) {
                if (isMounted) onBack(); // PersonalInfoStep'e geri dön
                return;
              }
            } else {
              if (isMounted) onBack();
              return;
            }
          } else if (rawResponse.status === 204) {
            if (isMounted) onBack();
            return;
          } else {
            const errorText = await rawResponse.text();
            if (isMounted) onBack();
            return;
          }
        } catch (error) {
          if (isMounted) {
            // setError('Kullanıcı bilgileri kontrol edilemedi.'); // Opsiyonel: Kullanıcıya hata göster
            // Belki burada da onBack() çağrılmalı veya akış durdurulmalı
          }
        }
      }
    };

    checkMissingInfo();

    return () => {
      isMounted = false;
    };
  }, [accessToken, onBack]);

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const refreshAccessToken = useCallback(async () => {
    if (isTokenRefreshing) return;

    try {
      setIsTokenRefreshing(true);

      if (!accessToken) {
        throw new Error('Oturum bilgisi bulunamadı');
      }

      return accessToken;
    } catch (error) {
      throw error;
    } finally {
      setIsTokenRefreshing(false);
    }
  }, [accessToken, isTokenRefreshing]);

  const fetchWithAuthModels = useCallback(async (brandCode: string, modelYear: string) => {
    try {
      setIsModelsLoading(true);
      setVehicleModels([]);
      setModelError(null); // Hata mesajını temizle

      const tokenToUse = accessToken ?? (await refreshAccessToken());

      if (!tokenToUse) {
        throw new Error('Oturum bilgisi bulunamadı');
      }

      const response = await fetchWithAuth(
        API_ENDPOINTS.VEHICLE_MODELS(brandCode, modelYear),
        {
          headers: {
            Authorization: `Bearer ${tokenToUse}`,
          },
        }
      );

      if ((response as any).ok) {
        const data = await (response as any).json();
        
        // Duplicate'ları temizle - value bazında unique yap
        const uniqueModels = data.reduce((acc: ModelData[], current: ModelData) => {
          const existingModel = acc.find(model => model.value === current.value);
          if (!existingModel) {
            acc.push(current);
          }
          return acc;
        }, []);
        
        // Alfabetik sırala
        const sortedModels = uniqueModels.sort((a: ModelData, b: ModelData) => 
          a.text.localeCompare(b.text, 'tr-TR')
        );
        
        // Boş model listesi kontrolü
        if (sortedModels.length === 0) {
          const selectedBrand = vehicleBrands.find(brand => brand.value === brandCode);
          const brandName = selectedBrand ? selectedBrand.text : 'Seçilen marka';
          setModelError(`${brandName} markası için ${modelYear} model yılında model bulunamadı.`);
        }
        
        setVehicleModels(sortedModels);
      } else {
        setModelError('Araç modelleri yüklenirken bir hata oluştu.');
      }
    } catch (error) {
      setModelError('Araç modelleri yüklenirken bir hata oluştu.');
    } finally {
      setIsModelsLoading(false);
    }
  }, [accessToken, refreshAccessToken, vehicleBrands]);

  useEffect(() => {
    let isMounted = true;

    // Araç markalarını API'den çek
    const fetchWithAuthBrands = async () => {
      if (!isMounted) return;
      try {
        let tokenToUse = accessToken;
        if (!tokenToUse) {
          tokenToUse = (await refreshAccessToken()) ?? null;
        }

        if (!tokenToUse && isMounted) {
          return;
        }

        const response = await fetchWithAuth(API_ENDPOINTS.VEHICLE_BRANDS, {
          headers: {
            Authorization: `Bearer ${tokenToUse}`,
          },
        });

        if (isMounted) {
          if (response.ok) {
            const data = await response.json();
            // Markaları alfabetik sıraya göre sırala
            const sortedBrands = (data as BrandData[]).sort((a, b) => 
              a.text.localeCompare(b.text, 'tr-TR')
            );
            setVehicleBrands(sortedBrands.map((brand: BrandData) => ({ ...brand, label: brand.text })));
          } else {
            const errorText = await response.text();
          }
        }
      } catch (error) {
        if (isMounted) {
        }
      }
    };

    // İl kodlarını API'den çek
    const fetchPlateCities = async () => {
      try {
        const response: any = await fetchWithAuth(API_ENDPOINTS.ADDRESS_CITIES);
        if (response.ok) {
          const data: CityData[] = await response.json();
          
          // Özel durumlar için ayrı bir array
          const specialCities = data.filter(city => 
            ['89', '999'].includes(city.value) // Kıbrıs ve Yurtdışı
          );
          
          // Normal şehirler
          const normalCities = data.filter(city => 
            !['89', '999'].includes(city.value)
          );

          // Normal şehirleri sayısal olarak sırala
          const sortedNormalCities = normalCities.sort((a, b) => {
            const aNum = parseInt(a.value);
            const bNum = parseInt(b.value);
            return aNum - bNum;
          });

          // Plaka kodlarını formatla (value orijinal, görüntü için 0 ekle)
          const formattedCities = sortedNormalCities.map(city => {
            const numValue = parseInt(city.value);
            const displayValue = numValue < 10 ? `0${numValue}` : `${numValue}`;
            return {
              ...city,
              value: city.value, // Orijinal değeri koru
              label: `${displayValue} - ${city.text}`
            };
          });

          // Özel durumları sona ekle
          const formattedSpecialCities = specialCities.map(city => ({
            ...city,
            label: `${city.value} - ${city.text}`
            }));

          setPlateCities([...formattedCities, ...formattedSpecialCities]);
          } else {
        }
      } catch (error) {
      }
    };

    // Araç markalarını yükle
    fetchWithAuthBrands();
    // İl kodlarını yükle
    fetchPlateCities();

    // Kullanıcının araçlarını API'den çek
    const fetchWithAuthVehicles = async () => {
      if (!isMounted) return;
      setIsLoading(true);
      setError(null);

      try {
        const customerIdToUse = getCustomerIdFromAuthStorage() || customerIdFromStore || '';

        if (!customerIdToUse || customerIdToUse === 'undefined') {
          if (isMounted) setError('Müşteri ID bulunamadı');
          if (isMounted) setIsLoading(false);
          return;
        }

        let tokenToUse = accessToken;
        if (!tokenToUse) {
          tokenToUse = (await refreshAccessToken()) ?? null;
        }

        if (!tokenToUse && isMounted) {
          if (isMounted) setError('Araç bilgileri için oturum gerekli.');
          if (isMounted) setIsLoading(false);
          return;
        }
        
        const rawVehiclesResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_VEHICLES, {
          headers: {
            Authorization: `Bearer ${tokenToUse}`,
          },
        });

        if (isMounted) {
          if (rawVehiclesResponse.ok) {
            const data = await rawVehiclesResponse.json() as ApiVehicleResponse[];
            if (data && Array.isArray(data)) {
              const formattedVehicles = data.map((v: ApiVehicleResponse) => ({
                id: v.id || '',
                brand: v.model?.brand?.text || '',
                model: v.model?.type?.text || '',
                year: v.model?.year || new Date().getFullYear(),
                plateNumber: v.plate ? `${v.plate.city || ''} ${v.plate.code || ''}`.trim() : '',
                vehicleType: v.type || 'car',
                utilizationStyle: v.utilizationStyle || VehicleUtilizationStyle.Unknown,
                fuelType: v.fuel?.type || VehicleFuelType.Diesel,
                engineNumber: v.engineNumber || '',
                chassisNumber: v.chassisNumber || '',
                documentSerial: v.documentSerial || { code: '', number: '' },
                registrationDate: v.registrationDate || new Date().toISOString().split('T')[0],
                seatNumber: v.seatNumber || 5,
              }));

              setVehicles(formattedVehicles);

              if (formattedVehicles.length > 0) {
                setSelectionType('existing');
              } else {
                setSelectionType('new');
              }
            } else {
              setVehicles([]);
              setSelectionType('new');
            }
          } else {
            const errorText = await rawVehiclesResponse.text();
            setVehicles([]);
            setSelectionType('new');
          }
        }
      } catch (apiError) {
        if (isMounted) {
          setError(`Araç bilgileri alınamadı: ${(apiError as Error).message}`);
          setSelectionType('new');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWithAuthVehicles();

    return () => {
      isMounted = false;
    };
  }, [accessToken, customerIdFromStore, refreshAccessToken]);

  const formik = useFormik({
    initialValues: {
      selectionType: 'new',
      vehicleType: 'plated',
      brand: '',
      brandCode: '',
      model: '',
      modelCode: '',
      year: new Date().getFullYear().toString(),
      plateCity: '',
      plateCode: '',
      usageType: VehicleUtilizationStyle.PrivateCar.toString(),
      fuelType: VehicleFuelType.Diesel.toString(),
      engineNo: '',
      chassisNo: '',
      documentSerialCode: '',
      documentSerialNumber: '',
      registrationDate: new Date().toISOString().split('T')[0],
      seatCount: '5',
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);

        // Token kontrolü
        const tokenToUse = await refreshAccessToken();

        if (selectionType === 'existing' && selectedVehicleId) {
          const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId);
          if (selectedVehicle) {
            localStorage.setItem('selectedVehicleForKasko', JSON.stringify(selectedVehicle));
            
            try {
              const storedCustomerId = localStorage.getItem('customerId') || customerIdFromStore || '';

              if (!storedCustomerId || storedCustomerId === 'undefined') {
                throw new Error('Müşteri ID bilgisi bulunamadı');
              }

              const proposalData = {
                $type: 'kasko',
                vehicleId: selectedVehicle.id,
                productBranch: 'KASKO',
                insurerCustomerId: storedCustomerId,
                insuredCustomerId: storedCustomerId,
                coverageGroupIds: getCoverageGroupIds('kasko'),
                channel: 'WEBSITE',
              };

              const proposalUrl = API_ENDPOINTS.PROPOSALS_CREATE;
              const proposalResponse = await fetchWithAuth(proposalUrl, {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${tokenToUse}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(proposalData),
              });

              if (!(proposalResponse as any).ok) {
                const proposalErrorText = await (proposalResponse as any).text();
                throw new Error(
                  `Kasko teklifi oluşturulurken bir hata oluştu: ${proposalErrorText}`
                );
              }

              const proposalResult = await (proposalResponse as any).json();

              if (proposalResult && proposalResult.proposalId) {
                localStorage.setItem('proposalIdForKasko', proposalResult.proposalId);
              } else if (proposalResult && proposalResult.id) {
                localStorage.setItem('proposalIdForKasko', proposalResult.id);
              } else {
              }

              router.push(`/kasko/quote-comparison/${proposalResult.proposalId}`);
            } catch (proposalError) {
              setNotificationMessage(`Kasko teklifi oluşturulurken bir hata oluştu: ${(proposalError as Error).message}`);
              setNotificationSeverity('error');
              setShowNotification(true);
            }
          }
        } else {
          // Yeni araç ekleme ve kasko teklifi oluşturma işlemleri
          const storedCustomerId = localStorage.getItem('customerId') || customerIdFromStore;

          if (!storedCustomerId || storedCustomerId === 'undefined') {
            setNotificationMessage('Müşteri ID bulunamadı. Lütfen tekrar giriş yapın.');
            setNotificationSeverity('error');
            setShowNotification(true);
            setIsLoading(false);
            return;
          }

          const vehicleData = {
            customerId: storedCustomerId,
            plate: {
              city: parseInt(values.plateCity) || 0,
              code: vehicleType === 'plated' ? values.plateCode : '',
            },
            modelYear: parseInt(values.year),
            brandReference: values.brandCode,
            modelTypeReference: values.modelCode,
            utilizationStyle: parseInt(values.usageType),
            fuel: {
              type: parseInt(values.fuelType),
              customLpg: false,
              customLpgPrice: null,
            },
            engine: values.engineNo,
            chassis: values.chassisNo,
            ...(values.documentSerialCode && values.documentSerialNumber && {
              documentSerial: {
                code: values.documentSerialCode,
                number: values.documentSerialNumber,
              },
            }),
            registrationDate: values.registrationDate,
            seatNumber: parseInt(values.seatCount),
            accessories: [],
            kaskoOldPolicy: null,
            trafikOldPolicy: null,
            lossPayeeClause: null,
          };

          try {
            const vehicleResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_VEHICLES_BY_ID(storedCustomerId), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tokenToUse}`,
              },
              body: JSON.stringify(vehicleData),
            });

            if (!(vehicleResponse as any).ok) {
              throw new Error('Araç kaydı oluşturulurken bir hata oluştu');
            }

            const vehicleResult = await (vehicleResponse as any).json();
            const vehicleId = vehicleResult.id;

            if (!vehicleId) {
              throw new Error('Araç ID alınamadı');
            }

            // Araç kaydı başarılı olduktan sonra teklif oluşturma isteği
            const proposalData = {
              $type: 'kasko',
              vehicleId: vehicleId,
              productBranch: 'KASKO',
              insurerCustomerId: storedCustomerId,
              insuredCustomerId: storedCustomerId,
              coverageGroupIds: getCoverageGroupIds('kasko'),
              channel: 'WEBSITE',
            };

            const proposalResponse = await fetchWithAuth(API_ENDPOINTS.PROPOSALS_CREATE, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${tokenToUse}`,
              },
              body: JSON.stringify(proposalData),
            });

            if (!(proposalResponse as any).ok) {
              throw new Error('Kasko teklifi oluşturulurken bir hata oluştu');
            }

            const proposalResult = await (proposalResponse as any).json();
            console.log('Kasko Proposal Result:', proposalResult);
            
            if (proposalResult && proposalResult.proposalId) {
              localStorage.setItem('proposalIdForKasko', proposalResult.proposalId);
              
              setNotificationMessage('Kasko teklifi başarıyla oluşturuldu');
              setNotificationSeverity('success');
              setShowNotification(true);
              
              // DataLayer push (trafik'teki gibi)
              pushToDataLayer({
                event: "kasko_formsubmit",
                form_name: "kasko_step2"
              });
              
              setTimeout(() => {
                router.push(`/kasko/quote-comparison/${proposalResult.proposalId}`);
              }, 1000);
              return;
            } else if (proposalResult && proposalResult.id) {
              localStorage.setItem('proposalIdForKasko', proposalResult.id);
              
              setNotificationMessage('Kasko teklifi başarıyla oluşturuldu');
              setNotificationSeverity('success');
              setShowNotification(true);
              
              // DataLayer push (trafik'teki gibi)
              pushToDataLayer({
                event: "kasko_formsubmit", 
                form_name: "kasko_step2"
              });
              
              setTimeout(() => {
                router.push(`/kasko/quote-comparison/${proposalResult.id}`);
              }, 1000);
              return;
            }
          } catch (error) {
            setNotificationMessage(`Kasko teklifi oluşturulurken bir hata oluştu: ${(error as Error).message}`);
            setNotificationSeverity('error');
            setShowNotification(true);
          }
        }
      } catch (error) {
        setNotificationMessage(`İşlem sırasında bir hata oluştu: ${(error as Error).message}`);
        setNotificationSeverity('error');
        setShowNotification(true);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Form input değişimini yönet - AddVehicleModal'daki gibi
  const handleChange = (name: string, value: string) => {
    // Plaka kodu için özel doğrulama
    if (name === 'plateCode') {
      // Sadece harfler ve rakamlar, boşluk yok
      const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      
      // Maksimum 6 karakter ile sınırla (3 harf + 3 rakam için)
      const truncatedValue = sanitizedValue.slice(0, 6);
      
      formik.setFieldValue('plateCode', truncatedValue);
      formik.setFieldTouched('plateCode', true);
      // Anlık validation
      setTimeout(() => formik.validateField('plateCode'), 0);
      return;
    }

    // Belge seri kodu için özel doğrulama
    if (name === 'documentSerialCode') {
      // Sadece harflere izin ver, büyük harfe çevir, maksimum 2 karakter
      const sanitizedValue = value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
      formik.setFieldValue('documentSerialCode', sanitizedValue);
      formik.setFieldTouched('documentSerialCode', true);
      // Anlık validation
      setTimeout(() => formik.validateField('documentSerialCode'), 0);
      return;
    }

    // Belge seri numarası için özel doğrulama
    if (name === 'documentSerialNumber') {
      // Sadece rakamlar, maksimum 6 karakter
      const sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 6);
      formik.setFieldValue('documentSerialNumber', sanitizedValue);
      formik.setFieldTouched('documentSerialNumber', true);
      // Anlık validation
      setTimeout(() => formik.validateField('documentSerialNumber'), 0);
      return;
    }

    // Model yılı için özel doğrulama
    if (name === 'year') {
      // Model error'unu temizle
      setModelError(null);
      
      // Sadece rakamlar, maksimum 4 karakter
      const sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 4);
      formik.setFieldValue('year', sanitizedValue);
      formik.setFieldTouched('year', true);
      // Anlık validation
      setTimeout(() => formik.validateField('year'), 0);
      
      // Model yılı değiştiğinde ve marka seçiliyse modelleri yükle (sadece 4 haneli yıl girildiyse)
      if (formik.values.brandCode && sanitizedValue.length === 4) {
        const year = parseInt(sanitizedValue);
        const currentYear = new Date().getFullYear();
        if (year >= 1900 && year <= currentYear) {
          fetchWithAuthModels(formik.values.brandCode, sanitizedValue);
        }
      }
      return;
    }

    // Motor No için özel doğrulama
    if (name === 'engineNo') {
      // Sadece harf ve rakam (Türkçe karakterler dahil), otomatik büyük harf
      const sanitizedValue = value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9]/g, '').toLocaleUpperCase('tr-TR').slice(0, 20);
      formik.setFieldValue('engineNo', sanitizedValue);
      formik.setFieldTouched('engineNo', true);
      // Anlık validation
      setTimeout(() => formik.validateField('engineNo'), 0);
      return;
    }

    // Şasi No için özel doğrulama
    if (name === 'chassisNo') {
      // Sadece harf ve rakam (Türkçe karakterler dahil), otomatik büyük harf, maksimum 17 karakter
      const sanitizedValue = value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ0-9]/g, '').toLocaleUpperCase('tr-TR').slice(0, 17);
      formik.setFieldValue('chassisNo', sanitizedValue);
      formik.setFieldTouched('chassisNo', true);
      // Anlık validation
      setTimeout(() => formik.validateField('chassisNo'), 0);
      return;
    }

    // Marka değiştiğinde
    if (name === 'brandCode') {
      // Model error'unu temizle
      setModelError(null);
      
      const selectedBrand = vehicleBrands.find((brand) => brand.value === value);
      formik.setFieldValue('brandCode', value);
      formik.setFieldValue('brand', selectedBrand?.text || '');
      formik.setFieldTouched('brandCode', true);
      // Anlık validation
      setTimeout(() => formik.validateField('brandCode'), 0);

      // Marka değiştiğinde modelleri yükle (sadece geçerli yıl varsa)
      if (value && formik.values.year && formik.values.year.length === 4) {
        const year = parseInt(formik.values.year);
        const currentYear = new Date().getFullYear();
        if (year >= 1900 && year <= currentYear) {
          fetchWithAuthModels(value, formik.values.year.toString());
        }
      }
    }
    // Model değiştiğinde
    else if (name === 'modelCode') {
      const selectedModel = vehicleModels.find((model) => model.value === value);
      formik.setFieldValue('modelCode', value);
      formik.setFieldValue('model', selectedModel?.text || '');
      formik.setFieldTouched('modelCode', true);
      setTimeout(() => formik.validateField('modelCode'), 0);
    } else {
      // Diğer alanlar için normal işlem
      formik.setFieldValue(name, value);
      formik.setFieldTouched(name, true);
    }
  };

  // Kayıtlı araç seçildiğinde bu fonksiyon çalışacak
  const handleVehicleSelect = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
  };

  // Input blur handler
  const handleBlur = (fieldName: string) => {
    formik.setFieldTouched(fieldName, true);
    // Formik'in built-in validation'ını tetikle
    formik.validateField(fieldName);
  };

  const renderStep1 = () => (
    <>
      {/* Araç Tipi Seçimi */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setVehicleType('plated')}
          className={`flex flex-col items-center rounded-lg border p-4 ${
            vehicleType === 'plated'
              ? 'border-secondary bg-primary/10'
              : 'hover:border-secondary hover:bg-primary/10'
          }`}
        >
          <span className="font-medium">Plakalı Araç</span>
        </button>
        <button
          type="button"
          onClick={() => setVehicleType('unplated')}
          className={`flex flex-col items-center rounded-lg border p-4 ${
            vehicleType === 'unplated'
              ? 'border-secondary bg-primary/10'
              : 'hover:border-secondary hover:bg-primary/10'
          }`}
        >
          <span className="font-medium">Plakasız Araç</span>
        </button>
      </div>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, width: '100%' }}>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
          <Autocomplete
            options={plateCities.map(city => ({ ...city, label: city.label || city.text }))}
            getOptionLabel={(option) => option.label || option.text || ''}
            value={plateCities.map(city => ({ ...city, label: city.label || city.text })).find(city => city.value === formik.values.plateCity) || null}
            onChange={(_, newValue) => {
              if (newValue) {
                formik.setFieldValue('plateCity', newValue.value);
              } else {
                // Clear butonuna basıldığında plateCity'i temizle
                formik.setFieldValue('plateCity', '');
              }
              formik.setFieldTouched('plateCity', true);
              setTimeout(() => formik.validateField('plateCity'), 0);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Plaka İl Kodu"
                error={formik.touched.plateCity && Boolean(formik.errors.plateCity)}
                helperText={formik.touched.plateCity && formik.errors.plateCity}
              />
            )}
          />
        </Box>

        {vehicleType === 'plated' && (
          <>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
              <TextField
                fullWidth
                name="plateCode"
                label="Plaka"
                value={formik.values.plateCode}
                onChange={(e) => handleChange('plateCode', e.target.value)}
                onBlur={() => handleBlur('plateCode')}
                error={formik.touched.plateCode && Boolean(formik.errors.plateCode)}
                helperText={formik.touched.plateCode && formik.errors.plateCode}
                placeholder="Örn: A1234, AB123, AB1234, ABC12, ABC123"
                inputProps={{ maxLength: 6 }}
              />
            </Box>

            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
              <TextField
                fullWidth
                name="documentSerialCode"
                label="Belge Seri Kodu"
                value={formik.values.documentSerialCode}
                onChange={(e) => handleChange('documentSerialCode', e.target.value)}
                onBlur={() => handleBlur('documentSerialCode')}
                error={formik.touched.documentSerialCode && Boolean(formik.errors.documentSerialCode)}
                helperText={formik.touched.documentSerialCode && formik.errors.documentSerialCode}
                placeholder="Örn: FP"
                inputProps={{ maxLength: 2 }}
              />
            </Box>

            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
              <TextField
                fullWidth
                name="documentSerialNumber"
                label="Belge Seri Numarası"
                value={formik.values.documentSerialNumber}
                onChange={(e) => handleChange('documentSerialNumber', e.target.value)}
                onBlur={() => handleBlur('documentSerialNumber')}
                error={formik.touched.documentSerialNumber && Boolean(formik.errors.documentSerialNumber)}
                helperText={formik.touched.documentSerialNumber && formik.errors.documentSerialNumber}
                placeholder="Örn: 373220"
                inputProps={{ maxLength: 6 }}
              />
            </Box>
          </>
        )}
      </Box>
    </>
  );

  const renderStep2 = () => (
    <Box >
      <Typography variant="h6" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        Yeni Araç Bilgileri
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, width: '100%' }}>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
          <Autocomplete
            options={vehicleBrands
              .filter(brand => brand.text !== 'İŞ MAKİNASI' && brand.text !== 'DİĞER')
              .sort((a, b) => a.text.localeCompare(b.text, 'tr-TR'))
              .map(brand => ({ ...brand, label: brand.label || brand.text }))}
            getOptionLabel={(option) => option.label || option.text || ''}
            value={vehicleBrands
              .filter(brand => brand.text !== 'İŞ MAKİNASI' && brand.text !== 'DİĞER')
              .sort((a, b) => a.text.localeCompare(b.text, 'tr-TR'))
              .map(brand => ({ ...brand, label: brand.label || brand.text }))
              .find(brand => brand.value === formik.values.brandCode) || null}
            onChange={(_, newValue) => {
              if (newValue) {
                handleChange('brandCode', newValue.value);
              } else {
                // Clear butonuna basıldığında brandCode'u temizle
                setModelError(null); // Model error'unu temizle
                formik.setFieldValue('brandCode', '');
                formik.setFieldValue('brand', '');
                // Marka temizlenince modelleri de temizle
                formik.setFieldValue('modelCode', '');
                formik.setFieldValue('model', '');
                setVehicleModels([]);
              }
              formik.setFieldTouched('brandCode', true);
              setTimeout(() => formik.validateField('brandCode'), 0);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Marka"
                error={formik.touched.brandCode && Boolean(formik.errors.brandCode)}
                helperText={formik.touched.brandCode && formik.errors.brandCode}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isModelsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
          <TextField
            fullWidth
            name="year"
            label="Model Yılı"
            type="text"
            value={formik.values.year}
            onChange={(e) => handleChange('year', e.target.value)}
            onBlur={() => handleBlur('year')}
            error={formik.touched.year && Boolean(formik.errors.year)}
            helperText={formik.touched.year && formik.errors.year}
            placeholder="Örn: 2023"
            inputProps={{ maxLength: 4 }}
            InputProps={{
              endAdornment: isModelsLoading ? (
                <InputAdornment position="end">
                  <CircularProgress color="inherit" size={20} />
                </InputAdornment>
              ) : null,
            }}
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
          <Autocomplete
            options={vehicleModels.map(model => ({ ...model, label: model.label || model.text }))}
            getOptionLabel={(option) => option.label || option.text || ''}
            value={vehicleModels.map(model => ({ ...model, label: model.label || model.text })).find(model => model.value === formik.values.modelCode) || null}
            onChange={(_, newValue) => {
              if (newValue) {
                handleChange('modelCode', newValue.value);
              } else {
                // Clear butonuna basıldığında modelCode'u temizle
                setModelError(null); // Model error'unu temizle
                formik.setFieldValue('modelCode', '');
                formik.setFieldValue('model', '');
              }
              formik.setFieldTouched('modelCode', true);
              setTimeout(() => formik.validateField('modelCode'), 0);
            }}
            loading={isModelsLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Model"
                error={Boolean(modelError) || (formik.touched.modelCode && Boolean(formik.errors.modelCode))}
                helperText={modelError || (formik.touched.modelCode && formik.errors.modelCode)}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isModelsLoading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
        </Box>

      

        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
          <TextField
            fullWidth
            name="registrationDate"
            label="Tescil Tarihi"
            type="date"
            value={formik.values.registrationDate}
            onChange={(e) => {
              formik.handleChange(e);
              formik.setFieldTouched('registrationDate', true);
              setTimeout(() => formik.validateField('registrationDate'), 0);
            }}
            onBlur={() => handleBlur('registrationDate')}
            error={formik.touched.registrationDate && Boolean(formik.errors.registrationDate)}
            helperText={formik.touched.registrationDate && formik.errors.registrationDate}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Box>

        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
          <TextField
            fullWidth
            name="engineNo"
            label="Motor No"
            value={formik.values.engineNo}
            onChange={(e) => handleChange('engineNo', e.target.value)}
            onBlur={() => handleBlur('engineNo')}
            error={formik.touched.engineNo && Boolean(formik.errors.engineNo)}
            helperText={formik.touched.engineNo && formik.errors.engineNo}
            inputProps={{ maxLength: 20 }}
          />
        </Box>

        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
          <TextField
            fullWidth
            name="chassisNo"
            label="Şasi No"
            value={formik.values.chassisNo}
            onChange={(e) => handleChange('chassisNo', e.target.value)}
            onBlur={() => handleBlur('chassisNo')}
            error={formik.touched.chassisNo && Boolean(formik.errors.chassisNo)}
            helperText={formik.touched.chassisNo && formik.errors.chassisNo}
            inputProps={{ maxLength: 17 }}
          />
        </Box>

        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
          <TextField
            fullWidth
            name="seatCount"
            label="Koltuk Adedi"
            type="number"
            value={formik.values.seatCount}
            onChange={(e) => {
              formik.handleChange(e);
              formik.setFieldTouched('seatCount', true);
              setTimeout(() => formik.validateField('seatCount'), 0);
            }}
            onBlur={() => handleBlur('seatCount')}
            error={formik.touched.seatCount && Boolean(formik.errors.seatCount)}
            helperText={formik.touched.seatCount && formik.errors.seatCount}
            inputProps={{ min: 1, max: 50 }}
          />
        </Box>

        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
          <Autocomplete
            options={utilizationStyleOptions.map((option) => ({ ...option, label: option.label }))}
            getOptionLabel={(option) => option.label || ''}
            value={
              utilizationStyleOptions
                .map((option) => ({ ...option, label: option.label }))
                .find((style) => style.value === formik.values.usageType) || null
            }
            onChange={(_, newValue) => {
              if (newValue) {
                formik.setFieldValue('usageType', newValue.value);
              } else {
                // Clear butonuna basıldığında usageType'ı temizle
                formik.setFieldValue('usageType', '');
              }
              formik.setFieldTouched('usageType', true);
              setTimeout(() => formik.validateField('usageType'), 0);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Kullanım Şekli"
                error={formik.touched.usageType && Boolean(formik.errors.usageType)}
                helperText={formik.touched.usageType && formik.errors.usageType}
              />
            )}
          />
        </Box>

        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)' } }}>
          <Autocomplete
            options={fuelTypeOptions.map((option) => ({ ...option, label: option.label }))}
            getOptionLabel={(option) => option.label || ''}
            value={
              fuelTypeOptions
                .map((option) => ({ ...option, label: option.label }))
                .find((fuel) => fuel.value === formik.values.fuelType) || null
            }
            onChange={(_, newValue) => {
              if (newValue) {
                formik.setFieldValue('fuelType', newValue.value);
              } else {
                // Clear butonuna basıldığında fuelType'ı temizle
                formik.setFieldValue('fuelType', '');
              }
              formik.setFieldTouched('fuelType', true);
              setTimeout(() => formik.validateField('fuelType'), 0);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Yakıt Tipi"
                error={formik.touched.fuelType && Boolean(formik.errors.fuelType)}
                helperText={formik.touched.fuelType && formik.errors.fuelType}
              />
            )}
          />
        </Box>
      </Box>
    </Box>
  );

  const handleTramerQuery = async () => {
    try {
      setIsLoading(true);
      const tokenToUse = await refreshAccessToken();

      // Plakasız araç için direkt ikinci adıma geç
      if (vehicleType === 'unplated') {
        setActiveStep(1);
        setIsLoading(false); // Stop loading before returning
        return;
      }

      // Plakalı araç için gerekli alanların kontrolü
      if (!formik.values.plateCity || !formik.values.plateCode) {
        setNotificationMessage('Plaka bilgileri eksik');
        setNotificationSeverity('error');
        setShowNotification(true);
        setIsLoading(false); // Stop loading
        return;
      }

      // customerId kontrolü
      let customerIdForTramer = getCustomerIdFromAuthStorage();

      if (!customerIdForTramer) {
        // Attempt to fetch from /me if not in auth-storage (should ideally be there if logged in)
        try {
          const meResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME, {
            headers: {
              Authorization: `Bearer ${tokenToUse}`,
            },
          });

          if (meResponse.ok) {
            const meData = await meResponse.json() as { id?: string };
            customerIdForTramer = meData.id || null;
            // Optionally, update auth-storage or Zustand store if it's missing but found here
          } else {
          }
        } catch (error) {
        }
      }

      // storedCustomerId'nin hala null veya undefined olup olmadığını tekrar kontrol et
      if (!customerIdForTramer) {
        setNotificationMessage('Müşteri ID alınamadı, tramer sorgusu yapılamıyor.');
        setNotificationSeverity('error');
        setShowNotification(true);
        setIsLoading(false);
        return;
      }

      // Tramer sorgusu için gerekli verileri hazırla
      const tramerData = {
        plate: {
          city: formik.values.plateCity,
          code: formik.values.plateCode,
        },
        ...(formik.values.documentSerialCode && formik.values.documentSerialNumber && {
          documentSerial: {
            code: formik.values.documentSerialCode,
            number: formik.values.documentSerialNumber,
          },
        }),
      };

      try {
        const tramerResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_VEHICLES_QUERY(customerIdForTramer), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenToUse}`,
          },
          body: JSON.stringify(tramerData),
        });

        if ((tramerResponse as any).ok) {
          const tramerResult = await (tramerResponse as any).json();
          if (tramerResult) {
            // Tramer yanıtında null değerler varsa default değerleri kaldır
            const hasNullValues = !tramerResult.registrationDate || 
                                  !tramerResult.seatNumber || 
                                  !tramerResult.utilizationStyle || 
                                  !tramerResult.fuelType;

            // Kullanım şekli string değerini enum'a çevir
            let usageTypeValue = '';
            if (tramerResult.utilizationStyle === 'PRIVATE_CAR') {
              usageTypeValue = VehicleUtilizationStyle.PrivateCar.toString();
            } else if (tramerResult.utilizationStyle === 'TAXI') {
              usageTypeValue = VehicleUtilizationStyle.Taxi.toString();
            } else if (tramerResult.utilizationStyle === 'COMMERCIAL') {
              usageTypeValue = VehicleUtilizationStyle.RouteBasedMinibus.toString();
            } else if (tramerResult.utilizationStyle === 'MOTORCYCLE') {
              usageTypeValue = VehicleUtilizationStyle.Motorcycle.toString();
            }

            // Yakıt tipi string değerini enum'a çevir
            let fuelTypeValue = '';
            if (tramerResult.fuelType === 'GASOLINE') {
              fuelTypeValue = VehicleFuelType.Gasoline.toString();
            } else if (tramerResult.fuelType === 'DIESEL') {
              fuelTypeValue = VehicleFuelType.Diesel.toString();
            } else if (tramerResult.fuelType === 'LPG') {
              fuelTypeValue = VehicleFuelType.Lpg.toString();
            } else if (tramerResult.fuelType === 'ELECTRIC') {
              fuelTypeValue = VehicleFuelType.Electric.toString();
            } else if (tramerResult.fuelType === 'LPG_GASOLINE') {
              fuelTypeValue = VehicleFuelType.LpgGasoline.toString();
            }

            // Tramer'den gelen eski poliçe bilgilerini state'e kaydet
            if (tramerResult.kaskoOldPolicy) {
              setKaskoOldPolicy(tramerResult.kaskoOldPolicy);
            }
            if (tramerResult.trafikOldPolicy) {
              setTrafikOldPolicy(tramerResult.trafikOldPolicy);
            }

            // Form değerlerini güncelle - null değerler varsa default değerleri kaldır
            formik.setValues({
              ...formik.values,
              brandCode: tramerResult.model?.brand?.value || '',
              modelCode: tramerResult.model?.type?.value || '',
              year: tramerResult.model?.year?.toString() || '',
              engineNo: tramerResult.engine || '',
              chassisNo: tramerResult.chassis || '',
              registrationDate: tramerResult.registrationDate || '',
              seatCount: tramerResult.seatNumber?.toString() || '',
              usageType: usageTypeValue,
              fuelType: fuelTypeValue,
            });

            // Marka ve yıl bilgisi varsa model listesini yükle
            if (tramerResult.model?.brand?.value && tramerResult.model?.year) {
              try {
                await fetchWithAuthModels(
                  tramerResult.model.brand.value,
                  tramerResult.model.year.toString()
                );
                
                // Model listesi yüklendikten sonra model değerini seç
                setTimeout(() => {
                  if (tramerResult.model?.type?.value) {
                    formik.setFieldValue('modelCode', tramerResult.model.type.value);
                  }
                }, 100);
              } catch (error) {
              }
            }

            setActiveStep(1);
          }
        } else {
          // Tramer sorgusu başarısız (500 hata kodu veya diğer hatalar)
          // Default değerleri kaldır
          formik.setValues({
            ...formik.values,
            registrationDate: '',
            seatCount: '',
            usageType: '',
            fuelType: '',
          });
          setActiveStep(1);
          throw new Error('Tramer sorgusu başarısız');
        }
      } catch (error) {
        setNotificationMessage('Tramer sorgusu yapılırken bir hata oluştu');
        setNotificationSeverity('error');
        setShowNotification(true);
        return;
      }
    } catch (error) {
      setNotificationMessage('Bir hata oluştu');
      setNotificationSeverity('error');
      setShowNotification(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExistingVehicleProposal = async () => {
    try {
      setIsLoading(true);
      
      const tokenToUse = accessToken ?? (await refreshAccessToken());

      if (!tokenToUse) {
        throw new Error('Oturum bilgisi bulunamadı');
      }

      const selectedVehicleFromState = vehicles.find((v) => v.id === selectedVehicleId);
      
      if (!selectedVehicleFromState) {
        throw new Error('Seçilen araç bulunamadı');
      }

      const customerIdForProposal = getCustomerIdFromAuthStorage();
      
      if (!customerIdForProposal || customerIdForProposal === 'undefined') {
        throw new Error('Müşteri ID bulunamadı (auth-storage). Lütfen tekrar giriş yapın.');
      }

      localStorage.setItem('selectedVehicleForKasko', JSON.stringify(selectedVehicleFromState));
      
      const proposalData = {
        $type: 'kasko',
        vehicleId: selectedVehicleFromState.id,
        productBranch: 'KASKO',
        insurerCustomerId: customerIdForProposal,
        insuredCustomerId: customerIdForProposal,
        coverageGroupIds: getCoverageGroupIds('kasko'),
        channel: 'WEBSITE',
      };


      const rawProposalResponse = await fetchWithAuth(API_ENDPOINTS.PROPOSALS_CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenToUse}`,
        },
        body: JSON.stringify(proposalData),
      });


      if (rawProposalResponse.ok) {
        const proposalResult = await rawProposalResponse.json();
        
        const newProposalId = proposalResult.proposalId || proposalResult.id;
        
        if (newProposalId) {
          localStorage.setItem('proposalIdForKasko', newProposalId);
          
          setNotificationMessage('Kasko teklifi başarıyla oluşturuldu!');
          setNotificationSeverity('success');
          setShowNotification(true);
          
          pushToDataLayer({
            event: "kasko_formsubmit",
            form_name: "kasko_step2"
          });
          
          // onNext çağrısı ile step geçişi
          setTimeout(() => {
            router.push(`/kasko/quote-comparison/${newProposalId}`);
          }, 1000);
          return; // İşlem başarılı, fonksiyondan çık
        } else {
          setNotificationMessage('Teklif oluşturuldu ancak teklif numarası alınamadı.');
          setNotificationSeverity('error');
          setShowNotification(true);
        }
      } else {
        const errorText = await rawProposalResponse.text();
        setNotificationMessage(`Teklif oluşturulamadı: ${errorText || rawProposalResponse.statusText}`);
        setNotificationSeverity('error');
        setShowNotification(true);
      }
    } catch (error) {
      setNotificationMessage(`Kasko teklifi oluşturulurken bir hata oluştu: ${(error as Error).message}`);
      setNotificationSeverity('error');
      setShowNotification(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewVehicleProposal = async () => {
    try {
      setIsLoading(true);
      
      const tokenToUse = accessToken ?? (await refreshAccessToken());

      if (!tokenToUse) {
        throw new Error('Oturum bilgisi bulunamadı');
      }

      const customerIdForNewVehicle = getCustomerIdFromAuthStorage();
      
      if (!customerIdForNewVehicle || customerIdForNewVehicle === 'undefined') {
        throw new Error('Müşteri ID bulunamadı (auth-storage). Lütfen tekrar giriş yapın.');
      }

      const vehicleData = {
        customerId: customerIdForNewVehicle,
        plate: {
          city: parseInt(formik.values.plateCity) || 0,
          code: vehicleType === 'plated' ? formik.values.plateCode : '',
        },
        modelYear: parseInt(formik.values.year),
        brandReference: formik.values.brandCode,
        modelTypeReference: formik.values.modelCode,
        utilizationStyle: parseInt(formik.values.usageType),
        fuel: {
          type: (() => {
            switch (formik.values.fuelType) {
              case 'GASOLINE':
                return VehicleFuelType.Gasoline;
              case 'DIESEL':
                return VehicleFuelType.Diesel;
              case 'LPG':
                return VehicleFuelType.Lpg;
              case 'ELECTRIC':
                return VehicleFuelType.Electric;
              case 'HYBRID':
                return VehicleFuelType.LpgGasoline;
              default:
                return VehicleFuelType.Diesel;
            }
          })(),
          customLpg: false,
          customLpgPrice: null,
        },
        engine: formik.values.engineNo,
        chassis: formik.values.chassisNo,
        ...(formik.values.documentSerialCode && formik.values.documentSerialNumber && {
          documentSerial: {
            code: formik.values.documentSerialCode,
            number: formik.values.documentSerialNumber,
          },
        }),
        registrationDate: formik.values.registrationDate,
        seatNumber: parseInt(formik.values.seatCount),
        accessories: [],
        kaskoOldPolicy: kaskoOldPolicy,
        trafikOldPolicy: trafikOldPolicy,
        lossPayeeClause: null,
      };


      // Önce araç kaydı
      const rawVehicleResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_VEHICLES_BY_ID(customerIdForNewVehicle), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenToUse}`,
        },
        body: JSON.stringify(vehicleData),
      });


      if (!rawVehicleResponse.ok) {
        const errorText = await rawVehicleResponse.text();
        throw new Error(`Araç kaydı oluşturulamadı: ${errorText || rawVehicleResponse.statusText}`);
      }
      
      const vehicleResult = await rawVehicleResponse.json();
      
      if (!vehicleResult || !vehicleResult.id) {
        throw new Error('Araç kaydı oluşturuldu ancak araç ID alınamadı (parsed response issue).');
      }
      
      const vehicleId = vehicleResult.id;

      // Araç kaydı başarılı olduktan sonra teklif oluşturma isteği
      const proposalData = {
        $type: 'kasko',
        vehicleId: vehicleId,
        
        productBranch: 'KASKO',
        insurerCustomerId: customerIdForNewVehicle,
        insuredCustomerId: customerIdForNewVehicle,
        coverageGroupIds: getCoverageGroupIds('kasko'),
        channel: 'WEBSITE',
      };


      const rawNewProposalResponse = await fetchWithAuth(API_ENDPOINTS.PROPOSALS_CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenToUse}`,
        },
        body: JSON.stringify(proposalData),
      });


      if (rawNewProposalResponse.ok) {
        const proposalResult = await rawNewProposalResponse.json();
        
        const newProposalId = proposalResult.proposalId || proposalResult.id;
        
        if (newProposalId) {
          localStorage.setItem('proposalIdForKasko', newProposalId);
          
          setNotificationMessage('Kasko teklifi başarıyla oluşturuldu!');
          setNotificationSeverity('success');
          setShowNotification(true);
          
          pushToDataLayer({
            event: "kasko_formsubmit",
            form_name: "kasko_step2"
          });
          
          // onNext çağrısı ile step geçişi
          setTimeout(() => {
            router.push(`/kasko/quote-comparison/${newProposalId}`);
          }, 1000);
          return; // İşlem başarılı, fonksiyondan çık
        } else {
          setNotificationMessage('Teklif oluşturuldu ancak teklif numarası alınamadı.');
          setNotificationSeverity('error');
          setShowNotification(true);
        }
      } else {
        const errorText = await rawNewProposalResponse.text();
        setNotificationMessage(`Teklif oluşturulamadı: ${errorText || rawNewProposalResponse.statusText}`);
        setNotificationSeverity('error');
        setShowNotification(true);
      }
    } catch (error) {
      setNotificationMessage(`İşlem sırasında bir hata oluştu: ${(error as Error).message}`);
      setNotificationSeverity('error');
      setShowNotification(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Devam et butonunun disabled durumunu güncelle
  const isNextButtonDisabled = isLoading || 
    (activeStep === 0 && 
      ((selectionType === 'existing' && !selectedVehicleId) ||
       (selectionType === 'new' && 
        (!formik.values.plateCity ||
         (vehicleType === 'plated' && 
            (!formik.values.plateCode ||
             !formik.values.documentSerialCode ||
             !formik.values.documentSerialNumber ||
             (formik.touched.plateCode && formik.errors.plateCode) ||
             (formik.touched.documentSerialCode && formik.errors.documentSerialCode) ||
             (formik.touched.documentSerialNumber && formik.errors.documentSerialNumber)
            )
         ))))) ||
    (activeStep === 1 && (
      !formik.values.brandCode ||
      !formik.values.modelCode ||
      !formik.values.year ||
      !formik.values.usageType ||
      !formik.values.fuelType ||
      !formik.values.engineNo ||
      !formik.values.chassisNo ||
      !formik.values.registrationDate ||
      !formik.values.seatCount ||
      (vehicleType === 'plated' && (!formik.values.documentSerialCode || !formik.values.documentSerialNumber)) ||
      // Form validation hatalarını kontrol et
      (formik.touched.brandCode && formik.errors.brandCode) ||
      (formik.touched.modelCode && formik.errors.modelCode) ||
      (formik.touched.year && formik.errors.year) ||
      (formik.touched.usageType && formik.errors.usageType) ||
      (formik.touched.fuelType && formik.errors.fuelType) ||
      (formik.touched.engineNo && formik.errors.engineNo) ||
      (formik.touched.chassisNo && formik.errors.chassisNo) ||
      (formik.touched.registrationDate && formik.errors.registrationDate) ||
      (formik.touched.seatCount && formik.errors.seatCount) ||
      (vehicleType === 'plated' && (
        (formik.touched.documentSerialCode && formik.errors.documentSerialCode) ||
        (formik.touched.documentSerialNumber && formik.errors.documentSerialNumber)
      ))
    ));



  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Araç Bilgileri
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {selectionType === 'existing'
          ? 'Kayıtlı araçlarınızdan birini seçin veya yeni araç ekleyin'
          : 'Kasko Sigortası teklifiniz için araç bilgilerinizi giriniz'}
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
          {activeStep === 0 ? (
            <>
              <RadioGroup
                row
                value={selectionType}
                onChange={(e) => setSelectionType(e.target.value as 'existing' | 'new')}
                sx={{ mb: 3 }}
              >
                <FormControlLabel
                  value="existing"
                  control={<Radio />}
                  label="Kayıtlı Araçlarım"
                  disabled={vehicles.length === 0}
                />
                <FormControlLabel value="new" control={<Radio />} label="Yeni Araç Ekle" />
              </RadioGroup>

              {selectionType === 'existing' ? (
                <Box sx={{width: '100%'}}>
                  <Typography variant="subtitle1" gutterBottom sx={{mb: 2}}>
                    Kayıtlı Araçlarınız
                  </Typography>
                  {vehicles.length === 0 ? (
                    <Typography>Kayıtlı araç bulunamadı. Lütfen yeni araç ekleyin.</Typography>
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%' }}>
                      {vehicles.map((vehicle) => (
                        <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }} key={vehicle.id}>
                          <Card
                            variant="outlined"
                            sx={{
                              cursor: 'pointer',
                              height: '100%',
                              border:
                                selectedVehicleId === vehicle.id
                                  ? '2px solid #FFA500'
                                  : '1px solid rgba(0, 0, 0, 0.12)',
                            }}
                            onClick={() => handleVehicleSelect(vehicle.id)}
                          >
                            <CardContent>
                              <Typography variant="subtitle1">
                                {vehicle.brand} {vehicle.model} 
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {vehicle.plateNumber || 'Plaka bilgisi yok'}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              ) : (
                renderStep1()
              )}
            </>
          ) : (
            renderStep2()
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mt: 3 }}>
            <Box>
              {activeStep === 1 && (
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(0)}
                  sx={{
                    minWidth: 100,
                    height: 48,
                    borderRadius: 2,
                    textTransform: 'none',
                  }}
                >
                  Geri Dön
                </Button>
              )}
            </Box>
            <Box>
              <Button
                variant="contained"
                onClick={
                  activeStep === 0
                    ? selectionType === 'existing'
                      ? () => {
                          handleExistingVehicleProposal();
                        }
                      : () => {
                          handleTramerQuery();
                        }
                    : () => {
                        handleNewVehicleProposal();
                      }
                }
                disabled={Boolean(isNextButtonDisabled)}
                sx={{
                  minWidth: 200,
                  height: 48,
                  borderRadius: 2,
                  textTransform: 'none',
                }}
              >
                {String(
                  activeStep === 0 
                    ? selectionType === 'existing'
                      ? 'Teklif al'
                      : 'Devam et'
                    : 'Teklif al'
                )}
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}