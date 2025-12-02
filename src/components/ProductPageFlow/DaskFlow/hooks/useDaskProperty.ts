
/**
 * Dask Flow - useDaskProperty Hook
 * 
 * Konut verilerini yönetir: properties, cities, districts, etc.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';

interface LocationOption {
    value: string;
    text: string;
}

interface UseDaskPropertyResult {
    // Data
    properties: any[];
    cities: LocationOption[];
    districts: LocationOption[];
    towns: LocationOption[];
    neighborhoods: LocationOption[];
    streets: LocationOption[];
    buildings: LocationOption[];
    apartments: LocationOption[];

    // Loading states
    isLoading: boolean;
    isAddressLoading: boolean;

    // Actions
    fetchDistricts: (cityValue: string) => Promise<void>;
    fetchTowns: (districtValue: string) => Promise<void>;
    fetchNeighborhoods: (townValue: string) => Promise<void>;
    fetchStreets: (neighborhoodValue: string) => Promise<void>;
    fetchBuildings: (streetValue: string) => Promise<void>;
    fetchApartments: (buildingValue: string) => Promise<void>;
    refetchProperties: () => Promise<void>;
    queryUavt: (uavtNo: string) => Promise<any>;
}

export const useDaskProperty = (): UseDaskPropertyResult => {
    const { accessToken, customerId } = useAuthStore();

    // Data states
    const [properties, setProperties] = useState<any[]>([]);
    const [cities, setCities] = useState<LocationOption[]>([]);
    const [districts, setDistricts] = useState<LocationOption[]>([]);
    const [towns, setTowns] = useState<LocationOption[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<LocationOption[]>([]);
    const [streets, setStreets] = useState<LocationOption[]>([]);
    const [buildings, setBuildings] = useState<LocationOption[]>([]);
    const [apartments, setApartments] = useState<LocationOption[]>([]);

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isAddressLoading, setIsAddressLoading] = useState(false);

    // Fetch cities - accessToken değiştiğinde de tekrar yükle
    useEffect(() => {
        const fetchCities = async () => {
            try {
                console.log('🔍 DASK - Cities API çağrısı yapılıyor:', API_ENDPOINTS.ADDRESS_CITIES);
                const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_CITIES);
                console.log('✅ DASK - Cities API response status:', response.status, response.ok);
                if (response.ok) {
                    const data = await response.json();
                    const sortedCities = data
                        .filter((c: any) => !['89', '999'].includes(c.value))
                        .sort((a: any, b: any) => parseInt(a.value) - parseInt(b.value));
                    setCities(sortedCities);
                    console.log('✅ DASK - Cities yüklendi:', sortedCities.length, 'şehir');
                } else {
                    const errorText = await response.text();
                    console.warn('⚠️ DASK - Cities API hatası:', response.status, errorText);
                }
            } catch (error) {
                console.error('❌ DASK - Failed to fetch cities:', error);
            }
        };
        fetchCities();
    }, [accessToken]); // accessToken değiştiğinde tekrar yükle

    // Fetch user properties
    useEffect(() => {
        const fetchProperties = async () => {
            if (!accessToken || !customerId) return;

            try {
                setIsLoading(true);
                const response = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_PROPERTIES(customerId), {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data)) {
                        setProperties(data);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch properties:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProperties();
    }, [accessToken, customerId]);

    // Refetch properties
    const refetchProperties = useCallback(async () => {
        if (!accessToken || !customerId) return;

        try {
            setIsLoading(true);
            const response = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_PROPERTIES(customerId), {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            if (response.ok) {
                const data = await response.json();
                if (Array.isArray(data)) {
                    setProperties(data);
                }
            }
        } catch (error) {
            console.error('Failed to refetch properties:', error);
        } finally {
            setIsLoading(false);
        }
    }, [accessToken, customerId]);

    // Address fetchers
    const fetchDistricts = useCallback(async (cityValue: string) => {
        if (!cityValue) { setDistricts([]); return; }
        try {
            setIsAddressLoading(true);
            const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_DISTRICTS(cityValue));
            if (response.ok) setDistricts(await response.json());
        } catch (e) { console.error(e); } finally { setIsAddressLoading(false); }
    }, []);

    const fetchTowns = useCallback(async (districtValue: string) => {
        if (!districtValue) { setTowns([]); return; }
        try {
            setIsAddressLoading(true);
            const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_TOWNS(districtValue));
            if (response.ok) setTowns(await response.json());
        } catch (e) { console.error(e); } finally { setIsAddressLoading(false); }
    }, []);

    const fetchNeighborhoods = useCallback(async (townValue: string) => {
        if (!townValue) { setNeighborhoods([]); return; }
        try {
            setIsAddressLoading(true);
            const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_NEIGHBORHOODS(townValue));
            if (response.ok) setNeighborhoods(await response.json());
        } catch (e) { console.error(e); } finally { setIsAddressLoading(false); }
    }, []);

    const fetchStreets = useCallback(async (neighborhoodValue: string) => {
        if (!neighborhoodValue) { setStreets([]); return; }
        try {
            setIsAddressLoading(true);
            const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_STREETS(neighborhoodValue));
            if (response.ok) setStreets(await response.json());
        } catch (e) { console.error(e); } finally { setIsAddressLoading(false); }
    }, []);

    const fetchBuildings = useCallback(async (streetValue: string) => {
        if (!streetValue) { setBuildings([]); return; }
        try {
            setIsAddressLoading(true);
            const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_BUILDINGS(streetValue));
            if (response.ok) setBuildings(await response.json());
        } catch (e) { console.error(e); } finally { setIsAddressLoading(false); }
    }, []);

    const fetchApartments = useCallback(async (buildingValue: string) => {
        if (!buildingValue) { setApartments([]); return; }
        try {
            setIsAddressLoading(true);
            const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_APARTMENTS(buildingValue));
            if (response.ok) setApartments(await response.json());
        } catch (e) { console.error(e); } finally { setIsAddressLoading(false); }
    }, []);

    const queryUavt = useCallback(async (uavtNo: string) => {
        try {
            const response = await fetchWithAuth(`${API_ENDPOINTS.PROPERTIES_QUERY_ADDRESS}?propertyNumber=${uavtNo}`);
            if (!response.ok) throw new Error('UAVT sorgulama başarısız');
            const data = await response.json();
            return data;
        } catch (err) {
            console.error(err);
            return null;
        }
    }, []);

    return {
        properties,
        cities,
        districts,
        towns,
        neighborhoods,
        streets,
        buildings,
        apartments,
        isLoading,
        isAddressLoading,
        fetchDistricts,
        fetchTowns,
        fetchNeighborhoods,
        fetchStreets,
        fetchBuildings,
        fetchApartments,
        refetchProperties,
        queryUavt
    };
};
