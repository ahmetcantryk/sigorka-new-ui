import React, { useState, useEffect } from 'react';
import CustomSelect from '../../common/Input/CustomSelect';
import Input from '../../common/Input/Input';
import { PropertyResponse } from '../../../types/interfaces/property';
import {
  PropertyUtilizationStyle,
  PropertyStructure,
  PropertyDamageStatus,
  PropertyFloorNumber,
  PropertyOwnershipType,
} from '../../../types/enums/propertyEnums';
import { useAuthStore } from '../../../store/useAuthStore';
import { DialogContent, DialogActions, Button } from '@mui/material';
import { fetchWithAuth } from '../../../services/fetchWithAuth';
import { API_BASE_URL, API_ENDPOINTS } from '../../../config/api';

// PropertyFloorCountRange enum'ını ekle (PropertyInfoStep.tsx'teki gibi)
enum PropertyFloorCountRange {
  Unknown = 0,
  Between1And3 = 1,
  Between4And7 = 2,
  Between8And18 = 3,
  MoreThan19 = 4,
}

// Bina toplam kat sayısı aralığı seçenekleri
const floorCountRangeOptions = [
  { value: PropertyFloorCountRange.Unknown, label: 'Seçiniz' },
  { value: PropertyFloorCountRange.Between1And3, label: '1-3' },
  { value: PropertyFloorCountRange.Between4And7, label: '4-7' },
  { value: PropertyFloorCountRange.Between8And18, label: '8-18' },
  { value: PropertyFloorCountRange.MoreThan19, label: '> 18' },
];

// Floor count range'ı API formatına çeviren fonksiyon (PropertyInfoStep.tsx'teki gibi)
const mapFloorCountRangeToPayload = (range: PropertyFloorCountRange): { $type: "range"; min: number; max: number } | number | null => {
  switch (range) {
    case PropertyFloorCountRange.Between1And3:
      return { $type: "range", min: 1, max: 3 };
    case PropertyFloorCountRange.Between4And7:
      return { $type: "range", min: 4, max: 7 };
    case PropertyFloorCountRange.Between8And18:
      return { $type: "range", min: 8, max: 18 };
    case PropertyFloorCountRange.MoreThan19:
      return { $type: "range", min: 19, max: 99 };
    default:
      return null;
  }
};

// Kat aralığından maksimum kat sayısını bulan fonksiyon
const getMaxFloorFromRange = (range: PropertyFloorCountRange): number | null => {
  switch (range) {
    case PropertyFloorCountRange.Between1And3:
      return 3;
    case PropertyFloorCountRange.Between4And7:
      return 7;
    case PropertyFloorCountRange.Between8And18:
      return 18;
    case PropertyFloorCountRange.MoreThan19:
      return 50; // Maksimum sınır olarak 50'yi kullanıyoruz
    default:
      return null;
  }
};



// FinancialInstitution tipi için interface ekle
interface FinancialInstitution {
  id: string;
  name: string;
}

// Bank tipi için interface ekle
interface Bank {
  id: string;
  name: string;
}

// BankBranch tipi için interface ekle
interface BankBranch {
  id: string;
  name: string;
  bankId: string;
}

const utilizationStyleOptions = [
  { value: PropertyUtilizationStyle.Unknown, label: 'Bilinmiyor' },
  { value: PropertyUtilizationStyle.House, label: 'Konut' },
  { value: PropertyUtilizationStyle.Business, label: 'İş Yeri' },
  { value: PropertyUtilizationStyle.Other, label: 'Diğer' },
];

const structureTypeOptions = [
  { value: PropertyStructure.Unknown, label: 'Bilinmiyor' },
  { value: PropertyStructure.SteelReinforcedConcrete, label: 'Çelik Betonarme' },
  { value: PropertyStructure.Other, label: 'Diğer' },
];

const damageStatusOptions = [
  { value: PropertyDamageStatus.Unknown, label: 'Bilinmiyor' },
  { value: PropertyDamageStatus.None, label: 'Hasarsız' },
  { value: PropertyDamageStatus.SlightlyDamaged, label: 'Az Hasarlı' },
  { value: PropertyDamageStatus.ModeratelyDamaged, label: 'Orta Hasarlı' },
  { value: PropertyDamageStatus.SeverelyDamaged, label: 'Ağır Hasarlı' },
];

const ownershipTypeOptions = [
  { value: PropertyOwnershipType.Unknown, label: 'Bilinmiyor' },
  { value: PropertyOwnershipType.Proprietor, label: 'Malik' },
  { value: PropertyOwnershipType.Tenant, label: 'Kiracı' },
];

const floorNumberOptions = [
  { value: PropertyFloorNumber.Unknown, label: 'Bilinmiyor' },
  { value: PropertyFloorNumber.Between1And3, label: '1-3 Kat' },
  { value: PropertyFloorNumber.Between4And7, label: '4-7 Kat' },
  { value: PropertyFloorNumber.Between8And18, label: '8-18 Kat' },
  { value: PropertyFloorNumber.MoreThan19, label: '19+ Kat' },
];

interface AddPropertyModalProps {
  onClose: () => void;
  initialData?: PropertyResponse;
  onSuccess: () => void;
}

type PropertyType = 'uavt' | 'manual';

// Floor range'i response'dan form değerine map etme fonksiyonu (component dışında)
const mapFloorRangeFromResponse = (totalFloors: any): string => {
  if (!totalFloors || typeof totalFloors !== 'object') return '';
  
  const { min, max } = totalFloors;
  if (min === 1 && max === 3) return PropertyFloorCountRange.Between1And3.toString();
  if (min === 4 && max === 7) return PropertyFloorCountRange.Between4And7.toString();
  if (min === 8 && max === 18) return PropertyFloorCountRange.Between8And18.toString();
  if (min >= 19) return PropertyFloorCountRange.MoreThan19.toString();
  
  return PropertyFloorCountRange.Unknown.toString();
};

const AddPropertyModal: React.FC<AddPropertyModalProps> = ({ onClose, initialData, onSuccess }) => {
  const { accessToken, customerId } = useAuthStore();

  // Adres bilgileri için state'ler
  const [cities, setCities] = useState<Array<{ value: string; text: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ value: string; text: string }>>([]);
  const [towns, setTowns] = useState<Array<{ value: string; text: string }>>([]);
  const [neighborhoods, setNeighborhoods] = useState<Array<{ value: string; text: string }>>([]);
  const [streets, setStreets] = useState<Array<{ value: string; text: string }>>([]);
  const [buildings, setBuildings] = useState<Array<{ value: string; text: string }>>([]);
  const [apartments, setApartments] = useState<Array<{ value: string; text: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Banka ve finans kurumları için state'ler
  const [banks, setBanks] = useState<Bank[]>([]);
  const [financialInstitutions, setFinancialInstitutions] = useState<FinancialInstitution[]>([]);
  const [bankBranches, setBankBranches] = useState<BankBranch[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedFinancialId, setSelectedFinancialId] = useState<string>('');

  const [propertyType, setPropertyType] = useState<PropertyType>('uavt');

  const [formData, setFormData] = useState({
    // UAVT/Adres Bilgileri
    uavtNo: initialData?.number?.toString() || '',
    city: {
      value: initialData?.address?.city?.value || '',
      text: initialData?.address?.city?.text || '',
    },
    district: {
      value: initialData?.address?.district?.value || '',
      text: initialData?.address?.district?.text || '',
    },
    town: {
      value: initialData?.address?.town?.value || '',
      text: initialData?.address?.town?.text || '',
    },
    neighborhood: {
      value: initialData?.address?.neighborhood?.value || '',
      text: initialData?.address?.neighborhood?.text || '',
    },
    street: {
      value: initialData?.address?.street?.value || '',
      text: initialData?.address?.street?.text || '',
    },
    building: {
      value: initialData?.address?.building?.value || '',
      text: initialData?.address?.building?.text || '',
    },
    apartment: {
      value: initialData?.address?.apartment?.value || '',
      text: initialData?.address?.apartment?.text || '',
    },

    // Genel Bilgiler
    squareMeters: initialData?.squareMeter?.toString() || '',
    constructionYear: initialData?.constructionYear?.toString() || '',

    // Yapı ve Kullanım Detayları
    usageType: initialData?.utilizationStyle?.toString() || '',
    damageStatus: initialData?.damageStatus?.toString() || '',
    constructionType: initialData?.structure?.toString() || '',
    floorCount: initialData?.floorNumber?.toString() || '',
    floorCountRange: initialData?.floor?.totalFloors ? mapFloorRangeFromResponse(initialData.floor.totalFloors) : '',
    apartmentFloor: initialData?.floor?.currentFloor?.toString() || '',
    ownershipType: initialData?.ownershipType?.toString() || '',

    // Diğer
    dainMurtehin: 'none',
    dainMurtehinBankId: '',
    dainMurtehinBankName: '',
    dainMurtehinBranchId: '',
    dainMurtehinBranchName: '',
    dainMurtehinFinancialId: '',
    dainMurtehinFinancialName: '',
  });

  const isEditMode = !!initialData;

  // Edit mode'da initial data'yı sakla
  const [initialFormData, setInitialFormData] = useState<any>(null);

  // Form verilerinin değişip değişmediğini kontrol et
  const hasFormChanged = () => {
    if (!isEditMode || !initialFormData) return true;
    
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  };

  // 1. State'e errors ekle
  const [errors, setErrors] = useState({
    uavtNo: '',
    city: '',
    district: '',
    town: '',
    neighborhood: '',
    street: '',
    building: '',
    apartment: '',
    squareMeters: '',
    constructionYear: '',
    usageType: '',
    damageStatus: '',
    constructionType: '',
    floorCount: '',
    floorCountRange: '',
    apartmentFloor: '',
    ownershipType: '',
    dainMurtehinBankId: '',
    dainMurtehinBranchId: '',
    dainMurtehinFinancialId: '',
  });

  // Düzenleme modu için property detayını çek
  const fetchPropertyDetails = async () => {
    if (!isEditMode || !initialData?.id) return;
    
      try {
        setIsLoading(true);
      const response = await fetchWithAuth(
        `${API_BASE_URL}${API_ENDPOINTS.CUSTOMER_PROPERTY_DETAIL(customerId!, initialData.id)}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

      if (response.ok) {
        const propertyData = await response.json();
        
        // Form verilerini yeni API response'a göre güncelle
        setFormData(prev => ({
          ...prev,
          uavtNo: propertyData.number?.toString() || '',
          city: {
            value: propertyData.address?.city?.value || '',
            text: propertyData.address?.city?.text || '',
          },
          district: {
            value: propertyData.address?.district?.value || '',
            text: propertyData.address?.district?.text || '',
          },
          town: {
            value: propertyData.address?.town?.value || '',
            text: propertyData.address?.town?.text || '',
          },
          neighborhood: {
            value: propertyData.address?.neighborhood?.value || '',
            text: propertyData.address?.neighborhood?.text || '',
          },
          street: {
            value: propertyData.address?.street?.value || '',
            text: propertyData.address?.street?.text || '',
          },
          building: {
            value: propertyData.address?.building?.value || '',
            text: propertyData.address?.building?.text || '',
          },
          apartment: {
            value: propertyData.address?.apartment?.value || '',
            text: propertyData.address?.apartment?.text || '',
          },
          squareMeters: propertyData.squareMeter?.toString() || '',
          constructionYear: propertyData.constructionYear?.toString() || '',
          usageType: mapBackendStringToPropertyUtilizationStyle(propertyData.utilizationStyle).toString(),
          damageStatus: mapBackendStringToPropertyDamageStatus(propertyData.damageStatus).toString(),
          constructionType: mapBackendStringToPropertyStructure(propertyData.structure).toString(),
          apartmentFloor: propertyData.floor?.currentFloor?.toString() || '',
          ownershipType: mapBackendStringToPropertyOwnershipType(propertyData.ownershipType).toString(),
          // Floor count range'i response'dan çıkar
          floorCountRange: mapFloorRangeFromResponse(propertyData.floor?.totalFloors),
          // Dain-i mürtehin bilgilerini set et
          dainMurtehin: propertyData.lossPayeeClause ? (propertyData.lossPayeeClause.type === 'BANK' ? 'bank' : 'finance') : 'none',
          dainMurtehinBankId: propertyData.lossPayeeClause?.bank?.id || '',
          dainMurtehinBankName: propertyData.lossPayeeClause?.bank?.name || '',
          dainMurtehinBranchId: propertyData.lossPayeeClause?.bankBranch?.id || '',
          dainMurtehinBranchName: propertyData.lossPayeeClause?.bankBranch?.name || '',
          dainMurtehinFinancialId: propertyData.lossPayeeClause?.financialInstitution?.id || '',
          dainMurtehinFinancialName: propertyData.lossPayeeClause?.financialInstitution?.name || '',
        }));

        // Adres cascade'lerini yükle
        if (propertyData.address?.city?.value) {
          await fetchWithAuthDistricts(propertyData.address.city.value);
          
          if (propertyData.address?.district?.value) {
            await fetchWithAuthTowns(propertyData.address.district.value);
            
            if (propertyData.address?.town?.value) {
              await fetchWithAuthNeighborhoods(propertyData.address.town.value);
              
              if (propertyData.address?.neighborhood?.value) {
                await fetchWithAuthStreets(propertyData.address.neighborhood.value);
                
                if (propertyData.address?.street?.value) {
                  await fetchWithAuthBuildings(propertyData.address.street.value);
                  
                  if (propertyData.address?.building?.value) {
                    await fetchWithAuthApartments(propertyData.address.building.value);
                  }
                }
              }
            }
          }
        }

        // Dain-i mürtehin bilgilerini yükle
        if (propertyData.lossPayeeClause?.bank?.id) {
          setSelectedBankId(propertyData.lossPayeeClause.bank.id);
          await fetchBankBranches(propertyData.lossPayeeClause.bank.id);
          if (propertyData.lossPayeeClause.bankBranch?.id) {
            setSelectedBranchId(propertyData.lossPayeeClause.bankBranch.id);
          }
        } else if (propertyData.lossPayeeClause?.financialInstitution?.id) {
          setSelectedFinancialId(propertyData.lossPayeeClause.financialInstitution.id);
        }
      } else {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  // Enum mapping fonksiyonları
  const mapPropertyStructureToBackendString = (value: PropertyStructure): string => {
    switch (value) {
      case PropertyStructure.SteelReinforcedConcrete: return 'STEEL_REINFORCED_CONCRETE';
      case PropertyStructure.Other: return 'OTHER';
      case PropertyStructure.Unknown:
      default: return 'UNKNOWN';
    }
  };

  const mapPropertyUtilizationStyleToBackendString = (value: PropertyUtilizationStyle): string => {
    switch (value) {
      case PropertyUtilizationStyle.House: return 'HOUSE';
      case PropertyUtilizationStyle.Business: return 'BUSINESS';
      case PropertyUtilizationStyle.Other: return 'OTHER';
      case PropertyUtilizationStyle.Unknown:
      default: return 'UNKNOWN';
    }
  };

  const mapPropertyDamageStatusToBackendString = (value: PropertyDamageStatus): string => {
    switch (value) {
      case PropertyDamageStatus.None: return 'NONE';
      case PropertyDamageStatus.SlightlyDamaged: return 'SLIGHTLY_DAMAGED';
      case PropertyDamageStatus.ModeratelyDamaged: return 'MODERATELY_DAMAGED';
      case PropertyDamageStatus.SeverelyDamaged: return 'SEVERELY_DAMAGED';
      case PropertyDamageStatus.Unknown:
      default: return 'UNKNOWN';
    }
  };

  const mapPropertyOwnershipTypeToBackendString = (value: PropertyOwnershipType): string => {
    switch (value) {
      case PropertyOwnershipType.Proprietor: return 'PROPRIETOR';
      case PropertyOwnershipType.Tenant: return 'TENANT';
      case PropertyOwnershipType.Unknown:
      default: return 'UNKNOWN';
    }
  };

  // Reverse mapping fonksiyonları (API'den gelen string değerleri enum'lara çevirmek için)
  const mapBackendStringToPropertyStructure = (value: string): PropertyStructure => {
    switch (value) {
      case 'STEEL_REINFORCED_CONCRETE': return PropertyStructure.SteelReinforcedConcrete;
      case 'OTHER': return PropertyStructure.Other;
      default: return PropertyStructure.Unknown;
    }
  };

  const mapBackendStringToPropertyUtilizationStyle = (value: string): PropertyUtilizationStyle => {
    switch (value) {
      case 'HOUSE': return PropertyUtilizationStyle.House;
      case 'BUSINESS': return PropertyUtilizationStyle.Business;
      case 'OTHER': return PropertyUtilizationStyle.Other;
      default: return PropertyUtilizationStyle.Unknown;
    }
  };

  const mapBackendStringToPropertyDamageStatus = (value: string): PropertyDamageStatus => {
    switch (value) {
      case 'NONE': return PropertyDamageStatus.None;
      case 'SLIGHTLY_DAMAGED': return PropertyDamageStatus.SlightlyDamaged;
      case 'MODERATELY_DAMAGED': return PropertyDamageStatus.ModeratelyDamaged;
      case 'SEVERELY_DAMAGED': return PropertyDamageStatus.SeverelyDamaged;
      default: return PropertyDamageStatus.Unknown;
    }
  };

  const mapBackendStringToPropertyOwnershipType = (value: string): PropertyOwnershipType => {
    switch (value) {
      case 'PROPRIETOR': return PropertyOwnershipType.Proprietor;
      case 'TENANT': return PropertyOwnershipType.Tenant;
      default: return PropertyOwnershipType.Unknown;
    }
  };

  // İlleri yükle
  useEffect(() => {
    const fetchWithAuthInitialData = async () => {
      try {
        setIsLoading(true);

        // İlleri yükle
        const citiesResponse = await fetchWithAuth(
          `${API_BASE_URL}/api/address-parameters/cities`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (citiesResponse.ok) {
          const citiesData = await citiesResponse.json();
          setCities(citiesData);
        }

        // Düzenleme modundaysa property detaylarını çek
        if (isEditMode) {
          await fetchPropertyDetails();
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchWithAuthInitialData();
  }, [initialData, accessToken]);

  // Edit mode için initial form data'sını set et
  useEffect(() => {
    if (isEditMode && formData && !initialFormData) {
      // Form data set olduktan sonra initial snapshot'ını al
      setTimeout(() => {
        setInitialFormData(JSON.parse(JSON.stringify(formData)));
      }, 100);
    }
  }, [formData, isEditMode, initialFormData]);

  // Adres sorgulama fonksiyonlarını useEffect dışına taşıyalım
  const fetchWithAuthDistricts = async (cityValue: string) => {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/address-parameters/districts?cityReference=${cityValue}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDistricts(data);
      } else {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWithAuthTowns = async (districtValue: string) => {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/address-parameters/towns?districtReference=${districtValue}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTowns(data);
      } else {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWithAuthNeighborhoods = async (townValue: string) => {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/address-parameters/neighbourhoods?townReference=${townValue}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNeighborhoods(data);
      } else {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWithAuthStreets = async (neighborhoodValue: string) => {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/address-parameters/streets?neighbourhoodReference=${neighborhoodValue}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStreets(data);
      } else {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWithAuthBuildings = async (streetValue: string) => {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/address-parameters/buildings?streetReference=${streetValue}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBuildings(data);
      } else {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWithAuthApartments = async (buildingValue: string) => {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/address-parameters/apartments?buildingReference=${buildingValue}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setApartments(data);
      } else {
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeAddress = (name: string, value: string) => {
    const selectedItem =
      name === 'city'
        ? cities.find((item) => item.value === value)
        : name === 'district'
          ? districts.find((item) => item.value === value)
          : name === 'town'
            ? towns.find((item) => item.value === value)
            : name === 'neighborhood'
              ? neighborhoods.find((item) => item.value === value)
              : name === 'street'
                ? streets.find((item) => item.value === value)
                : name === 'building'
                  ? buildings.find((item) => item.value === value)
                  : name === 'apartment'
                    ? apartments.find((item) => item.value === value)
                    : undefined;

    // FormData'yı güncelle
    setFormData((prev) => ({
      ...prev,
      [name]: {
        value,
        text: selectedItem?.text || '',
      },
      // Alt seviyeleri temizle
      ...(name === 'city' && {
        district: { value: '', text: '' },
        town: { value: '', text: '' },
        neighborhood: { value: '', text: '' },
        street: { value: '', text: '' },
        building: { value: '', text: '' },
        apartment: { value: '', text: '' },
      }),
      ...(name === 'district' && {
        town: { value: '', text: '' },
        neighborhood: { value: '', text: '' },
        street: { value: '', text: '' },
        building: { value: '', text: '' },
        apartment: { value: '', text: '' },
      }),
      ...(name === 'town' && {
        neighborhood: { value: '', text: '' },
        street: { value: '', text: '' },
        building: { value: '', text: '' },
        apartment: { value: '', text: '' },
      }),
      ...(name === 'neighborhood' && {
        street: { value: '', text: '' },
        building: { value: '', text: '' },
        apartment: { value: '', text: '' },
      }),
      ...(name === 'street' && {
        building: { value: '', text: '' },
        apartment: { value: '', text: '' },
      }),
      ...(name === 'building' && {
        apartment: { value: '', text: '' },
      }),
    }));

    // Alt seviye listelerini temizle
    if (name === 'city') {
      setDistricts([]);
      setTowns([]);
      setNeighborhoods([]);
      setStreets([]);
      setBuildings([]);
      setApartments([]);
    } else if (name === 'district') {
      setTowns([]);
      setNeighborhoods([]);
      setStreets([]);
      setBuildings([]);
      setApartments([]);
    } else if (name === 'town') {
      setNeighborhoods([]);
      setStreets([]);
      setBuildings([]);
      setApartments([]);
    } else if (name === 'neighborhood') {
      setStreets([]);
      setBuildings([]);
      setApartments([]);
    } else if (name === 'street') {
      setBuildings([]);
      setApartments([]);
    } else if (name === 'building') {
      setApartments([]);
    }

    // Alt seviye API çağrıları (sadece değer seçildiğinde)
    if (value && value !== '') {
      if (name === 'city') {
        fetchWithAuthDistricts(value);
      } else if (name === 'district') {
        fetchWithAuthTowns(value);
      } else if (name === 'town') {
        fetchWithAuthNeighborhoods(value);
      } else if (name === 'neighborhood') {
        fetchWithAuthStreets(value);
      } else if (name === 'street') {
        fetchWithAuthBuildings(value);
      } else if (name === 'building') {
        fetchWithAuthApartments(value);
      }
    }

    // Adres alanları validasyonu (sadece manuel modda)
    if (propertyType === 'manual') {
      if (!value || value === '') {
        const fieldNames = {
          city: 'İl',
          district: 'İlçe',
          town: 'Belde/Bucak',
          neighborhood: 'Mahalle',
          street: 'Sokak/Cadde',
          building: 'Bina No/Adı',
          apartment: 'Daire No'
        };
        setErrors(prev => ({ 
          ...prev, 
          [name]: `${fieldNames[name as keyof typeof fieldNames]} seçimi zorunludur` 
        }));
      } else {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    }
  };

  // 2. handleChange fonksiyonunda UAVT No için maskeleme ve validasyon
  const handleChange = <T,>(name: string, value: T) => {
    if (name === 'uavtNo') {
      const sanitizedValue = String(value).replace(/[^0-9]/g, '').slice(0, 10);
      setFormData((prev) => ({ ...prev, uavtNo: sanitizedValue }));
      if (sanitizedValue.length === 0) {
        setErrors(prev => ({ ...prev, uavtNo: 'UAVT No zorunludur' }));
      } else if (sanitizedValue.length < 10) {
        setErrors(prev => ({ ...prev, uavtNo: 'UAVT No 10 haneli olmalıdır' }));
      } else {
        setErrors(prev => ({ ...prev, uavtNo: '' }));
      }
      return;
    }

    // Metrekare için maskeleme (sadece rakam)
    if (name === 'squareMeters') {
      const sanitizedValue = String(value).replace(/[^0-9]/g, '');
      setFormData((prev) => ({ ...prev, squareMeters: sanitizedValue }));
      
      // Metrekare validation
      const numValue = parseInt(sanitizedValue);
      if (!sanitizedValue) {
        setErrors(prev => ({ ...prev, squareMeters: 'Metrekare zorunludur' }));
      } else if (numValue < 40) {
        setErrors(prev => ({ ...prev, squareMeters: 'Metrekare en az 40 m² olmalıdır' }));
      } else if (numValue > 999) {
        setErrors(prev => ({ ...prev, squareMeters: 'Metrekare en fazla 999 m² olmalıdır' }));
      } else {
        setErrors(prev => ({ ...prev, squareMeters: '' }));
      }
      return;
    }

    // İnşa yılı için maskeleme (sadece rakam, 4 karakter)
    if (name === 'constructionYear') {
      const sanitizedValue = String(value).replace(/[^0-9]/g, '').slice(0, 4);
      setFormData((prev) => ({ ...prev, constructionYear: sanitizedValue }));
      
      // İnşa yılı validation
      if (!sanitizedValue) {
        setErrors(prev => ({ ...prev, constructionYear: 'Bina inşa yılı zorunludur' }));
      } else if (sanitizedValue.length === 4) {
        const year = parseInt(sanitizedValue);
        const currentYear = new Date().getFullYear();
        if (year < 1900 || year > currentYear) {
          setErrors(prev => ({ ...prev, constructionYear: `İnşa yılı 1900-${currentYear} arasında olmalıdır` }));
        } else {
          setErrors(prev => ({ ...prev, constructionYear: '' }));
        }
      } else {
        setErrors(prev => ({ ...prev, constructionYear: 'İnşa yılı 4 haneli olmalıdır' }));
      }
      return;
    }

    // Dairenin bulunduğu kat için maskeleme (rakam ve negatif işaret)
    if (name === 'apartmentFloor') {
      let cleanValue = String(value);
      
      // Sadece rakam, - ve boşluk karakterlerine izin ver
      cleanValue = cleanValue.replace(/[^0-9-]/g, '');
      
      // - işareti sadece başta olabilir
      if (cleanValue.indexOf('-') > 0) {
        cleanValue = cleanValue.replace(/-/g, '');
      }
      
      // Birden fazla - işaretini engelle
      if ((cleanValue.match(/-/g) || []).length > 1) {
        cleanValue = cleanValue.substring(0, cleanValue.lastIndexOf('-'));
      }
      
      // Maksimum 3 karakter (örn: -99, 999)
      if (cleanValue.length > 3) {
        cleanValue = cleanValue.substring(0, 3);
      }
      
      setFormData((prev) => ({ ...prev, apartmentFloor: cleanValue }));
      return;
    }

    // Select alanları için validasyon
    if (['usageType', 'damageStatus', 'constructionType', 'floorCountRange', 'ownershipType'].includes(name)) {
      // Kat aralığı değiştiğinde apartman katını temizle
      if (name === 'floorCountRange') {
        setFormData((prev) => ({ ...prev, [name]: value, apartmentFloor: '' }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
      
      // Boş değer kontrolü
      if (!value || value === '') {
        const fieldNames = {
          usageType: 'Konut kullanım şekli',
          damageStatus: 'Bina hasar durumu', 
          constructionType: 'Bina yapı tarzı',
          floorCountRange: 'Bina kat sayısı aralığı',
          ownershipType: 'Bina sahiplik türü'
        };
        setErrors(prev => ({ 
          ...prev, 
          [name]: `${fieldNames[name as keyof typeof fieldNames]} seçimi zorunludur` 
        }));
      } else {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Banka ve finans kurumlarını yükle
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/banks`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBanks(data);
        }
      } catch (error) {
      }
    };

    const fetchFinancialInstitutions = async () => {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/financial-institutions`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFinancialInstitutions(data);
        }
      } catch (error) {
      }
    };

    fetchBanks();
    fetchFinancialInstitutions();
  }, [accessToken, initialData]);

  // Banka şubelerini yükle
  const fetchBankBranches = async (bankId: string) => {
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/banks/${bankId}/branches`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBankBranches(data);
      }
    } catch (error) {
    }
  };

  // Banka seçimi değiştiğinde şubeleri yükle
  const handleBankChange = async (bankId: string) => {
    setSelectedBankId(bankId);
    setSelectedBranchId('');
    setBankBranches([]);
    
    const selectedBank = banks.find(b => b.id === bankId);
    setFormData(prev => ({
      ...prev,
      dainMurtehinBankId: bankId,
      dainMurtehinBankName: selectedBank?.name || '',
      dainMurtehinBranchId: '',
      dainMurtehinBranchName: '',
      dainMurtehinFinancialId: '',
      dainMurtehinFinancialName: ''
    }));
    // Banka seçildiğinde hata mesajını temizle
    setErrors(prev => ({
      ...prev,
      dainMurtehinBankId: bankId ? '' : prev.dainMurtehinBankId
    }));
    
    if (bankId) {
      await fetchBankBranches(bankId);
    }
  };

  // Şube seçimi değiştiğinde
  const handleBranchChange = (branchId: string) => {
    const selectedBranch = bankBranches.find(b => b.id === branchId);
    setFormData(prev => ({
      ...prev,
      dainMurtehinBranchId: branchId,
      dainMurtehinBranchName: selectedBranch?.name || ''
    }));
    // Şube seçildiğinde hata mesajını temizle
    setErrors(prev => ({
      ...prev,
      dainMurtehinBranchId: branchId ? '' : prev.dainMurtehinBranchId
    }));
  };

  // Finans kurumu seçimi değiştiğinde
  const handleFinancialInstitutionChange = (financialId: string) => {
    setSelectedFinancialId(financialId);
    
    const selectedFI = financialInstitutions.find(fi => fi.id === financialId);
    setFormData(prev => ({
      ...prev,
      dainMurtehinFinancialId: financialId,
      dainMurtehinFinancialName: selectedFI?.name || '',
      // Banka bilgilerini temizle
      dainMurtehinBankId: '',
      dainMurtehinBankName: '',
      dainMurtehinBranchId: '',
      dainMurtehinBranchName: ''
    }));
    // Finans kurumu seçildiğinde hata mesajını temizle
    setErrors(prev => ({
      ...prev,
      dainMurtehinFinancialId: financialId ? '' : prev.dainMurtehinFinancialId
    }));
  };

  // Dain-i mürtehin tipi değiştiğinde
  const handleDainMurtehinTypeChange = (type: 'none' | 'bank' | 'finance') => {
    setFormData(prev => ({
      ...prev,
      dainMurtehin: type,
      // Seçim değiştiğinde tüm alanları temizle
      dainMurtehinBankId: '',
      dainMurtehinBankName: '',
      dainMurtehinBranchId: '',
      dainMurtehinBranchName: '',
      dainMurtehinFinancialId: '',
      dainMurtehinFinancialName: ''
    }));
    setSelectedBankId('');
    setSelectedBranchId('');
    setSelectedFinancialId('');
    setBankBranches([]);
    // Hata mesajlarını da sıfırla
    setErrors(prev => ({
      ...prev,
      dainMurtehinBankId: '',
      dainMurtehinBranchId: '',
      dainMurtehinFinancialId: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    // Manuel mod için adres alanları validasyonu
    if (propertyType === 'manual') {
      // İl zorunlu
      if (!formData.city.value) {
        setErrors(prev => ({ ...prev, city: 'İl seçimi zorunludur' }));
        hasError = true;
      }
      // İlçe zorunlu
      if (!formData.district.value) {
        setErrors(prev => ({ ...prev, district: 'İlçe seçimi zorunludur' }));
        hasError = true;
      }
      // Belde-bucak zorunlu
      if (!formData.town.value) {
        setErrors(prev => ({ ...prev, town: 'Belde/Bucak seçimi zorunludur' }));
        hasError = true;
      }
      // Mahalle zorunlu
      if (!formData.neighborhood.value) {
        setErrors(prev => ({ ...prev, neighborhood: 'Mahalle seçimi zorunludur' }));
        hasError = true;
      }
      // Sokak-cadde zorunlu
      if (!formData.street.value) {
        setErrors(prev => ({ ...prev, street: 'Sokak/Cadde seçimi zorunludur' }));
        hasError = true;
      }
      // Bina zorunlu
      if (!formData.building.value) {
        setErrors(prev => ({ ...prev, building: 'Bina No/Adı seçimi zorunludur' }));
        hasError = true;
      }
      // Daire zorunlu
      if (!formData.apartment.value) {
        setErrors(prev => ({ ...prev, apartment: 'Daire No seçimi zorunludur' }));
        hasError = true;
      }
    }

    // UAVT mod için UAVT No validasyonu
    if (propertyType === 'uavt') {
      if (!formData.uavtNo) {
        setErrors(prev => ({ ...prev, uavtNo: 'UAVT No zorunludur' }));
        hasError = true;
      } else if (formData.uavtNo.length < 10) {
        setErrors(prev => ({ ...prev, uavtNo: 'UAVT No 10 haneli olmalıdır' }));
        hasError = true;
      }
    }

    // Metrekare zorunlu ve aralık kontrolü
    const squareMetersNum = parseInt(formData.squareMeters);
    if (!formData.squareMeters) {
      setErrors(prev => ({ ...prev, squareMeters: 'Metrekare zorunludur' }));
      hasError = true;
    } else if (squareMetersNum < 40) {
      setErrors(prev => ({ ...prev, squareMeters: 'Metrekare en az 40 m² olmalıdır' }));
      hasError = true;
    } else if (squareMetersNum > 999) {
      setErrors(prev => ({ ...prev, squareMeters: 'Metrekare en fazla 999 m² olmalıdır' }));
      hasError = true;
    }

    // İnşa yılı zorunlu ve aralık kontrolü
    if (!formData.constructionYear) {
      setErrors(prev => ({ ...prev, constructionYear: 'Bina inşa yılı zorunludur' }));
      hasError = true;
    } else if (formData.constructionYear.length !== 4) {
      setErrors(prev => ({ ...prev, constructionYear: 'İnşa yılı 4 haneli olmalıdır' }));
      hasError = true;
    } else {
      const year = parseInt(formData.constructionYear);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) {
        setErrors(prev => ({ ...prev, constructionYear: `İnşa yılı 1900-${currentYear} arasında olmalıdır` }));
        hasError = true;
      }
    }

    // Konut kullanım şekli zorunlu
    if (!formData.usageType) {
      setErrors(prev => ({ ...prev, usageType: 'Konut kullanım şekli seçimi zorunludur' }));
      hasError = true;
    }

    // Bina hasar durumu zorunlu
    if (!formData.damageStatus) {
      setErrors(prev => ({ ...prev, damageStatus: 'Bina hasar durumu seçimi zorunludur' }));
      hasError = true;
    }

    // Bina yapı tarzı zorunlu
    if (!formData.constructionType) {
      setErrors(prev => ({ ...prev, constructionType: 'Bina yapı tarzı seçimi zorunludur' }));
      hasError = true;
    }

    // Bina kat sayısı zorunlu
    if (!formData.floorCountRange) {
      setErrors(prev => ({ ...prev, floorCountRange: 'Bina kat sayısı aralığı seçimi zorunludur' }));
      hasError = true;
    }

    // Dairenin bulunduğu kat zorunlu (Input componenti kendi validasyonunu yapar)
    if (!formData.apartmentFloor || formData.apartmentFloor.trim() === '') {
      setErrors(prev => ({ ...prev, apartmentFloor: 'Dairenin bulunduğu kat zorunludur' }));
      hasError = true;
    } else if (!/^-?\d+$/.test(formData.apartmentFloor.trim())) {
      setErrors(prev => ({ ...prev, apartmentFloor: 'Sadece sayı girişi yapabilirsiniz' }));
      hasError = true;
    } else {
      const katNum = parseInt(formData.apartmentFloor.trim());
      if (katNum < -5 || katNum > 50) {
        setErrors(prev => ({ ...prev, apartmentFloor: 'Kat -5 ile 50 arasında olmalıdır' }));
        hasError = true;
      } else if (katNum > 0 && formData.floorCountRange) {
        const maxFloor = getMaxFloorFromRange(parseInt(formData.floorCountRange));
        if (maxFloor && katNum > maxFloor) {
          setErrors(prev => ({ 
            ...prev, 
            apartmentFloor: `Seçilen kat aralığına göre en fazla ${maxFloor}. kat girebilirsiniz` 
          }));
          hasError = true;
        }
      }
    }

    // Bina sahiplik türü zorunlu
    if (!formData.ownershipType) {
      setErrors(prev => ({ ...prev, ownershipType: 'Bina sahiplik türü seçimi zorunludur' }));
      hasError = true;
    }

    // Dain-i mürtehin doğrulama
    if (formData.dainMurtehin !== 'none') {
      if (formData.dainMurtehin === 'bank') {
        if (!formData.dainMurtehinBankId) {
          setErrors(prev => ({
            ...prev,
            dainMurtehinBankId: 'Lütfen banka seçiniz'
          }));
          hasError = true;
        }
        if (!formData.dainMurtehinBranchId) {
          setErrors(prev => ({
            ...prev,
            dainMurtehinBranchId: 'Lütfen banka şubesi seçiniz'
          }));
          hasError = true;
        }
      } else if (formData.dainMurtehin === 'finance') {
        if (!formData.dainMurtehinFinancialId) {
          setErrors(prev => ({
            ...prev,
            dainMurtehinFinancialId: 'Lütfen finans kurumu seçiniz'
          }));
          hasError = true;
        }
      }
    }

    if (hasError) {
      return;
    }

    // API isteği için veri yapısını hazırla
    const createData = {
      customerId: customerId,
      number: propertyType === 'manual' 
        ? (formData.apartment.value ? parseInt(formData.apartment.value) : null)
        : (formData.uavtNo ? parseInt(formData.uavtNo) : null),
      daskOldPolicyNumber: null, // Şu an için null olarak gönderiyoruz
      squareMeter: parseInt(formData.squareMeters) || 0,
      constructionYear: parseInt(formData.constructionYear) || new Date().getFullYear(),
      lossPayeeClause:
        formData.dainMurtehin !== 'none'
          ? {
              type: formData.dainMurtehin === 'bank' ? 'BANK' : 'FINANCIAL_INSTITUTION',
              bank: formData.dainMurtehin === 'bank' ? {
                id: formData.dainMurtehinBankId,
                name: formData.dainMurtehinBankName
              } : null,
              bankBranch: formData.dainMurtehin === 'bank' ? {
                id: formData.dainMurtehinBranchId,
                name: formData.dainMurtehinBranchName,
                bankId: formData.dainMurtehinBankId
              } : null,
              financialInstitution: formData.dainMurtehin === 'finance' ? {
                id: formData.dainMurtehinFinancialId,
                name: formData.dainMurtehinFinancialName
              } : null
            }
          : null,
      damageStatus: mapPropertyDamageStatusToBackendString(parseInt(formData.damageStatus) || PropertyDamageStatus.Unknown),
      floor: {
        totalFloors: mapFloorCountRangeToPayload(parseInt(formData.floorCountRange) || PropertyFloorCountRange.Unknown),
        currentFloor: parseInt(formData.apartmentFloor) || 0,
      },
      structure: mapPropertyStructureToBackendString(parseInt(formData.constructionType) || PropertyStructure.Unknown),
      utilizationStyle: mapPropertyUtilizationStyleToBackendString(parseInt(formData.usageType) || PropertyUtilizationStyle.Unknown),
      ownershipType: mapPropertyOwnershipTypeToBackendString(parseInt(formData.ownershipType) || PropertyOwnershipType.Unknown),
      // Adres bilgileri için gerekirse ek alanlar
      address: {
        city: formData.city,
        district: formData.district,
        town: formData.town,
        neighborhood: formData.neighborhood,
        street: formData.street,
        building: formData.building,
        apartment: formData.apartment,
      },
    };

    try {
      setIsLoading(true);

      let response;
      let url;

      if (isEditMode && initialData) {
        // Güncelleme işlemi
        url = `${API_BASE_URL}/api/customers/${customerId}/properties/${initialData.id}`;
        response = await fetchWithAuth(url, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            propertyId: initialData.id,
            ...createData,
          }),
        });
      } else {
        // Yeni konut ekleme işlemi
        url = `${API_BASE_URL}/api/customers/${customerId}/properties`;
        response = await fetchWithAuth(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createData),
        });
      }

      if (response.ok) {
        // Başarılı işlem
        onClose();
        onSuccess(); // Sayfa yenilemek yerine varlık listesini güncelleyecek
      } else {
        // Hata durumu
        const errorText = await response.text();
        alert(`İşlem sırasında bir hata oluştu: ${errorText}`);
      }
    } catch (error) {
      alert('İşlem yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUAVTQuery = async () => {
    if (!formData.uavtNo) {
      alert('Lütfen UAVT numarası giriniz');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/properties/query-address-by-property-number`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            propertyNumber: parseInt(formData.uavtNo),
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Eğer adresin tüm alanları boş veya '-' ise hata göster
        const isInvalidUAVT =
          (!data.city.value && !data.district.value && !data.town.value && !data.neighborhood.value && !data.street.value &&
            (!data.building.value || data.building.text === '-') &&
            (!data.apartment.value || data.apartment.text === '-'));

        if (isInvalidUAVT) {
          setErrors(prev => ({ ...prev, uavtNo: 'UAVT kodu hatalı' }));
          return;
        }

        // Gelen veriyi formData'ya yerleştir
        setFormData((prev) => ({
          ...prev,
          city: data.city,
          district: data.district,
          town: data.town,
          neighborhood: data.neighborhood,
          street: data.street,
          building: data.building,
          apartment: data.apartment,
        }));

        // Adres dropdown'larını yükle
        if (data.city.value) {
          fetchWithAuthDistricts(data.city.value);
        }
        if (data.district.value) {
          fetchWithAuthTowns(data.district.value);
        }
        if (data.town.value) {
          fetchWithAuthNeighborhoods(data.town.value);
        }
        if (data.neighborhood.value) {
          fetchWithAuthStreets(data.neighborhood.value);
        }
        if (data.street.value) {
          fetchWithAuthBuildings(data.street.value);
        }
        if (data.building.value) {
          fetchWithAuthApartments(data.building.value);
        }

        // UAVT tipini aktif et
        setPropertyType('uavt');
      } else {
        // Hata durumu
        const errorText = await response.text();
        alert(`UAVT sorgulanırken bir hata oluştu: ${errorText}`);
      }
    } catch (error) {
      alert('İşlem yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Konut tipi değiştiğinde adres bilgilerini temizle
  const handlePropertyTypeChange = (type: PropertyType) => {
    setPropertyType(type);
    
    // Adres bilgilerini temizle
    setFormData(prev => ({
      ...prev,
      city: { value: '', text: '' },
      district: { value: '', text: '' },
      town: { value: '', text: '' },
      neighborhood: { value: '', text: '' },
      street: { value: '', text: '' },
      building: { value: '', text: '' },
      apartment: { value: '', text: '' },
    }));

    // Adres dropdown'larını temizle
    setDistricts([]);
    setTowns([]);
    setNeighborhoods([]);
    setStreets([]);
    setBuildings([]);
    setApartments([]);

    // Adres error'larını temizle
    setErrors(prev => ({
      ...prev,
      city: '',
      district: '',
      town: '',
      neighborhood: '',
      street: '',
      building: '',
      apartment: '',
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4" style={{zIndex:9991}}>
      <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-4 md:p-6">
        <h2 className="mb-4 md:mb-6 text-lg md:text-xl font-bold text-gray-900">
          {initialData ? 'Konut Düzenle' : 'Konut Ekle'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Konut Tipi Seçimi - Sadece yeni konut eklerken göster */}
          {!isEditMode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <button
              type="button"
              onClick={() => handlePropertyTypeChange('uavt')}
              className={`flex flex-col items-center rounded-lg border p-3 md:p-4 text-center text-sm md:text-base font-medium transition-colors ${
                propertyType === 'uavt'
                  ? 'border-secondary bg-primary/10 text-secondary'
                  : 'hover:border-secondary hover:bg-primary/10'
              }`}
            >
              <span className="font-medium">UAVT ile Ekle</span>
            </button>
            <button
              type="button"
              onClick={() => handlePropertyTypeChange('manual')}
              className={`flex flex-col items-center rounded-lg border p-3 md:p-4 text-center text-sm md:text-base font-medium transition-colors ${
                propertyType === 'manual'
                  ? 'border-secondary bg-primary/10 text-secondary'
                  : 'hover:border-secondary hover:bg-primary/10'
              }`}
            >
              <span className="font-medium">Manuel Ekle</span>
            </button>
          </div>
          )}

          {/* UAVT/Adres Bilgileri */}
          <div>
            <h3 className="mb-3 md:mb-4 font-medium text-gray-900 text-sm md:text-base">Adres Bilgileri</h3>
            <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
              {propertyType === 'uavt' && !isEditMode && (
                <div className="md:col-span-2 mb-4 md:mb-6">
                  <div className="flex flex-col md:flex-row gap-2 md:items-start">
                    <div className="flex-1">
                      <Input
                        label="UAVT No"
                        value={formData.uavtNo}
                        onChange={(e) => handleChange('uavtNo', e.target.value)}
                        maxLength={10}
                        placeholder="10 haneli UAVT numarasını giriniz"
                      />
                      {errors.uavtNo && (
                        <p className="mt-1 text-xs text-red-500">{errors.uavtNo}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleUAVTQuery}
                      className="bg-secondary rounded-lg px-4 text-sm font-medium text-white transition-colors hover:bg-opacity-90 h-[52px] flex items-center justify-center shrink-0"
                      disabled={!formData.uavtNo || isLoading}
                    >
                      {isLoading ? 'Sorgulanıyor...' : 'Sorgula'}
                    </button>
                  </div>
                  <p className="mt-2 text-xs md:text-sm text-gray-500">
                    UAVT numarasını biliyorsanız, adres bilgilerini otomatik doldurmak için
                    sorgulayabilirsiniz.
                  </p>
                </div>
              )}

              {/* Düzenleme modunda UAVT No'yu sadece göster */}
              {isEditMode && (
                <div className="md:col-span-2 mb-4 md:mb-6">
                  <Input
                    label="UAVT No"
                    value={formData.uavtNo}
                    onChange={(e) => handleChange('uavtNo', e.target.value)}
                    maxLength={10}
                    placeholder="UAVT numarası"
                    disabled={true}
                  />
                </div>
              )}

              {/* İl Seçimi */}
              <div>
                <CustomSelect
                  label="İl"
                  value={formData.city.value}
                  onChange={(value) => handleChangeAddress('city', value)}
                  options={[
                    { value: '', label: 'Seçiniz' },
                    ...cities
                      .sort((a, b) => parseInt(a.value) - parseInt(b.value))
                      .map((city) => ({
                        value: city.value,
                        label: city.text,
                      })),
                  ]}
                  disabled={(propertyType === 'uavt' && !isEditMode) || isLoading}
                  searchable={true}
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                )}
              </div>

              {/* İlçe Seçimi */}
              <div>
                <CustomSelect
                  label="İlçe"
                  value={formData.district.value}
                  onChange={(value) => handleChangeAddress('district', value)}
                  options={[
                    { value: '', label: 'Seçiniz' },
                    ...districts
                      .sort((a, b) => a.text.localeCompare(b.text, 'tr'))
                      .map((district) => ({
                        value: district.value,
                        label: district.text,
                      })),
                  ]}
                  disabled={(propertyType === 'uavt' && !isEditMode) || !formData.city.value || isLoading}
                  searchable={true}
                />
                {errors.district && (
                  <p className="mt-1 text-xs text-red-500">{errors.district}</p>
                )}
              </div>

              {/* Belde/Bucak Seçimi */}
              <div>
                <CustomSelect
                  label="Belde/Bucak"
                  value={formData.town.value}
                  onChange={(value) => handleChangeAddress('town', value)}
                  options={[
                    { value: '', label: 'Seçiniz' },
                    ...towns
                      .sort((a, b) => a.text.localeCompare(b.text, 'tr'))
                      .map((town) => ({
                        value: town.value,
                        label: town.text,
                      })),
                  ]}
                  disabled={(propertyType === 'uavt' && !isEditMode) || !formData.district.value || isLoading}
                  searchable={true}
                />
                {errors.town && (
                  <p className="mt-1 text-xs text-red-500">{errors.town}</p>
                )}
              </div>

              {/* Mahalle Seçimi */}
              <div>
                <CustomSelect
                  label="Mahalle"
                  value={formData.neighborhood.value}
                  onChange={(value) => handleChangeAddress('neighborhood', value)}
                  options={[
                    { value: '', label: 'Seçiniz' },
                    ...neighborhoods
                      .sort((a, b) => a.text.localeCompare(b.text, 'tr'))
                      .map((neighborhood) => ({
                        value: neighborhood.value,
                        label: neighborhood.text,
                      })),
                  ]}
                  disabled={(propertyType === 'uavt' && !isEditMode) || !formData.town.value || isLoading}
                  searchable={true}
                />
                {errors.neighborhood && (
                  <p className="mt-1 text-xs text-red-500">{errors.neighborhood}</p>
                )}
              </div>

              {/* Sokak/Cadde Seçimi */}
              <div>
                <CustomSelect
                  label="Sokak/Cadde"
                  value={formData.street.value}
                  onChange={(value) => handleChangeAddress('street', value)}
                  options={[
                    { value: '', label: 'Seçiniz' },
                    ...streets
                      .sort((a, b) => a.text.localeCompare(b.text, 'tr'))
                      .map((street) => ({
                        value: street.value,
                        label: street.text,
                      })),
                  ]}
                  disabled={(propertyType === 'uavt' && !isEditMode) || !formData.neighborhood.value || isLoading}
                  searchable={true}
                />
                {errors.street && (
                  <p className="mt-1 text-xs text-red-500">{errors.street}</p>
                )}
              </div>

              {/* Bina ve Daire için manuel giriş */}
              <div>
                <CustomSelect
                  label="Bina No/Adı"
                  value={formData.building.value}
                  onChange={(value) => handleChangeAddress('building', value)}
                  options={[
                    { value: '', label: 'Seçiniz' },
                    ...buildings
                      .sort((a, b) => a.text.localeCompare(b.text, 'tr'))
                      .map((building) => ({
                        value: building.value,
                        label: building.text,
                      })),
                  ]}
                  disabled={(propertyType === 'uavt' && !isEditMode) || !formData.street.value || isLoading}
                  searchable={true}
                />
                {errors.building && (
                  <p className="mt-1 text-xs text-red-500">{errors.building}</p>
                )}
              </div>
              <div>
                <CustomSelect
                  label="Daire No"
                  value={formData.apartment.value}
                  onChange={(value) => handleChangeAddress('apartment', value)}
                  options={[
                    { value: '', label: 'Seçiniz' },
                    ...apartments
                      .sort((a, b) => a.text.localeCompare(b.text, 'tr'))
                      .map((apartment) => ({
                        value: apartment.value,
                        label: apartment.text,
                      })),
                  ]}
                  disabled={(propertyType === 'uavt' && !isEditMode) || !formData.building.value || isLoading}
                  searchable={true}
                />
                {errors.apartment && (
                  <p className="mt-1 text-xs text-red-500">{errors.apartment}</p>
                )}
              </div>
            </div>
          </div>

          {/* Genel Bilgiler */}
          <div>
            <h3 className="mb-3 md:mb-4 font-medium text-gray-900 text-sm md:text-base">Genel Bilgiler</h3>
            <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
              <Input
                label="Metrekare"
                type="text"
                value={formData.squareMeters}
                onChange={(e) => {
                  const value = e.target.value;
                  // Sadece rakam girişine izin ver
                  const numericValue = value.replace(/[^0-9]/g, '');
                  
                  // Maksimum 3 karakter (999) sınırı
                  const limitedValue = numericValue.slice(0, 3);
                  
                  // 0 ile başlamaya izin verme
                  const finalValue = limitedValue.replace(/^0+/, '');
                  
                  handleChange('squareMeters', finalValue);
                }}
                validate={(value) => {
                  if (!value) return { isValid: false, message: 'Metrekare zorunludur' };
                  const num = parseInt(value);
                  if (isNaN(num) || num < 40 || num > 999) {
                    return { isValid: false, message: 'Metrekare 40-999 arasında olmalıdır' };
                  }
                  return { isValid: true };
                }}
                showValidation={true}
                inputMode="numeric"
                pattern="[0-9]*"
              />
              <Input
                label="Yapım Yılı"
                type="text"
                value={formData.constructionYear}
                onChange={(e) => handleChange('constructionYear', e.target.value)}
              />

              <div>
                <CustomSelect
                  label="Konut Kullanım Şekli"
                  value={formData.usageType}
                  onChange={(value) => handleChange('usageType', value)}
                  options={utilizationStyleOptions.map((option) => ({
                    value: option.value.toString(),
                    label: option.label,
                  }))}
                  searchable={true}
                />
                {errors.usageType && (
                  <p className="mt-1 text-xs text-red-500">{errors.usageType}</p>
                )}
              </div>
              <div>
                <CustomSelect
                  label="Bina Hasar Durumu"
                  value={formData.damageStatus}
                  onChange={(value) => handleChange('damageStatus', value)}
                  options={damageStatusOptions.map((option) => ({
                    value: option.value.toString(),
                    label: option.label,
                  }))}
                  searchable={true}
                />
                {errors.damageStatus && (
                  <p className="mt-1 text-xs text-red-500">{errors.damageStatus}</p>
                )}
              </div>

            </div>
          </div>

          {/* Konut Kullanım Detayları */}
          <div>
            <h3 className="mb-3 md:mb-4 font-medium text-gray-900 text-sm md:text-base">Konut Kullanım Detayları</h3>
            <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
              <div>
                <CustomSelect
                  label="Bina Yapı Tarzı"
                  value={formData.constructionType}
                  onChange={(value) => handleChange('constructionType', value)}
                  options={structureTypeOptions.map((option) => ({
                    value: option.value.toString(),
                    label: option.label,
                  }))}
                  searchable={true}
                />
                {errors.constructionType && (
                  <p className="mt-1 text-xs text-red-500">{errors.constructionType}</p>
                )}
              </div>
              <div>
                <CustomSelect
                  label="Bina Sahiplik Türü"
                  value={formData.ownershipType}
                  onChange={(value) => handleChange('ownershipType', value)}
                  options={ownershipTypeOptions.map((option) => ({
                    value: option.value.toString(),
                    label: option.label,
                  }))}
                  searchable={true}
                />
                {errors.ownershipType && (
                  <p className="mt-1 text-xs text-red-500">{errors.ownershipType}</p>
                )}
              </div>
              <div>
                <CustomSelect
                  label="Bina Toplam Kat Sayısı"
                  value={formData.floorCountRange}
                  onChange={(value) => handleChange('floorCountRange', value)}
                  options={floorCountRangeOptions.map((option) => ({
                    value: option.value.toString(),
                    label: option.label,
                  }))}
                  searchable={true}
                />
                {errors.floorCountRange && (
                  <p className="mt-1 text-xs text-red-500">{errors.floorCountRange}</p>
                )}
              </div>
              <div>
                <Input
                  label="Bulunduğu Kat"
                  type="text"
                  value={formData.apartmentFloor}
                  onChange={(e) => handleChange('apartmentFloor', e.target.value)}
                  placeholder={formData.floorCountRange ? "Örn: 1, -1 (bodrum)" : "Önce kat sayısını seçin"}
                  disabled={!formData.floorCountRange}
                  validate={(value) => {
                    if (!formData.floorCountRange) {
                      return { isValid: false, message: 'Önce bina toplam kat sayısını seçin' };
                    }
                    
                    if (!value || value.trim() === '') {
                      return { isValid: false, message: 'Bulunduğu kat zorunludur' };
                    }
                    
                    // Sadece rakam ve negatif işaret kontrolü
                    if (!/^-?\d+$/.test(value.trim())) {
                      return { isValid: false, message: 'Sadece sayı girişi yapabilirsiniz' };
                    }
                    
                    const floorNum = parseInt(value.trim());
                    
                    // Genel sınırlar
                    if (floorNum < -5 || floorNum > 50) {
                      return { isValid: false, message: 'Kat -5 ile 50 arasında olmalıdır' };
                    }
                    
                    // Pozitif katlar için kat aralığı kontrolü
                    if (floorNum > 0 && formData.floorCountRange) {
                      const range = parseInt(formData.floorCountRange) as PropertyFloorCountRange;
                      const maxFloor = getMaxFloorFromRange(range);
                      if (maxFloor && floorNum > maxFloor) {
                        return { 
                          isValid: false, 
                          message: `Seçilen kat aralığına göre en fazla ${maxFloor}. kat girebilirsiniz` 
                        };
                      }
                    }
                    
                    return { isValid: true };
                  }}
                  showValidation={true}
                />
                {errors.apartmentFloor && (
                  <p className="mt-1 text-xs text-red-500">{errors.apartmentFloor}</p>
                )}
              </div>
            </div>
          </div>

          {/* Dain-i Mürtehin */}
          <div>
            <h3 className="mb-3 font-medium text-gray-900 text-sm md:text-base">Rehin Alacaklı Var mı? (Dain-i Mürtehin)</h3>
            <div className="flex flex-col md:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleDainMurtehinTypeChange('none')}
                className={`flex-1 rounded-lg border p-3 text-center text-sm font-medium transition-colors ${
                  formData.dainMurtehin === 'none'
                    ? 'border-secondary bg-primary/10 text-secondary'
                    : 'hover:border-secondary hover:bg-primary/10'
                }`}
              >
                Yok
              </button>
              <button
                type="button"
                onClick={() => handleDainMurtehinTypeChange('bank')}
                className={`flex-1 rounded-lg border p-3 text-center text-sm font-medium transition-colors ${
                  formData.dainMurtehin === 'bank'
                    ? 'border-secondary bg-primary/10 text-secondary'
                    : 'hover:border-secondary hover:bg-primary/10'
                }`}
              >
                Banka
              </button>
              <button
                type="button"
                onClick={() => handleDainMurtehinTypeChange('finance')}
                className={`flex-1 rounded-lg border p-3 text-center text-sm font-medium transition-colors ${
                  formData.dainMurtehin === 'finance'
                    ? 'border-secondary bg-primary/10 text-secondary'
                    : 'hover:border-secondary hover:bg-primary/10'
                }`}
              >
                Finans Kurumu
              </button>
            </div>

            {formData.dainMurtehin !== 'none' && (
              <div className="mt-4 space-y-4">
                {formData.dainMurtehin === 'bank' ? (
                  <>
                    <div>
                      <CustomSelect
                        label="Banka"
                        value={formData.dainMurtehinBankId}
                        onChange={(value) => handleBankChange(value)}
                        options={[
                          { value: '', label: 'Seçiniz' },
                          ...banks
                            .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
                            .map(bank => ({
                              value: bank.id,
                              label: bank.name
                            }))
                        ]}
                        searchable={true}
                      />
                      {errors.dainMurtehinBankId && (
                        <p className="mt-1 text-xs text-red-500">{errors.dainMurtehinBankId}</p>
                      )}
                    </div>
                    {formData.dainMurtehinBankId && bankBranches.length > 0 && (
                      <div>
                        <CustomSelect
                          label="Banka Şubesi"
                          value={formData.dainMurtehinBranchId}
                          onChange={(value) => handleBranchChange(value)}
                          options={[
                            { value: '', label: 'Seçiniz' },
                            ...bankBranches
                              .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
                              .map(branch => ({
                                value: branch.id,
                                label: branch.name
                              }))
                          ]}
                          searchable={true}
                        />
                        {errors.dainMurtehinBranchId && (
                          <p className="mt-1 text-xs text-red-500">{errors.dainMurtehinBranchId}</p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <CustomSelect
                      label="Finans Kurumu"
                      value={formData.dainMurtehinFinancialId}
                      onChange={(value) => handleFinancialInstitutionChange(value)}
                      options={[
                        { value: '', label: 'Seçiniz' },
                        ...financialInstitutions
                          .sort((a, b) => {
                            // İsimleri temizle (görünmeyen karakterleri kaldır)
                            const aClean = a.name.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
                            const bClean = b.name.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
                            
                            // İlk karakteri al
                            const aFirstChar = aClean.charAt(0).toUpperCase();
                            const bFirstChar = bClean.charAt(0).toUpperCase();
                            
                            // A-Z harfleri kontrol et (Türkçe karakterler dahil)
                            const aIsLetter = /^[A-ZÇĞIİÖŞÜ]/.test(aFirstChar);
                            const bIsLetter = /^[A-ZÇĞIİÖŞÜ]/.test(bFirstChar);
                            
                            // Eğer ikisi de harf ile başlıyorsa alfabetik sırala
                            if (aIsLetter && bIsLetter) {
                              return aClean.localeCompare(bClean, 'tr');
                            }
                            
                            // Eğer biri harf diğeri değilse, harf önce gelsin
                            if (aIsLetter && !bIsLetter) return -1;
                            if (!aIsLetter && bIsLetter) return 1;
                            
                            // İkisi de harf değilse alfabetik sırala
                            return aClean.localeCompare(bClean, 'tr');
                          })
                          .map(fi => ({
                            value: fi.id,
                            label: fi.name
                          }))
                      ]}
                      searchable={true}
                    />
                    {errors.dainMurtehinFinancialId && (
                      <p className="mt-1 text-xs text-red-500">{errors.dainMurtehinFinancialId}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="order-2 md:order-1 rounded-lg border border-gray-300 px-4 md:px-6 py-2.5 font-medium text-sm transition-colors hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isEditMode && !hasFormChanged()}
              className={`order-1 md:order-2 rounded-lg px-4 md:px-6 py-2.5 font-medium text-sm text-white transition-colors ${
                isEditMode && !hasFormChanged()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-secondary hover:bg-opacity-90'
              }`}
            >
              {isEditMode ? 'Değişiklikleri Kaydet' : 'Konut Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyModal;
