
import React, { useState, useEffect, useRef } from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Briefcase, 
  Save, 
  Send, 
  Heart, 
  Clock, 
  Camera, 
  Shield,
  Zap,
  Globe,
  ToggleLeft as Toggle,
  ToggleRight,
  Sparkles
} from 'lucide-react';
import { User, UserRole, Post } from '../types';
import { saveUser } from '../services/userService';
import { getPosts, createPost, likePost } from '../services/postService';

const ProfilePage: React.FC<{ user: User, onUpdateUser: (u: User) => void }> = ({ user, onUpdateUser }) => {
  const [formData, setFormData] = useState({
    username: user.username,
    email: user.email || '',
    phone: user.phone || '',
    role: user.role,
    bio: user.bio || '',
    isActive: user.isActive,
    avatar: user.avatar || ''
  });
  
  const [postContent, setPostContent] = useState('');
  const [staffPosts, setStaffPosts] = useState<Post[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStaffPosts(getPosts());
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    setTimeout(() => {
      const updatedUser: User = {
        ...user,
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        bio: formData.bio,
        isActive: formData.isActive,
        avatar: formData.avatar
      };
      
      saveUser(updatedUser);
      onUpdateUser(updatedUser);
      setIsSaving(false);
      window.dispatchEvent(new Event('user_updated'));
    }, 800);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    createPost(user, postContent);
    setStaffPosts(getPosts());
    setPostContent('');
  };

  const handleLike = (id: string) => {
    likePost(id);
    setStaffPosts(getPosts());
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Refined Profile Header - Exact match for the design provided */}
      <div className="relative bg-[#020617] rounded-[3.5rem] overflow-hidden shadow-2xl transition-all border border-white/10 group">
        {/* Dotted Pattern Overlay */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:20px_20px]"></div>
        
        {/* Gradient Ambiance */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-indigo-900/20"></div>
        
        <div className="relative z-10 p-12 flex flex-col md:flex-row items-center gap-12">
          {/* Avatar Area with design squircle */}
          <div className="relative">
            <div 
              onClick={handleAvatarClick}
              className="w-56 h-56 bg-slate-900/80 backdrop-blur-md rounded-[3.5rem] p-1 shadow-2xl transition-all hover:scale-[1.03] active:scale-95 cursor-pointer overflow-hidden border-2 border-white/10 relative group/avatar"
            >
               <div className="w-full h-full bg-gradient-to-br from-[#0ea5e9] to-[#4338ca] rounded-[3rem] flex items-center justify-center overflow-hidden relative">
                 {formData.avatar ? (
                   <img src={formData.avatar} className="w-full h-full object-cover" alt="Avatar" />
                 ) : (
                   <span className="text-[120px] font-black text-white drop-shadow-2xl select-none">{user.username[0].toUpperCase()}</span>
                 )}
                 
                 {/* Design Texture on Avatar */}
                 <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
                 
                 <div className="absolute inset-0 bg-black/0 group-hover/avatar:bg-black/20 transition-colors flex items-center justify-center">
                   <Camera size={32} className="text-white opacity-0 group-hover/avatar:opacity-100 transition-opacity" />
                 </div>
               </div>
            </div>
            
            {/* Online Status Marker */}
            <div className={`absolute bottom-6 right-6 w-8 h-8 rounded-full border-[6px] border-[#020617] shadow-xl z-20 ${formData.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          {/* Text Content */}
          <div className="text-center md:text-left flex-1 space-y-4">
             <div className="space-y-2">
                <h1 className="text-7xl font-black text-white tracking-tighter leading-none select-none">
                  {user.username}
                </h1>
                <div className="flex items-center justify-center md:justify-start gap-4">
                   <div className="flex items-center gap-2.5 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                      <Shield size={18} className="text-[#38bdf8] fill-[#38bdf8]/20" />
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-white/90">
                        {user.role} Terminal
                      </span>
                   </div>
                   {formData.isActive && (
                     <div className="px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                        Live Link Established
                     </div>
                   )}
                </div>
             </div>
             <p className="text-slate-400 font-medium max-w-lg text-base leading-relaxed opacity-80">
               {formData.bio || "Terminal ID active. No operational brief broadcasted. Use the management module below to update node records."}
             </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Profile Details Form */}
        <div className="lg:col-span-7 space-y-8">
           <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-200 dark:border-slate-800 shadow-xl transition-colors">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white italic tracking-tight">Identity Management</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Synchronize your terminal credentials</p>
                 </div>
                 <Zap className="text-blue-500 animate-pulse" size={24} />
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-8">
                 <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all group">
                    <div>
                       <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Operations Availability</p>
                       <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                          {formData.isActive ? 'Node visible to all active fleet members' : 'Terminal hidden from operational feed'}
                       </p>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                      className={`transition-all duration-300 ${formData.isActive ? 'text-emerald-500' : 'text-slate-400'}`}
                    >
                      {formData.isActive ? <ToggleRight size={56} strokeWidth={1} /> : <Toggle size={56} strokeWidth={1} />}
                    </button>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Username Handle</label>
                       <div className="relative group">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <input 
                            type="text" 
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-slate-100 font-bold"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Email Node</label>
                       <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <input 
                            type="email" 
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-slate-100 font-bold"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Phone Line</label>
                       <div className="relative group">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <input 
                            type="tel" 
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-slate-100 font-bold"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          />
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Operational Role</label>
                       <div className="relative group">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                          <select 
                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-slate-100 font-bold"
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                          >
                             {Object.values(UserRole).map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                       </div>
                    </div>
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Staff Bio / Expertise</label>
                    <textarea 
                      className="w-full p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl focus:ring-4 focus:ring-blue-500/10 outline-none transition-all dark:text-slate-100 font-medium h-32 resize-none"
                      placeholder="Share a bit about your workflow or specialties..."
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    />
                 </div>

                 <button 
                   type="submit" 
                   disabled={isSaving}
                   className="w-full py-5 bg-blue-600 dark:bg-blue-700 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-blue-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                 >
                    {isSaving ? "Syncing Identity Modules..." : "Save Identity Records"}
                    <Save size={20} />
                 </button>
              </form>
           </div>
        </div>

        {/* Staff Feed Section */}
        <div className="lg:col-span-5 space-y-8">
           {/* Create Post */}
           <div className="bg-slate-900 dark:bg-black rounded-[3rem] p-8 border border-white/5 shadow-2xl text-white">
              <h3 className="text-xl font-black mb-6 italic flex items-center gap-3">
                 <Globe size={20} className="text-blue-400" /> Dispatch Update
              </h3>
              <form onSubmit={handlePost} className="space-y-4">
                 <textarea 
                    className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/20 outline-none transition-all text-sm h-28 resize-none placeholder:text-slate-600"
                    placeholder="Broadcast to the internal staff room..."
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                 />
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Public to all active nodes</span>
                    <button 
                      type="submit"
                      disabled={!postContent.trim()}
                      className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 disabled:opacity-50 disabled:grayscale"
                    >
                       <Send size={18} />
                    </button>
                 </div>
              </form>
           </div>

           {/* Feed List */}
           <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {staffPosts.length === 0 ? (
                <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 transition-colors">
                   <Globe className="mx-auto text-slate-200 dark:text-slate-700 mb-4" size={48} />
                   <p className="text-slate-400 font-bold">The feed is currently silent.</p>
                </div>
              ) : (
                staffPosts.map(post => (
                  <div key={post.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-blue-600 dark:text-blue-400 overflow-hidden">
                              {post.authorName[0]}
                           </div>
                           <div>
                              <p className="font-black text-slate-900 dark:text-slate-100 leading-tight text-sm">{post.authorName}</p>
                              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{post.authorRole}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                           <Clock size={12} />
                           {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                     </div>
                     <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {post.content}
                     </p>
                     <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                        <button 
                          onClick={() => handleLike(post.id)}
                          className="flex items-center gap-2 text-slate-400 hover:text-red-500 transition-colors text-xs font-bold"
                        >
                           <Heart size={16} className={post.likes > 0 ? "fill-red-500 text-red-500" : ""} />
                           {post.likes > 0 ? post.likes : ""}
                        </button>
                        <span className="text-[10px] font-black uppercase text-slate-300 dark:text-slate-700 tracking-tighter">System Verified</span>
                     </div>
                  </div>
                ))
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
