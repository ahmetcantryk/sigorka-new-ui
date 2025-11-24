'use client';

import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import Assets from '@/components/Dashboard/Assets/AssetsPage';

export default function AssetsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Assets />
      </div>
    </DashboardLayout>
  );
} 