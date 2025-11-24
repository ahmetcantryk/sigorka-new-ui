'use client';

import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import Proposals from '@/components/Dashboard/Proposals/ProposalsPage';

export default function ProposalsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Proposals />
      </div>
    </DashboardLayout>
  );
} 