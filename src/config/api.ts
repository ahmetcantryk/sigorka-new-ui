export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.insurup.com';

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH_LOGIN: `/api/auth/customer/login-or-register`,
  AUTH_VERIFY_MFA: `/api/auth/customer/verify-mfa`,
  AUTH_REFRESH_TOKEN: `/api/auth/customer/refresh`,
  
  // Customer endpoints
  CUSTOMER_ME: '/api/customers/me',
  CUSTOMER_UPDATE: (customerId: string) => `/api/customers/${customerId}`,
  CUSTOMER_PROPERTIES: (customerId: string) => `/api/customers/${customerId}/properties`,
  CUSTOMER_PROPERTY_DETAIL: (customerId: string, propertyId: string) => `/api/customers/${customerId}/properties/${propertyId}`,
  
  // Address endpoints
  ADDRESS_CITIES: `/api/address-parameters/cities`,
  ADDRESS_DISTRICTS: (cityValue: string) =>
    `/api/address-parameters/districts?cityReference=${cityValue}`,
  ADDRESS_TOWNS: (districtValue: string) =>
    `/api/address-parameters/towns?districtReference=${districtValue}`,
  ADDRESS_NEIGHBORHOODS: (townValue: string) =>
    `/api/address-parameters/neighbourhoods?townReference=${townValue}`,
  ADDRESS_STREETS: (neighborhoodValue: string) =>
    `/api/address-parameters/streets?neighbourhoodReference=${neighborhoodValue}`,
  ADDRESS_BUILDINGS: (streetValue: string) =>
    `/api/address-parameters/buildings?streetReference=${streetValue}`,
  ADDRESS_APARTMENTS: (buildingValue: string) =>
    `/api/address-parameters/apartments?buildingReference=${buildingValue}`,
  PROPERTIES_QUERY_ADDRESS: `/api/properties/query-address-by-property-number`,
  PROPERTIES_QUERY_DASK_OLD_POLICY: `/api/properties/query-property-by-dask-old-policy`,
  
  // Vehicle endpoints
  VEHICLE_BRANDS: `/api/vehicle-parameters/brands`,
  VEHICLE_MODELS: (brandCode: string, modelYear: string) =>
    `/api/vehicle-parameters/models?brandReference=${brandCode}&year=${modelYear}`,
  
  // Customer vehicle endpoints
  CUSTOMER_VEHICLES: `/api/customers/me/vehicles`,
  CUSTOMER_VEHICLES_BY_ID: (customerId: string) => 
    `/api/customers/${customerId}/vehicles`,
  CUSTOMER_VEHICLES_QUERY: (customerId: string) =>
    `/api/customers/${customerId}/vehicles/external-lookup`,
  CUSTOMER_HEALTH_INFO: (customerId: string) => 
    `/api/customers/${customerId}/health-info`,
  
  // Insurance service endpoints
  INSURANCE_SERVICES_QUERY: `/api/insurance-services/query-individual-customer`,
  
  // Proposal endpoints - Yeni tek endpoint yapısı
  PROPOSALS_CREATE: '/api/proposals', // Tüm branşlar için tek endpoint
  PROPOSALS_ID: (proposalId: string) => `/api/proposals/${proposalId}`, // Proposal detayları ve snapshot, products, coverage groups hepsi bu endpoint'den gelir
  
  // Legacy endpoints - Geriye uyumluluk için kalsın ama yeni tek endpoint'i kullanmayı tercih edelim
  PROPOSALS_TRAFIK: `/api/proposals`, // Artık hepsi aynı endpoint'e yönlendiriliyor
  PROPOSALS_KASKO: `/api/proposals`,
  PROPOSALS_TSS: `/api/proposals`,
  PROPOSALS_DASK: `/api/proposals`,
  PROPOSALS_KONUT: `/api/proposals`,
  PROPOSALS_IMM: `/api/proposals`,
  
  // Proposal product endpoints
  PROPOSAL_PRODUCT_DOCUMENT: (proposalId: string, productId: string) => 
    `/api/proposals/${proposalId}/products/${productId}/document`,
  PROPOSAL_PAYMENT: (proposalId: string) => `/api/proposals/${proposalId}/payment`,
  PROPOSAL_PRODUCT_PAYMENT: (proposalId: string, productId: string) => `/api/proposals/${proposalId}/products/${productId}/purchase`,
  PROPOSAL_PRODUCT_PAYMENT_3DSECURE: (proposalId: string, productId: string) => `/api/proposals/${proposalId}/products/${productId}/purchase:3d-secure`,
  PROPOSAL_PRODUCT_PURCHASE_SYNC: (proposalId: string, productId: string) => `/api/proposals/${proposalId}/products/${productId}/purchase/sync`,
  PROPOSAL_PRODUCT_PURCHASE_ASYNC: (proposalId: string, productId: string) => `/api/proposals/${proposalId}/products/${productId}/purchase/async`,
  PROPOSAL_PREINFO_FORM: (proposalId: string, productId: string) => `/api/proposals/${proposalId}/products/${productId}/information-form-document`,
  PROPOSAL_SEND_PREINFO_FORM: (proposalId: string, productId: string) => `/api/proposals/${proposalId}/products/${productId}/send-preinfo-form`,
  
  // Cases endpoints
  CASES_NEW_SALE_OPPORTUNITY: `/api/cases:new-sale-opportunity`,
  CASES_GRAPHQL: `/graphql`,
  
  // General/Company endpoints
  COMPANIES: `/api/insurance-companies`,
  
  // Policy endpoints
  POLICIES: '/api/policies',
  POLICIES_ID: (policyId: string) => `/api/policies/${policyId}`,
  POLICIES_DOCUMENT: (policyId: string) => 
    `/api/policies/${policyId}/document`,

  // Diğer endpointler
  VEHICLE_TRAMER_QUERY: '/api/vehicles/tramer-query',
}; 