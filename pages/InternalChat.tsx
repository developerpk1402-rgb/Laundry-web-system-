
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Users, 
  User as UserIcon, 
  Hash, 
  Search, 
  MoreVertical, 
  Smile, 
  Paperclip,
  Clock,
  ShieldCheck,
  Zap,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';
import { User, ChatMessage, Conversation, UserRole } from '../types';
import { getConversations, getMessages, sendMessage } from '../services/chatService';

const InternalChat: React.FC<{ user: User }> = ({ user }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = () => {
      const convs = getConversations(user);
      setConversations(convs);
      if (!selectedConv && convs.length > 0) {
        setSelectedConv(convs[0]);
      }
    };
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [user, selectedConv]);

  useEffect(() => {
    if (selectedConv) {
      const loadMessages = () => {
        const msgs = getMessages(selectedConv.id);
        setMessages(msgs);
      };
      loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !selectedConv) return;

    const msg = sendMessage(user, selectedConv.id, inputText);
    setMessages([...messages, msg]);
    setInputText('');
  };

  const quickReplies = user.role === UserRole.ADMIN 
    ? ["Acknowledged. Please proceed.", "Report this in the daily log.", "I am heading to the branch now.", "Contact the customer immediately."]
    : ["Order is ready for pickup!", "Customer is at the counter.", "Inventory restocked.", "Machine #2 is available.", "Need Admin assistance ASAP."];

  const filteredConvs = conversations.filter(c => 
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-black/50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
      {/* Sidebar - Channels & People */}
      <div className="w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col bg-slate-50/30 dark:bg-slate-900/50 transition-colors">
        <div className="p-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight transition-colors">Staff Room</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1 transition-colors">Internal Comms</p>
          
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 dark:text-slate-200 outline-none transition-all shadow-sm shadow-slate-100 dark:shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
          <div className="px-3 py-2 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">Channels</div>
          {filteredConvs.filter(c => c.type === 'group').map(conv => (
            <button 
              key={conv.id}
              onClick={() => setSelectedConv(conv)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                selectedConv?.id === conv.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedConv?.id === conv.id ? 'bg-white/20' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
                <Hash size={20} />
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <p className="font-bold truncate text-sm">{conv.name}</p>
                <p className={`text-[10px] truncate ${selectedConv?.id === conv.id ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {conv.lastMessage || 'Channel is active'}
                </p>
              </div>
            </button>
          ))}

          <div className="px-3 py-2 mt-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] transition-colors">
            {user.role === UserRole.ADMIN ? 'Employee Requests' : 'Support & Management'}
          </div>
          {filteredConvs.filter(c => c.type === 'direct').map(conv => {
            const isDMWithAdmin = conv.id.startsWith('dm-admin-');
            return (
              <button 
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all ${
                  selectedConv?.id === conv.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedConv?.id === conv.id ? 'bg-white/20' : isDMWithAdmin ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {isDMWithAdmin && user.role !== UserRole.ADMIN ? <ShieldCheck size={20} /> : <UserIcon size={20} />}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <p className="font-bold truncate text-sm">
                    {user.role === UserRole.ADMIN ? (conv.id.replace('dm-admin-', 'User #')) : conv.name}
                  </p>
                  <p className={`text-[10px] truncate ${selectedConv?.id === conv.id ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    {conv.lastMessage || 'Private communication'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                user.role === UserRole.ADMIN ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              }`}>
                {user.username[0]}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
            </div>
            <div>
              <p className="font-black text-slate-900 dark:text-slate-100 text-sm leading-tight transition-colors">{user.username}</p>
              <p className={`text-[10px] font-bold uppercase tracking-tighter ${
                user.role === UserRole.ADMIN ? 'text-indigo-600 dark:text-indigo-400' : 'text-blue-600 dark:text-blue-400'
              }`}>{user.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-950 transition-colors">
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <div className="h-20 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                  selectedConv.type === 'group' ? 'bg-blue-600' : 'bg-indigo-600'
                }`}>
                   {selectedConv.type === 'group' ? <Hash size={20} /> : <ShieldCheck size={20} />}
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-slate-100 leading-tight transition-colors">
                    {selectedConv.type === 'direct' && user.role === UserRole.ADMIN 
                      ? `Staff Direct Line (${selectedConv.id.split('-').pop()})` 
                      : selectedConv.name}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-emerald-500 font-bold uppercase transition-colors">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    {selectedConv.type === 'group' ? 'Operational Group • Real-time' : 'Secure Management Channel'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedConv.type === 'direct' && (
                  <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full text-[10px] font-black uppercase border border-amber-100 dark:border-amber-900/30 transition-colors">
                    <ShieldAlert size={12} /> Confidential
                  </div>
                )}
                <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-xl transition-all">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 dark:bg-slate-950/50 custom-scrollbar transition-colors">
              {messages.length === 0 && (
                <div className="flex flex-col items-center py-20 text-center">
                  <div className="w-16 h-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4 shadow-sm transition-colors">
                    <MessageSquare size={32} />
                  </div>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 transition-colors">No messages yet.</p>
                  <p className="text-xs text-slate-400 dark:text-slate-600 max-w-[200px] mt-1 transition-colors">Start the conversation with {selectedConv.name}.</p>
                </div>
              )}

              {messages.map((msg) => {
                const isMe = msg.senderId === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2`}>
                    <div className={`flex gap-3 max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      {!isMe && (
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-auto shadow-sm ${
                          msg.senderRole === UserRole.ADMIN ? 'bg-indigo-600 text-white' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
                        }`}>
                          {msg.senderName[0]}
                        </div>
                      )}
                      <div className="space-y-1">
                        {!isMe && (
                          <div className="flex items-center gap-2 ml-1">
                            <span className="text-[10px] font-black text-slate-900 dark:text-slate-200 transition-colors">{msg.senderName}</span>
                            <span className={`text-[8px] font-bold px-1 rounded uppercase ${
                              msg.senderRole === UserRole.ADMIN ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 dark:text-indigo-400' : 'bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400'
                            }`}>{msg.senderRole}</span>
                          </div>
                        )}
                        <div className={`px-5 py-3 rounded-3xl text-sm leading-relaxed shadow-sm transition-all duration-300 ${
                          isMe 
                          ? 'bg-blue-600 dark:bg-blue-700 text-white rounded-tr-none' 
                          : msg.senderRole === UserRole.ADMIN 
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-100 border border-indigo-100 dark:border-indigo-800 rounded-tl-none'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                        <div className={`flex items-center gap-1 text-[8px] text-slate-400 dark:text-slate-600 font-bold uppercase mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <Clock size={8} /> {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions Panel */}
            <div className="px-8 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 overflow-x-auto no-scrollbar transition-colors">
              <div className="flex items-center gap-1.5 shrink-0 text-blue-600 dark:text-blue-400 transition-colors">
                <Zap size={14} className="fill-blue-600 dark:fill-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-wider">Shortcuts:</span>
              </div>
              {quickReplies.map((reply, idx) => (
                <button 
                  key={idx}
                  onClick={() => setInputText(reply)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all whitespace-nowrap shadow-sm"
                >
                  {reply}
                </button>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSend} className="p-8 bg-white dark:bg-slate-900 pt-2 transition-colors">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder={selectedConv.type === 'direct' ? "Reply privately..." : "Message staff room..."} 
                  className="w-full pl-6 pr-32 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:text-slate-200 outline-none transition-all text-sm shadow-inner"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button type="button" className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <Smile size={20} />
                  </button>
                  <button type="button" className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <Paperclip size={20} />
                  </button>
                  <button 
                    type="submit"
                    disabled={!inputText.trim()}
                    className={`ml-1 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      inputText.trim() ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 active:scale-95' : 'bg-slate-200 dark:bg-slate-800 text-white dark:text-slate-600'
                    }`}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center text-slate-400 dark:text-slate-600 transition-colors">
            <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
              <Users size={48} className="opacity-10 dark:opacity-5" />
            </div>
            <h2 className="text-2xl font-black text-slate-600 dark:text-slate-400 tracking-tight transition-colors">Staff Communications</h2>
            <p className="max-w-xs mt-2 font-medium leading-relaxed dark:text-slate-500 transition-colors">Select a channel or direct line from the sidebar to start coordinating with the team or administration.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternalChat;
