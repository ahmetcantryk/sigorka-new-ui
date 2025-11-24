import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Başarılı 3D callback'i simüle et
    const callbackResult = {
      sessionToken: 'gle8K1NgNwBDXOT6',
      responseCode: '00',
      responseMsg: 'Approved',
      auth3DToken: '6IKCX6OHAWIMYXGM',
      mdStatus: '1',
      merchantPaymentId: '0AoJoBTEO013',
      orderId: '0AoJoBTEO013',
      amount: '25408.17',
      currency: '949',
      transactionId: '0AoJoBTEO013',
      timestamp: new Date().toISOString(),
      success: true,
      source: 'test_manual'
    };

    // Global storage'a kaydet
    (global as any).paratikaCallbacks = (global as any).paratikaCallbacks || new Map();
    (global as any).paratikaCallbacks.set('0AoJoBTEO013', callbackResult);
    (global as any).paratikaCallbacks.set('gle8K1NgNwBDXOT6', callbackResult);
    

    return NextResponse.json({ 
      success: true, 
      message: 'Test callback başarıyla kaydedildi!',
      data: callbackResult,
      nextStep: 'Şimdi https://sigorka.com/odeme/paratika-3d-verify sayfasına gidin'
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error });
  }
} 