
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Trash2, Search, Printer, Loader2 } from 'lucide-react';
import { OrderItem, Customer } from '@/types';

interface OrderProtocolProps {
  cart: OrderItem[];
  customer: Customer | null;
  subtotal: number;
  tax: number;
  grandTotal: number;
  onProcess: () => void;
  isProcessing: boolean;
}

export default function OrderProtocol({ 
  cart, 
  customer, 
  subtotal, 
  tax, 
  grandTotal, 
  onProcess, 
  isProcessing 
}: OrderProtocolProps) {
  return (
    <div className="w-full xl:w-[450px] shrink-0 space-y-8">
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-[#020617] rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col sticky top-8 transition-all p-10 space-y-12"
      >
        {/* Section Header */}
        <div className="relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
          <h2 className="text-3xl font-black text-white tracking-tighter italic leading-none">Order Protocol</h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2">Next.js 14 / NestJS Kernel</p>
        </div>

        {/* Client Identification */}
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
            </div>
          ) : (
            <button className="w-full flex flex-col items-center justify-center gap-4 p-8 bg-white/5 border-2 border-dashed border-white/10 rounded-[2.5rem] text-slate-500 hover:border-blue-500/50 hover:text-blue-400 transition-all group">
              <div className="p-4 bg-white/5 rounded-2xl transition-transform group-hover:scale-110">
                <Search size={28} />
              </div>
              <span className="font-black text-xs uppercase tracking-[0.2em]">Identify Node Subject</span>
            </button>
          )}
        </div>

        {/* Financial Calculation Block - High Contrast Dark Navy */}
        <div className="space-y-6">
          <div className="space-y-5">
            <div className="flex justify-between items-center text-slate-400 font-black text-sm uppercase tracking-[0.2em] px-1">
              <span>SUBTOTAL</span>
              <span className="text-white">RD$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 font-black text-sm uppercase tracking-[0.2em] px-1">
              <span>ITBIS (18%)</span>
              <span className="text-white">RD$ {tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Grand Total</p>
              <p className="text-5xl font-black text-white tracking-tighter italic leading-none">RD$ {grandTotal.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-600/20 rounded-full border border-blue-500/30">
              <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">Secured</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-6">
          <button 
            onClick={onProcess}
            disabled={isProcessing || !customer || cart.length === 0}
            className={`w-full py-8 rounded-[2.5rem] font-black text-base uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 relative group ${
              isProcessing || !customer || cart.length === 0 
              ? 'bg-white/5 text-slate-600 cursor-not-allowed border border-white/5' 
              : 'bg-white/10 hover:bg-white/15 text-white border border-white/20 hover:border-white/40 shadow-2xl active:scale-95'
            }`}
          >
            {isProcessing ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                COMPLETE ORDER
                <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          <button className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors">
            <Printer size={16} /> Print Physical Receipt
          </button>
        </div>
      </motion.div>
    </div>
  );
}
