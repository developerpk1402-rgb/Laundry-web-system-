
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  Receipt, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, hasRole } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/', roles: Object.values(UserRole) },
    { label: 'New Order', icon: PlusCircle, path: '/new-order', roles: [UserRole.ADMIN, UserRole.SALESPERSON, UserRole.CASHIER] },
    { label: 'Order Pipeline', icon: ClipboardList, path: '/orders', roles: Object.values(UserRole) },
    { label: 'Invoicing', icon: Receipt, path: '/invoicing', roles: [UserRole.ADMIN, UserRole.CASHIER] },
    { label: 'Customers', icon: Users, path: '/customers', roles: [UserRole.ADMIN, UserRole.SALESPERSON, UserRole.CASHIER] },
    { label: 'Analytics', icon: BarChart3, path: '/reports', roles: [UserRole.ADMIN, UserRole.SPECIAL] },
    { label: 'Settings', icon: Settings, path: '/settings', roles: [UserRole.ADMIN] },
  ];

  const allowedNav = navItems.filter(item => hasRole(item.roles));

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex bg-slate-900 text-white transition-all flex-col border-r border-slate-800 z-30`}>
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center font-black italic">E</div>
          {isSidebarOpen && <span className="text-xl font-extrabold tracking-tighter">ESOFT</span>}
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {allowedNav.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.path} 
                href={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                  isActive ? 'bg-teal-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <item.icon size={22} />
                {isSidebarOpen && <span className="font-bold text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-4 text-slate-400 hover:text-red-400 transition-colors">
            <LogOut size={22} />
            {isSidebarOpen && <span className="font-bold text-sm uppercase tracking-widest">Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 z-20">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500">
                <Menu size={24} />
             </button>
             <h2 className="font-black italic text-xl dark:text-white">Terminal v4.2.5</h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-4 py-2 bg-blue-600/10 border border-blue-500/20 rounded-full text-[10px] font-black uppercase text-blue-500 tracking-widest">
                Node: {user?.branchId || 'Cluster'}
             </div>
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 shadow-lg"></div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
           {children}
        </div>
      </main>
    </div>
  );
}
