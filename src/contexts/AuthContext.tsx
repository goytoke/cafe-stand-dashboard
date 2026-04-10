import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  profilePic?: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  register: (user: Omit<User, 'id'> & { password: string }) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<User> & { password?: string }) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cafe_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) localStorage.setItem('cafe_user', JSON.stringify(user));
    else localStorage.removeItem('cafe_user');
  }, [user]);

  const login = (username: string, password: string) => {
    const users = JSON.parse(localStorage.getItem('cafe_users') || '[]');
    const found = users.find((u: any) => u.username === username && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      setUser(userData);
      return true;
    }
    return false;
  };

  const register = (data: Omit<User, 'id'> & { password: string }) => {
    const users = JSON.parse(localStorage.getItem('cafe_users') || '[]');
    if (users.find((u: any) => u.username === data.username)) return false;
    const newUser = { ...data, id: crypto.randomUUID() };
    users.push(newUser);
    localStorage.setItem('cafe_users', JSON.stringify(users));
    const { password: _, ...userData } = newUser;
    setUser(userData);
    return true;
  };

  const logout = () => setUser(null);

  const updateProfile = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    const users = JSON.parse(localStorage.getItem('cafe_users') || '[]');
    const idx = users.findIndex((u: any) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...data };
      localStorage.setItem('cafe_users', JSON.stringify(users));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
