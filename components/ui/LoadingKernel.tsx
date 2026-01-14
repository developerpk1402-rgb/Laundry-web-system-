
"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, ShieldAlert } from 'lucide-react';

export default function LoadingKernel() {
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const messages = [
      "> INITIALIZING KERNEL v4.2...",
      "> FETCHING REVENUE TELEMETRY...",
      "> CONNECTING TO NESTJS CLUSTER...",
      "> VALIDATING JWT HANDSHAKE...",
      "> DOCKING SALES MODULES..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        setLogs(prev => [...prev, messages[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-[#020617] z-[50] flex flex-col items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:30px_30px]"></div>
      
      <div className="relative z-10 w-full max-w-xl space-y-8">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/30 animate-pulse shadow-[0_0_30px_rgba(59,130,246,0.2)]">
            <Cpu size={32} className="text-blue-500" />
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-black text-white italic tracking-tighter">LavanFlow Kernel</h2>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1">Booting Subsystems</p>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-md rounded-[2rem] border border-white/5 overflow-hidden">
          <div className="p-6 font-mono text-[11px] text-emerald-400/80 space-y-1.5 h-40 overflow-hidden">
            {logs.map((log, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -5 }} 
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-3"
              >
                <span className="opacity-30">[{new Date().toLocaleTimeString()}]</span>
                <span className="font-bold">{log}</span>
              </motion.div>
            ))}
            <div className="animate-pulse">_</div>
          </div>
        </div>
      </div>
    </div>
  );
}
