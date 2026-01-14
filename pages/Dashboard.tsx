
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  CheckCircle2, 
  Clock, 
  Truck,
  TrendingUp,
  Activity,
  Users,
  ShieldCheck,
  Star,
  ExternalLink,
  ChevronRight,
  Zap,
  Waves
} from 'lucide-react';
import { Order, OrderStatus, Branch, User, UserRole } from '../types';
import { getOrders } from '../services/orderService';
import { getEmployeesByBranch, isEmployeeOnDuty } from '../services/userService';
import { isToday, isThisMonth, isThisYear } from 'date-fns';
import { useNavigate } from 'react-router-dom';

type TimeRange = 'today' | 'month' | 'year';

const Dashboard: React.FC<{ branch: Branch, user: User }> = ({ branch, user }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('today');

  useEffect(() => {
    setOrders(getOrders().filter(o => o.branch === branch.name));
    if (user.role === UserRole.ADMIN) {
      setStaff(getEmployeesByBranch(branch.id));
    }
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10"
    >
      {/* Welcome Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-[0.2em]">
            <Waves size={16} /> Operational Command
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Hello, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{user.username}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Monitoring {branch.name} fleet and throughput</p>
        </div>

        <div className="flex p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm self-start lg:self-center transition-colors">
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
      </motion.div>

      {/* Hero Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.button 
            variants={itemVariants}
            key={i} 
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/orders', { state: { status: stat.status } })}
            className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all text-left relative group overflow-hidden"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} -mr-16 -mt-16 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            <div className="flex items-center justify-between mb-6">
              <div className={`${stat.bg} p-4 rounded-2xl transition-transform group-hover:rotate-12`}>
                <stat.icon size={28} className={stat.color} />
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 uppercase">
                    <TrendingUp size={12} /> Active
                 </span>
              </div>
            </div>
            <h3 className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em]">{stat.label}</h3>
            <p className="text-4xl font-black mt-2 text-slate-900 dark:text-white tracking-tighter">{stat.value}</p>
          </motion.button>
        ))}
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <motion.div variants={itemVariants} className="xl:col-span-8 space-y-8">
           <div className="bg-slate-900 dark:bg-black rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border border-white/5 h-[400px] flex flex-col justify-between group">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:bg-blue-600/20 transition-all duration-1000"></div>
              <div className="relative z-10 flex justify-between items-start">
                 <div className="space-y-2">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit">
                       <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                       <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Live Throughput</span>
                    </div>
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Real-time Revenue ({timeRange})</p>
                    <motion.h2 
                      key={totalRevenue}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-6xl font-black tracking-tighter"
                    >
                      RD$ {totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </motion.h2>
                 </div>
              </div>
              
              <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-white/5">
                 <div className="space-y-1">
                    <p className="text-slate-500 font-black text-[9px] uppercase tracking-widest">Growth</p>
                    <p className="text-emerald-400 font-bold text-lg">+12.4%</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-slate-500 font-black text-[9px] uppercase tracking-widest">Forecast</p>
                    <p className="text-blue-400 font-bold text-lg">RD$ {(totalRevenue * 1.4).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Active Pipeline</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Critical focus items across all stages</p>
                 </div>
                 <button onClick={() => navigate('/orders')} className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 hover:underline tracking-widest">Full List</button>
              </div>
              <div className="space-y-4">
                 {filteredOrders.filter(o => o.status !== OrderStatus.DELIVERED).slice(0, 4).map((order, idx) => (
                    <motion.div 
                      key={order.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-blue-500/30 transition-all group cursor-pointer"
                    >
                       <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 font-black text-blue-600 dark:text-blue-400 italic">
                             {order.customerName[0]}
                          </div>
                          <div>
                             <p className="font-black text-slate-900 dark:text-white leading-none mb-1 group-hover:text-blue-600 transition-colors">{order.customerName}</p>
                             <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 font-bold uppercase">{order.code}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="font-black text-slate-900 dark:text-white">RD$ {order.total.toFixed(0)}</p>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </div>
        </motion.div>

        <motion.div variants={itemVariants} className="xl:col-span-4 space-y-8 h-full">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors flex flex-col h-full">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 italic">
                    <Users className="text-blue-600" /> Crew
                 </h3>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{staff.length} Members</span>
              </div>
              <div className="space-y-2 flex-1">
                 {staff.map(employee => {
                    const onDuty = isEmployeeOnDuty(employee);
                    return (
                       <div key={employee.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                          <div className="flex items-center gap-4">
                             <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-black text-slate-600 dark:text-slate-300">
                                   {employee.username[0]}
                                </div>
                                {onDuty && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-lg animate-pulse"></div>}
                             </div>
                             <div>
                                <p className="font-black text-slate-900 dark:text-white text-sm leading-none mb-1">{employee.username}</p>
                                <span className="text-[9px] font-black uppercase text-slate-400 group-hover:text-blue-500 transition-colors tracking-widest">{employee.role}</span>
                             </div>
                          </div>
                       </div>
                    );
                 })}
              </div>
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;