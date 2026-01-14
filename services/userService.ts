
import { User, UserRole, WorkSchedule } from '../types';

const STORAGE_KEY = 'lavanflow_users_db';

const INITIAL_USERS: User[] = [
  {
    id: 'admin-global',
    username: 'Administrator',
    role: UserRole.ADMIN,
    branchId: 'b1',
    isActive: true,
    schedule: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], startTime: '08:00', endTime: '20:00' }
  }
];

export const getUsers = (): User[] => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_USERS));
  return INITIAL_USERS;
};

export const getEmployeesByBranch = (branchId: string): User[] => {
  return getUsers().filter(u => u.branchId === branchId);
};

export const saveUser = (user: User) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return users;
};

export const deleteUser = (id: string) => {
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  return users;
};

export const generateUserId = (): string => {
  return `u-${Math.random().toString(36).substr(2, 9)}`;
};

export const isEmployeeOnDuty = (user: User): boolean => {
  if (!user.schedule || !user.isActive) return false;
  
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const currentDay = days[now.getDay()];
  
  if (!user.schedule.days.includes(currentDay)) return false;
  
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = user.schedule.startTime.split(':').map(Number);
  const [endH, endM] = user.schedule.endTime.split(':').map(Number);
  
  const startTime = startH * 60 + startM;
  const endTime = endH * 60 + endM;
  
  return currentTime >= startTime && currentTime <= endTime;
};
