
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
  Loader2,
  Tag,
  Printer,
  Info
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
  BackupLog,
  Garment,
  CompanyInfo,
  BranchSettings,
  PrinterType
} from '../types';
import { getBranches } from '../services/branchService';
import { getEmployeesByBranch, saveUser, generateUserId, isEmployeeOnDuty, deleteUser } from '../services/userService';
import { getVoucherRanges, saveVoucherRange as apiSaveVoucherRange } from '../services/voucherService';
import { getAuditLogs, clearAuditLogs, logAction } from '../services/auditService';
import { getBackupHistory, triggerManualBackup } from '../lib/api/system';
import { api } from '../lib/api-client';
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
  const [inventory, setInventory] = useState<Garment[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [branchSettings, setBranchSettings] = useState<BranchSettings | null>(null);
  
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Modals
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  
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

  const [voucherForm, setVoucherForm] = useState({
    type: TaxReceiptType.FINAL_CONSUMER,
    prefix: 'B02',
    start: 1,
    end: 1000,
    current: 1,
    branchId: branch.id
  });

  useEffect(() => {
    const fetchData = async () => {
      setBranches(await getBranches());
      setStaff(await getEmployeesByBranch(branch.id));
      const allRanges = await getVoucherRanges();
      setVoucherRanges(allRanges.filter(r => r.branchId === branch.id));
      setAuditLogs(await getAuditLogs());
      setInventory(await api.get('/inventory'));
      setCompanyInfo(await api.get('/settings/company'));
      setBranchSettings(await api.get(`/settings/branch/${branch.id}`));
      
      try {
        setBackupHistory(await getBackupHistory());
      } catch (e) {
        console.warn("Settings: Backup history not available.");
      }
    };
    fetchData();
  }, [branch]);

  const tabs = [
    { id: 'General', icon: Building2 },
    { id: 'Inventory', icon: Tag },
    { id: 'Vouchers', icon: Ticket },
    { id: 'Staff', icon: Users },
    { id: 'Database', icon: Database },
    { id: 'Audit', icon: Terminal },
  ];

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await api.post('/settings/company', companyInfo);
    await logAction(user, AuditAction.SETTINGS_UPDATE, "Updated Global Company Information.");
    setIsSaving(false);
    alert("Company settings synchronized.");
  };

  const handleSaveBranchSettings = async () => {
    setIsSaving(true);
    await api.post(`/settings/branch/${branch.id}`, branchSettings);
    await logAction(user, AuditAction.SETTINGS_UPDATE, `Updated Branch-specific settings for ${branch.name}.`);
    setIsSaving(false);
    alert("Branch configuration updated.");
  };

  const updatePrice = async (id: string, newPrice: number) => {
    await api.patch(`/inventory/${id}/price`, { basePrice: newPrice });
    setInventory(prev => prev.map(item => item.id === id ? { ...item, basePrice: newPrice } : item));
    await logAction(user, AuditAction.SUPPLY_UPDATE, `Updated price for item ${id} to RD$ ${newPrice}.`);
  };

  const handleSaveVoucherRange = async (e: React.FormEvent) => {
    e.preventDefault();
    const range = await api.post('/vouchers', voucherForm);
    setVoucherRanges([...voucherRanges, range]);
    setIsVoucherModalOpen(false);
    await logAction(user, AuditAction.SETTINGS_UPDATE, `Provisioned new ${voucherForm.type} range for ${branch.name}.`);
  };

  const handleDeleteVoucher = async (id: string) => {
    if (confirm("Delete this range? Active sequences will be lost.")) {
      await api.delete(`/vouchers/${id}`);
      setVoucherRanges(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleManualBackup = async () => {
    setIsBackingUp(true);
    try {
      const result = await triggerManualBackup();
      setBackupHistory(prev => [result, ...prev]);
      await logAction(user, AuditAction.DATABASE_BACKUP, "Triggered manual database snapshot.");
      alert("Database snapshot successfully archived.");
    } catch (e) {
      alert("Manual backup protocol failed.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const userData: User = {
      id: editingStaff?.id || generateUserId(),
      ...staffForm
    };
    await saveUser(userData);
    await logAction(user, AuditAction.STAFF_UPDATE, `${editingStaff ? 'Updated' : 'Created'} staff member: ${userData.username}`);
    setStaff(await getEmployeesByBranch(branch.id));
    setIsStaffModalOpen(false);
    setEditingStaff(null);
  };

  // Fix: Added missing handleDeleteStaff function
  const handleDeleteStaff = async (id: string, username: string) => {
    if (confirm(`Remove access for ${username}? This action is permanent.`)) {
      await deleteUser(id);
      await logAction(user, AuditAction.STAFF_UPDATE, `Removed staff member: ${username}`);
      setStaff(await getEmployeesByBranch(branch.id));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black text-xs uppercase tracking-[0.2em]">
            <HardDrive size={16} /> Kernel Configuration
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 italic transition-colors">Administration Panel</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Node: <span className="text-blue-600 font-bold uppercase tracking-widest text-xs">{branch.name}</span></p>
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
          
          {activeTab === 'General' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <form onSubmit={handleSaveCompany} className="space-y-8">
                    <h3 className="text-2xl font-black italic dark:text-white flex items-center gap-3">
                       <Building2 className="text-blue-600" /> Company Setup
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2 col-span-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Legal Name</label>
                          <input 
                            required
                            type="text" 
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-white font-bold"
                            value={companyInfo?.name || ''}
                            onChange={(e) => setCompanyInfo({...companyInfo!, name: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Slogan</label>
                          <input 
                            type="text" 
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-white font-bold"
                            value={companyInfo?.slogan || ''}
                            onChange={(e) => setCompanyInfo({...companyInfo!, slogan: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">RNC / Cedula</label>
                          <input 
                            required
                            type="text" 
                            className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-white font-bold"
                            value={companyInfo?.rnc || ''}
                            onChange={(e) => setCompanyInfo({...companyInfo!, rnc: e.target.value})}
                          />
                       </div>
                    </div>
                    <button 
                      type="submit" 
                      disabled={isSaving}
                      className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:scale-[1.02] transition-all"
                    >
                       {isSaving ? 'Synchronizing...' : 'Update Global Information'}
                    </button>
                 </form>
                 
                 <div className="space-y-8">
                    <h3 className="text-2xl font-black italic dark:text-white flex items-center gap-3">
                       <Printer className="text-indigo-600" /> Local Node Config
                    </h3>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 space-y-8">
                       <div className="space-y-4">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Printer Protocol</label>
                          <div className="grid grid-cols-2 gap-4">
                             {[PrinterType.A4, PrinterType.THERMAL_80MM].map(p => (
                               <button 
                                 key={p}
                                 onClick={() => setBranchSettings({...branchSettings!, printerType: p})}
                                 className={`px-4 py-4 rounded-2xl border-2 transition-all font-black text-[10px] uppercase tracking-widest ${branchSettings?.printerType === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400'}`}
                               >
                                  {p}
                               </button>
                             ))}
                          </div>
                       </div>

                       <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <div>
                            <p className="text-xs font-black dark:text-white uppercase tracking-widest">Auto-Print Receipts</p>
                            <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">Instant print after handover</p>
                          </div>
                          <button 
                            onClick={() => setBranchSettings({...branchSettings!, autoPrintReceipt: !branchSettings?.autoPrintReceipt})}
                            className={`w-12 h-6 rounded-full relative transition-all ${branchSettings?.autoPrintReceipt ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                          >
                             <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${branchSettings?.autoPrintReceipt ? 'left-7' : 'left-1'}`}></div>
                          </button>
                       </div>

                       <button 
                         onClick={handleSaveBranchSettings}
                         className="w-full py-5 border-2 border-indigo-600 text-indigo-600 dark:text-indigo-400 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all"
                       >
                         Sync Branch Hardware
                       </button>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'Inventory' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
               <div>
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter">Garment Price Editor</h3>
                 <p className="text-sm text-slate-500 font-medium mt-1">Modify unit valuations for {branch.name}</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {inventory.map(item => (
                   <div key={item.id} className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center font-black text-blue-600 italic border border-slate-100 dark:border-slate-800">
                            {item.name[0]}
                         </div>
                         <div>
                            <p className="font-black dark:text-white text-sm leading-tight">{item.name}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{item.category}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-black text-slate-400">RD$</span>
                         <input 
                           type="number" 
                           className="w-24 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl font-black text-sm text-blue-600 text-right outline-none focus:ring-2 focus:ring-blue-500/20"
                           value={item.basePrice}
                           onChange={(e) => updatePrice(item.id, parseFloat(e.target.value))}
                         />
                      </div>
                   </div>
                 ))}
               </div>
            </div>
          )}

          {activeTab === 'Vouchers' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter">Voucher Ranges (NCF)</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Sequential fiscal sequence management</p>
                </div>
                <button 
                  onClick={() => setIsVoucherModalOpen(true)}
                  className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20"
                >
                  <Plus size={18} /> Provision Range
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                 {voucherRanges.map(v => (
                   <div key={v.id} className="p-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4">
                         <button onClick={() => handleDeleteVoucher(v.id)} className="text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                      </div>
                      <div className="space-y-4">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs italic">
                               {v.prefix}
                            </div>
                            <div>
                               <p className="font-black text-sm dark:text-white leading-none">{v.type}</p>
                               <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Status: <span className="text-emerald-500">{v.status}</span></p>
                            </div>
                         </div>
                         <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-end mb-2">
                               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Usage Index</p>
                               <p className="text-xs font-black dark:text-white">{v.current - v.start} / {v.end - v.start}</p>
                            </div>
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                               <div className="h-full bg-blue-600" style={{ width: `${((v.current - v.start) / (v.end - v.start)) * 100}%` }}></div>
                            </div>
                            <div className="flex justify-between mt-4">
                               <div>
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Start</p>
                                  <p className="text-xs font-mono font-bold dark:text-slate-300">{v.prefix}{v.start.toString().padStart(8, '0')}</p>
                               </div>
                               <div className="text-right">
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Next NCF</p>
                                  <p className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">{v.prefix}{v.current.toString().padStart(8, '0')}</p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {activeTab === 'Staff' && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter">Crew Manifest</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Authorized personnel indexed for {branch.name}</p>
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
                  className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20"
                >
                  <UserPlus size={18} /> Provision New Agent
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map(member => (
                  <div key={member.id} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 group relative hover:shadow-xl transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-2xl text-blue-600 italic border border-slate-100">
                        {member.username[0]}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingStaff(member); setStaffForm({ username: member.username, email: member.email || '', phone: member.phone || '', role: member.role, branchId: member.branchId, schedule: member.schedule || staffForm.schedule, isActive: member.isActive }); setIsStaffModalOpen(true); }} className="p-2 text-slate-400 hover:text-blue-500"><Edit2 size={18} /></button>
                        <button onClick={() => handleDeleteStaff(member.id, member.username)} className="p-2 text-slate-400 hover:text-red-500"><UserMinus size={18} /></button>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-lg leading-none">{member.username}</h4>
                      <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mt-2">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Audit' && (
            <div className="space-y-10">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white italic tracking-tighter">Audit Terminal</h3>
              <div className="bg-black/5 dark:bg-black/40 rounded-[2.5rem] border border-slate-100 dark:border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono">
                    <thead className="bg-white dark:bg-white/5 border-b border-slate-100 transition-colors">
                      <tr className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
                        <th className="px-10 py-6">Timestamp</th>
                        <th className="px-10 py-6">Agent</th>
                        <th className="px-10 py-6">Action</th>
                        <th className="px-10 py-6">Operational Log</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 transition-colors">
                      {auditLogs.slice(0, 50).map(log => (
                        <tr key={log.id} className="text-xs hover:bg-blue-500/5">
                          <td className="px-10 py-6 text-slate-400 whitespace-nowrap">{format(log.timestamp, 'HH:mm:ss.SSS')}</td>
                          <td className="px-10 py-6">
                            <span className="px-2 py-1 bg-blue-500/10 text-blue-500 rounded font-black">{log.username}</span>
                          </td>
                          <td className="px-10 py-6 font-black uppercase">{log.action}</td>
                          <td className="px-10 py-6 text-slate-900 dark:text-slate-100 font-bold">{log.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
              className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3.5rem] overflow-hidden shadow-2xl border dark:border-slate-800"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black dark:text-white italic tracking-tighter">
                    {editingStaff ? 'Modify Agent' : 'Provision New Agent'}
                  </h2>
                </div>
                <button onClick={() => setIsStaffModalOpen(false)} className="p-4 hover:bg-slate-100 rounded-2xl text-slate-500"><X size={24}/></button>
              </div>
              <form onSubmit={handleSaveStaff} className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Username</label>
                    <input required type="text" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl font-bold dark:text-white outline-none" value={staffForm.username} onChange={(e) => setStaffForm({...staffForm, username: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Role</label>
                    <select className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl font-bold dark:text-white outline-none" value={staffForm.role} onChange={(e) => setStaffForm({...staffForm, role: e.target.value as UserRole})}>
                      {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Sync Credentials</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Voucher Provisioning Modal */}
      <AnimatePresence>
        {isVoucherModalOpen && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[1000] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-2xl border dark:border-slate-800"
            >
              <div className="p-10 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-3xl font-black italic tracking-tighter dark:text-white">Provision NCF</h2>
                <button onClick={() => setIsVoucherModalOpen(false)} className="p-4 hover:bg-slate-100 rounded-2xl text-slate-500"><X size={24}/></button>
              </div>
              <form onSubmit={handleSaveVoucherRange} className="p-10 space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt Category</label>
                  <select className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl font-bold dark:text-white outline-none" value={voucherForm.type} onChange={(e) => setVoucherForm({...voucherForm, type: e.target.value as TaxReceiptType, prefix: e.target.value.includes('B01') ? 'B01' : e.target.value.includes('B02') ? 'B02' : 'B15'})}>
                    {Object.values(TaxReceiptType).filter(t => t !== TaxReceiptType.NONE).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Range Start</label>
                      <input type="number" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl font-bold dark:text-white outline-none" value={voucherForm.start} onChange={(e) => setVoucherForm({...voucherForm, start: parseInt(e.target.value), current: parseInt(e.target.value)})} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Range End</label>
                      <input type="number" className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 rounded-2xl font-bold dark:text-white outline-none" value={voucherForm.end} onChange={(e) => setVoucherForm({...voucherForm, end: parseInt(e.target.value)})} />
                   </div>
                </div>
                <button type="submit" className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">Activate Sequence</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;
