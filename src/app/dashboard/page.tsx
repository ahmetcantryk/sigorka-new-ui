'use client';

import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/giris-yap');
    }
  }, [isAuthenticated, router]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Hoş Geldiniz</h1>
        <p className="text-gray-600">
          Sigorka hesabınızı buradan yönetebilirsiniz.
        </p>
      </div>
    </DashboardLayout>
  );
} 