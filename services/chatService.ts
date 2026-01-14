import { ChatMessage, Conversation, User } from '../types';
import { api } from '../lib/api-client';

export const getConversations = async (user: User): Promise<Conversation[]> => {
  return api.get(`/chat/conversations?userId=${user.id}`);
};

export const getMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  return api.get(`/chat/messages/${conversationId}`);
};

export const sendMessage = async (user: User, conversationId: string, text: string): Promise<ChatMessage> => {
  const messageData = {
    senderId: user.id,
    conversationId,
    text,
    timestamp: Date.now()
  };

  return api.post('/chat/messages', messageData);
};