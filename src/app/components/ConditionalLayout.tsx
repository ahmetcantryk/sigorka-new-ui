'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from '../../apollo/client';
import { AgencyConfigProvider } from '@/context/AgencyConfigProvider';
import ClientLayout from './common/ClientLayout';
import Header from './common/Header';
import Footer from './common/Footer';
import GoToTopButton from './common/GoToTopButton';
import AuthGuard from '../../components/Auth/AuthGuard';
import LoaderController from './LoaderController';
import Script from 'next/script';

interface ConditionalLayoutProps {
  children: ReactNode;
}

const CLIENT_ONLY_PATHS = [
  '/dashboard',
  '/giris-yap',
  '/purchase',
  '/odeme',
  '/satin-al',
  '-teklif',
  'quote-comparison',
  '/kasko',
  '/trafik',
  '/konut',
  '/dask',
  '/imm',
  '/tss',
  '/saglik',
  '/acil-saglik',
  '/zorunlu-trafik-sigortasi',
  '/kasko-sigortasi',
  '/tamamlayici-saglik-sigortasi',
  '/konut-sigortasi',
  // Offline flow sayfaları
  '/ferdi-kaza-sigortasi',
  '/ozel-saglik-sigortasi',
  '/yabanci-saglik-sigortasi',
  '/seyahat-saglik-sigortasi',
];

const PROTECTED_PATHS = [
  '/dashboard'
];

const CLEAN_PAGES = [
  '/yuvamguvende'
];

function isClientOnlyPath(pathname: string): boolean {
  return CLIENT_ONLY_PATHS.some(path => 
    path.startsWith('/') ? pathname.startsWith(path) : pathname.includes(path)
  );
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATHS.some(path => pathname.startsWith(path));
}

function isCleanPage(pathname: string): boolean {
  return CLEAN_PAGES.some(path => pathname.startsWith(path));
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const needsClientProviders = isClientOnlyPath(pathname);
  const needsAuth = isProtectedPath(pathname);
  const isClean = isCleanPage(pathname);

  // Temiz sayfalar için hiçbir layout uygulamadan direkt children render et
  if (isClean) {
    return <>{children}</>;
  }

  if (needsClientProviders) {
    return (
      <ApolloProvider client={client}>
        <AgencyConfigProvider>
          <ClientLayout>
            <Header />
            {needsAuth ? (
              <AuthGuard>
                {children}
              </AuthGuard>
            ) : (
              children
            )}
            <Footer />
            <GoToTopButton />
          </ClientLayout>
        </AgencyConfigProvider>
        <Script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" />
        <Script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js" />
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.min.js" />
      </ApolloProvider>
    );
  }

  return (
    <>
      <LoaderController />
      <div className="overlay-loader">
        <div className="loader"></div>
      </div>
      <Header />
      <main>
        {children}
      </main>
      <Footer />
      <GoToTopButton />
      <Script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" />
      <Script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.1/dist/umd/popper.min.js" />
      <Script src="https://cdn.jsdelivr.net/npm/bootstrap@4.5.3/dist/js/bootstrap.min.js" />
    </>
  );
}