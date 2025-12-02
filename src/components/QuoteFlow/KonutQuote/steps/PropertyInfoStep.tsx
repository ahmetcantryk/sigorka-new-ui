"use client";
import {
  Box,
  Button,
  Grid,
  Typography,
  FormHelperText,
  Divider,
  CircularProgress,
  TextField,
  MenuItem,
  Snackbar,
  Alert,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Autocomplete,
  Collapse,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useAuthStore } from '../../../../store/useAuthStore';
import CustomSelect from '../../../common/Input/CustomSelect';
import Input from '../../../common/Input/Input';
import { fetchWithAuth, CustomerProfile } from '../../../../services/fetchWithAuth'; // CustomerProfile import edildi
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/config/api';
import { useFormik } from 'formik';
import { formatNumberWithDots, removeNumberFormatting, handleFormattedNumberChange } from '../../../../utils/numberFormat';
import { useAgencyConfig } from '../../../../context/AgencyConfigProvider';

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

// AddPropertyModal'daki enum'ları kullanıyorum
enum PropertyUtilizationStyle {
  Unknown = 0,
  House = 1,
  Business = 2,
  Other = 3,
}

enum PropertyStructure {
  Unknown = 0,
  SteelReinforcedConcrete = 1,
  Other = 2,
}

enum PropertyDamageStatus {
  Unknown = 0,
  None = 1,
  SlightlyDamaged = 2,
  ModeratelyDamaged = 3,
  SeverelyDamaged = 4,
}

// Enflasyon Enum ve Seçenekleri
enum InflationType {
  Unknown = 0,
  Inflation50 = 7,      // % 50 ENFLASYONLU
  Inflation60 = 8,      // % 60 ENFLASYONLU
  Inflation70 = 9,      // % 70 ENFLASYONLU
  Inflation65 = 11,     // %65 ENFLASYONLU
  Inflation80 = 13,     // % 80 ENFLASYONLU
  Inflation75 = 14,     // % 75 ENFLASYONLU
}

const inflationOptions = [
  { value: InflationType.Inflation50, label: '% 50 ENFLASYONLU' },
  { value: InflationType.Inflation60, label: '% 60 ENFLASYONLU' },
  { value: InflationType.Inflation65, label: '% 65 ENFLASYONLU' },
  { value: InflationType.Inflation70, label: '% 70 ENFLASYONLU' },
  { value: InflationType.Inflation75, label: '% 75 ENFLASYONLU' },
  { value: InflationType.Inflation80, label: '% 80 ENFLASYONLU' },
];

// Konut için Kat Sayısı Aralığı Enum ve Seçenekleri (Konut'takine benzer)
enum KonutPropertyFloorCountRange {
  Unknown = 0,
  Between1And3 = 1,
  Between4And7 = 2,
  Between8And18 = 3,
  MoreThan19 = 4,
}

const KonutFloorCountRangeOptions = [
  { value: KonutPropertyFloorCountRange.Between1And3, label: '1-3' },
  { value: KonutPropertyFloorCountRange.Between4And7, label: '4-7' },
  { value: KonutPropertyFloorCountRange.Between8And18, label: '8-18' },
  { value: KonutPropertyFloorCountRange.MoreThan19, label: '> 18' },
];

// Konut için Mülkiyet Tipi Enum ve Seçenekleri (Konut'takine benzer)
enum KonutPropertyOwnershipType {
  Unknown = 0,
  Proprietor = 1, // Malik
  Tenant = 2,     // Kiracı
  Other = 3,      // Diğer (API destekliyorsa)
}

const KonutOwnershipTypeOptions = [
  { value: KonutPropertyOwnershipType.Proprietor, label: 'Mal Sahibi' },
  { value: KonutPropertyOwnershipType.Tenant, label: 'Kiracı' },
  // { value: KonutPropertyOwnershipType.Other, label: 'Diğer' }, // API destekliyorsa eklenebilir
];

const utilizationStyleOptions = [
  { value: PropertyUtilizationStyle.House, label: 'Konut' },
  { value: PropertyUtilizationStyle.Business, label: 'İşyeri' },
];

const structureTypeOptions = [
  { value: PropertyStructure.SteelReinforcedConcrete, label: 'Çelik Betonarme' },
  { value: PropertyStructure.Other, label: 'Diğer' },
];

const damageStatusOptions = [ // API string ("NONE") beklediği için value string olabilir veya map'lenir
  { value: PropertyDamageStatus.None, label: 'Hasarsız' },
  { value: PropertyDamageStatus.SlightlyDamaged, label: 'Az Hasarlı' },
  { value: PropertyDamageStatus.ModeratelyDamaged, label: 'Orta Hasarlı' },
  { value: PropertyDamageStatus.SeverelyDamaged, label: 'Ağır Hasarlı' },
];

// floorNumberOptions Konut'ta direkt sayısal giriş olabilir.
// ownershipTypeOptions Konut'ta bu kadar detaylı olmayabilir.

interface PropertyInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  onSelectionTypeChange?: (type: string) => void; // Yeni prop eklendi
}

interface LocationOption {
  value: string;
  text: string;
}

interface AddressObjectForProperty { // Property.address içindeki nesne için tip
  city: LocationOption;
  district: LocationOption;
  town?: LocationOption;
  neighborhood?: LocationOption;
  street?: LocationOption;
  building?: LocationOption;
  apartment?: LocationOption;
}

interface Property { // API yanıtına ve Konut modeline göre güncellendi
  id: string;
  number?: number;
  address: AddressObjectForProperty | string; // API'den gelen address yapısı veya düz string
  // city ve district alanları address objesi içinde olduğu için buradan kaldırılabilir.
  // Eğer listelemede ayrıca göstermek gerekirse, address'ten türetilir.
  // city: string;
  // district: string;
  buildingType: string; // Konut API'si string bekleyebilir (örn: "APARTMENT_BUILDING") ya da enum sayılarını. Şimdilik genel string.
  constructionYear: number;
  floorCount: number; // Bina toplam kat sayısı
  floorNumber: number; // Dairenin bulunduğu kat
  squareMeters: number;
  usageType: string; // Örn: "HOUSE", "BUSINESS" (PropertyUtilizationStyle enum string karşılığı)
  buildingMaterial: string; // Örn: "STEEL_REINFORCED_CONCRETE" (PropertyStructure enum string karşılığı)
  riskZone: string; // Örn: "NONE" (PropertyDamageStatus enum string karşılığı)
  customerId?: string;
  // Konut özelinde lossPayeeClause olmayabilir.
  // floor nesnesi API'deki gibi detaylı olabilir veya Konut için basitleştirilebilir.
  floor?: {
    totalFloors?: number | null | { $type?: string, min?: number, max?: number }; // Kaçış karakterleri kaldırıldı
    currentFloor?: number | null;
  };
  // structure, utilizationStyle, ownershipType alanları ana seviyede de olabilir.
  // Konut'ta buildingMaterial, usageType, riskZone olarak adlandırılmış.
  ownershipType?: string; // API yanıtına göre "TENANT", "PROPRIETOR"
}

// Konut Form Veri Yapısı (Konut'takine benzer ama Konut'a özel)
interface KonutPropertyFormData {
  selectionType: 'existing' | 'new';
  selectedPropertyId: string | null;

  // Adres Bilgileri (Formik için)
  cityReference: string; // LocationOption.value
  districtReference: string; // LocationOption.value
  townReference?: string;
  neighborhoodReference?: string;
  streetReference?: string;
  buildingReference?: string;
  apartmentReference?: string;
  // Konut'ta town, neighborhood, street, building, apartment formda olmayabilir, UAVT sorgusuyla veya tek bir address satırıyla alınabilir.
  // addressLine: string; // Ayrı bir adres satırı, eğer UAVT yoksa veya detaylı adres formu yoksa. // KALDIRILDI

  // Zorunlu Konut Bilgileri
  uavtNo: string; // UAVT Adres Kodu
  buildingType: PropertyStructure; // Enum değeri (Formik için)
  constructionYear: string | null; // DEĞİŞTİRİLDİ: string -> string | null
  // floorCount: string; // Bina toplam kat sayısı - DEĞİŞTİRİLDİ -> floorCountRange
  floorCountRange: KonutPropertyFloorCountRange; // YENİ EKLENDİ - floor.totalFloors için
  floorNumber: string; // Dairenin bulunduğu kat - floor.currentFloor için
  squareMeters: string;
  usageType: PropertyUtilizationStyle; // Enum değeri
  buildingMaterial: PropertyStructure; // Enum değeri
  riskZone: PropertyDamageStatus; // Enum değeri (Hasar Durumu)
  ownershipType: KonutPropertyOwnershipType; // YENİ EKLENDİ

  // Teminat Bilgileri
  propertyPrice: string; // Konut Bedeli
  furniturePrice: string; // Eşya Bedeli
  electronicDevicePrice: string; // Elektronik Cihaz Bedeli
  insulationPrice: string; // İzolasyon Bedeli
  windowPrice: string; // Cam Bedeli
  inflationValue: InflationType; // Enflasyon tipi
}


const initialKonutFormData: KonutPropertyFormData = {
  selectionType: 'new',
  selectedPropertyId: null,
  cityReference: '',
  districtReference: '',
  townReference: '',
  neighborhoodReference: '',
  streetReference: '',
  buildingReference: '',
  apartmentReference: '',
  uavtNo: '',
  buildingType: PropertyStructure.Unknown,
  constructionYear: null,
  floorCountRange: KonutPropertyFloorCountRange.Unknown,
  floorNumber: '',
  squareMeters: '',
  usageType: PropertyUtilizationStyle.Unknown,
  buildingMaterial: PropertyStructure.Unknown,
  riskZone: PropertyDamageStatus.Unknown,
  ownershipType: KonutPropertyOwnershipType.Unknown,
  propertyPrice: '',
  furniturePrice: '250000',
  electronicDevicePrice: '10000',
  insulationPrice: '10000',
  windowPrice: '50000',
  inflationValue: InflationType.Inflation60,
};

// Backend stringlerini Form enum/sayı değerlerine map'leyen fonksiyonlar (Konut için)
const mapKonutUsageTypeToForm = (backendUsageType?: string): PropertyUtilizationStyle => {
  if (backendUsageType === "HOUSE") return PropertyUtilizationStyle.House;
  if (backendUsageType === "BUSINESS") return PropertyUtilizationStyle.Business;
  return PropertyUtilizationStyle.Unknown; // veya bir varsayılan
};

const mapKonutBuildingMaterialToForm = (backendMaterial?: string): PropertyStructure => {
  if (backendMaterial === "STEEL_REINFORCED_CONCRETE") return PropertyStructure.SteelReinforcedConcrete;
  if (backendMaterial === "MASONRY") return PropertyStructure.Other;
  if (backendMaterial === "STEEL") return PropertyStructure.Other;
  if (backendMaterial === "WOOD") return PropertyStructure.Other;
  if (backendMaterial === "OTHER") return PropertyStructure.Other;
  return PropertyStructure.Unknown;
};

const mapKonutRiskZoneToForm = (backendRiskZone?: string): PropertyDamageStatus => {
  if (backendRiskZone === "NONE") return PropertyDamageStatus.None;
  if (backendRiskZone === "SLIGHTLY_DAMAGED") return PropertyDamageStatus.SlightlyDamaged;
  if (backendRiskZone === "MODERATELY_DAMAGED") return PropertyDamageStatus.ModeratelyDamaged;
  if (backendRiskZone === "SEVERELY_DAMAGED") return PropertyDamageStatus.SeverelyDamaged;
  return PropertyDamageStatus.None; // Konut için None daha uygun bir varsayılan olabilir
};

// Konut Kat Sayısı Aralığı'nı API Payload'ına dönüştüren fonksiyon
const mapKonutFloorCountRangeToPayload = (range: KonutPropertyFloorCountRange): { $type: "range"; min: number; max: number } | number | null => {
  switch (range) {
    case KonutPropertyFloorCountRange.Between1And3:
      return { $type: "range", min: 1, max: 3 };
    case KonutPropertyFloorCountRange.Between4And7:
      return { $type: "range", min: 4, max: 7 };
    case KonutPropertyFloorCountRange.Between8And18:
      return { $type: "range", min: 8, max: 18 };
    case KonutPropertyFloorCountRange.MoreThan19:
      return { $type: "range", min: 19, max: 99 }; // Max 99 varsayılan olarak ayarlandı
    default:
      return null; // veya API'nin bilinmeyen/varsayılan durum için beklediği değer
  }
};

// Konut Mülkiyet Tipini API string'ine dönüştüren fonksiyon
const mapKonutPropertyOwnershipTypeToBackendString = (value: KonutPropertyOwnershipType): string => {
  const mapping: Record<KonutPropertyOwnershipType, string> = {
    [KonutPropertyOwnershipType.Unknown]: "UNKNOWN", // API'nin beklediği varsayılan
    [KonutPropertyOwnershipType.Proprietor]: "PROPRIETOR",
    [KonutPropertyOwnershipType.Tenant]: "TENANT",
    [KonutPropertyOwnershipType.Other]: "OTHER",
  };
  return mapping[value] || "UNKNOWN";
};

// Form enum/sayı değerlerini Backend stringlerine map'leyen fonksiyonlar (Konut için)
const mapPropertyStructureToBackendString = (value: PropertyStructure): string => {
  const mapping: Record<PropertyStructure, string> = {
    [PropertyStructure.Unknown]: "UNKNOWN",
    [PropertyStructure.SteelReinforcedConcrete]: "STEEL_REINFORCED_CONCRETE",
    [PropertyStructure.Other]: "OTHER",
  };
  return mapping[value] || "UNKNOWN";
};

const mapPropertyUtilizationStyleToBackendString = (value: PropertyUtilizationStyle): string => {
  const mapping: Record<PropertyUtilizationStyle, string> = {
    [PropertyUtilizationStyle.Unknown]: "OTHER", // veya API'nin beklediği varsayılan
    [PropertyUtilizationStyle.House]: "HOUSE",
    [PropertyUtilizationStyle.Business]: "BUSINESS",
    [PropertyUtilizationStyle.Other]: "OTHER",
  };
  return mapping[value] || "OTHER";
};

const mapPropertyDamageStatusToBackendString = (value: PropertyDamageStatus): string => {
  const mapping: Record<PropertyDamageStatus, string> = {
    [PropertyDamageStatus.Unknown]: "NONE", // Konut için varsayılan
    [PropertyDamageStatus.None]: "NONE",
    [PropertyDamageStatus.SlightlyDamaged]: "SLIGHTLY_DAMAGED",
    [PropertyDamageStatus.ModeratelyDamaged]: "MODERATELY_DAMAGED",
    [PropertyDamageStatus.SeverelyDamaged]: "SEVERELY_DAMAGED",
  };
  return mapping[value] || "NONE";
};

// Enflasyon enum değerinden yüzde değerini çıkaran fonksiyon
const getInflationPercentage = (inflationType: InflationType): number => {
    const enumKey = InflationType[inflationType]; // örn: "Inflation60"
    if (enumKey === 'NoInflation' || enumKey === 'Unknown') {
        return 0;
    }
    const match = enumKey.match(/Inflation(\d+)/);
    if (match && match[1]) {
        return parseInt(match[1], 10);
    }
    return 0; // Eşleşme bulunamazsa varsayılan
};

// Enflasyon tipini API payload'ına dönüştüren fonksiyon
const mapInflationTypeToPayload = (value: InflationType): { value: string, text: string } => {
  const mapping: Record<InflationType, { value: string, text: string }> = {
    [InflationType.Inflation50]: { value: "7", text: "% 50 ENFLASYONLU" },
    [InflationType.Inflation60]: { value: "8", text: "% 60 ENFLASYONLU" },
    [InflationType.Inflation70]: { value: "9", text: "% 70 ENFLASYONLU" },
    [InflationType.Inflation65]: { value: "11", text: "% 65 ENFLASYONLU" },
    [InflationType.Inflation80]: { value: "13", text: "% 80 ENFLASYONLU" },
    [InflationType.Inflation75]: { value: "14", text: "% 75 ENFLASYONLU" },
  };
  return mapping[value] || { value: "1", text: "ENFLASYONSUZ" };
};

const formatAddress = (address: Property['address']): string => {
  if (typeof address === 'string') {
    return address;
  }
  if (address && typeof address === 'object' && 'city' in address && address.city && 'district' in address && address.district) {
    const parts = [
      address.street?.text,
      address.building?.text,
      address.apartment?.text,
      address.neighborhood?.text,
      address.town?.text,
      address.district.text,
      address.city.text
    ];
    const result = parts.filter(part => typeof part === 'string' && part).join(' ').trim();
    return result || 'Adres bilgisi yok';
  }
  return 'Adres bilgisi yok';
};

// Adres verilerini sıralama fonksiyonu
const sortLocationOptions = (options: LocationOption[]): LocationOption[] => {
  // Alfabetik ve sayısal verileri ayır
  const alphabetic = options.filter(opt => isNaN(Number(opt.text.charAt(0))));
  const numeric = options.filter(opt => !isNaN(Number(opt.text.charAt(0))));

  // Alfabetik verileri sırala (Türkçe karakter desteği ile)
  const sortedAlphabetic = alphabetic.sort((a, b) =>
      a.text.localeCompare(b.text, 'tr-TR')
  );

  // Sayısal verileri sırala
  const sortedNumeric = numeric.sort((a, b) =>
      a.text.localeCompare(b.text, 'tr-TR')
  );

  // Önce alfabetik sonra sayısal verileri birleştir
  return [...sortedAlphabetic, ...sortedNumeric];
};

export default function PropertyInfoStep({
                                           onNext,
                                           onBack,
                                           isFirstStep,
                                           isLastStep,
                                           onSelectionTypeChange,
                                         }: PropertyInfoStepProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [selectionType, setSelectionType] = useState<'existing' | 'new'>('new');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSeverity, setNotificationSeverity] = useState<'success' | 'error'>('success');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUAVTLoading, setIsUAVTLoading] = useState(false);
  const [uavtError, setUavtError] = useState<string | null>(null);
  
  // Adres state'leri
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [selectedCity, setSelectedCity] = useState<LocationOption | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<LocationOption | null>(null);
  
  // Yeni adres seviyeleri için state'ler
  const [towns, setTowns] = useState<LocationOption[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<LocationOption[]>([]);
  const [streets, setStreets] = useState<LocationOption[]>([]);
  const [buildings, setBuildings] = useState<LocationOption[]>([]);
  const [apartments, setApartments] = useState<LocationOption[]>([]);

  const [selectedTown, setSelectedTown] = useState<LocationOption | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<LocationOption | null>(null);
  const [selectedStreet, setSelectedStreet] = useState<LocationOption | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<LocationOption | null>(null);
  const [selectedApartment, setSelectedApartment] = useState<LocationOption | null>(null);
  
  const [propertyType, setPropertyType] = useState<'manual' | 'uavt'>('manual'); // UAVT sorgu durumunu takip et

  const { customerId, accessToken } = useAuthStore();
  const agencyConfig = useAgencyConfig();
  const router = useRouter();
  const theme = useTheme();

  const getCoverageGroupIds = (branch: string): string[] | null => {
    if (!agencyConfig?.coverageGroupIds) {
      return null;
    }
    
    const coverageIds = agencyConfig.coverageGroupIds[branch as keyof typeof agencyConfig.coverageGroupIds];
    return coverageIds && coverageIds.length > 0 ? coverageIds : null;
  };

  useEffect(() => {
    let isMounted = true;
    const checkMissingInfo = async () => {
      if (accessToken && isMounted) {
        // Check if PersonalInfoStep was just completed to prevent infinite loop
        const personalInfoCompleted = localStorage.getItem('konutPersonalInfoCompleted');
        if (personalInfoCompleted === 'true') {
          // Clear the flag and skip the check
          localStorage.removeItem('konutPersonalInfoCompleted');
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

  const fetchDistricts = async (cityValue: string) => {
    if (!cityValue) {
      setDistricts([]);
      setSelectedDistrict(null);
      formik.setFieldValue('districtReference', '');
      // Alt seviyeleri de temizle
      setTowns([]);
      setSelectedTown(null);
      formik.setFieldValue('townReference', '');
      setNeighborhoods([]);
      setSelectedNeighborhood(null);
      formik.setFieldValue('neighborhoodReference', '');
      setStreets([]);
      setSelectedStreet(null);
      formik.setFieldValue('streetReference', '');
      setBuildings([]);
      setSelectedBuilding(null);
      formik.setFieldValue('buildingReference', '');
      setSelectedApartment(null);
      formik.setFieldValue('apartmentReference', '');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_DISTRICTS(cityValue), {
        method: 'GET',
      });
      if (response.ok) {
        try {
          const data = await response.json();
          if (Array.isArray(data)) {
            // Sıralama fonksiyonunu uygula
            const sortedData = sortLocationOptions(data as LocationOption[]);
            setDistricts(sortedData);
          } else {
            setError('İlçeler yüklenirken beklenmeyen veri formatı.');
          }
        } catch (jsonError) {
          const responseText = await response.text().catch(() => "Sunucudan okunamayan yanıt");
          setError(`İlçe bilgileri alınamadı: Sunucudan geçersiz yanıt formatı. Yanıt: ${responseText.substring(0,100)}`); // İlk 100 karakteri göster
        }
      } else {
        const errorText = await response.text();
        setError(`İlçeler yüklenirken bir hata oluştu (HTTP ${response.status}): ${errorText}`);
      }
    } catch (e) {
      setError('İlçeler yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTowns = async (districtValue: string) => {
    if (!districtValue) {
      setTowns([]);
      setSelectedTown(null);
      formik.setFieldValue('townReference', '');
      setNeighborhoods([]);
      setSelectedNeighborhood(null);
      formik.setFieldValue('neighborhoodReference', '');
      setStreets([]);
      setSelectedStreet(null);
      formik.setFieldValue('streetReference', '');
      setBuildings([]);
      setSelectedBuilding(null);
      formik.setFieldValue('buildingReference', '');
      setApartments([]);
      setSelectedApartment(null);
      formik.setFieldValue('apartmentReference', '');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_TOWNS(districtValue), { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        // Sıralama fonksiyonunu uygula
        const sortedData = sortLocationOptions(Array.isArray(data) ? data as LocationOption[] : []);
        setTowns(sortedData);
      } else {
        const errorText = await response.text();
        setError(`Beldeler yüklenirken bir hata oluştu: ${errorText}`);
        setTowns([]);
      }
    } catch (e) {
      setError('Beldeler yüklenirken bir hata oluştu.');
      setTowns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNeighborhoods = async (townValue: string) => {
    if (!townValue) {
      setNeighborhoods([]);
      setSelectedNeighborhood(null);
      formik.setFieldValue('neighborhoodReference', '');
      setStreets([]);
      setSelectedStreet(null);
      formik.setFieldValue('streetReference', '');
      setBuildings([]);
      setSelectedBuilding(null);
      formik.setFieldValue('buildingReference', '');
      setApartments([]);
      setSelectedApartment(null);
      formik.setFieldValue('apartmentReference', '');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_NEIGHBORHOODS(townValue), { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        // Sıralama fonksiyonunu uygula
        const sortedData = sortLocationOptions(Array.isArray(data) ? data as LocationOption[] : []);
        setNeighborhoods(sortedData);
      } else {
        const errorText = await response.text();
        setError(`Mahalleler yüklenirken bir hata oluştu: ${errorText}`);
        setNeighborhoods([]);
      }
    } catch (e) {
      setError('Mahalleler yüklenirken bir hata oluştu.');
      setNeighborhoods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStreets = async (neighborhoodValue: string) => {
    if (!neighborhoodValue) {
      setStreets([]);
      setSelectedStreet(null);
      formik.setFieldValue('streetReference', '');
      setBuildings([]);
      setSelectedBuilding(null);
      formik.setFieldValue('buildingReference', '');
      setApartments([]);
      setSelectedApartment(null);
      formik.setFieldValue('apartmentReference', '');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_STREETS(neighborhoodValue), { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        // Sıralama fonksiyonunu uygula
        const sortedData = sortLocationOptions(Array.isArray(data) ? data as LocationOption[] : []);
        setStreets(sortedData);
      } else {
        const errorText = await response.text();
        setError(`Sokaklar yüklenirken bir hata oluştu: ${errorText}`);
        setStreets([]);
      }
    } catch (e) {
      setError('Sokaklar yüklenirken bir hata oluştu.');
      setStreets([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBuildings = async (streetValue: string) => {
    if (!streetValue) {
      setBuildings([]);
      setSelectedBuilding(null);
      formik.setFieldValue('buildingReference', '');
      setApartments([]);
      setSelectedApartment(null);
      formik.setFieldValue('apartmentReference', '');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_BUILDINGS(streetValue), { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        // Sıralama fonksiyonunu uygula
        const sortedData = sortLocationOptions(Array.isArray(data) ? data as LocationOption[] : []);
        setBuildings(sortedData);
      } else {
        const errorText = await response.text();
        setError(`Binalar yüklenirken bir hata oluştu: ${errorText}`);
        setBuildings([]);
      }
    } catch (e) {
      setError('Binalar yüklenirken bir hata oluştu.');
      setBuildings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApartments = async (buildingValue: string) => {
    if (!buildingValue) {
      setApartments([]);
      setSelectedApartment(null);
      formik.setFieldValue('apartmentReference', '');
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_APARTMENTS(buildingValue), { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        // Sıralama fonksiyonunu uygula
        const sortedData = sortLocationOptions(Array.isArray(data) ? data as LocationOption[] : []);
        setApartments(sortedData);
      } else {
        const errorText = await response.text();
        setError(`Daireler yüklenirken bir hata oluştu: ${errorText}`);
        setApartments([]);
      }
    } catch (e) {
      setError('Daireler yüklenirken bir hata oluştu.');
      setApartments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formik = useFormik<KonutPropertyFormData>({
    initialValues: initialKonutFormData,
    validationSchema: yup.object({
      cityReference: yup.string().when('selectionType', {
        is: 'new' as const,
        then: (schema) => schema.required('İl seçimi zorunludur'),
        otherwise: (schema) => schema.notRequired(),
      }),
      districtReference: yup.string().when('selectionType', {
        is: 'new' as const,
        then: (schema) => schema.required('İlçe seçimi zorunludur'),
        otherwise: (schema) => schema.notRequired(),
      }),
      townReference: yup.string().optional(),
      neighborhoodReference: yup.string().optional(),
      streetReference: yup.string().optional(),
      buildingReference: yup.string().optional(),
      apartmentReference: yup.string().when('selectionType', {
        is: 'new' as const,
        then: (schema) => schema.required('Daire seçimi zorunludur. Bu, Konut poliçesi için UAVT adres kodunu belirler.'),
        otherwise: (schema) => schema.optional(),
      }),
      uavtNo: yup.string().when('selectionType', {
        is: 'new' as const,
        then: (schema) => schema
            .matches(/^[0-9]*$/, "UAVT Adres Kodu sadece rakamlardan oluşmalıdır.")
            .optional(),
        otherwise: (schema) => schema.notRequired(),
      }),
      buildingType: yup.mixed<PropertyStructure>().when('selectionType', {
        is: 'new' as const,
        then: (schema) => schema.oneOf(Object.values(PropertyStructure).filter(v => typeof v === 'number') as PropertyStructure[]).required('Bina tipi zorunludur').notOneOf([PropertyStructure.Unknown], 'Bina tipi seçilmelidir'),
        otherwise: (schema) => schema.optional().nullable() as yup.MixedSchema<PropertyStructure | undefined | null>,
      }),
      constructionYear: yup.number().when('selectionType', {
        is: 'new' as const,
        then: (schema) => schema
            .nullable()
            .typeError('Geçerli bir yıl giriniz (örn: 1990, 2023)')
            .required('Yapım yılı zorunludur')
            .integer('Geçerli bir yıl giriniz (örn: 1990, 2023)')
            .min(1900, 'Geçerli bir yıl giriniz (örn: 1990, 2023)')
            .max(new Date().getFullYear(), `Geçerli bir yıl giriniz (örn: 1900-${new Date().getFullYear()})`),
        otherwise: (schema) => schema.optional().nullable() as yup.NumberSchema<number | undefined | null>,
      }),
      floorCountRange: yup.mixed<KonutPropertyFloorCountRange>().when('selectionType', {
        is: 'new' as const,
        then: (schema) => schema.oneOf(Object.values(KonutPropertyFloorCountRange).filter(v => typeof v === 'number') as KonutPropertyFloorCountRange[]).required('Binanın kat sayısı aralığı zorunludur').notOneOf([KonutPropertyFloorCountRange.Unknown], 'Binanın kat sayısı aralığı seçilmelidir'),
        otherwise: (schema) => schema.optional().nullable() as yup.MixedSchema<KonutPropertyFloorCountRange | undefined | null>,
      }),
      floorNumber: yup.string().when(['selectionType', 'floorCountRange'], {
        is: (selectionType: string, floorCountRange: KonutPropertyFloorCountRange) => 
          selectionType === 'new',
        then: (schema) => schema
          .required('Bulunduğu kat zorunludur')
          .matches(/^-?[0-9]+$/, "Geçerli bir kat numarası giriniz")
          .test('floor-range-validation', 'Daire katı, bina kat sayısı aralığına uygun olmalıdır', 
            function(value: string | undefined) {
              const { floorCountRange } = this.parent as KonutPropertyFormData;
              if (!value || !floorCountRange) return true;
              
              const floorNum = parseInt(value);
              
              switch (floorCountRange) {
                case KonutPropertyFloorCountRange.Between1And3:
                  return floorNum >= -2 && floorNum <= 3; // Bodrum katları için -2'ye kadar
                case KonutPropertyFloorCountRange.Between4And7:
                  return floorNum >= -2 && floorNum <= 7;
                case KonutPropertyFloorCountRange.Between8And18:
                  return floorNum >= -3 && floorNum <= 18;
                case KonutPropertyFloorCountRange.MoreThan19:
                  return floorNum >= -3 && floorNum <= 99; // Maksimum 99 kat
                default:
                  return true;
              }
            }
          ),
        otherwise: (schema) => schema.optional().nullable() as yup.StringSchema<string | undefined | null>,
      }),
      squareMeters: yup.string().when('selectionType', {
        is: 'new' as const,
        then: (schema) => schema
            .required('Metrekare zorunludur')
            .matches(/^[1-9][0-9]*$/, "Geçerli bir metrekare giriniz")
            .test('range', 'Konut metrekaresi 40 ile 999 arasında olmak zorundadır',
                value => !value || (parseInt(value) >= 40 && parseInt(value) <= 999)),
        otherwise: (schema) => schema.optional().nullable() as yup.StringSchema<string | undefined | null>,
      }),
      usageType: yup.mixed<PropertyUtilizationStyle>().when('selectionType', {
        is: 'new' as const,
        then: (schema) => schema.oneOf(Object.values(PropertyUtilizationStyle).filter(v => typeof v === 'number') as PropertyUtilizationStyle[]).required('Kullanım amacı zorunludur').notOneOf([PropertyUtilizationStyle.Unknown], 'Kullanım amacı seçilmelidir'),
        otherwise: (schema) => schema.optional().nullable() as yup.MixedSchema<PropertyUtilizationStyle | undefined | null>,
      }),
      // buildingMaterial validation kuralını kaldırdık
      riskZone: yup.mixed<PropertyDamageStatus>().when('selectionType', {
        is: 'new' as const,
        then: (schema) => schema.oneOf(Object.values(PropertyDamageStatus).filter(v => typeof v === 'number') as PropertyDamageStatus[]).required('Hasar durumu zorunludur'),
        otherwise: (schema) => schema.optional().nullable() as yup.MixedSchema<PropertyDamageStatus | undefined | null>,
      }),
      ownershipType: yup.mixed<KonutPropertyOwnershipType>().when('selectionType', {
        is: 'new' as const,
        then: (schema) => schema.oneOf(Object.values(KonutPropertyOwnershipType).filter(v => typeof v === 'number') as KonutPropertyOwnershipType[]).required('Mülkiyet tipi zorunludur').notOneOf([KonutPropertyOwnershipType.Unknown], 'Mülkiyet tipi seçilmelidir'),
        otherwise: (schema) => schema.optional().nullable() as yup.MixedSchema<KonutPropertyOwnershipType | undefined | null>,
      }),
      furniturePrice: yup.string()
          .required('Eşya bedeli zorunludur')
          .matches(/^[0-9]+$/, "Geçerli bir bedel giriniz")
          .test('range', 'Eşya bedeli 0 ile 1,000,000 arasında olmalıdır',
              value => !value || (parseInt(value) >= 0 && parseInt(value) <= 1000000)),
      electronicDevicePrice: yup.string()
          .required('Elektronik cihaz bedeli zorunludur')
          .matches(/^[0-9]+$/, "Geçerli bir bedel giriniz")
          .test('range', 'Elektronik cihaz bedeli 0 ile 500,000 arasında olmalıdır',
              value => !value || (parseInt(value) >= 0 && parseInt(value) <= 500000)),
      insulationPrice: yup.string()
          .required('İzolasyon bedeli zorunludur')
          .matches(/^[0-9]+$/, "Geçerli bir bedel giriniz")
          .test('range', 'İzolasyon bedeli 0 ile 100,000 arasında olmalıdır',
              value => !value || (parseInt(value) >= 0 && parseInt(value) <= 100000)),
      windowPrice: yup.string()
          .required('Cam bedeli zorunludur')
          .matches(/^[0-9]+$/, "Geçerli bir bedel giriniz")
          .test('range', 'Cam bedeli 0 ile 100,000 arasında olmalıdır',
              value => !value || (parseInt(value) >= 0 && parseInt(value) <= 100000)),
      inflationValue: yup.mixed<InflationType>()
          .oneOf(Object.values(InflationType).filter(v => typeof v === 'number') as InflationType[])
          .required('Enflasyon tipi zorunludur')
          .notOneOf([InflationType.Unknown], 'Enflasyon tipi seçilmelidir'),
      selectedPropertyId: yup.string().when('selectionType', {
        is: 'existing' as const,
        then: (schema) => schema.required('Lütfen kayıtlı bir konut seçin.'),
        otherwise: (schema) => schema.nullable(),
      })
    }),
    onSubmit: async (values: KonutPropertyFormData) => {
      setIsLoading(true);
      setNotificationMessage('');

      // Konut step 2 event tetikleme
      pushToDataLayer({
        event: "konut_formsubmit",
        form_name: "konut_step2",
      });

      try {
        if (!customerId) {
          setNotificationMessage("Müşteri kimliği bulunamadı. Lütfen tekrar giriş yapın.");
          setNotificationSeverity('error');
          setShowNotification(true);
          setIsLoading(false);
          return;
        }

        let propertyIdToSubmit: string | null = null;

        if (values.selectionType === 'existing') {
          if (!values.selectedPropertyId) {
            setNotificationMessage('Lütfen kayıtlı bir konut seçin.');
            setNotificationSeverity('error');
            setShowNotification(true);
            setIsLoading(false);
            return;
          }
          propertyIdToSubmit = values.selectedPropertyId;
        } else {
          // Yeni Konut konut kaydı
          const newKonutPropertyPayload = {
            customerId: customerId,
            number: parseInt(values.apartmentReference!), // DEĞİŞTİRİLDİ: UAVT artık seçilen dairenin referansından alınıyor
            KonutOldPolicyNumber: null,
            squareMeter: parseInt(values.squareMeters!),
            constructionYear: parseInt(values.constructionYear!),
            lossPayeeClause: null,
            damageStatus: mapPropertyDamageStatusToBackendString(values.riskZone),
            floor: {
              totalFloors: mapKonutFloorCountRangeToPayload(values.floorCountRange),
              currentFloor: parseInt(values.floorNumber) // floorNumber zaten string ve required
            },
            structure: mapPropertyStructureToBackendString(values.buildingType), // buildingType'ı structure olarak gönder
            utilizationStyle: mapPropertyUtilizationStyleToBackendString(values.usageType),
            ownershipType: mapKonutPropertyOwnershipTypeToBackendString(values.ownershipType),
          };

          const propertyResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_PROPERTIES(customerId), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify(newKonutPropertyPayload),
          });

          if (!propertyResponse.ok) {
            const errorData = await propertyResponse.json().catch(() => ({ message: propertyResponse.statusText }));
            let errorMessage = 'Konut Konut oluşturulamadı.';
            if (errorData.errors && Array.isArray(errorData.errors)) {
              const uavtError = errorData.errors.find((error: string) => error.includes('UAVT'));
              if (uavtError) {
                errorMessage = 'Aynı UAVT numarasına sahip bir konut zaten mevcut';
              } else {
                errorMessage = errorData.errors[0];
              }
            }
            setNotificationMessage(errorMessage);
            setNotificationSeverity('error');
            setShowNotification(true);
            setIsLoading(false);
            return;
          }
          const createdProperty = await propertyResponse.json();
          if (!createdProperty || !createdProperty.newPropertyId) { // Güncellendi: createdProperty.id -> createdProperty.newPropertyId
            throw new Error('Konut Konut ID alınamadı.');
          }
          propertyIdToSubmit = createdProperty.newPropertyId; // Güncellendi: createdProperty.id -> createdProperty.newPropertyId
        }

        if (!propertyIdToSubmit) {
          // Bu log, eğer bir şekilde propertyIdToSubmit hala boşsa durumu belirtir.
          throw new Error('Gönderilecek Konut ID bulunamadı.');
        }

        // Konut Proposal oluşturma
        const proposalPayload = {
          $type: 'konut',
          propertyId: propertyIdToSubmit,
          insurerCustomerId: customerId,
          insuredCustomerId: customerId,
          furniturePrice: parseInt(values.furniturePrice, 10),
          electronicDevicePrice: parseInt(values.electronicDevicePrice, 10),
          insulationPrice: parseInt(values.insulationPrice, 10),
          windowPrice: parseInt(values.windowPrice, 10),
          constructionCostPerSquareMeter: 25000,
          inflation: getInflationPercentage(values.inflationValue),
          coverageGroupIds: getCoverageGroupIds('konut'),
          channel: 'WEBSITE',
        };

        const proposalResponse = await fetchWithAuth(API_ENDPOINTS.PROPOSALS_CREATE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(proposalPayload),
        });


        if (!proposalResponse.ok) {
          const errorData = await proposalResponse.json().catch(() => ({ message: proposalResponse.statusText }));
          throw new Error(errorData.message || `Konut Teklifi oluşturulamadı (HTTP ${proposalResponse.status})`);
        }
        const proposalResult = await proposalResponse.json();

        if (proposalResult && proposalResult.proposalId) {
          localStorage.setItem('KonutProposalId', proposalResult.proposalId);
          setNotificationMessage('Konut Teklifi başarıyla oluşturuldu! Teklifler sayfasına yönlendiriliyorsunuz...'); // Bildirim mesajı güncellendi
          setNotificationSeverity('success');
          setShowNotification(true);
          // onNext(); // Yönlendirme ile değiştirildi
          router.push(`/konut-sigortasi/quote-comparison/${proposalResult.proposalId}`); // Yönlendirme eklendi
        } else {
          throw new Error('Konut Teklif ID alınamadı.');
        }
      } catch (error: unknown) {
        let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';
        if (error instanceof yup.ValidationError) {
          errorMessage = 'Lütfen formdaki eksik veya hatalı alanları düzeltin.';
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        setNotificationMessage(errorMessage);
        setNotificationSeverity('error');
        setShowNotification(true);
      } finally {
        setIsLoading(false);
      }
    },
  });

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      let fetchedProperties: Property[] = [];
      let propertiesFetchedSuccessfully = false;

      if (accessToken && customerId) {
        try {
          const response = await fetchWithAuth(`${API_ENDPOINTS.CUSTOMER_PROPERTIES(customerId)}?usage=Konut`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (response.ok) {
            const data = await response.json();
            fetchedProperties = data as Property[];
            setProperties(fetchedProperties);
            propertiesFetchedSuccessfully = true;
          } else {
            const errorText = await response.text();
            setError(`Konut Konut bilgileri alınamadı: ${errorText}`);
            setProperties([]);
          }
        } catch (e) {
          setError('Konut Konut bilgileri alınırken bir hata oluştu.');
          setProperties([]);
        }
      } else {
        setProperties([]);
      }

      try {
        const citiesResponse = await fetchWithAuth(API_ENDPOINTS.ADDRESS_CITIES, {
          method: 'GET',
        });
        if (citiesResponse.ok) {
          const citiesData = await citiesResponse.json();
          if (Array.isArray(citiesData)) {
            // Sıralama fonksiyonunu uygula
            const sortedCities = sortLocationOptions(citiesData as LocationOption[]);
            setCities(sortedCities);
          } else {
            setError((prevError) => prevError ? `${prevError}\nİller yüklenirken beklenmeyen veri formatı.` : 'İller yüklenirken beklenmeyen veri formatı.');
          }
        } else {
          const errorText = await citiesResponse.text();
          setError((prevError) => prevError ? `${prevError}\nİller yüklenirken bir hata oluştu: ${errorText}` : `İller yüklenirken bir hata oluştu: ${errorText}`);
        }
      } catch (e) {
        setError((prevError) => prevError ? `${prevError}\nİller yüklenirken bir hata oluştu.` : 'İller yüklenirken bir hata oluştu.');
      }

      // Mülkler başarıyla yüklendi mi ve liste dolu mu kontrol et
      if (propertiesFetchedSuccessfully) {
        if (fetchedProperties.length === 0) {
          // Mülkler başarıyla yüklendi ama liste boşsa, 'new' olarak ayarla
          formik.setFieldValue('selectionType', 'new');
          // Formu sıfırla ama selectionType'ı koru
          const resetValues = { ...initialKonutFormData, selectionType: 'new' as const};
          formik.resetForm({ values: resetValues });
        } else {
          // Kayıtlı konut varsa 'existing' olarak ayarla ve ilk konutu seç
          formik.setFieldValue('selectionType', 'existing');
          handlePropertySelect(fetchedProperties[0].id);

          // onSelectionTypeChange prop'unu çağır
          if (onSelectionTypeChange) {
            onSelectionTypeChange('existing');
          }
        }
      }

      setIsLoading(false);
    };

    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, customerId, onSelectionTypeChange]); // formik ve handlePropertySelect bağımlılıklardan çıkarıldı. onSelectionTypeChange eklendi.

  const handleCityChange = (event: React.SyntheticEvent, newValue: LocationOption | null) => {
    setSelectedCity(newValue);
    formik.setFieldValue('cityReference', newValue?.value || '');
    // İl değişince ilçe ile ilgili state'leri ve formik değerini sıfırla
    setSelectedDistrict(null);
    setDistricts([]);
    formik.setFieldValue('districtReference', '');
    // Diğer alt seviyeleri de sıfırla
    setSelectedTown(null);
    setTowns([]);
    formik.setFieldValue('townReference', '');
    setSelectedNeighborhood(null);
    setNeighborhoods([]);
    formik.setFieldValue('neighborhoodReference', '');
    setSelectedStreet(null);
    setStreets([]);
    formik.setFieldValue('streetReference', '');
    setSelectedBuilding(null);
    setBuildings([]);
    formik.setFieldValue('buildingReference', '');
    setSelectedApartment(null);
    formik.setFieldValue('apartmentReference', '');

    if (newValue?.value) {
      fetchDistricts(newValue.value);
    }
  };

  const handleDistrictChange = (event: React.SyntheticEvent, newValue: LocationOption | null) => {
    setSelectedDistrict(newValue);
    formik.setFieldValue('districtReference', newValue?.value || '');
  };

  const handlePropertySelect = (propertyId: string) => {
    const selected = properties.find((p) => p.id === propertyId);
    if (selected) {
      // Mevcut teminat değerlerini koru
      const currentValues = formik.values;
      
      formik.setValues({
        ...currentValues, // Mevcut form değerlerini koru (teminat alanları dahil)
        selectionType: 'existing',
        selectedPropertyId: propertyId,
        // API'den gelen 'selected' objesindeki alanları KonutPropertyFormData'ya map et
        cityReference: (typeof selected.address === 'object' && selected.address.city?.value) || '',
        districtReference: (typeof selected.address === 'object' && selected.address.district?.value) || '',
        townReference: (typeof selected.address === 'object' && selected.address.town?.value) || '',
        neighborhoodReference: (typeof selected.address === 'object' && selected.address.neighborhood?.value) || '',
        streetReference: (typeof selected.address === 'object' && selected.address.street?.value) || '',
        buildingReference: (typeof selected.address === 'object' && selected.address.building?.value) || '',
        apartmentReference: (typeof selected.address === 'object' && selected.address.apartment?.value) || '',
        buildingType: mapKonutBuildingMaterialToForm(selected.buildingMaterial),
        constructionYear: selected.constructionYear?.toString() || '',
        floorCountRange: KonutPropertyFloorCountRange.Unknown,
        floorNumber: selected.floor?.currentFloor?.toString() || selected.floorNumber?.toString() || '',
        squareMeters: selected.squareMeters?.toString() || '',
        usageType: mapKonutUsageTypeToForm(selected.usageType),
        buildingMaterial: mapKonutBuildingMaterialToForm(selected.buildingMaterial),
        riskZone: mapKonutRiskZoneToForm(selected.riskZone),
        ownershipType: KonutPropertyOwnershipType.Unknown,
        uavtNo: selected.number?.toString() || '',
        // Teminat alanlarını mevcut değerleri ile koru (sadece boşsa default değer ata)
        propertyPrice: currentValues.propertyPrice || '',
        furniturePrice: currentValues.furniturePrice || '250000',
        electronicDevicePrice: currentValues.electronicDevicePrice || '10000',
        insulationPrice: currentValues.insulationPrice || '10000',
        windowPrice: currentValues.windowPrice || '50000',
        inflationValue: currentValues.inflationValue !== InflationType.Unknown ? currentValues.inflationValue : InflationType.Inflation60,
      });

      // Adres dropdown'larını senkronize et - API çağrısı yapmadan direkt state'leri set et
      if (typeof selected.address === 'object' && selected.address.city?.value) {
        setSelectedCity(selected.address.city);
        
        if (typeof selected.address === 'object' && selected.address.district?.value) {
          setSelectedDistrict(selected.address.district);
          // İlçe listesini sadece seçilen konutun değeri ile doldur
          setDistricts([selected.address.district]);
          
          if (typeof selected.address === 'object' && selected.address.town?.value) {
            setSelectedTown(selected.address.town);
            setTowns([selected.address.town]);
          } else {
            setSelectedTown(null); 
            setTowns([]);
          }
          
          if (typeof selected.address === 'object' && selected.address.neighborhood?.value) {
            setSelectedNeighborhood(selected.address.neighborhood);
            setNeighborhoods([selected.address.neighborhood]);
          } else {
            setSelectedNeighborhood(null); 
            setNeighborhoods([]);
          }
          
          if (typeof selected.address === 'object' && selected.address.street?.value) {
            setSelectedStreet(selected.address.street);
            setStreets([selected.address.street]);
          } else {
            setSelectedStreet(null); 
            setStreets([]);
          }
          
          if (typeof selected.address === 'object' && selected.address.building?.value) {
            setSelectedBuilding(selected.address.building);
            setBuildings([selected.address.building]);
          } else {
            setSelectedBuilding(null); 
            setBuildings([]);
          }
          
          if (typeof selected.address === 'object' && selected.address.apartment?.value) {
            setSelectedApartment(selected.address.apartment);
            setApartments([selected.address.apartment]);
          } else {
            setSelectedApartment(null); 
            setApartments([]);
          }
        } else {
          // İlçe bilgisi yoksa alt seviyeleri temizle
          setSelectedDistrict(null); setDistricts([]);
          setSelectedTown(null); setTowns([]);
          setSelectedNeighborhood(null); setNeighborhoods([]);
          setSelectedStreet(null); setStreets([]);
          setSelectedBuilding(null); setBuildings([]);
          setSelectedApartment(null); setApartments([]);
        }
      } else {
        // Şehir bilgisi yoksa tüm adres seviyelerini temizle
        setSelectedCity(null);
        setSelectedDistrict(null); setDistricts([]);
        setSelectedTown(null); setTowns([]);
        setSelectedNeighborhood(null); setNeighborhoods([]);
        setSelectedStreet(null); setStreets([]);
        setSelectedBuilding(null); setBuildings([]);
        setSelectedApartment(null); setApartments([]);
      }
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const handleUAVTQueryKonut = async (uavtNoValue: string) => {
    if (!uavtNoValue) {
      setNotificationMessage('Lütfen UAVT numarası giriniz');
      setNotificationSeverity('error');
      setShowNotification(true);
      return;
    }

    // UAVT numarası 10 haneli kontrolü
    if (!/^\d{10}$/.test(uavtNoValue)) {
      setNotificationMessage('UAVT numarası 10 haneli olmalıdır');
      setNotificationSeverity('error');
      setShowNotification(true);
      return;
    }

    setIsLoading(true);
    setPropertyType('uavt');
    try {
      const response = await fetchWithAuth(
          API_ENDPOINTS.PROPERTIES_QUERY_ADDRESS,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify({ propertyNumber: parseInt(uavtNoValue, 10) }),
          }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'UAVT sorgulanırken bir hata oluştu.');
      }

      const data = await response.json();

      // UAVT yanıtının geçerliliğini kontrol et
      const isEmptyOrInvalid = !data ||
          !data.city?.value || !data.city?.text ||
          !data.district?.value || !data.district?.text ||
          (data.building?.text === '-' && data.apartment?.text === '-');

      if (isEmptyOrInvalid) {
        setNotificationMessage('Hatalı UAVT numarası girdiniz, lütfen kontrol edip tekrar deneyin.');
        setNotificationSeverity('error');
        setShowNotification(true);
        setPropertyType('manual');
        return;
      }

      setNotificationMessage('Adres bilgileri başarıyla sorgulandı.');
      setNotificationSeverity('success');
      setShowNotification(true);

      // Form değerlerini güncelle
      formik.setFieldValue('cityReference', data.city.value || '');
      setSelectedCity(data.city || null);
      await fetchDistricts(data.city.value || '');

      formik.setFieldValue('districtReference', data.district.value || '');
      setSelectedDistrict(data.district || null);
      await fetchTowns(data.district.value || '');

      if (data.town) {
        formik.setFieldValue('townReference', data.town.value || '');
        setSelectedTown(data.town || null);
        await fetchNeighborhoods(data.town.value || '');
      } else {
        formik.setFieldValue('townReference', ''); setSelectedTown(null); setTowns([]);
        formik.setFieldValue('neighborhoodReference', ''); setSelectedNeighborhood(null); setNeighborhoods([]);
        formik.setFieldValue('streetReference', ''); setSelectedStreet(null); setStreets([]);
        formik.setFieldValue('buildingReference', ''); setSelectedBuilding(null); setBuildings([]);
        formik.setFieldValue('apartmentReference', ''); setSelectedApartment(null); setApartments([]);
      }

      if (data.neighborhood) {
        formik.setFieldValue('neighborhoodReference', data.neighborhood.value || '');
        setSelectedNeighborhood(data.neighborhood || null);
        await fetchStreets(data.neighborhood.value || '');
      } else {
        formik.setFieldValue('neighborhoodReference', ''); setSelectedNeighborhood(null); setNeighborhoods([]);
        formik.setFieldValue('streetReference', ''); setSelectedStreet(null); setStreets([]);
        formik.setFieldValue('buildingReference', ''); setSelectedBuilding(null); setBuildings([]);
        formik.setFieldValue('apartmentReference', ''); setSelectedApartment(null); setApartments([]);
      }

      if (data.street) {
        formik.setFieldValue('streetReference', data.street.value || '');
        setSelectedStreet(data.street || null);
        await fetchBuildings(data.street.value || '');
      } else {
        formik.setFieldValue('streetReference', ''); setSelectedStreet(null); setStreets([]);
        formik.setFieldValue('buildingReference', ''); setSelectedBuilding(null); setBuildings([]);
        formik.setFieldValue('apartmentReference', ''); setSelectedApartment(null); setApartments([]);
      }

      if (data.building) {
        formik.setFieldValue('buildingReference', data.building.value || '');
        setSelectedBuilding(data.building || null);
        await fetchApartments(data.building.value || '');
      } else {
        formik.setFieldValue('buildingReference', ''); setSelectedBuilding(null); setBuildings([]);
        formik.setFieldValue('apartmentReference', ''); setSelectedApartment(null); setApartments([]);
      }

      if (data.apartment) {
        formik.setFieldValue('apartmentReference', data.apartment.value || '');
        setSelectedApartment(data.apartment || null);
      } else {
        formik.setFieldValue('apartmentReference', ''); setSelectedApartment(null); setApartments([]);
      }

      // UAVT ile gelen diğer bilgiler varsa burada set edilebilir (örn: bina yapı tipi, inşa yılı vb.)
      // Şimdilik sadece adres bilgileri güncelleniyor.

    } catch (error) {
      let message = 'UAVT sorgulanırken bir hata oluştu.';
      if (error instanceof Error) {
        message = error.message;
      }
      setNotificationMessage(message);
      setNotificationSeverity('error');
      setShowNotification(true);
      setPropertyType('manual');
    } finally {
      setIsLoading(false);
    }
  };

  // Zorunlu alanları kontrol eden fonksiyon
  const isFormValid = () => {
    // Ortak teminat alanları kontrolü (hem existing hem new için)
    const teminatValid = {
      furniturePrice: formik.values.furniturePrice,
      electronicDevicePrice: formik.values.electronicDevicePrice,
      insulationPrice: formik.values.insulationPrice,
      windowPrice: formik.values.windowPrice,
      inflationValue: formik.values.inflationValue !== InflationType.Unknown,
    };

    if (formik.values.selectionType === 'existing') {
      return !!formik.values.selectedPropertyId && Object.values(teminatValid).every(value => !!value);
    }

    // Manuel giriş için zorunlu alanları kontrol et
    const requiredFields = {
      cityReference: formik.values.cityReference,
      districtReference: formik.values.districtReference,
      squareMeters: formik.values.squareMeters,
      constructionYear: formik.values.constructionYear,
      floorNumber: formik.values.floorNumber,
      floorCountRange: formik.values.floorCountRange !== KonutPropertyFloorCountRange.Unknown,
      usageType: formik.values.usageType !== PropertyUtilizationStyle.Unknown,
      buildingType: formik.values.buildingType !== PropertyStructure.Unknown,
      riskZone: formik.values.riskZone !== PropertyDamageStatus.Unknown,
      ownershipType: formik.values.ownershipType !== KonutPropertyOwnershipType.Unknown,
      ...teminatValid,
    };

    return Object.values(requiredFields).every(value => !!value);
  };

  // Helper functions for form inputs
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(event);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    formik.handleBlur(event);
  };

  return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Konut Bilgileri
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {formik.values.selectionType === 'existing'
              ? 'Kayıtlı Konut poliçeniz için konut seçin veya yeni konut ekleyin'
              : 'Konut poliçeniz için konut bilgilerinizi giriniz'}
        </Typography>

        <Snackbar
            open={showNotification}
            autoHideDuration={6000}
            onClose={handleCloseNotification}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseNotification} severity={notificationSeverity} sx={{ width: '100%' }}>
            {notificationMessage}
          </Alert>
        </Snackbar>

        {isLoading && !properties.length && formik.values.selectionType === 'existing' ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
        ) : (
            <>
              <RadioGroup
                  row
                  aria-label="selection type"
                  name="selectionType"
                  value={formik.values.selectionType}
                  onChange={(e) => {
                    const newSelectionType = e.target.value as 'existing' | 'new';
                    formik.setFieldValue('selectionType', newSelectionType);
                    setError(null); // Seçim değişince genel hatayı temizle

                    // onSelectionTypeChange prop'unu çağır
                    if (onSelectionTypeChange) {
                      onSelectionTypeChange(newSelectionType);
                    }

                    if (newSelectionType === 'new') {
                      formik.setFieldValue('selectedPropertyId', null);
                      // Yeni konut için formu sıfırla ama selectionType'ı koru
                      const resetValues = { ...initialKonutFormData, selectionType: 'new' as const};
                      formik.resetForm({ values: resetValues });
                      setSelectedCity(null);
                      setSelectedDistrict(null);
                      setDistricts([]);
                      setSelectedTown(null); setTowns([]);
                      setSelectedNeighborhood(null); setNeighborhoods([]);
                      setSelectedStreet(null); setStreets([]);
                      setSelectedBuilding(null); setBuildings([]);
                      setSelectedApartment(null); setApartments([]);
                      setPropertyType('manual'); // UAVT sorgu durumunu sıfırla
                    } else if (newSelectionType === 'existing') {
                      // Eğer kayıtlı konutlar varsa ve hiçbiri seçili değilse ilkini seç
                      if (properties.length > 0 && !formik.values.selectedPropertyId) {
                        handlePropertySelect(properties[0].id);
                      }
                    }
                  }}
                  sx={{ mb: 3 }}
              >
                <FormControlLabel
                    value="existing"
                    control={<Radio />}
                    label="Kayıtlı Konutlarım"
                    disabled={isLoading || properties.length === 0} // Yüklenirken veya konut yoksa disable
                />
                <FormControlLabel
                    value="new"
                    control={<Radio />}
                    label="Yeni Konut Ekle"
                    disabled={isLoading} // Sadece yüklenirken disable
                />
              </RadioGroup>

              {formik.values.selectionType === 'existing' ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                 
                    {isLoading && properties.length === 0 ? ( // Yükleniyor göstergesi
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
                    ) : properties.length === 0 ? (
                        <Typography>Kayıtlı Konut uyumlu konut bulunamadı. Lütfen yeni konut ekleyin.</Typography>
                    ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                          {properties.map((property) => (
                              <Box key={property.id}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                      cursor: 'pointer',
                                      height: '100%',
                                      border: formik.values.selectedPropertyId === property.id
                                          ? '2px solid #ffa500'
                                          : '1px solid rgba(0, 0, 0, 0.12)',
                                      '&:hover': {
                                        borderColor: formik.values.selectedPropertyId !== property.id
                                            ? 'rgba(0, 0, 0, 0.23)'
                                            : undefined,
                                      }
                                    }}
                                    onClick={() => handlePropertySelect(property.id)}
                                >
                                  <CardContent>
                                    <Typography variant="subtitle1" fontWeight="medium">
                                      {typeof property.address === 'object' && property.address.city && property.address.district ?
                                          `${property.address.city.text} / ${property.address.district.text}`
                                          : 'İl/İlçe bilgisi yok'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                      {typeof property.address === 'object' && property.address ?
                                          `${property.address.town?.text ? property.address.town.text + ' ' : ''}${property.address.neighborhood?.text ? property.address.neighborhood.text + ' ' : ''}${property.address.street?.text ? property.address.street.text + ' ' : ''}${property.address.building?.text ? 'No:' + property.address.building.text + ' ' : ''}${property.address.apartment?.text ? 'Daire:' + property.address.apartment.text : ''}`.trim() || 'Adres bilgisi yok'
                                          : 'Adres bilgisi yok'}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Box>
                          ))}
                        </Box>
                    )}
                  </Box>
              ) : ( // Yeni Konut Ekle Formu
                  <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                    {/* Konut form yapısına benzer şekilde Box ve flex layout kullanılacak */}
                    <Typography variant="h5" component="h2" gutterBottom align="center">
                      Konut Sigortası için Gayrimenkul Bilgileri
                    </Typography>

                    <Typography variant="body2" color="text.secondary" paragraph align="center">
                       Konut Sigortası teklifiniz için gayrimenkul bilgilerinizi eksiksiz doldurunuz.
                    </Typography>

                    <Divider sx={{ my: 3 }} />
                    {/* Adres Bilgileri Başlığı */}
                    <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                      Adres Bilgileri
                    </Typography>
                    {/* Row 0: UAVT Sorgulama - YENİ EKLENEN KISIM */}
                    {(formik.values.selectionType as string) === 'new' && (
                        <>
                          <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                              <TextField
                                  fullWidth
                                  name="uavtNo"
                                  label="UAVT Adres Kodu"
                                  value={formik.values.uavtNo}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/[^0-9]/g, '');
                                    if (value.length <= 10) {
                                      formik.setFieldValue('uavtNo', value);
                                    }
                                  }}
                                  error={Boolean(formik.touched.uavtNo && (formik.errors.uavtNo || (formik.values.uavtNo && !/^\d{10}$/.test(formik.values.uavtNo))))}
                                  helperText={formik.touched.uavtNo && (formik.errors.uavtNo || (formik.values.uavtNo && !/^\d{10}$/.test(formik.values.uavtNo))) ? 'UAVT numarası 10 haneli olmalıdır' : ' '}
                                  disabled={(formik.values.selectionType as string) === 'existing'}
                                  inputProps={{
                                    maxLength: 10,
                                    inputMode: 'numeric' as const,
                                    pattern: '[0-9]*'
                                  }}
                              />
                            </Box>
                            <Box sx={{ flex: 0.1, minWidth: { xs: '100%', sm: 'auto' }, mb: 0 }} style={{ minHeight: '56px' }}>
                              <Button
                                  variant="contained"
                                  onClick={() => handleUAVTQueryKonut(formik.values.uavtNo)}
                                  disabled={!formik.values.uavtNo || !/^\d{10}$/.test(formik.values.uavtNo) || isLoading || formik.isSubmitting || propertyType === 'uavt'}
                                  fullWidth
                                  style={{ minHeight: '56px' }}
                              >
                                {isLoading && propertyType === 'uavt' ? 'Sorgulanıyor...' : 'Sorgula'}
                              </Button>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: -2, mb: 3 }}>
                            UAVT numarasını biliyorsanız, adres bilgilerini otomatik doldurmak için sorgulayabilirsiniz.
                          </Typography>
                        </>
                    )}

                    {/* Row 1: City, District */}
                    <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                        <CustomSelect
                            label="İl"
                            value={formik.values.cityReference}
                            onChange={(newCityValue: string) => {
                              formik.setFieldValue('cityReference', newCityValue || '');
                              const cityOption = cities.find(c => c.value === newCityValue);
                              setSelectedCity(cityOption || null);
                              setSelectedDistrict(null);
                              setDistricts([]);
                              formik.setFieldValue('districtReference', '');
                              // Manuel değişiklik yapıldığında UAVT durumunu sıfırla
                              if (propertyType === 'uavt') setPropertyType('manual');
                              if (newCityValue) {
                                fetchDistricts(newCityValue);
                              }
                            }}
                            options={cities.map(opt => ({ value: opt.value, label: opt.text }))}
                            disabled={(formik.values.selectionType as string) === 'existing' || isLoading || cities.length === 0 || propertyType === 'uavt'}
                            error={formik.touched.cityReference && formik.errors.cityReference ? formik.errors.cityReference : undefined}
                            required
                            searchable={true}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                        <CustomSelect
                            label="İlçe"
                            value={formik.values.districtReference}
                            onChange={(newDistrictValue: string) => {
                              formik.setFieldValue('districtReference', newDistrictValue || '');
                              const districtOption = districts.find(d => d.value === newDistrictValue);
                              setSelectedDistrict(districtOption || null);
                              // Alt seviyeleri sıfırla
                              formik.setFieldValue('townReference', ''); setSelectedTown(null); setTowns([]);
                              formik.setFieldValue('neighborhoodReference', ''); setSelectedNeighborhood(null); setNeighborhoods([]);
                              formik.setFieldValue('streetReference', ''); setSelectedStreet(null); setStreets([]);
                              formik.setFieldValue('buildingReference', ''); setSelectedBuilding(null); setBuildings([]);
                              formik.setFieldValue('apartmentReference', ''); setSelectedApartment(null); setApartments([]);
                              if (propertyType === 'uavt') setPropertyType('manual');
                              if (newDistrictValue) {
                                fetchTowns(newDistrictValue);
                              }
                            }}
                            options={districts.map(opt => ({ value: opt.value, label: opt.text }))}
                            disabled={(formik.values.selectionType as string) === 'existing' || !formik.values.cityReference || isLoading || districts.length === 0 || propertyType === 'uavt'}
                            error={formik.touched.districtReference && formik.errors.districtReference ? formik.errors.districtReference : undefined}
                            required
                            searchable={true}
                        />
                      </Box>
                    </Box>

                    {/* Row 2.1: Town, Neighborhood */}
                    <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                        <CustomSelect
                            label="Belde/Bucak"
                            value={formik.values.townReference || ''}
                            onChange={(newTownValue: string) => {
                              formik.setFieldValue('townReference', newTownValue || '');
                              const townOption = towns.find(t => t.value === newTownValue);
                              setSelectedTown(townOption || null);
                              formik.setFieldValue('neighborhoodReference', ''); setSelectedNeighborhood(null); setNeighborhoods([]);
                              formik.setFieldValue('streetReference', ''); setSelectedStreet(null); setStreets([]);
                              formik.setFieldValue('buildingReference', ''); setSelectedBuilding(null); setBuildings([]);
                              formik.setFieldValue('apartmentReference', ''); setSelectedApartment(null); setApartments([]);
                              if (propertyType === 'uavt') setPropertyType('manual');
                              if (newTownValue) {
                                fetchNeighborhoods(newTownValue);
                              }
                            }}
                            options={towns.map(opt => ({ value: opt.value, label: opt.text }))}
                            disabled={(formik.values.selectionType as string) === 'existing' || !formik.values.districtReference || isLoading || towns.length === 0 || propertyType === 'uavt'}
                            error={formik.touched.townReference && formik.errors.townReference ? formik.errors.townReference : undefined}
                            // required // Şimdilik opsiyonel
                            searchable={true}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                        <CustomSelect
                            label="Mahalle"
                            value={formik.values.neighborhoodReference || ''}
                            onChange={(newNeighborhoodValue: string) => {
                              formik.setFieldValue('neighborhoodReference', newNeighborhoodValue || '');
                              const neighborhoodOption = neighborhoods.find(n => n.value === newNeighborhoodValue);
                              setSelectedNeighborhood(neighborhoodOption || null);
                              formik.setFieldValue('streetReference', ''); setSelectedStreet(null); setStreets([]);
                              formik.setFieldValue('buildingReference', ''); setSelectedBuilding(null); setBuildings([]);
                              formik.setFieldValue('apartmentReference', ''); setSelectedApartment(null); setApartments([]);
                              if (propertyType === 'uavt') setPropertyType('manual');
                              if (newNeighborhoodValue) {
                                fetchStreets(newNeighborhoodValue);
                              }
                            }}
                            options={neighborhoods.map(opt => ({ value: opt.value, label: opt.text }))}
                            disabled={(formik.values.selectionType as string) === 'existing' || !formik.values.townReference || isLoading || neighborhoods.length === 0 || propertyType === 'uavt'}
                            error={formik.touched.neighborhoodReference && formik.errors.neighborhoodReference ? formik.errors.neighborhoodReference : undefined}
                            // required // Şimdilik opsiyonel, Konut'ta mahalle zorunlu olabilir, API'ye göre ayarlanmalı
                            searchable={true}
                        />
                      </Box>
                    </Box>

                    {/* Row 2.2: Street, Building */}
                    <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                        <CustomSelect
                            label="Sokak/Cadde"
                            value={formik.values.streetReference || ''}
                            onChange={(newStreetValue: string) => {
                              formik.setFieldValue('streetReference', newStreetValue || '');
                              const streetOption = streets.find(s => s.value === newStreetValue);
                              setSelectedStreet(streetOption || null);
                              formik.setFieldValue('buildingReference', ''); setSelectedBuilding(null); setBuildings([]);
                              formik.setFieldValue('apartmentReference', ''); setSelectedApartment(null); setApartments([]);
                              if (propertyType === 'uavt') setPropertyType('manual');
                              if (newStreetValue) {
                                fetchBuildings(newStreetValue);
                              }
                            }}
                            options={streets.map(opt => ({ value: opt.value, label: opt.text }))}
                            disabled={(formik.values.selectionType as string) === 'existing' || !formik.values.neighborhoodReference || isLoading || streets.length === 0 || propertyType === 'uavt'}
                            error={formik.touched.streetReference && formik.errors.streetReference ? formik.errors.streetReference : undefined}
                            // required
                            searchable={true}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                        <CustomSelect
                            label="Bina No/Adı"
                            value={formik.values.buildingReference || ''}
                            onChange={(newBuildingValue: string) => {
                              formik.setFieldValue('buildingReference', newBuildingValue || '');
                              const buildingOption = buildings.find(b => b.value === newBuildingValue);
                              setSelectedBuilding(buildingOption || null);
                              formik.setFieldValue('apartmentReference', ''); setSelectedApartment(null); setApartments([]);
                              if (propertyType === 'uavt') setPropertyType('manual');
                              if (newBuildingValue) {
                                fetchApartments(newBuildingValue);
                              }
                            }}
                            options={buildings.map(opt => ({ value: opt.value, label: opt.text }))}
                            disabled={(formik.values.selectionType as string) === 'existing' || !formik.values.streetReference || isLoading || buildings.length === 0 || propertyType === 'uavt'}
                            error={formik.touched.buildingReference && formik.errors.buildingReference ? formik.errors.buildingReference : undefined}
                            // required
                            searchable={true}
                        />
                      </Box>
                    </Box>

                    {/* Row 2.3: Apartment, UAVT/Konut No */}
                    <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                        <CustomSelect
                            label="Daire No"
                            value={formik.values.apartmentReference || ''}
                            onChange={(newApartmentValue: string) => {
                              formik.setFieldValue('apartmentReference', newApartmentValue || '');
                              const apartmentOption = apartments.find(a => a.value === newApartmentValue);
                              setSelectedApartment(apartmentOption || null);
                              if (propertyType === 'uavt') setPropertyType('manual');
                            }}
                            options={apartments.map(opt => ({ value: opt.value, label: opt.text }))}
                            disabled={(formik.values.selectionType as string) === 'existing' || !formik.values.buildingReference || isLoading || apartments.length === 0 || propertyType === 'uavt'}
                            error={formik.touched.apartmentReference && formik.errors.apartmentReference ? formik.errors.apartmentReference : undefined}
                            // required
                            searchable={true}
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                        {/* ESKİ YERİ: UAVT TextField buradaydı, yukarı taşındı. Bu Box boş kalabilir veya başka bir alan için kullanılabilir. */}
                        {/* <TextField
                    fullWidth
                    name="uavtNo" // KonutOrUavtNumber -> uavtNo
                    label="UAVT Adres Kodu" // Etiket güncellendi
                    value={formik.values.uavtNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.uavtNo && Boolean(formik.errors.uavtNo)}
                    helperText={formik.touched.uavtNo && formik.errors.uavtNo}
                    disabled={(formik.values.selectionType as string) === 'existing'}
                    // required // UAVT sorgulama butonu olduğu için zorunluluk kaldırılabilir veya farklı yönetilebilir
                  /> */}
                      </Box>
                    </Box>

                    {/* Genel Bilgiler Başlığı */}
                    <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
                      Genel Bilgiler
                    </Typography>

                    {/* Row 3: Building Type (Yapı Tarzı), Construction Year */}
                    <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                        <CustomSelect
                            label="Yapı Tarzı"
                            value={formik.values.buildingType === PropertyStructure.Unknown ? '' : formik.values.buildingType.toString()}
                            onChange={(val: string) => formik.setFieldValue('buildingType', val ? Number(val) : PropertyStructure.Unknown)}
                            options={structureTypeOptions.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                            disabled={(formik.values.selectionType as string) === 'existing'}
                            error={formik.touched.buildingType && formik.errors.buildingType ? formik.errors.buildingType : undefined}
                            required
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                        <TextField
                            fullWidth
                            name="constructionYear"
                            label="Yapım Yılı"
                            type="number"
                            value={formik.values.constructionYear || ''}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.constructionYear && Boolean(formik.errors.constructionYear)}
                            helperText={formik.touched.constructionYear && formik.errors.constructionYear}
                            disabled={(formik.values.selectionType as string) === 'existing'}
                            inputProps={{ min: 1900, max: new Date().getFullYear() }}
                            required
                        />
                      </Box>
                    </Box>

                    {/* Konut Kullanım Detayları Başlığı */}
                    <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
                      Konut Kullanım Detayları
                    </Typography>

                    {/* Row 4: Floor Count Range, Floor Number */}
                    <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                        <CustomSelect
                            label="Konut Toplam Kat Sayısı"
                            value={formik.values.floorCountRange.toString()}
                            onChange={(val: string) => formik.setFieldValue('floorCountRange', Number(val) || KonutPropertyFloorCountRange.Unknown)}
                            options={KonutFloorCountRangeOptions.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                            disabled={(formik.values.selectionType as string) === 'existing'}
                            error={formik.touched.floorCountRange && formik.errors.floorCountRange ? String(formik.errors.floorCountRange) : undefined}
                            required
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                        <TextField
                            fullWidth
                            name="floorNumber"
                            label="Dairenin Bulunduğu Kat"
                            type="text"
                            value={formik.values.floorNumber}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^-0-9]/g, '');
                              if (value.length <= 3) {
                                formik.setFieldValue('floorNumber', value);
                              }
                            }}
                            onBlur={formik.handleBlur}
                            error={formik.touched.floorNumber && Boolean(formik.errors.floorNumber)}
                            helperText={formik.touched.floorNumber && formik.errors.floorNumber}
                            disabled={(formik.values.selectionType as string) === 'existing'}
                            inputProps={{ maxLength: 3 }}
                            required
                        />
                      </Box>
                    </Box>

                    {/* Row 5: Square Meters, Usage Type */}
                    <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                        <TextField
                            fullWidth
                            name="squareMeters"
                            label="Brüt Alan (m²)"
                            type="text"
                            value={formik.values.squareMeters}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              if (value.length <= 3) {
                                formik.setFieldValue('squareMeters', value);
                              }
                            }}
                            onBlur={formik.handleBlur}
                            error={formik.touched.squareMeters && Boolean(formik.errors.squareMeters)}
                            helperText={
                                (formik.touched.squareMeters && formik.errors.squareMeters) 
                            }
                            disabled={(formik.values.selectionType as string) === 'existing'}
                            inputProps={{ maxLength: 3 }}
                            required
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                        <CustomSelect
                            label="Kullanım Şekli"
                            value={formik.values.usageType === PropertyUtilizationStyle.Unknown ? '' : formik.values.usageType.toString()}
                            onChange={(val: string) => formik.setFieldValue('usageType', val ? Number(val) : PropertyUtilizationStyle.Unknown)}
                            options={utilizationStyleOptions.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                            disabled={(formik.values.selectionType as string) === 'existing'}
                            error={formik.touched.usageType && formik.errors.usageType ? formik.errors.usageType : undefined}
                            required
                        />
                      </Box>
                    </Box>

                    {/* Bina Detayları Başlığı */}
                    <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
                      Bina Detayları
                    </Typography>

                    {/* Row 6: Damage Status */}
                    <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                      <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                        <CustomSelect
                            label="Hasar Durumu"
                            value={formik.values.riskZone === PropertyDamageStatus.Unknown ? '' : formik.values.riskZone.toString()}
                            onChange={(val: string) => formik.setFieldValue('riskZone', val ? Number(val) : PropertyDamageStatus.Unknown)}
                            options={damageStatusOptions.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                            disabled={(formik.values.selectionType as string) === 'existing'}
                            error={formik.touched.riskZone && formik.errors.riskZone ? formik.errors.riskZone : undefined}
                            required
                        />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                        <CustomSelect
                            label="Mülkiyet Tipi"
                            value={formik.values.ownershipType === KonutPropertyOwnershipType.Unknown ? '' : formik.values.ownershipType.toString()}
                            onChange={(val: string) => formik.setFieldValue('ownershipType', val ? Number(val) : KonutPropertyOwnershipType.Unknown)}
                            options={KonutOwnershipTypeOptions.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                            disabled={(formik.values.selectionType as string) === 'existing'}
                            error={formik.touched.ownershipType && formik.errors.ownershipType ? String(formik.errors.ownershipType) : undefined}
                            required
                        />
                      </Box>
                    </Box>



                  </Box> /* Form Box sonu */
              )}

              {/* Teminat Bilgileri Accordion - Hem existing hem new için */}
              <Accordion sx={{ mt: 4, mb: 3 }} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">Teminat Bilgileri</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Lütfen sigortaya dahil edilecek teminat tutarlarını belirtiniz.
                  </Typography>

                  {/* Row 1: Eşya Bedeli */}
                  <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                      <TextField
                          fullWidth
                          name="windowPrice"
                          label="Cam Bedeli (TL)"
                          type="text"
                          value={formatNumberWithDots(formik.values.windowPrice)}
                          onChange={(e) => {
                            const formattedValue = handleFormattedNumberChange(e.target.value, 100000);
                            formik.setFieldValue('windowPrice', removeNumberFormatting(formattedValue));
                          }}
                          onBlur={formik.handleBlur}
                          error={formik.touched.windowPrice && Boolean(formik.errors.windowPrice)}
                          helperText={formik.touched.windowPrice && formik.errors.windowPrice ? formik.errors.windowPrice : 'Cam kırılması hasar teminatı'}
                          inputProps={{
                            inputMode: 'numeric',
                            pattern: '[0-9.]*'
                          }}
                          required
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                      <TextField
                          fullWidth
                          name="furniturePrice"
                          label="Eşya Bedeli (TL)"
                          type="text"
                          value={formatNumberWithDots(formik.values.furniturePrice)}
                          onChange={(e) => {
                            const formattedValue = handleFormattedNumberChange(e.target.value, 1000000);
                            formik.setFieldValue('furniturePrice', removeNumberFormatting(formattedValue));
                          }}
                          onBlur={formik.handleBlur}
                          error={formik.touched.furniturePrice && Boolean(formik.errors.furniturePrice)}
                          helperText={formik.touched.furniturePrice && formik.errors.furniturePrice ? formik.errors.furniturePrice : 'Ev eşyalarının toplam değeri'}
                          inputProps={{ 
                            inputMode: 'numeric',
                            pattern: '[0-9.]*'
                          }}
                          required
                      />
                    </Box>
                  </Box>

                  {/* Row 2: Elektronik Cihaz Bedeli, İzolasyon Bedeli */}
                  <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                      <TextField
                          fullWidth
                          name="electronicDevicePrice"
                          label="Elektronik Cihaz Bedeli (TL)"
                          type="text"
                          value={formatNumberWithDots(formik.values.electronicDevicePrice)}
                          onChange={(e) => {
                            const formattedValue = handleFormattedNumberChange(e.target.value, 500000);
                            formik.setFieldValue('electronicDevicePrice', removeNumberFormatting(formattedValue));
                          }}
                          onBlur={formik.handleBlur}
                          error={formik.touched.electronicDevicePrice && Boolean(formik.errors.electronicDevicePrice)}
                          helperText={formik.touched.electronicDevicePrice && formik.errors.electronicDevicePrice ? formik.errors.electronicDevicePrice : 'TV, bilgisayar, telefon vb. değeri'}
                          inputProps={{ 
                            inputMode: 'numeric',
                            pattern: '[0-9.]*'
                          }}
                          required
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                      <TextField
                          fullWidth
                          name="insulationPrice"
                          label="İzolasyon Bedeli (TL)"
                          type="text"
                          value={formatNumberWithDots(formik.values.insulationPrice)}
                          onChange={(e) => {
                            const formattedValue = handleFormattedNumberChange(e.target.value, 100000);
                            formik.setFieldValue('insulationPrice', removeNumberFormatting(formattedValue));
                          }}
                          onBlur={formik.handleBlur}
                          error={formik.touched.insulationPrice && Boolean(formik.errors.insulationPrice)}
                          helperText={formik.touched.insulationPrice && formik.errors.insulationPrice ? formik.errors.insulationPrice : 'Su izolasyonu hasar teminatı'}
                          inputProps={{ 
                            inputMode: 'numeric',
                            pattern: '[0-9.]*'
                          }}
                          required
                      />
                    </Box>
                  </Box>

                  {/* Row 3: Enflasyon */}
                  <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                      <CustomSelect
                          label="Enflasyon Oranı"
                          value={formik.values.inflationValue.toString()}
                          onChange={(val: string) => formik.setFieldValue('inflationValue', Number(val) || InflationType.Unknown)}
                          options={inflationOptions.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                          error={formik.touched.inflationValue && formik.errors.inflationValue ? String(formik.errors.inflationValue) : undefined}
                          required
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }} />
                </Box>
                </AccordionDetails>
              </Accordion>

              {/* Logları buraya ekleyelim */}
              {( () => {
                const isDisabled = isLoading ||
                    formik.isSubmitting ||
                    (formik.values.selectionType === 'existing' && !formik.values.selectedPropertyId) ||
                    (formik.values.selectionType === 'new' && !isFormValid())

                return null; // JSX içinde bir şey render etmemek için
              })()}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt:2 }}>
                <Button
                    variant="outlined"
                    onClick={onBack}
                    disabled={isLoading || formik.isSubmitting || isFirstStep}
                    sx={{
                      minWidth: 100,
                      height: 48,
                      borderRadius: 2,
                      textTransform: 'none',
                    }}
                >
                  Geri
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {

                      formik.handleSubmit(); // formik.onSubmit'i tetikler (eğer valid ise)
                    }}
                    disabled={
                        isLoading ||
                        formik.isSubmitting ||
                        (formik.values.selectionType === 'existing' && !formik.values.selectedPropertyId) ||
                        (formik.values.selectionType === 'new' && !isFormValid())
                    }
                    sx={{
                      minWidth: 200,
                      height: 48,
                      borderRadius: 2,
                      ml: 'auto',
                      textTransform: 'none',
                    }}
                >
                  {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : (formik.values.selectionType === 'existing' ? 'Teklif Al' : 'Devam Et')}
                </Button>
              </Box>
            </>
        )}
      </Box>
  );
}