'use client';

import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import HelpPage from '@/components/Dashboard/Help/HelpPage';

export default function HelpPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">Yardım ve Destek</h1>
        <HelpPage />
      </div>
    </DashboardLayout>
  );
} 