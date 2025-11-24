'use client';

import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import Policies from '@/components/Dashboard/Policies/PoliciesPage';

export default function PoliciesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Policies />
      </div>
    </DashboardLayout>
  );
} 