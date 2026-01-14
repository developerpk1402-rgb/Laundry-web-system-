
import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  Receipt, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Store,
  Bell,
  Search,
  Menu,
  X,
  User as UserIcon,
  MessageSquare,
  ArrowLeftRight,
  Cpu,
  Moon,
  Sun,
  Monitor,
  Terminal,
  Clock,
  Waves,
  TrendingUp,
  History,
  ShieldAlert,
  Lock,
  Loader2,
  Settings2,
  HardDrive
} from 'lucide-react';
import { User, UserRole, Branch, Notification as NotificationType } from './types';
// Fix: Added clearNotifications to the import list from notificationService
import { getNotifications, markAsRead, markAllAsRead, clearNotifications } from './services/notificationService';

// Page Components
import Dashboard from './pages/Dashboard';
import CreateOrder from './pages/CreateOrder';
import OrderStatus from './pages/OrderStatus';
import Invoicing from './pages/Invoicing';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import SettingsPage from './pages/Settings';
import LoginPage from './pages/Login';
import InternalChat from './pages/InternalChat';
import BranchGateway from './pages/BranchGateway';
import ProfilePage from './pages/Profile';

const MaintenanceScreen: React.FC<{ onDeactivate: () => void }> = ({ onDeactivate }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const messages = [
      "> INITIALIZING KERNEL PATCH v4.2.5...",
      "> STOPPING OPERATIONAL FLEET NODES...",
      "> DUMPING MEMORY BUFFERS...",
      "> SYNCING FISCAL REGISTERS WITH DGII CLOUD...",
      "> ENCRYPTING DATABASE FRAGMENTS...",
      "> CALIBRATING THERMAL PRINTER DRIVERS...",
      "> MAINTENANCE PROTOCOL: LEVEL 5 ACTIVE",
      "> WARNING: UNAUTHORIZED ACCESS DETECTED IN NODE-B2",
      "> ISOLATING SUBSYSTEMS...",
      "> STANDBY FOR CORE UPDATE..."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < messages.length) {
        setLogs(prev => [...prev, messages[i]]);
        i++;
      }
    }, 800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] bg-[#020617] flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:30px_30px]"></div>
      
      <motion.div 
        animate={{ opacity: [1, 0.8, 1] }} 
        transition={{ repeat: Infinity, duration: 2 }}
        className="relative z-10 w-full max-w-4xl space-y-8"
      >
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center border-2 border-red-600/30 animate-pulse">
            <ShieldAlert size={48} className="text-red-600" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tighter italic">ADMINISTRATOR LOCKOUT</h1>
            <p className="text-red-500 font-black text-xs uppercase tracking-[0.4em]">Maintenance Mode : Global Cluster Restricted</p>
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-md rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
          <div className="bg-white/5 px-8 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/50"></div>
            </div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">LavanFlow Kernel Terminal</span>
          </div>
          <div 
            ref={terminalRef}
            className="p-8 h-80 overflow-y-auto font-mono text-xs md:text-sm text-emerald-400/80 space-y-2 custom-scrollbar"
          >
            {logs.map((log, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }}
                className="flex gap-4"
              >
                <span className="opacity-30">{new Date().toLocaleTimeString()}</span>
                <span className="font-bold">{log}</span>
              </motion.div>
            ))}
            <div className="flex items-center gap-2">
              <span className="opacity-30">{new Date().toLocaleTimeString()}</span>
              <span className="animate-pulse">_</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={onDeactivate}
            className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-[2rem] border border-white/10 font-black text-[10px] uppercase tracking-[0.3em] transition-all hover:scale-105 active:scale-95"
          >
            Bypass Restricted Access
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const SplashScreen: React.FC<{ onComplete: () => void, isDark: boolean }> = ({ onComplete, isDark }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center overflow-hidden transition-colors duration-1000 ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}
    >
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] transition-colors duration-1000 ${isDark ? 'bg-blue-600/10' : 'bg-blue-600/5'}`}></div>
      
      <div className="relative flex flex-col items-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-64 h-64 relative mb-12"
        >
          <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
            <motion.path 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              d="M100 30 L130 30 L130 90 L60 90 L60 60" 
              fill="none" 
              stroke="#0d9488" 
              strokeWidth="14" 
              strokeLinecap="round" 
            />
            <motion.path 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.3 }}
              d="M170 100 L170 130 L110 130 L110 60 L140 60" 
              fill="none" 
              stroke="#1e293b" 
              strokeWidth="14" 
              strokeLinecap="round" 
            />
            <motion.path 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.6 }}
              d="M100 170 L70 170 L70 110 L140 110 L140 140" 
              fill="none" 
              stroke="#0d9488" 
              strokeWidth="14" 
              strokeLinecap="round" 
            />
            <motion.path 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.9 }}
              d="M30 100 L30 70 L90 70 L90 140 L60 140" 
              fill="none" 
              stroke="#1e293b" 
              strokeWidth="14" 
              strokeLinecap="round" 
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center pt-1">
             <motion.span 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 2 }}
               className={`text-2xl font-black tracking-[0.15em] ${isDark ? 'text-white' : 'text-slate-900'}`}
             >
               ESOFT
             </motion.span>
          </div>
        </motion.div>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2.2 }}
          className="text-center space-y-4"
        >
          <h2 className="text-sm font-black text-blue-600 dark:text-blue-400 tracking-[0.4em] uppercase">Enterprise Solutions</h2>
        </motion.div>
      </div>
    </motion.div>
  );
};

const Header: React.FC<{ 
  user: User, 
  notifications: NotificationType[], 
  unreadCount: number, 
  isNotifOpen: boolean, 
  setIsNotifOpen: (b: boolean) => void, 
  isProfileOpen: boolean,
  setIsProfileOpen: (b: boolean) => void,
  setIsMobileMenuOpen: (b: boolean) => void, 
  markAsRead: (id: string) => void, 
  markAllAsRead: () => void, 
  clearNotifications: () => void, 
  notifRef: React.RefObject<HTMLDivElement> 
}> = ({ user, notifications, unreadCount, isNotifOpen, setIsNotifOpen, isProfileOpen, setIsProfileOpen, setIsMobileMenuOpen, markAsRead, markAllAsRead, clearNotifications, notifRef }) => {
  return (
    <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 z-20 no-print transition-colors">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="relative group hidden sm:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Universal terminal search..." 
            className="pl-12 pr-6 py-2.5 bg-slate-100 dark:bg-slate-800/50 border border-transparent focus:border-blue-500/50 focus:bg-white dark:focus:bg-slate-800 rounded-2xl text-sm w-72 lg:w-96 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none dark:text-slate-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          className={`w-10 h-10 md:w-11 md:h-11 rounded-2xl flex items-center justify-center transition-all shadow-lg group overflow-hidden relative ${
            isProfileOpen 
            ? 'ring-4 ring-blue-500/30 ring-offset-2 dark:ring-offset-slate-900' 
            : 'ring-1 ring-slate-200 dark:ring-slate-800'
          }`}
          title="Identity Management"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-teal-400 via-blue-500 to-indigo-600"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          {user.avatar ? (
            <img src={user.avatar} className="w-full h-full object-cover relative z-10" alt="Profile" />
          ) : (
            <UserIcon size={22} strokeWidth={2.5} className="text-white relative z-10 drop-shadow-sm" />
          )}
          {user.isActive && (
            <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 z-20 animate-pulse"></div>
          )}
        </motion.button>

        <div className="relative" ref={notifRef}>
           <button 
             onClick={() => setIsNotifOpen(!isNotifOpen)}
             className={`p-2.5 rounded-xl relative transition-all ${isNotifOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
           >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 text-[8px] font-black text-white flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
           </button>

           <AnimatePresence>
           {isNotifOpen && (
             <motion.div 
               initial={{ opacity: 0, y: 10, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 10, scale: 0.95 }}
               className="absolute right-0 mt-3 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[100] overflow-hidden flex flex-col max-h-[500px]"
             >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                   <div>
                      <h4 className="font-black text-slate-900 dark:text-white italic tracking-tight">System Feed</h4>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{unreadCount} Pending updates</p>
                   </div>
                   <button onClick={() => { markAllAsRead(); setIsNotifOpen(false); }} className="text-[10px] font-black uppercase text-blue-600 hover:underline tracking-widest">Flush All</button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-slate-50 dark:divide-slate-800">
                   {notifications.length === 0 ? (
                     <div className="py-12 px-6 text-center">
                        <Bell className="mx-auto text-slate-200 dark:text-slate-700 mb-4" size={40} />
                        <p className="text-slate-400 font-bold text-sm">No recent activity logged.</p>
                     </div>
                   ) : (
                     notifications.map(notif => (
                       <div key={notif.id} onClick={() => markAsRead(notif.id)} className={`p-5 flex gap-4 transition-all cursor-pointer ${!notif.read ? 'bg-blue-50/30 dark:bg-blue-900/10' : 'opacity-70 grayscale-[0.5] hover:opacity-100 hover:grayscale-0'}`}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.type === 'sale' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : notif.type === 'status' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                             {notif.type === 'sale' ? <TrendingUp size={20} /> : <History size={20} />}
                          </div>
                          <div className="space-y-1 overflow-hidden">
                             <div className="flex justify-between items-start">
                                <p className="font-black text-xs text-slate-900 dark:text-slate-100 leading-tight truncate pr-4">{notif.title}</p>
                                <span className="text-[8px] font-bold text-slate-400 whitespace-nowrap">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                             </div>
                             <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{notif.message}</p>
                             {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>}
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </motion.div>
           )}
           </AnimatePresence>
        </div>

        {user.role === UserRole.ADMIN && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-indigo-600 dark:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">
            <Monitor size={14} className="animate-pulse" /> Privileged Terminal
          </div>
        )}
      </div>
    </header>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('laundry_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeBranch, setActiveBranch] = useState<Branch | null>(() => {
    const saved = localStorage.getItem('laundry_branch');
    return saved ? JSON.parse(saved) : null;
  });

  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('laundry_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [isMaintenanceMode, setIsMaintenanceMode] = useState<boolean>(() => {
    return localStorage.getItem('laundry_maintenance') === 'true';
  });

  const [showSplash, setShowSplash] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Notification State
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateNotifs = () => setNotifications(getNotifications());
    updateNotifs();
    window.addEventListener('notifications_updated', updateNotifs);
    const interval = setInterval(updateNotifs, 10000);

    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('notifications_updated', updateNotifs);
      document.removeEventListener('mousedown', handleClickOutside);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('laundry_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('laundry_maintenance', isMaintenanceMode.toString());
  }, [isMaintenanceMode]);

  useEffect(() => {
    if (user?.role === UserRole.ADMIN && !sessionStorage.getItem('splash_shown')) {
      setShowSplash(true);
      sessionStorage.setItem('splash_shown', 'true');
    }
  }, [user]);

  useEffect(() => {
    if (user) localStorage.setItem('laundry_user', JSON.stringify(user));
    else {
      localStorage.removeItem('laundry_user');
      sessionStorage.removeItem('splash_shown');
    }
  }, [user]);

  useEffect(() => {
    if (activeBranch) localStorage.setItem('laundry_branch', JSON.stringify(activeBranch));
    else localStorage.removeItem('laundry_branch');
  }, [activeBranch]);

  if (!user) return <LoginPage onLogin={setUser} />;
  
  return (
    <Router>
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} isDark={isDark} />}
        {isMaintenanceMode && user.role === UserRole.ADMIN && (
          <MaintenanceScreen onDeactivate={() => setIsMaintenanceMode(false)} />
        )}
      </AnimatePresence>

      {!activeBranch && <BranchGateway user={user} onSelectBranch={setActiveBranch} />}

      {user && activeBranch && !showSplash && !isMaintenanceMode && (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden relative">
          <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} hidden md:flex bg-slate-900 text-white transition-all duration-300 flex-col border-r border-slate-800 shadow-2xl z-30 relative`}>
            <SidebarContent 
              isSidebarOpen={isSidebarOpen} 
              isMobileMenuOpen={isMobileMenuOpen} 
              setIsMobileMenuOpen={setIsMobileMenuOpen} 
              user={user} 
              activeBranch={activeBranch} 
              setActiveBranch={setActiveBranch} 
              isDark={isDark} 
              setIsDark={setIsDark} 
              setUser={setUser} 
            />
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-20 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-blue-500/30 hover:scale-110 transition-transform z-40 border border-white/20">
              {isSidebarOpen ? <X size={14} /> : <Menu size={14} />}
            </button>
          </aside>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] md:hidden bg-slate-950/80 backdrop-blur-md"
              >
                 <motion.div 
                   initial={{ x: -300 }}
                   animate={{ x: 0 }}
                   exit={{ x: -300 }}
                   transition={{ type: "spring", damping: 25, stiffness: 200 }}
                   className="w-80 h-full bg-slate-900 border-r border-slate-800"
                 >
                    <div className="absolute right-4 top-4">
                       <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white bg-slate-800 rounded-lg"><X size={20}/></button>
                    </div>
                    <SidebarContent 
                      isSidebarOpen={true} 
                      isMobileMenuOpen={true} 
                      setIsMobileMenuOpen={setIsMobileMenuOpen} 
                      user={user} 
                      activeBranch={activeBranch} 
                      setActiveBranch={setActiveBranch} 
                      isDark={isDark} 
                      setIsDark={setIsDark} 
                      setUser={setUser} 
                    />
                 </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isProfileOpen && (
              <div className="fixed inset-0 z-[150] overflow-hidden">
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" 
                  onClick={() => setIsProfileOpen(false)}
                />
                <motion.div 
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="absolute right-0 top-0 bottom-0 w-full max-w-4xl bg-slate-50 dark:bg-slate-950 shadow-2xl border-l border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <div className="h-full flex flex-col relative">
                    <button onClick={() => setIsProfileOpen(false)} className="absolute top-6 right-6 z-[160] p-4 bg-white/10 hover:bg-red-500 text-white rounded-2xl backdrop-blur-xl transition-all shadow-xl border border-white/10 group">
                      <X size={24} className="group-hover:rotate-90 transition-transform" />
                    </button>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
                      <ProfilePage user={user} onUpdateUser={setUser} />
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            <Header 
              user={user} 
              notifications={notifications} 
              unreadCount={unreadCount} 
              isNotifOpen={isNotifOpen} 
              setIsNotifOpen={setIsNotifOpen} 
              isProfileOpen={isProfileOpen}
              setIsProfileOpen={setIsProfileOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              markAsRead={markAsRead}
              markAllAsRead={markAllAsRead}
              clearNotifications={clearNotifications}
              notifRef={notifRef}
            />
            <motion.div 
              layout
              className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar"
            >
              <div className="max-w-7xl mx-auto">
                <Routes>
                  <Route path="/" element={<Dashboard branch={activeBranch} user={user} />} />
                  <Route path="/new-order" element={<CreateOrder branch={activeBranch} user={user} />} />
                  <Route path="/orders" element={<OrderStatus branch={activeBranch} user={user} />} />
                  <Route path="/invoicing" element={<Invoicing branch={activeBranch} user={user} />} />
                  <Route path="/chat" element={<InternalChat user={user} />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/reports" element={<Reports branch={activeBranch} />} />
                  <Route path="/settings" element={<SettingsPage branch={activeBranch} onBranchChange={setActiveBranch} onSetMaintenance={setIsMaintenanceMode} isMaintenance={isMaintenanceMode} user={user} />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </motion.div>
          </main>
        </div>
      )}
    </Router>
  );
};

const SidebarContent: React.FC<any> = ({ isSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen, user, activeBranch, setActiveBranch, isDark, setIsDark, setUser }) => {
  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/', roles: Object.values(UserRole) },
    { label: 'New Order', icon: PlusCircle, path: '/new-order', roles: [UserRole.ADMIN, UserRole.SALESPERSON, UserRole.CASHIER] },
    { label: 'Order Pipeline', icon: ClipboardList, path: '/orders', roles: Object.values(UserRole) },
    { label: 'Invoicing', icon: Receipt, path: '/invoicing', roles: [UserRole.ADMIN, UserRole.CASHIER] },
    { label: 'Staff Chat', icon: MessageSquare, path: '/chat', roles: Object.values(UserRole) },
    { label: 'Customers', icon: Users, path: '/customers', roles: [UserRole.ADMIN, UserRole.SALESPERSON, UserRole.CASHIER] },
    { label: 'Analytics', icon: BarChart3, path: '/reports', roles: [UserRole.ADMIN, UserRole.SPECIAL] },
    { label: 'Settings', icon: Settings, path: '/settings', roles: [UserRole.ADMIN] },
  ];

  const allowedNav = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex flex-col h-full py-6">
      <div className="px-6 flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-teal-500/20 ring-1 ring-white/10 italic">E</div>
        {(isSidebarOpen || isMobileMenuOpen) && (
          <span className="text-xl font-extrabold tracking-tighter text-white">ESOFT <span className="text-teal-500 text-xs align-top ml-0.5 uppercase tracking-widest font-black">Flow</span></span>
        )}
      </div>
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {allowedNav.map((item) => (
          <NavLink key={item.path} to={item.path} icon={item.icon} label={item.label} collapsed={!isSidebarOpen && !isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(false)} />
        ))}
        <div className="pt-8 pb-4">
          <p className={`px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 ${(!isSidebarOpen && !isMobileMenuOpen) && 'hidden'}`}>Environment</p>
          <button onClick={() => setIsDark(!isDark)} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-slate-400 hover:text-white hover:bg-slate-800/50 group">
            <div className="relative w-6 h-6 flex items-center justify-center">
              {isDark ? <Moon size={20} className="text-blue-400" /> : <Sun size={20} className="text-amber-500" />}
            </div>
            {(isSidebarOpen || isMobileMenuOpen) && (
              <div className="flex flex-1 items-center justify-between">
                <span className="font-semibold text-sm">Theme</span>
                <div className={`w-8 h-4 rounded-full transition-colors ${isDark ? 'bg-blue-600' : 'bg-slate-700'} relative`}>
                  <motion.div 
                    animate={{ left: isDark ? '1.125rem' : '0.125rem' }}
                    className="absolute top-0.5 w-3 h-3 bg-white rounded-full"
                  />
                </div>
              </div>
            )}
          </button>
        </div>
      </nav>
      <div className="px-4 mt-auto">
        <AnimatePresence>
        {(isSidebarOpen || isMobileMenuOpen) && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-4 bg-slate-800/50 rounded-2xl border border-white/5 space-y-4"
          >
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center">
                  <Store size={20} className="text-teal-400" />
               </div>
               <div className="overflow-hidden">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Terminal</p>
                  <p className="text-xs font-bold text-white truncate">{activeBranch.name}</p>
               </div>
            </div>
            {user.role === UserRole.ADMIN && (
              <button onClick={() => setActiveBranch(null)} className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                <ArrowLeftRight size={12} /> Switch Node
              </button>
            )}
          </motion.div>
        )}
        </AnimatePresence>
        <button onClick={() => { setUser(null); setActiveBranch(null); }} className="w-full flex items-center gap-3 px-3 py-4 mt-4 text-slate-400 hover:text-red-400 transition-colors group">
          <LogOut size={22} />
          {(isSidebarOpen || isMobileMenuOpen) && <span className="font-bold text-sm tracking-tight uppercase tracking-[0.1em]">Logout System</span>}
        </button>
      </div>
    </div>
  );
};

const NavLink: React.FC<{ to: string, icon: any, label: string, collapsed: boolean, onClick?: () => void }> = ({ to, icon: Icon, label, collapsed, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} onClick={onClick} className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${isActive ? 'bg-teal-600 text-white shadow-xl shadow-teal-500/30 ring-1 ring-white/10' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
      <motion.div whileHover={{ scale: 1.1 }}>
        <Icon size={22} />
      </motion.div>
      {!collapsed && <span className="font-bold text-sm tracking-tight">{label}</span>}
    </Link>
  );
};

export default App;
