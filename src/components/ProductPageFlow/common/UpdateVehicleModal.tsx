import React, { useState, useEffect, useCallback } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { useAuthStore } from '../../../store/useAuthStore';
import { fetchWithAuth } from '../../../services/fetchWithAuth';
import { API_ENDPOINTS, API_BASE_URL } from '../../../config/api';
import { VehicleUtilizationStyle, VehicleFuelType } from '../../../types/enums/vehicleEnums';
import { AccessoryType } from '../../../types/enums/accessoryEnums';

interface UpdateVehicleModalProps {
  vehicleId: string;
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

const utilizationStyleOptions = [
  { value: VehicleUtilizationStyle.AgriculturalMachineExcludingTractor, label: 'Tarım Makinesi' },
  { value: VehicleUtilizationStyle.ClosedBedPickup, label: 'Kapalı Kasa Kamyonet' },
  { value: VehicleUtilizationStyle.DumpTruck, label: 'Damperli Kamyon' },
  { value: VehicleUtilizationStyle.HeavyMachinery, label: 'İş Makinesi' },
  { value: VehicleUtilizationStyle.LargeBus, label: 'Otobüs (31\'den fazla yolculu)' },
  { value: VehicleUtilizationStyle.MediumBus, label: 'Otobüs (18-30 yolculu)' },
  { value: VehicleUtilizationStyle.Motorcycle, label: 'Motosiklet' },
  { value: VehicleUtilizationStyle.OpenBodyTruck, label: 'Açık Kasa Kamyon' },
  { value: VehicleUtilizationStyle.PickupTruck, label: 'Açık Kasa Kamyonet' },
  { value: VehicleUtilizationStyle.PrivateCar, label: 'Hususi Otomobil' },
  { value: VehicleUtilizationStyle.PrivateMinibus, label: 'Özel Minibüs' },
  { value: VehicleUtilizationStyle.RouteMinibus, label: 'Hatlı Minibüs' },
  { value: VehicleUtilizationStyle.Tanker, label: 'Tanker' },
  { value: VehicleUtilizationStyle.Taxi, label: 'Taksi' },
  { value: VehicleUtilizationStyle.TowTruck, label: 'Çekici' },
  { value: VehicleUtilizationStyle.Trailer, label: 'Römork' },
  { value: VehicleUtilizationStyle.Tractor, label: 'Traktör' },
  { value: VehicleUtilizationStyle.Truck, label: 'Kapalı Kasa Kamyon' },
].sort((a, b) => a.label.localeCompare(b.label, 'tr'));

// Utilization style string'den enum sayısına çeviren fonksiyon
function utilizationStyleStringToNumber(str: string | undefined): string {
  if (!str) return '1';
  const map: Record<string, number> = {
    UNKNOWN: 0,
    PRIVATE_CAR: 1,
    TAXI: 2,
    ROUTE_BASED_MINIBUS: 3,
    MEDIUM_BUS: 4,
    LARGE_BUS: 5,
    PICKUP_TRUCK: 6,
    CLOSED_BED_PICKUP: 7,
    TRUCK: 8,
    CONSTRUCTION_MACHINERY: 9,
    TRACTOR: 10,
    TRAILER: 11,
    MOTORCYCLE: 12,
    TANKER: 13,
    TOW_TRUCK: 14,
    MOTORIZED_CARAVAN: 15,
    TOWABLE_CARAVAN: 16,
    AGRICULTURAL_MACHINE_EXCLUDING_TRACTOR: 17,
    OPEN_BODY_TRUCK: 18,
    RENTAL_CAR: 19,
    ARMORED_VEHICLE: 20,
    MINIBUS_SHARED_TAXI: 21,
    JEEP: 22,
    JEEP_SAV: 23,
    JEEP_SUV: 24,
    JEEP_RENTAL: 25,
    JEEP_TAXI: 26,
    AMBULANCE: 27,
    FIREFIGHTER_CAR: 28,
    HEARSE: 29,
    CHAUFFEURED_RENTAL_CAR: 30,
    OPERATIONAL_RENTAL: 31,
    PRIVATE_MINIBUS: 32,
    ROUTE_MINIBUS: 33,
    SERVICE_MINIBUS: 34,
    COMPANY_MINIBUS: 35,
    RENTAL_MINIBUS: 36,
    AMBULANCE_MINIBUS: 37,
    MINIBUS_BROADCASTING_VEHICLE: 38,
    MINIBUS_ARMORED_TRANSPORT: 39,
    SMALL_BUS_1535_PASSENGERS: 40,
    SMALL_BUS_SERVICE: 41,
    SMALL_BUS_CITY: 42,
    SMALL_BUS_ROUTE: 43,
    LARGE_BUS_36_PLUS: 44,
    DUMP_TRUCK: 45,
    REFRIGERATED_TRUCK: 46,
    TRUCK_WITH_CONCRETE_MIXER: 47,
    SILO_TRUCK: 48,
    TRUCK_WITH_CONCRETE_PUMP: 49,
    ROCK_TRUCK: 50,
    TRUCK_WITH_CRANE: 51,
    HEAVY_MACHINERY: 52,
    EXCAVATOR: 53,
    LOADER: 54,
    BULLDOZER: 55,
    SCRAPER: 56,
    GRADER: 57,
    ROAD_ROLLER: 58,
    MOBILE_CRANE: 59,
    INDOOR_FORKLIFT: 60,
    OUTDOOR_FORKLIFT: 61,
    MOBILE_COMPRESSOR: 62,
    MOBILE_PUMP: 63,
    MOBILE_WELDING_MACHINE: 64,
    COMBINE_HARVESTER: 65,
    TANKER_ACID_CARRIER: 66,
    TANKER_WATER_FUEL_CARRIER: 67,
    TANKER_EXPLOSIVE_FLAMMABLE: 68,
    TOW_TRUCK_TRACTOR: 69,
    TOW_TRUCK_TANKER: 70,
    PANEL_GLASS_VAN_MINUBUS: 71,
  };
  return map[str] !== undefined ? map[str].toString() : '1';
}

// API'den gelen accessories'i formData'ya uygun şekilde dönüştür
function mapAccessoriesToForm(accessories: any[] | undefined) {
  const mapped = {
    sound: { value: '', description: '' },
    screen: { value: '', description: '' },
    other: { value: '', description: '' },
  };
  if (Array.isArray(accessories)) {
    accessories.forEach(acc => {
      if (acc.$type === 'audio') mapped.sound.value = acc.price?.toString() || '';
      if (acc.$type === 'display') mapped.screen.value = acc.price?.toString() || '';
      if (acc.$type === 'other') mapped.other.value = acc.price?.toString() || '';
    });
  }
  return mapped;
}

const UpdateVehicleModal: React.FC<UpdateVehicleModalProps> = ({ vehicleId, onClose, onSuccess }) => {
  const { accessToken, customerId } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState<any>(null);
  const [vehicleBrands, setVehicleBrands] = useState<Array<{ value: string; text: string }>>([]);
  const [vehicleModels, setVehicleModels] = useState<Array<{ value: string; text: string }>>([]);
  const [plateCities, setPlateCities] = useState<Array<{ value: string; label: string }>>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [financialInstitutions, setFinancialInstitutions] = useState<FinancialInstitution[]>([]);
  const [bankBranches, setBankBranches] = useState<BankBranch[]>([]);
  
  const [showAccessories, setShowAccessories] = useState(false);
  const [activeAccessoryType, setActiveAccessoryType] = useState<AccessoryType>(AccessoryType.Sound);
  const [showKaskoOldPolicy, setShowKaskoOldPolicy] = useState(false);
  const [showTrafikOldPolicy, setShowTrafikOldPolicy] = useState(false);

  const [formData, setFormData] = useState({
    plateCity: '',
    plateCode: '',
    documentSerialCode: '',
    documentSerialNumber: '',
    brand: '',
    brandCode: '',
    modelType: '',
    modelTypeCode: '',
    modelYear: new Date().getFullYear().toString(),
    usageType: '1',
    fuelType: '2',
    engineNo: '',
    chassisNo: '',
    registrationDate: '',
    seatCount: '5',
    accessories: {
      sound: { value: '', description: '' },
      screen: { value: '', description: '' },
      other: { value: '', description: '' },
    },
    kaskoOldPolicyNo: '',
    kaskoOldPolicyRenewalNo: '',
    kaskoOldPolicyInsuranceCompanyNo: '',
    kaskoOldPolicyAgencyNo: '',
    kaskoOldPolicyEndDate: '',
    trafikOldPolicyNo: '',
    trafikOldPolicyRenewalNo: '',
    trafikOldPolicyInsuranceCompanyNo: '',
    trafikOldPolicyAgencyNo: '',
    trafikOldPolicyEndDate: '',
    dainMurtehin: 'none' as 'none' | 'bank' | 'finance',
    dainMurtehinBankId: '',
    dainMurtehinBankName: '',
    dainMurtehinBranchId: '',
    dainMurtehinBranchName: '',
    dainMurtehinFinancialId: '',
    dainMurtehinFinancialName: '',
  });

  const [errors, setErrors] = useState({
    plateCity: '',
    plateCode: '',
    brandCode: '',
    modelTypeCode: '',
    engineNo: '',
    chassisNo: '',
    documentSerialCode: '',
    documentSerialNumber: '',
    registrationDate: '',
    seatCount: '',
    dainMurtehinBankId: '',
    dainMurtehinBranchId: '',
    dainMurtehinFinancialId: '',
    modelYear: '',
    kaskoOldPolicyNo: '',
    kaskoOldPolicyRenewalNo: '',
    kaskoOldPolicyInsuranceCompanyNo: '',
    kaskoOldPolicyAgencyNo: '',
    kaskoOldPolicyEndDate: '',
    trafikOldPolicyNo: '',
    trafikOldPolicyRenewalNo: '',
    trafikOldPolicyInsuranceCompanyNo: '',
    trafikOldPolicyAgencyNo: '',
    trafikOldPolicyEndDate: '',
  });

  // Araç bilgilerini yükle
  useEffect(() => {
    const fetchVehicleData = async () => {
      if (!vehicleId || !accessToken || !customerId) return;

      try {
        setIsLoading(true);
        const response = await fetchWithAuth(`${API_BASE_URL}/api/customers/${customerId}/vehicles/${vehicleId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setVehicleData(data);

          // Form data'yı doldur
          setFormData({
            plateCity: data.plate?.city?.toString() || '',
            plateCode: data.plate?.code || '',
            documentSerialCode: data.documentSerial?.code || '',
            documentSerialNumber: data.documentSerial?.number || '',
            brand: data.model?.brand?.text || '',
            brandCode: data.model?.brand?.value || '',
            modelType: data.model?.type?.text || '',
            modelTypeCode: data.model?.type?.value || '',
            modelYear: data.model?.year?.toString() || new Date().getFullYear().toString(),
            usageType: utilizationStyleStringToNumber(data.utilizationStyle) || '1',
            fuelType: '2',
            engineNo: data.engineNumber || '',
            chassisNo: data.chassisNumber || '',
            registrationDate: data.registrationDate || '',
            seatCount: data.seatNumber?.toString() || '5',
            accessories: mapAccessoriesToForm(data.accessories || []),
            kaskoOldPolicyNo: data.kaskoOldPolicy?.insuranceCompanyPolicyNumber?.toString() || '',
            kaskoOldPolicyRenewalNo: data.kaskoOldPolicy?.insuranceCompanyRenewalNumber?.toString() || '',
            kaskoOldPolicyInsuranceCompanyNo: data.kaskoOldPolicy?.insuranceCompanyReference || '',
            kaskoOldPolicyAgencyNo: data.kaskoOldPolicy?.agentNumber?.toString() || '',
            kaskoOldPolicyEndDate: data.kaskoOldPolicy?.endDate || '',
            trafikOldPolicyNo: data.trafikOldPolicy?.insuranceCompanyPolicyNumber?.toString() || '',
            trafikOldPolicyRenewalNo: data.trafikOldPolicy?.insuranceCompanyRenewalNumber?.toString() || '',
            trafikOldPolicyInsuranceCompanyNo: data.trafikOldPolicy?.insuranceCompanyReference || '',
            trafikOldPolicyAgencyNo: data.trafikOldPolicy?.agentNumber?.toString() || '',
            trafikOldPolicyEndDate: data.trafikOldPolicy?.endDate || '',
            dainMurtehin: data.lossPayeeClause ? (data.lossPayeeClause.type === 'BANK' ? 'bank' : 'finance') : 'none',
            dainMurtehinBankId: data.lossPayeeClause?.bank?.id || '',
            dainMurtehinBankName: data.lossPayeeClause?.bank?.name || '',
            dainMurtehinBranchId: data.lossPayeeClause?.bankBranch?.id || '',
            dainMurtehinBranchName: data.lossPayeeClause?.bankBranch?.name || '',
            dainMurtehinFinancialId: data.lossPayeeClause?.financialInstitution?.id || '',
            dainMurtehinFinancialName: data.lossPayeeClause?.financialInstitution?.name || '',
          });

          // Eski poliçe bilgileri varsa açık göster
          if (data.kaskoOldPolicy?.insuranceCompanyPolicyNumber) {
            setShowKaskoOldPolicy(true);
          }
          if (data.trafikOldPolicy?.insuranceCompanyPolicyNumber) {
            setShowTrafikOldPolicy(true);
          }
        }
      } catch (error) {
        console.error('Araç bilgileri yüklenemedi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicleData();
  }, [vehicleId, accessToken, customerId]);

  // Plaka şehirlerini yükle
  useEffect(() => {
    const fetchPlateCities = async () => {
      try {
        const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_CITIES, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const formattedCities = data
            .filter((city: { value: string; text: string }) => city.value !== '89')
            .sort((a: { value: string }, b: { value: string }) => parseInt(a.value) - parseInt(b.value))
            .map((city: { value: string; text: string }) => ({
              value: city.value,
              label: `${city.value} - ${city.text}`,
            }));
          setPlateCities(formattedCities);
        }
      } catch (error) {
        console.error('Plaka şehirleri yüklenemedi:', error);
      }
    };

    fetchPlateCities();
  }, [accessToken]);

  // Markaları yükle
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetchWithAuth(API_ENDPOINTS.VEHICLE_BRANDS, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setVehicleBrands(data);

          // Araç verisi yüklendiyse ve marka bilgisi varsa modelleri yükle
          if (vehicleData?.model?.brand?.value && vehicleData?.model?.year) {
            fetchModels(vehicleData.model.brand.value, vehicleData.model.year.toString());
          }
        }
      } catch (error) {
        console.error('Markalar yüklenemedi:', error);
      }
    };

    fetchBrands();
  }, [accessToken, vehicleData]);

  // Modelleri yükle
  const fetchModels = useCallback(
    async (brandCode: string, modelYear: string) => {
      try {
        setIsLoading(true);
        setVehicleModels([]);

        const response = await fetchWithAuth(
          API_ENDPOINTS.VEHICLE_MODELS(brandCode, modelYear),
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setVehicleModels(data);
        }
      } catch (error) {
        console.error('Modeller yüklenemedi:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [accessToken]
  );

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
          
          if (vehicleData?.lossPayeeClause?.bank?.id) {
            fetchBankBranches(vehicleData.lossPayeeClause.bank.id);
          }
        }
      } catch (error) {
        console.error('Bankalar yüklenemedi:', error);
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
        console.error('Finans kurumları yüklenemedi:', error);
      }
    };

    fetchBanks();
    fetchFinancialInstitutions();
  }, [accessToken, vehicleData]);

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
      console.error('Banka şubeleri yüklenemedi:', error);
    }
  };

  // Form input değişimini yönet
  const handleChange = (name: string, value: string) => {
    // Motor numarası için validasyon
    if (name === 'engineNo') {
      const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const truncatedValue = sanitizedValue.slice(0, 40);
      setFormData((prev) => ({ ...prev, [name]: truncatedValue }));

      if (truncatedValue.length === 0) {
        setErrors(prev => ({ ...prev, engineNo: 'Motor numarası boş geçilemez' }));
      } else if (truncatedValue.length < 6) {
        setErrors(prev => ({ ...prev, engineNo: 'Motor numarası en az 6 karakter olmalıdır' }));
      } else {
        setErrors(prev => ({ ...prev, engineNo: '' }));
      }
      return;
    }

    // Şasi numarası için validasyon
    if (name === 'chassisNo') {
      const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const truncatedValue = sanitizedValue.slice(0, 17);
      setFormData((prev) => ({ ...prev, [name]: truncatedValue }));

      if (truncatedValue.length === 0) {
        setErrors(prev => ({ ...prev, chassisNo: 'Şasi numarası boş geçilemez' }));
      } else if (truncatedValue.length < 17) {
        setErrors(prev => ({ ...prev, chassisNo: 'Şasi numarası 17 karakter olmalıdır' }));
      } else {
        setErrors(prev => ({ ...prev, chassisNo: '' }));
      }
      return;
    }

    // Plaka kodu için özel doğrulama
    if (name === 'plateCode') {
      const sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase();
      const truncatedValue = sanitizedValue.slice(0, 6);
      setFormData((prev) => ({ ...prev, [name]: truncatedValue }));
      
      if (truncatedValue.length > 0) {
        setErrors(prev => ({ ...prev, plateCode: '' }));
      }
      return;
    }

    // Belge seri kodu için validasyon
    if (name === 'documentSerialCode') {
      const sanitizedValue = value.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
      if (sanitizedValue.length === 0) {
        setErrors(prev => ({ ...prev, documentSerialCode: 'Belge seri kodu zorunludur' }));
      } else if (sanitizedValue.length < 2) {
        setErrors(prev => ({ ...prev, documentSerialCode: 'Belge seri kodu 2 harf olmalıdır' }));
      } else {
        setErrors(prev => ({ ...prev, documentSerialCode: '' }));
      }
      return;
    }

    // Belge seri no için validasyon
    if (name === 'documentSerialNumber') {
      const sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 6);
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
      if (sanitizedValue.length === 0) {
        setErrors(prev => ({ ...prev, documentSerialNumber: 'Belge seri no zorunludur' }));
      } else if (sanitizedValue.length < 6) {
        setErrors(prev => ({ ...prev, documentSerialNumber: 'Belge seri no 6 hane olmalıdır' }));
      } else {
        setErrors(prev => ({ ...prev, documentSerialNumber: '' }));
      }
      return;
    }

    // Koltuk sayısı validasyonu
    if (name === 'seatCount') {
      const sanitizedValue = value.replace(/[^0-9]/g, '');
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
      const seatNum = Number(sanitizedValue);
      if (sanitizedValue.length === 0) {
        setErrors(prev => ({ ...prev, seatCount: 'Koltuk adedi zorunludur' }));
      } else if (seatNum < 1 || seatNum > 100) {
        setErrors(prev => ({ ...prev, seatCount: 'Koltuk adedi 1 ile 100 arasında olmalıdır' }));
      } else {
        setErrors(prev => ({ ...prev, seatCount: '' }));
      }
      return;
    }

    // Eski poliçe bilgileri validasyonu
    if ([
      'kaskoOldPolicyNo', 'kaskoOldPolicyRenewalNo', 'kaskoOldPolicyInsuranceCompanyNo', 'kaskoOldPolicyAgencyNo',
      'trafikOldPolicyNo', 'trafikOldPolicyRenewalNo', 'trafikOldPolicyInsuranceCompanyNo', 'trafikOldPolicyAgencyNo',
    ].includes(name)) {
      const sanitizedValue = value.replace(/[^0-9]/g, '');
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
      let errorMsg = '';
      if ((name === 'kaskoOldPolicyNo' || name === 'trafikOldPolicyNo') && sanitizedValue.length > 0) {
        if (sanitizedValue.length < 12 || sanitizedValue.length > 16) {
          errorMsg = 'Eski Poliçe No 12 ile 16 hane arasında olmalıdır.';
        }
      }
      if ((name === 'kaskoOldPolicyRenewalNo' || name === 'trafikOldPolicyRenewalNo') && sanitizedValue.length > 0) {
        if (sanitizedValue.length !== 1) {
          errorMsg = 'Yenileme numarası yalnızca 1 haneli bir sayı olmalıdır (0, 1, 2 gibi).';
        }
      }
      if ((name === 'kaskoOldPolicyInsuranceCompanyNo' || name === 'trafikOldPolicyInsuranceCompanyNo') && sanitizedValue.length > 0) {
        if (sanitizedValue.length < 1 || sanitizedValue.length > 3) {
          errorMsg = 'Sigorta şirketi numarası 1 ile 3 hane arasında olmalıdır.';
        }
      }
      if ((name === 'kaskoOldPolicyAgencyNo' || name === 'trafikOldPolicyAgencyNo') && sanitizedValue.length > 0) {
        if (sanitizedValue.length < 5 || sanitizedValue.length > 11) {
          errorMsg = 'Acente numarası 5 ile 11 hane arasında olmalıdır.';
        }
      }
      setErrors(prev => ({ ...prev, [name]: errorMsg }));
      return;
    }

    // Eski Poliçe Bitiş Tarihleri
    if (name === 'kaskoOldPolicyEndDate' || name === 'trafikOldPolicyEndDate') {
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    // Diğer alanlar
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (value && value.trim() !== '') {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Marka değiştiğinde modelleri yükle
    if (name === 'brandCode') {
      const selectedBrand = vehicleBrands.find((brand) => brand.value === value);
      setFormData((prev) => ({
        ...prev,
        brandCode: value,
        brand: selectedBrand?.text || '',
      }));

      if (value && formData.modelYear) {
        fetchModels(value, formData.modelYear);
      }
    } else if (name === 'modelTypeCode') {
      const selectedModel = vehicleModels.find((model) => model.value === value);
      setFormData((prev) => ({
        ...prev,
        modelTypeCode: value,
        modelType: selectedModel?.text || '',
      }));
    } else if (name === 'modelYear') {
      if (formData.brandCode && value) {
        fetchModels(formData.brandCode, value);
      }
    }
  };

  const handleAccessoryChange = (type: AccessoryType, field: string, value: string) => {
    if (field === 'value') {
      const sanitizedValue = value.replace(/[^0-9]/g, '');
      setFormData((prev) => ({
        ...prev,
        accessories: {
          ...prev.accessories,
          [type]: {
            ...prev.accessories[type],
            [field]: sanitizedValue,
          },
        },
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      accessories: {
        ...prev.accessories,
        [type]: {
          ...prev.accessories[type],
          [field]: value,
        },
      },
    }));
  };

  const handleBankChange = async (bankId: string) => {
    // Boş string kontrolü
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
    
    // Şubeleri yükle
    await fetchBankBranches(bankId);
  };

  const handleBranchChange = (branchId: string) => {
    // Boş string kontrolü
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

  const handleFinancialInstitutionChange = (financialId: string) => {
    // Boş string kontrolü
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    // Validasyonlar
    if (!formData.plateCity) {
      setErrors(prev => ({ ...prev, plateCity: 'Plaka il kodu zorunludur' }));
      hasError = true;
    }

    // Plakalı araç kontrolü
    const isPlated = vehicleData?.plate?.code && vehicleData.plate.code.trim();
    if (isPlated && !formData.plateCode) {
      setErrors(prev => ({ ...prev, plateCode: 'Plaka alanı zorunludur' }));
      hasError = true;
    }

    if (!formData.brandCode) {
      setErrors(prev => ({ ...prev, brandCode: 'Marka seçimi zorunludur' }));
      hasError = true;
    }

    if (!formData.modelTypeCode) {
      setErrors(prev => ({ ...prev, modelTypeCode: 'Model seçimi zorunludur' }));
      hasError = true;
    }

    if (!formData.modelYear) {
      setErrors(prev => ({ ...prev, modelYear: 'Model yılı zorunludur' }));
      hasError = true;
    }

    if (!formData.engineNo) {
      setErrors(prev => ({ ...prev, engineNo: 'Motor numarası boş geçilemez' }));
      hasError = true;
    } else if (formData.engineNo.length < 6) {
      setErrors(prev => ({ ...prev, engineNo: 'Motor numarası en az 6 karakter olmalıdır' }));
      hasError = true;
    }

    if (!formData.chassisNo) {
      setErrors(prev => ({ ...prev, chassisNo: 'Şasi numarası boş geçilemez' }));
      hasError = true;
    } else if (formData.chassisNo.length < 17) {
      setErrors(prev => ({ ...prev, chassisNo: 'Şasi numarası 17 karakter olmalıdır' }));
      hasError = true;
    }

    if (!formData.registrationDate) {
      setErrors(prev => ({ ...prev, registrationDate: 'Tescil tarihi zorunludur' }));
      hasError = true;
    }

    // Dain-i mürtehin doğrulama
    if (formData.dainMurtehin !== 'none') {
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
    }

    // Plakalı araç için belge seri validasyonu
    if (isPlated) {
      if (!formData.documentSerialCode) {
        setErrors(prev => ({ ...prev, documentSerialCode: 'Belge seri kodu zorunludur' }));
        hasError = true;
      } else if (formData.documentSerialCode.length < 2) {
        setErrors(prev => ({ ...prev, documentSerialCode: 'Belge seri kodu 2 harf olmalıdır' }));
        hasError = true;
      }

      if (!formData.documentSerialNumber) {
        setErrors(prev => ({ ...prev, documentSerialNumber: 'Belge seri no zorunludur' }));
        hasError = true;
      } else if (formData.documentSerialNumber.length < 6) {
        setErrors(prev => ({ ...prev, documentSerialNumber: 'Belge seri no 6 hane olmalıdır' }));
        hasError = true;
      }
    }

    if (!formData.seatCount) {
      setErrors(prev => ({ ...prev, seatCount: 'Koltuk adedi zorunludur' }));
      hasError = true;
    } else if (Number(formData.seatCount) < 1 || Number(formData.seatCount) > 100) {
      setErrors(prev => ({ ...prev, seatCount: 'Koltuk adedi 1 ile 100 arasında olmalıdır' }));
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setIsLoading(true);

      const plateCityValue = formData.plateCity ? Number(formData.plateCity.split(' - ')[0]) : 0;
      
      if (plateCityValue < 0 || plateCityValue > 255) {
        alert('Geçersiz plaka il kodu. Lütfen geçerli bir il kodu seçiniz.');
        return;
      }

      const updateData = {
        vehicleId: vehicleId,
        customerId: customerId,
        plate: {
          city: plateCityValue,
          code: isPlated ? formData.plateCode : '',
        },
        modelYear: parseInt(formData.modelYear) || new Date().getFullYear(),
        brandReference: formData.brandCode,
        modelTypeReference: formData.modelTypeCode,
        utilizationStyle: parseInt(formData.usageType) || 1,
        fuel: {
          type: parseInt(formData.fuelType) || 2,
          customLpg: false,
          customLpgPrice: null,
        },
        engine: formData.engineNo || '',
        chassis: formData.chassisNo || '',
        documentSerial: isPlated && formData.documentSerialCode && formData.documentSerialNumber ? {
          code: formData.documentSerialCode,
          number: formData.documentSerialNumber,
        } : null,
        registrationDate: formData.registrationDate || new Date().toISOString().split('T')[0],
        seatNumber: parseInt(formData.seatCount) || 5,
        accessories: [] as Array<{ $type: string; price: number }>,
        kaskoOldPolicy: formData.kaskoOldPolicyNo ? {
          insuranceCompanyPolicyNumber: parseInt(formData.kaskoOldPolicyNo),
          insuranceCompanyRenewalNumber: formData.kaskoOldPolicyRenewalNo ? parseInt(formData.kaskoOldPolicyRenewalNo) : 0,
          insuranceCompanyReference: formData.kaskoOldPolicyInsuranceCompanyNo || '',
          agentNumber: formData.kaskoOldPolicyAgencyNo ? parseInt(formData.kaskoOldPolicyAgencyNo) : 0,
          endDate: formData.kaskoOldPolicyEndDate || null
        } : null,
        trafikOldPolicy: formData.trafikOldPolicyNo ? {
          insuranceCompanyPolicyNumber: parseInt(formData.trafikOldPolicyNo),
          insuranceCompanyRenewalNumber: formData.trafikOldPolicyRenewalNo ? parseInt(formData.trafikOldPolicyRenewalNo) : 0,
          insuranceCompanyReference: formData.trafikOldPolicyInsuranceCompanyNo || '',
          agentNumber: formData.trafikOldPolicyAgencyNo ? parseInt(formData.trafikOldPolicyAgencyNo) : 0,
          endDate: formData.trafikOldPolicyEndDate || null
        } : null,
        lossPayeeClause: formData.dainMurtehin !== 'none' ? {
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
        } : null,
      };

      // Aksesuarları ekle
      if (formData.accessories.sound.value) {
        updateData.accessories.push({ $type: 'audio', price: parseInt(formData.accessories.sound.value) });
      }
      if (formData.accessories.screen.value) {
        updateData.accessories.push({ $type: 'display', price: parseInt(formData.accessories.screen.value) });
      }
      if (formData.accessories.other.value) {
        updateData.accessories.push({ $type: 'other', price: parseInt(formData.accessories.other.value) });
      }

      const response = await fetchWithAuth(`${API_BASE_URL}/api/customers/${customerId}/vehicles/${vehicleId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorText = await response.text();
        alert(`Güncelleme sırasında bir hata oluştu: ${errorText}`);
      }
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      alert('Güncelleme yapılırken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!vehicleData) {
    return (
      <div className="update-vehicle-modal-overlay">
        <div className="update-vehicle-modal-container">
          <div className="update-vehicle-modal-loading">
            <div className="pp-spinner"></div>
            <p>Araç bilgileri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  const sortedBrandOptions = [
    { value: '', label: 'Seçiniz' },
    ...vehicleBrands
      .filter(brand => brand.text !== 'İŞ MAKİNASI' && brand.text !== 'DİĞER')
      .sort((a, b) => a.text.localeCompare(b.text, 'tr'))
      .map((brand) => ({
        value: brand.value,
        label: brand.text,
      })),
  ];

  const isPlated = vehicleData?.plate?.code && vehicleData.plate.code.trim();

  return (
    <div className="update-vehicle-modal-overlay" onClick={onClose}>
      <div className="update-vehicle-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="update-vehicle-modal-header">
          <h2 className="update-vehicle-modal-title">Araç Bilgilerini Güncelle</h2>
          <button className="update-vehicle-modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="update-vehicle-modal-content">
          {/* Plaka Bilgileri */}
          <div className="update-vehicle-form-row">
            <div className="update-vehicle-form-group">
              <label className="update-vehicle-label">Plaka İl Kodu *</label>
              <div className="update-vehicle-dropdown">
                <Dropdown
                  value={formData.plateCity}
                  options={plateCities}
                  onChange={(e) => handleChange('plateCity', e.value)}
                  placeholder="Seçiniz"
                  filter
                  filterPlaceholder="Ara..."
                  emptyFilterMessage="Sonuç bulunamadı"
                  appendTo="self"
                  panelClassName="update-vehicle-dropdown-panel"
                />
              </div>
              {errors.plateCity && <p className="update-vehicle-error">{errors.plateCity}</p>}
            </div>

            {isPlated && (
              <div className="update-vehicle-form-group">
                <label className="update-vehicle-label">Plaka *</label>
                <input
                  type="text"
                  className="update-vehicle-input"
                  value={formData.plateCode}
                  onChange={(e) => handleChange('plateCode', e.target.value)}
                  maxLength={6}
                />
                {errors.plateCode && <p className="update-vehicle-error">{errors.plateCode}</p>}
              </div>
            )}
          </div>

          {/* Marka - Model - Yıl */}
          <div className="update-vehicle-form-row">
            <div className="update-vehicle-form-group">
              <label className="update-vehicle-label">Marka *</label>
              <div className="update-vehicle-dropdown">
                <Dropdown
                  value={formData.brandCode}
                  options={sortedBrandOptions}
                  onChange={(e) => handleChange('brandCode', e.value)}
                  placeholder="Seçiniz"
                  filter
                  filterPlaceholder="Ara..."
                  emptyFilterMessage="Sonuç bulunamadı"
                  appendTo="self"
                  panelClassName="update-vehicle-dropdown-panel"
                />
              </div>
              {errors.brandCode && <p className="update-vehicle-error">{errors.brandCode}</p>}
            </div>

            <div className="update-vehicle-form-group">
              <label className="update-vehicle-label">Model Yılı *</label>
              <input
                type="number"
                className="update-vehicle-input"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={formData.modelYear}
                onChange={(e) => handleChange('modelYear', e.target.value)}
              />
              {errors.modelYear && <p className="update-vehicle-error">{errors.modelYear}</p>}
            </div>

            <div className="update-vehicle-form-group">
              <label className="update-vehicle-label">Model Tipi *</label>
              <div className="update-vehicle-dropdown">
                <Dropdown
                  value={formData.modelTypeCode}
                  options={[
                    { value: '', label: 'Seçiniz' },
                    ...vehicleModels.map((model) => ({
                      value: model.value,
                      label: model.text,
                    })),
                  ]}
                  onChange={(e) => handleChange('modelTypeCode', e.value)}
                  placeholder="Seçiniz"
                  filter
                  filterPlaceholder="Ara..."
                  emptyFilterMessage="Sonuç bulunamadı"
                  disabled={!formData.brandCode || !formData.modelYear || vehicleModels.length === 0}
                  appendTo="self"
                  panelClassName="update-vehicle-dropdown-panel"
                />
              </div>
              {errors.modelTypeCode && <p className="update-vehicle-error">{errors.modelTypeCode}</p>}
            </div>
          </div>

          <div className="update-vehicle-form-row">
            <div className="update-vehicle-form-group">
              <label className="update-vehicle-label">Kullanım Şekli *</label>
              <div className="update-vehicle-dropdown">
                <Dropdown
                  value={formData.usageType}
                  options={utilizationStyleOptions.map((option) => ({
                    value: option.value.toString(),
                    label: option.label,
                  }))}
                  onChange={(e) => handleChange('usageType', e.value)}
                  placeholder="Seçiniz"
                  filter
                  filterPlaceholder="Ara..."
                  emptyFilterMessage="Sonuç bulunamadı"
                  appendTo="self"
                  panelClassName="update-vehicle-dropdown-panel"
                />
              </div>
            </div>

            <div className="update-vehicle-form-group">
              <label className="update-vehicle-label">Yakıt Türü *</label>
              <div className="update-vehicle-dropdown">
                <Dropdown
                  value={formData.fuelType}
                  options={[
                    { value: '', label: 'Seçiniz' },
                    { value: VehicleFuelType.Gasoline.toString(), label: 'Benzin' },
                    { value: VehicleFuelType.Diesel.toString(), label: 'Dizel' },
                    { value: VehicleFuelType.Lpg.toString(), label: 'LPG' },
                    { value: VehicleFuelType.Electric.toString(), label: 'Elektrik' },
                    { value: VehicleFuelType.LpgGasoline.toString(), label: 'LPG + Benzin' },
                  ]}
                  onChange={(e) => handleChange('fuelType', e.value)}
                  placeholder="Seçiniz"
                  appendTo="self"
                  panelClassName="update-vehicle-dropdown-panel"
                />
              </div>
            </div>

            <div className="update-vehicle-form-group">
              <label className="update-vehicle-label">Koltuk Adedi *</label>
              <input
                type="number"
                className="update-vehicle-input"
                value={formData.seatCount}
                onChange={(e) => handleChange('seatCount', e.target.value)}
              />
              {errors.seatCount && <p className="update-vehicle-error">{errors.seatCount}</p>}
            </div>
          </div>

          {/* Motor ve Şasi */}
          <div className="update-vehicle-form-row">
            <div className="update-vehicle-form-group">
              <label className="update-vehicle-label">Motor No *</label>
              <input
                type="text"
                className="update-vehicle-input"
                value={formData.engineNo}
                onChange={(e) => handleChange('engineNo', e.target.value)}
                maxLength={40}
                placeholder="En az 6, en fazla 40 karakter"
              />
              {errors.engineNo && <p className="update-vehicle-error">{errors.engineNo}</p>}
            </div>

            <div className="update-vehicle-form-group">
              <label className="update-vehicle-label">Şasi No *</label>
              <input
                type="text"
                className="update-vehicle-input"
                value={formData.chassisNo}
                onChange={(e) => handleChange('chassisNo', e.target.value)}
                maxLength={17}
                placeholder="17 karakter"
              />
              {errors.chassisNo && <p className="update-vehicle-error">{errors.chassisNo}</p>}
            </div>

            <div className="update-vehicle-form-group">
              <label className="update-vehicle-label">Tescil Tarihi *</label>
              <input
                type="date"
                className="update-vehicle-input"
                value={formData.registrationDate}
                onChange={(e) => handleChange('registrationDate', e.target.value)}
              />
              {errors.registrationDate && <p className="update-vehicle-error">{errors.registrationDate}</p>}
            </div>
          </div>

          {/* Belge Seri - Sadece plakalı araçlar için */}
          {isPlated && (
            <div className="update-vehicle-form-row">
              <div className="update-vehicle-form-group">
                <label className="update-vehicle-label">Belge Seri Kodu *</label>
                <input
                  type="text"
                  className="update-vehicle-input"
                  value={formData.documentSerialCode}
                  onChange={(e) => handleChange('documentSerialCode', e.target.value)}
                  placeholder="Örn: AA"
                  maxLength={2}
                />
                {errors.documentSerialCode && <p className="update-vehicle-error">{errors.documentSerialCode}</p>}
              </div>

              <div className="update-vehicle-form-group">
                <label className="update-vehicle-label">Belge Seri No *</label>
                <input
                  type="text"
                  className="update-vehicle-input"
                  value={formData.documentSerialNumber}
                  onChange={(e) => handleChange('documentSerialNumber', e.target.value)}
                  placeholder="Örn: 123456"
                  maxLength={6}
                />
                {errors.documentSerialNumber && <p className="update-vehicle-error">{errors.documentSerialNumber}</p>}
              </div>
            </div>
          )}

          {/* Aksesuarlar - Accordion */}
          <div className="update-vehicle-accordion">
            <button
              type="button"
              className="update-vehicle-accordion-header"
              onClick={() => setShowAccessories(!showAccessories)}
            >
              <span>Aksesuarlar</span>
              <span className="update-vehicle-accordion-badge">
                {Object.values(formData.accessories).filter((a) => a.value).length || 0}
              </span>
              <svg
                className={`update-vehicle-accordion-icon ${showAccessories ? 'open' : ''}`}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {showAccessories && (
              <div className="update-vehicle-accordion-content">
                <div className="update-vehicle-accessory-tabs">
                  <button
                    type="button"
                    className={`update-vehicle-accessory-tab ${activeAccessoryType === AccessoryType.Sound ? 'active' : ''}`}
                    onClick={() => setActiveAccessoryType(AccessoryType.Sound)}
                  >
                    Ses
                  </button>
                  <button
                    type="button"
                    className={`update-vehicle-accessory-tab ${activeAccessoryType === AccessoryType.Screen ? 'active' : ''}`}
                    onClick={() => setActiveAccessoryType(AccessoryType.Screen)}
                  >
                    Ekran
                  </button>
                  <button
                    type="button"
                    className={`update-vehicle-accessory-tab ${activeAccessoryType === AccessoryType.Other ? 'active' : ''}`}
                    onClick={() => setActiveAccessoryType(AccessoryType.Other)}
                  >
                    Diğer
                  </button>
                </div>

                <div className="update-vehicle-accessory-content">
                  {activeAccessoryType === AccessoryType.Sound && (
                    <div className="update-vehicle-form-group">
                      <label className="update-vehicle-label">Ses Bedeli</label>
                      <input
                        type="text"
                        className="update-vehicle-input"
                        value={formData.accessories.sound.value}
                        onChange={(e) => handleAccessoryChange(AccessoryType.Sound, 'value', e.target.value)}
                        placeholder="Bedel"
                      />
                    </div>
                  )}

                  {activeAccessoryType === AccessoryType.Screen && (
                    <div className="update-vehicle-form-group">
                      <label className="update-vehicle-label">Ekran Bedeli</label>
                      <input
                        type="text"
                        className="update-vehicle-input"
                        value={formData.accessories.screen.value}
                        onChange={(e) => handleAccessoryChange(AccessoryType.Screen, 'value', e.target.value)}
                        placeholder="Bedel"
                      />
                    </div>
                  )}

                  {activeAccessoryType === AccessoryType.Other && (
                    <div className="update-vehicle-form-group">
                      <label className="update-vehicle-label">Diğer Bedeli</label>
                      <input
                        type="text"
                        className="update-vehicle-input"
                        value={formData.accessories.other.value}
                        onChange={(e) => handleAccessoryChange(AccessoryType.Other, 'value', e.target.value)}
                        placeholder="Bedel"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Kasko Eski Poliçe - Accordion */}
          <div className="update-vehicle-accordion">
            <button
              type="button"
              className="update-vehicle-accordion-header"
              onClick={() => setShowKaskoOldPolicy(!showKaskoOldPolicy)}
            >
              <span>Kasko Eski Poliçe Bilgileri</span>
              <svg
                className={`update-vehicle-accordion-icon ${showKaskoOldPolicy ? 'open' : ''}`}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {showKaskoOldPolicy && (
              <div className="update-vehicle-accordion-content">
                <div className="update-vehicle-form-row">
                  <div className="update-vehicle-form-group">
                    <label className="update-vehicle-label">Kasko Eski Poliçe No</label>
                    <input
                      type="text"
                      className="update-vehicle-input"
                      value={formData.kaskoOldPolicyNo}
                      onChange={(e) => handleChange('kaskoOldPolicyNo', e.target.value)}
                    />
                    {errors.kaskoOldPolicyNo && <p className="update-vehicle-error">{errors.kaskoOldPolicyNo}</p>}
                  </div>

                  <div className="update-vehicle-form-group">
                    <label className="update-vehicle-label">Kasko Yenileme Numarası</label>
                    <input
                      type="text"
                      className="update-vehicle-input"
                      value={formData.kaskoOldPolicyRenewalNo}
                      onChange={(e) => handleChange('kaskoOldPolicyRenewalNo', e.target.value)}
                    />
                    {errors.kaskoOldPolicyRenewalNo && <p className="update-vehicle-error">{errors.kaskoOldPolicyRenewalNo}</p>}
                  </div>
                </div>

                <div className="update-vehicle-form-row">
                  <div className="update-vehicle-form-group">
                    <label className="update-vehicle-label">Kasko Sigorta Şirketi No</label>
                    <input
                      type="text"
                      className="update-vehicle-input"
                      value={formData.kaskoOldPolicyInsuranceCompanyNo}
                      onChange={(e) => handleChange('kaskoOldPolicyInsuranceCompanyNo', e.target.value)}
                    />
                    {errors.kaskoOldPolicyInsuranceCompanyNo && <p className="update-vehicle-error">{errors.kaskoOldPolicyInsuranceCompanyNo}</p>}
                  </div>

                  <div className="update-vehicle-form-group">
                    <label className="update-vehicle-label">Kasko Acenta No</label>
                    <input
                      type="text"
                      className="update-vehicle-input"
                      value={formData.kaskoOldPolicyAgencyNo}
                      onChange={(e) => handleChange('kaskoOldPolicyAgencyNo', e.target.value)}
                    />
                    {errors.kaskoOldPolicyAgencyNo && <p className="update-vehicle-error">{errors.kaskoOldPolicyAgencyNo}</p>}
                  </div>
                </div>

                <div className="update-vehicle-form-row">
                  <div className="update-vehicle-form-group">
                    <label className="update-vehicle-label">Kasko Poliçe Bitiş Tarihi</label>
                    <input
                      type="date"
                      className="update-vehicle-input"
                      value={formData.kaskoOldPolicyEndDate}
                      onChange={(e) => handleChange('kaskoOldPolicyEndDate', e.target.value)}
                    />
                    {errors.kaskoOldPolicyEndDate && <p className="update-vehicle-error">{errors.kaskoOldPolicyEndDate}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trafik Eski Poliçe - Accordion */}
          <div className="update-vehicle-accordion">
            <button
              type="button"
              className="update-vehicle-accordion-header"
              onClick={() => setShowTrafikOldPolicy(!showTrafikOldPolicy)}
            >
              <span>Trafik Eski Poliçe Bilgileri</span>
              <svg
                className={`update-vehicle-accordion-icon ${showTrafikOldPolicy ? 'open' : ''}`}
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {showTrafikOldPolicy && (
              <div className="update-vehicle-accordion-content">
                <div className="update-vehicle-form-row">
                  <div className="update-vehicle-form-group">
                    <label className="update-vehicle-label">Trafik Eski Poliçe No</label>
                    <input
                      type="text"
                      className="update-vehicle-input"
                      value={formData.trafikOldPolicyNo}
                      onChange={(e) => handleChange('trafikOldPolicyNo', e.target.value)}
                    />
                    {errors.trafikOldPolicyNo && <p className="update-vehicle-error">{errors.trafikOldPolicyNo}</p>}
                  </div>

                  <div className="update-vehicle-form-group">
                    <label className="update-vehicle-label">Trafik Yenileme Numarası</label>
                    <input
                      type="text"
                      className="update-vehicle-input"
                      value={formData.trafikOldPolicyRenewalNo}
                      onChange={(e) => handleChange('trafikOldPolicyRenewalNo', e.target.value)}
                    />
                    {errors.trafikOldPolicyRenewalNo && <p className="update-vehicle-error">{errors.trafikOldPolicyRenewalNo}</p>}
                  </div>
                </div>

                <div className="update-vehicle-form-row">
                  <div className="update-vehicle-form-group">
                    <label className="update-vehicle-label">Trafik Sigorta Şirketi No</label>
                    <input
                      type="text"
                      className="update-vehicle-input"
                      value={formData.trafikOldPolicyInsuranceCompanyNo}
                      onChange={(e) => handleChange('trafikOldPolicyInsuranceCompanyNo', e.target.value)}
                    />
                    {errors.trafikOldPolicyInsuranceCompanyNo && <p className="update-vehicle-error">{errors.trafikOldPolicyInsuranceCompanyNo}</p>}
                  </div>

                  <div className="update-vehicle-form-group">
                    <label className="update-vehicle-label">Trafik Acenta No</label>
                    <input
                      type="text"
                      className="update-vehicle-input"
                      value={formData.trafikOldPolicyAgencyNo}
                      onChange={(e) => handleChange('trafikOldPolicyAgencyNo', e.target.value)}
                    />
                    {errors.trafikOldPolicyAgencyNo && <p className="update-vehicle-error">{errors.trafikOldPolicyAgencyNo}</p>}
                  </div>
                </div>

                <div className="update-vehicle-form-row">
                  <div className="update-vehicle-form-group">
                    <label className="update-vehicle-label">Trafik Poliçe Bitiş Tarihi</label>
                    <input
                      type="date"
                      className="update-vehicle-input"
                      value={formData.trafikOldPolicyEndDate}
                      onChange={(e) => handleChange('trafikOldPolicyEndDate', e.target.value)}
                    />
                    {errors.trafikOldPolicyEndDate && <p className="update-vehicle-error">{errors.trafikOldPolicyEndDate}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dain-i Mürtehin */}
          <div className="update-vehicle-form-section">
            <h3 className="update-vehicle-section-title">Dain-i Mürtehin</h3>
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
                          appendTo="self"
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
                            appendTo="self"
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
                          appendTo="self"
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
              type="button"
              className="update-vehicle-button update-vehicle-button-secondary"
              onClick={onClose}
            >
              İptal
            </button>
            <button
              type="submit"
              className="update-vehicle-button update-vehicle-button-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateVehicleModal;

