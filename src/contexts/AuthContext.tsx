import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppRole = 'admin' | 'staff' | 'shareholder';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  phone: string;
  profilePic?: string;
  role: AppRole;
}

export interface Employee extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  employees: Employee[];
  login: (username: string, password: string) => boolean;
  register: (user: Omit<User, 'id' | 'role'> & { password: string }) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<User> & { password?: string }) => void;
  addEmployee: (e: Omit<Employee, 'id'>) => boolean;
  updateEmployee: (id: string, e: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

const defaultEmployees: Employee[] = [
  {
    id: 'emp-abilo',
    firstName: 'Abilo',
    lastName: 'Tesfaye',
    username: 'Abilo',
    password: 'Abilo@1234',
    phone: '+251911223344',
    role: 'staff',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cafe_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('cafe_employees');
    return saved ? JSON.parse(saved) : defaultEmployees;
  });

  useEffect(() => {
    if (user) localStorage.setItem('cafe_user', JSON.stringify(user));
    else localStorage.removeItem('cafe_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem('cafe_employees', JSON.stringify(employees));
  }, [employees]);

  const login = (username: string, password: string) => {
    const emp = employees.find(e => e.username.toLowerCase() === username.toLowerCase() && e.password === password);
    if (emp) {
      const { password: _p, ...userData } = emp;
      setUser(userData);
      return true;
    }
    const users = JSON.parse(localStorage.getItem('cafe_users') || '[]');
    const found = users.find((u: any) => u.username === username && u.password === password);
    if (found) {
      const { password: _, ...userData } = found;
      setUser({ role: 'admin', ...userData });
      return true;
    }
    return false;
  };

  const register = (data: Omit<User, 'id' | 'role'> & { password: string }) => {
    const users = JSON.parse(localStorage.getItem('cafe_users') || '[]');
    if (users.find((u: any) => u.username === data.username)) return false;
    const newUser = { ...data, role: 'admin' as AppRole, id: crypto.randomUUID() };
    users.push(newUser);
    localStorage.setItem('cafe_users', JSON.stringify(users));
    const { password: _, ...userData } = newUser;
    setUser(userData);
    return true;
  };

  const logout = () => setUser(null);

  const updateProfile = (data: Partial<User> & { password?: string }) => {
    if (!user) return;
    const { password, ...rest } = data;
    const updated = { ...user, ...rest };
    setUser(updated);
    setEmployees(prev => prev.map(e => e.id === user.id ? { ...e, ...rest, ...(password ? { password } : {}) } : e));
    const users = JSON.parse(localStorage.getItem('cafe_users') || '[]');
    const idx = users.findIndex((u: any) => u.id === user.id);
    if (idx >= 0) {
      users[idx] = { ...users[idx], ...rest, ...(password ? { password } : {}) };
      localStorage.setItem('cafe_users', JSON.stringify(users));
    }
  };

  const addEmployee = (e: Omit<Employee, 'id'>) => {
    if (employees.find(x => x.username.toLowerCase() === e.username.toLowerCase())) return false;
    setEmployees(prev => [...prev, { ...e, id: crypto.randomUUID() }]);
    return true;
  };
  const updateEmployee = (id: string, e: Partial<Employee>) =>
    setEmployees(prev => prev.map(x => x.id === id ? { ...x, ...e } : x));
  const deleteEmployee = (id: string) => setEmployees(prev => prev.filter(x => x.id !== id));

  return (
    <AuthContext.Provider value={{ user, employees, login, register, logout, updateProfile, addEmployee, updateEmployee, deleteEmployee }}>
      {children}
    </AuthContext.Provider>
  );
};
