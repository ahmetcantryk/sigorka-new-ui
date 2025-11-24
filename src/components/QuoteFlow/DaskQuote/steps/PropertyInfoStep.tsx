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
  InputAdornment,
} from '@mui/material';
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

// DASK için Kat Sayısı Aralığı Enum ve Seçenekleri (Konut'takine benzer)
enum DaskPropertyFloorCountRange {
  Unknown = 0,
  Between1And3 = 1,
  Between4And7 = 2,
  Between8And18 = 3,
  MoreThan19 = 4,
}

const daskFloorCountRangeOptions = [
  { value: DaskPropertyFloorCountRange.Between1And3, label: '1-3' },
  { value: DaskPropertyFloorCountRange.Between4And7, label: '4-7' },
  { value: DaskPropertyFloorCountRange.Between8And18, label: '8-18' },
  { value: DaskPropertyFloorCountRange.MoreThan19, label: '> 18' },
];

// DASK için Mülkiyet Tipi Enum ve Seçenekleri (Konut'takine benzer)
enum DaskPropertyOwnershipType {
  Unknown = 0,
  Proprietor = 1, // Malik
  Tenant = 2,     // Kiracı
  Other = 3,      // Diğer (API destekliyorsa)
}

const daskOwnershipTypeOptions = [
  { value: DaskPropertyOwnershipType.Proprietor, label: 'Mal Sahibi' },
  { value: DaskPropertyOwnershipType.Tenant, label: 'Kiracı' },
  // { value: DaskPropertyOwnershipType.Other, label: 'Diğer' }, // API destekliyorsa eklenebilir
];

const utilizationStyleOptions = [
  { value: PropertyUtilizationStyle.House, label: 'Konut' },
  { value: PropertyUtilizationStyle.Business, label: 'İşyeri' },
];

const structureTypeOptions = [
  { value: PropertyStructure.SteelReinforcedConcrete, label: 'Çelik Betonarme' },
  { value: PropertyStructure.Other, label: 'Diğer' },
];

const damageStatusOptions = [
  { value: PropertyDamageStatus.None, label: 'Hasarsız' },
  { value: PropertyDamageStatus.SlightlyDamaged, label: 'Az Hasarlı' },
  { value: PropertyDamageStatus.ModeratelyDamaged, label: 'Orta Hasarlı' },
  { value: PropertyDamageStatus.SeverelyDamaged, label: 'Ağır Hasarlı' },
];

// floorNumberOptions DASK'ta direkt sayısal giriş olabilir.
// ownershipTypeOptions DASK'ta bu kadar detaylı olmayabilir.

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
  buildingType: string; // DASK API'si string bekleyebilir (örn: "APARTMENT_BUILDING") ya da enum sayılarını. Şimdilik genel string.
  constructionYear: number;
  floorCount: number; // Bina toplam kat sayısı
  floorNumber: number; // Dairenin bulunduğu kat
  squareMeters: number;
  usageType: string; // Örn: "HOUSE", "BUSINESS" (PropertyUtilizationStyle enum string karşılığı)
  buildingMaterial: string; // Örn: "STEEL_REINFORCED_CONCRETE" (PropertyStructure enum string karşılığı)
  riskZone: string; // Örn: "NONE" (PropertyDamageStatus enum string karşılığı)
  customerId?: string;
  daskOldPolicyNumber?: string; // Eski DASK Poliçe Numarası - YENİ EKLENDİ
  // DASK özelinde lossPayeeClause olmayabilir.
  // floor nesnesi API'deki gibi detaylı olabilir veya DASK için basitleştirilebilir.
  floor?: {
      totalFloors?: number | null | { $type?: string, min?: number, max?: number }; // Kaçış karakterleri kaldırıldı
      currentFloor?: number | null;
  };
  // structure, utilizationStyle, ownershipType alanları ana seviyede de olabilir.
  // DASK'ta buildingMaterial, usageType, riskZone olarak adlandırılmış.
  ownershipType?: string; // API yanıtına göre "TENANT", "PROPRIETOR"
}

// DASK Form Veri Yapısı (Konut'takine benzer ama DASK'a özel)
interface DaskPropertyFormData {
  selectionType: 'existing' | 'new' | 'renewal';
  selectedPropertyId: string | null;

  // Adres Bilgileri (Formik için)
  cityReference: string; // LocationOption.value
  districtReference: string; // LocationOption.value
  townReference?: string;
  neighborhoodReference?: string;
  streetReference?: string;
  buildingReference?: string;
  apartmentReference?: string;
  // DASK'ta town, neighborhood, street, building, apartment formda olmayabilir, UAVT sorgusuyla veya tek bir address satırıyla alınabilir.
  // addressLine: string; // Ayrı bir adres satırı, eğer UAVT yoksa veya detaylı adres formu yoksa. // KALDIRILDI

  // Zorunlu DASK Bilgileri
  uavtNo: string; // UAVT Adres Kodu
  daskOldPolicyNumber: string; // Eski DASK Poliçe Numarası - YENİ EKLENDİ
  buildingType: PropertyStructure; // Enum değeri (Formik için)
  constructionYear: string | null; // DEĞİŞTİRİLDİ: string -> string | null
  // floorCount: string; // Bina toplam kat sayısı - DEĞİŞTİRİLDİ -> floorCountRange
  floorCountRange: DaskPropertyFloorCountRange; // YENİ EKLENDİ - floor.totalFloors için
  floorNumber: string; // Dairenin bulunduğu kat - floor.currentFloor için
  squareMeters: string;
  usageType: PropertyUtilizationStyle; // Enum değeri
  buildingMaterial: PropertyStructure; // Enum değeri
  riskZone: PropertyDamageStatus; // Enum değeri (Hasar Durumu)
  ownershipType: DaskPropertyOwnershipType; // YENİ EKLENDİ
}


const initialDaskFormData: DaskPropertyFormData = {
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
  daskOldPolicyNumber: '',
  buildingType: PropertyStructure.Unknown,
  constructionYear: null,
  floorCountRange: DaskPropertyFloorCountRange.Unknown,
  floorNumber: '',
  squareMeters: '',
  usageType: PropertyUtilizationStyle.Unknown,
  buildingMaterial: PropertyStructure.Unknown,
  riskZone: PropertyDamageStatus.Unknown,
  ownershipType: DaskPropertyOwnershipType.Unknown,
};

// Backend stringlerini Form enum/sayı değerlerine map'leyen fonksiyonlar (DASK için)
const mapDaskUsageTypeToForm = (backendUsageType?: string): PropertyUtilizationStyle => {
    if (backendUsageType === "HOUSE") return PropertyUtilizationStyle.House;
    if (backendUsageType === "BUSINESS") return PropertyUtilizationStyle.Business;
    return PropertyUtilizationStyle.Unknown; // veya bir varsayılan
};

const mapDaskBuildingMaterialToForm = (backendMaterial?: string): PropertyStructure => {
    if (backendMaterial === "STEEL_REINFORCED_CONCRETE") return PropertyStructure.SteelReinforcedConcrete;
    if (backendMaterial === "MASONRY") return PropertyStructure.Other;
    if (backendMaterial === "STEEL") return PropertyStructure.Other;
    if (backendMaterial === "WOOD") return PropertyStructure.Other;
    if (backendMaterial === "OTHER") return PropertyStructure.Other;
    return PropertyStructure.Unknown;
};

const mapDaskRiskZoneToForm = (backendRiskZone?: string): PropertyDamageStatus => {
    if (backendRiskZone === "NONE") return PropertyDamageStatus.None;
    if (backendRiskZone === "SLIGHTLY_DAMAGED") return PropertyDamageStatus.SlightlyDamaged;
    if (backendRiskZone === "MODERATELY_DAMAGED") return PropertyDamageStatus.ModeratelyDamaged;
    if (backendRiskZone === "SEVERELY_DAMAGED") return PropertyDamageStatus.SeverelyDamaged;
    return PropertyDamageStatus.None; // DASK için None daha uygun bir varsayılan olabilir
};

// DASK Kat Sayısı Aralığı'nı API Payload'ına dönüştüren fonksiyon
const mapDaskFloorCountRangeToPayload = (range: DaskPropertyFloorCountRange): { $type: "range"; min: number; max: number } | number | null => {
  switch (range) {
    case DaskPropertyFloorCountRange.Between1And3:
      return { $type: "range", min: 1, max: 3 };
    case DaskPropertyFloorCountRange.Between4And7:
      return { $type: "range", min: 4, max: 7 };
    case DaskPropertyFloorCountRange.Between8And18:
      return { $type: "range", min: 8, max: 18 };
    case DaskPropertyFloorCountRange.MoreThan19:
      return { $type: "range", min: 19, max: 99 }; // Max 99 varsayılan olarak ayarlandı
    default:
      return null; // veya API'nin bilinmeyen/varsayılan durum için beklediği değer
  }
};

// DASK Mülkiyet Tipini API string'ine dönüştüren fonksiyon
const mapDaskPropertyOwnershipTypeToBackendString = (value: DaskPropertyOwnershipType): string => {
  const mapping: Record<DaskPropertyOwnershipType, string> = {
    [DaskPropertyOwnershipType.Unknown]: "UNKNOWN", // API'nin beklediği varsayılan
    [DaskPropertyOwnershipType.Proprietor]: "PROPRIETOR",
    [DaskPropertyOwnershipType.Tenant]: "TENANT",
    [DaskPropertyOwnershipType.Other]: "OTHER",
  };
  return mapping[value] || "UNKNOWN";
};

// Form enum/sayı değerlerini Backend stringlerine map'leyen fonksiyonlar (DASK için)
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
    [PropertyDamageStatus.Unknown]: "NONE", // DASK için varsayılan
    [PropertyDamageStatus.None]: "NONE",
    [PropertyDamageStatus.SlightlyDamaged]: "SLIGHTLY_DAMAGED",
    [PropertyDamageStatus.ModeratelyDamaged]: "MODERATELY_DAMAGED",
    [PropertyDamageStatus.SeverelyDamaged]: "SEVERELY_DAMAGED",
  };
  return mapping[value] || "NONE";
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
  const { accessToken, customerId } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAddressLoading, setIsAddressLoading] = useState(false); // Adres yükleme için ayrı state
  const [isUavtLoading, setIsUavtLoading] = useState(false); // UAVT sorgulama için ayrı state
  const [isOldPolicyLoading, setIsOldPolicyLoading] = useState(false); // Eski poliçe sorgulama için ayrı state
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [selectedCity, setSelectedCity] = useState<LocationOption | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<LocationOption | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSeverity, setNotificationSeverity] = useState<'success' | 'error' | 'warning'>('success');
  const [error, setError] = useState<string | null>(null);
  const [propertyType, setPropertyType] = useState<'manual' | 'uavt'>('manual'); // UAVT sorgu durumunu takip et

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

  useEffect(() => {
    let isMounted = true;
    const checkMissingInfo = async () => {
      if (accessToken && isMounted) {
        // Check if PersonalInfoStep was just completed to prevent infinite loop
        const personalInfoCompleted = localStorage.getItem('daskPersonalInfoCompleted');
        if (personalInfoCompleted === 'true') {
          // Clear the flag and skip the check
          localStorage.removeItem('daskPersonalInfoCompleted');
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
      // Alt seviyeleri sıfırla
      setTowns([]);
      setSelectedTown(null);
      setNeighborhoods([]);
      setSelectedNeighborhood(null);
      setStreets([]);
      setSelectedStreet(null);
      setBuildings([]);
      setSelectedBuilding(null);
      setApartments([]);
      setSelectedApartment(null);
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_DISTRICTS(cityValue), { method: 'GET' });
      if (response.ok) {
          const data = await response.json();
            // Sıralama fonksiyonunu uygula
        const sortedData = sortLocationOptions(Array.isArray(data) ? data as LocationOption[] : []);
            setDistricts(sortedData);
        // Başarılı olduğunda field error'ı temizle
        if (formik && formik.setFieldError) {
          formik.setFieldError('districtReference', undefined);
        }
      } else { 
        const errorText = await response.text();
        setError(`İlçeler yüklenirken bir hata oluştu: ${errorText}`);
        setDistricts([]);
        // Input altında error göster
        if (formik && formik.setFieldError) {
          formik.setFieldError('districtReference', 'İlçe bilgileri yüklenemedi. Lütfen manuel girin.');
        }
        // Kullanıcıya toast mesajı göster
        setNotificationMessage('İlçe bilgileri yüklenemedi. Lütfen bilgileri manuel girin.');
        setNotificationSeverity('warning');
        setShowNotification(true);
      }
    } catch (e) {
      setError('İlçeler yüklenirken bir hata oluştu.');
      setDistricts([]);
      // Input altında error göster
      if (formik && formik.setFieldError) {
        formik.setFieldError('districtReference', 'İlçe kaydı bulunamadı. Lütfen manuel girin.');
      }
      // Kullanıcıya toast mesajı göster
      setNotificationMessage('İlçe bilgileri yüklenemedi. Lütfen bilgileri manuel girin.');
      setNotificationSeverity('warning');
      setShowNotification(true);
  } finally {
    setIsLoading(false);
  }
};

const fetchTowns = async (districtValue: string) => {
  if (!districtValue) {
    setTowns([]);
    setSelectedTown(null);
    setNeighborhoods([]);
    setSelectedNeighborhood(null);
    setStreets([]);
    setSelectedStreet(null);
    setBuildings([]);
    setSelectedBuilding(null);
    setApartments([]);
    setSelectedApartment(null);
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
      // Başarılı olduğunda field error'ı temizle
      if (formik && formik.setFieldError) {
        formik.setFieldError('townReference', undefined);
      }
    } else {
      const errorText = await response.text();
      setError(`Beldeler yüklenirken bir hata oluştu: ${errorText}`);
      setTowns([]);
      // Input altında error göster
      if (formik && formik.setFieldError) {
        formik.setFieldError('townReference', 'Belde bilgileri yüklenemedi. Lütfen manuel girin.');
      }
      // Kullanıcıya toast mesajı göster
      setNotificationMessage('Belde bilgileri yüklenemedi. Lütfen bilgileri manuel girin.');
      setNotificationSeverity('warning');
      setShowNotification(true);
    }
  } catch (e) {
    setError('Beldeler yüklenirken bir hata oluştu.');
    setTowns([]);
    // Input altında error göster
    if (formik && formik.setFieldError) {
      formik.setFieldError('townReference', 'Belde kaydı bulunamadı. Lütfen manuel girin.');
    }
    // Kullanıcıya toast mesajı göster
    setNotificationMessage('Belde bilgileri yüklenemedi. Lütfen bilgileri manuel girin.');
    setNotificationSeverity('warning');
    setShowNotification(true);
  } finally {
    setIsLoading(false);
  }
};

const fetchNeighborhoods = async (townValue: string) => {
  if (!townValue) {
    setNeighborhoods([]);
    setSelectedNeighborhood(null);
    setStreets([]);
    setSelectedStreet(null);
    setBuildings([]);
    setSelectedBuilding(null);
    setApartments([]);
    setSelectedApartment(null);
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
      // Başarılı olduğunda field error'ı temizle
      if (formik && formik.setFieldError) {
        formik.setFieldError('neighborhoodReference', undefined);
      }
    } else {
      const errorText = await response.text();
      setError(`Mahalleler yüklenirken bir hata oluştu: ${errorText}`);
      setNeighborhoods([]);
      // Input altında error göster
      if (formik && formik.setFieldError) {
        formik.setFieldError('neighborhoodReference', 'Mahalle bilgileri yüklenemedi. Lütfen manuel girin.');
      }
      // Kullanıcıya toast mesajı göster - Mahalle için özel mesaj
      setNotificationMessage('Mahalle bilgileri yüklenemedi. Lütfen bilgileri manuel girin.');
      setNotificationSeverity('warning');
      setShowNotification(true);
    }
  } catch (e) {
    setError('Mahalleler yüklenirken bir hata oluştu.');
    setNeighborhoods([]);
    // Input altında error göster
    if (formik && formik.setFieldError) {
      formik.setFieldError('neighborhoodReference', 'Mahalle kaydı bulunamadı. Lütfen manuel girin.');
    }
    // Kullanıcıya toast mesajı göster - Mahalle için özel mesaj
    setNotificationMessage('Mahalle bilgileri yüklenemedi. Lütfen bilgileri manuel girin.');
    setNotificationSeverity('warning');
    setShowNotification(true);
  } finally {
    setIsLoading(false);
  }
};

const fetchStreets = async (neighborhoodValue: string) => {
  if (!neighborhoodValue) {
    setStreets([]);
    setSelectedStreet(null);
    setBuildings([]);
    setSelectedBuilding(null);
    setApartments([]);
    setSelectedApartment(null);
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
      // Başarılı olduğunda field error'ı temizle
      if (formik && formik.setFieldError) {
        formik.setFieldError('streetReference', undefined);
      }
    } else {
      const errorText = await response.text();
      setError(`Sokaklar yüklenirken bir hata oluştu: ${errorText}`);
      setStreets([]);
      // Input altında error göster
      if (formik && formik.setFieldError) {
        formik.setFieldError('streetReference', 'Sokak bilgileri yüklenemedi. Lütfen manuel girin.');
      }
      // Kullanıcıya toast mesajı göster
      setNotificationMessage('Sokak bilgileri yüklenemedi. Lütfen bilgileri manuel girin.');
      setNotificationSeverity('warning');
      setShowNotification(true);
    }
  } catch (e) {
    setError('Sokaklar yüklenirken bir hata oluştu.');
    setStreets([]);
    // Input altında error göster
    if (formik && formik.setFieldError) {
      formik.setFieldError('streetReference', 'Sokak kaydı bulunamadı. Lütfen manuel girin.');
    }
    // Kullanıcıya toast mesajı göster
    setNotificationMessage('Sokak bilgileri yüklenemedi. Lütfen bilgileri manuel girin.');
    setNotificationSeverity('warning');
    setShowNotification(true);
  } finally {
    setIsLoading(false);
  }
};

const fetchBuildings = async (streetValue: string) => {
  if (!streetValue) {
    setBuildings([]);
    setSelectedBuilding(null);
    setApartments([]);
    setSelectedApartment(null);
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
      // Başarılı olduğunda field error'ı temizle
      if (formik && formik.setFieldError) {
        formik.setFieldError('buildingReference', undefined);
      }
    } else {
      const errorText = await response.text();
      setError(`Binalar yüklenirken bir hata oluştu: ${errorText}`);
      setBuildings([]);
      // Input altında error göster
      if (formik && formik.setFieldError) {
        formik.setFieldError('buildingReference', 'Bina bilgileri yüklenemedi. Lütfen manuel girin.');
      }
      // Kullanıcıya toast mesajı göster
      setNotificationMessage('Bina bilgileri yüklenemedi. Lütfen bilgileri manuel girin.');
      setNotificationSeverity('warning');
      setShowNotification(true);
    }
  } catch (e) {
    setError('Binalar yüklenirken bir hata oluştu.');
    setBuildings([]);
    // Input altında error göster
    if (formik && formik.setFieldError) {
      formik.setFieldError('buildingReference', 'Bina kaydı bulunamadı. Lütfen manuel girin.');
    }
    // Kullanıcıya toast mesajı göster
    setNotificationMessage('Bina bilgileri yüklenemedi. Lütfen bilgileri manuel girin.');
    setNotificationSeverity('warning');
    setShowNotification(true);
  } finally {
    setIsLoading(false);
  }
};

const fetchApartments = async (buildingValue: string) => {
  if (!buildingValue) {
    setApartments([]);
    setSelectedApartment(null);
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
      // Başarılı olduğunda field error'ı temizle
      if (formik && formik.setFieldError) {
        formik.setFieldError('apartmentReference', undefined);
      }
    } else {
      const errorText = await response.text();
      setError(`Daireler yüklenirken bir hata oluştu: ${errorText}`);
      setApartments([]);
      // Input altında error göster
      if (formik && formik.setFieldError) {
        formik.setFieldError('apartmentReference', 'Daire bilgileri yüklenemedi. Lütfen manuel girin.');
      }
      // Kullanıcıya toast mesajı göster
      setNotificationMessage('Daire bilgileri yüklenemedi. Lütfen bilgileri manuel girin.');
      setNotificationSeverity('warning');
      setShowNotification(true);
    }
  } catch (e) {
    setError('Daireler yüklenirken bir hata oluştu.');
    setApartments([]);
    // Input altında error göster
    if (formik && formik.setFieldError) {
      formik.setFieldError('apartmentReference', 'Daire kaydı bulunamadı. Lütfen manuel girin.');
    }
    // Kullanıcıya toast mesajı göster
    setNotificationMessage('Daire bilgileri yüklenemedi. Lütfen bilgileri manuel girin.');
    setNotificationSeverity('warning');
    setShowNotification(true);
  } finally {
    setIsLoading(false);
  }
};

  const formik = useFormik<DaskPropertyFormData>({
    initialValues: initialDaskFormData,
    validationSchema: yup.object({
      cityReference: yup.string().when('selectionType', {
        is: (value: string) => value === 'new' || value === 'renewal',
        then: (schema) => schema.required('İl seçimi zorunludur'),
        otherwise: (schema) => schema.notRequired(),
      }),
      districtReference: yup.string().when('selectionType', {
        is: (value: string) => value === 'new' || value === 'renewal',
        then: (schema) => schema.required('İlçe seçimi zorunludur'),
        otherwise: (schema) => schema.notRequired(),
      }),
      townReference: yup.string().optional(),
      neighborhoodReference: yup.string().optional(),
      streetReference: yup.string().optional(),
      buildingReference: yup.string().optional(),
      apartmentReference: yup.string().when('selectionType', {
        is: 'new' as const,
        then: (schema) => schema.required('Daire seçimi zorunludur. Bu, DASK poliçesi için UAVT adres kodunu belirler.'),
        otherwise: (schema) => schema.optional(),
      }),
      uavtNo: yup.string().when('selectionType', {
        is: (value: string) => value === 'new' || value === 'renewal',
        then: (schema) => schema
          .matches(/^[0-9]{10}$/, "UAVT Adres Kodu tam 10 rakam olmalıdır")
          .optional(),
        otherwise: (schema) => schema.notRequired(),
      }),
      daskOldPolicyNumber: yup.string().when('selectionType', {
        is: 'renewal' as const,
        then: (schema) => schema
          .required('Eski DASK Poliçe Numarası zorunludur')
          .matches(/^[0-9]{8}$/, 'DASK Poliçe Numarası tam 8 rakam olmalıdır'),
        otherwise: (schema) => schema.notRequired(),
      }),
      buildingType: yup.mixed<PropertyStructure>().when('selectionType', {
        is: (value: any) => ['new', 'renewal'].includes(value),
        then: (schema) => schema.oneOf(Object.values(PropertyStructure).filter(v => typeof v === 'number') as PropertyStructure[]).required('Bina tipi zorunludur').notOneOf([PropertyStructure.Unknown], 'Bina tipi seçilmelidir'),
        otherwise: (schema) => schema.optional().nullable() as yup.MixedSchema<PropertyStructure | undefined | null>,
      }),
      constructionYear: yup.string().when('selectionType', {
        is: (value: any) => ['new', 'renewal'].includes(value),
        then: (schema) => schema
          .required('Yapım yılı zorunludur')
          .matches(/^[0-9]{4}$/, 'Yapım yılı 4 rakam olmalıdır')
          .test('year-range', 'Yapım yılı 1900 ile güncel yıl arasında olmalıdır', function(value) {
            if (!value) return false;
            const year = parseInt(value);
            const currentYear = new Date().getFullYear();
            return year >= 1900 && year <= currentYear;
          }),
        otherwise: (schema) => schema.optional().nullable() as yup.StringSchema<string | undefined | null>,
      }),
      floorCountRange: yup.mixed<DaskPropertyFloorCountRange>().when('selectionType', {
        is: (value: any) => ['new', 'renewal'].includes(value),
        then: (schema) => schema.oneOf(Object.values(DaskPropertyFloorCountRange).filter(v => typeof v === 'number') as DaskPropertyFloorCountRange[]).required('Binanın kat sayısı aralığı zorunludur').notOneOf([DaskPropertyFloorCountRange.Unknown], 'Binanın kat sayısı aralığı seçilmelidir'),
        otherwise: (schema) => schema.optional().nullable() as yup.MixedSchema<DaskPropertyFloorCountRange | undefined | null>,
      }),
      floorNumber: yup.string().when(['selectionType', 'floorCountRange'], {
        is: (selectionType: any, floorCountRange: DaskPropertyFloorCountRange) => ['new', 'renewal'].includes(selectionType),
        then: (schema) => schema
          .required('Bulunduğu kat zorunludur')
          .matches(/^-?[0-9]+$/, "Geçerli bir kat numarası giriniz")
          .test('not-only-minus', 'Sadece "-" işareti geçerli değildir', value => value !== '-')
          .test('range', 'Kat numarası uygun aralıkta olmalıdır', function(value) {
            if (!value) return false;
            const floorNum = parseInt(value);
            const floorCountRange = this.parent.floorCountRange;
            
            // Alt limit her zaman -5
            if (floorNum < -5) return false;
            
            // Üst limit seçilen kat sayısı aralığına göre belirlenir
            let maxFloor = 150; // Default maksimum
            
            switch (floorCountRange) {
              case DaskPropertyFloorCountRange.Between1And3:
                maxFloor = 3;
                break;
              case DaskPropertyFloorCountRange.Between4And7:
                maxFloor = 7;
                break;
              case DaskPropertyFloorCountRange.Between8And18:
                maxFloor = 18;
                break;
              case DaskPropertyFloorCountRange.MoreThan19:
                maxFloor = 150;
                break;
              default:
                maxFloor = 150;
            }
            
            if (floorNum > maxFloor) {
              return this.createError({
                message: `Bulunduğu kat ${maxFloor}'dan fazla olamaz (Seçilen aralık: ${this.parent.floorCountRange === DaskPropertyFloorCountRange.Between1And3 ? '1-3' : 
                         this.parent.floorCountRange === DaskPropertyFloorCountRange.Between4And7 ? '4-7' :
                         this.parent.floorCountRange === DaskPropertyFloorCountRange.Between8And18 ? '8-18' : '19+'} kat)`
              });
            }
            
            return true;
          }),
        otherwise: (schema) => schema.optional().nullable() as yup.StringSchema<string | undefined | null>,
      }),
      squareMeters: yup.string().when('selectionType', {
        is: (value: any) => ['new', 'renewal'].includes(value),
        then: (schema) => schema
          .required('Metrekare zorunludur')
          .matches(/^[1-9][0-9]*$/, "Geçerli bir metrekare giriniz")
          .test('range', 'Konut metrekaresi 40-999 m² arasında olmalıdır', 
            value => !value || (parseInt(value) >= 40 && parseInt(value) <= 999)),
        otherwise: (schema) => schema.optional().nullable() as yup.StringSchema<string | undefined | null>,
      }),
      usageType: yup.mixed<PropertyUtilizationStyle>().when('selectionType', {
        is: (value: any) => ['new', 'renewal'].includes(value),
        then: (schema) => schema.oneOf(Object.values(PropertyUtilizationStyle).filter(v => typeof v === 'number') as PropertyUtilizationStyle[]).required('Kullanım amacı zorunludur').notOneOf([PropertyUtilizationStyle.Unknown], 'Kullanım amacı seçilmelidir'),
        otherwise: (schema) => schema.optional().nullable() as yup.MixedSchema<PropertyUtilizationStyle | undefined | null>,
      }),
      riskZone: yup.mixed<PropertyDamageStatus>().when('selectionType', {
        is: (value: any) => ['new', 'renewal'].includes(value),
        then: (schema) => schema.oneOf(Object.values(PropertyDamageStatus).filter(v => typeof v === 'number') as PropertyDamageStatus[]).required('Hasar durumu zorunludur').notOneOf([PropertyDamageStatus.Unknown], 'Hasar durumu seçilmelidir'),
        otherwise: (schema) => schema.optional().nullable() as yup.MixedSchema<PropertyDamageStatus | undefined | null>,
      }),
      ownershipType: yup.mixed<DaskPropertyOwnershipType>().when('selectionType', {
        is: (value: any) => ['new', 'renewal'].includes(value),
        then: (schema) => schema.oneOf(Object.values(DaskPropertyOwnershipType).filter(v => typeof v === 'number') as DaskPropertyOwnershipType[]).required('Mülkiyet tipi zorunludur').notOneOf([DaskPropertyOwnershipType.Unknown], 'Mülkiyet tipi seçilmelidir'),
        otherwise: (schema) => schema.optional().nullable() as yup.MixedSchema<DaskPropertyOwnershipType | undefined | null>,
      }),
      selectedPropertyId: yup.string().when('selectionType', {
        is: 'existing' as const,
        then: (schema) => schema.required('Lütfen kayıtlı bir konut seçin.'),
        otherwise: (schema) => schema.nullable(),
      })
    }),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values: DaskPropertyFormData) => {
      setIsLoading(true);
      setNotificationMessage('');

      // DASK step 2 event tetikleme
      pushToDataLayer({
        event: "dask_formsubmit",
        form_name: "dask_step2",
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
        } else if (values.selectionType === 'renewal') {
          // Yenileme için: Eski poliçe numarası ile sorgulama yapılmış olmalı
          if (!values.daskOldPolicyNumber) {
            setNotificationMessage('Lütfen eski DASK poliçe numarası giriniz.');
            setNotificationSeverity('error');
            setShowNotification(true);
            setIsLoading(false);
            return;
          }

          if (!values.uavtNo || !values.cityReference || !values.districtReference) {
            setNotificationMessage('Lütfen önce eski poliçe numaranızı sorgulayınız.');
            setNotificationSeverity('error');
            setShowNotification(true);
            setIsLoading(false);
            return;
          }

          // Kullanıcının mevcut varlıklarından bu UAVT koduna sahip olan var mı kontrol et
          let existingPropertyWithUavt = null;
          try {
            const propertiesResponse = await fetchWithAuth(`${API_ENDPOINTS.CUSTOMER_PROPERTIES(customerId)}?usage=DASK`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            
            if (propertiesResponse.ok) {
              const existingProperties = await propertiesResponse.json();
              if (Array.isArray(existingProperties)) {
                existingPropertyWithUavt = existingProperties.find(
                  (property: any) => property.address?.apartment?.value?.toString() === values.uavtNo
                );
              }
            }
          } catch (error) {
            console.warn('Mevcut varlıklar sorgulanırken hata:', error);
          }

          // Yenileme için property payload'ı oluştur
          const renewalPropertyPayload = {
            customerId: customerId,
            number: parseInt(values.uavtNo), // UAVT sorgulanmış olmalı
            daskOldPolicyNumber: values.daskOldPolicyNumber,
            squareMeter: parseInt(values.squareMeters!), 
            constructionYear: parseInt(values.constructionYear!), 
            lossPayeeClause: null,
            damageStatus: mapPropertyDamageStatusToBackendString(values.riskZone),
            floor: {
              totalFloors: mapDaskFloorCountRangeToPayload(values.floorCountRange),
              currentFloor: parseInt(values.floorNumber)
            },
            structure: mapPropertyStructureToBackendString(values.buildingType),
            utilizationStyle: mapPropertyUtilizationStyleToBackendString(values.usageType),
            ownershipType: mapDaskPropertyOwnershipTypeToBackendString(values.ownershipType),
          };

          let propertyResponse;
          
          if (existingPropertyWithUavt) {
            // Mevcut varlık varsa PUT ile güncelle
            propertyResponse = await fetchWithAuth(
              API_ENDPOINTS.CUSTOMER_PROPERTY_DETAIL(customerId, existingPropertyWithUavt.id), {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
              body: JSON.stringify(renewalPropertyPayload),
            });
          } else {
            // Mevcut varlık yoksa POST ile yeni oluştur
            propertyResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_PROPERTIES(customerId), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
              body: JSON.stringify(renewalPropertyPayload),
            });
          }

          if (!propertyResponse.ok) {
            const errorData = await propertyResponse.json().catch(() => ({ message: propertyResponse.statusText }));
            let errorMessage = 'DASK Yenileme konutu işlenemedi.';
            if (errorData.errors && Array.isArray(errorData.errors)) {
              errorMessage = errorData.errors[0];
            }
            setNotificationMessage(errorMessage);
            setNotificationSeverity('error');
            setShowNotification(true);
            setIsLoading(false);
            return;
          }
          
          if (existingPropertyWithUavt) {
            // Güncelleme yapıldı - PUT isteği 204 No Content döndürebilir
            propertyIdToSubmit = existingPropertyWithUavt.id;
          } else {
            // Yeni oluşturuldu - POST isteği response body döner
            const propertyResult = await propertyResponse.json();
            if (!propertyResult || !propertyResult.newPropertyId) {
              throw new Error('DASK Yenileme Konut ID alınamadı.');
            }
            propertyIdToSubmit = propertyResult.newPropertyId;
          }
        } else {
          // Yeni DASK konut kaydı
          const newDaskPropertyPayload = {
            customerId: customerId,
            number: parseInt(values.apartmentReference!), // DEĞİŞTİRİLDİ: UAVT artık seçilen dairenin referansından alınıyor
            daskOldPolicyNumber: values.daskOldPolicyNumber || null,
            squareMeter: parseInt(values.squareMeters!), 
            constructionYear: parseInt(values.constructionYear!), 
            lossPayeeClause: null,
            damageStatus: mapPropertyDamageStatusToBackendString(values.riskZone),
            floor: {
              totalFloors: mapDaskFloorCountRangeToPayload(values.floorCountRange),
              currentFloor: parseInt(values.floorNumber) // floorNumber zaten string ve required
            },
            structure: mapPropertyStructureToBackendString(values.buildingType), // buildingType'ı structure olarak gönder
            utilizationStyle: mapPropertyUtilizationStyleToBackendString(values.usageType),
            ownershipType: mapDaskPropertyOwnershipTypeToBackendString(values.ownershipType),
          };

          const propertyResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_PROPERTIES(customerId), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify(newDaskPropertyPayload),
          });

          if (!propertyResponse.ok) {
            const errorData = await propertyResponse.json().catch(() => ({ message: propertyResponse.statusText }));
            let errorMessage = 'DASK Konut oluşturulamadı.';
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
            throw new Error('DASK Konut ID alınamadı.');
          }
          propertyIdToSubmit = createdProperty.newPropertyId; // Güncellendi: createdProperty.id -> createdProperty.newPropertyId
        }
        
        if (!propertyIdToSubmit) {
          // Bu log, eğer bir şekilde propertyIdToSubmit hala boşsa durumu belirtir.
          throw new Error('Gönderilecek Konut ID bulunamadı.');
        }

        // DASK Proposal oluşturma
        const proposalPayload = {
          $type: 'dask',
          propertyId: propertyIdToSubmit,
          // customerId: customerId, // Eski kullanım
          insurerCustomerId: customerId, // API'nin beklediği alan adı
          insuredCustomerId: customerId, // API'nin beklediği alan adı
          channel: 'WEBSITE',
          coverageGroupIds: null,
          };

        const proposalResponse = await fetchWithAuth(API_ENDPOINTS.PROPOSALS_CREATE, {
            method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(proposalPayload),
        });


        if (!proposalResponse.ok) {
          const errorData = await proposalResponse.json().catch(() => ({ message: proposalResponse.statusText }));
          throw new Error(errorData.message || `DASK Teklifi oluşturulamadı (HTTP ${proposalResponse.status})`);
        }
        const proposalResult = await proposalResponse.json();

        if (proposalResult && proposalResult.proposalId) {
          localStorage.setItem('daskProposalId', proposalResult.proposalId);
          setNotificationMessage('DASK Teklifi başarıyla oluşturuldu! Teklifler sayfasına yönlendiriliyorsunuz...'); // Bildirim mesajı güncellendi
          setNotificationSeverity('success');
          setShowNotification(true);
          // onNext(); // Yönlendirme ile değiştirildi
          router.push(`/dask/quote-comparison/${proposalResult.proposalId}`); // Yönlendirme eklendi
        } else {
          throw new Error('DASK Teklif ID alınamadı.');
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
          const response = await fetchWithAuth(`${API_ENDPOINTS.CUSTOMER_PROPERTIES(customerId)}?usage=DASK`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (response.ok) {
            const data = await response.json();
            fetchedProperties = data as Property[];
            setProperties(fetchedProperties);
            propertiesFetchedSuccessfully = true;
          } else {
            const errorText = await response.text();
            setError(`DASK Konut bilgileri alınamadı: ${errorText}`);
            setProperties([]);
          }
        } catch (e) {
          setError('DASK Konut bilgileri alınırken bir hata oluştu.');
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
          const resetValues = { ...initialDaskFormData, selectionType: 'new' as const};
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
      formik.setValues({
        ...initialDaskFormData, // Formu varsayılanlarla başlat
        selectionType: 'existing',
        selectedPropertyId: propertyId,
        // API'den gelen 'selected' objesindeki alanları DaskPropertyFormData'ya map et
        cityReference: (typeof selected.address === 'object' && selected.address.city?.value) || '',
        districtReference: (typeof selected.address === 'object' && selected.address.district?.value) || '',
        townReference: (typeof selected.address === 'object' && selected.address.town?.value) || '',
        neighborhoodReference: (typeof selected.address === 'object' && selected.address.neighborhood?.value) || '',
        streetReference: (typeof selected.address === 'object' && selected.address.street?.value) || '',
        buildingReference: (typeof selected.address === 'object' && selected.address.building?.value) || '',
        apartmentReference: (typeof selected.address === 'object' && selected.address.apartment?.value) || '',
        buildingType: mapDaskBuildingMaterialToForm(selected.buildingMaterial), 
        constructionYear: selected.constructionYear?.toString() || '',
        floorCountRange: DaskPropertyFloorCountRange.Unknown,
        floorNumber: selected.floor?.currentFloor?.toString() || selected.floorNumber?.toString() || '',
        squareMeters: selected.squareMeters?.toString() || '',
        usageType: mapDaskUsageTypeToForm(selected.usageType), 
        buildingMaterial: mapDaskBuildingMaterialToForm(selected.buildingMaterial), 
        riskZone: mapDaskRiskZoneToForm(selected.riskZone), 
        ownershipType: DaskPropertyOwnershipType.Unknown,
        uavtNo: selected.number?.toString() || '',
        daskOldPolicyNumber: selected.daskOldPolicyNumber || '',
      });

      // Adres dropdown'larını senkronize et - Sadece state'leri set et, API çağrısı yapmadan
      if (typeof selected.address === 'object' && selected.address.city?.value) {
        setSelectedCity(selected.address.city);
        // İl için districts'i set et
          if (typeof selected.address === 'object' && selected.address.district?.value) {
            setSelectedDistrict(selected.address.district);
          setDistricts([selected.address.district]);
          
              if (typeof selected.address === 'object' && selected.address.town?.value) {
                setSelectedTown(selected.address.town);
            setTowns([selected.address.town]);
          } else {
            setSelectedTown(null); setTowns([]);
          }
          
                  if (typeof selected.address === 'object' && selected.address.neighborhood?.value) {
                    setSelectedNeighborhood(selected.address.neighborhood);
            setNeighborhoods([selected.address.neighborhood]);
          } else {
            setSelectedNeighborhood(null); setNeighborhoods([]);
          }
          
                      if (typeof selected.address === 'object' && selected.address.street?.value) {
                        setSelectedStreet(selected.address.street);
            setStreets([selected.address.street]);
          } else {
            setSelectedStreet(null); setStreets([]);
          }
          
                          if (typeof selected.address === 'object' && selected.address.building?.value) {
                            setSelectedBuilding(selected.address.building);
            setBuildings([selected.address.building]);
          } else {
            setSelectedBuilding(null); setBuildings([]);
          }
          
                              if (typeof selected.address === 'object' && selected.address.apartment?.value) {
                                setSelectedApartment(selected.address.apartment);
            setApartments([selected.address.apartment]);
        } else {
            setSelectedApartment(null); setApartments([]);
                              }
                          } else {
          setSelectedDistrict(null); setDistricts([]);
          setSelectedTown(null); setTowns([]);
          setSelectedNeighborhood(null); setNeighborhoods([]);
          setSelectedStreet(null); setStreets([]);
          setSelectedBuilding(null); setBuildings([]);
          setSelectedApartment(null); setApartments([]);
        }
      } else {
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

  const handleUAVTQueryDask = async (uavtNoValue: string) => {
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

    setIsUavtLoading(true);
    setPropertyType('uavt');
    
    // Adres alanlarını temizle (sorgu başlamadan önce)
    const clearAddressFields = () => {
      formik.setFieldValue('cityReference', '');
      formik.setFieldValue('districtReference', '');
      formik.setFieldValue('townReference', '');
      formik.setFieldValue('neighborhoodReference', '');
      formik.setFieldValue('streetReference', '');
      formik.setFieldValue('buildingReference', '');
      formik.setFieldValue('apartmentReference', '');
      
      setSelectedCity(null);
      setSelectedDistrict(null);
      setSelectedTown(null);
      setSelectedNeighborhood(null);
      setSelectedStreet(null);
      setSelectedBuilding(null);
      setSelectedApartment(null);
      
      setDistricts([]);
      setTowns([]);
      setNeighborhoods([]);
      setStreets([]);
      setBuildings([]);
      setApartments([]);
    };

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
        
        // API hata mesajını kontrol et
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessage = errorData.errors[0];
          if (errorMessage.includes('Mahalle koduna ait kayıt bulunamadı') || 
              errorMessage.includes('InsurGateway') ||
              errorMessage.includes('bilinmeyen bir nedenden dolayı başarısız')) {
            clearAddressFields();
            setNotificationMessage('UAVT ile bilgileri doldurma sırasında problem meydana geldi, lütfen adres bilgilerini manuel olarak giriniz.');
            setNotificationSeverity('error');
            setShowNotification(true);
            setPropertyType('manual');
            return;
          }
        }
        
        throw new Error(errorData.message || 'UAVT sorgulanırken bir hata oluştu.');
      }

      const data = await response.json();
      
      // UAVT kodu hatalı kontrolü - Boş değerler varsa
      const hasEmptyValues = !data.city?.value || 
                            !data.city?.text || 
                            !data.district?.value || 
                            !data.district?.text ||
                            data.city.value === "" ||
                            data.city.text === "" ||
                            data.district.value === "" ||
                            data.district.text === "";

      if (hasEmptyValues) {
        clearAddressFields();
        setNotificationMessage('Girdiğiniz UAVT kodu hatalı. Lütfen doğru UAVT kodunu giriniz veya adres bilgilerini manuel olarak doldurunuz.');
        setNotificationSeverity('error');
        setShowNotification(true);
        setPropertyType('manual');
        return;
      }
      
      // UAVT yanıtının geçerliliğini kontrol et - Daha kapsamlı kontrol
      const hasMinimumRequiredData = data && 
        data.city?.value && data.city?.text && 
        data.district?.value && data.district?.text;

      // Eğer temel adres bilgileri eksikse
      if (!hasMinimumRequiredData) {
        clearAddressFields();
        setNotificationMessage('UAVT ile bilgileri doldurma sırasında problem meydana geldi, lütfen adres bilgilerini manuel olarak giriniz.');
        setNotificationSeverity('error');
        setShowNotification(true);
        setPropertyType('manual');
        return;
      }

      // Mahalle, sokak, bina gibi detay bilgilerin eksik olup olmadığını kontrol et
      const hasDetailedAddress = data.neighborhood?.value && 
                                data.street?.value && 
                                data.building?.value && 
                                data.apartment?.value;

      if (!hasDetailedAddress) {
        clearAddressFields();
        setNotificationMessage('UAVT ile bilgileri doldurma sırasında problem meydana geldi, lütfen adres bilgilerini manuel olarak giriniz.');
        setNotificationSeverity('error');
        setShowNotification(true);
        setPropertyType('manual');
        return;
      }

      setNotificationMessage('Adres bilgileri başarıyla sorgulandı.');
      setNotificationSeverity('success');
      setShowNotification(true);

      // Form değerlerini güncelle - İyileştirilmiş error handling ile
      try {
        // UAVT'den gelen değerleri direkt set et - API çağrısı yapmadan
      formik.setFieldValue('cityReference', data.city.value || '');
      setSelectedCity(data.city || null);
        // İl listesinde yoksa ekle
        if (data.city && !cities.find(c => c.value === data.city.value)) {
          setCities(prev => [...prev, data.city].sort((a, b) => a.text.localeCompare(b.text, 'tr')));
        }

      formik.setFieldValue('districtReference', data.district.value || '');
      setSelectedDistrict(data.district || null);
        // İlçe listesini sadece UAVT'den gelen değerle doldur
        setDistricts([data.district]);

        if (data.town?.value) {
        formik.setFieldValue('townReference', data.town.value || '');
        setSelectedTown(data.town || null);
          setTowns([data.town]);
      } else { 
          formik.setFieldValue('townReference', '');
          setSelectedTown(null);
          setTowns([]);
        }

        if (data.neighborhood?.value) {
        formik.setFieldValue('neighborhoodReference', data.neighborhood.value || '');
        setSelectedNeighborhood(data.neighborhood || null);
          setNeighborhoods([data.neighborhood]);
      } else { 
          formik.setFieldValue('neighborhoodReference', '');
          setSelectedNeighborhood(null);
          setNeighborhoods([]);
        }

        if (data.street?.value) {
        formik.setFieldValue('streetReference', data.street.value || '');
        setSelectedStreet(data.street || null);
          setStreets([data.street]);
      } else { 
          formik.setFieldValue('streetReference', '');
          setSelectedStreet(null);
          setStreets([]);
        }

        if (data.building?.value) {
        formik.setFieldValue('buildingReference', data.building.value || '');
        setSelectedBuilding(data.building || null);
          setBuildings([data.building]);
      } else { 
          formik.setFieldValue('buildingReference', '');
          setSelectedBuilding(null);
          setBuildings([]);
      }

        if (data.apartment?.value) {
        formik.setFieldValue('apartmentReference', data.apartment.value || '');
        setSelectedApartment(data.apartment || null);
          setApartments([data.apartment]);
      } else {
          formik.setFieldValue('apartmentReference', '');
          setSelectedApartment(null);
          setApartments([]);
        }

      } catch (apiError) {
        // Adres değerleri set edilirken hata olursa
        setNotificationMessage('UAVT verilerini forma yüklerken sorun oluştu. Eksik alanları manuel doldurun.');
        setNotificationSeverity('warning');
        setShowNotification(true);
      }

    } catch (error) {
      clearAddressFields();
      let message = 'UAVT ile bilgileri doldurma sırasında problem meydana geldi, lütfen adres bilgilerini manuel olarak giriniz.';
      if (error instanceof Error) {
        message = error.message;
      }
      setNotificationMessage(message);
      setNotificationSeverity('error');
      setShowNotification(true);
      setPropertyType('manual');
    } finally {
      setIsUavtLoading(false);
    }
  };

  const handleDaskOldPolicyQuery = async (oldPolicyNumber: string) => {
    if (!oldPolicyNumber) {
      setNotificationMessage('Lütfen eski DASK poliçe numarası giriniz');
      setNotificationSeverity('error');
      setShowNotification(true);
      return;
    }

    // Poliçe numarası 8 haneli kontrolü
    if (!/^[0-9]{8}$/.test(oldPolicyNumber)) {
      setNotificationMessage('Eski DASK poliçe numarası tam 8 rakam olmalıdır');
      setNotificationSeverity('error');
      setShowNotification(true);
      return;
    }

    setIsOldPolicyLoading(true);
    setPropertyType('uavt'); // Eski poliçe de UAVT benzeri otomatik doldurma
    
    // Adres alanlarını temizle (sorgu başlamadan önce)
    const clearAddressFields = () => {
      formik.setFieldValue('cityReference', '');
      formik.setFieldValue('districtReference', '');
      formik.setFieldValue('townReference', '');
      formik.setFieldValue('neighborhoodReference', '');
      formik.setFieldValue('streetReference', '');
      formik.setFieldValue('buildingReference', '');
      formik.setFieldValue('apartmentReference', '');
      formik.setFieldValue('uavtNo', '');
      
      setSelectedCity(null);
      setSelectedDistrict(null);
      setSelectedTown(null);
      setSelectedNeighborhood(null);
      setSelectedStreet(null);
      setSelectedBuilding(null);
      setSelectedApartment(null);
      
      setDistricts([]);
      setTowns([]);
      setNeighborhoods([]);
      setStreets([]);
      setBuildings([]);
      setApartments([]);
    };

    try {
      const response = await fetchWithAuth(
        API_ENDPOINTS.PROPERTIES_QUERY_DASK_OLD_POLICY,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify({ daskOldPolicyNumber: parseInt(oldPolicyNumber, 10) }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        
        // API hata mesajını kontrol et
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessage = errorData.errors[0];
          // DASK Tramer hatası için özel mesaj
          if (errorMessage.includes('Dask Tramer') || 
              errorMessage.includes('kriterlere uygun kayıt bulunamadı') ||
              errorMessage.includes('Failed to get address by uavt code')) {
            clearAddressFields();
            setNotificationMessage('DASK poliçe numarası hatalı. Lütfen DASK poliçe numaranızı kontrol edip tekrar deneyiniz.');
            setNotificationSeverity('error');
            setShowNotification(true);
            setPropertyType('manual'); // Inputları disabled tut
            return;
          }
          if (errorMessage.includes('bulunamadı') || 
              errorMessage.includes('geçersiz') ||
              errorMessage.includes('başarısız')) {
            clearAddressFields();
            setNotificationMessage('Eski DASK poliçe numarası ile bilgileri doldurma sırasında problem meydana geldi, lütfen bilgileri manuel olarak giriniz.');
            setNotificationSeverity('error');
            setShowNotification(true);
            setPropertyType('manual');
            return;
          }
        }
        
        throw new Error(errorData.message || 'Eski DASK poliçesi sorgulanırken bir hata oluştu.');
      }

      const data = await response.json();
      
      // Yanıtın geçerliliğini kontrol et
      const hasValidData = data && 
        data.address?.city?.value && data.address?.city?.text && 
        data.address?.district?.value && data.address?.district?.text &&
        data.propertyNumber;

      if (!hasValidData) {
        clearAddressFields();
        setNotificationMessage('Eski DASK poliçe numarası hatalı veya eksik. Lütfen doğru poliçe numarasını giriniz.');
        setNotificationSeverity('error');
        setShowNotification(true);
        setPropertyType('manual');
        return;
      }

      setNotificationMessage('Eski DASK poliçe bilgileri başarıyla sorgulandı.');
      setNotificationSeverity('success');
      setShowNotification(true);

      // Floor count range'ini hesapla
      let floorCountRange = DaskPropertyFloorCountRange.Unknown;
      if (data.floor?.totalFloors) {
        if (typeof data.floor.totalFloors === 'object' && data.floor.totalFloors.min && data.floor.totalFloors.max) {
          const min = data.floor.totalFloors.min;
          const max = data.floor.totalFloors.max;
          if (min >= 1 && max <= 3) floorCountRange = DaskPropertyFloorCountRange.Between1And3;
          else if (min >= 4 && max <= 7) floorCountRange = DaskPropertyFloorCountRange.Between4And7;
          else if (min >= 8 && max <= 18) floorCountRange = DaskPropertyFloorCountRange.Between8And18;
          else if (min >= 19) floorCountRange = DaskPropertyFloorCountRange.MoreThan19;
        }
      }

      // Form değerlerini güncelle - API'den gelen değerleri direkt set et
      try {
        formik.setFieldValue('cityReference', data.address.city.value || '');
        setSelectedCity(data.address.city || null);
        if (data.address.city && !cities.find(c => c.value === data.address.city.value)) {
          setCities(prev => [...prev, data.address.city].sort((a, b) => a.text.localeCompare(b.text, 'tr')));
        }

        formik.setFieldValue('districtReference', data.address.district.value || '');
        setSelectedDistrict(data.address.district || null);
        setDistricts([data.address.district]);

        if (data.address.town?.value) {
          formik.setFieldValue('townReference', data.address.town.value || '');
          setSelectedTown(data.address.town || null);
          setTowns([data.address.town]);
        }

        if (data.address.neighborhood?.value) {
          formik.setFieldValue('neighborhoodReference', data.address.neighborhood.value || '');
          setSelectedNeighborhood(data.address.neighborhood || null);
          setNeighborhoods([data.address.neighborhood]);
        }

        if (data.address.street?.value) {
          formik.setFieldValue('streetReference', data.address.street.value || '');
          setSelectedStreet(data.address.street || null);
          setStreets([data.address.street]);
        }

        if (data.address.building?.value) {
          formik.setFieldValue('buildingReference', data.address.building.value || '');
          setSelectedBuilding(data.address.building || null);
          setBuildings([data.address.building]);
        }

        if (data.address.apartment?.value) {
          formik.setFieldValue('apartmentReference', data.address.apartment.value || '');
          setSelectedApartment(data.address.apartment || null);
          setApartments([data.address.apartment]);
        }

        // UAVT numarasını set et
        formik.setFieldValue('uavtNo', data.address.apartment?.value || '');

        // Diğer form alanlarını doldur
        formik.setFieldValue('constructionYear', data.constructionYear?.toString() || '');
        formik.setFieldValue('squareMeters', data.squareMeter?.toString() || '');
        formik.setFieldValue('floorCountRange', floorCountRange);
        formik.setFieldValue('floorNumber', data.floor?.currentFloor?.toString() || '');
        formik.setFieldValue('buildingType', mapDaskBuildingMaterialToForm(data.structure));
        formik.setFieldValue('buildingMaterial', mapDaskBuildingMaterialToForm(data.structure));
        formik.setFieldValue('usageType', mapDaskUsageTypeToForm(data.utilizationStyle));
        formik.setFieldValue('riskZone', mapDaskRiskZoneToForm(data.damageStatus));
        
        // Ownership type'ı map et
        let ownershipType = DaskPropertyOwnershipType.Unknown;
        if (data.ownershipType === "PROPRIETOR") ownershipType = DaskPropertyOwnershipType.Proprietor;
        else if (data.ownershipType === "TENANT") ownershipType = DaskPropertyOwnershipType.Tenant;
        formik.setFieldValue('ownershipType', ownershipType);

      } catch (mappingError) {
        setNotificationMessage('Eski DASK poliçe verilerini forma yüklerken sorun oluştu. Eksik alanları manuel doldurun.');
        setNotificationSeverity('warning');
        setShowNotification(true);
      }

    } catch (error) {
      clearAddressFields();
      let message = 'Eski DASK poliçe numarası ile bilgileri doldurma sırasında problem meydana geldi, lütfen bilgileri manuel olarak giriniz.';
      if (error instanceof Error) {
        message = error.message;
      }
      setNotificationMessage(message);
      setNotificationSeverity('error');
      setShowNotification(true);
      setPropertyType('manual');
    } finally {
      setIsOldPolicyLoading(false);
    }
  };

  // Zorunlu alanları kontrol eden fonksiyon - Real-time validation dahil
  const isFormValid = () => {
    if (formik.values.selectionType === 'existing') {
      return !!formik.values.selectedPropertyId && 
             !Boolean(formik.errors.selectedPropertyId);
    }

    if (formik.values.selectionType === 'renewal') {
      // Yenileme için: eski poliçe numarası gerekli, ve eğer sorgulama yapıldıysa temel alanlar dolu olmalı
      const hasOldPolicyNumber = !!formik.values.daskOldPolicyNumber && 
                                !Boolean(formik.errors.daskOldPolicyNumber);
      
      // Eğer sorgulama henüz yapılmamışsa sadece eski poliçe numarası yeterli
      if (propertyType === 'manual') {
        return hasOldPolicyNumber;
      }
      
      // Eğer sorgulama yapıldıysa TÜM alanların dolu olması gerekir
      const hasErrors = Object.keys(formik.errors).length > 0;
    const requiredFields = {
        daskOldPolicyNumber: formik.values.daskOldPolicyNumber,
      cityReference: formik.values.cityReference,
      districtReference: formik.values.districtReference,
        uavtNo: formik.values.uavtNo,
      squareMeters: formik.values.squareMeters,
      constructionYear: formik.values.constructionYear,
      floorNumber: formik.values.floorNumber,
      floorCountRange: formik.values.floorCountRange !== DaskPropertyFloorCountRange.Unknown,
      usageType: formik.values.usageType !== PropertyUtilizationStyle.Unknown,
      buildingType: formik.values.buildingType !== PropertyStructure.Unknown,
      riskZone: formik.values.riskZone !== PropertyDamageStatus.Unknown,
      ownershipType: formik.values.ownershipType !== DaskPropertyOwnershipType.Unknown,
    };

      const allRequiredFieldsFilled = Object.values(requiredFields).every(value => !!value);
      return allRequiredFieldsFilled && !hasErrors;
    }

    // Manuel giriş için gerçek zamanlı validation
    const hasErrors = Object.keys(formik.errors).length > 0;
    const requiredFields = {
      cityReference: formik.values.cityReference,
      districtReference: formik.values.districtReference,
      squareMeters: formik.values.squareMeters,
      constructionYear: formik.values.constructionYear,
      floorNumber: formik.values.floorNumber,
      floorCountRange: formik.values.floorCountRange !== DaskPropertyFloorCountRange.Unknown,
      usageType: formik.values.usageType !== PropertyUtilizationStyle.Unknown,
      buildingType: formik.values.buildingType !== PropertyStructure.Unknown,
      riskZone: formik.values.riskZone !== PropertyDamageStatus.Unknown,
      ownershipType: formik.values.ownershipType !== DaskPropertyOwnershipType.Unknown,
    };

    const allRequiredFieldsFilled = Object.values(requiredFields).every(value => !!value);
    return allRequiredFieldsFilled && !hasErrors;
  };

  // Input sanitization helper functions
  const sanitizeNumericInput = (value: string, maxLength: number = 10) => {
    return value.replace(/[^0-9]/g, '').slice(0, maxLength);
  };

  const sanitizeFloorInput = (value: string) => {
    // Sadece rakam ve başta bir - işaretine izin ver
    let cleaned = value.replace(/[^-0-9]/g, '');
    // - işareti sadece başta olabilir
    cleaned = cleaned.replace(/(?!^)-/g, '');
    // Maksimum 3 karakter (örn: -12, 123)
    cleaned = cleaned.slice(0, 3);
    return cleaned;
  };

  const sanitizeYearInput = (value: string) => {
    return value.replace(/[^0-9]/g, '').slice(0, 4);
  };

  // Form input değişimini yönet - Optimizasyonları uygula
  const handleChange = (name: string, value: string) => {
    // UAVT Adres Kodu için özel doğrulama
    if (name === 'uavtNo') {
      const sanitizedValue = sanitizeNumericInput(value, 10);
      formik.setFieldValue('uavtNo', sanitizedValue);
      formik.setFieldTouched('uavtNo', true);
      setTimeout(() => formik.validateField('uavtNo'), 0);
      return;
    }

    // Eski DASK Poliçe Numarası için özel doğrulama
    if (name === 'daskOldPolicyNumber') {
      const sanitizedValue = sanitizeNumericInput(value, 8); // 8 karakter ile sınırla
      formik.setFieldValue('daskOldPolicyNumber', sanitizedValue);
      formik.setFieldTouched('daskOldPolicyNumber', true);
      setTimeout(() => formik.validateField('daskOldPolicyNumber'), 0);
      return;
    }

    // Yapım yılı için özel doğrulama
    if (name === 'constructionYear') {
      const sanitizedValue = sanitizeYearInput(value);
      formik.setFieldValue('constructionYear', sanitizedValue);
      formik.setFieldTouched('constructionYear', true);
      setTimeout(() => formik.validateField('constructionYear'), 0);
      return;
    }

    // Metrekare için özel doğrulama
    if (name === 'squareMeters') {
      const sanitizedValue = sanitizeNumericInput(value, 3); // 3 karakter ile sınırla
      formik.setFieldValue('squareMeters', sanitizedValue);
      formik.setFieldTouched('squareMeters', true);
      setTimeout(() => formik.validateField('squareMeters'), 0);
      return;
    }

    // Kat numarası için özel doğrulama
    if (name === 'floorNumber') {
      const sanitizedValue = sanitizeFloorInput(value);
      formik.setFieldValue('floorNumber', sanitizedValue);
      formik.setFieldTouched('floorNumber', true);
      setTimeout(() => formik.validateField('floorNumber'), 0);
      return;
    }

    // Diğer alanlar için normal işlem
    formik.setFieldValue(name, value);
    formik.setFieldTouched(name, true);
    setTimeout(() => formik.validateField(name), 0);
  };

  // Input blur handler
  const handleBlur = (fieldName: string) => {
    formik.setFieldTouched(fieldName, true);
    formik.validateField(fieldName);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Konut Bilgileri
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {formik.values.selectionType === 'existing'
          ? 'Kayıtlı DASK poliçeniz için konut seçin veya yeni konut ekleyin'
          : 'DASK poliçeniz için konut bilgilerinizi giriniz'}
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
              const newSelectionType = e.target.value as 'existing' | 'new' | 'renewal';
              formik.setFieldValue('selectionType', newSelectionType);
              setError(null); // Seçim değişince genel hatayı temizle
              
              // onSelectionTypeChange prop'unu çağır
              if (onSelectionTypeChange) {
                onSelectionTypeChange(newSelectionType);
              }
              
              if (newSelectionType === 'new') {
                formik.setFieldValue('selectedPropertyId', null);
                // Yeni konut için formu sıfırla ama selectionType'ı koru
                const resetValues = { ...initialDaskFormData, selectionType: 'new' as const};
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
              } else if (newSelectionType === 'renewal') {
                formik.setFieldValue('selectedPropertyId', null);
                // Yenileme için formu sıfırla ama selectionType'ı koru
                const resetValues = { ...initialDaskFormData, selectionType: 'renewal' as const};
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
            <FormControlLabel 
              value="renewal" 
              control={<Radio />} 
              label="Yenileme" 
              disabled={isLoading} // Sadece yüklenirken disable
            />
          </RadioGroup>

          {formik.values.selectionType === 'existing' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
             
              {isLoading && properties.length === 0 ? ( // Yükleniyor göstergesi
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>
              ) : properties.length === 0 ? (
                <Typography>Kayıtlı DASK uyumlu konut bulunamadı. Lütfen yeni konut ekleyin.</Typography>
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
          ) : formik.values.selectionType === 'renewal' ? (
            // Yenileme Formu - Tam Form
            <Box component="form" onSubmit={formik.handleSubmit} noValidate>
              <Typography variant="h5" component="h2" gutterBottom align="center">
                DASK Poliçe Yenileme
              </Typography>

              <Typography variant="body2" color="text.secondary" paragraph align="center">
                Eski DASK poliçe numaranızı girerek bilgilerinizi otomatik doldurun ve gerekirse düzenleyin.
              </Typography>

              <Divider sx={{ my: 3 }} />

              {/* Eski Poliçe Sorgulama */}
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                Poliçe Bilgileri
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: -2, mb: 3 }}>
                Eski DASK poliçe numaranızı girerek bilgilerinizi otomatik olarak yükleyiniz.
              </Typography>

              <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mb: 3, flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                  <TextField
                    fullWidth
                    name="daskOldPolicyNumber"
                    label="Eski DASK Poliçe Numarası"
                    value={formik.values.daskOldPolicyNumber}
                    onChange={(e) => handleChange('daskOldPolicyNumber', e.target.value)}
                    onBlur={() => handleBlur('daskOldPolicyNumber')}
                    error={Boolean(formik.touched.daskOldPolicyNumber && formik.errors.daskOldPolicyNumber)}
                    helperText={
                      formik.touched.daskOldPolicyNumber && formik.errors.daskOldPolicyNumber 
                        ? formik.errors.daskOldPolicyNumber 
                        : 'Eski DASK poliçe numaranızı giriniz'
                    }
                    inputProps={{
                      maxLength: 15,
                      inputMode: 'numeric' as const,
                      pattern: '[0-9]*'
                    }}
                    placeholder="Örn: 1694562073"
                    required
                  />
                </Box>
                <Box sx={{ flex: 0.1, minWidth: { xs: '100%', sm: 'auto' }, mb: 0 }} style={{ minHeight: '56px' }}>
                  <Button
                    variant="contained"
                    onClick={() => handleDaskOldPolicyQuery(formik.values.daskOldPolicyNumber)}
                    disabled={!formik.values.daskOldPolicyNumber || 
                             !/^[0-9]{8}$/.test(formik.values.daskOldPolicyNumber) || 
                             isOldPolicyLoading || 
                             formik.isSubmitting}
                    fullWidth
                    style={{ minHeight: '56px' }}
                    startIcon={isOldPolicyLoading ? <CircularProgress size={16} color="inherit" /> : null}
                  >
                    {isOldPolicyLoading ? 'Sorgulanıyor...' : 'Sorgula'}
                  </Button>
                </Box>
              </Box>

              {/* Adres Bilgileri Başlığı */}
              <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
                Adres Bilgileri
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: -2, mb: 3 }}>
                {propertyType === 'manual' 
                  ? 'Önce eski poliçe numaranızı sorgulayınız.' 
                  : 'Bilgiler otomatik yüklendi. Gerekirse düzenleyebilirsiniz.'}
              </Typography>

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
                      if (newCityValue) {
                        fetchDistricts(newCityValue);
                      }
                    }}
                    options={cities.map(opt => ({ value: opt.value, label: opt.text }))}
                    disabled={true} // Adres alanları her zaman disabled
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
                      if (newDistrictValue) {
                        fetchTowns(newDistrictValue);
                      }
                    }}
                    options={districts.map(opt => ({ value: opt.value, label: opt.text }))}
                    disabled={true} // Adres alanları her zaman disabled
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
                    }}
                    options={towns.map(opt => ({ value: opt.value, label: opt.text }))}
                    disabled={true} // Adres alanları her zaman disabled
                    error={formik.touched.townReference && formik.errors.townReference ? formik.errors.townReference : undefined}
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
                    }}
                    options={neighborhoods.map(opt => ({ value: opt.value, label: opt.text }))}
                    disabled={true} // Adres alanları her zaman disabled
                    error={formik.touched.neighborhoodReference && formik.errors.neighborhoodReference ? formik.errors.neighborhoodReference : undefined}
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
                    }}
                    options={streets.map(opt => ({ value: opt.value, label: opt.text }))}
                    disabled={true} // Adres alanları her zaman disabled
                    error={formik.touched.streetReference && formik.errors.streetReference ? formik.errors.streetReference : undefined}
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
                    }}
                    options={buildings.map(opt => ({ value: opt.value, label: opt.text }))}
                    disabled={true} // Adres alanları her zaman disabled
                    error={formik.touched.buildingReference && formik.errors.buildingReference ? formik.errors.buildingReference : undefined}
                    searchable={true}
                  />
                </Box>
              </Box>

              {/* Row 2.3: Apartment, UAVT */}
              <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                  <CustomSelect
                    label="Daire No"
                    value={formik.values.apartmentReference || ''}
                    onChange={(newApartmentValue: string) => {
                      formik.setFieldValue('apartmentReference', newApartmentValue || '');
                      const apartmentOption = apartments.find(a => a.value === newApartmentValue);
                      setSelectedApartment(apartmentOption || null);
                      // UAVT'yi seçilen dairenin value'su ile otomatik doldur
                      if (apartmentOption?.value) {
                        formik.setFieldValue('uavtNo', apartmentOption.value);
                      }
                    }}
                    options={apartments.map(opt => ({ value: opt.value, label: opt.text }))}
                    disabled={true} // Adres alanları her zaman disabled
                    error={formik.touched.apartmentReference && formik.errors.apartmentReference ? formik.errors.apartmentReference : undefined}
                    searchable={true}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                  <TextField
                    fullWidth
                    name="uavtNo"
                    label="UAVT Adres Kodu"
                    value={formik.values.uavtNo}
                    disabled={true} // Her zaman disabled - sadece gösterim için
                    helperText="Bu alan eski poliçe sorgulaması ile otomatik doldurulur"
                  />
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
                    label="Yapı Tarzı Seçiniz" 
                    value={formik.values.buildingType.toString()}
                    onChange={(val: string) => {
                      formik.setFieldValue('buildingType', Number(val) || PropertyStructure.Unknown);
                      formik.setFieldTouched('buildingType', true);
                      setTimeout(() => formik.validateField('buildingType'), 0);
                    }}
                    options={structureTypeOptions.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                    disabled={propertyType === 'manual'}
                    error={formik.touched.buildingType && formik.errors.buildingType ? String(formik.errors.buildingType) : undefined}
                    required
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                  <TextField
                    fullWidth
                    name="constructionYear"
                    label="Yapım Yılı"
                    type="text"
                    value={formik.values.constructionYear || ''}
                    onChange={(e) => handleChange('constructionYear', e.target.value)}
                    onBlur={() => handleBlur('constructionYear')}
                    error={formik.touched.constructionYear && Boolean(formik.errors.constructionYear)}
                    helperText={formik.touched.constructionYear && formik.errors.constructionYear}
                    disabled={propertyType === 'manual'}
                    inputProps={{ maxLength: 4 }}
                    placeholder="Örn: 2020"
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
                    label="Kat Sayısı Seçiniz"
                    value={formik.values.floorCountRange.toString()}
                    onChange={(val: string) => {
                      const newRange = Number(val) || DaskPropertyFloorCountRange.Unknown;
                      formik.setFieldValue('floorCountRange', newRange);
                      // Kat sayısı aralığı değiştiğinde kat numarasını temizle
                      if (formik.values.floorNumber) {
                        formik.setFieldValue('floorNumber', '');
                      }
                    }}
                    options={daskFloorCountRangeOptions.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                    disabled={propertyType === 'manual'}
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
                    onChange={(e) => handleChange('floorNumber', e.target.value)}
                    onBlur={() => handleBlur('floorNumber')}
                    error={formik.touched.floorNumber && Boolean(formik.errors.floorNumber)}
                    helperText={formik.touched.floorNumber && formik.errors.floorNumber}
                    disabled={propertyType === 'manual'}
                    inputProps={{ maxLength: 3 }}
                    placeholder={
                      formik.values.floorCountRange === DaskPropertyFloorCountRange.Between1And3 ? "Örn: 1, 2, 3 veya -1" :
                      formik.values.floorCountRange === DaskPropertyFloorCountRange.Between4And7 ? "Örn: 1-7 veya -1" :
                      formik.values.floorCountRange === DaskPropertyFloorCountRange.Between8And18 ? "Örn: 1-18 veya -1" :
                      formik.values.floorCountRange === DaskPropertyFloorCountRange.MoreThan19 ? "Örn: 1-150 veya -1" :
                      "Önce kat sayısı aralığını seçin"
                    }
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
                    onChange={(e) => handleChange('squareMeters', e.target.value)}
                    onBlur={() => handleBlur('squareMeters')}
                    error={formik.touched.squareMeters && Boolean(formik.errors.squareMeters)}
                    helperText={
                      (formik.touched.squareMeters && formik.errors.squareMeters) 
                    }
                    disabled={formik.values.selectionType === 'renewal' && propertyType === 'manual'}
                    inputProps={{ maxLength: 3 }}
                    placeholder="Örn: 150"
                    required
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                  <CustomSelect
                    label="Kullanım Şekli Seçiniz"
                    value={formik.values.usageType.toString()}
                    onChange={(val: string) => formik.setFieldValue('usageType', Number(val) || PropertyUtilizationStyle.Unknown)}
                    options={utilizationStyleOptions.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                    disabled={formik.values.selectionType === 'renewal' && propertyType === 'manual'}
                    error={formik.touched.usageType && formik.errors.usageType ? formik.errors.usageType : undefined}
                    required
                  />
                </Box>
              </Box>

              {/* Bina Detayları Başlığı */}
              <Typography variant="h6" sx={{ mb: 2, mt: 4 }}>
                Bina Detayları
              </Typography>

              {/* Row 6: Damage Status, Ownership Type */}
              <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                  <CustomSelect
                    label="Hasar Durumu Seçiniz"
                    value={formik.values.riskZone.toString()}
                    onChange={(val: string) => formik.setFieldValue('riskZone', Number(val) || PropertyDamageStatus.None)}
                    options={damageStatusOptions.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                    disabled={formik.values.selectionType === 'renewal' && propertyType === 'manual'}
                    error={formik.touched.riskZone && formik.errors.riskZone ? formik.errors.riskZone : undefined}
                    required
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                  <CustomSelect
                    label="Mülkiyet Tipi Seçiniz"
                    value={formik.values.ownershipType.toString()}
                    onChange={(val: string) => formik.setFieldValue('ownershipType', Number(val) || DaskPropertyOwnershipType.Unknown)}
                    options={daskOwnershipTypeOptions.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                    disabled={formik.values.selectionType === 'renewal' && propertyType === 'manual'}
                    error={formik.touched.ownershipType && formik.errors.ownershipType ? String(formik.errors.ownershipType) : undefined}
                          required
                        />
            </Box>
              </Box>
            </Box>
          ) : ( // Yeni Konut Ekle Formu
            <Box component="form" onSubmit={formik.handleSubmit} noValidate>
              {/* Konut form yapısına benzer şekilde Box ve flex layout kullanılacak */}
              <Typography variant="h5" component="h2" gutterBottom align="center">
                    DASK Sigortası için Gayrimenkul Bilgileri
                  </Typography>

                  <Typography variant="body2" color="text.secondary" paragraph align="center">
                     DASK sigortası teklifiniz için gayrimenkul bilgilerinizi eksiksiz doldurunuz.
                  </Typography>

                  <Divider sx={{ my: 3 }} />
              {/* Adres Bilgileri Başlığı */}
              <Typography variant="h6" sx={{ mb: 2, mt: 2 }}>
                Adres Bilgileri
              </Typography>
               <Typography variant="body2" color="text.secondary" sx={{ mt: -2, mb: 3 }}>
                    UAVT numarasını biliyorsanız, adres bilgilerini otomatik doldurmak için sorgulayabilirsiniz.
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
                        onChange={(e) => handleChange('uavtNo', e.target.value)}
                        onBlur={() => handleBlur('uavtNo')}
                        error={Boolean(formik.touched.uavtNo && formik.errors.uavtNo)}
                        helperText={
                          formik.touched.uavtNo && formik.errors.uavtNo 
                            ? formik.errors.uavtNo 
                            : (!formik.values.uavtNo || formik.values.uavtNo.length === 0)
                              ? 'UAVT numarası 10 haneli olmalıdır'
                              : ' '
                        }
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
                        onClick={() => handleUAVTQueryDask(formik.values.uavtNo)}
                        disabled={!formik.values.uavtNo || 
                                 !/^\d{10}$/.test(formik.values.uavtNo) || 
                                 isUavtLoading || 
                                 formik.isSubmitting || 
                                 propertyType === 'uavt'}
                        fullWidth
                        style={{ minHeight: '56px' }}
                        startIcon={isUavtLoading ? <CircularProgress size={16} color="inherit" /> : null}
                      >
                        {isUavtLoading ? 'Sorgulanıyor...' : 'Sorgula'}
                      </Button>
                    </Box>
                  </Box>
                 
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
                      // Alt seviyeleri sıfırla
                      setSelectedTown(null); setTowns([]); formik.setFieldValue('townReference', '');
                      setSelectedNeighborhood(null); setNeighborhoods([]); formik.setFieldValue('neighborhoodReference', '');
                      setSelectedStreet(null); setStreets([]); formik.setFieldValue('streetReference', '');
                      setSelectedBuilding(null); setBuildings([]); formik.setFieldValue('buildingReference', '');
                      setSelectedApartment(null); setApartments([]); formik.setFieldValue('apartmentReference', '');
                      formik.setFieldValue('uavtNo', ''); // UAVT'yi de temizle
                      if (newCityValue) {
                        fetchDistricts(newCityValue);
                      }
                    }}
                    options={cities.map(opt => ({ value: opt.value, label: opt.text }))}
                    disabled={(formik.values.selectionType as string) === 'existing' || isLoading || cities.length === 0}
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
                      formik.setFieldValue('uavtNo', ''); // UAVT'yi de temizle
                      if (newDistrictValue) {
                        fetchTowns(newDistrictValue);
                      }
                    }}
                    options={districts.map(opt => ({ value: opt.value, label: opt.text }))}
                    disabled={(formik.values.selectionType as string) === 'existing' || isLoading || !formik.values.cityReference || districts.length === 0}
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
                      // Alt seviyeleri sıfırla
                      setSelectedNeighborhood(null); setNeighborhoods([]); formik.setFieldValue('neighborhoodReference', '');
                      setSelectedStreet(null); setStreets([]); formik.setFieldValue('streetReference', '');
                      setSelectedBuilding(null); setBuildings([]); formik.setFieldValue('buildingReference', '');
                      setSelectedApartment(null); setApartments([]); formik.setFieldValue('apartmentReference', '');
                      formik.setFieldValue('uavtNo', ''); // UAVT'yi de temizle
                      if (newTownValue) {
                        fetchNeighborhoods(newTownValue);
                      }
                    }}
                    options={towns.map(opt => ({ value: opt.value, label: opt.text }))}
                    disabled={(formik.values.selectionType as string) === 'existing' || isLoading || !formik.values.districtReference}
                    error={formik.touched.townReference && formik.errors.townReference ? formik.errors.townReference : undefined}
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
                      // Alt seviyeleri sıfırla
                      setSelectedStreet(null); setStreets([]); formik.setFieldValue('streetReference', '');
                      setSelectedBuilding(null); setBuildings([]); formik.setFieldValue('buildingReference', '');
                      setSelectedApartment(null); setApartments([]); formik.setFieldValue('apartmentReference', '');
                      formik.setFieldValue('uavtNo', ''); // UAVT'yi de temizle
                      if (newNeighborhoodValue) {
                        fetchStreets(newNeighborhoodValue);
                      }
                    }}
                    options={neighborhoods.map(opt => ({ value: opt.value, label: opt.text }))}
                    disabled={(formik.values.selectionType as string) === 'existing' || isLoading || !formik.values.townReference}
                    error={formik.touched.neighborhoodReference && formik.errors.neighborhoodReference ? formik.errors.neighborhoodReference : undefined}
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
                      // Alt seviyeleri sıfırla
                      setSelectedBuilding(null); setBuildings([]); formik.setFieldValue('buildingReference', '');
                      setSelectedApartment(null); setApartments([]); formik.setFieldValue('apartmentReference', '');
                      formik.setFieldValue('uavtNo', ''); // UAVT'yi de temizle
                      if (newStreetValue) {
                        fetchBuildings(newStreetValue);
                      }
                    }}
                    options={streets.map(opt => ({ value: opt.value, label: opt.text }))}
                    disabled={(formik.values.selectionType as string) === 'existing' || isLoading || !formik.values.neighborhoodReference}
                    error={formik.touched.streetReference && formik.errors.streetReference ? formik.errors.streetReference : undefined}
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
                      // Alt seviyeyi sıfırla
                      setSelectedApartment(null); setApartments([]); formik.setFieldValue('apartmentReference', '');
                      formik.setFieldValue('uavtNo', ''); // UAVT'yi de temizle
                      if (newBuildingValue) {
                        fetchApartments(newBuildingValue);
                      }
                    }}
                    options={buildings.map(opt => ({ value: opt.value, label: opt.text }))}
                    disabled={(formik.values.selectionType as string) === 'existing' || isLoading || !formik.values.streetReference}
                    error={formik.touched.buildingReference && formik.errors.buildingReference ? formik.errors.buildingReference : undefined}
                    searchable={true}
                  />
                </Box>
              </Box>

              {/* Row 2.3: Sadece Apartment - UAVT inputu kaldırıldı */}
              <Box sx={{ display: 'flex', gap: { xs: 2, sm: 3 }, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                  <CustomSelect
                    label="Daire No"
                    value={formik.values.apartmentReference || ''}
                    onChange={(newApartmentValue: string) => {
                      formik.setFieldValue('apartmentReference', newApartmentValue || '');
                      const apartmentOption = apartments.find(a => a.value === newApartmentValue);
                      setSelectedApartment(apartmentOption || null);
                      // UAVT'yi seçilen dairenin value'su ile otomatik doldur
                      if (apartmentOption?.value) {
                        formik.setFieldValue('uavtNo', apartmentOption.value);
                      }
                    }}
                    options={apartments.map(opt => ({ value: opt.value, label: opt.text }))}
                    disabled={(formik.values.selectionType as string) === 'existing' || isLoading || !formik.values.buildingReference}
                    error={formik.touched.apartmentReference && formik.errors.apartmentReference ? formik.errors.apartmentReference : undefined}
                    required
                    searchable={true}
                  />
                </Box>
                {/* Boş alan - daire no'yu yarım genişlikte tutmak için */}
                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                  {/* Boş alan */}
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
                    label="Yapı Tarzı Seçiniz" 
                    value={formik.values.buildingType.toString()}
                    onChange={(val: string) => {
                      formik.setFieldValue('buildingType', Number(val) || PropertyStructure.Unknown);
                      formik.setFieldTouched('buildingType', true);
                      setTimeout(() => formik.validateField('buildingType'), 0);
                    }}
                    options={structureTypeOptions.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                    disabled={(formik.values.selectionType as any) === 'renewal' && propertyType === 'manual'}
                    error={formik.touched.buildingType && formik.errors.buildingType ? String(formik.errors.buildingType) : undefined}
                        required
                    />
                </Box>
                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                <TextField
                  fullWidth
                  name="constructionYear"
                  label="Yapım Yılı"
                    type="text"
                    value={formik.values.constructionYear || ''}
                    onChange={(e) => handleChange('constructionYear', e.target.value)}
                    onBlur={() => handleBlur('constructionYear')}
                  error={formik.touched.constructionYear && Boolean(formik.errors.constructionYear)}
                  helperText={formik.touched.constructionYear && formik.errors.constructionYear}
                    disabled={(formik.values.selectionType as any) === 'renewal' && propertyType === 'manual'}
                    inputProps={{ maxLength: 4 }}
                    placeholder="Örn: 2020"
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
                    label="Kat Sayısı Seçiniz"
                    value={formik.values.floorCountRange.toString()}
                    onChange={(val: string) => {
                      const newRange = Number(val) || DaskPropertyFloorCountRange.Unknown;
                      formik.setFieldValue('floorCountRange', newRange);
                      // Kat sayısı aralığı değiştiğinde kat numarasını temizle
                      if (formik.values.floorNumber) {
                        formik.setFieldValue('floorNumber', '');
                      }
                    }}
                    options={daskFloorCountRangeOptions.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                    disabled={(formik.values.selectionType as any) === 'renewal' && propertyType === 'manual'}
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
                    onChange={(e) => handleChange('floorNumber', e.target.value)}
                    onBlur={() => handleBlur('floorNumber')}
                  error={formik.touched.floorNumber && Boolean(formik.errors.floorNumber)}
                  helperText={formik.touched.floorNumber && formik.errors.floorNumber}
                    disabled={(formik.values.selectionType as any) === 'renewal' && propertyType === 'manual'}
                    inputProps={{ maxLength: 3 }}
                    placeholder={
                      formik.values.floorCountRange === DaskPropertyFloorCountRange.Between1And3 ? "Örn: 1, 2, 3 veya -1" :
                      formik.values.floorCountRange === DaskPropertyFloorCountRange.Between4And7 ? "Örn: 1-7 veya -1" :
                      formik.values.floorCountRange === DaskPropertyFloorCountRange.Between8And18 ? "Örn: 1-18 veya -1" :
                      formik.values.floorCountRange === DaskPropertyFloorCountRange.MoreThan19 ? "Örn: 1-150 veya -1" :
                      "Önce kat sayısı aralığını seçin"
                    }
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
                    onChange={(e) => handleChange('squareMeters', e.target.value)}
                    onBlur={() => handleBlur('squareMeters')}
                    error={formik.touched.squareMeters && Boolean(formik.errors.squareMeters)}
                    helperText={
                      (formik.touched.squareMeters && formik.errors.squareMeters) 
                    }
                    disabled={(formik.values.selectionType as any) === 'renewal' && propertyType === 'manual'}
                    inputProps={{ maxLength: 3 }}
                    placeholder="Örn: 150"
                    required
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                  <CustomSelect
                    label="Kullanım Şekli Seçiniz"
                    value={formik.values.usageType.toString()}
                    onChange={(val: string) => formik.setFieldValue('usageType', Number(val) || PropertyUtilizationStyle.Unknown)}
                    options={utilizationStyleOptions.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                    disabled={(formik.values.selectionType as any) === 'renewal' && propertyType === 'manual'}
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
                    label="Hasar Durumu Seçiniz"
                    value={formik.values.riskZone.toString()}
                    onChange={(val: string) => formik.setFieldValue('riskZone', Number(val) || PropertyDamageStatus.None)}
                    options={damageStatusOptions.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                    disabled={(formik.values.selectionType as any) === 'renewal' && propertyType === 'manual'}
                    error={formik.touched.riskZone && formik.errors.riskZone ? formik.errors.riskZone : undefined}
                    required
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 'auto' } }}>
                  <CustomSelect
                    label="Mülkiyet Tipi Seçiniz"
                    value={formik.values.ownershipType.toString()}
                    onChange={(val: string) => formik.setFieldValue('ownershipType', Number(val) || DaskPropertyOwnershipType.Unknown)}
                    options={daskOwnershipTypeOptions.map(opt => ({ value: opt.value.toString(), label: opt.label }))}
                    disabled={(formik.values.selectionType as any) === 'renewal' && propertyType === 'manual'}
                    error={formik.touched.ownershipType && formik.errors.ownershipType ? String(formik.errors.ownershipType) : undefined}
                          required
                        />
            </Box>
              </Box>

            

            </Box> /* Form Box sonu */
          )}

          {/* Logları buraya ekleyelim */}
          {( () => {
            const isDisabled = isLoading || 
                             formik.isSubmitting || 
                             (formik.values.selectionType === 'existing' && !formik.values.selectedPropertyId) ||
                             (formik.values.selectionType === 'new' && !isFormValid()) ||
                             (formik.values.selectionType === 'renewal' && !isFormValid());
       
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
                (formik.values.selectionType === 'new' && !isFormValid()) ||
                (formik.values.selectionType === 'renewal' && !isFormValid())
              }
              sx={{
                minWidth: 200,
                height: 48,
                borderRadius: 2,
                ml: 'auto',
                textTransform: 'none',
              }}
            >
              {formik.isSubmitting ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                formik.values.selectionType === 'existing' ? 'Teklif Al' :
                formik.values.selectionType === 'renewal' ? 'Yenile' : 
                'Devam Et'
              )}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}