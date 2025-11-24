export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.insurup.com';

export const API_ENDPOINTS = {
  AUTH_LOGIN: '/api/auth/customer/login-or-register',
  AUTH_VERIFY_MFA: '/api/auth/customer/verify-mfa',
  CUSTOMER_ME: '/api/customers/me',
  ADDRESS_CITIES: '/api/address-parameters/cities',
  ADDRESS_DISTRICTS: (cityId: string) => `/api/address-parameters/districts?cityReference=${cityId}`,
  PROPERTY_TYPES: '/api/property-types',
  PROPERTY_USAGES: '/api/property-usages',
  PROPERTY_SAVE: '/api/properties',

  // Proposal endpoints - Yeni tek endpoint yapısı
  PROPOSALS_CREATE: '/api/proposals', // Tüm branşlar için tek endpoint
  PROPOSALS_ID: (proposalId: string) => `/api/proposals/${proposalId}`, // Proposal detayları alma
  
  // Legacy endpoints - Geriye uyumluluk için
  IMM_PROPOSAL_CREATE: '/api/proposals', // Artık hepsi aynı endpoint
  IMM_GET_PROPOSAL_BY_ID: (proposalId: string) => `/api/proposals/${proposalId}`, // Artık genel endpoint
  
  AUTH_OTP_SEND: '/api/authentication:customer/send-otp',
  AUTH_OTP_VERIFY: '/api/authentication:customer/verify-otp',
  COMPANIES: '/api/companies', // Bu genel bir endpoint varsayımıdır.
} as const; 