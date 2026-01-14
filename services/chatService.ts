
import { ChatMessage, Conversation, User, UserRole } from '../types';

const MSG_STORAGE_KEY = 'lavanflow_chat_messages';
const CONV_STORAGE_KEY = 'lavanflow_chat_conversations';

// Initial staff group conversation
const STAFF_GROUP_ID = 'staff-group';
const DEFAULT_CONVERSATIONS: Conversation[] = [
  {
    id: STAFF_GROUP_ID,
    participants: [], // Everyone is a member
    type: 'group',
    name: 'General Staff Room'
  }
];

export const getConversations = (user: User): Conversation[] => {
  const saved = localStorage.getItem(CONV_STORAGE_KEY);
  let convs: Conversation[] = saved ? JSON.parse(saved) : DEFAULT_CONVERSATIONS;
  
  // Ensure the staff group exists
  if (!convs.find(c => c.id === STAFF_GROUP_ID)) {
    convs.unshift(DEFAULT_CONVERSATIONS[0]);
  }

  // If user is NOT an admin, ensure they have a direct chat with Admin
  if (user.role !== UserRole.ADMIN) {
    const adminConvId = `dm-admin-${user.id}`;
    if (!convs.find(c => c.id === adminConvId)) {
      const adminConv: Conversation = {
        id: adminConvId,
        participants: [user.id, 'admin-global'],
        type: 'direct',
        name: 'Administrator'
      };
      convs.push(adminConv);
      localStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(convs));
    }
  }

  // If user IS admin, filter for all direct chats (which are with staff) and the group chat
  if (user.role === UserRole.ADMIN) {
    return convs; // Admins see everything
  }

  // Staff only see the group and their specific DM with admin
  return convs.filter(c => c.id === STAFF_GROUP_ID || c.id === `dm-admin-${user.id}`);
};

export const getMessages = (conversationId: string): ChatMessage[] => {
  const saved = localStorage.getItem(MSG_STORAGE_KEY);
  const allMessages: ChatMessage[] = saved ? JSON.parse(saved) : [];
  return allMessages.filter(m => m.conversationId === conversationId);
};

export const sendMessage = (user: User, conversationId: string, text: string): ChatMessage => {
  const newMessage: ChatMessage = {
    id: Math.random().toString(36).substr(2, 9),
    senderId: user.id,
    senderName: user.username,
    senderRole: user.role,
    text,
    timestamp: Date.now(),
    conversationId
  };

  const saved = localStorage.getItem(MSG_STORAGE_KEY);
  const allMessages: ChatMessage[] = saved ? JSON.parse(saved) : [];
  allMessages.push(newMessage);
  localStorage.setItem(MSG_STORAGE_KEY, JSON.stringify(allMessages));

  // Update conversation last message metadata
  const convSaved = localStorage.getItem(CONV_STORAGE_KEY);
  let convs: Conversation[] = convSaved ? JSON.parse(convSaved) : DEFAULT_CONVERSATIONS;
  const convIndex = convs.findIndex(c => c.id === conversationId);
  if (convIndex >= 0) {
    convs[convIndex].lastMessage = text;
    convs[convIndex].lastTimestamp = newMessage.timestamp;
    
    // If it's a DM and the Admin is sending it, we might want to update the name 
    // but in this simple implementation we keep the names set at creation.
    
    localStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(convs));
  } else if (conversationId.startsWith('dm-admin-')) {
    // Fallback if conversation wasn't in list but is valid
    const newConv: Conversation = {
      id: conversationId,
      participants: [user.id],
      type: 'direct',
      name: user.role === UserRole.ADMIN ? 'Staff Member' : 'Administrator',
      lastMessage: text,
      lastTimestamp: newMessage.timestamp
    };
    convs.push(newConv);
    localStorage.setItem(CONV_STORAGE_KEY, JSON.stringify(convs));
  }

  return newMessage;
};
