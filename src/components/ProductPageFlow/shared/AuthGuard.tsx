/**
 * AuthGuard
 * 
 * Authentication kontrolü yapan guard component
 * Login olmayan kullanıcıları giriş sayfasına yönlendirir
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const router = useRouter();
  const { accessToken, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (requireAuth && !isAuthenticated && !accessToken) {
      console.log('🔒 AuthGuard: Kullanıcı login değil, /giris-yap\'a yönlendiriliyor...');
      router.push('/giris-yap');
    }
  }, [requireAuth, isAuthenticated, accessToken, router]);

  // Auth gerekli ama kullanıcı login değilse null döndür
  if (requireAuth && !isAuthenticated && !accessToken) {
    return null;
  }

  // Auth gerekli değilse veya kullanıcı login ise children'ı render et
  return <>{children}</>;
};

export default AuthGuard;





