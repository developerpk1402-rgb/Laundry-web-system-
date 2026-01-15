
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  PlusCircle, 
  User as UserIcon,
  CreditCard,
  DollarSign,
  Printer,
  ChevronRight,
  Clock,
  X,
  Camera,
  Sparkles,
  Loader2,
  AlertCircle,
  ScanLine,
  ShoppingBag,
  Settings2,
  Check,
  // Fix: Added missing Zap import
  Zap
} from 'lucide-react';
import { 
  Garment, 
  Customer, 
  OrderItem, 
  ServiceType, 
  OrderStatus, 
  TaxReceiptType,
  Branch,
  User
} from '../types';
import { GARMENTS, CATEGORIES, COLORS, EXPRESS_SURCHARGE, TAX_RATE } from '../constants';
import { saveOrder, generateOrderCode } from '../services/orderService';
import { getCustomers } from '../services/customerService';
import { analyzeGarmentImage, AIAnalysisResult } from '../services/aiService';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CreateOrder: React.FC<{ branch: Branch, user: User }> = ({ branch, user }) => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableCustomers, setAvailableCustomers] = useState<Customer[]>([]);
  
  // Configuration Modal State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [configGarment, setConfigGarment] = useState<Garment | null>(null);
  const [configOptions, setConfigOptions] = useState<Partial<OrderItem>>({
    color: COLORS[0],
    service: ServiceType.WASH_IRON,
    quantity: 1,
    isExpress: false,
    notes: ''
  });

  // AI State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Invoice Details
  const [taxReceipt, setTaxReceipt] = useState<TaxReceiptType>(TaxReceiptType.FINAL_CONSUMER);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      const customers = await getCustomers();
      setAvailableCustomers(customers);
    };
    if (isCustomerSearchOpen) {
      fetchCustomers();
    }
  }, [isCustomerSearchOpen]);

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = (subtotal - discount) * TAX_RATE;
  const grandTotal = subtotal - discount + taxAmount;

  const openGarmentConfig = (garment: Garment) => {
    setConfigGarment(garment);
    setConfigOptions({
      color: COLORS[0],
      service: ServiceType.WASH_IRON,
      quantity: 1,
      isExpress: false,
      notes: ''
    });
    setIsConfigOpen(true);
  };

  const addItemToCart = () => {
    if (!configGarment) return;
    
    const basePrice = configGarment.basePrice;
    let finalPrice = basePrice;
    if (configOptions.isExpress) finalPrice *= (1 + EXPRESS_SURCHARGE);
    
    const newItem: OrderItem = {
      id: Math.random().toString(36).substr(2, 9),
      garmentId: configGarment.id,
      garmentName: configGarment.name,
      color: configOptions.color!,
      service: configOptions.service!,
      quantity: configOptions.quantity!,
      isExpress: configOptions.isExpress!,
      price: finalPrice,
      total: finalPrice * configOptions.quantity!,
      notes: configOptions.notes
    };
    
    setCart([...cart, newItem]);
    setIsConfigOpen(false);
    setConfigGarment(null);
  };

  const removeItem = (id: string) => setCart(cart.filter(i => i.id !== id));

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera error:", err);
      alert("Please allow camera permissions to use AI Scan.");
      setIsCameraOpen(false);
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsAnalyzing(true);
    const context = canvasRef.current.getContext('2d');
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context?.drawImage(videoRef.current, 0, 0);
    
    const base64Image = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
    
    try {
      const result: AIAnalysisResult = await analyzeGarmentImage(base64Image);
      
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraOpen(false);

      const matchingGarment = GARMENTS.find(g => 
        g.category.toLowerCase() === result.category.toLowerCase() || 
        g.name.toLowerCase().includes(result.category.toLowerCase())
      ) || GARMENTS[0];

      openGarmentConfig(matchingGarment);
      setConfigOptions(prev => ({ 
        ...prev, 
        notes: `AI Scan: ${result.fabric} fabric. Condition: ${result.condition}. Suggestion: ${result.suggestedService}` 
      }));
    } catch (error) {
      alert("AI recognition failed. Please select manually.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProcessOrder = async () => {
    if (!customer) return alert('Select a customer before processing');
    if (cart.length === 0) return alert('Order must have at least one item');
    setIsProcessing(true);
    
    const order = {
      code: generateOrderCode(),
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      status: OrderStatus.RECEIVED,
      items: cart,
      subtotal,
      tax: taxAmount,
      discount,
      total: grandTotal,
      amountPaid: 0,
      remainingBalance: grandTotal,
      datePlaced: new Date().toLocaleDateString(),
      estimatedDelivery: new Date(Date.now() + 2 * 86400000).toLocaleDateString(),
      processedBy: user.username,
      branch: branch.name,
      notes,
      taxReceiptType: taxReceipt,
      notified: false
    };
    try {
      await saveOrder(order, user);
      navigate('/orders');
    } catch (error) {
      alert("Error processing order.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col xl:flex-row h-full gap-8 animate-in fade-in slide-in-from-right-10 duration-700">
      <div className="flex-1 space-y-8">
        {/* Category Navigation */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1 bg-white dark:bg-slate-900 p-2 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar transition-all">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <button 
            onClick={startCamera}
            className="shrink-0 flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 dark:bg-white dark:text-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl transition-all hover:scale-[1.02] active:scale-95 group"
          >
            <ScanLine size={18} className="group-hover:animate-pulse" />
            AI Smart Scan
          </button>
        </div>

        {/* Garment Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {GARMENTS.filter(g => g.category === selectedCategory).map(garment => (
            <button
              key={garment.id}
              onClick={() => openGarmentConfig(garment)}
              className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 dark:hover:border-blue-400/50 hover:shadow-2xl transition-all text-center group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                <PlusCircle className="text-slate-300 dark:text-slate-600 group-hover:text-blue-600 transition-all group-hover:scale-110" size={32} />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 transition-colors">{garment.name}</h3>
              <p className="text-blue-600 dark:text-blue-400 font-bold text-sm">RD$ {garment.basePrice.toFixed(0)}</p>
            </button>
          ))}
        </div>

        {/* Cart Table */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all">
          <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-black text-lg tracking-tight dark:text-white italic">Items in Current Order <span className="ml-2 text-blue-500 text-sm">({cart.length})</span></h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-500 font-black uppercase text-[10px] tracking-widest transition-colors">
                <tr>
                  <th className="px-8 py-5 text-left">Garment</th>
                  <th className="px-6 py-5 text-left">Details</th>
                  <th className="px-6 py-5 text-center">Units</th>
                  <th className="px-6 py-5 text-right">Valuation</th>
                  <th className="px-6 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800 transition-colors">
                {cart.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-blue-900/5 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="font-bold text-slate-900 dark:text-slate-200">{item.garmentName}</div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest">{item.service}</div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full border border-slate-200 dark:border-slate-700" style={{ backgroundColor: item.color.toLowerCase() }}></span>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{item.color} {item.isExpress && <span className="text-amber-500 font-black ml-1">(Express)</span>}</span>
                       </div>
                    </td>
                    <td className="px-6 py-5 text-center font-black text-slate-900 dark:text-white">{item.quantity}</td>
                    <td className="px-6 py-5 text-right font-black text-slate-900 dark:text-slate-100 tracking-tighter">RD$ {item.total.toFixed(2)}</td>
                    <td className="px-8 py-5 text-center">
                      <button onClick={() => removeItem(item.id)} className="text-slate-300 dark:text-slate-700 hover:text-red-500 dark:hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={18}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {cart.length === 0 && (
              <div className="p-20 text-center text-slate-400 dark:text-slate-600 space-y-4">
                 <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <ShoppingBag size={32} className="opacity-10" />
                 </div>
                 <p className="font-bold text-sm tracking-tight italic">Terminal awaiting item entry or AI recognition input.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Checkout Sidebar */}
      <div className="w-full xl:w-[450px] shrink-0 space-y-8">
        <div className="bg-[#020617] rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col sticky top-8 transition-all p-10 space-y-12">
          
          <div className="relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
             <h2 className="text-3xl font-black text-white tracking-tighter italic">Order Protocol</h2>
             <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">LavanFlow OS Deployment</p>
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 ml-1">Assigned Client</label>
            {customer ? (
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/10 group transition-all backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 italic font-black text-xl">
                    {customer.name[0]}
                  </div>
                  <div>
                    <p className="font-black text-white text-base leading-tight">{customer.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{customer.phone}</p>
                  </div>
                </div>
                <button onClick={() => setCustomer(null)} className="p-3 hover:bg-red-500/20 rounded-xl text-red-500 transition-colors">
                  <X size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsCustomerSearchOpen(true)}
                className="w-full flex flex-col items-center justify-center gap-4 p-8 bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] text-slate-500 hover:border-blue-500/50 hover:text-blue-400 transition-all group"
              >
                <div className="p-4 bg-white/5 rounded-2xl transition-transform group-hover:scale-110">
                   <Search size={28} />
                </div>
                <span className="font-black text-xs uppercase tracking-[0.2em]">Identify Node Subject</span>
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-5">
              <div className="flex justify-between items-center text-slate-400 font-black text-sm uppercase tracking-[0.2em] px-1">
                <span>SUBTOTAL</span>
                <span className="text-white">RD$ {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 font-black text-sm uppercase tracking-[0.2em] px-1">
                <span>ITBIS (18%)</span>
                <span className="text-white">RD$ {taxAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10 flex justify-between items-end">
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grand Total</p>
                  <p className="text-5xl font-black text-white tracking-tighter italic leading-none">RD$ {grandTotal.toFixed(2)}</p>
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 ml-1">Tax Receipt Profile</label>
            <div className="grid grid-cols-2 gap-3">
              {[TaxReceiptType.NONE, TaxReceiptType.FINAL_CONSUMER, TaxReceiptType.TAX_CREDIT, TaxReceiptType.GOVERNMENT].map(t => (
                <button 
                  key={t}
                  onClick={() => setTaxReceipt(t)}
                  className={`px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${taxReceipt === t ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}
                >
                  {t.split('(')[0].trim()}
                </button>
              ))}
            </div>
          </div>

          <textarea 
            placeholder="Operational brief / Instructions..."
            className="w-full p-6 bg-white/5 border border-white/10 rounded-[2rem] text-sm h-28 resize-none text-white transition-all focus:ring-4 focus:ring-blue-500/10 outline-none placeholder:text-slate-600"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button 
            onClick={handleProcessOrder}
            disabled={isProcessing || !customer || cart.length === 0}
            className={`w-full py-8 rounded-[2.5rem] font-black text-base uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 relative group ${
              isProcessing || !customer || cart.length === 0 
              ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5' 
              : 'bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/40 shadow-2xl active:scale-95'
            }`}
          >
            {isProcessing ? <Loader2 className="animate-spin" /> : 'COMPLETE ORDER'}
          </button>
        </div>
      </div>

      {/* Garment Configuration Modal - As described in PDF Step by Step */}
      <AnimatePresence>
        {isConfigOpen && configGarment && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[1001] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3.5rem] overflow-hidden shadow-2xl border dark:border-slate-800"
            >
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                   <h2 className="text-3xl font-black dark:text-white italic tracking-tighter">Configure Item</h2>
                   <p className="text-xs text-blue-600 font-black uppercase tracking-widest mt-1">{configGarment.name} • Base RD$ {configGarment.basePrice}</p>
                </div>
                <button onClick={() => setIsConfigOpen(false)} className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-500 transition-all"><X size={24}/></button>
              </div>
              
              <div className="p-10 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Color</label>
                    <div className="grid grid-cols-3 gap-2">
                      {COLORS.map(c => (
                        <button 
                          key={c}
                          onClick={() => setConfigOptions({...configOptions, color: c})}
                          className={`px-3 py-3 rounded-xl border text-[10px] font-black uppercase tracking-tighter transition-all flex flex-col items-center gap-2 ${configOptions.color === c ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                        >
                          <span className="w-5 h-5 rounded-full border border-slate-200" style={{ backgroundColor: c.toLowerCase() }}></span>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select Service</label>
                      <div className="space-y-2">
                        {Object.values(ServiceType).map(s => (
                          <button 
                            key={s}
                            onClick={() => setConfigOptions({...configOptions, service: s})}
                            className={`w-full p-4 rounded-2xl border transition-all flex items-center justify-between ${configOptions.service === s ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}
                          >
                            <span className="text-xs font-black uppercase tracking-widest">{s}</span>
                            {configOptions.service === s && <Check size={16} />}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20">
                       <div className="flex items-center gap-3">
                          <Zap size={20} className="text-amber-500" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-400">Express Service</p>
                            <p className="text-[8px] font-bold text-amber-600 uppercase tracking-widest opacity-60">+25% Operational Surcharge</p>
                          </div>
                       </div>
                       <button 
                         onClick={() => setConfigOptions({...configOptions, isExpress: !configOptions.isExpress})}
                         className={`w-12 h-6 rounded-full transition-colors relative ${configOptions.isExpress ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                       >
                         <motion.div 
                           animate={{ x: configOptions.isExpress ? 24 : 4 }}
                           className="absolute top-1 w-4 h-4 bg-white rounded-full"
                         />
                       </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                   <div className="flex items-center gap-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Quantity</label>
                      <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-2 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <button onClick={() => setConfigOptions(p => ({...p, quantity: Math.max(1, p.quantity! - 1)}))} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl shadow-sm text-slate-500"><Minus size={18}/></button>
                        <span className="w-8 text-center font-black dark:text-white text-lg">{configOptions.quantity}</span>
                        <button onClick={() => setConfigOptions(p => ({...p, quantity: p.quantity! + 1}))} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-900 rounded-xl shadow-sm text-slate-500"><Plus size={18}/></button>
                      </div>
                   </div>
                   <button 
                     onClick={addItemToCart}
                     className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                   >
                     Confirm Configuration
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern AI Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl z-[1000] flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col border border-white/10 group">
            <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-20">
              <div className="px-6 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-full shadow-2xl flex items-center gap-3 ring-4 ring-blue-600/20">
                <Sparkles size={16} /> Gemini AI Analysis
              </div>
              <button 
                onClick={() => {
                  const stream = videoRef.current?.srcObject as MediaStream;
                  stream?.getTracks().forEach(track => track.stop());
                  setIsCameraOpen(false);
                }}
                className="p-4 bg-white/10 hover:bg-red-500 text-white rounded-2xl backdrop-blur-xl transition-all"
              >
                <X size={24} />
              </button>
            </div>
            
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute inset-0 pointer-events-none z-10 border-[16px] border-white/5 rounded-[3rem]">
              <div className="absolute top-[20%] left-[20%] right-[20%] bottom-[20%] border-2 border-dashed border-blue-500/50 rounded-3xl">
                 <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_30px_#3b82f6] animate-[scan_2.5s_infinite]"></div>
              </div>
            </div>

            <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center z-20">
              {isAnalyzing ? (
                <div className="bg-white px-10 py-6 rounded-[2.5rem] flex items-center gap-6 text-blue-600 shadow-[0_0_50px_rgba(59,130,246,0.3)] animate-bounce">
                  <Loader2 className="animate-spin" size={40} />
                  <p className="font-black text-2xl tracking-tighter italic">Scanning...</p>
                </div>
              ) : (
                <button 
                  onClick={captureAndAnalyze}
                  className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-all border-[8px] border-blue-600"
                >
                  <Camera size={32} className="text-slate-900" />
                </button>
              )}
            </div>
          </div>
          <style>{`@keyframes scan { 0% { top: 0% } 50% { top: 100% } 100% { top: 0% } }`}</style>
        </div>
      )}

      {/* Modern Customer Search Modal */}
      {isCustomerSearchOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl z-[1000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] animate-in zoom-in duration-300 border dark:border-slate-800 transition-colors">
            <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-3xl font-black tracking-tighter dark:text-white italic">Select Client</h2>
              <button onClick={() => setIsCustomerSearchOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-500 transition-all"><X size={24}/></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={24} />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="ID, Name or Phone..." 
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[2rem] focus:ring-4 focus:ring-blue-500/10 dark:text-white transition-all font-bold text-lg placeholder:text-slate-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="max-h-[350px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {availableCustomers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery)).map(c => (
                  <button 
                    key={c.id}
                    onClick={() => { setCustomer(c); setIsCustomerSearchOpen(false); }}
                    className="w-full flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 hover:bg-blue-600 hover:scale-[1.02] rounded-3xl transition-all text-left group"
                  >
                    <div>
                      <p className="font-black text-slate-900 dark:text-white group-hover:text-white transition-colors">{c.name}</p>
                      <p className="text-[11px] font-bold text-slate-400 group-hover:text-blue-100 mt-1 uppercase tracking-widest">{c.phone} <span className="opacity-30">|</span> {c.code}</p>
                    </div>
                    <ChevronRight size={24} className="text-slate-300 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
              <button 
                onClick={() => { setIsCustomerSearchOpen(false); navigate('/customers'); }}
                className="w-full py-5 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-[0.3em] bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] hover:bg-blue-600 hover:text-white transition-all"
              >
                + Register New Corporate/Private Entity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateOrder;
