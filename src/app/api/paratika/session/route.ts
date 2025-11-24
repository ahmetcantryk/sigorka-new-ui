import { NextRequest, NextResponse } from 'next/server';
import { paratikaServerService } from '@/services/paratikaServer';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    

    // Güvenli server-side Paratika service üzerinden session token oluştur
    const sessionResponse = await paratikaServerService.createSessionToken(orderData);
    

    return NextResponse.json(sessionResponse);
    
  } catch (error) {
    
    const errorMessage = error instanceof Error ? error.message : 'Session token oluşturulamadı';
    
    return NextResponse.json(
      { 
        error: errorMessage,
        responseCode: '99',
        responseMsg: errorMessage
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
} 