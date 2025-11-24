import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // FormData olarak gelen verileri handle et
    let body: any = {};
    
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      // Form data olarak gelmiş
      const formData = await request.formData();
      formData.forEach((value, key) => {
        body[key] = value;
      });
    } else if (contentType.includes('application/json')) {
      // JSON olarak gelmiş
      body = await request.json();
    } else {
      // Raw text olarak dene
      const rawText = await request.text();
      
      // URL encoded text'i parse et
      if (rawText) {
        const urlParams = new URLSearchParams(rawText);
        urlParams.forEach((value, key) => {
          body[key] = value;
        });
      }
    }
    
    
    const {
      sessionToken,
      responseCode,
      responseMsg,
      allowedUrl,
      auth3DToken,
      mdStatus,
      mdErrorMsg,
      merchantPaymentId,
      orderId,
      amount,
      currency,
      transactionId,
      authCode,
      procReturnCode,
      paresTxStatus,
      TRANID,
      oid,
      md,
      signature,
      maskedCreditCard,
      MERCHANTPAYMENTID
    } = body;

    // merchantPaymentId'yi farklı field'lardan bul
    const finalMerchantPaymentId = merchantPaymentId || MERCHANTPAYMENTID || orderId || oid;

    // Sonucu değerlendir
    const isSuccess = (
      (responseCode === '00' || !responseCode) && 
      (mdStatus === '1' || paresTxStatus === 'Y')
    );

    const callbackResult = {
      sessionToken,
      responseCode: responseCode || '00',
      responseMsg: responseMsg || 'Success',
      allowedUrl,
      auth3DToken,
      mdStatus,
      mdErrorMsg,
      merchantPaymentId: finalMerchantPaymentId,
      orderId: orderId || oid,
      amount,
      currency,
      transactionId: transactionId || TRANID,
      authCode,
      procReturnCode,
      paresTxStatus,
      signature,
      maskedCreditCard,
      timestamp: new Date().toISOString(),
      success: isSuccess,
      rawData: body
    };

    // Global storage'a kaydet
    (global as any).paratikaCallbacks = (global as any).paratikaCallbacks || new Map();
    (global as any).paratikaCallbacks.set(finalMerchantPaymentId || sessionToken, callbackResult);


    // 🔥 Browser'dan gelip gelmedğini kontrol et (User-Agent header'ı)
    const userAgent = request.headers.get('user-agent') || '';
    const isFromBrowser = userAgent.includes('Mozilla') || userAgent.includes('Chrome') || userAgent.includes('Safari');
    
    
    // Browser'dan geliyorsa redirect yap, sunucudan geliyorsa JSON response döndür
    if (isFromBrowser && (responseCode || mdStatus)) {
      // Bu bir browser callback'i, verify sayfasına redirect et
      
      // Redirect URL'ini oluştur
      const verifyUrl = new URL('/odeme/paratika-3d-verify', request.url);
      
      // Tüm parametreleri URL'e ekle
      Object.keys(body).forEach(key => {
        if (body[key] && typeof body[key] === 'string') {
          verifyUrl.searchParams.set(key, body[key]);
        }
      });
      
      // Success bilgisini de ekle
      verifyUrl.searchParams.set('success', isSuccess ? '1' : '0');
      
      
      return NextResponse.redirect(verifyUrl.toString(), 302);
    }
    
    // Server-to-server callback (JSON response döndür)
    
    return NextResponse.json({
      success: isSuccess,
      message: isSuccess ? 'Ödeme başarılı' : 'Ödeme başarısız',
      data: callbackResult
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Callback processing failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

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
    
    // 🎯 Paratika success3d/fail3d URL'lerini kontrol et
    const requestUrl = request.url || '';
    
    if (requestUrl.includes('success3d')) {
      
      // Success callback'i kaydet
      const callbackResult = {
        success: true,
        responseCode: '00',
        responseMsg: 'Success3D detected',
        merchantPaymentId: merchantPaymentId || 'success3d_detected',
        timestamp: new Date().toISOString(),
        source: 'success3d_url'
      };
      
      // Global storage'a kaydet
      (global as any).paratikaCallbacks = (global as any).paratikaCallbacks || new Map();
      (global as any).paratikaCallbacks.set(merchantPaymentId || 'success3d_detected', callbackResult);
      
      // Verify sayfasına yönlendir
      try {
        return NextResponse.redirect(new URL('/odeme/paratika-3d-verify?success=1', request.url), 302);
      } catch (urlError) {
        return NextResponse.redirect('https://sigorka.com/odeme/paratika-3d-verify?success=1', 302);
      }
    }
    
    if (requestUrl.includes('fail3d')) {
      
      // Fail callback'i kaydet
      const callbackResult = {
        success: false,
        responseCode: '01',
        responseMsg: 'Fail3D detected',
        merchantPaymentId: merchantPaymentId || 'fail3d_detected',
        timestamp: new Date().toISOString(),
        source: 'fail3d_url'
      };
      
      // Global storage'a kaydet
      (global as any).paratikaCallbacks = (global as any).paratikaCallbacks || new Map();
      (global as any).paratikaCallbacks.set(merchantPaymentId || 'fail3d_detected', callbackResult);
      
      // Hata sayfasına yönlendir
      try {
        return NextResponse.redirect(new URL('/odeme/hata?error=3D+doğrulama+başarısız', request.url), 302);
      } catch (urlError) {
        return NextResponse.redirect('https://sigorka.com/odeme/hata?error=3D+doğrulama+başarısız', 302);
      }
    }
    
    // Query string'den parametreleri al
    const sessionToken = searchParams.get('sessionToken');
    const responseCode = searchParams.get('responseCode');
    const responseMsg = searchParams.get('responseMsg');
    const allowedUrl = searchParams.get('allowedUrl');
    const auth3DToken = searchParams.get('auth3DToken');
    const mdStatus = searchParams.get('mdStatus');
    const mdErrorMsg = searchParams.get('mdErrorMsg');
    const orderId = searchParams.get('orderId');
    const amount = searchParams.get('amount');
    const currency = searchParams.get('currency');


    const callbackResult = {
      sessionToken,
      responseCode,
      responseMsg,
      allowedUrl,
      auth3DToken,
      mdStatus,
      mdErrorMsg,
      merchantPaymentId,
      orderId,
      amount,
      currency,
      timestamp: new Date().toISOString(),
      success: responseCode === '00' && mdStatus === '1'
    };

    // Geçici storage
    (global as any).paratikaCallbacks = (global as any).paratikaCallbacks || new Map();
    (global as any).paratikaCallbacks.set(merchantPaymentId || sessionToken, callbackResult);


    // Başarılı ise kullanıcıyı success sayfasına yönlendir
    if (callbackResult.success) {
      try {
        return NextResponse.redirect(new URL('/odeme/paratika-3d-verify?success=1', request.url), 302);
      } catch (urlError) {
        return NextResponse.redirect('https://sigorka.com/odeme/paratika-3d-verify?success=1', 302);
      }
    } else {
      try {
        return NextResponse.redirect(new URL('/odeme/hata', request.url), 302);
      } catch (urlError) {
        return NextResponse.redirect('https://sigorka.com/odeme/hata', 302);
      }
    }

  } catch (error) {
    try {
      return NextResponse.redirect(new URL('/odeme/hata', request.url), 302);
    } catch (urlError) {
      return NextResponse.redirect('https://sigorka.com/odeme/hata', 302);
    }
  }
} 