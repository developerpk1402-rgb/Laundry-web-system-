
"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Shield, Lock, User as UserIcon, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);
    
    try {
      // Simulate validation delay to prevent timing attacks
      await new Promise(r => setTimeout(r, 600));
      await login({ username, password });
    } catch (err) {
      // OWASP A07 - Generic error to prevent account enumeration
      setError('The credentials provided do not match our records.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:30px_30px]"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[3.5rem] shadow-2xl overflow-hidden border border-white/5 relative z-10"
      >
        <div className="bg-blue-600 dark:bg-blue-700 p-12 text-center text-white relative">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-2 italic leading-none">LavanFlow OS</h1>
          <p className="text-blue-100 font-bold uppercase text-[10px] tracking-[0.4em] opacity-80">Secure Gateway Protocol</p>
        </div>

        <form onSubmit={handleSubmit} className="p-12 space-y-8">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-bold"
              >
                <AlertCircle size={18} />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Terminal ID</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  required
                  autoComplete="username"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-blue-500/50 rounded-2xl outline-none transition-all font-black dark:text-white"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Credential Hash</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-transparent focus:border-blue-500/50 rounded-2xl outline-none transition-all font-black dark:text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isPending}
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.3em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3"
          >
            {isPending ? <Loader2 className="animate-spin" /> : <><LogIn size={20} /> Authenticate</>}
          </button>
          
          <p className="text-center text-[9px] text-slate-500 font-bold uppercase tracking-widest opacity-60">
            System strictly monitored. Unauthorized access is a felony.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
