
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  Phone, 
  CreditCard, 
  MoreHorizontal, 
  Mail, 
  MapPin, 
  X, 
  History, 
  ExternalLink,
  ChevronRight,
  Package
} from 'lucide-react';
import { Customer, Order } from '../types';
import { getCustomers, saveCustomer, generateCustomerCode } from '../services/customerService';
import { getOrders } from '../services/orderService';

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomerForHistory, setSelectedCustomerForHistory] = useState<Customer | null>(null);
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);

  // Form State
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    rnc: '',
    address: ''
  });

  useEffect(() => {
    setCustomers(getCustomers());
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) ||
    (c.rnc && c.rnc.includes(search)) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const customer: Customer = {
      id: Math.random().toString(36).substr(2, 9),
      code: generateCustomerCode(),
      name: newCustomer.name,
      phone: newCustomer.phone,
      rnc: newCustomer.rnc || undefined,
      address: newCustomer.address || undefined
    };
    saveCustomer(customer);
    setCustomers(getCustomers());
    setIsAddModalOpen(false);
    setNewCustomer({ name: '', phone: '', rnc: '', address: '' });
  };

  const openHistory = (customer: Customer) => {
    const allOrders = getOrders();
    const filteredOrders = allOrders.filter(o => o.customerId === customer.id);
    setCustomerOrders(filteredOrders);
    setSelectedCustomerForHistory(customer);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight dark:text-slate-100 transition-colors">Customer Directory</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Manage client profiles and fiscal data (RNC)</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-xl font-black hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
        >
          <UserPlus size={20} /> Add New Client
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, phone, RNC or code..." 
            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-blue-500 dark:text-slate-200 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map(customer => (
          <div key={customer.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-black text-xl">
                {customer.name[0]}
              </div>
              <button className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-600 transition-colors">
                <MoreHorizontal size={20} />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 transition-colors">{customer.name}</h3>
            <p className="text-xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 transition-colors">{customer.code}</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 transition-colors">
                <Phone size={16} className="text-slate-300 dark:text-slate-700 shrink-0" />
                <span>{customer.phone}</span>
              </div>
              {customer.rnc && (
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 transition-colors">
                  <CreditCard size={16} className="text-slate-300 dark:text-slate-700 shrink-0" />
                  <span className="font-medium">RNC: {customer.rnc}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 transition-colors">
                <MapPin size={16} className="text-slate-300 dark:text-slate-700 shrink-0" />
                <span className="truncate">{customer.address || 'No address provided'}</span>
              </div>
            </div>

            <div className="mt-8 flex gap-2">
              <button className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all">Edit Profile</button>
              <button 
                onClick={() => openHistory(customer)}
                className="flex-1 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all flex items-center justify-center gap-1"
              >
                <History size={14} /> Order History
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-200 border dark:border-slate-800 transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
              <h2 className="text-xl font-bold dark:text-slate-100">Register New Client</h2>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 uppercase mb-1 ml-1 transition-colors">Full Name *</label>
                  <input 
                    required
                    type="text" 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-200 transition-colors"
                    placeholder="e.g. Maria Mercedes"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 uppercase mb-1 ml-1 transition-colors">Phone Number *</label>
                  <input 
                    required
                    type="tel" 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-200 transition-colors"
                    placeholder="809-000-0000"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 uppercase mb-1 ml-1 transition-colors">RNC (Optional)</label>
                  <input 
                    type="text" 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-200 transition-colors"
                    placeholder="131-00000-0"
                    value={newCustomer.rnc}
                    onChange={(e) => setNewCustomer({...newCustomer, rnc: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 uppercase mb-1 ml-1 transition-colors">Address (Optional)</label>
                  <textarea 
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none dark:text-slate-200 transition-colors"
                    placeholder="Residential address..."
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order History Modal */}
      {selectedCustomerForHistory && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[90vh] border dark:border-slate-800 transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                  <History size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold dark:text-slate-100 transition-colors">{selectedCustomerForHistory.name}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">Service History • {customerOrders.length} Orders</p>
                </div>
              </div>
              <button onClick={() => setSelectedCustomerForHistory(null)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30 dark:bg-slate-950/30">
              {customerOrders.length > 0 ? (
                customerOrders.sort((a,b) => new Date(b.datePlaced).getTime() - new Date(a.datePlaced).getTime()).map(order => (
                  <div key={order.id} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-700 transition-all shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">{order.code}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">{order.datePlaced}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase transition-colors ${
                          order.status === 'Delivered' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        }`}>
                          {order.status}
                        </span>
                        <p className="font-black text-slate-900 dark:text-slate-100 mt-1 transition-colors">RD$ {order.total.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, idx) => (
                        <span key={idx} className="bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg text-[10px] font-medium border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 transition-colors">
                          {item.quantity}x {item.garmentName}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center text-slate-400 dark:text-slate-700 transition-colors">
                  <Package size={48} className="mx-auto mb-4 opacity-10" />
                  <p>No order history found for this customer.</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end transition-colors">
              <button 
                onClick={() => setSelectedCustomerForHistory(null)}
                className="px-6 py-2.5 bg-slate-900 dark:bg-slate-950 text-white rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-black transition-all text-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
