
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Tag, 
  Database, 
  Printer, 
  Save, 
  Plus,
  Trash2,
  Check,
  Mail,
  FileText,
  Clock,
  ToggleLeft as Toggle,
  ToggleRight,
  X,
  MapPin,
  Edit2,
  Users,
  UserPlus,
  Calendar,
  MoreVertical,
  Activity,
  Key,
  Ticket,
  AlertTriangle,
  History,
  Store,
  Settings2,
  Zap,
  Cpu,
  ShieldAlert
} from 'lucide-react';
import { Branch, User, UserRole, WorkSchedule, VoucherRange, TaxReceiptType, VoucherStatus } from '../types';
import { getBranches, saveBranch, deleteBranch, generateBranchId } from '../services/branchService';
import { getEmployeesByBranch, saveUser, deleteUser, generateUserId, isEmployeeOnDuty } from '../services/userService';
import { getVoucherRanges, saveVoucherRange, deleteVoucherRange, generateVoucherId } from '../services/voucherService';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SettingsPage: React.FC<{ branch: Branch, onBranchChange: (b: Branch) => void, onSetMaintenance: (b: boolean) => void, isMaintenance: boolean }> = ({ branch, onBranchChange, onSetMaintenance, isMaintenance }) => {
  const [activeTab, setActiveTab] = useState('General');
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [voucherRanges, setVoucherRanges] = useState<VoucherRange[]>([]);
  
  // Modals
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  
  // Forms
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [editingStaff, setEditingStaff] = useState<User | null>(null);
  const [editingVoucher, setEditingVoucher] = useState<VoucherRange | null>(null);
  
  const [branchForm, setBranchForm] = useState({ name: '', address: '', rnc: '' });
  const [staffForm, setStaffForm] = useState({
    username: '',
    email: '',
    role: UserRole.SALESPERSON,
    schedule: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '08:00', endTime: '18:00' } as WorkSchedule,
    isActive: true
  });
  const [voucherForm, setVoucherForm] = useState({
    type: TaxReceiptType.FINAL_CONSUMER,
    prefix: 'B02',
    start: 1,
    end: 1000
  });

  useEffect(() => {
    setBranches(getBranches());
    setStaff(getEmployeesByBranch(branch.id));
    setVoucherRanges(getVoucherRanges().filter(r => r.branchId === branch.id));
  }, [branch]);

  // Branch Handlers
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchForm({ name: '', address: '', rnc: '' });
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranch = (b: Branch, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingBranch(b);
    setBranchForm({ name: b.name, address: b.address, rnc: b.rnc });
    setIsBranchModalOpen(true);
  };

  const handleSubmitBranch = (e: React.FormEvent) => {
    e.preventDefault();
    const b: Branch = {
      id: editingBranch?.id || generateBranchId(),
      name: branchForm.name,
      address: branchForm.address,
      rnc: branchForm.rnc
    };
    const updated = saveBranch(b);
    setBranches(updated);
    setIsBranchModalOpen(false);
    if (b.id === branch.id) onBranchChange(b);
  };

  // Staff Handlers
  const handleOpenAddStaff = () => {
    setEditingStaff(null);
    setStaffForm({
      username: '',
      email: '',
      role: UserRole.SALESPERSON,
      schedule: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '08:00', endTime: '18:00' },
      isActive: true
    });
    setIsStaffModalOpen(true);
  };

  const handleOpenEditStaff = (u: User) => {
    setEditingStaff(u);
    setStaffForm({
      username: u.username,
      email: u.email || '',
      role: u.role,
      schedule: u.schedule || { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '08:00', endTime: '18:00' },
      isActive: u.isActive
    });
    setIsStaffModalOpen(true);
  };

  const handleSubmitStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: editingStaff?.id || generateUserId(),
      username: staffForm.username,
      email: staffForm.email,
      role: staffForm.role,
      branchId: branch.id,
      isActive: staffForm.isActive,
      schedule: staffForm.schedule
    };
    saveUser(newUser);
    setStaff(getEmployeesByBranch(branch.id));
    setIsStaffModalOpen(false);
  };

  const toggleDay = (day: string) => {
    const currentDays = [...staffForm.schedule.days];
    if (currentDays.includes(day)) {
      setStaffForm({
        ...staffForm,
        schedule: { ...staffForm.schedule, days: currentDays.filter(d => d !== day) }
      });
    } else {
      setStaffForm({
        ...staffForm,
        schedule: { ...staffForm.schedule, days: [...currentDays, day] }
      });
    }
  };

  // Voucher Handlers
  const handleOpenAddVoucher = () => {
    setEditingVoucher(null);
    setVoucherForm({ type: TaxReceiptType.FINAL_CONSUMER, prefix: 'B02', start: 1, end: 1000 });
    setIsVoucherModalOpen(true);
  };

  const handleSubmitVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const range: VoucherRange = {
      id: editingVoucher?.id || generateVoucherId(),
      type: voucherForm.type,
      prefix: voucherForm.prefix,
      start: voucherForm.start,
      end: voucherForm.end,
      current: editingVoucher?.current || 0,
      branchId: branch.id,
      status: editingVoucher?.status || VoucherStatus.ACTIVE,
      createdAt: editingVoucher?.createdAt || new Date().toISOString()
    };
    saveVoucherRange(range);
    setVoucherRanges(getVoucherRanges().filter(r => r.branchId === branch.id));
    setIsVoucherModalOpen(false);
  };

  const tabs = [
    { id: 'General', icon: Building2 },
    { id: 'Staff', icon: Users },
    { id: 'Vouchers', icon: Ticket },
    { id: 'Fiscal', icon: FileText },
    { id: 'Roles', icon: ShieldCheck },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 transition-colors italic">System Node Control</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Configuring: <span className="text-blue-600 dark:text-blue-400 font-bold">{branch.name}</span></p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3 transition-colors">
           <Activity size={18} className="text-emerald-500" />
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Node Cluster v4.2.1-STABLE</span>
        </div>
      </div>

      <div className="flex gap-2 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl w-full sm:w-fit no-print transition-colors overflow-x-auto no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-lg ring-1 ring-slate-200 dark:ring-slate-700' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon size={18} />
            {tab.id}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/30 dark:shadow-black/50 overflow-hidden transition-colors">
        <div className="p-6 sm:p-12">
          {activeTab === 'General' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <h3 className="text-2xl font-black flex items-center gap-3 dark:text-slate-100 transition-colors italic">
                    <Building2 className="text-blue-600 dark:text-blue-400" size={24} />
                    Terminal Network
                  </h3>
                  <div className="space-y-4">
                    {branches.map(b => (
                      <div 
                        key={b.id}
                        onClick={() => onBranchChange(b)}
                        className={`group w-full flex items-center justify-between p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${
                          branch.id === b.id 
                            ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-600 dark:border-blue-500 shadow-xl shadow-blue-500/10' 
                            : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="text-left">
                          <p className="font-black text-lg text-slate-900 dark:text-slate-100 transition-colors leading-none mb-2">{b.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">
                            <MapPin size={12} className="text-blue-500" /> {b.address.split(',')[0]}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <button onClick={(e) => handleOpenEditBranch(b, e)} className="p-3 text-slate-300 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all opacity-0 group-hover:opacity-100 bg-slate-50 dark:bg-slate-800 rounded-xl">
                             <Edit2 size={16} />
                           </button>
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${branch.id === b.id ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-transparent'}`}>
                             {branch.id === b.id && <Check size={16} strokeWidth={3} />}
                           </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={handleOpenAddBranch} className="w-full flex items-center justify-center gap-3 py-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2rem] text-slate-400 dark:text-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-black text-xs uppercase tracking-widest">
                      <Plus size={20} /> Register New Fleet Member
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                   <h3 className="text-2xl font-black dark:text-slate-100 transition-colors italic">Global Identity</h3>
                   <div className="p-10 bg-slate-50 dark:bg-slate-800/50 rounded-[3rem] border border-slate-100 dark:border-slate-800 space-y-8 transition-colors shadow-inner">
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Entity Primary Name</label>
                        <input type="text" className="w-full p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-lg dark:text-slate-100 transition-colors focus:ring-4 focus:ring-blue-500/10 outline-none" defaultValue="LavanFlow Laundry Services" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Group RNC</label>
                        <input type="text" className="w-full p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl font-black text-lg dark:text-slate-100 transition-colors focus:ring-4 focus:ring-blue-500/10 outline-none" defaultValue="131-00200-3" />
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Staff' && (
            <div className="space-y-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight transition-colors italic">Branch Roster</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors mt-1">Personnel fleet currently docked at {branch.name}</p>
                </div>
                <button 
                  onClick={handleOpenAddStaff}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 dark:bg-blue-700 text-white rounded-[2rem] font-black hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/20 active:scale-95 text-xs uppercase tracking-widest"
                >
                  <UserPlus size={20} /> Register Personnel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {staff.map(employee => {
                  const onDuty = isEmployeeOnDuty(employee);
                  return (
                    <div key={employee.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all p-8 group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-[4rem] -z-10 group-hover:bg-blue-500/10 transition-colors"></div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="relative">
                          <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl font-black italic shadow-lg ${
                            employee.role === UserRole.ADMIN ? 'bg-slate-900 dark:bg-black text-white' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          }`}>
                            {employee.username[0]}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 ${onDuty ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-700 shadow-inner'}`}></div>
                        </div>
                        <button onClick={() => handleOpenEditStaff(employee)} className="p-3 text-slate-300 dark:text-slate-600 hover:text-blue-600 dark:hover:text-blue-400 transition-all bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <Edit2 size={18} />
                        </button>
                      </div>

                      <div className="space-y-1 mb-8">
                        <div className="flex items-center gap-2">
                          <h4 className="text-lg font-black text-slate-900 dark:text-slate-100 transition-colors">{employee.username}</h4>
                          {onDuty && (
                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">Live</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-bold truncate transition-colors uppercase tracking-tight italic">{employee.email || 'No credentials'}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-8">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] shadow-sm ${
                          employee.role === UserRole.ADMIN ? 'bg-slate-900 dark:bg-black text-white' :
                          employee.role === UserRole.SALESPERSON ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                          employee.role === UserRole.CASHIER ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                          'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                        }`}>
                          {employee.role}
                        </span>
                        <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors border border-slate-200 dark:border-slate-700">
                           {employee.schedule?.startTime} - {employee.schedule?.endTime}
                        </span>
                      </div>

                      <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between transition-colors">
                         <div className="flex gap-1.5">
                            {DAYS.map(day => {
                              const isWorkDay = employee.schedule?.days.includes(day);
                              return (
                                <div key={day} className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black transition-all ${isWorkDay ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600'}`}>
                                  {day[0]}
                                </div>
                              );
                            })}
                         </div>
                         <button onClick={() => handleOpenEditStaff(employee)} className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 hover:underline">
                           Shift Log
                         </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'Vouchers' && (
            <div className="space-y-10">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight transition-colors italic">Fiscal Ranges (NCF)</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors mt-1">Managing sequences for {branch.name}</p>
                </div>
                <button 
                  onClick={handleOpenAddVoucher}
                  className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 dark:bg-indigo-700 text-white rounded-[2rem] font-black hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-500/20 active:scale-95 text-xs uppercase tracking-widest"
                >
                  <Plus size={20} /> New NCF Sequence
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {voucherRanges.map(range => {
                  const used = range.current;
                  const total = range.end - range.start + 1;
                  const percentage = (used / total) * 100;
                  
                  return (
                    <div key={range.id} className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-10 space-y-8 group hover:shadow-2xl transition-all relative overflow-hidden">
                      <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 -mr-16 -mt-16 rounded-full blur-2xl ${
                        range.status === VoucherStatus.ACTIVE ? 'bg-blue-500' : 'bg-red-500'
                      }`}></div>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-5">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-colors ${
                            range.status === VoucherStatus.ACTIVE ? 'bg-blue-600 dark:bg-blue-500 text-white' :
                            range.status === VoucherStatus.LOW ? 'bg-amber-500 dark:bg-amber-500 text-white' :
                            'bg-red-600 dark:bg-red-500 text-white'
                          }`}>
                            <Ticket size={28} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">{range.type}</p>
                            <h4 className="text-2xl font-black text-slate-900 dark:text-slate-100 transition-colors italic">{range.prefix} Block</h4>
                          </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors shadow-sm ${
                          range.status === VoucherStatus.ACTIVE ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                          range.status === VoucherStatus.LOW ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                          'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        }`}>
                          {range.status}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 transition-colors">
                          <span>Sequence Burn Rate</span>
                          <span className="dark:text-slate-200 transition-colors">{used} / {total} BURNED</span>
                        </div>
                        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors border border-slate-200 dark:border-slate-700 shadow-inner">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              percentage > 90 ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : percentage > 70 ? 'bg-amber-500' : 'bg-blue-600 dark:bg-blue-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-slate-800 transition-colors">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 transition-colors">Anchor Point</p>
                          <p className="font-mono font-black text-lg text-slate-900 dark:text-slate-100 transition-colors">{range.prefix}{range.start.toString().padStart(8, '0')}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 transition-colors">Ceiling Point</p>
                          <p className="font-mono font-black text-lg text-slate-900 dark:text-slate-100 transition-colors">{range.prefix}{range.end.toString().padStart(8, '0')}</p>
                        </div>
                      </div>
                      
                      {range.status === VoucherStatus.LOW && (
                        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl flex items-center gap-3 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-widest transition-colors shadow-sm">
                          <AlertTriangle size={18} className="animate-pulse" /> Urgent: Replenish NCF inventory
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'Fiscal' && (
            <div className="space-y-12 animate-in slide-in-from-bottom-4">
              <div className="bg-indigo-900 dark:bg-black p-12 rounded-[3.5rem] border border-white/5 transition-all shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent opacity-50"></div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-black text-white mb-3 flex items-center gap-4 italic">
                    <FileText size={32} className="text-blue-400" /> DGII 607+ Automated Engine
                  </h3>
                  <p className="text-indigo-200 dark:text-slate-400 text-base font-medium mb-10 max-w-2xl leading-relaxed">
                    Orchestrate how the system declares transactional throughput to the fiscal department. Zero-touch compliance protocols.
                  </p>
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 shadow-2xl transition-all hover:bg-white/10 group">
                      <div className="flex items-center gap-6 mb-4 sm:mb-0">
                        <div className="p-4 bg-indigo-500/20 text-blue-400 rounded-[1.5rem] transition-transform group-hover:rotate-12">
                          <Clock size={28} />
                        </div>
                        <div>
                          <p className="font-black text-xl text-white italic">Automatic Daily Dispatch</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Scheduled: 23:59 AST • Standard 607 Format</p>
                        </div>
                      </div>
                      <button className="text-blue-400 hover:text-white transition-colors">
                        <ToggleRight size={56} strokeWidth={1} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maintenance Mode Activation */}
              <div className="bg-slate-900 dark:bg-[#020617] p-12 rounded-[3.5rem] border border-red-500/20 transition-all shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="p-3 bg-red-600/10 text-red-500 rounded-2xl">
                            <ShieldAlert size={28} />
                         </div>
                         <h3 className="text-2xl font-black text-white italic">Kernel Maintenance</h3>
                      </div>
                      <p className="text-slate-400 max-w-lg font-medium leading-relaxed">
                        Immediately lock down the entire terminal network. This mode restricts all non-privileged nodes and initiates cluster-wide maintenance protocols.
                      </p>
                   </div>
                   <button 
                     onClick={() => onSetMaintenance(!isMaintenance)}
                     className={`flex items-center gap-4 px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl ${
                        isMaintenance 
                        ? 'bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-500' 
                        : 'bg-red-600 text-white shadow-red-500/20 hover:bg-red-500'
                     }`}
                   >
                      {isMaintenance ? <Zap size={20} /> : <Lock size={20} />}
                      {isMaintenance ? 'Release Lockout' : 'Activate Maintenance'}
                   </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Roles' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <div>
                   <h3 className="text-3xl font-black dark:text-slate-100 transition-colors italic">Authorization Matrix</h3>
                   <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors mt-1">Cross-node credential standardization</p>
                </div>
              </div>
              <div className="overflow-hidden border border-slate-200 dark:border-slate-800 rounded-[3rem] shadow-xl transition-colors">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 transition-colors">
                    <tr className="text-slate-400 dark:text-slate-500 font-black uppercase text-[10px] tracking-[0.3em] transition-colors border-b border-slate-100 dark:border-slate-700">
                      <th className="px-10 py-6 text-left">Role Assignment</th>
                      <th className="px-8 py-6 text-center">Invoicing</th>
                      <th className="px-8 py-6 text-center">Core Operations</th>
                      <th className="px-8 py-6 text-center">System Kernel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800 transition-colors">
                    {Object.values(UserRole).map(role => (
                      <tr key={role} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/5 transition-all group">
                        <td className="px-10 py-6">
                          <div className="font-black text-lg text-slate-900 dark:text-slate-100 transition-colors italic group-hover:text-blue-600">{role}</div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex justify-center">
                            <input type="checkbox" defaultChecked={role !== UserRole.OPERATOR} className="w-6 h-6 rounded-lg border-slate-300 dark:border-slate-700 bg-transparent text-blue-600 focus:ring-blue-500 transition-all cursor-not-allowed" disabled />
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex justify-center">
                            <input type="checkbox" defaultChecked={true} className="w-6 h-6 rounded-lg border-slate-300 dark:border-slate-700 bg-transparent text-blue-600 focus:ring-blue-500 transition-all cursor-not-allowed" disabled />
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <div className="flex justify-center">
                            <input type="checkbox" defaultChecked={role === UserRole.ADMIN} className="w-6 h-6 rounded-lg border-slate-300 dark:border-slate-700 bg-transparent text-blue-600 focus:ring-blue-500 transition-all cursor-not-allowed" disabled />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-3 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                 <ShieldCheck size={16} className="text-blue-500" /> Roles are static in current firmware. Contact administrator for custom policy overrides.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Staff Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-[1000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 border dark:border-slate-800 transition-all flex flex-col max-h-[90vh]">
             <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white transition-colors italic tracking-tighter">{editingStaff ? 'Update Credential' : 'Register Crew'}</h2>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 transition-colors">Personnel Node Docking</p>
                </div>
                <button onClick={() => setIsStaffModalOpen(false)} className="p-4 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-500 dark:text-slate-400 shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-700"><X size={24}/></button>
             </div>
             <form onSubmit={handleSubmitStaff} className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 mb-2 ml-1">Identity & Access</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 transition-colors">Username Handle</label>
                          <input 
                            required
                            type="text" 
                            className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                            placeholder="e.g. jdoe_ops"
                            value={staffForm.username}
                            onChange={(e) => setStaffForm({...staffForm, username: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 transition-colors">Email Terminal</label>
                          <input 
                            required
                            type="email" 
                            className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                            placeholder="staff@lavanflow.pro"
                            value={staffForm.email}
                            onChange={(e) => setStaffForm({...staffForm, email: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1 transition-colors">System Privilege</label>
                          <select 
                            className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                            value={staffForm.role}
                            onChange={(e) => setStaffForm({...staffForm, role: e.target.value as UserRole})}
                          >
                            {Object.values(UserRole).filter(r => r !== UserRole.SPECIAL).map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                        <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Docking Status</span>
                           <button 
                             type="button"
                             onClick={() => setStaffForm({...staffForm, isActive: !staffForm.isActive})}
                             className={`${staffForm.isActive ? 'text-blue-500' : 'text-slate-400'} transition-colors`}
                           >
                             {staffForm.isActive ? <ToggleRight size={48} strokeWidth={1} /> : <Toggle size={48} strokeWidth={1} />}
                           </button>
                        </div>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-400 mb-2 ml-1">Duty Roster</h4>
                      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] space-y-6 shadow-inner">
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 transition-colors">Active Operations Days</label>
                          <div className="grid grid-cols-4 gap-2">
                             {DAYS.map(day => {
                               const isActive = staffForm.schedule.days.includes(day);
                               return (
                                 <button 
                                   key={day}
                                   type="button"
                                   onClick={() => toggleDay(day)}
                                   className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${
                                     isActive 
                                     ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' 
                                     : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-500'
                                   }`}
                                 >
                                   {day.slice(0, 3)}
                                 </button>
                               );
                             })}
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 transition-colors">Shift Start</label>
                              <div className="relative">
                                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                  type="time" 
                                  className="w-full pl-10 pr-4 py-4 bg-white dark:bg-slate-900 border-none rounded-xl font-black text-sm dark:text-white transition-all outline-none focus:ring-4 focus:ring-blue-500/10"
                                  value={staffForm.schedule.startTime}
                                  onChange={(e) => setStaffForm({...staffForm, schedule: { ...staffForm.schedule, startTime: e.target.value }})}
                                />
                              </div>
                           </div>
                           <div>
                              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 transition-colors">Shift End</label>
                              <div className="relative">
                                <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                  type="time" 
                                  className="w-full pl-10 pr-4 py-4 bg-white dark:bg-slate-900 border-none rounded-xl font-black text-sm dark:text-white transition-all outline-none focus:ring-4 focus:ring-blue-500/10"
                                  value={staffForm.schedule.endTime}
                                  onChange={(e) => setStaffForm({...staffForm, schedule: { ...staffForm.schedule, endTime: e.target.value }})}
                                />
                              </div>
                           </div>
                        </div>
                      </div>
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex gap-3 text-indigo-700 dark:text-indigo-400 transition-colors">
                        <AlertTriangle size={20} className="shrink-0" />
                        <p className="text-[10px] font-bold leading-relaxed uppercase">
                          Operations outside shift hours require Admin override or manual clock-in.
                        </p>
                      </div>
                   </div>
                </div>
             </form>
             <div className="p-10 border-t border-slate-100 dark:border-slate-800 flex gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                <button type="button" onClick={() => setIsStaffModalOpen(false)} className="flex-1 py-5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-[10px] uppercase tracking-[0.2em] border border-slate-200 dark:border-slate-700">Abound Mission</button>
                <button 
                  type="button"
                  onClick={handleSubmitStaff}
                  className="flex-1 py-5 bg-blue-600 dark:bg-blue-700 text-white rounded-2xl font-black hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-[0_10px_30px_rgba(59,130,246,0.3)] text-[10px] uppercase tracking-[0.2em]"
                >
                  {editingStaff ? 'Finalize Update' : 'Initialize Personnel'}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-[1000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border dark:border-slate-800 transition-colors">
             <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white transition-colors italic tracking-tighter">Fleet Module</h2>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 transition-colors">Terminal Configuration</p>
                </div>
                <button onClick={() => setIsBranchModalOpen(false)} className="p-4 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-colors text-slate-500 dark:text-slate-400"><X size={24}/></button>
             </div>
             <form onSubmit={handleSubmitBranch} className="p-10 space-y-8">
                <div className="space-y-6">
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 transition-colors">Branding Callsign</label>
                      <input 
                        required
                        type="text" 
                        className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                        value={branchForm.name}
                        onChange={(e) => setBranchForm({...branchForm, name: e.target.value})}
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 transition-colors">Physical Coordinates</label>
                      <input 
                        required
                        type="text" 
                        className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                        value={branchForm.address}
                        onChange={(e) => setBranchForm({...branchForm, address: e.target.value})}
                      />
                   </div>
                   <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 transition-colors">RNC Signature</label>
                      <input 
                        required
                        type="text" 
                        className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                        value={branchForm.rnc}
                        onChange={(e) => setBranchForm({...branchForm, rnc: e.target.value})}
                      />
                   </div>
                </div>
                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setIsBranchModalOpen(false)} className="flex-1 py-5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-[10px] uppercase tracking-[0.2em] border border-slate-200 dark:border-slate-700">Discard</button>
                  <button type="submit" className="flex-1 py-5 bg-blue-600 dark:bg-blue-700 text-white rounded-2xl font-black hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/20 text-[10px] uppercase tracking-[0.2em]">Deploy Updates</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Voucher Modal */}
      {isVoucherModalOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-[1000] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border dark:border-slate-800 transition-colors">
             <div className="p-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white transition-colors italic tracking-tighter">Fiscal Block</h2>
                  <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1 transition-colors">NCF Range Calibration</p>
                </div>
                <button onClick={() => setIsVoucherModalOpen(false)} className="p-4 hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-500 dark:text-slate-400"><X size={24}/></button>
             </div>
             <form onSubmit={handleSubmitVoucher} className="p-10 space-y-8">
                <div className="space-y-6">
                   <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 transition-colors">Emission Protocol</label>
                    <select 
                      className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                      value={voucherForm.type}
                      onChange={(e) => {
                        const type = e.target.value as TaxReceiptType;
                        const prefix = type.includes('B01') ? 'B01' : type.includes('B02') ? 'B02' : 'B15';
                        setVoucherForm({...voucherForm, type, prefix});
                      }}
                    >
                      {Object.values(TaxReceiptType).filter(t => t !== TaxReceiptType.NONE).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                     <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 transition-colors">Start Vector</label>
                      <input 
                        type="number" 
                        required
                        className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                        value={voucherForm.start}
                        onChange={(e) => setVoucherForm({...voucherForm, start: parseInt(e.target.value)})}
                      />
                     </div>
                     <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 transition-colors">Ceiling Vector</label>
                      <input 
                        type="number" 
                        required
                        className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl font-black dark:text-white outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                        value={voucherForm.end}
                        onChange={(e) => setVoucherForm({...voucherForm, end: parseInt(e.target.value)})}
                      />
                     </div>
                   </div>
                </div>
                <div className="p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-[1.5rem] border border-indigo-100 dark:border-indigo-900/30 flex gap-4 text-indigo-700 dark:text-indigo-300 transition-colors shadow-sm">
                  <ShieldCheck size={24} className="shrink-0" />
                  <p className="text-[10px] font-black leading-relaxed transition-colors uppercase tracking-tight">
                    Validated sequences are consumed chronologically. Authorization must match current DGII fleet credentials.
                  </p>
                </div>
                <div className="flex gap-4 pt-6">
                  <button type="button" onClick={() => setIsVoucherModalOpen(false)} className="flex-1 py-5 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-[10px] uppercase tracking-[0.2em] border border-slate-200 dark:border-slate-700">Cancel</button>
                  <button type="submit" className="flex-1 py-5 bg-indigo-600 dark:bg-indigo-700 text-white rounded-2xl font-black hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-500/20 text-[10px] uppercase tracking-[0.2em]">Authorize Block</button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
