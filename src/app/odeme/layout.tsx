'use client';

import React from 'react';
import { AgencyConfigProvider } from '@/context/AgencyConfigProvider';
import Script from 'next/script';

export default function OdemeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AgencyConfigProvider>
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {children}
      </div>
      
      {/* Gerekli script'ler */}
      <Script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" />
      <Script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js" />
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.min.js" />
    </AgencyConfigProvider>
  );
} 