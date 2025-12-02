/**
 * KonutStep2 - Konut Bilgileri Adımı
 * 
 * DASK Flow'dan klonlanmıştır - Yenileme özelliği kaldırıldı
 * Teminat bilgileri alanı eklendi
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { FormikProps } from 'formik';
import { Dropdown } from 'primereact/dropdown';
import {
    KonutFormData,
    PropertyStructure,
    PropertyUtilizationStyle,
    KonutPropertyFloorCountRange,
    PropertyDamageStatus,
    KonutPropertyOwnershipType,
    InflationType,
    INFLATION_OPTIONS,
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
}

interface KonutStep2Props {
    formik: FormikProps<KonutFormData>;
    isLoading: boolean;
    isAddressLoading: boolean;
    properties: Property[];
    selectionType: 'existing' | 'new';
    cities: LocationOption[];
    districts: LocationOption[];
    towns: LocationOption[];
    neighborhoods: LocationOption[];
    streets: LocationOption[];
    buildings: LocationOption[];
    apartments: LocationOption[];

    onSelectionTypeChange: (type: 'existing' | 'new') => void;
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
    { label: '1-3 Kat', value: KonutPropertyFloorCountRange.Between1And3 },
    { label: '4-7 Kat', value: KonutPropertyFloorCountRange.Between4And7 },
    { label: '8-18 Kat', value: KonutPropertyFloorCountRange.Between8And18 },
    { label: '19+ Kat', value: KonutPropertyFloorCountRange.MoreThan19 },
];

const getMaxFloorFromRange = (range: KonutPropertyFloorCountRange): number => {
    switch (range) {
        case KonutPropertyFloorCountRange.Between1And3:
            return 3;
        case KonutPropertyFloorCountRange.Between4And7:
            return 7;
        case KonutPropertyFloorCountRange.Between8And18:
            return 18;
        case KonutPropertyFloorCountRange.MoreThan19:
            return 99;
        default:
            return 99;
    }
};

const validateFloorNumber = (floorNumber: string, floorCountRange: KonutPropertyFloorCountRange): string | null => {
    if (!floorNumber || floorCountRange === KonutPropertyFloorCountRange.Unknown) {
        return null;
    }

    const floor = parseInt(floorNumber, 10);
    if (isNaN(floor)) {
        return null;
    }

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
    { label: 'Mal Sahibi', value: KonutPropertyOwnershipType.Proprietor },
    { label: 'Kiracı', value: KonutPropertyOwnershipType.Tenant },
];

const inflationOptions = INFLATION_OPTIONS.map(opt => ({
    label: opt.label,
    value: opt.value,
}));

// Number formatting helpers
const formatNumberWithDots = (value: string | number): string => {
    if (!value && value !== 0) return '';
    const numStr = String(value).replace(/\D/g, '');
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const removeNumberFormatting = (value: string): string => {
    return value.replace(/\./g, '');
};

const handleFormattedNumberChange = (value: string, maxValue: number): string => {
    const numericValue = removeNumberFormatting(value);
    const num = parseInt(numericValue, 10);
    if (isNaN(num)) return '';
    if (num > maxValue) return String(maxValue);
    return numericValue;
};

const KonutStep2 = ({
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
}: KonutStep2Props) => {
    const { accessToken, customerId } = useAuthStore();

    const [uavtQueryLoading, setUavtQueryLoading] = useState(false);
    const [addressFilledViaQuery, setAddressFilledViaQuery] = useState(false);
    const [uavtQueryError, setUavtQueryError] = useState<string | null>(null);
    const [floorNumberError, setFloorNumberError] = useState<string | null>(null);
    const [coverageExpanded, setCoverageExpanded] = useState(true);

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

    const clearPropertyDetails = useCallback(() => {
        formik.setFieldValue('buildingType', PropertyStructure.Unknown);
        formik.setFieldValue('constructionYear', null);
        formik.setFieldValue('floorCountRange', KonutPropertyFloorCountRange.Unknown);
        formik.setFieldValue('floorNumber', '');
        formik.setFieldValue('squareMeters', '');
        formik.setFieldValue('usageType', PropertyUtilizationStyle.Unknown);
        formik.setFieldValue('riskZone', PropertyDamageStatus.Unknown);
        formik.setFieldValue('ownershipType', KonutPropertyOwnershipType.Unknown);
    }, [formik]);

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

            const hasValidData = data && data.city?.value && data.district?.value;
            if (!hasValidData) {
                setUavtQueryError('Girdiğiniz UAVT kodu hatalı. Lütfen doğru UAVT kodunu giriniz.');
                return;
            }

            setUavtQueryError(null);
            setAddressFilledViaQuery(true);

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

    const isFormValid = useCallback(() => {
        if (floorNumberError) {
            return false;
        }

        if (selectionType === 'existing') {
            return !!formik.values.selectedPropertyId;
        }

        const requiredFields = {
            cityReference: formik.values.cityReference,
            districtReference: formik.values.districtReference,
            apartmentReference: formik.values.apartmentReference,
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
    }, [selectionType, formik.values, floorNumberError]);

    const sanitizeNumericInput = (value: string, maxLength: number = 10) => {
        return value.replace(/[^0-9]/g, '').slice(0, maxLength);
    };

    const sanitizeFloorInput = (value: string) => {
        let cleaned = value.replace(/[^-0-9]/g, '');
        cleaned = cleaned.replace(/(?!^)-/g, '');
        return cleaned.slice(0, 3);
    };

    useEffect(() => {
        if (formik.values.uavtNo) {
            setUavtQueryError(null);
        }
    }, [formik.values.uavtNo]);

    // Teminat Bilgileri Alanı
    const renderCoverageInfo = () => (
        <div className="pp-coverage-section">
            <div 
                className="pp-coverage-header"
                onClick={() => setCoverageExpanded(!coverageExpanded)}
            >
                <span className="pp-section-title" style={{ marginBottom: 0 }}>Teminat Bilgileri</span>
                <span className={`pp-coverage-toggle ${coverageExpanded ? 'expanded' : ''}`}>
                    <i className="pi pi-chevron-down"></i>
                </span>
            </div>
            
            {coverageExpanded && (
                <div className="pp-coverage-content">
                    <p className="pp-section-description">
                        Lütfen sigortaya dahil edilecek teminat tutarlarını belirtiniz.
                    </p>

                    {/* Row 1: Eşya Bedeli, Cam Bedeli */}
                    <div className="pp-form-row">
                        <div className={`pp-form-group ${formik.touched.furniturePrice && formik.errors.furniturePrice ? 'error' : ''}`}>
                            <label className="pp-label">Eşya Bedeli (TL) *</label>
                            <input
                                type="text"
                                className="pp-input"
                                value={formatNumberWithDots(formik.values.furniturePrice)}
                                onChange={(e) => {
                                    const formattedValue = handleFormattedNumberChange(e.target.value, 1000000);
                                    formik.setFieldValue('furniturePrice', formattedValue);
                                }}
                                onBlur={() => formik.setFieldTouched('furniturePrice', true)}
                                placeholder="Örn: 500.000"
                            />
                            <span className="pp-helper-text">Ev eşyalarının toplam değeri</span>
                            {formik.touched.furniturePrice && formik.errors.furniturePrice && (
                                <div className="pp-error-message">{formik.errors.furniturePrice}</div>
                            )}
                        </div>

                        <div className={`pp-form-group ${formik.touched.windowPrice && formik.errors.windowPrice ? 'error' : ''}`}>
                            <label className="pp-label">Cam Bedeli (TL) *</label>
                            <input
                                type="text"
                                className="pp-input"
                                value={formatNumberWithDots(formik.values.windowPrice)}
                                onChange={(e) => {
                                    const formattedValue = handleFormattedNumberChange(e.target.value, 100000);
                                    formik.setFieldValue('windowPrice', formattedValue);
                                }}
                                onBlur={() => formik.setFieldTouched('windowPrice', true)}
                                placeholder="Örn: 100.000"
                            />
                            <span className="pp-helper-text">Cam kırılması hasar teminatı</span>
                            {formik.touched.windowPrice && formik.errors.windowPrice && (
                                <div className="pp-error-message">{formik.errors.windowPrice}</div>
                            )}
                        </div>
                    </div>

                    {/* Row 2: Elektronik Cihaz Bedeli, İzolasyon Bedeli */}
                    <div className="pp-form-row">
                        <div className={`pp-form-group ${formik.touched.electronicDevicePrice && formik.errors.electronicDevicePrice ? 'error' : ''}`}>
                            <label className="pp-label">Elektronik Cihaz Bedeli (TL) *</label>
                            <input
                                type="text"
                                className="pp-input"
                                value={formatNumberWithDots(formik.values.electronicDevicePrice)}
                                onChange={(e) => {
                                    const formattedValue = handleFormattedNumberChange(e.target.value, 500000);
                                    formik.setFieldValue('electronicDevicePrice', formattedValue);
                                }}
                                onBlur={() => formik.setFieldTouched('electronicDevicePrice', true)}
                                placeholder="Örn: 10.000"
                            />
                            <span className="pp-helper-text">TV, bilgisayar, telefon vb. değeri</span>
                            {formik.touched.electronicDevicePrice && formik.errors.electronicDevicePrice && (
                                <div className="pp-error-message">{formik.errors.electronicDevicePrice}</div>
                            )}
                        </div>

                        <div className={`pp-form-group ${formik.touched.insulationPrice && formik.errors.insulationPrice ? 'error' : ''}`}>
                            <label className="pp-label">İzolasyon Bedeli (TL) *</label>
                            <input
                                type="text"
                                className="pp-input"
                                value={formatNumberWithDots(formik.values.insulationPrice)}
                                onChange={(e) => {
                                    const formattedValue = handleFormattedNumberChange(e.target.value, 100000);
                                    formik.setFieldValue('insulationPrice', formattedValue);
                                }}
                                onBlur={() => formik.setFieldTouched('insulationPrice', true)}
                                placeholder="Örn: 10.000"
                            />
                            <span className="pp-helper-text">Su izolasyonu hasar teminatı</span>
                            {formik.touched.insulationPrice && formik.errors.insulationPrice && (
                                <div className="pp-error-message">{formik.errors.insulationPrice}</div>
                            )}
                        </div>
                    </div>

                    {/* Row 3: Enflasyon */}
                    <div className="pp-form-row pp-form-row-1">
                        <div className={`pp-form-group ${formik.touched.inflationValue && formik.errors.inflationValue ? 'error' : ''}`}>
                            <label className="pp-label">Enflasyon Oranı *</label>
                            <Dropdown
                                value={formik.values.inflationValue}
                                options={inflationOptions}
                                onChange={(e) => formik.setFieldValue('inflationValue', e.value)}
                                placeholder="Seçiniz"
                                className="pp-dropdown"
                            />
                            {formik.touched.inflationValue && formik.errors.inflationValue && (
                                <div className="pp-error-message">{String(formik.errors.inflationValue)}</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderExistingProperties = () => (
        <div className="pp-existing-vehicles">
            {properties.length === 0 ? (
                <p className="pp-no-data-message">Kayıtlı konut bulunamadı. Lütfen yeni konut ekleyin.</p>
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

            {/* Teminat Bilgileri - Kayıtlı Konut Seçimi için */}
            {renderCoverageInfo()}

            {formik.values.selectedPropertyId && (
                <div className="pp-button-group">
                    <button
                        type="button"
                        className="pp-btn-submit"
                        onClick={onSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? 'İşleniyor...' : 'Teklifleri Gör'}
                    </button>
                </div>
            )}
        </div>
    );

    const renderAddressForm = (disabled: boolean = false) => (
        <>
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

            <div className="pp-form-row pp-form-row-1">
                <div className={`pp-form-group ${formik.touched.apartmentReference && formik.errors.apartmentReference ? 'error' : ''}`}>
                    <label className="pp-label">Daire No *</label>
                    <Dropdown
                        value={formik.values.apartmentReference}
                        options={[...apartments].sort((a, b) => a.text.localeCompare(b.text, 'tr')).map(a => ({ label: a.text, value: a.value }))}
                        onChange={(e) => {
                            formik.setFieldValue('apartmentReference', e.value, true);
                            formik.setFieldTouched('apartmentReference', true, false);
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

    const renderPropertyDetails = (disabled: boolean = false) => (
        <>
            <div className="pp-section-title">Konut Özellikleri</div>

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

            <div className="pp-form-row">
                <div className={`pp-form-group ${formik.touched.floorCountRange && formik.errors.floorCountRange ? 'error' : ''}`}>
                    <label className="pp-label">Bina Kat Sayısı *</label>
                    <Dropdown
                        value={formik.values.floorCountRange}
                        options={floorCountRangeOptions}
                        onChange={(e) => {
                            formik.setFieldValue('floorCountRange', e.value, true);
                            formik.setFieldTouched('floorCountRange', true, false);
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

    const renderNewPropertyForm = () => (
        <>
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

            {/* Teminat Bilgileri - Yeni Konut Ekle için */}
            {renderCoverageInfo()}

            <div className="pp-button-group">
                <button
                    type="button"
                    className="pp-btn-submit"
                    onClick={onSubmit}
                    disabled={isLoading}
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
                    </div>
                </div>

                {selectionType === 'existing' && renderExistingProperties()}
                {selectionType === 'new' && renderNewPropertyForm()}
            </div>
        </div>
    );
};

export default KonutStep2;

