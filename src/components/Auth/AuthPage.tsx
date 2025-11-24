'use client';

import { Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import AuthForm from './AuthForm';

const AuthPage = () => {
  const router = useRouter();
  const { setTokens, setUser, setCustomerId } = useAuthStore();

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleVerificationSuccess = async (userData: any) => {
    setUser({
      id: userData.id,
      name: userData.fullName,
      email: userData.primaryEmail,
      phone: userData.primaryPhoneNumber.number,
    });
    setCustomerId(userData.id);
    router.push('/dashboard/profile');
  };

  return (
    <div className="bg-gradient-to-br flex min-h-screen items-center justify-center from-primary/10 to-white p-4 pt-24">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex cursor-pointer justify-center" onClick={handleLogoClick}>
          <div className="mb-4 inline-block rounded-full bg-white p-3 shadow-md">
            <Shield className="text-primary h-16 w-16" />
          </div>
        </div>

        {/* Welcome Text */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Hesabınıza Giriş Yapın</h1>
          <p className="text-gray-600">
            Giriş yapmak veya üye olmak için aşağıdaki alanları doldurunuz.
          </p>
        </div>

        {/* Auth Form */}
        <AuthForm onSuccess={handleVerificationSuccess} />
      </div>
    </div>
  );
};

export default AuthPage;
