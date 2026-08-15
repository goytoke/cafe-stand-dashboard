import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  profit: number;
  category: 'drink' | 'food' | 'snacks';
  subCategory: string;
  image?: string;
  status: 'active' | 'inactive';
}

export interface Order {
  id: string;
  items: { product: Product; quantity: number }[];
  subtotal: number;
  discount: number;
  discountReason: string;
  total: number;
  paymentMethod: 'cash' | 'ebirr' | 'cbe' | 'telebirr';
  date: string;
}

export interface StoreMaterial {
  id: string;
  name: string;
  quantity: number;
  measurement: string;
  pricePerUnit: number;
  totalPrice: number;
  expiredDate: string;
  category: 'drink' | 'food' | 'snacks';
}

export type FundKey = 'rent' | 'saving' | 'ingredient' | 'other';

export interface Expense {
  id: string;
  reason: string;
  quantity: number;
  price: number;
  date: string;
  takenBy: string;
  role: 'admin' | 'staff';
  fund: FundKey;
}

export interface FinanceConfig {
  rentAmount: number;
  rentDueDate: string;
  savingPercent: number;
  ingredientPercent: number;
  otherPercent: number;
}

export interface FinanceTxn {
  id: string;
  type: 'deposit' | 'withdraw';
  fund: FundKey;
  amount: number;
  reason: string;
  date: string;
  by: string;
  role: 'admin' | 'staff';
}

export interface Note {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  date: string;
  read: boolean;
  replyToId?: string;
}

export interface TodoItem {
  id: string;
  title: string;
  noteId?: string;
  dueDate: string;
  done: boolean;
}

const drinkSubs = ['Iced Drink', 'Frappe', 'Mojito'];
const foodSubs = ['Western Food', 'Fast Food'];
const snackSubs = ['Fries', 'Other'];

const defaultProducts: Product[] = [
  { id: '1', name: 'Iced Latte', description: 'Cold coffee with milk', price: 120, profit: 45, category: 'drink', subCategory: 'Iced Drink', status: 'active' },
  { id: '2', name: 'Vanilla Frappe', description: 'Blended vanilla coffee', price: 150, profit: 60, category: 'drink', subCategory: 'Frappe', status: 'active' },
  { id: '3', name: 'Mint Mojito', description: 'Fresh mint with soda', price: 100, profit: 40, category: 'drink', subCategory: 'Mojito', status: 'active' },
  { id: '4', name: 'Caramel Frappe', description: 'Caramel blended coffee', price: 160, profit: 65, category: 'drink', subCategory: 'Frappe', status: 'active' },
  { id: '5', name: 'Burger', description: 'Classic beef burger', price: 200, profit: 70, category: 'food', subCategory: 'Fast Food', status: 'active' },
  { id: '6', name: 'Pasta Alfredo', description: 'Creamy pasta', price: 250, profit: 90, category: 'food', subCategory: 'Western Food', status: 'active' },
  { id: '7', name: 'French Fries', description: 'Crispy golden fries', price: 80, profit: 35, category: 'snacks', subCategory: 'Fries', status: 'active' },
  { id: '8', name: 'Iced Americano', description: 'Espresso with cold water', price: 100, profit: 45, category: 'drink', subCategory: 'Iced Drink', status: 'active' },
];

const today = new Date().toISOString().split('T')[0];
const addDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};

const defaultOrders: Order[] = [
  { id: '1', items: [{ product: defaultProducts[0], quantity: 2 }], subtotal: 240, discount: 0, discountReason: '', total: 240, paymentMethod: 'cash', date: today },
  { id: '2', items: [{ product: defaultProducts[4], quantity: 1 }, { product: defaultProducts[6], quantity: 2 }], subtotal: 360, discount: 60, discountReason: 'Loyal customer', total: 300, paymentMethod: 'telebirr', date: today },
  { id: '3', items: [{ product: defaultProducts[1], quantity: 3 }], subtotal: 450, discount: 0, discountReason: '', total: 450, paymentMethod: 'ebirr', date: today },
];

const defaultMaterials: StoreMaterial[] = [
  { id: '1', name: 'Coffee Beans', quantity: 50, measurement: 'kg', pricePerUnit: 800, totalPrice: 40000, expiredDate: '2026-06-15', category: 'drink' },
  { id: '2', name: 'Milk', quantity: 30, measurement: 'liter', pricePerUnit: 65, totalPrice: 1950, expiredDate: '2026-04-20', category: 'drink' },
  { id: '3', name: 'Vanilla Syrup', quantity: 10, measurement: 'liter', pricePerUnit: 350, totalPrice: 3500, expiredDate: '2026-04-14', category: 'drink' },
  { id: '4', name: 'Beef Patty', quantity: 20, measurement: 'kg', pricePerUnit: 450, totalPrice: 9000, expiredDate: '2026-04-12', category: 'food' },
  { id: '5', name: 'Potato', quantity: 100, measurement: 'kg', pricePerUnit: 50, totalPrice: 5000, expiredDate: '2026-05-01', category: 'snacks' },
  { id: '6', name: 'Mint Leaves', quantity: 5, measurement: 'kg', pricePerUnit: 200, totalPrice: 1000, expiredDate: '2026-04-11', category: 'drink' },
];

const defaultExpenses: Expense[] = [
  { id: '1', reason: 'Coffee Beans Purchase', quantity: 10, price: 8000, date: today, takenBy: 'Admin', role: 'admin', fund: 'ingredient' },
  { id: '2', reason: 'Milk Supply', quantity: 20, price: 1300, date: today, takenBy: 'Abilo', role: 'staff', fund: 'ingredient' },
  { id: '3', reason: 'Cleaning Supplies', quantity: 5, price: 500, date: today, takenBy: 'Abilo', role: 'staff', fund: 'other' },
];

const defaultConfig: FinanceConfig = {
  rentAmount: 25000,
  rentDueDate: addDays(20),
  savingPercent: 40,
  ingredientPercent: 50,
  otherPercent: 10,
};

const defaultTxns: FinanceTxn[] = [
  { id: '1', type: 'deposit', fund: 'rent', amount: 10000, reason: 'Monthly rent saving', date: today, by: 'Admin', role: 'admin' },
  { id: '2', type: 'deposit', fund: 'ingredient', amount: 12000, reason: 'Ingredient fund', date: today, by: 'Admin', role: 'admin' },
  { id: '3', type: 'deposit', fund: 'saving', amount: 6000, reason: 'Saving fund', date: today, by: 'Admin', role: 'admin' },
  { id: '4', type: 'withdraw', fund: 'ingredient', amount: 8000, reason: 'Coffee Beans Purchase', date: today, by: 'Admin', role: 'admin' },
  { id: '5', type: 'withdraw', fund: 'ingredient', amount: 1300, reason: 'Milk Supply', date: today, by: 'Abilo', role: 'staff' },
  { id: '6', type: 'withdraw', fund: 'other', amount: 500, reason: 'Cleaning Supplies', date: today, by: 'Abilo', role: 'staff' },
];

const defaultNotes: Note[] = [
  { id: '1', from: 'Abilo', to: 'Admin', subject: 'Milk running low', body: 'We only have 2 liters of milk left, please order more before Friday.', date: today, read: false },
];

const defaultTodos: TodoItem[] = [
  { id: '1', title: 'Order milk supply', noteId: '1', dueDate: addDays(2), done: false },
];

interface DataContextType {
  products: Product[];
  orders: Order[];
  materials: StoreMaterial[];
  expenses: Expense[];
  financeConfig: FinanceConfig;
  txns: FinanceTxn[];
  notes: Note[];
  todos: TodoItem[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOrder: (o: Omit<Order, 'id'>) => void;
  addMaterial: (m: Omit<StoreMaterial, 'id'>) => void;
  updateMaterial: (id: string, m: Partial<StoreMaterial>) => void;
  deleteMaterial: (id: string) => void;
  useMaterial: (id: string, amount: number) => void;
  addExpense: (e: Omit<Expense, 'id' | 'takenBy' | 'role'> & { takenBy?: string; role?: 'admin' | 'staff' }) => void;
  updateExpense: (id: string, e: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  updateFinanceConfig: (c: Partial<FinanceConfig>) => void;
  deposit: (fund: FundKey, amount: number, reason: string) => void;
  withdraw: (fund: FundKey, amount: number, reason: string, quantity?: number) => boolean;
  fundBalance: (fund: FundKey) => number;
  rentStatus: () => { needed: number; saved: number; remaining: number; daysLeft: number };
  suggestAllocation: (amount: number) => { rent: number; ingredient: number; saving: number; other: number };
  sendNote: (to: string, subject: string, body: string, replyToId?: string) => void;
  markNoteRead: (id: string) => void;
  deleteNote: (id: string) => void;
  addTodo: (title: string, dueDate: string, noteId?: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  currentUserName: string;
  isAdmin: boolean;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  drinkSubCategories: string[];
  foodSubCategories: string[];
  snackSubCategories: string[];
}

const DataContext = createContext<DataContextType | null>(null);
export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be inside DataProvider');
  return ctx;
};

function loadOrDefault<T>(key: string, def: T): T {
  const saved = localStorage.getItem(key);
  try {
    return saved ? (JSON.parse(saved) as T) : def;
  } catch {
    return def;
  }
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>(() => loadOrDefault('cafe_products_v2', defaultProducts));
  const [orders, setOrders] = useState<Order[]>(() => loadOrDefault('cafe_orders_v2', defaultOrders));
  const [materials, setMaterials] = useState<StoreMaterial[]>(() => loadOrDefault('cafe_materials', defaultMaterials));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadOrDefault('cafe_expenses_v2', defaultExpenses));
  const [financeConfig, setFinanceConfig] = useState<FinanceConfig>(() => loadOrDefault('cafe_finance_config', defaultConfig));
  const [txns, setTxns] = useState<FinanceTxn[]>(() => loadOrDefault('cafe_finance_txns', defaultTxns));
  const [notes, setNotes] = useState<Note[]>(() => loadOrDefault('cafe_notes', defaultNotes));
  const [todos, setTodos] = useState<TodoItem[]>(() => loadOrDefault('cafe_todos', defaultTodos));
  const [selectedDate, setSelectedDate] = useState(today);

  const currentUserName = user ? `${user.firstName}` : 'Admin';
  const isAdmin = (user?.username || '').toLowerCase() !== 'abilo';
  const role: 'admin' | 'staff' = isAdmin ? 'admin' : 'staff';

  useEffect(() => { localStorage.setItem('cafe_products_v2', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('cafe_orders_v2', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('cafe_materials', JSON.stringify(materials)); }, [materials]);
  useEffect(() => { localStorage.setItem('cafe_expenses_v2', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('cafe_finance_config', JSON.stringify(financeConfig)); }, [financeConfig]);
  useEffect(() => { localStorage.setItem('cafe_finance_txns', JSON.stringify(txns)); }, [txns]);
  useEffect(() => { localStorage.setItem('cafe_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('cafe_todos', JSON.stringify(todos)); }, [todos]);

  const addProduct = (p: Omit<Product, 'id'>) => setProducts(prev => [...prev, { ...p, id: crypto.randomUUID() }]);
  const updateProduct = (id: string, p: Partial<Product>) => setProducts(prev => prev.map(x => x.id === id ? { ...x, ...p } : x));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(x => x.id !== id));
  const addOrder = (o: Omit<Order, 'id'>) => setOrders(prev => [...prev, { ...o, id: crypto.randomUUID() }]);
  const addMaterial = (m: Omit<StoreMaterial, 'id'>) => setMaterials(prev => [...prev, { ...m, id: crypto.randomUUID() }]);
  const updateMaterial = (id: string, m: Partial<StoreMaterial>) => setMaterials(prev => prev.map(x => x.id === id ? { ...x, ...m } : x));
  const deleteMaterial = (id: string) => setMaterials(prev => prev.filter(x => x.id !== id));
  const useMaterial = (id: string, amount: number) => setMaterials(prev => prev.map(x => x.id === id ? { ...x, quantity: Math.max(0, x.quantity - amount) } : x));

  const addExpense: DataContextType['addExpense'] = (e) => setExpenses(prev => [...prev, {
    ...e,
    takenBy: e.takenBy || currentUserName,
    role: e.role || role,
    id: crypto.randomUUID(),
  }]);
  const updateExpense = (id: string, e: Partial<Expense>) => setExpenses(prev => prev.map(x => x.id === id ? { ...x, ...e } : x));
  const deleteExpense = (id: string) => setExpenses(prev => prev.filter(x => x.id !== id));

  const updateFinanceConfig = (c: Partial<FinanceConfig>) => setFinanceConfig(prev => ({ ...prev, ...c }));

  const fundBalance = (fund: FundKey) =>
    txns.filter(t => t.fund === fund).reduce((s, t) => s + (t.type === 'deposit' ? t.amount : -t.amount), 0);

  const deposit = (fund: FundKey, amount: number, reason: string) => {
    setTxns(prev => [...prev, { id: crypto.randomUUID(), type: 'deposit', fund, amount, reason, date: selectedDate, by: currentUserName, role }]);
  };

  const withdraw = (fund: FundKey, amount: number, reason: string, quantity = 1) => {
    if (amount > fundBalance(fund)) return false;
    setTxns(prev => [...prev, { id: crypto.randomUUID(), type: 'withdraw', fund, amount, reason, date: selectedDate, by: currentUserName, role }]);
    addExpense({ reason, quantity, price: amount, date: selectedDate, fund });
    return true;
  };

  const rentStatus = () => {
    const saved = fundBalance('rent');
    const needed = financeConfig.rentAmount;
    const due = new Date(financeConfig.rentDueDate).getTime();
    const daysLeft = Math.max(0, Math.ceil((due - Date.now()) / 86400000));
    return { needed, saved, remaining: Math.max(0, needed - saved), daysLeft };
  };

  const suggestAllocation = (amount: number) => {
    const rent = Math.min(amount, rentStatus().remaining);
    const rest = amount - rent;
    const { savingPercent, ingredientPercent, otherPercent } = financeConfig;
    const totalPct = Math.max(1, savingPercent + ingredientPercent + otherPercent);
    return {
      rent,
      ingredient: Math.round((rest * ingredientPercent) / totalPct),
      saving: Math.round((rest * savingPercent) / totalPct),
      other: Math.round((rest * otherPercent) / totalPct),
    };
  };

  const sendNote = (to: string, subject: string, body: string, replyToId?: string) =>
    setNotes(prev => [...prev, { id: crypto.randomUUID(), from: currentUserName, to, subject, body, date: selectedDate, read: false, replyToId }]);
  const markNoteRead = (id: string) => setNotes(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));

  const addTodo = (title: string, dueDate: string, noteId?: string) =>
    setTodos(prev => [...prev, { id: crypto.randomUUID(), title, dueDate, noteId, done: false }]);
  const toggleTodo = (id: string) => setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTodo = (id: string) => setTodos(prev => prev.filter(t => t.id !== id));

  return (
    <DataContext.Provider value={{
      products, orders, materials, expenses, financeConfig, txns, notes, todos,
      addProduct, updateProduct, deleteProduct,
      addOrder, addMaterial, updateMaterial, deleteMaterial, useMaterial,
      addExpense, updateExpense, deleteExpense,
      updateFinanceConfig, deposit, withdraw, fundBalance, rentStatus, suggestAllocation,
      sendNote, markNoteRead, deleteNote, addTodo, toggleTodo, deleteTodo,
      currentUserName, isAdmin,
      selectedDate, setSelectedDate,
      drinkSubCategories: drinkSubs, foodSubCategories: foodSubs, snackSubCategories: snackSubs,
    }}>
      {children}
    </DataContext.Provider>
  );
};
