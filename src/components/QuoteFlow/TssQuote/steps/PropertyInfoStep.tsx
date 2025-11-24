import {
  Box,
  Button,
  Grid,
  Typography,
  FormHelperText,
  Divider,
  CircularProgress,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useAuthStore } from '../../../../store/useAuthStore';
import CustomSelect from '../../../common/Input/CustomSelect';
import Input from '../../../common/Input/Input';
import { fetchWithAuth } from '../../../../services/fetchWithAuth';

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
  Masonry = 2,
  Steel = 3,
  Wood = 4,
  Other = 5,
}

enum PropertyDamageStatus {
  Unknown = 0,
  None = 1,
  SlightlyDamaged = 2,
  ModeratelyDamaged = 3,
  SeverelyDamaged = 4,
}

enum PropertyFloorNumber {
  Unknown = 0,
  Between1And3 = 1,
  Between4And7 = 2,
  Between8And18 = 3,
  MoreThan19 = 4,
}

enum PropertyOwnershipType {
  Unknown = 0,
  Proprietor = 1,
  Tenant = 2,
}

// AddPropertyModal'daki gibi seçenekler
const utilizationStyleOptions = [
  { value: PropertyUtilizationStyle.Unknown, label: 'Bilinmiyor' },
  { value: PropertyUtilizationStyle.House, label: 'Konut' },
  { value: PropertyUtilizationStyle.Business, label: 'İşyeri' },
  { value: PropertyUtilizationStyle.Other, label: 'Diğer' },
];

const structureTypeOptions = [
  { value: PropertyStructure.Unknown, label: 'Bilinmiyor' },
  { value: PropertyStructure.SteelReinforcedConcrete, label: 'Betonarme' },
  { value: PropertyStructure.Masonry, label: 'Yığma Kargir' },
  { value: PropertyStructure.Steel, label: 'Çelik' },
  { value: PropertyStructure.Wood, label: 'Ahşap' },
  { value: PropertyStructure.Other, label: 'Diğer' },
];

const damageStatusOptions = [
  { value: PropertyDamageStatus.Unknown, label: 'Bilinmiyor' },
  { value: PropertyDamageStatus.None, label: 'Hasarsız' },
  { value: PropertyDamageStatus.SlightlyDamaged, label: 'Az Hasarlı' },
  { value: PropertyDamageStatus.ModeratelyDamaged, label: 'Orta Hasarlı' },
  { value: PropertyDamageStatus.SeverelyDamaged, label: 'Ağır Hasarlı' },
];

const floorNumberOptions = [
  { value: PropertyFloorNumber.Unknown, label: 'Bilinmiyor' },
  { value: PropertyFloorNumber.Between1And3, label: '1-3 Kat' },
  { value: PropertyFloorNumber.Between4And7, label: '4-7 Kat' },
  { value: PropertyFloorNumber.Between8And18, label: '8-18 Kat' },
  { value: PropertyFloorNumber.MoreThan19, label: '19+ Kat' },
];

const ownershipTypeOptions = [
  { value: PropertyOwnershipType.Unknown, label: 'Bilinmiyor' },
  { value: PropertyOwnershipType.Proprietor, label: 'Malik' },
  { value: PropertyOwnershipType.Tenant, label: 'Kiracı' },
];

interface PropertyInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  formData?: Record<string, unknown>;
  updateFormData?: (data: Record<string, unknown>) => void;
}

interface LocationOption {
  value: string;
  text: string;
}

const validationSchema = yup.object({
  // UAVT/Adres alanları
  uavtNo: yup.string(),
  city: yup.object({
    value: yup.string().required('İl seçimi gereklidir'),
    text: yup.string(),
  }),
  district: yup.object({
    value: yup.string().required('İlçe seçimi gereklidir'),
    text: yup.string(),
  }),
  town: yup.object({
    value: yup.string(),
    text: yup.string(),
  }),
  neighborhood: yup.object({
    value: yup.string().required('Mahalle seçimi gereklidir'),
    text: yup.string(),
  }),
  street: yup.object({
    value: yup.string(),
    text: yup.string(),
  }),
  building: yup.object({
    value: yup.string(),
    text: yup.string(),
  }),
  apartment: yup.object({
    value: yup.string(),
    text: yup.string(),
  }),

  // Genel bilgiler
  squareMeters: yup.string().required('Metrekare gereklidir'),
  constructionYear: yup.string().required('İnşaat yılı gereklidir'),

  // Yapı ve kullanım detayları
  usageType: yup.string().required('Kullanım şekli gereklidir'),
  damageStatus: yup.string().required('Hasar durumu gereklidir'),
  constructionType: yup.string().required('Yapı tarzı gereklidir'),
  floorCount: yup.string().required('Kat sayısı gereklidir'),
  ownershipType: yup.string().required('Sahiplik türü gereklidir'),

  // Dain-i mürtehim
  dainMurtehin: yup.string().required('Dain-i mürtehim seçimi gereklidir'),
  dainMurtehinText: yup.string().when('dainMurtehin', {
    is: (val: string) => val !== 'none',
    then: () => yup.string().required('Dain-i mürtehim adı gereklidir'),
    otherwise: () => yup.string(),
  }),
});

type PropertyType = 'uavt' | 'manual' | 'dask';

export default function PropertyInfoStep({
  onNext,
  onBack,
  formData: initialFormData,
  updateFormData,
}: PropertyInfoStepProps) {
  const token = useAuthStore((state) => state.token);
  const customerData = useAuthStore((state) => state.customerData);

  // Adres bilgileri için state'ler
  const [cities, setCities] = useState<Array<LocationOption>>([]);
  const [districts, setDistricts] = useState<Array<LocationOption>>([]);
  const [towns, setTowns] = useState<Array<LocationOption>>([]);
  const [neighborhoods, setNeighborhoods] = useState<Array<LocationOption>>([]);
  const [streets, setStreets] = useState<Array<LocationOption>>([]);
  const [buildings, setBuildings] = useState<Array<LocationOption>>([]);
  const [apartments, setApartments] = useState<Array<LocationOption>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [propertyType, setPropertyType] = useState<PropertyType>('manual');

  const [formData, setFormData] = useState({
    // UAVT/Adres Bilgileri
    uavtNo: '',
    city: {
      value: '',
      text: '',
    },
    district: {
      value: '',
      text: '',
    },
    town: {
      value: '',
      text: '',
    },
    neighborhood: {
      value: '',
      text: '',
    },
    street: {
      value: '',
      text: '',
    },
    building: {
      value: '',
      text: '',
    },
    apartment: {
      value: '',
      text: '',
    },

    // Genel Bilgiler
    squareMeters: '',
    constructionYear: new Date().getFullYear().toString(),

    // Yapı ve Kullanım Detayları
    usageType: '0',
    damageStatus: '0',
    constructionType: '0',
    floorCount: '0',
    ownershipType: '0',

    // Diğer
    dainMurtehin: 'none',
    dainMurtehinText: '',
  });

  // İlleri yükleme
  useEffect(() => {
    const fetchWithAuthInitialData = async () => {
      try {
        setIsLoading(true);

        // İlleri yükle
        const citiesResponse = await fetchWithAuth(
          `${import.meta.env.VITE_API_URL}/api/address-parameters/cities`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (citiesResponse.ok) {
          const citiesData = await citiesResponse.json();
          setCities(citiesData);
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchWithAuthInitialData();
  }, [token]);

  // Formik yerine direkt AddPropertyModal'daki gibi form state yönetiyoruz
  const handleChange = <T,>(name: string, value: T) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Ana sayfa state'i güncelleyelim
    if (updateFormData) {
      updateFormData({ [name]: value });
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

    // Form verisini güncelle
    setFormData((prev) => ({
      ...prev,
      [name]: {
        value,
        text: selectedItem?.text || '',
      },
    }));

    // Ana sayfa state'i güncelleyelim
    if (updateFormData) {
      updateFormData({
        [name]: {
          value,
          text: selectedItem?.text || '',
        },
      });
    }

    // API çağrılarını başlat
    if (name === 'city' && value) {
      fetchWithAuthDistricts(value);

      // Alt alanları temizle
      setDistricts([]);
      setTowns([]);
      setNeighborhoods([]);
      setStreets([]);
      setBuildings([]);
      setApartments([]);

      handleChange('district', { value: '', text: '' });
      handleChange('town', { value: '', text: '' });
      handleChange('neighborhood', { value: '', text: '' });
      handleChange('street', { value: '', text: '' });
      handleChange('building', { value: '', text: '' });
      handleChange('apartment', { value: '', text: '' });
    } else if (name === 'district' && value) {
      fetchWithAuthTowns(value);

      // Alt alanları temizle
      setTowns([]);
      setNeighborhoods([]);
      setStreets([]);
      setBuildings([]);
      setApartments([]);

      handleChange('town', { value: '', text: '' });
      handleChange('neighborhood', { value: '', text: '' });
      handleChange('street', { value: '', text: '' });
      handleChange('building', { value: '', text: '' });
      handleChange('apartment', { value: '', text: '' });
    } else if (name === 'town' && value) {
      fetchWithAuthNeighborhoods(value);

      // Alt alanları temizle
      setNeighborhoods([]);
      setStreets([]);
      setBuildings([]);
      setApartments([]);

      handleChange('neighborhood', { value: '', text: '' });
      handleChange('street', { value: '', text: '' });
      handleChange('building', { value: '', text: '' });
      handleChange('apartment', { value: '', text: '' });
    } else if (name === 'neighborhood' && value) {
      fetchWithAuthStreets(value);

      // Alt alanları temizle
      setStreets([]);
      setBuildings([]);
      setApartments([]);

      handleChange('street', { value: '', text: '' });
      handleChange('building', { value: '', text: '' });
      handleChange('apartment', { value: '', text: '' });
    } else if (name === 'street' && value) {
      fetchWithAuthBuildings(value);

      // Alt alanları temizle
      setBuildings([]);
      setApartments([]);

      handleChange('building', { value: '', text: '' });
      handleChange('apartment', { value: '', text: '' });
    } else if (name === 'building' && value) {
      fetchWithAuthApartments(value);

      // Alt alanları temizle
      setApartments([]);

      handleChange('apartment', { value: '', text: '' });
    }
  };

  // Adres sorgulama fonksiyonlarını useEffect dışına taşıyalım
  const fetchWithAuthDistricts = async (cityValue: string) => {
    try {
      setIsLoading(true);
      const response = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/address-parameters/districts?cityReference=${cityValue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
        `${import.meta.env.VITE_API_URL}/api/address-parameters/towns?districtReference=${districtValue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
        `${import.meta.env.VITE_API_URL}/api/address-parameters/neighbourhoods?townReference=${townValue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
        `${import.meta.env.VITE_API_URL}/api/address-parameters/streets?neighbourhoodReference=${neighborhoodValue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
        `${import.meta.env.VITE_API_URL}/api/address-parameters/buildings?streetReference=${streetValue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
        `${import.meta.env.VITE_API_URL}/api/address-parameters/apartments?buildingReference=${buildingValue}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
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

  // UAVT sorgulama
  const handleUAVTQuery = async () => {
    if (!formData.uavtNo) {
      alert('Lütfen UAVT numarası giriniz');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetchWithAuth(
        `${import.meta.env.VITE_API_URL}/api/properties/query-address-by-property-number`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            propertyNumber: parseInt(formData.uavtNo),
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();

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

  // Devam et butonuna basıldığında
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Form verilerini ana sayfaya gönder
    if (updateFormData) {
      updateFormData(formData);
    }

    // Sonraki adıma geç
    onNext();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Tamamlayıcı Sağlık Sigortası için Gayrimenkul Bilgileri
      </Typography>

      <Typography variant="body2" color="text.secondary" paragraph align="center">
        Lütfen Tamamlayıcı Sağlık Sigortası teklifiniz için gayrimenkul bilgilerinizi eksiksiz doldurunuz.
      </Typography>

      <Divider sx={{ my: 3 }} />

      {/* UAVT/Adres Bilgileri */}
      <Typography variant="h6" gutterBottom>
        Adres Bilgileri
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Input
              label="UAVT No"
              value={formData.uavtNo}
              onChange={(e) => handleChange('uavtNo', e.target.value)}
              className="grow"
            />
            <Button
              variant="contained"
              onClick={handleUAVTQuery}
              disabled={!formData.uavtNo || isLoading}
              sx={{ mt: 3.5 }}
            >
              {isLoading ? 'Sorgulanıyor...' : 'Sorgula'}
            </Button>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            UAVT numarasını biliyorsanız, adres bilgilerini otomatik doldurmak için
            sorgulayabilirsiniz.
          </Typography>
        </Grid>

        {/* İl Seçimi */}
        <Grid item xs={12} md={6}>
          <CustomSelect
            label="İl"
            value={formData.city.value}
            onChange={(value) => handleChangeAddress('city', value)}
            options={[
              { value: '', label: 'Seçiniz' },
              ...cities.map((city) => ({
                value: city.value,
                label: city.text,
              })),
            ]}
            disabled={propertyType === 'uavt' || isLoading}
          />
        </Grid>

        {/* İlçe Seçimi */}
        <Grid item xs={12} md={6}>
          <CustomSelect
            label="İlçe"
            value={formData.district.value}
            onChange={(value) => handleChangeAddress('district', value)}
            options={[
              { value: '', label: 'Seçiniz' },
              ...districts.map((district) => ({
                value: district.value,
                label: district.text,
              })),
            ]}
            disabled={propertyType === 'uavt' || !formData.city.value || isLoading}
          />
        </Grid>

        {/* Belde/Bucak Seçimi */}
        <Grid item xs={12} md={6}>
          <CustomSelect
            label="Belde/Bucak"
            value={formData.town.value}
            onChange={(value) => handleChangeAddress('town', value)}
            options={[
              { value: '', label: 'Seçiniz' },
              ...towns.map((town) => ({
                value: town.value,
                label: town.text,
              })),
            ]}
            disabled={propertyType === 'uavt' || !formData.district.value || isLoading}
          />
        </Grid>

        {/* Mahalle Seçimi */}
        <Grid item xs={12} md={6}>
          <CustomSelect
            label="Mahalle"
            value={formData.neighborhood.value}
            onChange={(value) => handleChangeAddress('neighborhood', value)}
            options={[
              { value: '', label: 'Seçiniz' },
              ...neighborhoods.map((neighborhood) => ({
                value: neighborhood.value,
                label: neighborhood.text,
              })),
            ]}
            disabled={propertyType === 'uavt' || !formData.town.value || isLoading}
          />
        </Grid>

        {/* Sokak/Cadde Seçimi */}
        <Grid item xs={12} md={6}>
          <CustomSelect
            label="Sokak/Cadde"
            value={formData.street.value}
            onChange={(value) => handleChangeAddress('street', value)}
            options={[
              { value: '', label: 'Seçiniz' },
              ...streets.map((street) => ({
                value: street.value,
                label: street.text,
              })),
            ]}
            disabled={propertyType === 'uavt' || !formData.neighborhood.value || isLoading}
          />
        </Grid>

        {/* Bina Seçimi */}
        <Grid item xs={12} md={6}>
          <CustomSelect
            label="Bina No/Adı"
            value={formData.building.value}
            onChange={(value) => handleChangeAddress('building', value)}
            options={[
              { value: '', label: 'Seçiniz' },
              ...buildings.map((building) => ({
                value: building.value,
                label: building.text,
              })),
            ]}
            disabled={propertyType === 'uavt' || !formData.street.value || isLoading}
          />
        </Grid>

        {/* Daire Seçimi */}
        <Grid item xs={12} md={6}>
          <CustomSelect
            label="Daire No"
            value={formData.apartment.value}
            onChange={(value) => handleChangeAddress('apartment', value)}
            options={[
              { value: '', label: 'Seçiniz' },
              ...apartments.map((apartment) => ({
                value: apartment.value,
                label: apartment.text,
              })),
            ]}
            disabled={propertyType === 'uavt' || !formData.building.value || isLoading}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Genel Bilgiler */}
      <Typography variant="h6" gutterBottom>
        Genel Bilgiler
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <Input
            label="Metrekare"
            type="number"
            value={formData.squareMeters}
            onChange={(e) => handleChange('squareMeters', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Input
            label="Bina İnşa Yılı"
            type="number"
            placeholder="yyyy"
            value={formData.constructionYear}
            onChange={(e) => handleChange('constructionYear', e.target.value)}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Konut Kullanım Detayları */}
      <Typography variant="h6" gutterBottom>
        Konut Kullanım Detayları
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <CustomSelect
            label="Konut Kullanım Şekli"
            value={formData.usageType}
            onChange={(value) => handleChange('usageType', value)}
            options={utilizationStyleOptions.map((option) => ({
              value: option.value.toString(),
              label: option.label,
            }))}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomSelect
            label="Bina Hasar Durumu"
            value={formData.damageStatus}
            onChange={(value) => handleChange('damageStatus', value)}
            options={damageStatusOptions.map((option) => ({
              value: option.value.toString(),
              label: option.label,
            }))}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Bina Detayları */}
      <Typography variant="h6" gutterBottom>
        Bina Detayları
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <CustomSelect
            label="Bina Yapı Tarzı"
            value={formData.constructionType}
            onChange={(value) => handleChange('constructionType', value)}
            options={structureTypeOptions.map((option) => ({
              value: option.value.toString(),
              label: option.label,
            }))}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomSelect
            label="Bina Kat Sayısı"
            value={formData.floorCount}
            onChange={(value) => handleChange('floorCount', value)}
            options={floorNumberOptions.map((option) => ({
              value: option.value.toString(),
              label: option.label,
            }))}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <CustomSelect
            label="Bina Sahiplik Türü"
            value={formData.ownershipType}
            onChange={(value) => handleChange('ownershipType', value)}
            options={ownershipTypeOptions.map((option) => ({
              value: option.value.toString(),
              label: option.label,
            }))}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Dain-i Mürtehin */}
      <Typography variant="h6" gutterBottom>
        Dain-i Mürtehin
      </Typography>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant={formData.dainMurtehin === 'none' ? 'contained' : 'outlined'}
                onClick={() => handleChange('dainMurtehin', 'none')}
                sx={{ p: 2 }}
              >
                Yok
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant={formData.dainMurtehin === 'bank' ? 'contained' : 'outlined'}
                onClick={() => handleChange('dainMurtehin', 'bank')}
                sx={{ p: 2 }}
              >
                Banka
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                variant={formData.dainMurtehin === 'finance' ? 'contained' : 'outlined'}
                onClick={() => handleChange('dainMurtehin', 'finance')}
                sx={{ p: 2 }}
              >
                Finans Kurumu
              </Button>
            </Grid>
          </Grid>
        </Grid>

        {formData.dainMurtehin !== 'none' && (
          <Grid item xs={12} md={6}>
            <Input
              label="Dain-i Mürtehin Adı"
              value={formData.dainMurtehinText}
              onChange={(e) => handleChange('dainMurtehinText', e.target.value)}
            />
          </Grid>
        )}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button 
          variant="outlined" 
          color="inherit" 
          onClick={onBack} 
          disabled={isLoading}
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
          type="submit" 
          variant="contained" 
          color="primary" 
          disabled={isLoading}
          sx={{
            minWidth: 200,
            height: 48,
            borderRadius: 2,
            ml: 'auto',
            textTransform: 'none',
          }}
        >
          {isLoading ? (
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
