import { Notification, NotificationType } from '../types';
import { api } from '../lib/api-client';

const STORAGE_KEY = 'lavanflow_notifications';

export const getNotifications = (): Notification[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

export const addNotification = async (title: string, message: string, type: NotificationType, orderCode?: string) => {
  const notifications = getNotifications();
  const newNotif: Notification = {
    id: Math.random().toString(36).substr(2, 9),
    title,
    message,
    timestamp: Date.now(),
    read: false,
    type,
    orderCode
  };
  notifications.unshift(newNotif);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 50))); 
  
  // Enterprise sync: Save critical notifications to DB
  if (type === 'system' || type === 'backup') {
    try {
      await api.post('/notifications', newNotif);
    } catch (e) {
      console.warn("Notification sync failed, stored locally.");
    }
  }

  window.dispatchEvent(new Event('notifications_updated'));
  return newNotif;
};

export const markAsRead = (id: string) => {
  const notifications = getNotifications();
  const index = notifications.findIndex(n => n.id === id);
  if (index >= 0) {
    notifications[index].read = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    window.dispatchEvent(new Event('notifications_updated'));
  }
};

export const markAllAsRead = () => {
  const notifications = getNotifications().map(n => ({ ...n, read: true }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new Event('notifications_updated'));
};

export const clearNotifications = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('notifications_updated'));
};