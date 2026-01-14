
import { Suspense } from 'react';
import DashboardClient from '@/components/dashboard/DashboardClient';
import { getOrders, getStats } from '@/lib/api/orders';
import { getActiveStaff } from '@/lib/api/staff';
import LoadingKernel from '@/components/ui/LoadingKernel';

// This is a Server Component
export default async function DashboardPage() {
  // Parallel data fetching from NestJS API
  const [orders, stats, staff] = await Promise.all([
    getOrders(),
    getStats(),
    getActiveStaff(),
  ]);

  return (
    <main className="p-4 md:p-8 max-w-7xl mx-auto space-y-10">
      <Suspense fallback={<LoadingKernel />}>
        <DashboardClient 
          initialOrders={orders} 
          initialStats={stats} 
          staff={staff} 
        />
      </Suspense>
    </main>
  );
}
