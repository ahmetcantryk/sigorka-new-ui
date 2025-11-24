import { NextRequest, NextResponse } from 'next/server';
import { paratikaServerService } from '@/services/paratikaServer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionToken, cardInfo } = body;

    // Input validation
    if (!sessionToken || !cardInfo) {
      return NextResponse.json(
        { error: 'Session token ve kart bilgileri gerekli' },
        { status: 400 }
      );
    }

    const { cardNumber, cardHolder, expiryMonth, expiryYear, cvv, callbackUrl } = cardInfo;

    if (!cardNumber || !cardHolder || !expiryMonth || !expiryYear || !cvv) {
      return NextResponse.json(
        { error: 'Tüm kart bilgileri gerekli' },
        { status: 400 }
      );
    }


    // Callback URL'i güvenli şekilde oluştur
    let safeCallbackUrl;
    try {
      const protocol = request.nextUrl?.protocol || 'https:';
      const host = request.nextUrl?.host || 'sigorka.com';
      
      // Development detection için port kontrolü
      const isDevelopment = host.includes('localhost') || host.includes('127.0.0.1');
      
      if (isDevelopment) {
        // Development ortamında doğru port'u tespit et
        const port = request.nextUrl?.port || '3001'; // Default port 3001
        safeCallbackUrl = `${protocol}//${host}:${port}/api/paratika/callback`;
      } else {
        // Production ortamında
        safeCallbackUrl = `${protocol}//${host}/api/paratika/callback`;
      }
      
    } catch (error) {
      safeCallbackUrl = 'https://sigorka.com/api/paratika/callback';
    }
    
    const finalCallbackUrl = callbackUrl || safeCallbackUrl;
    
    
    // URL'i validate et
    try {
      new URL(finalCallbackUrl);
    } catch (urlError) {
      // Fallback URL kullan
      const fallbackUrl = 'https://sigorka.com/api/paratika/callback';
    }

    // Güvenli server-side service kullan
    const result = await paratikaServerService.initiate3DPayment(sessionToken, {
      pan: cardNumber,
      cardOwner: cardHolder,
      expiryMonth: expiryMonth.toString().padStart(2, '0'),
      expiryYear: expiryYear.toString(),
      cvv: cvv,
      callbackUrl: finalCallbackUrl
    });


    // HTML içeriği kontrolü
    if (!result.html || result.html.trim() === '') {
      return NextResponse.json(
        { 
          error: 'Banka 3D doğrulama sayfası oluşturulamadı',
          details: 'Paratika\'dan boş yanıt geldi'
        },
        { status: 500 }
      );
    }

    // Paratika 3D doğrulama HTML'ini döner
    return NextResponse.json({
      success: true,
      html: result.html,
      isRedirect: result.isRedirect,
    });

  } catch (error: any) {

    return NextResponse.json(
      { 
        error: '3D güvenli doğrulama başlatılamadı',
        message: error.message 
      },
      { status: 500 }
    );
  }
} 