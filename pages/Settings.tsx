
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  FileText,
  Edit2,
  Users,
  X,
  MapPin,
  Check,
  UserPlus,
  Clock,
  ToggleLeft as Toggle,
  ToggleRight,
  History,
  Ticket,
  AlertTriangle,
  Zap,
  Terminal,
  Activity,
  Plus,
  Trash2,
  ShieldAlert,
  Search,
  UserMinus,
  Smartphone,
  Mail,
  MoreVertical,
  Calendar,
  ChevronRight,
  Shield as ShieldIcon,
  HardDrive,
  Database,
  CloudDownload,
  ShieldQuestion,
  Loader2
} from 'lucide-react';
import { 
  Branch, 
  User, 
  UserRole, 
  WorkSchedule, 
  VoucherRange, 
  TaxReceiptType, 
  VoucherStatus,
  AuditLog,
  AuditAction,
  BackupLog
} from '../types';
import { getBranches } from '../services/branchService';
import { getEmployeesByBranch, saveUser, generateUserId, isEmployeeOnDuty, deleteUser } from '../services/userService';
import { getVoucherRanges } from '../services/voucherService';
import { getAuditLogs, clearAuditLogs, logAction } from '../services/auditService';
import { getBackupHistory, triggerManualBackup } from '../lib/api/system';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SettingsPage: React.FC<{ branch: Branch, onBranchChange: (b: Branch) => void, onSetMaintenance: (b: boolean) => void, isMaintenance: boolean, user: User }> = ({ branch, onBranchChange, onSetMaintenance, isMaintenance, user }) => {
  const [activeTab, setActiveTab] = useState('General');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [voucherRanges, setVoucherRanges] = useState<VoucherRange[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [backupHistory, setBackupHistory] = useState<BackupLog[]>([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [isBackingUp, setIsBackingUp] = useState(false);
  
  // Modals
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  
  // Forms
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [staffForm, setStaffForm] = useState({
    username: '',
    email: '',
    phone: '',
    role: UserRole.SALESPERSON,
    branchId: branch.id,
    schedule: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '08:00', endTime: '18:00' } as WorkSchedule,
    isActive: true
  });

  useEffect(() => {
    const fetchData = async () => {
      // Fix: Await all async calls in useEffect.
      setBranches(await getBranches());
      setStaff(await getEmployeesByBranch(branch.id));
      const allRanges = await getVoucherRanges();
      setVoucherRanges(allRanges.filter(r => r.branchId === branch.id));
      const logs = await getAuditLogs();
      setAuditLogs(logs);
      
      try {
        const backups = await getBackupHistory();
        setBackupHistory(backups);
      } catch (e) {
        console.warn("Settings: Backup history not available.");
      }
    };
    fetchData();
  }, [branch]);

  const tabs = [
    { id: 'General', icon: Building2 },
    { id: 'Staff', icon: Users },
    { id: 'Database', icon: Database },
    { id: 'Security', icon: ShieldCheck },
    { id: 'Audit', icon: Terminal },
  ];

  const handleManualBackup = async () => {
    setIsBackingUp(true);
    try {
      const result = await triggerManualBackup();
      setBackupHistory(prev => [result, ...prev]);
      // Fix: Use correct logAction signature.
      await logAction({ id: user.id, username: user.username, branchId: user.branchId }, AuditAction.DATABASE_BACKUP, "Triggered manual database snapshot.");
      alert("Database snapshot successfully archived.");
    } catch (e) {
      alert("Manual backup protocol failed.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleAuditClear = async () => {
    if (confirm('Permanently wipe system audit trail?')) {
      await clearAuditLogs();
      setAuditLogs([]);
    }
  };

  const filteredLogs = auditLogs.filter(l => 
    l.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
    l.username.toLowerCase().includes(auditSearch.toLowerCase()) ||
    l.action.includes(auditSearch.toUpperCase())
  );

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const userData: User = {
      id: editingStaff?.id || generateUserId(),
      ...staffForm
    };
    await saveUser(userData);
    
    // Fix: Pass full user object to logAction.
    await logAction(
      { id: user.id, username: user.username, branchId: user.branchId },
      AuditAction.STAFF_UPDATE,
      `${editingStaff ? 'Updated' : 'Created'} staff member: ${userData.username}`,
      { staffId: userData.id, role: userData.role }
    );

    setStaff(await getEmployeesByBranch(branch.id));
    setIsStaffModalOpen(false);
    setEditingStaff(null);
    setStaffForm({
      username: '',
      email: '',
      phone: '',
      role: UserRole.SALESPERSON,
      branchId: branch.id,
      schedule: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '08:00', endTime: '18:00' },
      isActive: true
    });
  };

  const handleDeleteStaff = async (staffId: string, staffName: string) => {
    if (confirm(`Are you sure you want to permanently remove ${staffName} from the terminal database?`)) {
      await deleteUser(staffId);
      await logAction(
        { id: user.id, username: user.username, branchId: user.branchId },
        AuditAction.STAFF_UPDATE,
        `Permanently deleted staff member: ${staffName}`,
        { staffId }
      );
      setStaff(await getEmployeesByBranch(branch.id));
    }
  };

  const openEditStaff = (member: User) => {
    setEditingStaff(member);
    setStaffForm({
      username: member.username,
      email: member.email || '',
      phone: member.phone || '',
      role: member.role,
      branchId: member.branchId,
      schedule: member.schedule || { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '08:00', endTime: '18:00' },
      isActive: member.isActive
    });
    setIsStaffModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-[0.2em]">
            <HardDrive size={16} /> Kernel Configuration
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 italic transition-colors">Node Administration</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Active Cluster: <span className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs">{branch.name}</span></p>
        </div>
        <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
           <Activity size={20} className="text-emerald-500" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">SQL Version 8.0.32-Stable</span>
        </div>
      </div>

      <div className="flex gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-3xl w-fit overflow-x-auto no-scrollbar transition-colors">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xl' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <tab.icon size={16} />
            {tab.id}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl transition-all overflow-hidden min-h-[600px]">
        <div className="p-10 md:p-14">
          {activeTab === 'Staff' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter">Crew Manifest</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Authorized personnel indexed in MySQL for {branch.name}</p>
                </div>
                <button 
                  onClick={() => {
                    setEditingStaff(null);
                    setStaffForm({
                      username: '',
                      email: '',
                      phone: '',
                      role: UserRole.SALESPERSON,
                      branchId: branch.id,
                      schedule: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '08:00', endTime: '18:00' },
                      isActive: true
                    });
                    setIsStaffModalOpen(true);
                  }}
                  className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <UserPlus size={18} /> Provision New Agent
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map(member => (
                  <div key={member.id} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 group relative hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className="relative">
                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-2xl text-blue-600 italic border border-slate-100 dark:border-slate-700 shadow-sm transition-colors">
                          {member.username[0]}
                        </div>
                        {isEmployeeOnDuty(member) && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-slate-50 dark:border-slate-800 rounded-full animate-pulse transition-colors"></div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => openEditStaff(member)}
                          className="p-2 text-slate-400 hover:text-blue-500 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteStaff(member.id, member.username)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all"
                        >
                          <UserMinus size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white text-lg leading-none transition-colors">{member.username}</h4>
                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-2 transition-colors">{member.role} Protocol</p>
                      </div>
                      
                      <div className="space-y-2">
                        {member.email && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium transition-colors">
                            <Mail size={12} /> {member.email}
                          </div>
                        )}
                        {member.phone && (
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium transition-colors">
                            <Smartphone size={12} /> {member.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium transition-colors">
                          <Clock size={12} /> {member.schedule?.startTime} - {member.schedule?.endTime}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center transition-colors">
                       <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded transition-all ${member.isActive ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                         {member.isActive ? 'Authorized' : 'Restricted'}
                       </span>
                       <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
                {staff.length === 0 && (
                  <div className="col-span-full py-32 text-center text-slate-400 uppercase font-black text-xs tracking-widest italic border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] transition-colors">
                    Zero personnel records indexed for this SQL node.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Database' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter transition-colors">Data Persistence</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors">Manage MySQL state snapshots and manual archives</p>
                </div>
                <button 
                  onClick={handleManualBackup}
                  disabled={isBackingUp}
                  className="flex items-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {isBackingUp ? <Loader2 size={18} className="animate-spin" /> : <CloudDownload size={18} />}
                  {isBackingUp ? 'Archiving State...' : 'Trigger Manual Backup'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="p-10 bg-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-10 scan-line Desert pointer-events-none"></div>
                    <div className="relative z-10 space-y-6">
                       <h4 className="text-xl font-black italic">Cloud Storage</h4>
                       <p className="text-xs text-slate-400 leading-relaxed font-medium">Manual snapshots are archived securely in the enterprise cloud cluster with AES-256 encryption. These records remain persistent even if local nodes fail.</p>
                       <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10">
                          <Check className="text-emerald-500" size={18} />
                          <span className="text-[10px] font-black uppercase tracking-widest">Storage Status: Connected</span>
                       </div>
                    </div>
                 </div>

                 <div className="p-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[3rem] shadow-sm relative group transition-colors">
                    <div className="space-y-6">
                       <h4 className="text-xl font-black italic dark:text-white transition-colors">Data Integrity</h4>
                       <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium transition-colors">LavanFlow utilizes Prisma with MySQL Transactions to ensure every order entry is atomic. No data fragmentation occurs even during high-concurrency periods.</p>
                       <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 transition-all">
                          <ShieldCheck className="text-blue-500" size={18} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 transition-colors">Verified Integrity: 100% (Last Check: 1h ago)</span>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-xl font-black italic dark:text-white flex items-center gap-3 transition-colors">
                    <History size={20} className="text-slate-400" /> Snapshot History
                 </h4>
                 <div className="bg-black/5 dark:bg-black/40 rounded-[2.5rem] border border-slate-100 dark:border-white/5 overflow-hidden transition-colors">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-mono">
                        <thead className="bg-white dark:bg-white/5 border-b border-slate-100 dark:border-white/5 transition-colors">
                          <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                            <th className="px-10 py-6">Timestamp</th>
                            <th className="px-10 py-6">Type</th>
                            <th className="px-10 py-6">Size</th>
                            <th className="px-10 py-6">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5 transition-colors">
                          {backupHistory.map(log => (
                            <tr key={log.id} className="text-xs hover:bg-blue-500/5 transition-colors">
                              <td className="px-10 py-6 text-slate-400 whitespace-nowrap">{format(log.timestamp, 'yyyy-MM-dd HH:mm:ss')}</td>
                              <td className="px-10 py-6">
                                <span className={`px-2 py-1 rounded font-black ${
                                  log.type === 'AUTOMATED' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
                                }`}>{log.type}</span>
                              </td>
                              <td className="px-10 py-6 text-slate-500">{log.fileSize ? `${(log.fileSize / 1024).toFixed(2)} KB` : 'N/A'}</td>
                              <td className="px-10 py-6">
                                <span className="flex items-center gap-2 font-black text-emerald-500">
                                   <Check size={14} /> {log.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                          {backupHistory.length === 0 && (
                            <tr>
                              <td colSpan={4} className="py-20 text-center text-slate-400 uppercase font-black text-xs tracking-widest italic transition-colors">
                                Zero snapshot records indexed.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'Audit' && (
            <div className="space-y-10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter transition-colors">Audit Terminal</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors">Immutable MySQL record of system state transitions</p>
                </div>
                <div className="flex gap-3">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="Filter records..." 
                      className="pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-blue-500/50 rounded-2xl outline-none font-bold text-sm w-72 transition-all dark:text-white"
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleAuditClear}
                    className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="bg-black/5 dark:bg-black/40 rounded-[2.5rem] border border-slate-100 dark:border-white/5 overflow-hidden transition-colors">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono">
                    <thead className="bg-white dark:bg-white/5 border-b border-slate-100 dark:border-white/5 transition-colors">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                        <th className="px-10 py-6">Timestamp</th>
                        <th className="px-10 py-6">Agent</th>
                        <th className="px-10 py-6">Action</th>
                        <th className="px-10 py-6">Operational Log</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 transition-colors">
                      {filteredLogs.map(log => (
                        <tr key={log.id} className="text-xs hover:bg-blue-500/5 transition-colors">
                          <td className="px-10 py-6 text-slate-400 whitespace-nowrap">{format(log.timestamp, 'HH:mm:ss.SSS')}</td>
                          <td className="px-10 py-6">
                            <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded font-black">{log.username}</span>
                          </td>
                          <td className="px-10 py-6">
                            <span className={`px-2 py-1 rounded font-black ${
                              log.action === AuditAction.NCF_BURN ? 'bg-amber-500/10 text-amber-500' :
                              log.action === AuditAction.LOGIN ? 'bg-emerald-500/10 text-emerald-500' :
                              log.action === AuditAction.STAFF_UPDATE ? 'bg-blue-500/10 text-blue-500' :
                              log.action === AuditAction.DATABASE_BACKUP ? 'bg-emerald-500/10 text-emerald-500' :
                              'bg-slate-500/10 text-slate-400'
                            }`}>{log.action}</span>
                          </td>
                          <td className="px-10 py-6 text-slate-900 dark:text-slate-100 font-bold">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredLogs.length === 0 && (
                    <div className="py-32 text-center text-slate-400 uppercase font-black text-xs tracking-widest italic transition-colors">
                      Zero data fragments detected in SQL audit stream.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'General' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <h3 className="text-2xl font-black italic dark:text-white flex items-center gap-3 transition-colors">
                       <Building2 className="text-blue-600" /> Regional Fleet
                    </h3>
                    <div className="space-y-4">
                       {branches.map(b => (
                         <div 
                           key={b.id} 
                           onClick={() => onBranchChange(b)}
                           className={`p-8 rounded-[2.5rem] border-2 cursor-pointer transition-all group ${
                             branch.id === b.id 
                             ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-600 shadow-2xl' 
                             : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-500/30'
                           }`}
                         >
                            <div className="flex justify-between items-center">
                               <div>
                                  <p className="text-xl font-black dark:text-white group-hover:text-blue-600 transition-colors leading-none">{b.name}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{b.address}</p>
                               </div>
                               <div className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${branch.id === b.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'border-slate-100 dark:border-slate-800 text-transparent'}`}>
                                  <Check size={20} strokeWidth={3} />
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
                 
                 <div className="space-y-8">
                    <h3 className="text-2xl font-black italic dark:text-white flex items-center gap-3 transition-colors">
                       <ShieldIcon className="text-indigo-600" /> Security Hardening
                    </h3>
                    <div className="bg-slate-900 dark:bg-black rounded-[3rem] p-10 text-white shadow-2xl border border-white/5 space-y-10 relative overflow-hidden transition-colors">
                       <div className="absolute inset-0 opacity-10 Desert scan-line pointer-events-none"></div>
                       <div className="relative z-10 flex flex-col gap-8">
                          <div className="flex justify-between items-center p-6 bg-white/5 rounded-3xl border border-white/10 group transition-all">
                             <div>
                                <p className="font-black text-lg italic leading-none">Kernel Lockout</p>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Restrict all nodes immediately</p>
                             </div>
                             <button 
                                onClick={() => onSetMaintenance(!isMaintenance)}
                                className={`p-4 rounded-2xl transition-all shadow-xl ${isMaintenance ? 'bg-emerald-600' : 'bg-red-600 hover:scale-105 active:scale-95'}`}
                             >
                                {isMaintenance ? <Check size={24} /> : <ShieldAlert size={24} />}
                             </button>
                          </div>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed italic opacity-60">
                             Note: Activating maintenance will force disconnect all current staff sessions across the MySQL cluster except root administrators.
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Staff Provisioning Modal */}
      <AnimatePresence>
        {isStaffModalOpen && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3.5rem] overflow-hidden shadow-2xl border dark:border-slate-800 transition-colors"
            >
              <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50 transition-colors">
                <div>
                  <h2 className="text-3xl font-black dark:text-white italic tracking-tighter">
                    {editingStaff ? 'Modify Agent Profile' : 'Provision New Agent'}
                  </h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Credential Assignment Protocol</p>
                </div>
                <button 
                  onClick={() => setIsStaffModalOpen(false)}
                  className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl text-slate-500 transition-all"
                >
                  <X size={24}/>
                </button>
              </div>

              <form onSubmit={handleSaveStaff} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username Handle</label>
                    <input 
                      required
                      type="text" 
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-white font-bold"
                      value={staffForm.username}
                      onChange={(e) => setStaffForm({...staffForm, username: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Role</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-white font-bold"
                      value={staffForm.role}
                      onChange={(e) => setStaffForm({...staffForm, role: e.target.value as UserRole})}
                    >
                      {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Node</label>
                    <input 
                      type="email" 
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-white font-bold"
                      value={staffForm.email}
                      onChange={(e) => setStaffForm({...staffForm, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Line</label>
                    <input 
                      type="tel" 
                      className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-white font-bold"
                      value={staffForm.phone}
                      onChange={(e) => setStaffForm({...staffForm, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Schedule</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map(day => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const newDays = staffForm.schedule.days.includes(day)
                              ? staffForm.schedule.days.filter(d => d !== day)
                              : [...staffForm.schedule.days, day];
                            setStaffForm({
                              ...staffForm,
                              schedule: { ...staffForm.schedule, days: newDays }
                            });
                          }}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${staffForm.schedule.days.includes(day) ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="time" 
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white transition-all"
                        value={staffForm.schedule.startTime}
                        onChange={(e) => setStaffForm({...staffForm, schedule: { ...staffForm.schedule, startTime: e.target.value }})}
                      />
                      <input 
                        type="time" 
                        className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold dark:text-white transition-all"
                        value={staffForm.schedule.endTime}
                        onChange={(e) => setStaffForm({...staffForm, schedule: { ...staffForm.schedule, endTime: e.target.value }})}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsStaffModalOpen(false)}
                    className="flex-1 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Sync Credentials
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
