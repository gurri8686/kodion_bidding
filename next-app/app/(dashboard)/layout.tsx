'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/store/hooks';
import Sidebar from '@/components/dashboard/Sidebar';
import NotificationBell from '@/components/NotificationBell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    // Check if user is authenticated
    if (!token || !user) {
      router.push('/login');
    }
  }, [token, user, router]);

  // Don't render dashboard if not authenticated
  if (!token || !user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="absolute top-4 right-6 z-20">
          <NotificationBell />
        </div>
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
