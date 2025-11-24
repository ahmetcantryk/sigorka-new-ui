import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { validateFirstName, validateLastName } from '../../../utils/validators';
import CustomSelect from '../../common/Input/CustomSelect';
import Input from '../../common/Input/Input';
import PhoneInput from '../../common/Input/PhoneInput';
import { customerApi } from '../../../services/api';
import { Autocomplete, TextField, Snackbar, Alert } from '@mui/material';
import { API_ENDPOINTS, API_BASE_URL } from '../../../config/api';
import { fetchWithAuth } from '../../../services/fetchWithAuth';
import { updateCustomerProfile, CustomerType } from '../../../utils/authHelper';

enum Gender {
  Unknown = 0,
  Male = 1,
  Female = 2,
  Other = 3,
}

const genderOptions = [
  { value: Gender.Unknown, label: 'Bilinmiyor' },
  { value: Gender.Male, label: 'Erkek' },
  { value: Gender.Female, label: 'Kadın' },
  { value: Gender.Other, label: 'Diğer' },
];

enum Job {
  Unknown = 0,
  Banker = 1,
  CorporateEmployee = 2,
  LtdEmployee = 3,
  Police = 4,
  MilitaryPersonnel = 5,
  RetiredSpouse = 6,
  Teacher = 7,
  Doctor = 8,
  Pharmacist = 9,
  Nurse = 10,
  HealthcareWorker = 11,
  Lawyer = 12,
  Judge = 13,
  Prosecutor = 14,
  Freelancer = 15,
  Farmer = 16,
  Instructor = 17,
  ReligiousOfficial = 18,
  AssociationManager = 19,
  Officer = 20,
  Retired = 21,
  Housewife = 22,
}

const jobOptions = [
  { value: Job.Unknown, label: 'Bilinmiyor' },
  { value: Job.Banker, label: 'Bankacı' },
  { value: Job.CorporateEmployee, label: 'Kurumsal Çalışan' },
  { value: Job.LtdEmployee, label: 'Ltd. Şirket Çalışanı' },
  { value: Job.Police, label: 'Polis' },
  { value: Job.MilitaryPersonnel, label: 'Askeri Personel' },
  { value: Job.RetiredSpouse, label: 'Emekli Eşi' },
  { value: Job.Teacher, label: 'Öğretmen' },
  { value: Job.Doctor, label: 'Doktor' },
  { value: Job.Pharmacist, label: 'Eczacı' },
  { value: Job.Nurse, label: 'Hemşire' },
  { value: Job.HealthcareWorker, label: 'Sağlık Çalışanı' },
  { value: Job.Lawyer, label: 'Avukat' },
  { value: Job.Judge, label: 'Hakim' },
  { value: Job.Prosecutor, label: 'Savcı' },
  { value: Job.Freelancer, label: 'Serbest Meslek' },
  { value: Job.Farmer, label: 'Çiftçi' },
  { value: Job.Instructor, label: 'Eğitmen' },
  { value: Job.ReligiousOfficial, label: 'Din Görevlisi' },
  { value: Job.AssociationManager, label: 'Dernek Yöneticisi' },
  { value: Job.Officer, label: 'Memur' },
  { value: Job.Retired, label: 'Emekli' },
  { value: Job.Housewife, label: 'Ev Hanımı' },
];

// API'den gelen string değerleri enum'a çeviren yardımcı fonksiyonlar
const getGenderFromString = (gender: string): Gender => {
  switch (gender) {
    case 'MALE': return Gender.Male;
    case 'FEMALE': return Gender.Female;
    case 'OTHER': return Gender.Other;
    default: return Gender.Unknown;
  }
};

const getJobFromString = (job: string): Job => {
  switch (job) {
    case 'BANKER': return Job.Banker;
    case 'CORPORATE_EMPLOYEE': return Job.CorporateEmployee;
    case 'LTD_EMPLOYEE': return Job.LtdEmployee;
    case 'POLICE': return Job.Police;
    case 'MILITARY_PERSONNEL': return Job.MilitaryPersonnel;
    case 'RETIRED_SPOUSE': return Job.RetiredSpouse;
    case 'TEACHER': return Job.Teacher;
    case 'DOCTOR': return Job.Doctor;
    case 'PHARMACIST': return Job.Pharmacist;
    case 'NURSE': return Job.Nurse;
    case 'HEALTHCARE_WORKER': return Job.HealthcareWorker;
    case 'LAWYER': return Job.Lawyer;
    case 'JUDGE': return Job.Judge;
    case 'PROSECUTOR': return Job.Prosecutor;
    case 'FREELANCER': return Job.Freelancer;
    case 'FARMER': return Job.Farmer;
    case 'INSTRUCTOR': return Job.Instructor;
    case 'RELIGIOUS_OFFICIAL': return Job.ReligiousOfficial;
    case 'ASSOCIATION_MANAGER': return Job.AssociationManager;
    case 'OFFICER': return Job.Officer;
    case 'RETIRED': return Job.Retired;
    case 'HOUSEWIFE': return Job.Housewife;
    default: return Job.Unknown;
  }
};

const UserProfile = () => {
  const { customerId } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<Array<{ value: string; text: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ value: string; text: string }>>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSeverity, setNotificationSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');
  const [initialFormData, setInitialFormData] = useState<any>(null);
  const [customerType, setCustomerType] = useState<CustomerType>(CustomerType.Individual);
  const [profile, setProfile] = useState<any>(null);

  // Bireysel müşteri formu
  const [individualFormData, setIndividualFormData] = useState({
    tckn: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    birthDate: '',
    gender: '',
    city: '',
    district: '',
    occupation: '',
  });

  // Kurumsal müşteri formu
  const [companyFormData, setCompanyFormData] = useState({
    taxNumber: '',
    title: '',
    phone: '',
    email: '',
    city: '',
    district: '',
  });

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  useEffect(() => {
    const fetchWithAuthCustomerData = async () => {
      try {
        setLoading(true);
        setError(null);
        const profile = await customerApi.getProfile();
        
        if (profile) {
          setProfile(profile);
          
          // Müşteri tipini belirle
          const isCompany = profile.$type === 'company' || profile.type === 'COMPANY';
          setCustomerType(isCompany ? CustomerType.Company : CustomerType.Individual);
          
          if (isCompany) {
            // Kurumsal müşteri verileri
            setCompanyFormData({
              taxNumber: profile.taxNumber || '',
              title: profile.title || '',
              phone: profile.primaryPhoneNumber?.number || '',
              email: profile.primaryEmail || '',
              city: profile.city?.value || '',
              district: profile.district?.value || '',
            });
          } else {
            // Bireysel müşteri verileri
            const nameParts = (profile?.fullName || '').trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            setIndividualFormData({
              tckn: profile.identityNumber?.toString() || '',
              firstName: firstName,
              lastName: lastName,
              phone: profile.primaryPhoneNumber?.number || '',
              email: profile.primaryEmail || '',
              birthDate: profile.birthDate || '',
              gender: getGenderFromString(profile.gender).toString(),
              city: profile.city?.value || '',
              district: profile.district?.value || '',
              occupation: profile.job ? getJobFromString(profile.job).toString() : Job.Unknown.toString(),
            });
          }
        }
      } catch (err) {
        setError('Profil bilgileri alınamadı. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      fetchWithAuthCustomerData();
    }
  }, []);

  useEffect(() => {
    const fetchWithAuthCities = async () => {
      try {
        const { accessToken } = useAuthStore.getState();
        const response = await fetchWithAuth(`${API_BASE_URL}${API_ENDPOINTS.ADDRESS_CITIES}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCities(data);
        }
      } catch (error) {
      }
    };

    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      fetchWithAuthCities();
    }
  }, []);

  const fetchWithAuthDistricts = async (cityValue: string) => {
    try {
      const { accessToken } = useAuthStore.getState();
      const response = await fetchWithAuth(`${API_BASE_URL}${API_ENDPOINTS.ADDRESS_DISTRICTS(cityValue)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDistricts(data);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    const currentCity = customerType === CustomerType.Company ? companyFormData.city : individualFormData.city;
    if (currentCity) {
      fetchWithAuthDistricts(currentCity);
    }
  }, [customerType === CustomerType.Company ? companyFormData.city : individualFormData.city, customerType]);

  const [showValidation, setShowValidation] = useState(false);

  const validateBirthDate = (date: string) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate >= today) {
      setNotificationMessage('Doğum tarihi bugün veya gelecekte olamaz');
      setNotificationSeverity('error');
      setShowNotification(true);
      return false;
    }
    return true;
  };

  const handleIndividualChange = (name: string, value: string | boolean) => {
    if (name === 'birthDate' && typeof value === 'string') {
      if (!validateBirthDate(value)) {
        return;
      }
    }
    setIndividualFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCompanyChange = (name: string, value: string | boolean) => {
    setCompanyFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowValidation(true);

    const formData = customerType === CustomerType.Company ? companyFormData : individualFormData;

    // Zorunlu alanların kontrolü
    if (customerType === CustomerType.Company) {
      if (!companyFormData.title || !companyFormData.phone || !companyFormData.email || 
          !companyFormData.city || !companyFormData.district) {
        setNotificationMessage('Lütfen tüm zorunlu alanları doldurunuz.');
        setNotificationSeverity('error');
        setShowNotification(true);
        return;
      }
    } else {
      if (!individualFormData.firstName || !individualFormData.lastName || !individualFormData.phone || 
          !individualFormData.email || !individualFormData.birthDate || !individualFormData.gender || 
          !individualFormData.city || !individualFormData.district || !individualFormData.occupation) {
        setNotificationMessage('Lütfen tüm zorunlu alanları doldurunuz.');
        setNotificationSeverity('error');
        setShowNotification(true);
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);

      // CustomerId kontrolü
      if (!customerId) {
        throw new Error('Kullanıcı kimlik bilgisi bulunamadı. Lütfen sayfayı yenileyin.');
      }

      let updateData: any = {};

      if (customerType === CustomerType.Company) {
        updateData = {
          title: companyFormData.title,
          taxNumber: companyFormData.taxNumber,
          cityReference: companyFormData.city,
          districtReference: companyFormData.district,
          primaryEmail: companyFormData.email,
          primaryPhoneNumber: {
            number: companyFormData.phone,
            countryCode: 90,
          },
        };
      } else {
        updateData = {
          fullName: `${individualFormData.firstName} ${individualFormData.lastName}`,
          birthDate: individualFormData.birthDate,
          cityReference: individualFormData.city,
          districtReference: individualFormData.district,
          gender: parseInt(individualFormData.gender),
          job: parseInt(individualFormData.occupation),
          primaryEmail: individualFormData.email,
          primaryPhoneNumber: {
            number: individualFormData.phone,
            countryCode: 90,
          },
        };
      }

      // updateCustomerProfile kullanarak profili güncelle
      await updateCustomerProfile(updateData, customerId, customerType);

      setNotificationMessage('Profiliniz başarıyla güncellendi.');
      setNotificationSeverity('success');
      setShowNotification(true);
    } catch (err) {
      setNotificationMessage('Profil güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      setNotificationSeverity('error');
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-secondary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-secondary hover:bg-opacity-90 mt-4 rounded-lg px-4 py-2 text-white"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  const renderIndividualForm = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Input
        label="T.C. Kimlik No"
        value={individualFormData.tckn}
        className="bg-gray-50"
        disabled
        hideSuccessIndicator={true}
      />

      <PhoneInput
        value={individualFormData.phone}
        onChange={(value) => handleIndividualChange('phone', value)}
        showValidation={showValidation}
        hideSuccessIndicator={true}
      />

      <Input
        label="Ad"
        value={individualFormData.firstName}
        onChange={(e) => {
          const value = e.target.value;
          const filteredValue = value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '');
          handleIndividualChange('firstName', filteredValue.toUpperCase());
        }}
        validate={validateFirstName}
        showValidation={showValidation}
        hideSuccessIndicator={true}
      />

      <Input
        label="Soyad"
        value={individualFormData.lastName}
        onChange={(e) => {
          const value = e.target.value;
          const filteredValue = value.replace(/[^a-zA-ZğüşıöçĞÜŞİÖÇ\s]/g, '');
          handleIndividualChange('lastName', filteredValue.toUpperCase());
        }}
        validate={validateLastName}
        showValidation={showValidation}
        hideSuccessIndicator={true}
      />

      <Input
        label="E-posta Adresi"
        type="email"
        value={individualFormData.email}
        onChange={(e) => handleIndividualChange('email', e.target.value)}
        showValidation={showValidation}
        hideSuccessIndicator={true}
      />

      <Input
        label="Doğum Tarihi"
        type="date"
        value={individualFormData.birthDate}
        onChange={(e) => handleIndividualChange('birthDate', e.target.value)}
        showValidation={showValidation}
        hideSuccessIndicator={true}
        max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}
      />

      <Autocomplete
        options={genderOptions}
        getOptionLabel={(option) => option.label}
        value={genderOptions.find(gender => gender.value.toString() === individualFormData.gender) || null}
        onChange={(_, newValue) => {
          handleIndividualChange('gender', newValue?.value.toString() || '');
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Cinsiyet"
            error={showValidation && !individualFormData.gender}
            helperText={showValidation && !individualFormData.gender ? 'Cinsiyet seçimi zorunludur' : ''}
          />
        )}
      />

      <Autocomplete
        options={jobOptions}
        getOptionLabel={(option) => option.label}
        value={jobOptions.find(job => job.value.toString() === individualFormData.occupation) || null}
        onChange={(_, newValue) => {
          handleIndividualChange('occupation', newValue?.value.toString() || '');
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Meslek"
            error={showValidation && !individualFormData.occupation}
            helperText={showValidation && !individualFormData.occupation ? 'Meslek seçimi zorunludur' : ''}
          />
        )}
      />

      <Autocomplete
        options={cities}
        getOptionLabel={(option) => option.text}
        value={cities.find((city) => city.value === individualFormData.city) || null}
        onChange={(_, newValue) => {
          handleIndividualChange('city', newValue?.value || '');
          if (newValue?.value) {
            fetchWithAuthDistricts(newValue.value);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Yaşadığınız İl"
            error={showValidation && !individualFormData.city}
            helperText={showValidation && !individualFormData.city ? 'İl seçimi zorunludur' : ''}
          />
        )}
      />

      <Autocomplete
        options={districts}
        getOptionLabel={(option) => option.text}
        value={districts.find((district) => district.value === individualFormData.district) || null}
        onChange={(_, newValue) => {
          handleIndividualChange('district', newValue?.value || '');
        }}
        disabled={!individualFormData.city}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Yaşadığınız İlçe"
            error={showValidation && !individualFormData.district}
            helperText={showValidation && !individualFormData.district ? 'İlçe seçimi zorunludur' : ''}
          />
        )}
      />
    </div>
  );

  const renderCompanyForm = () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Input
        label="Vergi Numarası"
        value={companyFormData.taxNumber}
        className="bg-gray-50"
        disabled
        hideSuccessIndicator={true}
      />

      <PhoneInput
        value={companyFormData.phone}
        onChange={(value) => handleCompanyChange('phone', value)}
        showValidation={showValidation}
        hideSuccessIndicator={true}
      />

      <Input
        label="Şirket Ünvanı"
        value={companyFormData.title}
        onChange={(e) => handleCompanyChange('title', e.target.value)}
        showValidation={showValidation}
        hideSuccessIndicator={true}
      />

      <Input
        label="E-posta Adresi"
        type="email"
        value={companyFormData.email}
        onChange={(e) => handleCompanyChange('email', e.target.value)}
        showValidation={showValidation}
        hideSuccessIndicator={true}
      />

      <Autocomplete
        options={cities}
        getOptionLabel={(option) => option.text}
        value={cities.find((city) => city.value === companyFormData.city) || null}
        onChange={(_, newValue) => {
          handleCompanyChange('city', newValue?.value || '');
          if (newValue?.value) {
            fetchWithAuthDistricts(newValue.value);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Şirket İli"
            error={showValidation && !companyFormData.city}
            helperText={showValidation && !companyFormData.city ? 'İl seçimi zorunludur' : ''}
          />
        )}
      />

      <Autocomplete
        options={districts}
        getOptionLabel={(option) => option.text}
        value={districts.find((district) => district.value === companyFormData.district) || null}
        onChange={(_, newValue) => {
          handleCompanyChange('district', newValue?.value || '');
        }}
        disabled={!companyFormData.city}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Şirket İlçesi"
            error={showValidation && !companyFormData.district}
            helperText={showValidation && !companyFormData.district ? 'İlçe seçimi zorunludur' : ''}
          />
        )}
      />
    </div>
  );

  return (
    <div className="px-5 py-5 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Bilgilerim</h1>
        <p className="mt-1 text-sm md:text-base text-gray-500">
          {customerType === CustomerType.Company ? 'Şirket bilgilerinizi güncelleyebilir ve yönetebilirsiniz.' : 'Kişisel bilgilerinizi güncelleyebilir ve yönetebilirsiniz.'}
        </p>
      </div>

      <Snackbar
        open={showNotification}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notificationSeverity} sx={{ width: '100%' }}>
          {notificationMessage}
        </Alert>
      </Snackbar>

      <div className="shadow-xs rounded-xl border border-gray-100 bg-white p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {customerType === CustomerType.Company ? renderCompanyForm() : renderIndividualForm()}

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="rounded-lg px-6 py-2.5 font-medium text-white transition-colors hover:opacity-90 disabled:opacity-70"
              style={{ backgroundColor: 'var(--golden-yellow)' }}
              disabled={loading}
            >
              {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
