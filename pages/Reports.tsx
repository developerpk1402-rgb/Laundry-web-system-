
import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  Calendar, 
  Download, 
  Printer, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag,
  Users,
  FileText,
  Mail,
  CheckCircle,
  Send,
  Loader2,
  CreditCard,
  Banknote
} from 'lucide-react';
import { getOrders } from '../services/orderService';
import { Order, Branch, TaxReceiptType } from '../types';

const Reports: React.FC<{ branch: Branch }> = ({ branch }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeView, setActiveView] = useState<'Standard' | '607'>('Standard');
  const [isMailing, setIsMailing] = useState(false);
  const [mailSent, setMailSent] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const allOrders = await getOrders();
      setOrders(allOrders.filter(o => o.branch === branch.name));
    };
    fetchOrders();
  }, [branch]);

  const fiscalOrders = orders.filter(o => o.taxReceiptType !== TaxReceiptType.NONE && o.ncf);

  const handleMailReport = () => {
    setIsMailing(true);
    setTimeout(() => {
      setIsMailing(false);
      setMailSent(true);
      setTimeout(() => setMailSent(false), 3000);
    }, 2000);
  };

  const revenueByPayment = orders.reduce((acc, o) => {
    const method = o.paymentMethod || 'Cash';
    acc[method] = (acc[method] || 0) + o.total;
    return acc;
  }, {} as Record<string, number>);

  const financialStats = [
    { label: 'Total Revenue', value: `RD$ ${orders.reduce((s,o) => s+o.total,0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Pending Collections', value: `RD$ ${orders.reduce((s,o) => s+o.remainingBalance,0).toLocaleString()}`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Orders Processed', value: orders.length.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Fiscal Receipts', value: fiscalOrders.length.toString(), icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
  ];

  const paymentStats = [
    { label: 'Cash Volume', value: revenueByPayment['Cash'] || 0, icon: Banknote, color: 'text-emerald-500' },
    { label: 'Card Volume', value: revenueByPayment['Card'] || 0, icon: CreditCard, color: 'text-blue-500' },
    { label: 'Transfer Volume', value: revenueByPayment['Transfer'] || 0, icon: Send, color: 'text-amber-500' },
  ];

  const barData = [
    { name: 'Mon', revenue: 4500 },
    { name: 'Tue', revenue: 5200 },
    { name: 'Wed', revenue: 3800 },
    { name: 'Thu', revenue: 6100 },
    { name: 'Fri', revenue: 7500 },
    { name: 'Sat', revenue: 9200 },
    { name: 'Sun', revenue: 2100 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight dark:text-slate-100 transition-colors">Reporting Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Performance and Fiscal Analytics for {branch.name}</p>
        </div>
        <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl transition-colors">
          <button 
            onClick={() => setActiveView('Standard')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'Standard' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Operational
          </button>
          <button 
            onClick={() => setActiveView('607')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeView === '607' ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            607 Declaration
          </button>
        </div>
      </div>

      {activeView === 'Standard' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {financialStats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`${stat.bg} p-2.5 rounded-xl`}>
                    <stat.icon size={20} className={stat.color} />
                  </div>
                  <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest">{stat.label}</h3>
                </div>
                <p className="text-2xl font-black dark:text-slate-100">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold dark:text-slate-100 italic">Daily Performance</h2>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#0f172a', color: '#fff' }} />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#020617] p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
               <div className="absolute inset-0 opacity-10 scan-line Desert pointer-events-none"></div>
               <div className="relative z-10 space-y-8">
                  <h2 className="text-xl font-black italic">Payment Analysis</h2>
                  <div className="space-y-6">
                     {paymentStats.map(stat => (
                       <div key={stat.label} className="space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                             <div className="flex items-center gap-2"><stat.icon size={14} className={stat.color} /> {stat.label}</div>
                             <span className="text-white">RD$ {stat.value.toLocaleString()}</span>
                          </div>
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <div className={`h-full ${stat.color.replace('text', 'bg')}`} style={{ width: `${Math.min(100, (stat.value / orders.reduce((s,o)=>s+o.total,1)) * 100)}%` }}></div>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
               <button className="relative z-10 w-full py-4 mt-8 bg-white/10 rounded-2xl border border-white/10 font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                  <Printer size={16} /> Print Operational Summary
               </button>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="bg-indigo-900 dark:bg-indigo-950 text-white p-8 rounded-[3rem] shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 border border-white/5 transition-colors">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <FileText size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight italic">607 Declaration Protocol</h2>
                <p className="text-indigo-200 text-xs font-black uppercase tracking-widest mt-1">Fiscal Compliance Node</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleMailReport}
                disabled={isMailing}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                  mailSent ? 'bg-emerald-500 text-white' : 'bg-white text-indigo-900 hover:bg-indigo-50'
                }`}
              >
                {isMailing ? <Loader2 className="animate-spin" size={20} /> : mailSent ? <CheckCircle size={20} /> : <Mail size={20} />}
                {mailSent ? 'Dispatched to Accountant' : isMailing ? 'Processing...' : 'Auto-Mail Report'}
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg">
                <Download size={20} /> Export DGII (.txt)
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase tracking-widest text-[10px]">
                  <tr>
                    <th className="px-6 py-5 text-left">Customer ID</th>
                    <th className="px-6 py-5 text-left">NCF Sequence</th>
                    <th className="px-6 py-5 text-left">Fiscal Type</th>
                    <th className="px-6 py-5 text-left">Date</th>
                    <th className="px-6 py-5 text-right">Taxable (RD$)</th>
                    <th className="px-6 py-5 text-right">ITBIS (18%)</th>
                    <th className="px-6 py-5 text-right">Total Collection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {fiscalOrders.length > 0 ? (
                    fiscalOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-5 font-mono text-slate-500">{order.customerPhone.replace(/-/g, '')}</td>
                        <td className="px-6 py-5 font-mono font-black text-indigo-600 dark:text-indigo-400">{order.ncf}</td>
                        <td className="px-6 py-5">
                          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-black uppercase">
                            {order.taxReceiptType.split('(')[1].replace(')', '')}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-slate-400">{order.datePlaced}</td>
                        <td className="px-6 py-5 text-right font-black">RD$ {order.subtotal.toFixed(2)}</td>
                        <td className="px-6 py-5 text-right font-black">RD$ {order.tax.toFixed(2)}</td>
                        <td className="px-6 py-5 text-right font-black text-indigo-600">RD$ {order.total.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-24 text-center text-slate-400">
                        <FileText size={48} className="mx-auto mb-4 opacity-10" />
                        <p className="font-black text-xs uppercase tracking-widest">No Fiscal Transactions Logged</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
