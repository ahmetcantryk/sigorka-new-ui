import { fetchWithAuth } from '@/services/fetchWithAuth';
import { API_ENDPOINTS } from '@/config/api';

// Customer Types
export enum CustomerType {
  Individual = 'individual',
  Company = 'company'
}

export interface LoginParams {
  identityNumber?: string;
  taxNumber?: string;
  birthDate?: string;
  phoneNumber: string;
  agentId?: string;
  customerType: CustomerType;
}

export interface LoginResponse {
  customerId?: string;
  token?: string;
  proposalId?: string;
}

/**
 * Ortak login/register fonksiyonu - tüm PersonalInfoStep'lerde kullanılır
 * Individual müşteriler için: identityNumber ve birthDate gerekli
 * Corporate müşteriler için: taxNumber gerekli
 */
export const performLogin = async (
  identityNumberOrTaxNumber: number | string,
  birthDate?: string,
  phoneNumber?: string,
  agentId?: string,
  customerType: CustomerType = CustomerType.Individual
): Promise<LoginResponse> => {
  if (!phoneNumber) {
    throw new Error('Telefon numarası gereklidir');
  }

  const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
  
  const requestBody: any = {
    $type: customerType,
    phoneNumber: {
      number: cleanPhoneNumber,
      countryCode: 90,
    },
    agentId: agentId,
  };

  if (customerType === CustomerType.Individual) {
    requestBody.identityNumber = typeof identityNumberOrTaxNumber === 'string' ? parseInt(identityNumberOrTaxNumber) : identityNumberOrTaxNumber;
    // Doğum tarihi opsiyonel - sadece varsa gönder (üye ol modunda zorunlu, giriş yap modunda opsiyonel)
    if (birthDate) {
      requestBody.birthDate = birthDate;
    }
  } else {
    requestBody.taxNumber = typeof identityNumberOrTaxNumber === 'string' ? identityNumberOrTaxNumber : identityNumberOrTaxNumber.toString();
  }
  
  const response = await fetchWithAuth(API_ENDPOINTS.AUTH_LOGIN, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Giriş/Kayıt başarısız oldu.';
    let errorData: any = null;
    
    try {
      errorData = JSON.parse(errorText);
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
      // JSON parse hatası olursa default mesajı kullan
    }
    
    // Error nesnesini genişletilmiş haliyle throw et
    const enhancedError: any = new Error(errorMessage);
    enhancedError.status = response.status;
    if (errorData) {
      enhancedError.codes = errorData.codes;
      enhancedError.type = errorData.type;
    }
    
    throw enhancedError;
  }

  return await response.json() as LoginResponse;
};

/**
 * OTP doğrulama fonksiyonu
 */
export const verifyOTP = async (token: string, code: string) => {
  if (!token || !code) {
    throw new Error('Token ve kod gereklidir');
  }

  const response = await fetchWithAuth(API_ENDPOINTS.AUTH_VERIFY_MFA, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, code }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'OTP doğrulama başarısız oldu.';
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // JSON parse hatası olursa default mesajı kullan
    }
    
    throw new Error(errorMessage);
  }

  return await response.json() as { 
    accessToken: string; 
    refreshToken: string; 
    customerId?: string; 
  };
};

/**
 * Profil güncelleme fonksiyonu
 * Individual ve Corporate müşteriler için farklı alanları destekler
 */
export const updateCustomerProfile = async (
  updatePayload: Record<string, any>, 
  customerId: string, 
  customerType: CustomerType = CustomerType.Individual
) => {
  if (!customerId) {
    throw new Error('Müşteri ID gereklidir');
  }

  // Handle job field conversion to uppercase string format
  const processedPayload = { ...updatePayload };
  if (processedPayload.job !== undefined && processedPayload.job !== null) {
    if (typeof processedPayload.job === 'number') {
      // Convert numeric job value to uppercase enum name with underscores
      const jobNames = ['UNKNOWN', 'BANKER', 'CORPORATE_EMPLOYEE', 'LTD_EMPLOYEE', 'POLICE', 'MILITARY_PERSONNEL', 
                        'RETIRED_SPOUSE', 'TEACHER', 'DOCTOR', 'PHARMACIST', 'NURSE', 'HEALTHCARE_WORKER', 
                        'LAWYER', 'JUDGE', 'PROSECUTOR', 'FREELANCER', 'FARMER', 'INSTRUCTOR', 
                        'RELIGIOUS_OFFICIAL', 'ASSOCIATION_MANAGER', 'OFFICER', 'RETIRED', 'HOUSEWIFE'];
      processedPayload.job = jobNames[processedPayload.job] || 'UNKNOWN';
    } else if (typeof processedPayload.job === 'string') {
      // Convert string job names to proper underscore format
      let jobString = processedPayload.job.toUpperCase();
      // Handle common multi-word job names
      jobString = jobString.replace(/CORPORATEEMPLOYEE/g, 'CORPORATE_EMPLOYEE');
      jobString = jobString.replace(/LTDEMPLOYEE/g, 'LTD_EMPLOYEE');
      jobString = jobString.replace(/MILITARYPERSONNEL/g, 'MILITARY_PERSONNEL');
      jobString = jobString.replace(/RETIREDSPOUSE/g, 'RETIRED_SPOUSE');
      jobString = jobString.replace(/HEALTHCAREWORKER/g, 'HEALTHCARE_WORKER');
      jobString = jobString.replace(/RELIGIOUSOFFICIAL/g, 'RELIGIOUS_OFFICIAL');
      jobString = jobString.replace(/ASSOCIATIONMANAGER/g, 'ASSOCIATION_MANAGER');
      processedPayload.job = jobString;
    }
  }

  const requestBody = {
    $type: customerType,
    id: customerId,
    ...processedPayload
  };

  const response = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_UPDATE(customerId), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Profil güncellenemedi.';
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // JSON parse hatası olursa default mesajı kullan
    }
    
    throw new Error(errorMessage);
  }

  // 204 No Content durumunda güncel profili /me endpoint'inden çek
  if (response.status === 204) {
    const profileResponse = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_ME);
    if (!profileResponse.ok) {
      throw new Error('Profil güncellendi ancak güncel bilgiler alınamadı');
    }
    return await profileResponse.json();
  }

  // Eğer 200 OK ise response body'den dönen veriyi kullan
  return await response.json();
}; 

/**
 * Sağlık bilgilerini güncelleme fonksiyonu (TSS için)
 * Sadece bireysel müşteriler için geçerlidir
 */
export const updateCustomerHealthInfo = async (
  height: number,
  weight: number,
  customerId: string
) => {
  if (!customerId) {
    throw new Error('Müşteri ID gereklidir');
  }

  if (!height || !weight || height <= 0 || weight <= 0) {
    throw new Error('Geçerli boy ve kilo bilgileri gereklidir');
  }

  // HealthInfo API'si için sadece gerekli bilgileri gönder
  const requestBody = {
    $type: CustomerType.Individual, // Sağlık bilgileri sadece bireysel müşteriler için
    customerId: customerId,
    height: height,
    weight: weight,
  };

  const response = await fetchWithAuth(API_ENDPOINTS.CUSTOMER_HEALTH_INFO(customerId), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Sağlık bilgileri güncellenemedi.';
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      // JSON parse hatası olursa default mesajı kullan
    }
    
    throw new Error(errorMessage);
  }

  // Health info endpoint'i genelde 204 döner, content yoksa boş obje döndür
  if (response.status === 204) {
    return { height, weight };
  }

  return await response.json();
}; 

/**
 * Müşteri tipini belirlemek için yardımcı fonksiyon
 */
export const determineCustomerType = (profile: any): CustomerType => {
  if (profile?.type === 'company' || profile?.taxNumber) {
    return CustomerType.Company;
  }
  return CustomerType.Individual;
};

/**
 * Müşteri verilerinin tamamlanıp tamamlanmadığını kontrol eden fonksiyon
 */
export const isProfileDataComplete = (profile: any, customerType: CustomerType): boolean => {
  if (!profile) return false;

  const cityValue = typeof profile.city === 'object' && profile.city ? profile.city.value : profile.city;
  const districtValue = typeof profile.district === 'object' && profile.district ? profile.district.value : profile.district;

  if (customerType === CustomerType.Company) {
    return !!(profile.title && cityValue && districtValue);
  }
  
  return !!(profile.fullName && cityValue && districtValue);
}; 