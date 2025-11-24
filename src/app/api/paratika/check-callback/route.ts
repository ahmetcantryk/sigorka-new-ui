import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    let searchParams;
    try {
      const url = new URL(request.url);
      searchParams = url.searchParams;
    } catch (urlError) {
      searchParams = new URLSearchParams();
    }
    
    const merchantPaymentId = searchParams.get('merchantPaymentId');
    const sessionToken = searchParams.get('sessionToken');
    
    if (!merchantPaymentId && !sessionToken) {
      return NextResponse.json({
        success: false,
        error: 'merchantPaymentId veya sessionToken gerekli'
      }, { status: 400 });
    }


    // Global storage'dan kontrol et
    const globalCallbacks = (global as any).paratikaCallbacks || new Map();
    
    // Önce merchantPaymentId ile ara
    let callbackData = null;
    if (merchantPaymentId) {
      callbackData = globalCallbacks.get(merchantPaymentId);
    }
    
    // Bulunamazsa sessionToken ile ara
    if (!callbackData && sessionToken) {
      callbackData = globalCallbacks.get(sessionToken);
    }
    
    // Hala bulunamazsa tüm callback'leri kontrol et
    if (!callbackData) {
      for (const [key, value] of globalCallbacks.entries()) {
        if (value && (
          (merchantPaymentId && key.includes(merchantPaymentId)) ||
          (sessionToken && (key === sessionToken || value.sessionToken === sessionToken))
        )) {
          callbackData = value;
          break;
        }
      }
    }

    if (callbackData) {
      return NextResponse.json({
        success: true,
        data: callbackData,
        source: 'global_storage'
      });
    } else {
      
      // Debug için mevcut callback'leri listele
      const allCallbacks = Array.from(globalCallbacks.entries());
      
      return NextResponse.json({
        success: false,
        message: 'Callback bulunamadı',
        debug: {
          searchedFor: { merchantPaymentId, sessionToken },
          availableCallbacks: allCallbacks.map((entry) => {
            const [key, value] = entry as [string, any];
            return {
              key,
              merchantPaymentId: value?.merchantPaymentId,
              sessionToken: value?.sessionToken,
              timestamp: value?.timestamp
            };
          })
        }
      });
    }

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Callback kontrol edilemedi'
    }, { status: 500 });
  }
} 