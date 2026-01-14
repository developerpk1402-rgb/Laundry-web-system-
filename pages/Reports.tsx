
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
  Loader2
} from 'lucide-react';
import { getOrders } from '../services/orderService';
import { Order, Branch, TaxReceiptType } from '../types';

const Reports: React.FC<{ branch: Branch }> = ({ branch }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeView, setActiveView] = useState<'Standard' | '607'>('Standard');
  const [isMailing, setIsMailing] = useState(false);
  const [mailSent, setMailSent] = useState(false);

  useEffect(() => {
    // Fix: Await getOrders() then filter results.
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

  const financialStats = [
    { label: 'Total Revenue', value: 'RD$ 45,670.00', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Pending Collections', value: 'RD$ 8,120.00', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Orders Processed', value: '142', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Fiscal Receipts', value: fiscalOrders.length.toString(), icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
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

  const pieData = [
    { name: 'Wash & Iron', value: 400, color: '#3b82f6' },
    { name: 'Iron Only', value: 300, color: '#10b981' },
    { name: 'Alterations', value: 150, color: '#f59e0b' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight dark:text-slate-100 transition-colors">Reporting Hub</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Performance and Fiscal Compliance</p>
        </div>
        <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl transition-colors">
          <button 
            onClick={() => setActiveView('Standard')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeView === 'Standard' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            Operational
          </button>
          <button 
            onClick={() => setActiveView('607')}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeView === '607' ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            607+ Declaration
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
                  <h3 className="text-slate-500 dark:text-slate-500 text-sm font-bold uppercase tracking-widest">{stat.label}</h3>
                </div>
                <p className="text-2xl font-black dark:text-slate-100">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-bold dark:text-slate-100">Revenue Trend</h2>
                <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold p-2 focus:ring-0 dark:text-slate-200 transition-colors">
                  <option>Last 7 Days</option>
                  <option>This Month</option>
                </select>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-100 dark:text-slate-800 opacity-50 transition-colors" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                    <Tooltip 
                      cursor={{fill: 'currentColor', className: 'text-slate-50 dark:text-slate-800/50'}}
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#0f172a', color: '#fff'}}
                    />
                    <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
              <h2 className="text-lg font-bold mb-8 dark:text-slate-100">Service Distribution</h2>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="h-64 w-full md:w-1/2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: '#0f172a', color: '#fff'}}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">{item.name}</span>
                      </div>
                      <span className="text-sm font-black dark:text-slate-200">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="bg-indigo-900 dark:bg-indigo-950 text-white p-8 rounded-[2rem] shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 border border-white/5 transition-colors">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                <FileText size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black tracking-tight">DGII 607+ Declaration</h2>
                <p className="text-indigo-200 text-sm font-medium">Sales and Services Reporting for Fiscal Compliance</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleMailReport}
                disabled={isMailing}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                  mailSent 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-white text-indigo-900 hover:bg-indigo-50'
                }`}
              >
                {isMailing ? <Loader2 className="animate-spin" size={20} /> : mailSent ? <CheckCircle size={20} /> : <Mail size={20} />}
                {mailSent ? 'Sent to Accountant' : isMailing ? 'Mailing...' : 'Mail 607+ Report'}
              </button>
              <button className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg">
                <Download size={20} /> Export TXT (DGII)
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-500 font-bold uppercase tracking-widest text-[10px] transition-colors">
                  <tr>
                    <th className="px-6 py-5 text-left">RNC / Cedula</th>
                    <th className="px-6 py-5 text-left">NCF Number</th>
                    <th className="px-6 py-5 text-left">Receipt Type</th>
                    <th className="px-6 py-5 text-left">Date</th>
                    <th className="px-6 py-5 text-right">Taxable (RD$)</th>
                    <th className="px-6 py-5 text-right">ITBIS (18%)</th>
                    <th className="px-6 py-5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
                  {fiscalOrders.length > 0 ? (
                    fiscalOrders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-5 font-mono font-medium dark:text-slate-300">131-00200-1</td>
                        <td className="px-6 py-5 font-mono font-black text-indigo-600 dark:text-indigo-400">{order.ncf}</td>
                        <td className="px-6 py-5">
                          <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-[10px] font-black uppercase">
                            {order.taxReceiptType.split('(')[1].replace(')', '')}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-slate-500 dark:text-slate-500 font-medium">{order.datePlaced}</td>
                        <td className="px-6 py-5 text-right font-medium dark:text-slate-200">RD$ {order.subtotal.toFixed(2)}</td>
                        <td className="px-6 py-5 text-right font-medium dark:text-slate-200">RD$ {order.tax.toFixed(2)}</td>
                        <td className="px-6 py-5 text-right font-black dark:text-slate-100">RD$ {order.total.toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-slate-400 dark:text-slate-600">
                        <Send size={48} className="mx-auto mb-4 opacity-10 dark:opacity-5" />
                        <p className="font-bold">No fiscal orders found in this period.</p>
                        <p className="text-xs">Ensure you issue Tax Credit (B01) or Consumer (B02) receipts to populate this list.</p>
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
