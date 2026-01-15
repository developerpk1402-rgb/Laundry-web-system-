
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  ShoppingBag, 
  CheckCircle2, 
  Truck, 
  Zap, 
  Waves,
  ArrowUpRight
} from 'lucide-react';
import { Order, User } from '@/types';

interface DashboardClientProps {
  initialOrders: Order[];
  initialStats: any;
  staff: User[];
}

export default function DashboardClient({ initialOrders = [], initialStats = {}, staff = [] }: DashboardClientProps) {
  const stats = [
    { label: 'Received', value: initialStats?.received || 0, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'In Process', value: initialStats?.processing || 0, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Completed', value: initialStats?.completed || 0, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Delivered', value: initialStats?.delivered || 0, icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-[0.3em]">
            <Waves size={16} /> Operational Command
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none italic">
            Dashboard <span className="text-blue-600">Overview</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring cluster throughput and unit performance.</p>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
           {['24H', '7D', '30D'].map(period => (
             <button key={period} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${period === '24H' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
               {period}
             </button>
           ))}
        </div>
      </div>

      {/* Stats Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative group overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} -mr-16 -mt-16 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>
            <div className="flex items-center justify-between mb-8">
              <div className={`${stat.bg} p-4 rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-12`}>
                <stat.icon size={24} className={stat.color} />
              </div>
              <ArrowUpRight className="text-slate-200 dark:text-slate-700 group-hover:text-blue-500 transition-colors" size={20} />
            </div>
            <h3 className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">{stat.label}</h3>
            <p className="text-4xl font-black mt-2 text-slate-900 dark:text-white tracking-tighter">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
         <div className="xl:col-span-8 space-y-8">
            <div className="bg-[#020617] rounded-[3.5rem] p-10 md:p-12 text-white shadow-2xl border border-white/5 relative overflow-hidden group">
               <div className="absolute inset-0 opacity-20 scan-line pointer-events-none"></div>
               <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                  <div className="space-y-4">
                     <div className="px-4 py-1 bg-white/10 rounded-full w-fit border border-white/10">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Total Valuation</span>
                     </div>
                     <h2 className="text-6xl md:text-8xl font-black tracking-tighter italic leading-none">
                        RD$ {(initialStats?.revenue || 0).toLocaleString()}
                     </h2>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Growth Factor</p>
                     <div className="flex items-center gap-3 text-emerald-400 font-black text-2xl">
                        <TrendingUp size={24} /> +18.4%
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-10">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black dark:text-white italic tracking-tighter">Real-time Pipeline</h3>
                  <button className="text-[10px] font-black uppercase text-blue-600 hover:underline tracking-widest">Global Feed</button>
               </div>
               <div className="space-y-4">
                  {(initialOrders || []).map((order, idx) => (
                    <motion.div 
                      key={order.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all flex items-center justify-between group cursor-pointer"
                    >
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-blue-600 italic border border-slate-100 dark:border-slate-700 shadow-sm">
                             {order.customerName?.[0] || 'O'}
                          </div>
                          <div>
                             <p className="font-black dark:text-white leading-none group-hover:text-blue-500 transition-colors">{order.customerName}</p>
                             <p className="text-[10px] font-mono text-slate-400 font-bold uppercase mt-1 tracking-widest">{order.code}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="font-black dark:text-white">RD$ {(order.total || 0).toFixed(0)}</p>
                          <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{order.status}</span>
                       </div>
                    </motion.div>
                  ))}
                  {(!initialOrders || initialOrders.length === 0) && (
                    <div className="py-20 text-center text-slate-400">
                      <ShoppingBag className="mx-auto mb-4 opacity-10" size={48} />
                      <p className="font-bold text-xs uppercase tracking-widest">No active units in pipeline</p>
                    </div>
                  )}
               </div>
            </div>
         </div>

         <div className="xl:col-span-4 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-10">
            <h3 className="text-xl font-black dark:text-white italic mb-8">Active Staff</h3>
            <div className="space-y-3">
               {(staff || []).map(u => (
                 <div key={u.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black">
                          {u.username?.[0] || 'U'}
                       </div>
                       <div>
                          <p className="font-bold text-sm dark:text-white">{u.username}</p>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{u.role}</p>
                       </div>
                    </div>
                    {u.isActive && <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
