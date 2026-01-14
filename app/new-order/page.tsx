
"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, Search, PlusCircle, LayoutGrid, List } from 'lucide-react';
import { GARMENTS, CATEGORIES, COLORS } from '@/constants';
import OrderProtocol from '@/components/orders/OrderProtocol';

export default function NewOrderPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [customer, setCustomer] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = cart.reduce((s, i) => s + i.total, 0);
  const tax = subtotal * 0.18;
  const grandTotal = subtotal + tax;

  const addToCart = (garment: any) => {
    const newItem = {
      id: Math.random().toString(36).substr(2, 9),
      garmentId: garment.id,
      garmentName: garment.name,
      total: garment.basePrice,
      quantity: 1
    };
    setCart([...cart, newItem]);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-1000">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
        <div className="space-y-2">
           <h1 className="text-4xl font-black tracking-tighter dark:text-white italic leading-none uppercase">
            Order <span className="text-blue-600">Entry</span>
           </h1>
           <p className="text-slate-500 font-medium">Provisioning new lifecycle record to NestJS cluster.</p>
        </div>
        <button className="flex items-center justify-center gap-3 px-10 py-5 bg-[#020617] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">
          <ScanLine size={18} /> AI Smart Scan
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        <div className="flex-1 space-y-8">
          <div className="flex p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-x-auto no-scrollbar">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                onClick={() => setSelectedCategory(cat)}
                className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedCategory === cat ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {GARMENTS.filter(g => g.category === selectedCategory).map(garment => (
              <motion.button
                key={garment.id}
                whileHover={{ y: -5 }}
                onClick={() => addToCart(garment)}
                className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-500/50 transition-all text-center group relative overflow-hidden"
              >
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-50 transition-colors">
                  <PlusCircle className="text-slate-300 group-hover:text-blue-600 transition-all group-hover:scale-110" size={32} />
                </div>
                <h3 className="font-black dark:text-white group-hover:text-blue-600 transition-colors">{garment.name}</h3>
                <p className="text-blue-600 font-bold text-sm mt-1">RD$ {garment.basePrice}</p>
              </motion.button>
            ))}
          </div>
        </div>

        <OrderProtocol 
          cart={cart}
          customer={customer}
          subtotal={subtotal}
          tax={tax}
          grandTotal={grandTotal}
          onProcess={() => setIsProcessing(true)}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  );
}
