'use client';

import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import UserProfile from '@/components/Dashboard/UserProfile/UserProfile';

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <UserProfile />
      </div>
    </DashboardLayout>
  );
} 