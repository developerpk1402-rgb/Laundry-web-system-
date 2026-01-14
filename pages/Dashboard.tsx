
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Truck,
  TrendingUp,
  Activity,
  Users,
  ShieldCheck,
  Zap,
  Waves,
  History,
  Terminal,
  ChevronRight,
  HardDrive,
  CloudLightning,
  RefreshCw
} from 'lucide-react';
import { Order, OrderStatus, Branch, User, UserRole, AuditLog } from '../types';
import { getOrders } from '../services/orderService';
import { getEmployeesByBranch, isEmployeeOnDuty } from '../services/userService';
import { getAuditLogs } from '../services/auditService';
import { getSystemHealth } from '../lib/api/system';
import { isToday, isThisMonth, isThisYear, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

type TimeRange = 'today' | 'month' | 'year';

const Dashboard: React.FC<{ branch: Branch, user: User }> = ({ branch, user }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [systemStatus, setSystemStatus] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Fix: Await getOrders() and then filter the results.
      const allOrders = await getOrders();
      setOrders(allOrders.filter(o => o.branch === branch.name));
      try {
        const logs = await getAuditLogs();
        setAuditLogs(logs.slice(0, 5));
        
        const health = await getSystemHealth();
        setSystemStatus(health);
      } catch (err) {
        console.error("Dashboard: Error fetching system data", err);
      }
      if (user.role === UserRole.ADMIN) {
        // Fix: Await getEmployeesByBranch() call.
        const branchStaff = await getEmployeesByBranch(branch.id);
        setStaff(branchStaff);
      }
    };
    
    fetchData();
    const handleAuditUpdate = () => fetchData();
    window.addEventListener('audit_updated', handleAuditUpdate);
    return () => window.removeEventListener('audit_updated', handleAuditUpdate);
  }, [branch, user]);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const date = new Date(order.datePlaced);
      if (isNaN(date.getTime())) return true;
      if (timeRange === 'today') return isToday(date);
      if (timeRange === 'month') return isThisMonth(date);
      if (timeRange === 'year') return isThisYear(date);
      return true;
    });
  }, [orders, timeRange]);

  const stats = [
    { label: 'Received', value: filteredOrders.filter(o => o.status === OrderStatus.RECEIVED).length, icon: ShoppingBag, color: 'text-blue-500', bg: 'bg-blue-500/10', status: OrderStatus.RECEIVED },
    { label: 'Processing', value: filteredOrders.filter(o => o.status === OrderStatus.IN_PROCESS).length, icon: Zap, color: 'text-amber-500', bg: 'bg-amber-500/10', status: OrderStatus.IN_PROCESS },
    { label: 'Completed', value: filteredOrders.filter(o => o.status === OrderStatus.COMPLETED).length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', status: OrderStatus.COMPLETED },
    { label: 'Outbound', value: filteredOrders.filter(o => o.status === OrderStatus.DELIVERED).length, icon: Truck, color: 'text-indigo-500', bg: 'bg-indigo-500/10', status: OrderStatus.DELIVERED },
  ];

  const totalRevenue = useMemo(() => filteredOrders.reduce((sum, o) => sum + o.total, 0), [filteredOrders]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-[0.2em]">
            <Waves size={16} /> Operational Command
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Hello, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{user.username}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring {branch.name} fleet and throughput</p>
        </div>

        <div className="flex items-center gap-4">
           {systemStatus && (
             <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all">
                <div className={`w-2 h-2 rounded-full ${systemStatus.database === 'ONLINE' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Engine</span>
                   <span className="text-[10px] font-bold text-slate-900 dark:text-white">{systemStatus.database}</span>
                </div>
             </div>
           )}

          <div className="flex p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            {(['today', 'month', 'year'] as TimeRange[]).map((range) => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.button 
            key={i} 
            whileHover={{ y: -5 }}
            onClick={() => navigate('/orders', { state: { status: stat.status } })}
            className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all text-left relative group overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} -mr-16 -mt-16 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            <div className="flex items-center justify-between mb-6">
              <div className={`${stat.bg} p-4 rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-12`}>
                <stat.icon size={28} className={stat.color} />
              </div>
              <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 uppercase">
                <TrendingUp size={12} /> Live
              </span>
            </div>
            <h3 className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">{stat.label}</h3>
            <p className="text-4xl font-black mt-2 text-slate-900 dark:text-white tracking-tighter">{stat.value}</p>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-8 space-y-8">
           <div className="bg-slate-900 dark:bg-black rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5 flex flex-col justify-between group h-fit">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:bg-blue-600/20 transition-all duration-1000"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                 <div className="space-y-4">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit">
                       <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Financial Telemetry</span>
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Revenue Yield ({timeRange})</p>
                    <h2 className="text-6xl font-black tracking-tighter italic">
                      RD$ {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0 })}
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

           <div className="grid grid-cols-1 gap-8">
             <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors overflow-hidden h-fit">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-black dark:text-white italic tracking-tight">Recent Orders</h3>
                   <button onClick={() => navigate('/orders')} className="text-[10px] font-black uppercase text-blue-600 hover:underline tracking-widest">Global Pipeline</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {filteredOrders.slice(0, 6).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-blue-600 italic border border-slate-100 dark:border-slate-700">{order.customerName[0]}</div>
                          <div>
                            <p className="font-bold text-xs dark:text-white leading-none">{order.customerName}</p>
                            <p className="text-[8px] font-mono text-slate-400 font-bold uppercase mt-1 tracking-widest">{order.code}</p>
                          </div>
                        </div>
                        <p className="font-black text-xs dark:text-white">RD$ {order.total.toFixed(0)}</p>
                      </div>
                   ))}
                </div>
             </div>
           </div>
        </div>

        <div className="xl:col-span-4 h-full">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex flex-col h-full sticky top-8">
              <div className="flex items-center justify-between mb-10">
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 italic">
                    <Users className="text-blue-600" /> Crew
                 </h3>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{staff.length} Active</span>
              </div>
              <div className="space-y-4">
                 {staff.map(employee => {
                    const onDuty = isEmployeeOnDuty(employee);
                    return (
                       <div key={employee.id} className="flex items-center justify-between p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
                          <div className="flex items-center gap-5">
                             <div className="relative">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-black text-slate-600 dark:text-slate-300 text-lg italic">
                                   {employee.username[0]}
                                </div>
                                {onDuty && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-white dark:border-slate-900 rounded-full animate-pulse"></div>}
                             </div>
                             <div>
                                <p className="font-black text-slate-900 dark:text-white leading-none mb-1.5">{employee.username}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-blue-500 transition-colors tracking-widest">{employee.role}</span>
                                </div>
                             </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-200 dark:text-slate-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                       </div>
                    );
                 })}
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
