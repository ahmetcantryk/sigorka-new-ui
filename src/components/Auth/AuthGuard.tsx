'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const publicPaths = ['/giris-yap', '/kayit-ol', '/kvkk', '/acik-riza-metni'];

// Private sayfaları tanımla
const privatePaths = [
  '/dashboard',
  '/dashboard/profile',
  '/dashboard/assets',
  '/dashboard/policies',
  '/dashboard/claims',
  '/dashboard/settings',
  '/purchase',

];

export default function AuthGuard({ children, requireAuth = false }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, accessToken } = useAuthStore();

  useEffect(() => {
    const isPrivatePath = privatePaths.some(path => pathname?.startsWith(path));

    if (isPrivatePath && !isAuthenticated) {
      // Kullanıcı giriş yapmamış ve özel bir sayfaya erişmeye çalışıyor
      router.push(`/giris-yap?redirect=${encodeURIComponent(pathname || '')}`);
    }
  }, [isAuthenticated, pathname, router]);

  // Token kontrolü
  useEffect(() => {
    if (isAuthenticated && !accessToken) {
      // Token yok ama kullanıcı authenticated görünüyor
      useAuthStore.getState().logout();
      router.push('/giris-yap');
    }
  }, [isAuthenticated, accessToken, router]);

  return <>{children}</>;
} 