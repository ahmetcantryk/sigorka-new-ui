import React, { useState, useEffect, useCallback } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useAuthStore } from '@/store/useAuthStore';
import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS, API_BASE_URL } from '@/config/api';
import {
    PropertyStructure,
    PropertyUtilizationStyle,
    PropertyDamageStatus,
    DaskPropertyFloorCountRange,
    DaskPropertyOwnershipType
} from '../../types';

interface UpdatePropertyModalProps {
    propertyId: string;
    onClose: () => void;
    onSuccess: () => void;
}

interface Bank {
    id: string;
    name: string;
}

interface BankBranch {
    id: string;
    name: string;
    bankId: string;
}

interface FinancialInstitution {
    id: string;
    name: string;
}

// Kat aralığını API payload formatına dönüştüren fonksiyon
const mapFloorCountRangeToPayload = (range: DaskPropertyFloorCountRange): { $type: "range"; min: number; max: number } | null => {
    switch (range) {
        case DaskPropertyFloorCountRange.Between1And3:
            return { $type: "range", min: 1, max: 3 };
        case DaskPropertyFloorCountRange.Between4And7:
            return { $type: "range", min: 4, max: 7 };
        case DaskPropertyFloorCountRange.Between8And18:
            return { $type: "range", min: 8, max: 18 };
        case DaskPropertyFloorCountRange.MoreThan19:
            return { $type: "range", min: 19, max: 99 };
        default:
            return null;
    }
};

// Enum'ları backend string'lerine çeviren fonksiyonlar
const mapUtilizationStyleToBackendString = (value: PropertyUtilizationStyle): string => {
    switch (value) {
        case PropertyUtilizationStyle.House: return 'HOUSE';
        case PropertyUtilizationStyle.Business: return 'BUSINESS';
        case PropertyUtilizationStyle.Other: return 'OTHER';
        default: return 'UNKNOWN';
    }
};

const mapDamageStatusToBackendString = (value: PropertyDamageStatus): string => {
    switch (value) {
        case PropertyDamageStatus.None: return 'NONE';
        case PropertyDamageStatus.SlightlyDamaged: return 'SLIGHTLY_DAMAGED';
        case PropertyDamageStatus.ModeratelyDamaged: return 'MODERATELY_DAMAGED';
        case PropertyDamageStatus.SeverelyDamaged: return 'SEVERELY_DAMAGED';
        default: return 'UNKNOWN';
    }
};

const mapOwnershipTypeToBackendString = (value: DaskPropertyOwnershipType): string => {
    switch (value) {
        case DaskPropertyOwnershipType.Proprietor: return 'PROPRIETOR';
        case DaskPropertyOwnershipType.Tenant: return 'TENANT';
        default: return 'UNKNOWN';
    }
};

// Bina yapı tarzı seçenekleri
const structureTypeOptions = [
    { value: PropertyStructure.SteelReinforcedConcrete, label: 'Çelik Betonarme' },
    { value: PropertyStructure.Other, label: 'Diğer' },
];

// Kullanım şekli seçenekleri
const utilizationStyleOptions = [
    { value: PropertyUtilizationStyle.House, label: 'Konut' },
    { value: PropertyUtilizationStyle.Business, label: 'İş Yeri' },
];

// Hasar durumu seçenekleri
const damageStatusOptions = [
    { value: PropertyDamageStatus.None, label: 'Hasarsız' },
    { value: PropertyDamageStatus.SlightlyDamaged, label: 'Az Hasarlı' },
    { value: PropertyDamageStatus.ModeratelyDamaged, label: 'Orta Hasarlı' },
    { value: PropertyDamageStatus.SeverelyDamaged, label: 'Ağır Hasarlı' },
];

// Kat sayısı aralığı seçenekleri
const floorCountRangeOptions = [
    { value: DaskPropertyFloorCountRange.Between1And3, label: '1-3 Kat' },
    { value: DaskPropertyFloorCountRange.Between4And7, label: '4-7 Kat' },
    { value: DaskPropertyFloorCountRange.Between8And18, label: '8-18 Kat' },
    { value: DaskPropertyFloorCountRange.MoreThan19, label: '19+ Kat' },
];

// Sahiplik türü seçenekleri
const ownershipTypeOptions = [
    { value: DaskPropertyOwnershipType.Proprietor, label: 'Malik' },
    { value: DaskPropertyOwnershipType.Tenant, label: 'Kiracı' },
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
            return 99;
        default:
            return 99;
    }
};

// Bulunduğu kat validasyonu
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

const UpdatePropertyModal: React.FC<UpdatePropertyModalProps> = ({ propertyId, onClose, onSuccess }) => {
    const { accessToken, customerId } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [propertyData, setPropertyData] = useState<any>(null);

    // Address Options
    const [cities, setCities] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [towns, setTowns] = useState<any[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<any[]>([]);
    const [streets, setStreets] = useState<any[]>([]);
    const [buildings, setBuildings] = useState<any[]>([]);
    const [apartments, setApartments] = useState<any[]>([]);

    // Financial Options
    const [banks, setBanks] = useState<Bank[]>([]);
    const [financialInstitutions, setFinancialInstitutions] = useState<FinancialInstitution[]>([]);
    const [bankBranches, setBankBranches] = useState<BankBranch[]>([]);

    const [formData, setFormData] = useState({
        uavtNo: '', // Hidden from UI but sent to API
        cityReference: '',
        districtReference: '',
        townReference: '',
        neighborhoodReference: '',
        streetReference: '',
        buildingReference: '',
        apartmentReference: '',
        buildingType: PropertyStructure.Unknown,
        constructionYear: '',
        floorCountRange: DaskPropertyFloorCountRange.Unknown,
        floorNumber: '',
        squareMeters: '',
        usageType: PropertyUtilizationStyle.Unknown,
        riskZone: PropertyDamageStatus.Unknown,
        ownershipType: DaskPropertyOwnershipType.Unknown,

        // Dain-i Murtehin
        dainMurtehin: 'none' as 'none' | 'bank' | 'finance',
        dainMurtehinBankId: '',
        dainMurtehinBankName: '',
        dainMurtehinBranchId: '',
        dainMurtehinBranchName: '',
        dainMurtehinFinancialId: '',
        dainMurtehinFinancialName: '',
    });

    const [errors, setErrors] = useState({
        cityReference: '',
        districtReference: '',
        townReference: '',
        neighborhoodReference: '',
        streetReference: '',
        buildingReference: '',
        apartmentReference: '',
        buildingType: '',
        constructionYear: '',
        floorCountRange: '',
        floorNumber: '',
        squareMeters: '',
        usageType: '',
        riskZone: '',
        ownershipType: '',
        dainMurtehinBankId: '',
        dainMurtehinBranchId: '',
        dainMurtehinFinancialId: '',
    });

    // Address Fetchers
    const fetchDistricts = useCallback(async (cityValue: string) => {
        const res = await fetchWithAuth(API_ENDPOINTS.ADDRESS_DISTRICTS(cityValue));
        if (res.ok) setDistricts(await res.json());
    }, []);

    const fetchTowns = useCallback(async (districtValue: string) => {
        const res = await fetchWithAuth(API_ENDPOINTS.ADDRESS_TOWNS(districtValue));
        if (res.ok) setTowns(await res.json());
    }, []);

    const fetchNeighborhoods = useCallback(async (townValue: string) => {
        const res = await fetchWithAuth(API_ENDPOINTS.ADDRESS_NEIGHBORHOODS(townValue));
        if (res.ok) setNeighborhoods(await res.json());
    }, []);

    const fetchStreets = useCallback(async (neighborhoodValue: string) => {
        const res = await fetchWithAuth(API_ENDPOINTS.ADDRESS_STREETS(neighborhoodValue));
        if (res.ok) setStreets(await res.json());
    }, []);

    const fetchBuildings = useCallback(async (streetValue: string) => {
        const res = await fetchWithAuth(API_ENDPOINTS.ADDRESS_BUILDINGS(streetValue));
        if (res.ok) setBuildings(await res.json());
    }, []);

    const fetchApartments = useCallback(async (buildingValue: string) => {
        const res = await fetchWithAuth(API_ENDPOINTS.ADDRESS_APARTMENTS(buildingValue));
        if (res.ok) setApartments(await res.json());
    }, []);

    const fetchBankBranches = useCallback(async (bankId: string) => {
        const res = await fetchWithAuth(`${API_BASE_URL}/api/banks/${bankId}/branches`);
        if (res.ok) setBankBranches(await res.json());
    }, []);

    // Fetch Initial Data & Property Details
    useEffect(() => {
        const fetchInitialData = async () => {
            if (!accessToken) return;

            try {
                // Fetch Cities
                const citiesResponse = await fetchWithAuth(API_ENDPOINTS.ADDRESS_CITIES);
                if (citiesResponse.ok) {
                    const data = await citiesResponse.json();
                    setCities(data.filter((c: any) => !['89', '999'].includes(c.value)).sort((a: any, b: any) => parseInt(a.value) - parseInt(b.value)));
                }

                // Fetch Banks
                const banksResponse = await fetchWithAuth(`${API_BASE_URL}/api/banks`);
                if (banksResponse.ok) setBanks(await banksResponse.json());

                // Fetch Financial Institutions
                const fiResponse = await fetchWithAuth(`${API_BASE_URL}/api/financial-institutions`);
                if (fiResponse.ok) setFinancialInstitutions(await fiResponse.json());

                // Fetch Property Details if ID exists
                if (propertyId && customerId) {
                    setIsLoading(true);
                    const response = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_PROPERTY_DETAIL(customerId, propertyId));

                    if (response.ok) {
                        const data = await response.json();
                        setPropertyData(data);

                        // Convert floor range to enum
                        const getFloorCountRangeFromApi = (floor: any): DaskPropertyFloorCountRange => {
                            if (!floor?.totalFloors) return DaskPropertyFloorCountRange.Unknown;
                            const { min, max } = floor.totalFloors;
                            if (min === 1 && max === 3) return DaskPropertyFloorCountRange.Between1And3;
                            if (min === 4 && max === 7) return DaskPropertyFloorCountRange.Between4And7;
                            if (min === 8 && max === 18) return DaskPropertyFloorCountRange.Between8And18;
                            if (min === 19) return DaskPropertyFloorCountRange.MoreThan19;
                            return DaskPropertyFloorCountRange.Unknown;
                        };

                        // Convert structure string to enum
                        const getStructureFromApi = (structure: string): PropertyStructure => {
                            switch (structure) {
                                case 'STEEL_REINFORCED_CONCRETE':
                                    return PropertyStructure.SteelReinforcedConcrete;
                                case 'OTHER':
                                    return PropertyStructure.Other;
                                default:
                                    return PropertyStructure.Unknown;
                            }
                        };

                        // Convert utilization style string to enum
                        const getUtilizationStyleFromApi = (style: string): PropertyUtilizationStyle => {
                            switch (style) {
                                case 'HOUSE':
                                    return PropertyUtilizationStyle.House;
                                case 'BUSINESS':
                                    return PropertyUtilizationStyle.Business;
                                default:
                                    return PropertyUtilizationStyle.Unknown;
                            }
                        };

                        // Convert damage status string to enum
                        const getDamageStatusFromApi = (status: string): PropertyDamageStatus => {
                            switch (status) {
                                case 'NONE':
                                    return PropertyDamageStatus.None;
                                case 'SLIGHTLY_DAMAGED':
                                    return PropertyDamageStatus.SlightlyDamaged;
                                case 'MODERATELY_DAMAGED':
                                    return PropertyDamageStatus.ModeratelyDamaged;
                                case 'SEVERELY_DAMAGED':
                                    return PropertyDamageStatus.SeverelyDamaged;
                                default:
                                    return PropertyDamageStatus.Unknown;
                            }
                        };

                        // Convert ownership type string to enum
                        const getOwnershipTypeFromApi = (type: string): DaskPropertyOwnershipType => {
                            switch (type) {
                                case 'PROPRIETOR':
                                    return DaskPropertyOwnershipType.Proprietor;
                                case 'TENANT':
                                    return DaskPropertyOwnershipType.Tenant;
                                default:
                                    return DaskPropertyOwnershipType.Unknown;
                            }
                        };

                        // Populate form with API data
                        setFormData(prev => ({
                            ...prev,
                            uavtNo: data.number?.toString() || '',
                            cityReference: data.address?.city?.value || '',
                            districtReference: data.address?.district?.value || '',
                            townReference: data.address?.town?.value || '',
                            neighborhoodReference: data.address?.neighborhood?.value || '',
                            streetReference: data.address?.street?.value || '',
                            buildingReference: data.address?.building?.value || '',
                            apartmentReference: data.address?.apartment?.value || '',
                            buildingType: getStructureFromApi(data.structure),
                            constructionYear: data.constructionYear?.toString() || '',
                            floorCountRange: getFloorCountRangeFromApi(data.floor),
                            floorNumber: data.floor?.currentFloor?.toString() || '',
                            squareMeters: data.squareMeter?.toString() || '',
                            usageType: getUtilizationStyleFromApi(data.utilizationStyle),
                            riskZone: getDamageStatusFromApi(data.damageStatus),
                            ownershipType: getOwnershipTypeFromApi(data.ownershipType),

                            dainMurtehin: data.lossPayeeClause ? (data.lossPayeeClause.type === 'BANK' ? 'bank' : 'finance') : 'none',
                            dainMurtehinBankId: data.lossPayeeClause?.bank?.id || '',
                            dainMurtehinBankName: data.lossPayeeClause?.bank?.name || '',
                            dainMurtehinBranchId: data.lossPayeeClause?.bankBranch?.id || '',
                            dainMurtehinBranchName: data.lossPayeeClause?.bankBranch?.name || '',
                            dainMurtehinFinancialId: data.lossPayeeClause?.financialInstitution?.id || '',
                            dainMurtehinFinancialName: data.lossPayeeClause?.financialInstitution?.name || '',
                        }));

                        // Trigger address fetches sequentially
                        if (data.address?.city?.value) await fetchDistricts(data.address.city.value);
                        if (data.address?.district?.value) await fetchTowns(data.address.district.value);
                        if (data.address?.town?.value) await fetchNeighborhoods(data.address.town.value);
                        if (data.address?.neighborhood?.value) await fetchStreets(data.address.neighborhood.value);
                        if (data.address?.street?.value) await fetchBuildings(data.address.street.value);
                        if (data.address?.building?.value) await fetchApartments(data.address.building.value);

                        // Trigger bank branch fetch if needed
                        if (data.lossPayeeClause?.bank?.id) {
                            await fetchBankBranches(data.lossPayeeClause.bank.id);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [propertyId, accessToken, customerId, fetchDistricts, fetchTowns, fetchNeighborhoods, fetchStreets, fetchBuildings, fetchApartments, fetchBankBranches]);

    // Input handlers
    const handleChange = (name: string, value: string) => {
        // Metrekare için maskeleme
        if (name === 'squareMeters') {
            const sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 3);
            setFormData(prev => ({ ...prev, squareMeters: sanitizedValue }));
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

        // İnşa yılı için maskeleme
        if (name === 'constructionYear') {
            const sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 4);
            setFormData(prev => ({ ...prev, constructionYear: sanitizedValue }));
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

        // Bulunduğu kat için maskeleme
        if (name === 'floorNumber') {
            let cleanValue = value.replace(/[^0-9-]/g, '');
            if (cleanValue.indexOf('-') > 0) {
                cleanValue = cleanValue.replace(/-/g, '');
            }
            if ((cleanValue.match(/-/g) || []).length > 1) {
                cleanValue = cleanValue.substring(0, cleanValue.lastIndexOf('-'));
            }
            if (cleanValue.length > 3) {
                cleanValue = cleanValue.substring(0, 3);
            }
            setFormData(prev => ({ ...prev, floorNumber: cleanValue }));

            // Kat validasyonu
            const floorError = validateFloorNumber(cleanValue, formData.floorCountRange);
            if (floorError) {
                setErrors(prev => ({ ...prev, floorNumber: floorError }));
            } else if (!cleanValue) {
                setErrors(prev => ({ ...prev, floorNumber: 'Bulunduğu kat zorunludur' }));
            } else {
                setErrors(prev => ({ ...prev, floorNumber: '' }));
            }
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: '' }));
    };

    // Address change handler
    const handleAddressChange = async (name: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Clear child selections
            ...(name === 'cityReference' && {
                districtReference: '',
                townReference: '',
                neighborhoodReference: '',
                streetReference: '',
                buildingReference: '',
                apartmentReference: '',
            }),
            ...(name === 'districtReference' && {
                townReference: '',
                neighborhoodReference: '',
                streetReference: '',
                buildingReference: '',
                apartmentReference: '',
            }),
            ...(name === 'townReference' && {
                neighborhoodReference: '',
                streetReference: '',
                buildingReference: '',
                apartmentReference: '',
            }),
            ...(name === 'neighborhoodReference' && {
                streetReference: '',
                buildingReference: '',
                apartmentReference: '',
            }),
            ...(name === 'streetReference' && {
                buildingReference: '',
                apartmentReference: '',
            }),
            ...(name === 'buildingReference' && {
                apartmentReference: '',
            }),
        }));

        // Clear child lists
        if (name === 'cityReference') {
            setDistricts([]);
            setTowns([]);
            setNeighborhoods([]);
            setStreets([]);
            setBuildings([]);
            setApartments([]);
            if (value) await fetchDistricts(value);
        } else if (name === 'districtReference') {
            setTowns([]);
            setNeighborhoods([]);
            setStreets([]);
            setBuildings([]);
            setApartments([]);
            if (value) await fetchTowns(value);
        } else if (name === 'townReference') {
            setNeighborhoods([]);
            setStreets([]);
            setBuildings([]);
            setApartments([]);
            if (value) await fetchNeighborhoods(value);
        } else if (name === 'neighborhoodReference') {
            setStreets([]);
            setBuildings([]);
            setApartments([]);
            if (value) await fetchStreets(value);
        } else if (name === 'streetReference') {
            setBuildings([]);
            setApartments([]);
            if (value) await fetchBuildings(value);
        } else if (name === 'buildingReference') {
            setApartments([]);
            if (value) await fetchApartments(value);
        }
    };

    // Bank change handler
    const handleBankChange = async (bankId: string) => {
        if (!bankId || bankId === '') {
            setFormData(prev => ({
                ...prev,
                dainMurtehinBankId: '',
                dainMurtehinBankName: '',
                dainMurtehinBranchId: '',
                dainMurtehinBranchName: '',
            }));
            setBankBranches([]);
            return;
        }

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
        setErrors(prev => ({ ...prev, dainMurtehinBankId: '' }));
        await fetchBankBranches(bankId);
    };

    // Branch change handler
    const handleBranchChange = (branchId: string) => {
        if (!branchId || branchId === '') {
            setFormData(prev => ({
                ...prev,
                dainMurtehinBranchId: '',
                dainMurtehinBranchName: ''
            }));
            return;
        }

        const selectedBranch = bankBranches.find(b => b.id === branchId);
        setFormData(prev => ({
            ...prev,
            dainMurtehinBranchId: branchId,
            dainMurtehinBranchName: selectedBranch?.name || ''
        }));
        setErrors(prev => ({ ...prev, dainMurtehinBranchId: '' }));
    };

    // Financial institution change handler
    const handleFinancialInstitutionChange = (financialId: string) => {
        if (!financialId || financialId === '') {
            setFormData(prev => ({
                ...prev,
                dainMurtehinFinancialId: '',
                dainMurtehinFinancialName: ''
            }));
            return;
        }

        const selectedFI = financialInstitutions.find(fi => fi.id === financialId);
        setFormData(prev => ({
            ...prev,
            dainMurtehinFinancialId: financialId,
            dainMurtehinFinancialName: selectedFI?.name || '',
            dainMurtehinBankId: '',
            dainMurtehinBankName: '',
            dainMurtehinBranchId: '',
            dainMurtehinBranchName: ''
        }));
        setErrors(prev => ({ ...prev, dainMurtehinFinancialId: '' }));
    };

    // Dain-i mürtehin type change handler
    const handleDainMurtehinTypeChange = (type: 'none' | 'bank' | 'finance') => {
        setFormData(prev => ({
            ...prev,
            dainMurtehin: type,
            dainMurtehinBankId: '',
            dainMurtehinBankName: '',
            dainMurtehinBranchId: '',
            dainMurtehinBranchName: '',
            dainMurtehinFinancialId: '',
            dainMurtehinFinancialName: ''
        }));
        setBankBranches([]);
        setErrors(prev => ({
            ...prev,
            dainMurtehinBankId: '',
            dainMurtehinBranchId: '',
            dainMurtehinFinancialId: ''
        }));
    };

    // Floor count range change handler
    const handleFloorCountRangeChange = (value: DaskPropertyFloorCountRange) => {
        setFormData(prev => ({ ...prev, floorCountRange: value }));

        // Re-validate floor number with new range
        if (formData.floorNumber) {
            const error = validateFloorNumber(formData.floorNumber, value);
            setErrors(prev => ({ ...prev, floorNumber: error || '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        let hasError = false;

        // Validations
        if (!formData.squareMeters) {
            setErrors(prev => ({ ...prev, squareMeters: 'Metrekare zorunludur' }));
            hasError = true;
        }

        if (!formData.constructionYear) {
            setErrors(prev => ({ ...prev, constructionYear: 'Bina inşa yılı zorunludur' }));
            hasError = true;
        }

        if (!formData.floorNumber) {
            setErrors(prev => ({ ...prev, floorNumber: 'Bulunduğu kat zorunludur' }));
            hasError = true;
        }

        if (formData.floorCountRange === DaskPropertyFloorCountRange.Unknown) {
            setErrors(prev => ({ ...prev, floorCountRange: 'Bina kat sayısı zorunludur' }));
            hasError = true;
        }

        if (formData.buildingType === PropertyStructure.Unknown) {
            setErrors(prev => ({ ...prev, buildingType: 'Bina yapı tarzı zorunludur' }));
            hasError = true;
        }

        if (formData.usageType === PropertyUtilizationStyle.Unknown) {
            setErrors(prev => ({ ...prev, usageType: 'Kullanım şekli zorunludur' }));
            hasError = true;
        }

        if (formData.riskZone === PropertyDamageStatus.Unknown) {
            setErrors(prev => ({ ...prev, riskZone: 'Hasar durumu zorunludur' }));
            hasError = true;
        }

        if (formData.ownershipType === DaskPropertyOwnershipType.Unknown) {
            setErrors(prev => ({ ...prev, ownershipType: 'Sahiplik türü zorunludur' }));
            hasError = true;
        }

        // Floor number validation
        const floorError = validateFloorNumber(formData.floorNumber, formData.floorCountRange);
        if (floorError) {
            setErrors(prev => ({ ...prev, floorNumber: floorError }));
            hasError = true;
        }

        // Dain-i mürtehin validation
        if (formData.dainMurtehin === 'bank') {
            if (!formData.dainMurtehinBankId) {
                setErrors(prev => ({ ...prev, dainMurtehinBankId: 'Lütfen banka seçiniz' }));
                hasError = true;
            }
            if (!formData.dainMurtehinBranchId) {
                setErrors(prev => ({ ...prev, dainMurtehinBranchId: 'Lütfen banka şubesi seçiniz' }));
                hasError = true;
            }
        } else if (formData.dainMurtehin === 'finance') {
            if (!formData.dainMurtehinFinancialId) {
                setErrors(prev => ({ ...prev, dainMurtehinFinancialId: 'Lütfen finans kurumu seçiniz' }));
                hasError = true;
            }
        }

        if (hasError) return;

        setIsLoading(true);
        try {
            const payload: any = {
                uavtAddressCode: formData.uavtNo,
                address: {
                    city: { value: formData.cityReference },
                    district: { value: formData.districtReference },
                    town: { value: formData.townReference },
                    neighbourhood: { value: formData.neighborhoodReference },
                    street: { value: formData.streetReference },
                    building: { value: formData.buildingReference },
                    apartment: { value: formData.apartmentReference }
                },
                structure: formData.buildingType === PropertyStructure.SteelReinforcedConcrete ? 'STEEL_REINFORCED_CONCRETE' : 'OTHER',
                constructionYear: parseInt(formData.constructionYear),
                floor: {
                    totalFloors: mapFloorCountRangeToPayload(formData.floorCountRange),
                    currentFloor: parseInt(formData.floorNumber)
                },
                squareMeter: parseInt(formData.squareMeters),
                utilizationStyle: mapUtilizationStyleToBackendString(formData.usageType),
                damageStatus: mapDamageStatusToBackendString(formData.riskZone),
                ownershipType: mapOwnershipTypeToBackendString(formData.ownershipType)
            };

            if (formData.dainMurtehin !== 'none') {
                payload.lossPayeeClause = {
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
                };
            }

            const response = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_PROPERTY_DETAIL(customerId!, propertyId), {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                onSuccess();
                onClose();
            } else {
                const errorText = await response.text();
                alert(`Güncelleme sırasında bir hata oluştu: ${errorText}`);
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('Güncelleme yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!propertyData) {
    return (
            <div className="update-vehicle-modal-overlay">
                <div className="update-vehicle-modal-container">
                    <div className="update-vehicle-modal-loading">
                        <div className="pp-spinner"></div>
                        <p>Konut bilgileri yükleniyor...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="update-vehicle-modal-overlay" onClick={onClose}>
            <div className="update-vehicle-modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="update-vehicle-modal-header">
                    <h2 className="update-vehicle-modal-title">Konut Bilgilerini Güncelle</h2>
                    <button className="update-vehicle-modal-close" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="update-vehicle-modal-content">
                    {/* Adres Bilgileri */}
                    <div className="update-vehicle-form-section">
                        <h3 className="update-vehicle-section-title">Adres Bilgileri</h3>

                        <div className="update-vehicle-form-row update-vehicle-form-row-3">
                            <div className="update-vehicle-form-group">
                                <label className="update-vehicle-label">İl *</label>
                                <div className="update-vehicle-dropdown">
                                    <Dropdown
                                        value={formData.cityReference}
                                        options={cities.map(c => ({ label: c.text, value: c.value }))}
                                        onChange={(e) => handleAddressChange('cityReference', e.value)}
                                        placeholder="Seçiniz"
                                        filter
                                        filterPlaceholder="Ara..."
                                        emptyFilterMessage="Sonuç bulunamadı"
                                        appendTo={document.body}
                                        panelClassName="update-vehicle-dropdown-panel"
                                    />
                                </div>
                                {errors.cityReference && <p className="update-vehicle-error">{errors.cityReference}</p>}
                            </div>

                            <div className="update-vehicle-form-group">
                                <label className="update-vehicle-label">İlçe *</label>
                                <div className="update-vehicle-dropdown">
                                    <Dropdown
                                        value={formData.districtReference}
                                        options={[...districts].sort((a, b) => a.text.localeCompare(b.text, 'tr')).map(d => ({ label: d.text, value: d.value }))}
                                        onChange={(e) => handleAddressChange('districtReference', e.value)}
                                        placeholder="Seçiniz"
                                        filter
                                        filterPlaceholder="Ara..."
                                        emptyFilterMessage="Sonuç bulunamadı"
                                        disabled={!formData.cityReference}
                                        appendTo={document.body}
                                        panelClassName="update-vehicle-dropdown-panel"
                                    />
                                </div>
                                {errors.districtReference && <p className="update-vehicle-error">{errors.districtReference}</p>}
                            </div>

                            <div className="update-vehicle-form-group">
                                <label className="update-vehicle-label">Belde / Semt</label>
                                <div className="update-vehicle-dropdown">
                                    <Dropdown
                                        value={formData.townReference}
                                        options={[...towns].sort((a, b) => a.text.localeCompare(b.text, 'tr')).map(t => ({ label: t.text, value: t.value }))}
                                        onChange={(e) => handleAddressChange('townReference', e.value)}
                                        placeholder="Seçiniz"
                                        filter
                                        filterPlaceholder="Ara..."
                                        emptyFilterMessage="Sonuç bulunamadı"
                                        disabled={!formData.districtReference}
                                        appendTo={document.body}
                                        panelClassName="update-vehicle-dropdown-panel"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="update-vehicle-form-row update-vehicle-form-row-3">
                            <div className="update-vehicle-form-group">
                                <label className="update-vehicle-label">Mahalle</label>
                                <div className="update-vehicle-dropdown">
                                    <Dropdown
                                        value={formData.neighborhoodReference}
                                        options={[...neighborhoods].sort((a, b) => a.text.localeCompare(b.text, 'tr')).map(n => ({ label: n.text, value: n.value }))}
                                        onChange={(e) => handleAddressChange('neighborhoodReference', e.value)}
                                        placeholder="Seçiniz"
                                        filter
                                        filterPlaceholder="Ara..."
                                        emptyFilterMessage="Sonuç bulunamadı"
                                        disabled={!formData.townReference}
                                        appendTo={document.body}
                                        panelClassName="update-vehicle-dropdown-panel"
                                    />
                                </div>
                            </div>

                            <div className="update-vehicle-form-group">
                                <label className="update-vehicle-label">Sokak</label>
                                <div className="update-vehicle-dropdown">
                                    <Dropdown
                                        value={formData.streetReference}
                                        options={[...streets].sort((a, b) => a.text.localeCompare(b.text, 'tr')).map(s => ({ label: s.text, value: s.value }))}
                                        onChange={(e) => handleAddressChange('streetReference', e.value)}
                                        placeholder="Seçiniz"
                                        filter
                                        filterPlaceholder="Ara..."
                                        emptyFilterMessage="Sonuç bulunamadı"
                                        disabled={!formData.neighborhoodReference}
                                        appendTo={document.body}
                                        panelClassName="update-vehicle-dropdown-panel"
                                    />
                                </div>
                            </div>

                            <div className="update-vehicle-form-group">
                                <label className="update-vehicle-label">Bina</label>
                                <div className="update-vehicle-dropdown">
                                    <Dropdown
                                        value={formData.buildingReference}
                                        options={[...buildings].sort((a, b) => a.text.localeCompare(b.text, 'tr')).map(b => ({ label: b.text, value: b.value }))}
                                        onChange={(e) => handleAddressChange('buildingReference', e.value)}
                                        placeholder="Seçiniz"
                                        filter
                                        filterPlaceholder="Ara..."
                                        emptyFilterMessage="Sonuç bulunamadı"
                                        disabled={!formData.streetReference}
                                        appendTo={document.body}
                                        panelClassName="update-vehicle-dropdown-panel"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="update-vehicle-form-row update-vehicle-form-row-3">
                            <div className="update-vehicle-form-group">
                                <label className="update-vehicle-label">Daire</label>
                                <div className="update-vehicle-dropdown">
                                    <Dropdown
                                        value={formData.apartmentReference}
                                        options={[...apartments].sort((a, b) => a.text.localeCompare(b.text, 'tr')).map(a => ({ label: a.text, value: a.value }))}
                                        onChange={(e) => setFormData(prev => ({ ...prev, apartmentReference: e.value }))}
                                        placeholder="Seçiniz"
                                        filter
                                        filterPlaceholder="Ara..."
                                        emptyFilterMessage="Sonuç bulunamadı"
                                        disabled={!formData.buildingReference}
                                        appendTo={document.body}
                                        panelClassName="update-vehicle-dropdown-panel"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Konut Özellikleri */}
                    <div className="update-vehicle-form-section">
                        <h3 className="update-vehicle-section-title">Konut Özellikleri</h3>

                        <div className="update-vehicle-form-row update-vehicle-form-row-3">
                            <div className="update-vehicle-form-group">
                                <label className="update-vehicle-label">Bina Yapı Tarzı *</label>
                                <div className="update-vehicle-dropdown">
                                    <Dropdown
                                        value={formData.buildingType}
                                        options={structureTypeOptions}
                                        onChange={(e) => setFormData(prev => ({ ...prev, buildingType: e.value }))}
                                        placeholder="Seçiniz"
                                        appendTo={document.body}
                                        panelClassName="update-vehicle-dropdown-panel"
                                    />
                                </div>
                                {errors.buildingType && <p className="update-vehicle-error">{errors.buildingType}</p>}
                            </div>

                            <div className="update-vehicle-form-group">
                                <label className="update-vehicle-label">İnşa Yılı *</label>
                                <input
                                    type="text"
                                    className="update-vehicle-input"
                                    value={formData.constructionYear}
                                    onChange={(e) => handleChange('constructionYear', e.target.value)}
                                    maxLength={4}
                                    placeholder="Örn: 2010"
                                />
                                {errors.constructionYear && <p className="update-vehicle-error">{errors.constructionYear}</p>}
                            </div>

                            <div className="update-vehicle-form-group">
                                <label className="update-vehicle-label">Bina Kat Sayısı *</label>
                                <div className="update-vehicle-dropdown">
                                    <Dropdown
                                        value={formData.floorCountRange}
                                        options={floorCountRangeOptions}
                                        onChange={(e) => handleFloorCountRangeChange(e.value)}
                                        placeholder="Seçiniz"
                                        appendTo={document.body}
                                        panelClassName="update-vehicle-dropdown-panel"
                                    />
                                </div>
                                {errors.floorCountRange && <p className="update-vehicle-error">{errors.floorCountRange}</p>}
                            </div>
                        </div>

                        <div className="update-vehicle-form-row update-vehicle-form-row-3">
                            <div className="update-vehicle-form-group">
                                <label className="update-vehicle-label">Bulunduğu Kat *</label>
                                <input
                                    type="text"
                                    className="update-vehicle-input"
                                    value={formData.floorNumber}
                                    onChange={(e) => handleChange('floorNumber', e.target.value)}
                                    placeholder="Örn: 2 veya -1"
                                    maxLength={3}
                                />
                                {errors.floorNumber && <p className="update-vehicle-error">{errors.floorNumber}</p>}
                            </div>

                            <div className="update-vehicle-form-group">
                                <label className="update-vehicle-label">Daire Brüt m² *</label>
                                <input
                                    type="text"
                                    className="update-vehicle-input"
                                    value={formData.squareMeters}
                                    onChange={(e) => handleChange('squareMeters', e.target.value)}
                                    placeholder="Örn: 100"
                                    maxLength={3}
                                />
                                {errors.squareMeters && <p className="update-vehicle-error">{errors.squareMeters}</p>}
                            </div>

                            <div className="update-vehicle-form-group">
                                <label className="update-vehicle-label">Kullanım Şekli *</label>
                                <div className="update-vehicle-dropdown">
                                    <Dropdown
                                        value={formData.usageType}
                                        options={utilizationStyleOptions}
                                        onChange={(e) => setFormData(prev => ({ ...prev, usageType: e.value }))}
                                        placeholder="Seçiniz"
                                        appendTo={document.body}
                                        panelClassName="update-vehicle-dropdown-panel"
                                    />
                                </div>
                                {errors.usageType && <p className="update-vehicle-error">{errors.usageType}</p>}
                            </div>
                        </div>

                        <div className="update-vehicle-form-row update-vehicle-form-row-3">
                            <div className="update-vehicle-form-group">
                                <label className="update-vehicle-label">Hasar Durumu *</label>
                                <div className="update-vehicle-dropdown">
                                    <Dropdown
                                        value={formData.riskZone}
                                        options={damageStatusOptions}
                                        onChange={(e) => setFormData(prev => ({ ...prev, riskZone: e.value }))}
                                        placeholder="Seçiniz"
                                        appendTo={document.body}
                                        panelClassName="update-vehicle-dropdown-panel"
                                    />
                                </div>
                                {errors.riskZone && <p className="update-vehicle-error">{errors.riskZone}</p>}
                            </div>

                            <div className="update-vehicle-form-group">
                                <label className="update-vehicle-label">Sahiplik Türü *</label>
                                <div className="update-vehicle-dropdown">
                                    <Dropdown
                                        value={formData.ownershipType}
                                        options={ownershipTypeOptions}
                                        onChange={(e) => setFormData(prev => ({ ...prev, ownershipType: e.value }))}
                                        placeholder="Seçiniz"
                                        appendTo={document.body}
                                        panelClassName="update-vehicle-dropdown-panel"
                                    />
                                </div>
                                {errors.ownershipType && <p className="update-vehicle-error">{errors.ownershipType}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Dain-i Mürtehin */}
                    <div className="update-vehicle-form-section">
                        <h3 className="update-vehicle-section-title">Rehin Alacaklı Var mı? (Dain-i Mürtehin)</h3>
                        <div className="update-vehicle-dain-buttons">
                            <button
                                type="button"
                                className={`update-vehicle-dain-button ${formData.dainMurtehin === 'none' ? 'active' : ''}`}
                                onClick={() => handleDainMurtehinTypeChange('none')}
                            >
                                Yok
                            </button>
                            <button
                                type="button"
                                className={`update-vehicle-dain-button ${formData.dainMurtehin === 'bank' ? 'active' : ''}`}
                                onClick={() => handleDainMurtehinTypeChange('bank')}
                            >
                                            Banka
                            </button>
                            <button
                                type="button"
                                className={`update-vehicle-dain-button ${formData.dainMurtehin === 'finance' ? 'active' : ''}`}
                                onClick={() => handleDainMurtehinTypeChange('finance')}
                            >
                                            Finans Kurumu
                            </button>
                            </div>

                        {formData.dainMurtehin !== 'none' && (
                            <div className="update-vehicle-dain-content">
                                {formData.dainMurtehin === 'bank' ? (
                                    <div className="update-vehicle-form-row-2">
                                        <div className="update-vehicle-form-group">
                                            <label className="update-vehicle-label">Banka *</label>
                                            <div className="update-vehicle-dropdown">
                                        <Dropdown
                                                    value={formData.dainMurtehinBankId || null}
                                                    options={banks
                                                        .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
                                                        .map(bank => ({
                                                            value: bank.id,
                                                            label: bank.name
                                                        }))
                                                    }
                                                    onChange={(e) => handleBankChange(e.value || '')}
                                            placeholder="Seçiniz"
                                            filter
                                                    filterPlaceholder="Ara..."
                                                    emptyFilterMessage="Sonuç bulunamadı"
                                                    showClear
                                                    appendTo={document.body}
                                                    panelClassName="update-vehicle-dropdown-panel"
                                        />
                                    </div>
                                            {errors.dainMurtehinBankId && <p className="update-vehicle-error">{errors.dainMurtehinBankId}</p>}
                                        </div>

                                        {formData.dainMurtehinBankId && bankBranches.length > 0 && (
                                            <div className="update-vehicle-form-group">
                                                <label className="update-vehicle-label">Banka Şubesi *</label>
                                                <div className="update-vehicle-dropdown">
                                        <Dropdown
                                                        value={formData.dainMurtehinBranchId || null}
                                                        options={bankBranches
                                                            .sort((a, b) => a.name.localeCompare(b.name, 'tr'))
                                                            .map(branch => ({
                                                                value: branch.id,
                                                                label: branch.name
                                                            }))
                                                        }
                                                        onChange={(e) => handleBranchChange(e.value || '')}
                                            placeholder="Seçiniz"
                                            filter
                                                        filterPlaceholder="Ara..."
                                                        emptyFilterMessage="Sonuç bulunamadı"
                                                        showClear
                                                        appendTo={document.body}
                                                        panelClassName="update-vehicle-dropdown-panel"
                                        />
                                    </div>
                                                {errors.dainMurtehinBranchId && <p className="update-vehicle-error">{errors.dainMurtehinBranchId}</p>}
                                </div>
                            )}
                                    </div>
                                ) : (
                                    <div className="update-vehicle-form-row-2">
                                        <div className="update-vehicle-form-group">
                                            <label className="update-vehicle-label">Finans Kurumu *</label>
                                            <div className="update-vehicle-dropdown">
                                        <Dropdown
                                                    value={formData.dainMurtehinFinancialId || null}
                                                    options={financialInstitutions
                                                        .sort((a, b) => {
                                                            const aClean = a.name.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
                                                            const bClean = b.name.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
                                                            const aFirstChar = aClean.charAt(0).toUpperCase();
                                                            const bFirstChar = bClean.charAt(0).toUpperCase();
                                                            const aIsLetter = /^[A-ZÇĞIİÖŞÜ]/.test(aFirstChar);
                                                            const bIsLetter = /^[A-ZÇĞIİÖŞÜ]/.test(bFirstChar);

                                                            if (aIsLetter && bIsLetter) {
                                                                return aClean.localeCompare(bClean, 'tr');
                                                            }
                                                            if (aIsLetter && !bIsLetter) return -1;
                                                            if (!aIsLetter && bIsLetter) return 1;
                                                            return aClean.localeCompare(bClean, 'tr');
                                                        })
                                                        .map(fi => ({
                                                            value: fi.id,
                                                            label: fi.name
                                                        }))
                                                    }
                                                    onChange={(e) => handleFinancialInstitutionChange(e.value || '')}
                                            placeholder="Seçiniz"
                                            filter
                                                    filterPlaceholder="Ara..."
                                                    emptyFilterMessage="Sonuç bulunamadı"
                                                    showClear
                                                    appendTo={document.body}
                                                    panelClassName="update-vehicle-dropdown-panel"
                                        />
                                            </div>
                                            {errors.dainMurtehinFinancialId && <p className="update-vehicle-error">{errors.dainMurtehinFinancialId}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="update-vehicle-modal-footer">
                        <button
                            type="submit"
                            className="update-vehicle-button update-vehicle-button-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Güncelleniyor...' : 'Kaydet'}
                        </button>
                    </div>
                </form>
                </div>
            </div>
    );
};

export default UpdatePropertyModal;
