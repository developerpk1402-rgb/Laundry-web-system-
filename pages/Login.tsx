
import React, { useState } from 'react';
import { LogIn, Lock, User as UserIcon, Shield } from 'lucide-react';
import { User, UserRole } from '../types';
import { BRANCHES } from '../constants';

const LoginPage: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('Admin');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      id: '1',
      username,
      role: UserRole.ADMIN,
      branchId: BRANCHES[0].id
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-black flex items-center justify-center p-4 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black transition-colors duration-500">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 border border-white/5">
        <div className="bg-blue-600 dark:bg-blue-700 p-12 text-center text-white relative transition-colors duration-500">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md ring-4 ring-white/10">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-2">LavanFlow</h1>
          <p className="text-blue-100 font-medium opacity-80 uppercase text-[10px] tracking-[0.3em]">Identity Verification</p>
          
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg border-4 border-slate-900 dark:border-black transition-colors duration-500">
            <Lock className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
        </div>

        <form onSubmit={handleLogin} className="p-10 pt-16 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Username</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 dark:text-slate-100"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-900 dark:text-slate-100"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            Authenticate <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="pt-8 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
              Authorized Personnel Only<br/>
              © 2025 LavanFlow Enterprise
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;