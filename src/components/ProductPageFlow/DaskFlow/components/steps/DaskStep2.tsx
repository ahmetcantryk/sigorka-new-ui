/**
 * DaskStep2 - Konut Bilgileri Adımı
 * 
 * PropertyInfoStep.tsx'den alınan tüm özellikler:
 * - UAVT sorgulaması (tam genişlik input + sorgula butonu)
 * - Eski poliçe ile yenileme sorgulaması
 * - Manuel adres girişi (il → ilçe → belde → mahalle → sokak → bina → daire)
 * - Kayıtlı konutlardan seçim
 * - Konut detay bilgileri (yapı tarzı, inşa yılı, kat bilgileri, m², kullanım şekli, hasar durumu, mülkiyet tipi)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { FormikProps } from 'formik';
import { Dropdown } from 'primereact/dropdown';
import {
    DaskFormData,
    PropertyStructure,
    PropertyUtilizationStyle,
    DaskPropertyFloorCountRange,
    PropertyDamageStatus,
    DaskPropertyOwnershipType,
} from '../../types';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';

interface LocationOption {
    value: string;
    text: string;
}

interface Property {
    id: string;
    number?: number;
    address: {
        city?: LocationOption;
        district?: LocationOption;
        town?: LocationOption;
        neighborhood?: LocationOption;
        street?: LocationOption;
        building?: LocationOption;
        apartment?: LocationOption;
    } | string;
    buildingType?: string;
    constructionYear?: number;
    floorCount?: number;
    floorNumber?: number;
    squareMeters?: number;
    usageType?: string;
    buildingMaterial?: string;
    riskZone?: string;
    ownershipType?: string;
    floor?: {
        totalFloors?: number | null | { $type?: string; min?: number; max?: number };
        currentFloor?: number | null;
    };
    daskOldPolicyNumber?: string;
}

interface DaskStep2Props {
    formik: FormikProps<DaskFormData>;
    isLoading: boolean;
    isAddressLoading: boolean;
    properties: Property[];
    selectionType: 'existing' | 'new' | 'renewal';
    cities: LocationOption[];
    districts: LocationOption[];
    towns: LocationOption[];
    neighborhoods: LocationOption[];
    streets: LocationOption[];
    buildings: LocationOption[];
    apartments: LocationOption[];

    onSelectionTypeChange: (type: 'existing' | 'new' | 'renewal') => void;
    onPropertySelect: (propertyId: string) => void;
    onEditProperty: (propertyId: string, e: React.MouseEvent) => void;

    // Address fetchers
    fetchDistricts: (cityValue: string) => void;
    fetchTowns: (districtValue: string) => void;
    fetchNeighborhoods: (townValue: string) => void;
    fetchStreets: (neighborhoodValue: string) => void;
    fetchBuildings: (streetValue: string) => void;
    fetchApartments: (buildingValue: string) => void;
    queryUavt: (uavtNo: string) => Promise<any>;

    onSubmit: () => void;
    onBack: () => void;
}

// Dropdown options
const structureTypeOptions = [
    { label: 'Çelik Betonarme', value: PropertyStructure.SteelReinforcedConcrete },
    { label: 'Diğer', value: PropertyStructure.Other },
];

const utilizationStyleOptions = [
    { label: 'Konut', value: PropertyUtilizationStyle.House },
    { label: 'İşyeri', value: PropertyUtilizationStyle.Business },
];

const damageStatusOptions = [
    { label: 'Hasarsız', value: PropertyDamageStatus.None },
    { label: 'Az Hasarlı', value: PropertyDamageStatus.SlightlyDamaged },
    { label: 'Orta Hasarlı', value: PropertyDamageStatus.ModeratelyDamaged },
    { label: 'Ağır Hasarlı', value: PropertyDamageStatus.SeverelyDamaged },
];

const floorCountRangeOptions = [
    { label: '1-3 Kat', value: DaskPropertyFloorCountRange.Between1And3 },
    { label: '4-7 Kat', value: DaskPropertyFloorCountRange.Between4And7 },
    { label: '8-18 Kat', value: DaskPropertyFloorCountRange.Between8And18 },
    { label: '19+ Kat', value: DaskPropertyFloorCountRange.MoreThan19 },
];

// Kat sayısı aralığına göre maksimum kat değerini döndürür
const getMaxFloorFromRange = (range: DaskPropertyFloorCountRange): number => {
    switch (range) {
        case DaskPropertyFloorCountRange.Between1And3:
            return 3;
        case DaskPropertyFloorCountRange.Between4And7:
            return 7;
        case DaskPropertyFloorCountRange.Between8And18:
            return 18;
        case DaskPropertyFloorCountRange.MoreThan19:
            return 99; // 19+ için yüksek bir değer
        default:
            return 99;
    }
};

// Bulunduğu kat validasyonu - kat sayısından büyük olamaz
const validateFloorNumber = (floorNumber: string, floorCountRange: DaskPropertyFloorCountRange): string | null => {
    if (!floorNumber || floorCountRange === DaskPropertyFloorCountRange.Unknown) {
        return null;
    }

    const floor = parseInt(floorNumber, 10);
    if (isNaN(floor)) {
        return null;
    }

    // Negatif katlar (bodrum) her zaman geçerli
    if (floor < 0) {
        return null;
    }

    const maxFloor = getMaxFloorFromRange(floorCountRange);
    if (floor > maxFloor) {
        return `Bulunduğu kat, bina kat sayısından (${maxFloor}) büyük olamaz`;
    }

    return null;
};

const ownershipTypeOptions = [
    { label: 'Mal Sahibi', value: DaskPropertyOwnershipType.Proprietor },
    { label: 'Kiracı', value: DaskPropertyOwnershipType.Tenant },
];

// Backend string to enum mappers
const mapUsageTypeToForm = (backendUsageType?: string): PropertyUtilizationStyle => {
    if (backendUsageType === "HOUSE") return PropertyUtilizationStyle.House;
    if (backendUsageType === "BUSINESS") return PropertyUtilizationStyle.Business;
    return PropertyUtilizationStyle.Unknown;
};

const mapBuildingMaterialToForm = (backendMaterial?: string): PropertyStructure => {
    if (backendMaterial === "STEEL_REINFORCED_CONCRETE") return PropertyStructure.SteelReinforcedConcrete;
    return PropertyStructure.Other;
};

const mapRiskZoneToForm = (backendRiskZone?: string): PropertyDamageStatus => {
    if (backendRiskZone === "NONE") return PropertyDamageStatus.None;
    if (backendRiskZone === "SLIGHTLY_DAMAGED") return PropertyDamageStatus.SlightlyDamaged;
    if (backendRiskZone === "MODERATELY_DAMAGED") return PropertyDamageStatus.ModeratelyDamaged;
    if (backendRiskZone === "SEVERELY_DAMAGED") return PropertyDamageStatus.SeverelyDamaged;
    return PropertyDamageStatus.None;
};

const mapOwnershipTypeToForm = (backendOwnership?: string): DaskPropertyOwnershipType => {
    if (backendOwnership === "PROPRIETOR") return DaskPropertyOwnershipType.Proprietor;
    if (backendOwnership === "TENANT") return DaskPropertyOwnershipType.Tenant;
    return DaskPropertyOwnershipType.Unknown;
};

const DaskStep2 = ({
    formik,
    isLoading,
    isAddressLoading,
    properties,
    selectionType,
    cities,
    districts,
    towns,
    neighborhoods,
    streets,
    buildings,
    apartments,
    onSelectionTypeChange,
    onPropertySelect,
    onEditProperty,
    fetchDistricts,
    fetchTowns,
    fetchNeighborhoods,
    fetchStreets,
    fetchBuildings,
    fetchApartments,
    queryUavt,
    onSubmit,
    onBack,
}: DaskStep2Props) => {
    const { accessToken, customerId } = useAuthStore();

    // Local states for query loading
    const [uavtQueryLoading, setUavtQueryLoading] = useState(false);
    const [oldPolicyQueryLoading, setOldPolicyQueryLoading] = useState(false);

    // State to track if address was filled via query (UAVT or old policy)
    const [addressFilledViaQuery, setAddressFilledViaQuery] = useState(false);

    // Error state for policy query (inline error, no dialog)
    const [policyQueryError, setPolicyQueryError] = useState<string | null>(null);

    // Error state for UAVT query (inline error)
    const [uavtQueryError, setUavtQueryError] = useState<string | null>(null);

    // Error state for floor number validation
    const [floorNumberError, setFloorNumberError] = useState<string | null>(null);

    // Helper to clear address fields
    const clearAddressFields = useCallback(() => {
        formik.setFieldValue('cityReference', '');
        formik.setFieldValue('districtReference', '');
        formik.setFieldValue('townReference', '');
        formik.setFieldValue('neighborhoodReference', '');
        formik.setFieldValue('streetReference', '');
        formik.setFieldValue('buildingReference', '');
        formik.setFieldValue('apartmentReference', '');
        formik.setFieldValue('uavtNo', '');
        setAddressFilledViaQuery(false);
    }, [formik]);

    // Helper to clear property details
    const clearPropertyDetails = useCallback(() => {
        formik.setFieldValue('buildingType', PropertyStructure.Unknown);
        formik.setFieldValue('constructionYear', null);
        formik.setFieldValue('floorCountRange', DaskPropertyFloorCountRange.Unknown);
        formik.setFieldValue('floorNumber', '');
        formik.setFieldValue('squareMeters', '');
        formik.setFieldValue('usageType', PropertyUtilizationStyle.Unknown);
        formik.setFieldValue('riskZone', PropertyDamageStatus.Unknown);
        formik.setFieldValue('ownershipType', DaskPropertyOwnershipType.Unknown);
    }, [formik]);

    // UAVT Query Handler
    const handleUavtQuery = async () => {
        const uavtNo = formik.values.uavtNo;
        setUavtQueryError(null);

        if (!uavtNo) {
            setUavtQueryError('Lütfen UAVT numarası giriniz');
            return;
        }

        if (!/^\d{10}$/.test(uavtNo)) {
            setUavtQueryError('UAVT numarası 10 haneli olmalıdır');
            return;
        }

        setUavtQueryLoading(true);
        clearAddressFields();
        // UAVT değerini geri yükle (clearAddressFields sildiği için)
        formik.setFieldValue('uavtNo', uavtNo);

        try {
            const response = await fetchWithAuth(
                API_ENDPOINTS.PROPERTIES_QUERY_ADDRESS,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                    body: JSON.stringify({ propertyNumber: parseInt(uavtNo, 10) }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    const errorMessage = errorData.errors[0];
                    if (errorMessage.includes('bulunamadı') || errorMessage.includes('InsurGateway')) {
                        setUavtQueryError('UAVT ile bilgiler doldurulamadı, lütfen adres bilgilerini manuel olarak giriniz.');
                        return;
                    }
                }
                throw new Error('UAVT sorgulanırken bir hata oluştu.');
            }

            const data = await response.json();

            // Validate response
            const hasValidData = data && data.city?.value && data.district?.value;
            if (!hasValidData) {
                setUavtQueryError('Girdiğiniz UAVT kodu hatalı. Lütfen doğru UAVT kodunu giriniz.');
                return;
            }

            // Fill form with UAVT data - success, clear error
            setUavtQueryError(null);
            setAddressFilledViaQuery(true);

            // Set values and trigger fetches
            if (data.city?.value) {
                formik.setFieldValue('cityReference', data.city.value);
                fetchDistricts(data.city.value);
            }
            if (data.district?.value) {
                formik.setFieldValue('districtReference', data.district.value);
                fetchTowns(data.district.value);
            }
            if (data.town?.value) {
                formik.setFieldValue('townReference', data.town.value);
                fetchNeighborhoods(data.town.value);
            }
            if (data.neighborhood?.value) {
                formik.setFieldValue('neighborhoodReference', data.neighborhood.value);
                fetchStreets(data.neighborhood.value);
            }
            if (data.street?.value) {
                formik.setFieldValue('streetReference', data.street.value);
                fetchBuildings(data.street.value);
            }
            if (data.building?.value) {
                formik.setFieldValue('buildingReference', data.building.value);
                fetchApartments(data.building.value);
            }
            if (data.apartment?.value) {
                formik.setFieldValue('apartmentReference', data.apartment.value);
            }

        } catch (error) {
            setUavtQueryError('UAVT sorgulaması başarısız oldu. Lütfen adres bilgilerini manuel olarak giriniz.');
        } finally {
            setUavtQueryLoading(false);
        }
    };

    // Old Policy Query Handler (for renewal)
    const handleOldPolicyQuery = async () => {
        const policyNumber = formik.values.daskOldPolicyNumber;
        setPolicyQueryError(null);

        if (!policyNumber) {
            setPolicyQueryError('Lütfen eski DASK poliçe numarası giriniz');
            return;
        }

        if (!/^[0-9]{8}$/.test(policyNumber)) {
            setPolicyQueryError('Eski DASK poliçe numarası tam 8 rakam olmalıdır');
            return;
        }

        setOldPolicyQueryLoading(true);
        clearAddressFields();
        clearPropertyDetails();

        try {
            const response = await fetchWithAuth(
                API_ENDPOINTS.PROPERTIES_QUERY_DASK_OLD_POLICY,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                    body: JSON.stringify({ daskOldPolicyNumber: parseInt(policyNumber, 10) }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    const errorMessage = errorData.errors[0];
                    if (errorMessage.includes('Dask Tramer') || errorMessage.includes('bulunamadı')) {
                        setPolicyQueryError('DASK poliçe numarası hatalı. Lütfen poliçe numaranızı kontrol edip tekrar deneyiniz.');
                        return;
                    }
                }
                throw new Error('Eski DASK poliçesi sorgulanırken bir hata oluştu.');
            }

            const data = await response.json();

            // Validate response
            const hasValidData = data && data.address?.city?.value && data.address?.district?.value && data.propertyNumber;
            if (!hasValidData) {
                setPolicyQueryError('Eski DASK poliçe numarası hatalı veya eksik bilgi döndü.');
                return;
            }

            // Success - clear error and fill data
            setPolicyQueryError(null);
            setAddressFilledViaQuery(true);

            // Fill address
            if (data.address.city?.value) {
                formik.setFieldValue('cityReference', data.address.city.value);
                fetchDistricts(data.address.city.value);
            }
            if (data.address.district?.value) {
                formik.setFieldValue('districtReference', data.address.district.value);
                fetchTowns(data.address.district.value);
            }
            if (data.address.town?.value) {
                formik.setFieldValue('townReference', data.address.town.value);
                fetchNeighborhoods(data.address.town.value);
            }
            if (data.address.neighborhood?.value) {
                formik.setFieldValue('neighborhoodReference', data.address.neighborhood.value);
                fetchStreets(data.address.neighborhood.value);
            }
            if (data.address.street?.value) {
                formik.setFieldValue('streetReference', data.address.street.value);
                fetchBuildings(data.address.street.value);
            }
            if (data.address.building?.value) {
                formik.setFieldValue('buildingReference', data.address.building.value);
                fetchApartments(data.address.building.value);
            }
            if (data.address.apartment?.value) {
                formik.setFieldValue('apartmentReference', data.address.apartment.value);
            }

            // Fill UAVT
            formik.setFieldValue('uavtNo', data.propertyNumber?.toString() || data.address.apartment?.value || '');

            // Fill property details
            formik.setFieldValue('constructionYear', data.constructionYear?.toString() || '');
            formik.setFieldValue('squareMeters', data.squareMeter?.toString() || '');
            formik.setFieldValue('floorNumber', data.floor?.currentFloor?.toString() || '');
            formik.setFieldValue('buildingType', mapBuildingMaterialToForm(data.structure));
            formik.setFieldValue('usageType', mapUsageTypeToForm(data.utilizationStyle));
            formik.setFieldValue('riskZone', mapRiskZoneToForm(data.damageStatus));
            formik.setFieldValue('ownershipType', mapOwnershipTypeToForm(data.ownershipType));

            // Calculate floor count range
            if (data.floor?.totalFloors) {
                let floorCountRange = DaskPropertyFloorCountRange.Unknown;
                if (typeof data.floor.totalFloors === 'object' && data.floor.totalFloors.min && data.floor.totalFloors.max) {
                    const min = data.floor.totalFloors.min;
                    const max = data.floor.totalFloors.max;
                    if (min >= 1 && max <= 3) floorCountRange = DaskPropertyFloorCountRange.Between1And3;
                    else if (min >= 4 && max <= 7) floorCountRange = DaskPropertyFloorCountRange.Between4And7;
                    else if (min >= 8 && max <= 18) floorCountRange = DaskPropertyFloorCountRange.Between8And18;
                    else if (min >= 19) floorCountRange = DaskPropertyFloorCountRange.MoreThan19;
                }
                formik.setFieldValue('floorCountRange', floorCountRange);
            }

        } catch (error) {
            setPolicyQueryError('Eski DASK poliçe sorgulaması başarısız oldu. Lütfen tekrar deneyiniz.');
        } finally {
            setOldPolicyQueryLoading(false);
        }
    };

    // Format address for display
    const formatAddress = (address: Property['address']) => {
        if (typeof address === 'string') return address;
        if (!address) return 'Adres bilgisi yok';

        const parts = [
            address.town?.text,
            address.neighborhood?.text,
            address.street?.text,
            address.building?.text ? `No: ${address.building.text}` : null,
            address.apartment?.text ? `Daire: ${address.apartment.text}` : null,
        ];
        return parts.filter(Boolean).join(' ') || 'Adres bilgisi yok';
    };

    // Check if form is valid for submission
    const isFormValid = useCallback(() => {
        // Floor number validation - must not exceed floor count range
        if (floorNumberError) {
            return false;
        }

        if (selectionType === 'existing') {
            return !!formik.values.selectedPropertyId;
        }

        if (selectionType === 'renewal') {
            // For renewal, old policy must be queried first
            if (!addressFilledViaQuery) {
                return !!formik.values.daskOldPolicyNumber && /^[0-9]{8}$/.test(formik.values.daskOldPolicyNumber);
            }

            // After query, all required fields must be filled
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

            return Object.values(requiredFields).every(value => !!value);
        }

        // For new property
        const requiredFields = {
            cityReference: formik.values.cityReference,
            districtReference: formik.values.districtReference,
            apartmentReference: formik.values.apartmentReference,
            squareMeters: formik.values.squareMeters,
            constructionYear: formik.values.constructionYear,
            floorNumber: formik.values.floorNumber,
            floorCountRange: formik.values.floorCountRange !== DaskPropertyFloorCountRange.Unknown,
            usageType: formik.values.usageType !== PropertyUtilizationStyle.Unknown,
            buildingType: formik.values.buildingType !== PropertyStructure.Unknown,
            riskZone: formik.values.riskZone !== PropertyDamageStatus.Unknown,
            ownershipType: formik.values.ownershipType !== DaskPropertyOwnershipType.Unknown,
        };

        return Object.values(requiredFields).every(value => !!value);
    }, [selectionType, formik.values, addressFilledViaQuery, floorNumberError]);

    // Input sanitizers
    const sanitizeNumericInput = (value: string, maxLength: number = 10) => {
        return value.replace(/[^0-9]/g, '').slice(0, maxLength);
    };

    const sanitizeFloorInput = (value: string) => {
        let cleaned = value.replace(/[^-0-9]/g, '');
        cleaned = cleaned.replace(/(?!^)-/g, '');
        return cleaned.slice(0, 3);
    };

    // Clear policy query error when policy number changes
    useEffect(() => {
        if (formik.values.daskOldPolicyNumber) {
            setPolicyQueryError(null);
        }
    }, [formik.values.daskOldPolicyNumber]);

    // Clear UAVT query error when UAVT changes
    useEffect(() => {
        if (formik.values.uavtNo) {
            setUavtQueryError(null);
        }
    }, [formik.values.uavtNo]);

    // Render existing properties
    const renderExistingProperties = () => (
        <div className="pp-existing-vehicles">
            {properties.length === 0 ? (
                <p className="pp-no-data-message">Kayıtlı DASK uyumlu konut bulunamadı. Lütfen yeni konut ekleyin.</p>
            ) : (
                <div className="pp-vehicles-grid">
                    {properties.map((property) => (
                        <div
                            key={property.id}
                            className={`pp-vehicle-card ${formik.values.selectedPropertyId === property.id ? 'selected' : ''}`}
                            onClick={() => onPropertySelect(property.id)}
                        >
                            <div className="pp-vehicle-content">
                                <h4 className="pp-vehicle-brand">
                                    {typeof property.address === 'object' && property.address.city?.text
                                        ? `${property.address.city.text} / ${property.address.district?.text || 'İlçe Yok'}`
                                        : 'İl/İlçe bilgisi yok'}
                                </h4>
                                <p className="pp-vehicle-model">
                                    {formatAddress(property.address)}
                                </p>
                            </div>
                            <div
                                className="pp-vehicle-edit-icon"
                                onClick={(e) => onEditProperty(property.id, e)}
                            >
                                <i className="icon-edit"></i>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {formik.values.selectedPropertyId && (
                <div className="pp-button-group">
                    <button
                        type="button"
                        className="pp-btn-submit"
                        onClick={onSubmit}
                        // disabled={isLoading}
                    >
                        {isLoading ? 'İşleniyor...' : 'Teklifleri Gör'}
                    </button>
                </div>
            )}
        </div>
    );

    // Render address form
    const renderAddressForm = (disabled: boolean = false) => (
        <>
            {/* Row 1: City, District */}
            <div className="pp-form-row">
                <div className={`pp-form-group ${formik.touched.cityReference && formik.errors.cityReference ? 'error' : ''}`}>
                    <label className="pp-label">İl *</label>
                    <Dropdown
                        value={formik.values.cityReference}
                        options={cities.map(c => ({ label: c.text, value: c.value }))}
                        onChange={(e) => {
                            formik.setFieldValue('cityReference', e.value, true);
                            formik.setFieldTouched('cityReference', true, false);
                            formik.setFieldValue('districtReference', '');
                            formik.setFieldValue('townReference', '');
                            formik.setFieldValue('neighborhoodReference', '');
                            formik.setFieldValue('streetReference', '');
                            formik.setFieldValue('buildingReference', '');
                            formik.setFieldValue('apartmentReference', '');
                            fetchDistricts(e.value);
                        }}
                        placeholder="Seçiniz"
                        className="pp-dropdown"
                        filter
                        disabled={disabled}
                    />
                    {formik.touched.cityReference && formik.errors.cityReference && (
                        <div className="pp-error-message">{formik.errors.cityReference}</div>
                    )}
                </div>

                <div className={`pp-form-group ${formik.touched.districtReference && formik.errors.districtReference ? 'error' : ''}`}>
                    <label className="pp-label">İlçe *</label>
                    <Dropdown
                        value={formik.values.districtReference}
                        options={[...districts].sort((a, b) => a.text.localeCompare(b.text, 'tr')).map(d => ({ label: d.text, value: d.value }))}
                        onChange={(e) => {
                            formik.setFieldValue('districtReference', e.value, true);
                            formik.setFieldTouched('districtReference', true, false);
                            formik.setFieldValue('townReference', '');
                            formik.setFieldValue('neighborhoodReference', '');
                            formik.setFieldValue('streetReference', '');
                            formik.setFieldValue('buildingReference', '');
                            formik.setFieldValue('apartmentReference', '');
                            fetchTowns(e.value);
                        }}
                        placeholder={isAddressLoading ? 'Yükleniyor...' : 'Seçiniz'}
                        className="pp-dropdown"
                        filter
                        disabled={disabled || !formik.values.cityReference}
                    />
                    {formik.touched.districtReference && formik.errors.districtReference && (
                        <div className="pp-error-message">{formik.errors.districtReference}</div>
                    )}
                </div>
            </div>

            {/* Row 2: Town, Neighborhood */}
            <div className="pp-form-row">
                <div className="pp-form-group">
                    <label className="pp-label">Belde / Semt</label>
                    <Dropdown
                        value={formik.values.townReference}
                        options={[...towns].sort((a, b) => a.text.localeCompare(b.text, 'tr')).map(t => ({ label: t.text, value: t.value }))}
                        onChange={(e) => {
                            formik.setFieldValue('townReference', e.value, true);
                            formik.setFieldTouched('townReference', true, false);
                            formik.setFieldValue('neighborhoodReference', '');
                            formik.setFieldValue('streetReference', '');
                            formik.setFieldValue('buildingReference', '');
                            formik.setFieldValue('apartmentReference', '');
                            fetchNeighborhoods(e.value);
                        }}
                        placeholder={isAddressLoading ? 'Yükleniyor...' : 'Seçiniz'}
                        className="pp-dropdown"
                        filter
                        disabled={disabled || !formik.values.districtReference}
                    />
                </div>

                <div className="pp-form-group">
                    <label className="pp-label">Mahalle</label>
                    <Dropdown
                        value={formik.values.neighborhoodReference}
                        options={[...neighborhoods].sort((a, b) => a.text.localeCompare(b.text, 'tr')).map(n => ({ label: n.text, value: n.value }))}
                        onChange={(e) => {
                            formik.setFieldValue('neighborhoodReference', e.value, true);
                            formik.setFieldTouched('neighborhoodReference', true, false);
                            formik.setFieldValue('streetReference', '');
                            formik.setFieldValue('buildingReference', '');
                            formik.setFieldValue('apartmentReference', '');
                            fetchStreets(e.value);
                        }}
                        placeholder={isAddressLoading ? 'Yükleniyor...' : 'Seçiniz'}
                        className="pp-dropdown"
                        filter
                        disabled={disabled || !formik.values.townReference}
                    />
                </div>
            </div>

            {/* Row 3: Street, Building */}
            <div className="pp-form-row">
                <div className="pp-form-group">
                    <label className="pp-label">Sokak / Cadde</label>
                    <Dropdown
                        value={formik.values.streetReference}
                        options={[...streets].sort((a, b) => a.text.localeCompare(b.text, 'tr')).map(s => ({ label: s.text, value: s.value }))}
                        onChange={(e) => {
                            formik.setFieldValue('streetReference', e.value, true);
                            formik.setFieldTouched('streetReference', true, false);
                            formik.setFieldValue('buildingReference', '');
                            formik.setFieldValue('apartmentReference', '');
                            fetchBuildings(e.value);
                        }}
                        placeholder={isAddressLoading ? 'Yükleniyor...' : 'Seçiniz'}
                        className="pp-dropdown"
                        filter
                        disabled={disabled || !formik.values.neighborhoodReference}
                    />
                </div>

                <div className="pp-form-group">
                    <label className="pp-label">Bina No / Adı</label>
                    <Dropdown
                        value={formik.values.buildingReference}
                        options={[...buildings].sort((a, b) => a.text.localeCompare(b.text, 'tr')).map(b => ({ label: b.text, value: b.value }))}
                        onChange={(e) => {
                            formik.setFieldValue('buildingReference', e.value, true);
                            formik.setFieldTouched('buildingReference', true, false);
                            formik.setFieldValue('apartmentReference', '');
                            fetchApartments(e.value);
                        }}
                        placeholder={isAddressLoading ? 'Yükleniyor...' : 'Seçiniz'}
                        className="pp-dropdown"
                        filter
                        disabled={disabled || !formik.values.streetReference}
                    />
                </div>
            </div>

            {/* Row 4: Apartment */}
            <div className="pp-form-row pp-form-row-1">
                <div className={`pp-form-group ${formik.touched.apartmentReference && formik.errors.apartmentReference ? 'error' : ''}`}>
                    <label className="pp-label">Daire No *</label>
                    <Dropdown
                        value={formik.values.apartmentReference}
                        options={[...apartments].sort((a, b) => a.text.localeCompare(b.text, 'tr')).map(a => ({ label: a.text, value: a.value }))}
                        onChange={(e) => {
                            formik.setFieldValue('apartmentReference', e.value, true);
                            formik.setFieldTouched('apartmentReference', true, false);
                            // Auto-fill UAVT from apartment value
                            formik.setFieldValue('uavtNo', e.value);
                        }}
                        placeholder={isAddressLoading ? 'Yükleniyor...' : 'Seçiniz'}
                        className="pp-dropdown"
                        filter
                        emptyMessage="Bu isteğe yönelik seçenek bulunamadı. Tekrar dene veya farklı bir seçim yap."
                        emptyFilterMessage="Bu isteğe yönelik seçenek bulunamadı. Tekrar dene veya farklı bir seçim yap."
                        disabled={disabled || !formik.values.buildingReference}
                    />
                    {formik.touched.apartmentReference && formik.errors.apartmentReference && (
                        <div className="pp-error-message">{formik.errors.apartmentReference}</div>
                    )}
                </div>
            </div>
        </>
    );

    // Render property details form
    const renderPropertyDetails = (disabled: boolean = false) => (
        <>
            <div className="pp-section-title">Konut Özellikleri</div>

            {/* Row 1: Building Type, Construction Year */}
            <div className="pp-form-row">
                <div className={`pp-form-group ${formik.touched.buildingType && formik.errors.buildingType ? 'error' : ''}`}>
                    <label className="pp-label">Yapı Tarzı *</label>
                    <Dropdown
                        value={formik.values.buildingType}
                        options={structureTypeOptions}
                        onChange={(e) => {
                            formik.setFieldValue('buildingType', e.value, true);
                            formik.setFieldTouched('buildingType', true, false);
                        }}
                        placeholder="Seçiniz"
                        className="pp-dropdown"
                        disabled={disabled}
                    />
                    {formik.touched.buildingType && formik.errors.buildingType && (
                        <div className="pp-error-message">{String(formik.errors.buildingType)}</div>
                    )}
                </div>

                <div className={`pp-form-group ${formik.touched.constructionYear && formik.errors.constructionYear ? 'error' : ''}`}>
                    <label className="pp-label">İnşa Yılı *</label>
                    <input
                        type="text"
                        className="pp-input"
                        value={formik.values.constructionYear || ''}
                        onChange={(e) => {
                            const sanitized = sanitizeNumericInput(e.target.value, 4);
                            formik.setFieldValue('constructionYear', sanitized);
                        }}
                        onBlur={() => formik.setFieldTouched('constructionYear', true)}
                        placeholder="Örn: 2010"
                        maxLength={4}
                        disabled={disabled}
                    />
                    {formik.touched.constructionYear && formik.errors.constructionYear && (
                        <div className="pp-error-message">{formik.errors.constructionYear}</div>
                    )}
                </div>
            </div>

            {/* Row 2: Floor Count Range, Floor Number */}
            <div className="pp-form-row">
                <div className={`pp-form-group ${formik.touched.floorCountRange && formik.errors.floorCountRange ? 'error' : ''}`}>
                    <label className="pp-label">Bina Kat Sayısı *</label>
                    <Dropdown
                        value={formik.values.floorCountRange}
                        options={floorCountRangeOptions}
                        onChange={(e) => {
                            formik.setFieldValue('floorCountRange', e.value, true);
                            formik.setFieldTouched('floorCountRange', true, false);
                            // Re-validate floor number with new range
                            if (formik.values.floorNumber) {
                                const error = validateFloorNumber(formik.values.floorNumber, e.value);
                                setFloorNumberError(error);
                            }
                        }}
                        placeholder="Seçiniz"
                        className="pp-dropdown"
                        disabled={disabled}
                    />
                    {formik.touched.floorCountRange && formik.errors.floorCountRange && (
                        <div className="pp-error-message">{String(formik.errors.floorCountRange)}</div>
                    )}
                </div>

                <div className={`pp-form-group ${(formik.touched.floorNumber && formik.errors.floorNumber) || floorNumberError ? 'error' : ''}`}>
                    <label className="pp-label">Bulunduğu Kat *</label>
                    <input
                        type="text"
                        className="pp-input"
                        value={formik.values.floorNumber}
                        onChange={(e) => {
                            const sanitized = sanitizeFloorInput(e.target.value);
                            formik.setFieldValue('floorNumber', sanitized);
                            // Validate floor number against floor count range
                            const error = validateFloorNumber(sanitized, formik.values.floorCountRange);
                            setFloorNumberError(error);
                        }}
                        onBlur={() => formik.setFieldTouched('floorNumber', true)}
                        placeholder="Örn: 2 veya -1"
                        maxLength={3}
                        disabled={disabled}
                    />
                    {floorNumberError && (
                        <div className="pp-error-message">{floorNumberError}</div>
                    )}
                    {!floorNumberError && formik.touched.floorNumber && formik.errors.floorNumber && (
                        <div className="pp-error-message">{formik.errors.floorNumber}</div>
                    )}
                </div>
            </div>

            {/* Row 3: Square Meters, Usage Type */}
            <div className="pp-form-row">
                <div className={`pp-form-group ${formik.touched.squareMeters && formik.errors.squareMeters ? 'error' : ''}`}>
                    <label className="pp-label">Brüt Alan (m²) *</label>
                    <input
                        type="text"
                        className="pp-input"
                        value={formik.values.squareMeters}
                        onChange={(e) => {
                            const sanitized = sanitizeNumericInput(e.target.value, 3);
                            formik.setFieldValue('squareMeters', sanitized);
                        }}
                        onBlur={() => formik.setFieldTouched('squareMeters', true)}
                        placeholder="Örn: 100"
                        maxLength={3}
                        disabled={disabled}
                    />
                    {formik.touched.squareMeters && formik.errors.squareMeters && (
                        <div className="pp-error-message">{formik.errors.squareMeters}</div>
                    )}
                </div>

                <div className={`pp-form-group ${formik.touched.usageType && formik.errors.usageType ? 'error' : ''}`}>
                    <label className="pp-label">Kullanım Şekli *</label>
                    <Dropdown
                        value={formik.values.usageType}
                        options={utilizationStyleOptions}
                        onChange={(e) => {
                            formik.setFieldValue('usageType', e.value, true);
                            formik.setFieldTouched('usageType', true, false);
                        }}
                        placeholder="Seçiniz"
                        className="pp-dropdown"
                        disabled={disabled}
                    />
                    {formik.touched.usageType && formik.errors.usageType && (
                        <div className="pp-error-message">{String(formik.errors.usageType)}</div>
                    )}
                </div>
            </div>

            {/* Row 4: Damage Status, Ownership Type */}
            <div className="pp-form-row">
                <div className={`pp-form-group ${formik.touched.riskZone && formik.errors.riskZone ? 'error' : ''}`}>
                    <label className="pp-label">Hasar Durumu *</label>
                    <Dropdown
                        value={formik.values.riskZone}
                        options={damageStatusOptions}
                        onChange={(e) => {
                            formik.setFieldValue('riskZone', e.value, true);
                            formik.setFieldTouched('riskZone', true, false);
                        }}
                        placeholder="Seçiniz"
                        className="pp-dropdown"
                        disabled={disabled}
                    />
                    {formik.touched.riskZone && formik.errors.riskZone && (
                        <div className="pp-error-message">{String(formik.errors.riskZone)}</div>
                    )}
                </div>

                <div className={`pp-form-group ${formik.touched.ownershipType && formik.errors.ownershipType ? 'error' : ''}`}>
                    <label className="pp-label">Mülkiyet Tipi *</label>
                    <Dropdown
                        value={formik.values.ownershipType}
                        options={ownershipTypeOptions}
                        onChange={(e) => {
                            formik.setFieldValue('ownershipType', e.value, true);
                            formik.setFieldTouched('ownershipType', true, false);
                        }}
                        placeholder="Seçiniz"
                        className="pp-dropdown"
                        disabled={disabled}
                    />
                    {formik.touched.ownershipType && formik.errors.ownershipType && (
                        <div className="pp-error-message">{String(formik.errors.ownershipType)}</div>
                    )}
                </div>
            </div>
        </>
    );

    // Render new property form
    const renderNewPropertyForm = () => (
        <>
            {/* UAVT Query Section - Full Width */}
            <div className="pp-section-title">UAVT ile Adres Sorgulama</div>
            <p className="pp-section-description">UAVT numarasını biliyorsanız, adres bilgilerini otomatik doldurmak için sorgulayabilirsiniz.</p>

            <div className="pp-form-row pp-form-row-1">
                <div className={`pp-form-group ${uavtQueryError ? 'error' : ''}`}>
                    <label className="pp-label">UAVT Adres Kodu</label>
                    <div className="pp-input-with-button">
                        <input
                            type="text"
                            className="pp-input"
                            value={formik.values.uavtNo || ''}
                            onChange={(e) => {
                                const sanitized = sanitizeNumericInput(e.target.value, 10);
                                formik.setFieldValue('uavtNo', sanitized);
                            }}
                            placeholder="10 haneli UAVT kodu giriniz"
                            maxLength={10}
                        />
                        <button
                            type="button"
                            className="pp-btn-query"
                            onClick={handleUavtQuery}
                            disabled={uavtQueryLoading || !formik.values.uavtNo || !/^\d{10}$/.test(formik.values.uavtNo)}
                        >
                            {uavtQueryLoading ? (
                                <span className="pp-btn-loading">
                                    <span className="pp-spinner"></span>
                                    Sorgulanıyor...
                                </span>
                            ) : (
                                'Sorgula'
                            )}
                        </button>
                    </div>
                    {uavtQueryError && (
                        <div className="pp-error-message">{uavtQueryError}</div>
                    )}
                    {formik.touched.uavtNo && formik.errors.uavtNo && !uavtQueryError && (
                        <div className="pp-error-message">{formik.errors.uavtNo}</div>
                    )}
                </div>
            </div>

            <div className="pp-section-divider">
                <span>veya Manuel Adres Girişi</span>
            </div>

            <div className="pp-section-title">Adres Bilgileri</div>
            {renderAddressForm(false)}

            {renderPropertyDetails(false)}

            <div className="pp-button-group">
          
                <button
                    type="button"
                    className="pp-btn-submit"
                    onClick={onSubmit}
                    // disabled={isLoading || !isFormValid()}
                >
                    {isLoading ? 'İşleniyor...' : 'Teklifleri Gör'}
                </button>
            </div>
        </>
    );

    // Render renewal form - address and property fields always visible but disabled until query succeeds
    const renderRenewalForm = () => (
        <>
            {/* Old Policy Query Section - Full Width */}
            <div className="pp-section-title">Poliçe Bilgileri</div>
            <p className="pp-section-description">Eski DASK poliçe numaranızı girerek bilgilerinizi otomatik olarak yükleyiniz.</p>

            <div className="pp-form-row pp-form-row-1">
                <div className={`pp-form-group ${policyQueryError ? 'error' : ''}`}>
                    <label className="pp-label">Eski DASK Poliçe Numarası *</label>
                    <div className="pp-input-with-button">
                        <input
                            type="text"
                            className="pp-input"
                            value={formik.values.daskOldPolicyNumber || ''}
                            onChange={(e) => {
                                const sanitized = sanitizeNumericInput(e.target.value, 8);
                                formik.setFieldValue('daskOldPolicyNumber', sanitized);
                            }}
                            placeholder="8 haneli poliçe numarası giriniz"
                            maxLength={8}
                        />
                        <button
                            type="button"
                            className="pp-btn-query"
                            onClick={handleOldPolicyQuery}
                            disabled={oldPolicyQueryLoading || !formik.values.daskOldPolicyNumber || !/^[0-9]{8}$/.test(formik.values.daskOldPolicyNumber)}
                        >
                            {oldPolicyQueryLoading ? (
                                <span className="pp-btn-loading">
                                    <span className="pp-spinner"></span>
                                    Sorgulanıyor...
                                </span>
                            ) : (
                                'Sorgula'
                            )}
                        </button>
                    </div>
                    {/* Inline error message - no dialog */}
                    {policyQueryError && (
                        <div className="pp-error-message">{policyQueryError}</div>
                    )}
                    {formik.touched.daskOldPolicyNumber && formik.errors.daskOldPolicyNumber && !policyQueryError && (
                        <div className="pp-error-message">{formik.errors.daskOldPolicyNumber}</div>
                    )}
                </div>
            </div>

            {/* Address fields - always visible, disabled until query succeeds */}
            <div className="pp-section-title">Adres Bilgileri</div>
            {!addressFilledViaQuery ? (
                <p className="pp-section-description pp-section-description-muted">Poliçe sorgulaması yapıldıktan sonra adres bilgileri otomatik olarak doldurulacaktır.</p>
            ) : (
                <p className="pp-section-description pp-section-description-success">Bilgiler otomatik yüklendi. Bu alanlar değiştirilemez.</p>
            )}
            {renderAddressForm(true)}

            {/* Property details - always visible, disabled until query succeeds */}
            <div className="pp-section-title">Konut Özellikleri</div>
            {!addressFilledViaQuery ? (
                <p className="pp-section-description pp-section-description-muted">Poliçe sorgulaması yapıldıktan sonra konut bilgileri otomatik olarak doldurulacaktır.</p>
            ) : (
                <p className="pp-section-description pp-section-description-success">Bilgiler otomatik yüklendi. Bu alanlar değiştirilemez.</p>
            )}

            {/* Row 1: Building Type, Construction Year */}
            <div className="pp-form-row">
                <div className="pp-form-group">
                    <label className="pp-label">Yapı Tarzı *</label>
                    <Dropdown
                        value={formik.values.buildingType}
                        options={structureTypeOptions}
                        onChange={(e) => formik.setFieldValue('buildingType', e.value)}
                        placeholder="Seçiniz"
                        className="pp-dropdown"
                        disabled={true}
                    />
                </div>

                <div className="pp-form-group">
                    <label className="pp-label">İnşa Yılı *</label>
                    <input
                        type="text"
                        className="pp-input"
                        value={formik.values.constructionYear || ''}
                        placeholder="Örn: 2010"
                        maxLength={4}
                        disabled={true}
                        readOnly
                    />
                </div>
            </div>

            {/* Row 2: Floor Count Range, Floor Number */}
            <div className="pp-form-row">
                <div className="pp-form-group">
                    <label className="pp-label">Bina Kat Sayısı *</label>
                    <Dropdown
                        value={formik.values.floorCountRange}
                        options={floorCountRangeOptions}
                        placeholder="Seçiniz"
                        className="pp-dropdown"
                        disabled={true}
                    />
                </div>

                <div className="pp-form-group">
                    <label className="pp-label">Bulunduğu Kat *</label>
                    <input
                        type="text"
                        className="pp-input"
                        value={formik.values.floorNumber}
                        placeholder="Örn: 2 veya -1"
                        maxLength={3}
                        disabled={true}
                        readOnly
                    />
                </div>
            </div>

            {/* Row 3: Square Meters, Usage Type */}
            <div className="pp-form-row">
                <div className="pp-form-group">
                    <label className="pp-label">Brüt Alan (m²) *</label>
                    <input
                        type="text"
                        className="pp-input"
                        value={formik.values.squareMeters}
                        placeholder="Örn: 100"
                        maxLength={3}
                        disabled={true}
                        readOnly
                    />
                </div>

                <div className="pp-form-group">
                    <label className="pp-label">Kullanım Şekli *</label>
                    <Dropdown
                        value={formik.values.usageType}
                        options={utilizationStyleOptions}
                        placeholder="Seçiniz"
                        className="pp-dropdown"
                        disabled={true}
                    />
                </div>
            </div>

            {/* Row 4: Damage Status, Ownership Type */}
            <div className="pp-form-row">
                <div className="pp-form-group">
                    <label className="pp-label">Hasar Durumu *</label>
                    <Dropdown
                        value={formik.values.riskZone}
                        options={damageStatusOptions}
                        placeholder="Seçiniz"
                        className="pp-dropdown"
                        disabled={true}
                    />
                </div>

                <div className="pp-form-group">
                    <label className="pp-label">Mülkiyet Tipi *</label>
                    <Dropdown
                        value={formik.values.ownershipType}
                        options={ownershipTypeOptions}
                        placeholder="Seçiniz"
                        className="pp-dropdown"
                        disabled={true}
                    />
                </div>
            </div>

            <div className="pp-button-group">
                <button
                    type="button"
                    className="pp-btn-submit"
                    onClick={onSubmit}
                    disabled={isLoading || !addressFilledViaQuery}
                >
                    {isLoading ? 'İşleniyor...' : 'Teklifleri Gör'}
                </button>
            </div>
        </>
    );

    return (
        <div className="product-page-form pp-form-wide">
            <div className="pp-card">
                <div className="pp-card-header">
                    <span className="pp-title">Konut Bilgileri</span>

                    <div className="pp-vehicle-tabs">
                        <button
                            type="button"
                            className={`pp-tab-button ${selectionType === 'existing' ? 'active' : ''}`}
                            onClick={() => properties.length > 0 && onSelectionTypeChange('existing')}
                            disabled={properties.length === 0}
                        >
                            Kayıtlı Konutlarım
                        </button>
                        <button
                            type="button"
                            className={`pp-tab-button ${selectionType === 'new' ? 'active' : ''}`}
                            onClick={() => {
                                onSelectionTypeChange('new');
                                clearAddressFields();
                                clearPropertyDetails();
                            }}
                        >
                            Yeni Konut Ekle
                        </button>
                        <button
                            type="button"
                            className={`pp-tab-button ${selectionType === 'renewal' ? 'active' : ''}`}
                            onClick={() => {
                                onSelectionTypeChange('renewal');
                                clearAddressFields();
                                clearPropertyDetails();
                                formik.setFieldValue('daskOldPolicyNumber', '');
                            }}
                        >
                            DASK Yenileme
                        </button>
                    </div>
                </div>

                {selectionType === 'existing' && renderExistingProperties()}
                {selectionType === 'new' && renderNewPropertyForm()}
                {selectionType === 'renewal' && renderRenewalForm()}
            </div>
        </div>
    );
};

export default DaskStep2;
