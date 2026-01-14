
import React, { useState, useEffect } from 'react';
import { Store, ChevronRight, MapPin, Activity, Users, Clock, ShieldCheck, Zap } from 'lucide-react';
import { Branch, Order, User, UserRole } from '../types';
import { getBranches } from '../services/branchService';
import { getOrders } from '../services/orderService';
import { BRANCHES } from '../constants';
import { motion } from 'framer-motion';

interface BranchGatewayProps {
  user: User;
  onSelectBranch: (branch: Branch) => void;
}

const BranchGateway: React.FC<BranchGatewayProps> = ({ user, onSelectBranch }) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedBranches, fetchedOrders] = await Promise.all([
          getBranches(),
          getOrders()
        ]);
        
        // Ensure we always have branches to show by falling back to constants
        const finalBranches = (fetchedBranches && fetchedBranches.length > 0) 
          ? fetchedBranches 
          : BRANCHES;
          
        setBranches(finalBranches);
        setAllOrders(fetchedOrders || []);
      } catch (error) {
        console.error("Gateway node communication failure, reverting to static configuration:", error);
        setBranches(BRANCHES);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:30px_30px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-5xl space-y-16 relative z-10 py-12">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(37,99,235,0.3)] ring-4 ring-white/5"
          >
            <Store className="text-white" size={48} />
          </motion.div>
          <div className="space-y-2">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-black text-white tracking-tighter italic"
            >
              Select Access Point
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-slate-400 font-medium text-lg"
            >
              Welcome back, <span className="text-blue-400 font-bold">{user.username}</span>. Identify active terminal node.
            </motion.p>
          </div>
        </div>

        {/* Branch Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {loading ? (
            Array(2).fill(0).map((_, i) => (
              <div key={i} className="h-80 bg-white/5 rounded-[3rem] border border-white/10 animate-pulse"></div>
            ))
          ) : (
            branches.map((branch, idx) => {
              const stats = getBranchStats(branch.name);
              const isAssigned = user.role === UserRole.ADMIN || user.branchId === branch.id;
              
              return (
                <motion.button
                  key={branch.id}
                  initial={{ x: idx % 2 === 0 ? -30 : 30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 + (idx * 0.1) }}
                  disabled={!isAssigned}
                  onClick={() => onSelectBranch(branch)}
                  className={`group relative text-left bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 transition-all duration-500 overflow-hidden min-h-[340px] flex flex-col justify-between ${
                    !isAssigned 
                    ? 'opacity-40 grayscale cursor-not-allowed' 
                    : 'hover:bg-white/[0.08] hover:border-blue-500/50 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_30px_rgba(59,130,246,0.1)] active:scale-[0.98]'
                  }`}
                >
                  {/* Subtle Scan Line for Active Nodes */}
                  {isAssigned && <div className="absolute inset-0 opacity-[0.03] scan-line pointer-events-none"></div>}
                  
                  <div>
                    <div className="flex justify-between items-start mb-8">
                      <div className={`p-5 rounded-2xl transition-all duration-500 ${isAssigned ? 'bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white' : 'bg-slate-800 text-slate-500'}`}>
                        <Store size={36} />
                      </div>
                      {isAssigned ? (
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                          Access Authorized
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 text-red-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/20">
                          Restricted Node
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-3xl font-black text-white tracking-tight leading-none italic group-hover:text-blue-400 transition-colors">
                        {branch.name}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-bold uppercase tracking-widest">
                        <MapPin size={14} />
                        {branch.address}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-2 gap-6 mt-10 pt-10 border-t border-white/5">
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Active Pipeline</p>
                        <p className="text-2xl font-black text-white">{stats.total} <span className="text-slate-600 text-sm font-medium">Units</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Node Delta</p>
                        <p className="text-2xl font-black text-blue-400">+{stats.today} <span className="text-blue-900 text-sm font-medium uppercase tracking-tighter">New</span></p>
                      </div>
                    </div>

                    <div className="mt-10 flex items-center justify-between">
                       <div className="flex -space-x-3">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full border-4 border-[#020617] bg-slate-800 flex items-center justify-center text-slate-500">
                              <Users size={16} />
                            </div>
                          ))}
                          <div className="w-10 h-10 rounded-full border-4 border-[#020617] bg-blue-600 flex items-center justify-center text-[10px] font-black text-white">
                            +2
                          </div>
                       </div>
                       <div className={`p-4 rounded-2xl transition-all duration-500 ${isAssigned ? 'bg-white/5 text-white group-hover:bg-blue-600 group-hover:translate-x-2' : 'bg-slate-900 text-slate-700'}`}>
                          <ChevronRight size={24} />
                       </div>
                    </div>
                  </div>
                </motion.button>
              );
            })
          )}
        </div>

        {/* Footer Telemetry */}
        <div className="flex flex-col items-center gap-8 pt-10">
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
            <div className="flex items-center gap-2.5 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <Zap size={14} className="text-amber-500 fill-amber-500/20" /> 
              ESOFT-KERNEL V4.2.5
            </div>
            <div className="flex items-center gap-2.5 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <ShieldCheck size={14} className="text-emerald-500" /> 
              ENCRYPTED HANDSHAKE
            </div>
            <div className="flex items-center gap-2.5 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <Clock size={14} className="text-blue-500" /> 
              SYNCED: JUST NOW
            </div>
          </div>
          
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="text-slate-400 hover:text-white transition-all text-xs font-black uppercase tracking-[0.3em] flex items-center gap-3 bg-white/5 px-8 py-4 rounded-2xl border border-white/10 hover:bg-red-500/10 hover:border-red-500/20"
          >
            Switch System Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchGateway;
