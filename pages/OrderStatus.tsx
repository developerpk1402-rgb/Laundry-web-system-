
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  Truck, 
  MoreVertical, 
  MessageSquare,
  Package,
  Printer,
  Clock,
  ArrowRight,
  MapPin,
  AlertCircle,
  ChevronRight,
  ClipboardCheck
} from 'lucide-react';
import { Order, OrderStatus, Branch, User } from '../types';
import { getOrders, saveOrder } from '../services/orderService';

// Fix: Accept user in props to pass to saveOrder.
const OrderStatusPage: React.FC<{ branch: Branch, user: User }> = ({ branch, user }) => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<OrderStatus>(location.state?.status || OrderStatus.RECEIVED);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Fix: Await getOrders() and then filter.
    const fetchOrders = async () => {
      const allOrders = await getOrders();
      setOrders(allOrders.filter(o => o.branch === branch.name));
    };
    fetchOrders();
  }, [branch]);

  const filteredOrders = orders.filter(o => {
    const matchesTab = o.status === activeTab;
    const matchesSearch = 
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerPhone.includes(searchQuery);
    return matchesTab && matchesSearch;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const updated = { ...order, status: newStatus };
      if (newStatus === OrderStatus.COMPLETED) {
        updated.location = 'Shelf ' + String.fromCharCode(65 + Math.floor(Math.random() * 4)) + '-' + Math.floor(Math.random() * 50 + 1);
      }
      // Fix: Pass user as required.
      await saveOrder(updated, user);
      // Fix: Fetch updated orders asynchronously.
      const allOrders = await getOrders();
      const updatedList = allOrders.filter(o => o.branch === branch.name);
      setOrders(updatedList);
      
      const updatedSelected = updatedList.find(o => o.id === orderId);
      if (updatedSelected) setSelectedOrder(updatedSelected);
    }
  };

  const handleToggleNotified = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const updated = { ...order, notified: !order.notified };
      // Fix: Pass user as required.
      await saveOrder(updated, user);
      // Fix: Fetch updated orders asynchronously.
      const allOrders = await getOrders();
      const updatedList = allOrders.filter(o => o.branch === branch.name);
      setOrders(updatedList);
      if (selectedOrder?.id === orderId) setSelectedOrder(updated);
    }
  };

  const getStatusCount = (status: OrderStatus) => orders.filter(o => o.status === status).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight dark:text-slate-100 transition-colors">Operational Pipeline</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">Tracking lifecycle at {branch.name}</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by code or client..." 
              className="pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-72 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-slate-100 outline-none transition-all shadow-sm font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Workflow Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { status: OrderStatus.RECEIVED, icon: Package, color: 'blue', label: 'Received' },
          { status: OrderStatus.IN_PROCESS, icon: Clock, color: 'amber', label: 'In Process' },
          { status: OrderStatus.COMPLETED, icon: CheckCircle, color: 'emerald', label: 'Completed' },
          { status: OrderStatus.DELIVERED, icon: Truck, color: 'slate', label: 'Delivered' }
        ].map((item) => (
          <button
            key={item.status}
            onClick={() => setActiveTab(item.status)}
            className={`flex items-center justify-between p-6 rounded-[2rem] border transition-all text-left ${
              activeTab === item.status 
              ? `bg-${item.color}-600 border-${item.color}-600 text-white shadow-xl shadow-${item.color}-500/30 ring-4 ring-${item.color}-500/10 scale-105 z-10` 
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-blue-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/10'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${activeTab === item.status ? 'bg-white/20' : `bg-${item.color}-50 dark:bg-${item.color}-900/30 text-${item.color}-600 dark:text-${item.color}-400`}`}>
                <item.icon size={24} />
              </div>
              <div>
                <p className={`text-[10px] font-black uppercase tracking-widest ${activeTab === item.status ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>{item.label}</p>
                <p className="text-2xl font-black leading-none mt-1">{getStatusCount(item.status)}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                <h2 className="font-black text-slate-800 dark:text-slate-100 uppercase text-xs tracking-widest">Phase: {activeTab}</h2>
              </div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{filteredOrders.length} Orders</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                    <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Reference</th>
                    <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Customer</th>
                    <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Details</th>
                    <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Timeline</th>
                    <th className="px-6 py-4 text-right font-black uppercase tracking-widest text-[10px]">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800 transition-colors">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                      <tr 
                        key={order.id} 
                        className={`group cursor-pointer transition-all duration-300 relative ${selectedOrder?.id === order.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                        onClick={() => setSelectedOrder(order)}
                      >
                        <td className="px-6 py-5">
                          {selectedOrder?.id === order.id && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 rounded-r-full"></div>}
                          <div className="font-mono font-black text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors uppercase tracking-tighter">{order.code}</div>
                          {order.location && (
                            <div className="flex items-center gap-1 mt-1 text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded w-fit uppercase">
                              <MapPin size={10} /> {order.location}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-black text-slate-900 dark:text-slate-100 text-sm">{order.customerName}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">{order.customerPhone}</div>
                        </td>
                        <td className="px-6 py-5">
                           <span className="text-xs font-bold text-slate-600 dark:text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                              {order.items.length} Items
                            </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className={`flex items-center gap-2 text-[10px] font-black uppercase ${
                            new Date(order.estimatedDelivery) < new Date() && order.status !== OrderStatus.DELIVERED
                            ? 'text-red-500 dark:text-red-400' 
                            : 'text-slate-400 dark:text-slate-500'
                          }`}>
                            <Clock size={12} className="shrink-0" />
                            {order.estimatedDelivery}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className={`font-black text-sm ${order.remainingBalance > 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            RD$ {order.total.toFixed(2)}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-24 text-center">
                        <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800 shadow-inner">
                          <ClipboardCheck size={32} className="text-slate-200 dark:text-slate-700" />
                        </div>
                        <h3 className="font-black text-slate-900 dark:text-slate-100 transition-colors">Queue Empty</h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest font-bold">No orders currently in {activeTab} stage</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-6">
          {selectedOrder ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl p-8 sticky top-8 animate-in slide-in-from-right-8 duration-500 transition-colors overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-bl-[4rem] -z-10 transition-colors"></div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight transition-colors">Phase Actions</h2>
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-1">{selectedOrder.code}</p>
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                  selectedOrder.status === OrderStatus.RECEIVED ? 'bg-blue-600 text-white' :
                  selectedOrder.status === OrderStatus.IN_PROCESS ? 'bg-amber-600 text-white' :
                  selectedOrder.status === OrderStatus.COMPLETED ? 'bg-emerald-600 text-white' :
                  'bg-slate-900 dark:bg-black text-white'
                }`}>
                   {selectedOrder.status === OrderStatus.RECEIVED ? <Package size={28} /> :
                    selectedOrder.status === OrderStatus.IN_PROCESS ? <Clock size={28} /> :
                    selectedOrder.status === OrderStatus.COMPLETED ? <CheckCircle size={28} /> :
                    <Truck size={28} />}
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-5 transition-colors">
                   <div>
                    <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-[9px] tracking-[0.2em] mb-2">Customer Context</p>
                    <p className="font-black text-slate-900 dark:text-slate-100 text-lg leading-tight transition-colors">{selectedOrder.customerName}</p>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{selectedOrder.customerPhone}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-slate-400 dark:text-slate-500 font-black uppercase text-[9px] tracking-[0.2em] mb-3">Lifecycle Progress</p>
                    <div className="flex justify-between items-center px-1">
                      {[OrderStatus.RECEIVED, OrderStatus.IN_PROCESS, OrderStatus.COMPLETED, OrderStatus.DELIVERED].map((s, idx) => {
                        const states = [OrderStatus.RECEIVED, OrderStatus.IN_PROCESS, OrderStatus.COMPLETED, OrderStatus.DELIVERED];
                        const currentIdx = states.indexOf(selectedOrder.status);
                        const isPast = currentIdx > idx;
                        const isNow = currentIdx === idx;
                        return (
                          <div key={s} className={`w-3 h-3 rounded-full ${isNow ? 'bg-blue-600 dark:bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900/50 scale-125' : isPast ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedOrder.status === OrderStatus.RECEIVED && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, OrderStatus.IN_PROCESS)}
                      className="w-full py-5 bg-blue-600 dark:bg-blue-700 text-white rounded-[1.5rem] font-black text-sm hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group uppercase tracking-widest"
                    >
                      Start Processing <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                  {selectedOrder.status === OrderStatus.IN_PROCESS && (
                    <button 
                      onClick={() => handleUpdateStatus(selectedOrder.id, OrderStatus.COMPLETED)}
                      className="w-full py-5 bg-emerald-600 dark:bg-emerald-700 text-white rounded-[1.5rem] font-black text-sm hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 uppercase tracking-widest"
                    >
                      <CheckCircle size={20} /> Complete Task
                    </button>
                  )}
                  {selectedOrder.status === OrderStatus.COMPLETED && (
                    <div className="space-y-4">
                      <button 
                        onClick={() => handleToggleNotified(selectedOrder.id)}
                        className={`w-full py-5 rounded-[1.5rem] font-black text-sm transition-all flex items-center justify-center gap-3 border-2 uppercase tracking-widest ${
                          selectedOrder.notified 
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-800 shadow-inner' 
                          : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 shadow-lg shadow-amber-500/10'
                        }`}
                      >
                        <MessageSquare size={20} /> {selectedOrder.notified ? 'Notified' : 'Alert Customer'}
                      </button>
                      <button 
                        className="w-full py-5 bg-slate-900 dark:bg-black text-white rounded-[1.5rem] font-black text-sm hover:bg-black dark:hover:bg-slate-900 transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest"
                        onClick={() => window.location.href = '#/invoicing'}
                      >
                        <Truck size={20} /> Go to Invoicing
                      </button>
                    </div>
                  )}
                </div>

                <div className="pt-6 grid grid-cols-2 gap-4">
                  <button className="py-4 px-4 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 border border-slate-100 dark:border-slate-800 transition-colors">
                    <Printer size={16} /> Work Order
                  </button>
                  <button className="py-4 px-4 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 border border-slate-100 dark:border-slate-800 transition-colors">
                    <Eye size={16} /> Details
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 h-[500px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-10 text-center sticky top-8 transition-colors">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Package size={40} className="opacity-10 dark:opacity-5" />
              </div>
              <p className="font-black text-slate-600 dark:text-slate-400 uppercase text-xs tracking-[0.2em]">Select an Order</p>
              <p className="text-[10px] mt-2 max-w-[180px] font-bold text-slate-400 dark:text-slate-500 leading-relaxed">Choose an active record from the pipeline to perform state transitions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderStatusPage;
