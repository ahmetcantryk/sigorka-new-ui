import React, { useState, useEffect, useCallback } from 'react';
import CustomSelect from '../../common/Input/CustomSelect';
import Input from '../../common/Input/Input';
import { useAuthStore } from '../../../store/useAuthStore';
import { Vehicle } from '../../../types/interfaces/vehicle';
import { VehicleUtilizationStyle, VehicleFuelType } from '../../../types/enums/vehicleEnums';
import { AccessoryType } from '../../../types/enums/accessoryEnums';
import { fetchWithAuth } from '../../../services/fetchWithAuth';
import { API_ENDPOINTS, API_BASE_URL } from '../../../config/api';
import { MODEL_YEAR_OPTIONS } from '../../ProductPageFlow/KaskoFlow/config/kaskoConstants';


// VehicleType tipi
type VehicleType = 'plated' | 'unplated';

// FinancialInstitution tipi için interface ekle
interface FinancialInstitution {
  id: string;
  name: string;
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

interface AddVehicleModalProps {
  onClose: () => void;
  initialData?: {
    type: 'vehicle';
    details: Vehicle;
  };
  onSuccess: () => void;
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

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ onClose, initialData, onSuccess }) => {
  const { accessToken, customerId } = useAuthStore();

  // Marka ve model seçim verileri için state'ler
  const [vehicleBrands, setVehicleBrands] = useState<Array<{ value: string; text: string }>>([]);
  const [vehicleModels, setVehicleModels] = useState<Array<{ value: string; text: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [vehicleType, setVehicleType] = useState<VehicleType>(
    initialData?.details.plate.code ? 'plated' : 'unplated'
  );

  // initialData değiştiğinde vehicleType'ı güncelle
  useEffect(() => {
    if (initialData) {
      setVehicleType(initialData.details.plate.code ? 'plated' : 'unplated');
    }
  }, [initialData]);

  const [formData, setFormData] = useState({
    plateCity: initialData?.details.plate.city?.toString() || '',
    plateCode: initialData?.details.plate.code || '',
    documentSerialCode: initialData?.details.documentSerial?.code || '',
    documentSerialNumber: initialData?.details.documentSerial?.number || '',
    brand: initialData?.details.model.brand.text || '',
    brandCode: initialData?.details.model.brand.value || '',
    modelType: initialData?.details.model.type.text || '',
    modelTypeCode: initialData?.details.model.type.value || '',
    modelYear: initialData?.details.model.year?.toString() || new Date().getFullYear().toString(),
    usageType: utilizationStyleStringToNumber(initialData?.details.utilizationStyle) || '1',
    fuelType: '2', // Varsayılan olarak dizel
    engineNo: initialData?.details.engineNumber || '',
    chassisNo: initialData?.details.chassisNumber || '',
    registrationDate: initialData?.details.registrationDate || '',
    seatCount: initialData?.details.seatNumber?.toString() || '5',
    accessories: mapAccessoriesToForm((initialData?.details as any)?.accessories || []),
    // Kasko Eski Poliçe
    kaskoOldPolicyNo: (initialData?.details as any)?.kaskoOldPolicy?.insuranceCompanyPolicyNumber?.toString() || '',
    kaskoOldPolicyRenewalNo: (initialData?.details as any)?.kaskoOldPolicy?.insuranceCompanyRenewalNumber?.toString() || '',
    kaskoOldPolicyInsuranceCompanyNo: (initialData?.details as any)?.kaskoOldPolicy?.insuranceCompanyReference || '',
    kaskoOldPolicyAgencyNo: (initialData?.details as any)?.kaskoOldPolicy?.agentNumber?.toString() || '',
    kaskoOldPolicyEndDate: (initialData?.details as any)?.kaskoOldPolicy?.endDate || '',
    // Trafik Eski Poliçe
    trafikOldPolicyNo: (initialData?.details as any)?.trafikOldPolicy?.insuranceCompanyPolicyNumber?.toString() || '',
    trafikOldPolicyRenewalNo: (initialData?.details as any)?.trafikOldPolicy?.insuranceCompanyRenewalNumber?.toString() || '',
    trafikOldPolicyInsuranceCompanyNo: (initialData?.details as any)?.trafikOldPolicy?.insuranceCompanyReference || '',
    trafikOldPolicyAgencyNo: (initialData?.details as any)?.trafikOldPolicy?.agentNumber?.toString() || '',
    trafikOldPolicyEndDate: (initialData?.details as any)?.trafikOldPolicy?.endDate || '',
    dainMurtehin: initialData?.details.lossPayeeClause ? 
      (initialData.details.lossPayeeClause.type === 'BANK' ? 'bank' : 'finance') : 'none',
    dainMurtehinBankId: initialData?.details.lossPayeeClause?.bank?.id || '',
    dainMurtehinBankName: initialData?.details.lossPayeeClause?.bank?.name || '',
    dainMurtehinBranchId: initialData?.details.lossPayeeClause?.bankBranch?.id || '',
    dainMurtehinBranchName: initialData?.details.lossPayeeClause?.bankBranch?.name || '',
    dainMurtehinFinancialId: initialData?.details.lossPayeeClause?.financialInstitution?.id || '',
    dainMurtehinFinancialName: initialData?.details.lossPayeeClause?.financialInstitution?.name || '',
  });

  const [showAccessories, setShowAccessories] = useState(false);
  const [activeAccessoryType, setActiveAccessoryType] = useState<AccessoryType>(
    AccessoryType.Sound
  );
  
  // Eski poliçe bilgileri açılır-kapanır state'leri
  // Edit modda ve bilgiler doluysa başlangıçta açık olsun
  const [showKaskoOldPolicy, setShowKaskoOldPolicy] = useState(
    !!(initialData?.details as any)?.kaskoOldPolicy?.insuranceCompanyPolicyNumber
  );
  const [showTrafikOldPolicy, setShowTrafikOldPolicy] = useState(
    !!(initialData?.details as any)?.trafikOldPolicy?.insuranceCompanyPolicyNumber
  );

  const isEditMode = !!initialData;

  // Edit mode'da initial data'yı sakla
  const [initialFormData, setInitialFormData] = useState<any>(null);

  // Form verilerinin değişip değişmediğini kontrol et
  const hasFormChanged = () => {
    if (!isEditMode || !initialFormData) return true;
    
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  };

  const [plateCities, setPlateCities] = useState<Array<{ value: string; label: string }>>([]);

  const [banks, setBanks] = useState<Bank[]>([]);
  const [financialInstitutions, setFinancialInstitutions] = useState<FinancialInstitution[]>([]);
  const [bankBranches, setBankBranches] = useState<BankBranch[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [selectedFinancialId, setSelectedFinancialId] = useState<string>('');

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
    // Kasko Eski Poliçe
    kaskoOldPolicyNo: '',
    kaskoOldPolicyRenewalNo: '',
    kaskoOldPolicyInsuranceCompanyNo: '',
    kaskoOldPolicyAgencyNo: '',
    kaskoOldPolicyEndDate: '',
    // Trafik Eski Poliçe
    trafikOldPolicyNo: '',
    trafikOldPolicyRenewalNo: '',
    trafikOldPolicyInsuranceCompanyNo: '',
    trafikOldPolicyAgencyNo: '',
    trafikOldPolicyEndDate: '',
  });

  useEffect(() => {
    const fetchWithAuthPlateCities = async () => {
      try {
        const response = await fetchWithAuth(API_ENDPOINTS.ADDRESS_CITIES, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('İller yüklenirken hata oluştu');
        }

        const data = await response.json();
        // Kıbrıs'ı (89) filtrele ve value'ya göre sırala
        const formattedCities = data
          .filter((city: { value: string; text: string }) => city.value !== '89')
          .sort((a: { value: string }, b: { value: string }) => parseInt(a.value) - parseInt(b.value))
          .map((city: { value: string; text: string }) => ({
          value: city.value,
          label: `${city.value} - ${city.text}`,
        }));
        setPlateCities(formattedCities);
      } catch (error) {
      }
    };

    fetchWithAuthPlateCities();
  }, [accessToken]);

  // Edit mode için initial form data'sını set et
  useEffect(() => {
    if (isEditMode && formData && !initialFormData) {
      // Form data set olduktan sonra initial snapshot'ını al
      setTimeout(() => {
        setInitialFormData(JSON.parse(JSON.stringify(formData)));
      }, 100);
    }
  }, [formData, isEditMode, initialFormData]);

  // fetchWithAuthModels'i useEffect'e bağımlılık olarak ekleme
  useEffect(() => {
    const fetchWithAuthBrands = async () => {
      try {
        setIsLoading(true);
        const response = await fetchWithAuth(API_ENDPOINTS.VEHICLE_BRANDS, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setVehicleBrands(data);

          // Eğer initialData varsa ve marka bilgisi içeriyorsa
          if (initialData?.details.model.brand.value && initialData?.details.model.year) {
            // Model bilgilerini yükle
            fetchWithAuthModelsFunc(
              initialData.details.model.brand.value,
              initialData.details.model.year.toString()
            );
          }
        } else {
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    // fetchWithAuthModels fonksiyonunu useEffect içinde tanımla
    const fetchWithAuthModelsFunc = async (brandCode: string, modelYear: string) => {
      try {
        setIsLoading(true);
        setVehicleModels([]); // Önceki modelleri temizle

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
        } else {
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchWithAuthBrands();
  }, [initialData, accessToken]);

  // useCallback'i kullan ama farklı bir isimle
  const fetchWithAuthModels = useCallback(
    async (brandCode: string, modelYear: string) => {
      try {
        setIsLoading(true);
        setVehicleModels([]); // Önceki modelleri temizle

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
        } else {
        }
      } catch (error) {
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
          
          // Eğer initialData varsa ve banka seçiliyse, şubeleri yükle
          if (initialData?.details.lossPayeeClause?.bank?.id) {
            setSelectedBankId(initialData.details.lossPayeeClause.bank.id);
            fetchBankBranches(initialData.details.lossPayeeClause.bank.id);
          }
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
          
          // Eğer initialData varsa ve finans kurumu seçiliyse
          if (initialData?.details.lossPayeeClause?.financialInstitution?.id) {
            setSelectedFinancialId(initialData.details.lossPayeeClause.financialInstitution.id);
          }
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

  // Form input değişimini yönet
  const handleChange = (name: string, value: string) => {
    // Motor numarası için validasyon
    if (name === 'engineNo') {
      const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      // Maksimum 40 karakter ile sınırla
      const truncatedValue = sanitizedValue.slice(0, 40);
      setFormData((prev) => ({ ...prev, [name]: truncatedValue }));

      // Hata mesajı kontrolü
      if (truncatedValue.length === 0) {
        setErrors(prev => ({
          ...prev,
          engineNo: 'Motor numarası boş geçilemez'
        }));
      } else if (truncatedValue.length < 6) {
        setErrors(prev => ({
          ...prev,
          engineNo: 'Motor numarası en az 6 karakter olmalıdır'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          engineNo: ''
        }));
      }
      return;
    }

    // Şasi numarası için validasyon
    if (name === 'chassisNo') {
      const sanitizedValue = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      // Maksimum 17 karakter ile sınırla
      const truncatedValue = sanitizedValue.slice(0, 17);
      setFormData((prev) => ({ ...prev, [name]: truncatedValue }));

      // Hata mesajı kontrolü
      if (truncatedValue.length === 0) {
        setErrors(prev => ({
          ...prev,
          chassisNo: 'Şasi numarası boş geçilemez'
        }));
      } else if (truncatedValue.length < 17) {
        setErrors(prev => ({
          ...prev,
          chassisNo: 'Şasi numarası 17 karakter olmalıdır'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          chassisNo: ''
        }));
      }
      return;
    }

    // Plaka kodu için özel doğrulama
    if (name === 'plateCode') {
      // Sadece harfler, rakamlar ve boşluğa izin ver
      const sanitizedValue = value.replace(/[^a-zA-Z0-9 ]/g, '').toUpperCase();
      // Maksimum 6 karakter ile sınırla
      const truncatedValue = sanitizedValue.slice(0, 6);
      setFormData((prev) => ({ ...prev, [name]: truncatedValue }));
      
      // Plaka kodu girildiğinde hata mesajını temizle
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
        setErrors(prev => ({
          ...prev,
          documentSerialCode: 'Belge seri kodu zorunludur'
        }));
      } else if (sanitizedValue.length < 2) {
        setErrors(prev => ({
          ...prev,
          documentSerialCode: 'Belge seri kodu 2 harf olmalıdır'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          documentSerialCode: ''
        }));
      }
      return;
    }

    // Belge seri no için validasyon
    if (name === 'documentSerialNumber') {
      const sanitizedValue = value.replace(/[^0-9]/g, '').slice(0, 6);
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
      if (sanitizedValue.length === 0) {
        setErrors(prev => ({
          ...prev,
          documentSerialNumber: 'Belge seri no zorunludur'
        }));
      } else if (sanitizedValue.length < 6) {
        setErrors(prev => ({
          ...prev,
          documentSerialNumber: 'Belge seri no 6 hane olmalıdır'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          documentSerialNumber: ''
        }));
      }
      return;
    }

    // Kasko ve Trafik Eski Poliçe Bilgileri için validasyonlar
    if ([
      'kaskoOldPolicyNo',
      'kaskoOldPolicyRenewalNo',
      'kaskoOldPolicyInsuranceCompanyNo',
      'kaskoOldPolicyAgencyNo',
      'trafikOldPolicyNo',
      'trafikOldPolicyRenewalNo',
      'trafikOldPolicyInsuranceCompanyNo',
      'trafikOldPolicyAgencyNo',
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
    
    // Eski Poliçe Bitiş Tarihleri için
    if (name === 'kaskoOldPolicyEndDate' || name === 'trafikOldPolicyEndDate') {
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }

    // Diğer alanlar için normal işlem - hata mesajını temizle
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Genel hata mesajı temizleme (select ve date input'lar için)
    // Dain-i mürtehin alanları hariç (bunlar özel fonksiyonlarla yönetiliyor)
    const dainMurtehinFields = ['dainMurtehinBankId', 'dainMurtehinBranchId', 'dainMurtehinFinancialId'];
    if (value && value.trim() !== '' && !dainMurtehinFields.includes(name)) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Özel alan işlemleri
    if (name === 'brandCode') {
      const selectedBrand = vehicleBrands.find((brand) => brand.value === value);
      setFormData((prev) => ({
        ...prev,
        brandCode: value,
        brand: selectedBrand?.text || '',
      }));

      // Marka değiştiğinde modelleri yükle
      if (value && formData.modelYear) {
        fetchWithAuthModels(value, formData.modelYear);
      }
    } else if (name === 'modelTypeCode') {
      const selectedModel = vehicleModels.find((model) => model.value === value);
      setFormData((prev) => ({
        ...prev,
        modelTypeCode: value,
        modelType: selectedModel?.text || '',
      }));
    } else if (name === 'modelYear') {
      // Model yılı değiştiğinde ve marka seçiliyse modelleri yükle
      if (formData.brandCode && value) {
        fetchWithAuthModels(formData.brandCode, value);
      }
    }

    if (name === 'dainMurtehinBankId') {
      handleBankChange(value);
      return; // Özel işlem yapıldığı için erken çık
    }

    if (name === 'seatCount') {
      const sanitizedValue = value.replace(/[^0-9]/g, '');
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
      const seatNum = Number(sanitizedValue);
      if (sanitizedValue.length === 0) {
        setErrors(prev => ({
          ...prev,
          seatCount: 'Koltuk adedi zorunludur'
        }));
      } else if (seatNum < 1 || seatNum > 100) {
        setErrors(prev => ({
          ...prev,
          seatCount: 'Koltuk adedi 1 ile 100 arasında olmalıdır'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          seatCount: ''
        }));
      }
      return;
    }
  };

  const handleAccessoryChange = (type: AccessoryType, field: string, value: string) => {
    // Aksesuar bedeli için sadece rakam validasyonu
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    // Plaka il kodu zorunluluğu
      if (!formData.plateCity) {
      setErrors(prev => ({
        ...prev,
        plateCity: 'Plaka il kodu zorunludur'
      }));
      hasError = true;
      }
    // Plakalı araçta plaka zorunlu
    if (vehicleType === 'plated') {
      if (!formData.plateCode) {
        setErrors(prev => ({
          ...prev,
          plateCode: 'Plaka alanı zorunludur'
        }));
        hasError = true;
      }
    }

    // Marka seçimi zorunlu
    if (!formData.brandCode) {
      setErrors(prev => ({
        ...prev,
        brandCode: 'Marka seçimi zorunludur'
      }));
      hasError = true;
    }

    // Model seçimi zorunlu
    if (!formData.modelTypeCode) {
      setErrors(prev => ({
        ...prev,
        modelTypeCode: 'Model seçimi zorunludur'
      }));
      hasError = true;
    }

    // Model yılı zorunlu
    if (!formData.modelYear) {
      setErrors(prev => ({
        ...prev,
        modelYear: 'Model yılı zorunludur'
      }));
      hasError = true;
    }

    // Motor numarası zorunlu
    if (!formData.engineNo) {
      setErrors(prev => ({
        ...prev,
        engineNo: 'Motor numarası boş geçilemez'
      }));
      hasError = true;
    } else if (formData.engineNo.length < 6) {
      setErrors(prev => ({
        ...prev,
        engineNo: 'Motor numarası en az 6 karakter olmalıdır'
      }));
      hasError = true;
    }

    // Şasi numarası zorunlu
    if (!formData.chassisNo) {
      setErrors(prev => ({
        ...prev,
        chassisNo: 'Şasi numarası boş geçilemez'
      }));
      hasError = true;
    } else if (formData.chassisNo.length < 17) {
      setErrors(prev => ({
        ...prev,
        chassisNo: 'Şasi numarası 17 karakter olmalıdır'
      }));
      hasError = true;
    }

    // Tescil tarihi zorunlu
    if (!formData.registrationDate) {
      setErrors(prev => ({
        ...prev,
        registrationDate: 'Tescil tarihi zorunludur'
      }));
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

    // Belge seri kodu ve seri no validasyonu - sadece plakalı araçlar için
    if (vehicleType === 'plated') {
      if (!formData.documentSerialCode) {
        setErrors(prev => ({
          ...prev,
          documentSerialCode: 'Belge seri kodu zorunludur'
        }));
        hasError = true;
      } else if (formData.documentSerialCode.length < 2) {
        setErrors(prev => ({
          ...prev,
          documentSerialCode: 'Belge seri kodu 2 harf olmalıdır'
        }));
        hasError = true;
      }

      if (!formData.documentSerialNumber) {
        setErrors(prev => ({
          ...prev,
          documentSerialNumber: 'Belge seri no zorunludur'
        }));
        hasError = true;
      } else if (formData.documentSerialNumber.length < 6) {
        setErrors(prev => ({
          ...prev,
          documentSerialNumber: 'Belge seri no 6 hane olmalıdır'
        }));
        hasError = true;
      }
    }

    if (!formData.seatCount) {
      setErrors(prev => ({
        ...prev,
        seatCount: 'Koltuk adedi zorunludur'
      }));
      hasError = true;
    } else if (Number(formData.seatCount) < 1 || Number(formData.seatCount) > 100) {
      setErrors(prev => ({
        ...prev,
        seatCount: 'Koltuk adedi 1 ile 100 arasında olmalıdır'
      }));
      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setIsLoading(true);

      let currentCustomerId = customerId;

      // Müşteri ID kontrolü
      if (!currentCustomerId) {
        const meResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!meResponse.ok) {
          throw new Error('Müşteri bilgileri alınamadı');
        }

        const meData = await meResponse.json();
        currentCustomerId = meData.id;

        if (!currentCustomerId) {
          throw new Error('Müşteri ID bulunamadı');
        }
      }

      // Plaka şehir kodunu doğru formatta al
      const plateCityValue = formData.plateCity ? Number(formData.plateCity.split(' - ')[0]) : 0;
      
      // Plaka şehir kodunun geçerli aralıkta olduğunu kontrol et
      if (plateCityValue < 0 || plateCityValue > 255) {
        alert('Geçersiz plaka il kodu. Lütfen geçerli bir il kodu seçiniz.');
        return;
      }

      // API isteği için veri yapısını hazırla
      const createData = {
        customerId: currentCustomerId,
        plate: {
          city: plateCityValue,
          code: vehicleType === 'plated' ? formData.plateCode : '',
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
        documentSerial: vehicleType === 'plated' && formData.documentSerialCode && formData.documentSerialNumber ? {
          code: formData.documentSerialCode,
          number: formData.documentSerialNumber,
        } : null,
        registrationDate: formData.registrationDate || new Date().toISOString().split('T')[0],
        seatNumber: parseInt(formData.seatCount) || 5,
        accessories: [] as Array<{ $type: string; price: number }>, // Burada yeni formatı kullanacağız
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

      // Aksesuarları yeni API formatında ekle
      if (formData.accessories.sound.value) {
        createData.accessories.push({ $type: 'audio', price: parseInt(formData.accessories.sound.value) });
      }
      if (formData.accessories.screen.value) {
        createData.accessories.push({ $type: 'display', price: parseInt(formData.accessories.screen.value) });
      }
      if (formData.accessories.other.value) {
        createData.accessories.push({ $type: 'other', price: parseInt(formData.accessories.other.value) });
      }

      let response;
      let url;

      if (isEditMode && initialData) {

        // Güncelleme işlemi
        url = `${API_BASE_URL}/api/customers/${currentCustomerId}/vehicles/${initialData.details.id}`;
        response = await fetchWithAuth(url, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vehicleId: initialData.details.id,
            ...createData,
          }),
        });
      } else {
        // Yeni araç ekleme işlemi
        url = `${API_BASE_URL}/api/customers/${currentCustomerId}/vehicles`;
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

  // Marka seçimi için sıralanmış options
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

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4" style={{zIndex: 9999}}>
      <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white p-4 md:p-6">
        <h2 className="mb-4 md:mb-6 text-lg md:text-xl font-bold text-gray-900">
          {isEditMode ? 'Araç Düzenle' : 'Araç Ekle'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Araç Tipi Seçimi - Sadece ekleme modunda göster */}
          {!isEditMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <button
                type="button"
                onClick={() => {
                  setVehicleType('plated');
                  // Plakasız'dan plakalı'ya geçişte hata mesajlarını temizle
                  setErrors(prev => ({
                    ...prev,
                    plateCode: '',
                    documentSerialCode: '',
                    documentSerialNumber: ''
                  }));
                }}
                className={`flex flex-col items-center rounded-lg border p-3 md:p-4 text-center text-sm md:text-base font-medium transition-colors ${
                  vehicleType === 'plated'
                    ? 'border-secondary bg-primary/10 text-secondary'
                    : 'hover:border-secondary hover:bg-primary/10'
                }`}
              >
                <span className="font-medium">Plakalı Araç</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setVehicleType('unplated');
                  // Plakasız araça geçişte ilgili alanları temizle
                  setFormData(prev => ({
                    ...prev,
                    plateCode: '',
                    documentSerialCode: '',
                    documentSerialNumber: ''
                  }));
                  // Hata mesajlarını da temizle
                  setErrors(prev => ({
                    ...prev,
                    plateCode: '',
                    documentSerialCode: '',
                    documentSerialNumber: ''
                  }));
                }}
                className={`flex flex-col items-center rounded-lg border p-3 md:p-4 text-center text-sm md:text-base font-medium transition-colors ${
                  vehicleType === 'unplated'
                    ? 'border-secondary bg-primary/10 text-secondary'
                    : 'hover:border-secondary hover:bg-primary/10'
                }`}
              >
                <span className="font-medium">Plakasız Araç</span>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
            {/* Plaka Bilgileri */}
            <div>
              <CustomSelect
                label="Plaka İl Kodu"
                value={formData.plateCity}
                onChange={(value) => handleChange('plateCity', value)}
                options={[
                  { value: '', label: 'Seçiniz' },
                  ...plateCities
                ]}
                searchable={true}
              />
              {errors.plateCity && (
                <p className="mt-1 text-xs text-red-500">{errors.plateCity}</p>
              )}
            </div>

            {vehicleType === 'plated' && (
              <div>
                <Input
                  label="Plaka"
                  value={formData.plateCode}
                  onChange={(e) => handleChange('plateCode', e.target.value)}
                  maxLength={6}
                />
                {errors.plateCode && (
                  <p className="mt-1 text-xs text-red-500">{errors.plateCode}</p>
                )}
              </div>
            )}

            {/* Marka - Model - Yıl Seçimleri */}
            <div>
              <CustomSelect
                label="Marka"
                value={formData.brandCode}
                onChange={(value) => handleChange('brandCode', value)}
                options={sortedBrandOptions}
                searchable={true}
              />
              {errors.brandCode && (
                <p className="mt-1 text-xs text-red-500">{errors.brandCode}</p>
              )}
            </div>

            <div>
              <CustomSelect
                label="Model Yılı"
                value={formData.modelYear}
                onChange={(value) => handleChange('modelYear', value)}
                options={MODEL_YEAR_OPTIONS}
                searchable={true}
              />
              {errors.modelYear && (
                <p className="mt-1 text-xs text-red-500">{errors.modelYear}</p>
              )}
            </div>

            <div>
              <CustomSelect
                label="Model Tipi"
                value={formData.modelTypeCode}
                onChange={(value) => handleChange('modelTypeCode', value)}
                options={[
                  { value: '', label: 'Seçiniz' },
                  ...vehicleModels.map((model) => ({
                    value: model.value,
                    label: model.text,
                  })),
                ]}
                disabled={!formData.brandCode || !formData.modelYear || vehicleModels.length === 0}
                searchable={true}
              />
              {errors.modelTypeCode && (
                <p className="mt-1 text-xs text-red-500">{errors.modelTypeCode}</p>
              )}
            </div>

            {/* Kullanım ve Yakıt */}
            <CustomSelect
              label="Kullanım Şekli"
              value={formData.usageType}
              onChange={(value) => handleChange('usageType', value)}
              options={utilizationStyleOptions.map((option) => ({
                value: option.value.toString(),
                label: option.label,
              }))}
              searchable={true}
            />
            <CustomSelect
              label="Yakıt Türü"
              value={formData.fuelType}
              onChange={(value) => handleChange('fuelType', value)}
              options={[
                { value: '', label: 'Seçiniz' },
                { value: VehicleFuelType.Gasoline.toString(), label: 'Benzin' },
                { value: VehicleFuelType.Diesel.toString(), label: 'Dizel' },
                { value: VehicleFuelType.Lpg.toString(), label: 'LPG' },
                { value: VehicleFuelType.Electric.toString(), label: 'Elektrik' },
                { value: VehicleFuelType.LpgGasoline.toString(), label: 'LPG + Benzin' },
              ]}
              searchable={true}
            />

            {/* Motor ve Şasi */}
            <div>
              <Input
                label="Motor No"
                value={formData.engineNo}
                onChange={(e) => handleChange('engineNo', e.target.value)}
                maxLength={40}
                placeholder="En az 6, en fazla 40 karakter"
              />
              {errors.engineNo && (
                <p className="mt-1 text-xs text-red-500">{errors.engineNo}</p>
              )}
            </div>

            <div>
              <Input
                label="Şasi No"
                value={formData.chassisNo}
                onChange={(e) => handleChange('chassisNo', e.target.value)}
                maxLength={17}
                placeholder="17 karakter"
              />
              {errors.chassisNo && (
                <p className="mt-1 text-xs text-red-500">{errors.chassisNo}</p>
              )}
            </div>

            {/* Belge Seri Kodu ve Belge Seri No - Sadece plakalı araçlar için göster */}
            {vehicleType === 'plated' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <Input
                    label="Belge Seri Kodu"
                    value={formData.documentSerialCode}
                    onChange={(e) => handleChange('documentSerialCode', e.target.value)}
                    placeholder="Örn: AA"
                    maxLength={2}
                  />
                  {errors.documentSerialCode && (
                    <p className="mt-1 text-xs text-red-500">{errors.documentSerialCode}</p>
                  )}
                </div>
                <div className="flex flex-col">
                  <Input
                    label="Belge Seri No"
                    value={formData.documentSerialNumber}
                    onChange={(e) => handleChange('documentSerialNumber', e.target.value)}
                    placeholder="Örn: 123456"
                    maxLength={6}
                  />
                  {errors.documentSerialNumber && (
                    <p className="mt-1 text-xs text-red-500">{errors.documentSerialNumber}</p>
                  )}
                </div>
              </div>
            )}

            {/* Tescil ve Koltuk */}
            <div>
              <Input
                label="Tescil Tarihi"
                type="date"
                value={formData.registrationDate}
                onChange={(e) => handleChange('registrationDate', e.target.value)}
              />
              {errors.registrationDate && (
                <p className="mt-1 text-xs text-red-500">{errors.registrationDate}</p>
              )}
            </div>

            <div>
              <Input
                label="Koltuk Adedi"
                type="number"
                value={formData.seatCount}
                onChange={(e) => handleChange('seatCount', e.target.value)}
              />
              {errors.seatCount && (
                <p className="mt-1 text-xs text-red-500">{errors.seatCount}</p>
              )}
            </div>

            {/* Aksesuar */}
            <div className="col-span-1 md:col-span-2">
              <div className="rounded-lg border">
                <button
                  type="button"
                  onClick={() => setShowAccessories(!showAccessories)}
                  className="flex w-full items-center justify-between p-3 md:p-4 text-left font-medium transition-colors hover:bg-gray-50"
                >
                  <span className="text-sm md:text-base">Aksesuarlar</span>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-secondary ml-auto mr-2 text-xs">
                    {Object.values(formData.accessories).filter((a) => a.value).length || 0}
                  </span>
                  <svg
                    className={`h-4 w-4 md:h-5 md:w-5 transition-transform ${showAccessories ? 'rotate-180 transform' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {showAccessories && (
                  <div className="border-t p-3 md:p-4">
                    {/* Aksesuar Tipleri Tab Butonları */}
                    <div className="mb-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveAccessoryType(AccessoryType.Sound)}
                        className={`rounded-lg px-3 md:px-4 py-2 text-sm font-medium transition-colors ${
                          activeAccessoryType === AccessoryType.Sound
                            ? 'bg-primary/20 text-secondary'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span className="flex items-center">
                          <svg
                            className="mr-1 h-4 w-4 md:h-5 md:w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M5 10v4a1 1 0 001 1h3l3 3V7L9 10H6a1 1 0 00-1 1z"
                            />
                          </svg>
                          Ses
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveAccessoryType(AccessoryType.Screen)}
                        className={`rounded-lg px-3 md:px-4 py-2 text-sm font-medium transition-colors ${
                          activeAccessoryType === AccessoryType.Screen
                            ? 'bg-primary/20 text-secondary'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span className="flex items-center">
                          <svg
                            className="mr-1 h-4 w-4 md:h-5 md:w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                          Ekran
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveAccessoryType(AccessoryType.Other)}
                        className={`rounded-lg px-3 md:px-4 py-2 text-sm font-medium transition-colors ${
                          activeAccessoryType === AccessoryType.Other
                            ? 'bg-primary/20 text-secondary'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <span className="flex items-center">
                          <svg
                            className="mr-1 h-4 w-4 md:h-5 md:w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                            />
                          </svg>
                          Diğer
                        </span>
                      </button>
                    </div>

                    {/* Seçilen Aksesuar Tipi İçeriği */}
                    <div className="rounded-lg border p-3 md:p-4">
                      {activeAccessoryType === AccessoryType.Sound && (
                        <div className="space-y-3 md:space-y-4">
                          <h5 className="font-medium text-sm md:text-base">Ses Bedeli</h5>
                          <div className="flex items-start gap-2">
                            <input
                              type="text"
                              value={formData.accessories.sound.value}
                              onChange={(e) =>
                                handleAccessoryChange(AccessoryType.Sound, 'value', e.target.value)
                              }
                              placeholder="Bedel"
                              className="flex-1 rounded-lg border px-3 py-2 text-sm"
                            />
                            <button
                              type="button"
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={() =>
                                handleAccessoryChange(AccessoryType.Sound, 'value', '')
                              }
                            >
                              <svg
                                className="h-4 w-4 md:h-5 md:w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}

                      {activeAccessoryType === AccessoryType.Screen && (
                        <div className="space-y-3 md:space-y-4">
                          <h5 className="font-medium text-sm md:text-base">Ekran Bedeli</h5>
                          <div className="flex items-start gap-2">
                            <input
                              type="text"
                              value={formData.accessories.screen.value}
                              onChange={(e) =>
                                handleAccessoryChange(AccessoryType.Screen, 'value', e.target.value)
                              }
                              placeholder="Bedel"
                              className="flex-1 rounded-lg border px-3 py-2 text-sm"
                            />
                            <button
                              type="button"
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={() =>
                                handleAccessoryChange(AccessoryType.Screen, 'value', '')
                              }
                            >
                              <svg
                                className="h-4 w-4 md:h-5 md:w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}

                      {activeAccessoryType === AccessoryType.Other && (
                        <div className="space-y-3 md:space-y-4">
                          <h5 className="font-medium text-sm md:text-base">Diğer Bedeli</h5>
                          <div className="flex items-start gap-2">
                            <input
                              type="text"
                              value={formData.accessories.other.value}
                              onChange={(e) =>
                                handleAccessoryChange(AccessoryType.Other, 'value', e.target.value)
                              }
                              placeholder="Bedel"
                              className="flex-1 rounded-lg border px-3 py-2 text-sm"
                            />
                            <button
                              type="button"
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={() =>
                                handleAccessoryChange(AccessoryType.Other, 'value', '')
                              }
                            >
                              <svg
                                className="h-4 w-4 md:h-5 md:w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Kasko Eski Poliçe Bilgileri - Açılır Kapanır */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowKaskoOldPolicy(!showKaskoOldPolicy)}
              className="w-full h-14 flex items-center justify-between px-4 bg-white hover:bg-gray-50 transition-colors"
              style={{ maxHeight: '56px' }}
            >
              <span className="font-medium text-gray-900 text-sm md:text-base">
                Kasko Eski Poliçe Bilgileri
              </span>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showKaskoOldPolicy ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showKaskoOldPolicy && (
              <div className="p-4 bg-white">
                <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
                  <div>
                    <Input
                      label="Kasko Eski Poliçe No"
                      value={formData.kaskoOldPolicyNo}
                      onChange={(e) => handleChange('kaskoOldPolicyNo', e.target.value)}
                    />
                    {errors.kaskoOldPolicyNo && (
                      <p className="mt-1 text-xs text-red-500">{errors.kaskoOldPolicyNo}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Kasko Yenileme Numarası"
                      value={formData.kaskoOldPolicyRenewalNo}
                      onChange={(e) => handleChange('kaskoOldPolicyRenewalNo', e.target.value)}
                    />
                    {errors.kaskoOldPolicyRenewalNo && (
                      <p className="mt-1 text-xs text-red-500">{errors.kaskoOldPolicyRenewalNo}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Kasko Sigorta Şirketi No"
                      value={formData.kaskoOldPolicyInsuranceCompanyNo}
                      onChange={(e) => handleChange('kaskoOldPolicyInsuranceCompanyNo', e.target.value)}
                    />
                    {errors.kaskoOldPolicyInsuranceCompanyNo && (
                      <p className="mt-1 text-xs text-red-500">{errors.kaskoOldPolicyInsuranceCompanyNo}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Kasko Acenta No"
                      value={formData.kaskoOldPolicyAgencyNo}
                      onChange={(e) => handleChange('kaskoOldPolicyAgencyNo', e.target.value)}
                    />
                    {errors.kaskoOldPolicyAgencyNo && (
                      <p className="mt-1 text-xs text-red-500">{errors.kaskoOldPolicyAgencyNo}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Kasko Poliçe Bitiş Tarihi"
                      type="date"
                      value={formData.kaskoOldPolicyEndDate}
                      onChange={(e) => handleChange('kaskoOldPolicyEndDate', e.target.value)}
                    />
                    {errors.kaskoOldPolicyEndDate && (
                      <p className="mt-1 text-xs text-red-500">{errors.kaskoOldPolicyEndDate}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Trafik Eski Poliçe Bilgileri - Açılır Kapanır */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setShowTrafikOldPolicy(!showTrafikOldPolicy)}
              className="w-full h-14 flex items-center justify-between px-4 bg-white hover:bg-gray-50 transition-colors"
              style={{ maxHeight: '56px' }}
            >
              <span className="font-medium text-gray-900 text-sm md:text-base">
                Trafik Eski Poliçe Bilgileri
              </span>
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${showTrafikOldPolicy ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showTrafikOldPolicy && (
              <div className="p-4 bg-white">
                <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2">
                  <div>
                    <Input
                      label="Trafik Eski Poliçe No"
                      value={formData.trafikOldPolicyNo}
                      onChange={(e) => handleChange('trafikOldPolicyNo', e.target.value)}
                    />
                    {errors.trafikOldPolicyNo && (
                      <p className="mt-1 text-xs text-red-500">{errors.trafikOldPolicyNo}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Trafik Yenileme Numarası"
                      value={formData.trafikOldPolicyRenewalNo}
                      onChange={(e) => handleChange('trafikOldPolicyRenewalNo', e.target.value)}
                    />
                    {errors.trafikOldPolicyRenewalNo && (
                      <p className="mt-1 text-xs text-red-500">{errors.trafikOldPolicyRenewalNo}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Trafik Sigorta Şirketi No"
                      value={formData.trafikOldPolicyInsuranceCompanyNo}
                      onChange={(e) => handleChange('trafikOldPolicyInsuranceCompanyNo', e.target.value)}
                    />
                    {errors.trafikOldPolicyInsuranceCompanyNo && (
                      <p className="mt-1 text-xs text-red-500">{errors.trafikOldPolicyInsuranceCompanyNo}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Trafik Acenta No"
                      value={formData.trafikOldPolicyAgencyNo}
                      onChange={(e) => handleChange('trafikOldPolicyAgencyNo', e.target.value)}
                    />
                    {errors.trafikOldPolicyAgencyNo && (
                      <p className="mt-1 text-xs text-red-500">{errors.trafikOldPolicyAgencyNo}</p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Trafik Poliçe Bitiş Tarihi"
                      type="date"
                      value={formData.trafikOldPolicyEndDate}
                      onChange={(e) => handleChange('trafikOldPolicyEndDate', e.target.value)}
                    />
                    {errors.trafikOldPolicyEndDate && (
                      <p className="mt-1 text-xs text-red-500">{errors.trafikOldPolicyEndDate}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
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
          <div className="flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 md:px-6 py-2.5 text-sm md:text-base font-medium transition-colors hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`rounded-lg px-4 md:px-6 py-2.5 text-sm md:text-base font-medium text-white transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-secondary hover:bg-opacity-90'
              }`}
            >
              {isLoading ? 'İşleniyor...' : isEditMode ? 'Değişiklikleri Kaydet' : 'Araç Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVehicleModal;