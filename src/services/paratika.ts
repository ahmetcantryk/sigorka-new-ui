import axios from 'axios';

export interface ParatikaSessionRequest {
  ACTION: 'SESSIONTOKEN';
  MERCHANTUSER: string;
  MERCHANTPASSWORD: string;
  MERCHANT: string;
  SESSIONTYPE: 'PAYMENTSESSION';
  RETURNURL: string;
  MERCHANTPAYMENTID: string;
  AMOUNT: string;
  CURRENCY: 'TRY';
  CUSTOMER: string;
  CUSTOMERNAME: string;
  CUSTOMEREMAIL: string;
  CUSTOMERPHONE: string;
  CUSTOMERIP: string;
  CUSTOMERUSERAGENT: string;
  ORDERITEMS: string;
  DISCOUNTAMOUNT: string;
  BILLTOADDRESSLINE: string;
  BILLTOCITY: string;
  BILLTOCOUNTRY: 'TUR';
  BILLTOPOSTALCODE: string;
  SHIPTOADDRESSLINE: string;
  SHIPTOCITY: string;
  SHIPTOCOUNTRY: 'TUR';
  SHIPTOPOSTALCODE: string;
}

export interface ParatikaSessionResponse {
  sessionToken: string;
  responseCode: string;
  responseMsg: string;
}

export interface ParatikaCardInfo {
  pan: string;
  cardOwner: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardCutoffDay?: string;
  callbackUrl: string;
}

export interface Paratika3DResponse {
  html: string; // 3D doğrulama formu HTML'i
  isRedirect: boolean;
  directUrl?: string;
  formParams?: Record<string, string>;
}

export interface ParatikaQueryTransactionRequest {
  ACTION: 'QUERYTRANSACTION';
  MERCHANT: string;
  MERCHANTUSER: string;
  MERCHANTPASSWORD: string;
  MERCHANTPAYMENTID: string;
}

export interface ParatikaTransactionResponse {
  merchantPaymentId: string;
  responseCode: string;
  responseMsg: string;
  transactionCount: string;
  totalTransactionCount: string;
  transactionList: Array<{
    timePsSent: string;
    timePsReceived: string;
    timeCreated: string;
    amount: number;
    discountAmount: number;
    transactionStatus: string;
    currency: string;
    panLast4: string;
    transactionType: string;
    installmentCount: number;
    cardOwnerMasked: string;
    customerId: string;
    bin: string;
    merchantCommissionRate: number;
    merchantPaymentId: string;
  }>;
}

// ⚠️ GÜVENLIK: Kimlik bilgileri artık sadece backend'de tutulacak
// Bu dosyada herhangi bir kimlik bilgisi bulunmamalı!

/**
 * Backend API üzerinden Paratika session token oluşturur (CORS problemi çözümü)
 */
export async function createSessionViaAPI(orderData: {
  amount: number;
  orderId: string;
  customerInfo: {
    id: string;
    name: string;
    email: string;
    phone: string;
    ip: string;
    userAgent: string;
  };
  billingAddress: {
    addressLine: string;
    city: string;
    postalCode: string;
  };
  shippingAddress: {
    addressLine: string;
    city: string;
    postalCode: string;
  };
  orderItems: Array<{
    productCode: string;
    name: string;
    description: string;
    quantity: number;
    amount: number;
  }>;
}): Promise<ParatikaSessionResponse> {
  try {
    const response = await fetch('/api/paratika/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Session token oluşturulamadı');
    }

    const result = await response.json();
    return result as ParatikaSessionResponse;
  } catch (error) {
    throw error;
  }
}

/**
 * Backend API üzerinden Paratika 3D doğrulama başlatır
 */
export async function validate3DCard(sessionToken: string, cardInfo: {
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: number;
  cvv: string;
  callbackUrl?: string;
}): Promise<{ success: boolean; html: string; isRedirect: boolean }> {
  try {
    const response = await fetch('/api/paratika/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionToken,
        cardInfo
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '3D doğrulama başlatılamadı');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Backend API üzerinden transaction sorgusu yapar
 */
export async function queryTransactionViaAPI(merchantPaymentId: string): Promise<ParatikaTransactionResponse> {
  try {
    const response = await fetch('/api/paratika/query-transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ merchantPaymentId }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Transaction sorgulanamadı');
    }

    const result = await response.json();
    return result as ParatikaTransactionResponse;
  } catch (error) {
    throw error;
  }
}

/**
 * Müşteri IP adresini alır (güvenli)
 */
export async function getClientIP(): Promise<string> {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    return '127.0.0.1';
  }
}

/**
 * 3D doğrulama sonrası durumu kontrol eder
 */
export async function check3DStatus(paymentData: any): Promise<boolean> {
  try {
    if (paymentData && paymentData.responseCode === '00') {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
}

/**
 * Webhook notification'ını kontrol eder - iframe redirect problemine çözüm
 */
export async function checkPaymentNotification(merchantPaymentId: string): Promise<{
  success: boolean;
  notification?: any;
}> {
  try {
    const response = await fetch(`/api/paratika/notification?merchantPaymentId=${merchantPaymentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { success: false };
    }

    const data = await response.json();
    
    if (data.notification) {
      return {
        success: data.notification.success,
        notification: data.notification
      };
    }

    return { success: false };
  } catch (error) {
    return { success: false };
  }
} 