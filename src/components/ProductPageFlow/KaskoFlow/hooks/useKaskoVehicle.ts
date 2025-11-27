/**
 * Kasko Flow - useKaskoVehicle Hook
 * 
 * Araç verilerini yönetir: brands, models, cities, tramer query
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';
import { VehicleUtilizationStyle, VehicleFuelType } from '@/types/enums/vehicleEnums';
import type { ExistingVehicle } from '../types';

interface UseKaskoVehicleResult {
  // Data
  vehicles: ExistingVehicle[];
  vehicleBrands: Array<{ value: string; text: string }>;
  vehicleModels: Array<{ value: string; text: string }>;
  plateCities: Array<{ value: string; text: string }>;
  cities: Array<{ value: string; text: string }>;
  districts: Array<{ value: string; text: string }>;
  
  // Loading states
  isLoading: boolean;
  isModelsLoading: boolean;
  isTramerLoading: boolean;
  
  // Errors
  modelError: string | null;
  
  // Actions
  fetchModels: (brandCode: string, modelYear: string) => Promise<void>;
  fetchDistricts: (cityValue: string) => Promise<void>;
  queryTramer: (plateCity: string, plateCode: string, documentSerialCode?: string, documentSerialNumber?: string) => Promise<any>;
  refetchVehicles: () => Promise<void>;
  setModelError: (error: string | null) => void;
}

export const useKaskoVehicle = (): UseKaskoVehicleResult => {
  const { accessToken, customerId } = useAuthStore();

  // Data states
  const [vehicles, setVehicles] = useState<ExistingVehicle[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<Array<{ value: string; text: string }>>([]);
  const [vehicleModels, setVehicleModels] = useState<Array<{ value: string; text: string }>>([]);
  const [plateCities, setPlateCities] = useState<Array<{ value: string; text: string }>>([]);
  const [cities, setCities] = useState<Array<{ value: string; text: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ value: string; text: string }>>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isModelsLoading, setIsModelsLoading] = useState(false);
  const [isTramerLoading, setIsTramerLoading] = useState(false);

  // Error states
  const [modelError, setModelError] = useState<string | null>(null);

  // Fetch vehicle brands
  useEffect(() => {
    const fetchBrands = async () => {
      if (!accessToken) return;

      try {
        const response = await fetchWithAuth(API_ENDPOINTS.VEHICLE_BRANDS, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          setVehicleBrands(data.sort((a: any, b: any) =>
            a.text.localeCompare(b.text, 'tr-TR')
          ));
        }
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      }
    };

    fetchBrands();
  }, [accessToken]);

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_CITIES);

        if (response.ok) {
          const data = await response.json();
          const sortedCities = data
            .filter((c: any) => !['89', '999'].includes(c.value))
            .sort((a: any, b: any) => parseInt(a.value) - parseInt(b.value));

          setPlateCities(sortedCities);
          setCities(sortedCities);
        }
      } catch (error) {
        console.error('Failed to fetch cities:', error);
      }
    };

    fetchCities();
  }, [accessToken]);

  // Fetch user vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      if (!accessToken || !customerId) return;

      try {
        setIsLoading(true);
        const response = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_VEHICLES, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            const vehicleList = data.map((v: any) => {
              const plateCity = v.plate?.city ? String(v.plate.city) : '';
              const plateCode = v.plate?.code || '';
              const plateNumber = plateCity && plateCode
                ? `${plateCity.padStart(2, '0')} ${plateCode}`.trim()
                : '';

              return {
                id: v.id || '',
                brand: v.model?.brand?.text || '',
                model: v.model?.type?.text || '',
                year: v.model?.year || new Date().getFullYear(),
                plateNumber,
                plateCity,
                plateCode,
                vehicleType: v.type || 'car',
              };
            });

            setVehicles(vehicleList);
          }
        }
      } catch (error) {
        console.error('Failed to fetch vehicles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, [accessToken, customerId]);

  // Refetch vehicles
  const refetchVehicles = useCallback(async () => {
    if (!accessToken || !customerId) return;

    try {
      setIsLoading(true);
      const response = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_VEHICLES, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          const vehicleList = data.map((v: any) => {
            const plateCity = v.plate?.city ? String(v.plate.city) : '';
            const plateCode = v.plate?.code || '';
            const plateNumber = plateCity && plateCode
              ? `${plateCity.padStart(2, '0')} ${plateCode}`.trim()
              : '';

            return {
              id: v.id || '',
              brand: v.model?.brand?.text || '',
              model: v.model?.type?.text || '',
              year: v.model?.year || new Date().getFullYear(),
              plateNumber,
              plateCity,
              plateCode,
              vehicleType: v.type || 'car',
            };
          });

          setVehicles(vehicleList);
        }
      }
    } catch (error) {
      console.error('Failed to refetch vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, customerId]);

  // Fetch models
  const fetchModels = useCallback(async (brandCode: string, modelYear: string) => {
    if (!accessToken || !brandCode || !modelYear || modelYear.length !== 4) return;

    try {
      setIsModelsLoading(true);
      setVehicleModels([]);
      setModelError(null);

      const response = await fetchWithAuth(
        API_ENDPOINTS.VEHICLE_MODELS(brandCode, modelYear),
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.ok) {
        const data = await response.json();

        // Duplicate'ları temizle
        const uniqueModels = data.reduce((acc: any[], curr: any) => {
          if (!acc.find(m => m.value === curr.value)) {
            acc.push(curr);
          }
          return acc;
        }, []);

        // Alfabetik sırala
        const sortedModels = uniqueModels.sort((a: any, b: any) =>
          a.text.localeCompare(b.text, 'tr-TR')
        );

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
      console.error('Failed to fetch models:', error);
      setModelError('Araç modelleri yüklenirken bir hata oluştu.');
    } finally {
      setIsModelsLoading(false);
    }
  }, [accessToken, vehicleBrands]);

  // Fetch districts
  const fetchDistricts = useCallback(async (cityValue: string) => {
    if (!cityValue) {
      setDistricts([]);
      return;
    }

    try {
      const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_DISTRICTS(cityValue));
      if (response.ok) {
        const data = await response.json();
        setDistricts(data);
      }
    } catch (error) {
      console.error('Failed to fetch districts:', error);
    }
  }, []);

  // Query Tramer
  const queryTramer = useCallback(async (
    plateCity: string,
    plateCode: string,
    documentSerialCode?: string,
    documentSerialNumber?: string
  ) => {
    if (!accessToken || !customerId) {
      throw new Error('Müşteri ID alınamadı');
    }

    setIsTramerLoading(true);

    try {
      const tramerData = {
        plate: {
          city: plateCity,
          code: plateCode,
        },
        ...(documentSerialCode && documentSerialNumber && {
          documentSerial: {
            code: documentSerialCode,
            number: documentSerialNumber,
          },
        }),
      };

      const response = await fetchWithAuth(
        API_ENDPOINTS.CUSTOMER_VEHICLES_QUERY(customerId),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(tramerData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        
        // Kullanım şekli ve yakıt tipi dönüşümü
        let usageTypeValue: number | string = '';
        if (result.utilizationStyle === 'PRIVATE_CAR') {
          usageTypeValue = VehicleUtilizationStyle.PrivateCar;
        } else if (result.utilizationStyle === 'TAXI') {
          usageTypeValue = VehicleUtilizationStyle.Taxi;
        } else if (result.utilizationStyle === 'COMMERCIAL') {
          usageTypeValue = VehicleUtilizationStyle.RouteBasedMinibus;
        } else if (result.utilizationStyle === 'MOTORCYCLE') {
          usageTypeValue = VehicleUtilizationStyle.Motorcycle;
        }

        let fuelTypeValue: number | string = '';
        if (result.fuelType === 'GASOLINE') {
          fuelTypeValue = VehicleFuelType.Gasoline;
        } else if (result.fuelType === 'DIESEL') {
          fuelTypeValue = VehicleFuelType.Diesel;
        } else if (result.fuelType === 'LPG') {
          fuelTypeValue = VehicleFuelType.Lpg;
        } else if (result.fuelType === 'ELECTRIC') {
          fuelTypeValue = VehicleFuelType.Electric;
        } else if (result.fuelType === 'LPG_GASOLINE') {
          fuelTypeValue = VehicleFuelType.LpgGasoline;
        }

        return {
          ...result,
          usageTypeValue,
          fuelTypeValue,
        };
      }

      return null;
    } catch (error) {
      console.error('Tramer query error:', error);
      return null;
    } finally {
      setIsTramerLoading(false);
    }
  }, [accessToken, customerId]);

  return {
    vehicles,
    vehicleBrands,
    vehicleModels,
    plateCities,
    cities,
    districts,
    isLoading,
    isModelsLoading,
    isTramerLoading,
    modelError,
    fetchModels,
    fetchDistricts,
    queryTramer,
    refetchVehicles,
    setModelError,
  };
};

