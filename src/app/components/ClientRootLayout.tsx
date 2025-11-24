'use client';

import { AgencyConfigProvider } from '@/context/AgencyConfigProvider';
import ClientLayout from './common/ClientLayout';
import Header from './common/Header';
import Footer from './common/Footer';
import Script from 'next/script';
import "../globals.css"

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AgencyConfigProvider>
        <ClientLayout>
          <Header />
          {children}
          <Footer />
        </ClientLayout>
      </AgencyConfigProvider>
      <Script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" />
      <Script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js" />
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.min.js" />
    </>
  );
} 