import { NextRequest, NextResponse } from 'next/server';
import { paratikaServerService } from '@/services/paratikaServer';

export async function POST(request: NextRequest) {
  try {
    
    const body = await request.json();
    const { merchantPaymentId } = body;
    
    if (!merchantPaymentId) {
      return NextResponse.json(
        { error: 'merchantPaymentId gerekli' },
        { status: 400 }
      );
    }
    
    
    // Güvenli server-side service kullan
    const responseData = await paratikaServerService.queryTransaction(merchantPaymentId);
    
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Sunucu hatası', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
} 