
import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Search, 
  ChevronRight, 
  CreditCard, 
  DollarSign, 
  FileText,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { Order, OrderStatus, TaxReceiptType, Branch, User } from '../types';
import { getOrders, saveOrder, generateNCF } from '../services/orderService';
import { useNavigate } from 'react-router-dom';

const Invoicing: React.FC<{ branch: Branch, user: User }> = ({ branch, user }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'Transfer'>('Cash');
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    // Pipeline Rule: Only COMPLETED orders can transition to DELIVERED via Invoicing
    // Fix: Await getOrders() then filter results.
    const fetchOrders = async () => {
      const allOrders = await getOrders();
      setOrders(allOrders.filter(o => o.branch === branch.name && o.status === OrderStatus.COMPLETED));
    };
    fetchOrders();
  }, [branch]);

  const filteredOrders = orders.filter(o => 
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProcessDelivery = () => {
    if (!selectedOrder) return;
    setShowConfirm(true);
  };

  const confirmInvoice = async () => {
    if (!selectedOrder) return;
    
    // Call generateNCF with the current branch context
    // Fix: Await generateNCF and pass the user object as the 3rd argument.
    const ncf = await generateNCF(selectedOrder.taxReceiptType, branch.id, user);
    
    if (selectedOrder.taxReceiptType !== TaxReceiptType.NONE && !ncf) {
       alert("CRITICAL ERROR: No active NCF ranges found for this branch. Please check settings.");
       setShowConfirm(false);
       return;
    }

    const updated: Order = {
      ...selectedOrder,
      status: OrderStatus.DELIVERED,
      ncf,
      amountPaid: selectedOrder.total,
      remainingBalance: 0
    };
    
    // Fix: Await saveOrder and pass user object.
    await saveOrder(updated, user);
    // Fix: Await getOrders then filter results.
    const allOrders = await getOrders();
    setOrders(allOrders.filter(o => o.branch === branch.name && o.status === OrderStatus.COMPLETED));
    setSelectedOrder(null);
    setShowConfirm(false);
    alert(`Handover Complete!\nNCF: ${ncf || 'Not Required (B00)'}`);
    navigate('/orders');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight dark:text-slate-100 transition-colors">Final Handover</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Transition from <span className="text-emerald-600 dark:text-emerald-400 font-bold uppercase">Completed</span> to <span className="text-slate-900 dark:text-slate-100 font-bold uppercase">Delivered</span></p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search reference..." 
              className="pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-72 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-slate-100 outline-none transition-all shadow-sm font-bold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button onClick={() => navigate('/orders')} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all">
            <ArrowLeft size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden h-fit transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 font-black text-slate-900 dark:text-slate-100 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center uppercase text-xs tracking-widest transition-colors">
            <span>Ready for Delivery</span>
            <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-lg text-[10px]">{filteredOrders.length} Ready</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto custom-scrollbar">
            {filteredOrders.length > 0 ? (
              filteredOrders.map(order => (
                <div 
                  key={order.id} 
                  className={`p-6 flex items-center justify-between hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer transition-all ${selectedOrder?.id === order.id ? 'bg-blue-50 dark:bg-blue-900/20 relative' : ''}`}
                  onClick={() => setSelectedOrder(order)}
                >
                  {selectedOrder?.id === order.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                      <Receipt size={24} />
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-slate-100 text-sm">{order.customerName}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{order.code} • {order.items.length} Items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 dark:text-slate-100">RD$ {order.total.toFixed(2)}</p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-black tracking-widest mt-0.5">{order.taxReceiptType.split(' ')[0]}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-20 text-center text-slate-400 dark:text-slate-600 transition-colors">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Receipt size={32} className="opacity-10 dark:opacity-5" />
                </div>
                <p className="text-xs font-black uppercase tracking-widest">Pipeline Clear</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {selectedOrder ? (
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500 transition-colors">
              <div className="bg-slate-900 dark:bg-black text-white p-10 relative overflow-hidden transition-colors">
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Final Balance</p>
                    <h2 className="text-5xl font-black tracking-tighter">RD$ {selectedOrder.total.toFixed(2)}</h2>
                  </div>
                  <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/20">
                    <DollarSign size={32} />
                  </div>
                </div>
                <div className="flex gap-8 border-t border-white/5 pt-6">
                  <div>
                    <p className="text-slate-500 font-black uppercase text-[9px] tracking-widest">Customer</p>
                    <p className="font-bold text-white text-sm">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 font-black uppercase text-[9px] tracking-widest">Fiscal Protocol</p>
                    <p className="font-bold text-blue-400 text-sm">{selectedOrder.taxReceiptType}</p>
                  </div>
                </div>
              </div>

              <div className="p-10 space-y-10">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest ml-1 transition-colors">Payment Channel</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {(['Cash', 'Card', 'Transfer'] as const).map(method => (
                      <button
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        className={`flex flex-col items-center justify-center gap-3 py-6 rounded-3xl border-2 transition-all ${
                          paymentMethod === method 
                            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 shadow-lg shadow-blue-500/10' 
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-200 dark:hover:border-slate-600'
                        }`}
                      >
                        {method === 'Cash' && <DollarSign size={24}/>}
                        {method === 'Card' && <CreditCard size={24}/>}
                        {method === 'Transfer' && <FileText size={24}/>}
                        <span className="text-[10px] font-black uppercase tracking-widest">{method}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-[1.5rem] flex gap-4 text-amber-700 dark:text-amber-400 transition-colors">
                  <AlertTriangle size={24} className="shrink-0" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest mb-1">Declaration Warning</p>
                    <p className="text-[11px] font-medium leading-relaxed opacity-80">
                      Processing this handover will finalize the lifecycle. An NCF sequence will be burned and the transaction recorded in the DGII 607 repository.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={handleProcessDelivery}
                  className="w-full py-5 bg-blue-600 dark:bg-blue-700 text-white rounded-[1.5rem] font-black text-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-3 uppercase tracking-widest active:scale-95"
                >
                  Process Delivery <ChevronRight size={28} />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 h-96 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 p-12 text-center transition-colors">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner transition-colors">
                <CreditCard size={40} className="opacity-10 dark:opacity-5" />
              </div>
              <p className="font-black text-slate-600 dark:text-slate-400 uppercase text-xs tracking-widest transition-colors">Select Completion Record</p>
              <p className="text-[10px] font-bold mt-2 max-w-[200px] leading-relaxed dark:text-slate-500 transition-colors">Only orders in the "Completed" state appear here for final handover.</p>
            </div>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] max-w-sm w-full p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-center border dark:border-slate-800 transition-colors">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-colors">
              <FileText size={32} />
            </div>
            <h2 className="text-2xl font-black mb-4 tracking-tight dark:text-slate-100 transition-colors">Generate NCF?</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-8 transition-colors">
              Finalize handover for <span className="text-slate-900 dark:text-slate-100 font-bold">{selectedOrder?.customerName}</span> and apply ITBIS declaration.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={confirmInvoice}
                className="w-full py-4 bg-blue-600 dark:bg-blue-700 text-white rounded-2xl font-black hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs"
              >
                Yes, Finalize Order
              </button>
              <button 
                onClick={() => setShowConfirm(false)}
                className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase tracking-widest text-xs"
              >
                Cancel Handover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoicing;
