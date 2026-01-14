
import React, { useState, useEffect } from 'react';
import { Store, ChevronRight, MapPin, Activity, Users, Clock } from 'lucide-react';
import { Branch, User, UserRole } from '../types';
import { getBranches } from '../services/branchService';
import { getOrders } from '../services/orderService';

interface BranchGatewayProps {
  user: User;
  onSelectBranch: (branch: Branch) => void;
}

const BranchGateway: React.FC<BranchGatewayProps> = ({ user, onSelectBranch }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const allOrders = getOrders();

  useEffect(() => {
    setBranches(getBranches());
  }, []);

  const getBranchStats = (branchName: string) => {
    const branchOrders = allOrders.filter(o => o.branch === branchName);
    const today = new Date().toLocaleDateString();
    const todayOrders = branchOrders.filter(o => o.datePlaced === today).length;
    return {
      total: branchOrders.length,
      today: todayOrders
    };
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-slate-950 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black dark:from-slate-900 dark:via-slate-950 dark:to-black transition-colors duration-500">
      <div className="w-full max-w-4xl space-y-12 animate-in fade-in zoom-in duration-700">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-blue-600 dark:bg-blue-700 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20 ring-4 ring-white/5 transition-colors">
            <Store className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Select Access Point</h1>
          <p className="text-slate-400 dark:text-slate-500 font-medium transition-colors">Welcome back, <span className="text-blue-400 dark:text-blue-500">{user.username}</span>. Please select a branch terminal to enter.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {branches.map((branch) => {
            const stats = getBranchStats(branch.name);
            const isAssigned = user.role === UserRole.ADMIN || user.branchId === branch.id;
            
            return (
              <button
                key={branch.id}
                disabled={!isAssigned}
                onClick={() => onSelectBranch(branch)}
                className={`group relative text-left bg-white/5 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-[2.5rem] p-8 transition-all duration-500 hover:scale-[1.02] hover:bg-white/10 ${!isAssigned ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:border-blue-500/50 shadow-2xl hover:shadow-blue-500/10'}`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className={`p-4 rounded-2xl ${isAssigned ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-500'}`}>
                    <Store size={32} />
                  </div>
                  {isAssigned && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                      Terminal Active
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-blue-400 dark:group-hover:text-blue-500 transition-colors">{branch.name}</h3>
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm font-medium transition-colors">
                    <MapPin size={14} className="text-slate-500" />
                    {branch.address}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/5">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest transition-colors">Active Orders</p>
                    <p className="text-xl font-bold text-white">{stats.total}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-600 uppercase tracking-widest transition-colors">New Today</p>
                    <p className="text-xl font-bold text-blue-400 dark:text-blue-500 transition-colors">+{stats.today}</p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                   <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400">
                          <Users size={12} />
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-blue-600 dark:bg-blue-700 flex items-center justify-center text-[10px] font-bold text-white">
                        +2
                      </div>
                   </div>
                   <div className={`p-3 rounded-xl transition-all ${isAssigned ? 'bg-blue-600 dark:bg-blue-700 text-white group-hover:translate-x-1' : 'bg-slate-800 text-slate-600'}`}>
                      <ChevronRight size={20} />
                   </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-6 pt-8">
          <div className="flex items-center gap-8 text-slate-500 dark:text-slate-600 text-xs font-bold uppercase tracking-[0.3em] transition-colors">
            <div className="flex items-center gap-2"><Activity size={14} /> System v4.2.0</div>
            <div className="flex items-center gap-2"><Clock size={14} /> Last sync: Just now</div>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('laundry_user');
              localStorage.removeItem('laundry_branch');
              window.location.reload();
            }}
            className="text-slate-400 dark:text-slate-600 hover:text-white dark:hover:text-slate-300 transition-colors text-sm font-bold flex items-center gap-2"
          >
            Switch User Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchGateway;
