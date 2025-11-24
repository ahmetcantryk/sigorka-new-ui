import { API_BASE_URL } from '@/config/api';

export interface InsurUpPurchaseRequest {
  proposalId: string;
  proposalProductId: string;
  installmentNumber: number;
  $type?: string;
  card: {
    number: string;
    cvc: string;
    expiryMonth: string;
    expiryYear: string;
    holderName: string;
  };
}

export interface InsurUpPurchaseResponse {
  success: boolean;
  policyNumber?: string;
  message?: string;
  error?: string;
  data?: {
    policyId: string;
    policyNumber: string;
    status: string;
    createdDate: string;
    premium: number;
  };
}

/**
 * InsurUp API üzerinden kredi kartı ile poliçe satın alma işlemi
 */
export async function purchaseWithCreditCard(
  proposalId: string,
  proposalProductId: string,
  purchaseData: InsurUpPurchaseRequest,
  accessToken: string
): Promise<InsurUpPurchaseResponse> {
  try {

    const response = await fetch(
      `${API_BASE_URL}/api/proposals/${proposalId}/products/${proposalProductId}/purchase/sync`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
  $type: 'credit-card',
          ...purchaseData
        
        }),
      }
    );


    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'API request failed' }));
      
      throw new Error(
        errorData.message || 
        errorData.error || 
        `InsurUp API error: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    return {
      success: true,
      ...result
    };

  } catch (error) {
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'InsurUp API çağrısı başarısız',
    };
  }
}

/**
 * Paratika 3D doğrulama sonrası InsurUp API'sine ödeme tamamlama
 */
export async function completePaymentAfter3D(
  proposalId: string,
  proposalProductId: string,
  paymentData: {
    installmentNumber: number;
    merchantPaymentId: string;
    paratikaTransactionResult: any;
    cardInfo: {
      number: string;
      cvc: string;
      expiryMonth: string;
      expiryYear: string;
      holderName: string;
    };
  },
  accessToken: string
): Promise<InsurUpPurchaseResponse> {
  
  // Paratika 3D doğrulama başarılı olduğuna göre normal satın alma API'sini çağır
  const purchaseRequest: InsurUpPurchaseRequest = {
    proposalId,
    proposalProductId,
    installmentNumber: paymentData.installmentNumber,
    card: paymentData.cardInfo
  };


  return await purchaseWithCreditCard(
    proposalId,
    proposalProductId,
    purchaseRequest,
    accessToken
  );
} 