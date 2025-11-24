import axios from 'axios';

// Server-side Paratika yapılandırması - sadece backend'de erişilebilir
const PARATIKA_CONFIG = {
  BASE_URL: process.env.PARATIKA_BASE_URL || 'https://test.paratika.com.tr',
  API_ENDPOINT: '/paratika/api/v2',
  // Paratika Test Kimlik Bilgileri (resmi test ortamı)
  MERCHANT_USER: process.env.PARATIKA_MERCHANT_USER || 'testmerchant@paratika.com.tr',
  MERCHANT_PASSWORD: process.env.PARATIKA_MERCHANT_PASSWORD || 'test123',
  MERCHANT_ID: process.env.PARATIKA_MERCHANT_ID || '700100000',
  RETURN_URL: process.env.PARATIKA_RETURN_URL || 'https://sigorka.com/api/paratika/callback'
};

// Kimlik bilgilerini kontrol et
if (!PARATIKA_CONFIG.MERCHANT_USER || !PARATIKA_CONFIG.MERCHANT_PASSWORD || !PARATIKA_CONFIG.MERCHANT_ID) {
}

export interface ParatikaSessionResponse {
  sessionToken: string;
  responseCode: string;
  responseMsg: string;
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

export class ParatikaServerService {
  private baseUrl: string;
  private apiEndpoint: string;

  constructor() {
    this.baseUrl = PARATIKA_CONFIG.BASE_URL;
    this.apiEndpoint = PARATIKA_CONFIG.API_ENDPOINT;
    
    // Null/undefined kontrolü
    if (!this.baseUrl || !this.apiEndpoint) {
      throw new Error('Paratika BASE_URL veya API_ENDPOINT tanımlı değil');
    }
    
    // URL validation
    try {
      new URL(`${this.baseUrl}${this.apiEndpoint}`);
    } catch (urlError) {
      throw new Error('Paratika URL geçersiz format');
    }
    
    // Debug: Configuration kontrolü
  }

  /**
   * Paratika session token oluşturur (server-side)
   */
  async createSessionToken(orderData: {
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
    const requestBody = new URLSearchParams();
    
    requestBody.append('ACTION', 'SESSIONTOKEN');
    requestBody.append('MERCHANTUSER', PARATIKA_CONFIG.MERCHANT_USER);
    requestBody.append('MERCHANTPASSWORD', PARATIKA_CONFIG.MERCHANT_PASSWORD);
    requestBody.append('MERCHANT', PARATIKA_CONFIG.MERCHANT_ID);
    requestBody.append('SESSIONTYPE', 'PAYMENTSESSION');
    requestBody.append('RETURNURL', PARATIKA_CONFIG.RETURN_URL);
    requestBody.append('MERCHANTPAYMENTID', orderData.orderId);
    requestBody.append('AMOUNT', orderData.amount.toString());
    requestBody.append('CURRENCY', 'TRY');
    requestBody.append('CUSTOMER', orderData.customerInfo.id);
    requestBody.append('CUSTOMERNAME', orderData.customerInfo.name);
    requestBody.append('CUSTOMEREMAIL', orderData.customerInfo.email);
    requestBody.append('CUSTOMERPHONE', orderData.customerInfo.phone);
    requestBody.append('CUSTOMERIP', orderData.customerInfo.ip);
    requestBody.append('CUSTOMERUSERAGENT', orderData.customerInfo.userAgent);
    
    // Order items'ı JSON string olarak encode ediyoruz
    const orderItemsJson = JSON.stringify(orderData.orderItems);
    requestBody.append('ORDERITEMS', encodeURIComponent(orderItemsJson));
    requestBody.append('DISCOUNTAMOUNT', '0.00');
    
    // Billing address
    requestBody.append('BILLTOADDRESSLINE', orderData.billingAddress.addressLine);
    requestBody.append('BILLTOCITY', orderData.billingAddress.city);
    requestBody.append('BILLTOCOUNTRY', 'TUR');
    requestBody.append('BILLTOPOSTALCODE', orderData.billingAddress.postalCode);
    
    // Shipping address
    requestBody.append('SHIPTOADDRESSLINE', orderData.shippingAddress.addressLine);
    requestBody.append('SHIPTOCITY', orderData.shippingAddress.city);
    requestBody.append('SHIPTOCOUNTRY', 'TUR');
    requestBody.append('SHIPTOPOSTALCODE', orderData.shippingAddress.postalCode);

    try {

      const response = await axios.post(
        `${this.baseUrl}${this.apiEndpoint}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 30000,
        }
      );


      return response.data as ParatikaSessionResponse;
    } catch (error) {
      throw new Error('Session token oluşturulamadı');
    }
  }

  /**
   * 3D güvenli ödeme işlemini başlatır (server-side)
   */
  async initiate3DPayment(
    sessionToken: string,
    cardInfo: {
      pan: string;
      cardOwner: string;
      expiryMonth: string;
      expiryYear: string;
      cvv: string;
      cardCutoffDay?: string;
      callbackUrl: string;
    }
  ): Promise<{ html: string; isRedirect: boolean; directUrl?: string }> {
    const requestBody = new URLSearchParams();
    
    requestBody.append('pan', cardInfo.pan);
    requestBody.append('cardOwner', cardInfo.cardOwner);
    requestBody.append('expiryMonth', cardInfo.expiryMonth);
    requestBody.append('expiryYear', cardInfo.expiryYear);
    requestBody.append('cvv', cardInfo.cvv);
    if (cardInfo.cardCutoffDay) {
      requestBody.append('cardCutoffDay', cardInfo.cardCutoffDay);
    }
    requestBody.append('callbackUrl', cardInfo.callbackUrl);


    try {
      const directUrl = `https://vpos.paratika.com.tr/paratika/api/v2/post/auth3d/${sessionToken}`;
      
      const response = await axios.post(
        directUrl,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 30000,
        }
      );


      // HTML içeriğini döndür
      const htmlContent = response.data;
      
      if (typeof htmlContent !== 'string' || htmlContent.length < 100) {
        throw new Error('Paratika\'dan geçersiz response alındı');
      }

      return {
        html: htmlContent,
        isRedirect: true,
        directUrl: directUrl
      };
      
    } catch (error) {
      throw new Error('3D güvenli ödeme başlatılamadı: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Transaction durumunu sorgular (server-side)
   */
  async queryTransaction(merchantPaymentId: string): Promise<ParatikaTransactionResponse> {
    // 🔥 Environment variable kontrolü
    if (!PARATIKA_CONFIG.MERCHANT_USER || !PARATIKA_CONFIG.MERCHANT_PASSWORD || !PARATIKA_CONFIG.MERCHANT_ID) {
      const missingVars = [];
      if (!PARATIKA_CONFIG.MERCHANT_USER) missingVars.push('PARATIKA_MERCHANT_USER');
      if (!PARATIKA_CONFIG.MERCHANT_PASSWORD) missingVars.push('PARATIKA_MERCHANT_PASSWORD');
      if (!PARATIKA_CONFIG.MERCHANT_ID) missingVars.push('PARATIKA_MERCHANT_ID');
      
      throw new Error(`PARATIKA kimlik bilgileri eksik: ${missingVars.join(', ')}. .env.local dosyasında bu değişkenleri tanımlayın.`);
    }

    const requestBody = new URLSearchParams();
    
    requestBody.append('ACTION', 'QUERYTRANSACTION');
    requestBody.append('MERCHANT', PARATIKA_CONFIG.MERCHANT_ID);
    requestBody.append('MERCHANTUSER', PARATIKA_CONFIG.MERCHANT_USER);
    requestBody.append('MERCHANTPASSWORD', PARATIKA_CONFIG.MERCHANT_PASSWORD);
    requestBody.append('MERCHANTPAYMENTID', merchantPaymentId);

    // 🔥 URL güvenlik kontrolü
    const fullUrl = `${this.baseUrl}${this.apiEndpoint}`;
    try {
      new URL(fullUrl);
    } catch (urlError) {
      throw new Error('Paratika API URL geçersiz format');
    }
    

    try {
      const response = await axios.post(
        fullUrl,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: 30000,
        }
      );


      return response.data as ParatikaTransactionResponse;
    } catch (error) {
      
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          throw new Error('Paratika API zaman aşımına uğradı. Lütfen tekrar deneyin.');
        }
        if (error.message.includes('Network Error') || error.message.includes('ENOTFOUND')) {
          throw new Error('Paratika API\'sine bağlanılamadı. İnternet bağlantınızı kontrol edin.');
        }
      }
      
      throw new Error('Transaction sorgulanamadı: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    }
  }
}

export const paratikaServerService = new ParatikaServerService(); 