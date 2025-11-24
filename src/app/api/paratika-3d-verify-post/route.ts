import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    
    // POST body'sini parse et
    const formData = await request.formData();
    const body: Record<string, string> = {};
    
    formData.forEach((value, key) => {
      if (typeof value === 'string') {
        body[key] = value;
      }
    });
    
    
    // Verify sayfasına redirect et (GET request olarak)
    const verifyUrl = new URL('/odeme/paratika-3d-verify', request.url);
    
    // POST verilerini URL parametresi olarak ekle
    Object.keys(body).forEach(key => {
      if (body[key]) {
        verifyUrl.searchParams.set(key, body[key]);
      }
    });
    
    
    return NextResponse.redirect(verifyUrl.toString());
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'POST handling failed' },
      { status: 500 }
    );
  }
} 