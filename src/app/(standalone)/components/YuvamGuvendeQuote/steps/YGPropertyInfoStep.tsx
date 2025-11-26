"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth, CustomerProfile } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import YGInput from '../common/YGInput';
import YGSelect from '../common/YGSelect';
import YGButton from '../common/YGButton';

// Hardcoded agent ID for standalone YuvamGuvende page
const AGENT_ID = '019639c4-0fcc-78c7-9ed7-864e96b86e4c';

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

// Enums
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

enum KonutPropertyFloorCountRange {
  Unknown = 0,
  Between1And3 = 1,
  Between4And7 = 2,
  Between8And18 = 3,
  MoreThan19 = 4,
}

enum KonutPropertyOwnershipType {
  Unknown = 0,
  Proprietor = 1,
  Tenant = 2,
  Other = 3,
}

// Options removed - using default inflation value

const KonutFloorCountRangeOptions = [
  { value: KonutPropertyFloorCountRange.Between1And3, label: '1-3' },
  { value: KonutPropertyFloorCountRange.Between4And7, label: '4-7' },
  { value: KonutPropertyFloorCountRange.Between8And18, label: '8-18' },
  { value: KonutPropertyFloorCountRange.MoreThan19, label: '> 18' },
];

const KonutOwnershipTypeOptions = [
  { value: KonutPropertyOwnershipType.Proprietor, label: 'Mal Sahibi' },
  { value: KonutPropertyOwnershipType.Tenant, label: 'Kiracı' },
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

// Interfaces
interface YGPropertyInfoStepProps {
  onNext: () => void;
  onBack: () => void;
}

interface LocationOption {
  value: string;
  text: string;
}

interface AddressObjectForProperty {
  city: LocationOption;
  district: LocationOption;
  town?: LocationOption;
  neighborhood?: LocationOption;
  street?: LocationOption;
  building?: LocationOption;
  apartment?: LocationOption;
}

interface Property {
  id: string;
  number?: number;
  address: AddressObjectForProperty | string;
  buildingType: string;
  constructionYear: number;
  floorCount: number;
  floorNumber: number;
  squareMeters: number;
  usageType: string;
  buildingMaterial: string;
  riskZone: string;
  customerId?: string;
  floor?: {
    totalFloors?: number | null | { $type?: string; min?: number; max?: number };
    currentFloor?: number | null;
  };
  ownershipType?: string;
}

interface KonutPropertyFormData {
  selectionType: 'existing' | 'new';
  selectedPropertyId: string | null;
  cityReference: string;
  districtReference: string;
  townReference?: string;
  neighborhoodReference?: string;
  streetReference?: string;
  buildingReference?: string;
  apartmentReference?: string;
  buildingType: PropertyStructure;
  constructionYear: string | null;
  floorCountRange: KonutPropertyFloorCountRange;
  floorNumber: string;
  squareMeters: string;
  usageType: PropertyUtilizationStyle;
  buildingMaterial: PropertyStructure;
  riskZone: PropertyDamageStatus;
  ownershipType: KonutPropertyOwnershipType;
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
  buildingType: PropertyStructure.SteelReinforcedConcrete, // Çelik betonarme
  constructionYear: '1998', // Bina inşa yılı: 1998
  floorCountRange: KonutPropertyFloorCountRange.Between8And18, // Kat: 8-18
  floorNumber: '5', // Kaçıncı kat: 5
  squareMeters: '100', // Metre kare: 100
  usageType: PropertyUtilizationStyle.House, // Kullanım şekli: konut
  buildingMaterial: PropertyStructure.SteelReinforcedConcrete, // Yapı tarzı: Çelik betonarme
  riskZone: PropertyDamageStatus.None, // Hasar durumu: Hasarsız
  ownershipType: KonutPropertyOwnershipType.Tenant, // Mülkiyet tipi: Kiracı
};

// Mapping functions
const mapKonutUsageTypeToForm = (backendUsageType?: string): PropertyUtilizationStyle => {
  if (backendUsageType === "HOUSE") return PropertyUtilizationStyle.House;
  if (backendUsageType === "BUSINESS") return PropertyUtilizationStyle.Business;
  return PropertyUtilizationStyle.Unknown;
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
  return PropertyDamageStatus.None;
};

const mapKonutFloorCountRangeToPayload = (range: KonutPropertyFloorCountRange): { $type: "range"; min: number; max: number } | number | null => {
  switch (range) {
    case KonutPropertyFloorCountRange.Between1And3:
      return { $type: "range", min: 1, max: 3 };
    case KonutPropertyFloorCountRange.Between4And7:
      return { $type: "range", min: 4, max: 7 };
    case KonutPropertyFloorCountRange.Between8And18:
      return { $type: "range", min: 8, max: 18 };
    case KonutPropertyFloorCountRange.MoreThan19:
      return { $type: "range", min: 19, max: 99 };
    default:
      return null;
  }
};

const mapKonutPropertyOwnershipTypeToBackendString = (value: KonutPropertyOwnershipType): string => {
  const mapping: Record<KonutPropertyOwnershipType, string> = {
    [KonutPropertyOwnershipType.Unknown]: "UNKNOWN",
    [KonutPropertyOwnershipType.Proprietor]: "PROPRIETOR",
    [KonutPropertyOwnershipType.Tenant]: "TENANT",
    [KonutPropertyOwnershipType.Other]: "OTHER",
  };
  return mapping[value] || "UNKNOWN";
};

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
    [PropertyUtilizationStyle.Unknown]: "OTHER",
    [PropertyUtilizationStyle.House]: "HOUSE",
    [PropertyUtilizationStyle.Business]: "BUSINESS",
    [PropertyUtilizationStyle.Other]: "OTHER",
  };
  return mapping[value] || "OTHER";
};

const mapPropertyDamageStatusToBackendString = (value: PropertyDamageStatus): string => {
  const mapping: Record<PropertyDamageStatus, string> = {
    [PropertyDamageStatus.Unknown]: "NONE",
    [PropertyDamageStatus.None]: "NONE",
    [PropertyDamageStatus.SlightlyDamaged]: "SLIGHTLY_DAMAGED",
    [PropertyDamageStatus.ModeratelyDamaged]: "MODERATELY_DAMAGED",
    [PropertyDamageStatus.SeverelyDamaged]: "SEVERELY_DAMAGED",
  };
  return mapping[value] || "NONE";
};

const sortLocationOptions = (options: LocationOption[]): LocationOption[] => {
  const alphabetic = options.filter(opt => isNaN(Number(opt.text.charAt(0))));
  const numeric = options.filter(opt => !isNaN(Number(opt.text.charAt(0))));
  const sortedAlphabetic = alphabetic.sort((a, b) => a.text.localeCompare(b.text, 'tr-TR'));
  const sortedNumeric = numeric.sort((a, b) => a.text.localeCompare(b.text, 'tr-TR'));
  return [...sortedAlphabetic, ...sortedNumeric];
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

export default function YGPropertyInfoStep({ onNext, onBack }: YGPropertyInfoStepProps) {
  const { customerId: storeCustomerId, accessToken, setCustomerId } = useAuthStore();
  const [properties, setProperties] = useState<Property[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSeverity, setNotificationSeverity] = useState<'success' | 'error'>('success');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingProposal, setIsSubmittingProposal] = useState(false);
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [agencyConfig, setAgencyConfig] = useState<any>(null);

  // Address states
  const [cities, setCities] = useState<LocationOption[]>([]);
  const [districts, setDistricts] = useState<LocationOption[]>([]);
  const [towns, setTowns] = useState<LocationOption[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<LocationOption[]>([]);
  const [streets, setStreets] = useState<LocationOption[]>([]);
  const [buildings, setBuildings] = useState<LocationOption[]>([]);
  const [apartments, setApartments] = useState<LocationOption[]>([]);

  const [selectedCity, setSelectedCity] = useState<LocationOption | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<LocationOption | null>(null);
  const [selectedTown, setSelectedTown] = useState<LocationOption | null>(null);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<LocationOption | null>(null);
  const [selectedStreet, setSelectedStreet] = useState<LocationOption | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<LocationOption | null>(null);
  const [selectedApartment, setSelectedApartment] = useState<LocationOption | null>(null);

  // Get customerId from store, /me API, or localStorage
  const getCustomerId = async (): Promise<string | null> => {
    // Önce store'dan kontrol et
    if (storeCustomerId) {
      return storeCustomerId;
    }
    
    // Eğer accessToken varsa /me API'sinden al
    if (accessToken) {
      try {
        const meResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
        if (meResponse.ok) {
          const meData: CustomerProfile = await meResponse.json();
          if (meData.id) {
            setCustomerId(meData.id);
            localStorage.setItem('proposalIdForKonut', meData.id);
            return meData.id;
          }
        }
      } catch (e) {
        // Ignore, devam et
      }
    }

    // Try to get from localStorage
    const proposalIdForKonut = localStorage.getItem('proposalIdForKonut');
    if (proposalIdForKonut) {
      return proposalIdForKonut;
    }
    
    // Try to get from auth-storage
    try {
      const authStorageItem = localStorage.getItem('auth-storage');
      if (authStorageItem) {
        const authState = JSON.parse(authStorageItem).state;
        return authState?.customerId || null;
      }
    } catch (e) {
      // Ignore
    }
    return null;
  };

  // Helper function to show notification with auto-close
  const showNotificationAutoClose = (message: string, severity: 'success' | 'error') => {
    // Clear any existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    
    setNotificationMessage(message);
    setNotificationSeverity(severity);
    setShowNotification(true);
    
    // Auto-close after 3 seconds
    notificationTimeoutRef.current = setTimeout(() => {
      setShowNotification(false);
      setNotificationMessage('');
    }, 3000);
  };

  // Load agency config
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/defaultAgencyConfig.json', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          credentials: 'same-origin'
        });

        if (response.ok) {
          const data = await response.json();
          setAgencyConfig(data);
        }
      } catch (err) {
        console.warn('Config yüklenemedi:', err);
      }
    };

    fetchConfig();
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  const getCoverageGroupIds = (branch: string): string[] | null => {
    if (!agencyConfig?.coverageGroupIds) {
      return null;
    }

    const coverageIds = agencyConfig.coverageGroupIds[branch as keyof typeof agencyConfig.coverageGroupIds];
    return coverageIds && coverageIds.length > 0 ? coverageIds : null;
  };

  // Fetch functions for address hierarchy
  const fetchDistricts = async (cityValue: string) => {
    if (!cityValue) {
      setDistricts([]);
      setSelectedDistrict(null);
      formik.setFieldValue('districtReference', '');
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
        const data = await response.json();
        if (Array.isArray(data)) {
          const sortedData = sortLocationOptions(data as LocationOption[]);
          setDistricts(sortedData);
        }
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
        const sortedData = sortLocationOptions(Array.isArray(data) ? data as LocationOption[] : []);
        setTowns(sortedData);
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
        const sortedData = sortLocationOptions(Array.isArray(data) ? data as LocationOption[] : []);
        setNeighborhoods(sortedData);
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
        const sortedData = sortLocationOptions(Array.isArray(data) ? data as LocationOption[] : []);
        setStreets(sortedData);
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
        const sortedData = sortLocationOptions(Array.isArray(data) ? data as LocationOption[] : []);
        setBuildings(sortedData);
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
        const sortedData = sortLocationOptions(Array.isArray(data) ? data as LocationOption[] : []);
        setApartments(sortedData);
      }
    } catch (e) {
      setError('Daireler yüklenirken bir hata oluştu.');
      setApartments([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Formik setup continues in next part due to size...
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
                      return floorNum >= -2 && floorNum <= 3;
                    case KonutPropertyFloorCountRange.Between4And7:
                      return floorNum >= -2 && floorNum <= 7;
                    case KonutPropertyFloorCountRange.Between8And18:
                      return floorNum >= -3 && floorNum <= 18;
                    case KonutPropertyFloorCountRange.MoreThan19:
                      return floorNum >= -3 && floorNum <= 99;
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
      selectedPropertyId: yup.string().when('selectionType', {
        is: 'existing' as const,
        then: (schema) => schema.required('Lütfen kayıtlı bir konut seçin.'),
        otherwise: (schema) => schema.nullable(),
      })
    }),
    onSubmit: async (values: KonutPropertyFormData) => {
      if (isSubmittingProposal) return; // Çift tıklama engeli
      
      setIsSubmittingProposal(true);
      setIsLoading(true);
      setNotificationMessage('');

      pushToDataLayer({
        event: "konut_formsubmit",
        form_name: "konut_step2",
      });

      try {
        const currentCustomerId = await getCustomerId();
        if (!currentCustomerId) {
          showNotificationAutoClose("Müşteri kimliği bulunamadı. Lütfen tekrar giriş yapın.", 'error');
          setIsLoading(false);
          setIsSubmittingProposal(false);
          return;
        }

        let propertyIdToSubmit: string | null = null;

        if (values.selectionType === 'existing') {
          if (!values.selectedPropertyId) {
            showNotificationAutoClose('Lütfen kayıtlı bir konut seçin.', 'error');
            setIsLoading(false);
            setIsSubmittingProposal(false);
            return;
          }
          propertyIdToSubmit = values.selectedPropertyId;
        } else {
          // Yeni Konut kaydı
          const newKonutPropertyPayload = {
            customerId: currentCustomerId!,
            number: parseInt(values.apartmentReference!),
            KonutOldPolicyNumber: null,
            squareMeter: parseInt(values.squareMeters!),
            constructionYear: parseInt(values.constructionYear!),
            lossPayeeClause: null,
            damageStatus: mapPropertyDamageStatusToBackendString(values.riskZone),
            floor: {
              totalFloors: mapKonutFloorCountRangeToPayload(values.floorCountRange),
              currentFloor: parseInt(values.floorNumber)
            },
            structure: mapPropertyStructureToBackendString(values.buildingType),
            utilizationStyle: mapPropertyUtilizationStyleToBackendString(values.usageType),
            ownershipType: mapKonutPropertyOwnershipTypeToBackendString(values.ownershipType),
          };

          const propertyResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_PROPERTIES(currentCustomerId!), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify(newKonutPropertyPayload),
          });

          if (!propertyResponse.ok) {
            const errorData = await propertyResponse.json().catch(() => ({ message: propertyResponse.statusText }));
            let errorMessage = 'Konut oluşturulamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.';
            
            // Yeni API response formatını kontrol et
            if (errorData.codes && Array.isArray(errorData.codes)) {
              if (errorData.codes.includes('CUSTOMER_PROPERTY_UAVT_NUMBER_ALREADY_EXISTS')) {
                errorMessage = 'Bu adrese ait konut zaten kayıtlı. Lütfen kayıtlı konutlarınızdan seçim yapın veya farklı bir adres giriniz.';
              } else if (errorData.detail) {
                // detail varsa onu kullan
                errorMessage = errorData.detail;
              }
            } 
            // Eski format için fallback
            else if (errorData.errors && Array.isArray(errorData.errors)) {
              const uavtError = errorData.errors.find((error: string) => error.includes('UAVT'));
              if (uavtError) {
                errorMessage = 'Bu adrese ait konut zaten kayıtlı. Lütfen kayıtlı konutlarınızdan seçim yapın veya farklı bir adres giriniz.';
              } else {
                errorMessage = errorData.errors[0];
              }
            }
            // Eğer message varsa onu kullan
            else if (errorData.message) {
              errorMessage = errorData.message;
            }
            
            setNotificationMessage(errorMessage);
            setNotificationSeverity('error');
            setShowNotification(true);
            setIsLoading(false);
            setIsSubmittingProposal(false);
            return;
          }
          const createdProperty = await propertyResponse.json();
          if (!createdProperty || !createdProperty.newPropertyId) {
            throw new Error('Konut ID alınamadı.');
          }
          propertyIdToSubmit = createdProperty.newPropertyId;
        }

        if (!propertyIdToSubmit) {
          throw new Error('Gönderilecek Konut ID bulunamadı.');
        }

        // Her coverageGroupId için ayrı proposal oluşturma
        const coverageGroupIds = getCoverageGroupIds('konut');

        if (!coverageGroupIds || coverageGroupIds.length === 0) {
          throw new Error('Coverage Group ID bulunamadı.');
        }

        // Paket bazlı teminat tutarları (ID sırasına göre: Paket 1, Paket 2, Paket 3)
        const packageTeminatValues = [
          {
            // Paket 1 (ilk ID)
            furniturePrice: 500000,      // Eşya Bedeli: ₺ 500.000,00
            windowPrice: 150000,         // Cam Bedeli: ₺ 150.000,00
            electronicDevicePrice: 150000, // Elektronik Cihaz Bedeli: ₺ 150.000,00
            insulationPrice: 10000,      // İzolasyon Bedeli: ₺ 10.000,00
          },
          {
            // Paket 2 (ikinci ID)
            furniturePrice: 750000,      // Eşya Bedeli: ₺ 750.000,00
            windowPrice: 150000,         // Cam Bedeli: ₺ 150.000,00
            electronicDevicePrice: 150000, // Elektronik Cihaz Bedeli: ₺ 150.000,00
            insulationPrice: 10000,      // İzolasyon Bedeli: ₺ 10.000,00
          },
          {
            // Paket 3 (üçüncü ID)
            furniturePrice: 1000000,     // Eşya Bedeli: ₺ 1.000.000,00
            windowPrice: 150000,         // Cam Bedeli: ₺ 150.000,00
            electronicDevicePrice: 150000, // Elektronik Cihaz Bedeli: ₺ 150.000,00
            insulationPrice: 10000,      // İzolasyon Bedeli: ₺ 10.000,00
          },
        ];

        // Base proposal payload (ortak değerler)
        const baseProposalPayload = {
          $type: 'konut',
          propertyId: propertyIdToSubmit,
          insurerCustomerId: currentCustomerId!,
          insuredCustomerId: currentCustomerId!,
          constructionCostPerSquareMeter: 25000,
          inflation: 60, // Default inflation value
          channel: 'WEBSITE',
        };

        // Her coverageGroupId için ayrı proposal oluştur (paralel)
        const proposalPromises = coverageGroupIds.map(async (coverageGroupId: string, index: number) => {
          // Index'e göre paket değerlerini al (eğer 3'ten fazla ID varsa son paketi kullan)
          const packageIndex = Math.min(index, packageTeminatValues.length - 1);
          const packageValues = packageTeminatValues[packageIndex];

          const proposalPayload = {
            ...baseProposalPayload,
            furniturePrice: packageValues.furniturePrice,
            electronicDevicePrice: packageValues.electronicDevicePrice,
            insulationPrice: packageValues.insulationPrice,
            windowPrice: packageValues.windowPrice,
            coverageGroupIds: [coverageGroupId], // Tek ID olarak array içinde gönder
          };

          try {
            const proposalResponse = await fetchWithAuth(API_ENDPOINTS.PROPOSALS_CREATE, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
              body: JSON.stringify(proposalPayload),
            });

            if (!proposalResponse.ok) {
              const errorData = await proposalResponse.json().catch(() => ({ message: proposalResponse.statusText }));
              console.warn(`Proposal oluşturulamadı (coverageGroupId: ${coverageGroupId}):`, errorData.message || proposalResponse.statusText);
              return null; // Hata durumunda null döndür, diğerleri devam etsin
            }

            const proposalResult = await proposalResponse.json();
            return proposalResult?.proposalId || null;
          } catch (error) {
            console.warn(`Proposal oluşturma hatası (coverageGroupId: ${coverageGroupId}):`, error);
            return null; // Hata durumunda null döndür
          }
        });

        // Tüm proposal'ları paralel olarak oluştur
        const proposalIds = await Promise.all(proposalPromises);

        // Başarılı olan proposal ID'lerini filtrele (null olmayanlar)
        const successfulProposalIds = proposalIds.filter((id): id is string => id !== null);

        if (successfulProposalIds.length === 0) {
          throw new Error('Hiçbir proposal oluşturulamadı. Lütfen tekrar deneyin.');
        }

        // Proposal ID'lerini localStorage'a kaydet (array olarak)
        localStorage.setItem('yuvamGuvendeProposalIds', JSON.stringify(successfulProposalIds));

        // Eski key'leri temizle
        localStorage.removeItem('KonutProposalId');
        localStorage.removeItem('yuvamGuvendeProposalId');

        // YuvamGuvende için proposalId'leri saklayıp onNext çağıralım
        setTimeout(() => {
          onNext();
        }, 1500);
      } catch (error: unknown) {
        let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';
        if (error instanceof yup.ValidationError) {
          errorMessage = 'Lütfen formdaki eksik veya hatalı alanları düzeltin.';
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        showNotificationAutoClose(errorMessage, 'error');
        setIsSubmittingProposal(false);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      let fetchedProperties: Property[] = [];
      let propertiesFetchedSuccessfully = false;

      const currentCustomerId = await getCustomerId();
      if (accessToken && currentCustomerId) {
        try {
          const response = await fetchWithAuth(`${API_ENDPOINTS.CUSTOMER_PROPERTIES(currentCustomerId)}?usage=Konut`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (response.ok) {
            const data = await response.json();
            fetchedProperties = data as Property[];
            setProperties(fetchedProperties);
            propertiesFetchedSuccessfully = true;
          } else {
            const errorText = await response.text();
            setError(`Konut bilgileri alınamadı: ${errorText}`);
            setProperties([]);
          }
        } catch (e) {
          setError('Konut bilgileri alınırken bir hata oluştu.');
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
            const sortedCities = sortLocationOptions(citiesData as LocationOption[]);
            setCities(sortedCities);
          }
        }
      } catch (e) {
        setError('İller yüklenirken bir hata oluştu.');
      }

      if (propertiesFetchedSuccessfully) {
        if (fetchedProperties.length === 0) {
          formik.setFieldValue('selectionType', 'new');
          const resetValues = { ...initialKonutFormData, selectionType: 'new' as const};
          formik.resetForm({ values: resetValues });
        } else {
          formik.setFieldValue('selectionType', 'existing');
          handlePropertySelect(fetchedProperties[0].id);
        }
      }

      setIsLoading(false);
    };

    loadInitialData();
  }, [accessToken, storeCustomerId]);

  const handlePropertySelect = (propertyId: string) => {
    const selected = properties.find((p) => p.id === propertyId);
    if (selected) {
      const currentValues = formik.values;
      
      formik.setValues({
        ...currentValues,
        selectionType: 'existing',
        selectedPropertyId: propertyId,
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
      });

      // Sync address dropdowns
      if (typeof selected.address === 'object' && selected.address.city?.value) {
        setSelectedCity(selected.address.city);
        
        if (typeof selected.address === 'object' && selected.address.district?.value) {
          setSelectedDistrict(selected.address.district);
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

  const isFormValid = () => {
    if (formik.values.selectionType === 'existing') {
      return !!formik.values.selectedPropertyId;
    }

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
    };

    return Object.values(requiredFields).every(value => !!value);
  };

  return (
      <div className="yg-form-content">
        <span className="yg-form-title">Evinizi Tanıyalım</span>
        <p className="yg-form-subtitle">
          Poliçenizin doğru şekilde hazırlanabilmesi için adres bilgilerinizi girin.
        </p>
        {showNotification && (
            <div className={`yg-notification ${notificationSeverity === 'error' ? 'yg-notification-error' : 'yg-notification-success'}`}>
              {notificationMessage}
              <button
                  className="yg-notification-close"
                  onClick={() => setShowNotification(false)}
                  aria-label="Kapat"
              >
                ×
              </button>
            </div>
        )}

        {error && (
            <p style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: '20px' }}>{error}</p>
        )}

        {/* Selection Type Tabs */}
        <div className="yg-selection-tabs">
          <button
              type="button"
              className={`yg-selection-tab ${formik.values.selectionType === 'existing' ? 'active' : ''}`}
              onClick={() => {
                formik.setFieldValue('selectionType', 'existing');
                if (properties.length > 0 && !formik.values.selectedPropertyId) {
                  handlePropertySelect(properties[0].id);
                }
              }}
              disabled={isLoading || properties.length === 0}
          >
            Kayıtlı Konutlarım
          </button>
          <button
              type="button"
              className={`yg-selection-tab ${formik.values.selectionType === 'new' ? 'active' : ''}`}
              onClick={() => {
                formik.setFieldValue('selectionType', 'new');
                formik.setFieldValue('selectedPropertyId', null);
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
              }}
              disabled={isLoading}
          >
            Yeni Konut Ekle
          </button>
        </div>

        {formik.values.selectionType === 'existing' ? (
            <>
              <div className="yg-properties-grid">
                {isLoading && properties.length === 0 ? (
                    <div className="yg-loading">Yükleniyor...</div>
                ) : properties.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#fff', padding: '20px' }}>
                      Kayıtlı Konut uyumlu konut bulunamadı. Lütfen yeni konut ekleyin.
                    </p>
                ) : (
                    properties.map((property) => (
                        <div
                            key={property.id}
                            className={`yg-property-card ${formik.values.selectedPropertyId === property.id ? 'selected' : ''}`}
                            onClick={() => handlePropertySelect(property.id)}
                        >
                          <div className="yg-property-card-header">
                            {typeof property.address === 'object' && property.address.city && property.address.district
                                ? `${property.address.city.text} / ${property.address.district.text}`
                                : 'İl/İlçe bilgisi yok'}
                          </div>
                          <div className="yg-property-card-body">
                            {typeof property.address === 'object' && property.address
                                ? `${property.address.town?.text ? property.address.town.text + ' ' : ''}${property.address.neighborhood?.text ? property.address.neighborhood.text + ' ' : ''}${property.address.street?.text ? property.address.street.text + ' ' : ''}${property.address.building?.text ? 'No:' + property.address.building.text + ' ' : ''}${property.address.apartment?.text ? 'Daire:' + property.address.apartment.text : ''}`.trim() || 'Adres bilgisi yok'
                                : 'Adres bilgisi yok'}
                          </div>
                        </div>
                    ))
                )}
              </div>

              <div className="yg-button-container" style={{ justifyContent: 'flex-end', marginTop: '30px' }}>
                <YGButton
                    type="button"
                    onClick={() => {
                      if (isSubmittingProposal || isLoading || formik.isSubmitting) {
                        return;
                      }
                      formik.handleSubmit();
                    }}
                    disabled={
                        isSubmittingProposal ||
                        isLoading ||
                        formik.isSubmitting ||
                        !formik.values.selectedPropertyId
                    }
                >
                  {isSubmittingProposal || isLoading || formik.isSubmitting ? 'Teklif Alınıyor...' : 'Teklif Al'}
                </YGButton>
              </div>
            </>
        ) : (
            <form onSubmit={formik.handleSubmit}>
              {/* Konut Bilgileri Section */}
              <div className="yg-form-section">
                <h3 className="yg-form-section-title">Konut Bilgileri</h3>

                {/* Address Fields Grid */}
                <div className="yg-form-grid">
                  <YGSelect
                      name="cityReference"
                      value={formik.values.cityReference}
                      onChange={(e) => {
                        formik.setFieldValue('cityReference', e.target.value);
                        const cityOption = cities.find(c => c.value === e.target.value);
                        setSelectedCity(cityOption || null);
                        setSelectedDistrict(null);
                        setDistricts([]);
                        formik.setFieldValue('districtReference', '');
                        if (e.target.value) {
                          fetchDistricts(e.target.value);
                        }
                      }}
                      options={cities.map(opt => ({ value: opt.value, label: opt.text }))}
                      placeholder="İl*"
                      error={formik.touched.cityReference && formik.errors.cityReference ? String(formik.errors.cityReference) : undefined}
                      disabled={isLoading || cities.length === 0}
                  />

                  <YGSelect
                      name="districtReference"
                      value={formik.values.districtReference}
                      onChange={(e) => {
                        formik.setFieldValue('districtReference', e.target.value);
                        const districtOption = districts.find(d => d.value === e.target.value);
                        setSelectedDistrict(districtOption || null);
                        formik.setFieldValue('townReference', ''); setSelectedTown(null); setTowns([]);
                        formik.setFieldValue('neighborhoodReference', ''); setSelectedNeighborhood(null); setNeighborhoods([]);
                        formik.setFieldValue('streetReference', ''); setSelectedStreet(null); setStreets([]);
                        formik.setFieldValue('buildingReference', ''); setSelectedBuilding(null); setBuildings([]);
                        formik.setFieldValue('apartmentReference', ''); setSelectedApartment(null); setApartments([]);
                        if (e.target.value) {
                          fetchTowns(e.target.value);
                        }
                      }}
                      options={districts.map(opt => ({ value: opt.value, label: opt.text }))}
                      placeholder="İlçe*"
                      error={formik.touched.districtReference && formik.errors.districtReference ? String(formik.errors.districtReference) : undefined}
                      disabled={!formik.values.cityReference || isLoading || districts.length === 0}
                  />

                  <YGSelect
                      name="townReference"
                      value={formik.values.townReference || ''}
                      onChange={(e) => {
                        formik.setFieldValue('townReference', e.target.value);
                        const townOption = towns.find(t => t.value === e.target.value);
                        setSelectedTown(townOption || null);
                        formik.setFieldValue('neighborhoodReference', ''); setSelectedNeighborhood(null); setNeighborhoods([]);
                        formik.setFieldValue('streetReference', ''); setSelectedStreet(null); setStreets([]);
                        formik.setFieldValue('buildingReference', ''); setSelectedBuilding(null); setBuildings([]);
                        formik.setFieldValue('apartmentReference', ''); setSelectedApartment(null); setApartments([]);
                        if (e.target.value) {
                          fetchNeighborhoods(e.target.value);
                        }
                      }}
                      options={towns.map(opt => ({ value: opt.value, label: opt.text }))}
                      placeholder="Belde/Bucak"
                      disabled={!formik.values.districtReference || isLoading || towns.length === 0}
                  />

                  <YGSelect
                      name="neighborhoodReference"
                      value={formik.values.neighborhoodReference || ''}
                      onChange={(e) => {
                        formik.setFieldValue('neighborhoodReference', e.target.value);
                        const neighborhoodOption = neighborhoods.find(n => n.value === e.target.value);
                        setSelectedNeighborhood(neighborhoodOption || null);
                        formik.setFieldValue('streetReference', ''); setSelectedStreet(null); setStreets([]);
                        formik.setFieldValue('buildingReference', ''); setSelectedBuilding(null); setBuildings([]);
                        formik.setFieldValue('apartmentReference', ''); setSelectedApartment(null); setApartments([]);
                        if (e.target.value) {
                          fetchStreets(e.target.value);
                        }
                      }}
                      options={neighborhoods.map(opt => ({ value: opt.value, label: opt.text }))}
                      placeholder="Mahalle"
                      disabled={!formik.values.townReference || isLoading || neighborhoods.length === 0}
                  />

                  <YGSelect
                      name="streetReference"
                      value={formik.values.streetReference || ''}
                      onChange={(e) => {
                        formik.setFieldValue('streetReference', e.target.value);
                        const streetOption = streets.find(s => s.value === e.target.value);
                        setSelectedStreet(streetOption || null);
                        formik.setFieldValue('buildingReference', ''); setSelectedBuilding(null); setBuildings([]);
                        formik.setFieldValue('apartmentReference', ''); setSelectedApartment(null); setApartments([]);
                        if (e.target.value) {
                          fetchBuildings(e.target.value);
                        }
                      }}
                      options={streets.map(opt => ({ value: opt.value, label: opt.text }))}
                      placeholder="Sokak/Cadde"
                      disabled={!formik.values.neighborhoodReference || isLoading || streets.length === 0}
                  />

                  <YGSelect
                      name="buildingReference"
                      value={formik.values.buildingReference || ''}
                      onChange={(e) => {
                        formik.setFieldValue('buildingReference', e.target.value);
                        const buildingOption = buildings.find(b => b.value === e.target.value);
                        setSelectedBuilding(buildingOption || null);
                        formik.setFieldValue('apartmentReference', ''); setSelectedApartment(null); setApartments([]);
                        if (e.target.value) {
                          fetchApartments(e.target.value);
                        }
                      }}
                      options={buildings.map(opt => ({ value: opt.value, label: opt.text }))}
                      placeholder="Bina No/Adı"
                      disabled={!formik.values.streetReference || isLoading || buildings.length === 0}
                  />

                  <YGSelect
                      name="apartmentReference"
                      value={formik.values.apartmentReference || ''}
                      onChange={(e) => {
                        formik.setFieldValue('apartmentReference', e.target.value);
                        const apartmentOption = apartments.find(a => a.value === e.target.value);
                        setSelectedApartment(apartmentOption || null);
                      }}
                      options={apartments.map(opt => ({ value: opt.value, label: opt.text }))}
                      placeholder="Daire No*"
                      error={formik.touched.apartmentReference && formik.errors.apartmentReference ? String(formik.errors.apartmentReference) : undefined}
                      disabled={!formik.values.buildingReference || isLoading || apartments.length === 0}
                  />
                </div>
              </div>

              {/* Genel Bilgiler Section - Hidden fields with default values */}
              {/* Yapı Tarzı, Yapım Yılı, Kat Sayısı, Dairenin Bulunduğu Kat, Metre Kare, Kullanım Şekli, Hasar Durumu, Mülkiyet Tipi alanları gizlendi - default değerler otomatik gönderiliyor */}

              <div className="yg-button-container" style={{ justifyContent: 'flex-end' }}>
                <YGButton
                    type="submit"
                    disabled={
                        isSubmittingProposal ||
                        isLoading ||
                        formik.isSubmitting ||
                        !isFormValid()
                    }
                    onClick={(e) => {
                      if (isSubmittingProposal || isLoading || formik.isSubmitting) {
                        e.preventDefault();
                        return;
                      }
                    }}
                >
                  {isSubmittingProposal || isLoading || formik.isSubmitting ? 'Teklif Alınıyor...' : 'Teklif Al'}
                </YGButton>
              </div>
            </form>
        )}

      </div>
  );
}
