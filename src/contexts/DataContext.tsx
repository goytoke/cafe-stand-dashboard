import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, AppRole } from '@/contexts/AuthContext';

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
  role: AppRole;
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
  role: AppRole;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
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

export interface Takeout {
  id: string;
  materialId: string;
  materialName: string;
  amount: number;
  measurement: string;
  value: number;
  date: string;
  by: string;
  role: AppRole;
}

export interface SalaryPayment {
  id: string;
  employeeId: string;
  employeeName: string;
  username: string;
  salary: number;
  days: number;
  amount: number;
  periodFrom: string;
  date: string;
  paidBy: string;
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

const mk = (id: string, items: { p: number; q: number }[], pay: Order['paymentMethod'], date: string, discount = 0, discountReason = ''): Order => {
  const orderItems = items.map(i => ({ product: defaultProducts[i.p], quantity: i.q }));
  const subtotal = orderItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
  return { id, items: orderItems, subtotal, discount, discountReason, total: subtotal - discount, paymentMethod: pay, date };
};

const defaultOrders: Order[] = [
  mk('1', [{ p: 0, q: 2 }], 'cash', today),
  mk('2', [{ p: 4, q: 1 }, { p: 6, q: 2 }], 'telebirr', today, 60, 'Loyal customer'),
  mk('3', [{ p: 1, q: 3 }], 'ebirr', today),
  mk('4', [{ p: 7, q: 4 }, { p: 2, q: 2 }], 'cash', today),
  mk('5', [{ p: 3, q: 2 }, { p: 6, q: 3 }], 'cbe', today, 40, 'Staff discount'),
  mk('6', [{ p: 5, q: 2 }], 'telebirr', today),
  mk('7', [{ p: 0, q: 3 }, { p: 4, q: 2 }], 'cash', addDays(-1)),
  mk('8', [{ p: 1, q: 2 }, { p: 7, q: 5 }], 'ebirr', addDays(-1), 50, 'Promo day'),
  mk('9', [{ p: 2, q: 4 }], 'cash', addDays(-2)),
  mk('10', [{ p: 5, q: 1 }, { p: 6, q: 2 }], 'cbe', addDays(-2)),
];

const defaultMaterials: StoreMaterial[] = [
  { id: '1', name: 'Coffee Beans', quantity: 50, measurement: 'kg', pricePerUnit: 800, totalPrice: 40000, expiredDate: addDays(120), category: 'drink' },
  { id: '2', name: 'Milk', quantity: 30, measurement: 'liter', pricePerUnit: 65, totalPrice: 1950, expiredDate: addDays(4), category: 'drink' },
  { id: '3', name: 'Vanilla Syrup', quantity: 10, measurement: 'liter', pricePerUnit: 350, totalPrice: 3500, expiredDate: addDays(2), category: 'drink' },
  { id: '4', name: 'Beef Patty', quantity: 20, measurement: 'kg', pricePerUnit: 450, totalPrice: 9000, expiredDate: addDays(1), category: 'food' },
  { id: '5', name: 'Potato', quantity: 100, measurement: 'kg', pricePerUnit: 50, totalPrice: 5000, expiredDate: addDays(45), category: 'snacks' },
  { id: '6', name: 'Mint Leaves', quantity: 5, measurement: 'kg', pricePerUnit: 200, totalPrice: 1000, expiredDate: addDays(-2), category: 'drink' },
  { id: '7', name: 'Whipping Cream', quantity: 6, measurement: 'liter', pricePerUnit: 420, totalPrice: 2520, expiredDate: addDays(-5), category: 'drink' },
  { id: '8', name: 'Burger Buns', quantity: 40, measurement: 'pieces', pricePerUnit: 25, totalPrice: 1000, expiredDate: addDays(3), category: 'food' },
  { id: '9', name: 'Cheese Slices', quantity: 200, measurement: 'gram', pricePerUnit: 3, totalPrice: 600, expiredDate: addDays(-1), category: 'food' },
];

const defaultExpenses: Expense[] = [
  { id: '1', reason: 'Coffee Beans Purchase', quantity: 10, price: 8000, date: today, takenBy: 'Admin', role: 'admin', fund: 'ingredient' },
  { id: '2', reason: 'Milk Supply', quantity: 20, price: 1300, date: today, takenBy: 'Abilo', role: 'staff', fund: 'ingredient' },
  { id: '3', reason: 'Cleaning Supplies', quantity: 5, price: 500, date: today, takenBy: 'Abilo', role: 'staff', fund: 'other' },
  { id: '4', reason: 'Equipment repair (from saving)', quantity: 1, price: 2500, date: today, takenBy: 'Admin', role: 'admin', fund: 'saving' },
  { id: '5', reason: 'Cheese & buns restock', quantity: 12, price: 1600, date: addDays(-1), takenBy: 'Abilo', role: 'staff', fund: 'ingredient' },
  { id: '6', reason: 'Staff transport (from saving)', quantity: 1, price: 700, date: addDays(-1), takenBy: 'Admin', role: 'admin', fund: 'saving' },
  { id: '7', reason: 'Syrup restock', quantity: 4, price: 1400, date: addDays(-2), takenBy: 'Admin', role: 'admin', fund: 'ingredient' },
];

const defaultConfig: FinanceConfig = {
  rentAmount: 25000,
  rentDueDate: addDays(20),
  savingPercent: 40,
  ingredientPercent: 50,
  otherPercent: 10,
};

const defaultTxns: FinanceTxn[] = [
  { id: '1', type: 'deposit', fund: 'rent', amount: 18000, reason: 'Monthly rent saving', date: addDays(-2), by: 'Admin', role: 'admin' },
  { id: '2', type: 'deposit', fund: 'ingredient', amount: 20000, reason: 'Ingredient fund', date: addDays(-2), by: 'Admin', role: 'admin' },
  { id: '3', type: 'deposit', fund: 'saving', amount: 15000, reason: 'Saving fund', date: addDays(-2), by: 'Admin', role: 'admin' },
  { id: '4', type: 'deposit', fund: 'other', amount: 4000, reason: 'Misc fund', date: addDays(-2), by: 'Admin', role: 'admin' },
  { id: '5', type: 'withdraw', fund: 'ingredient', amount: 1400, reason: 'Syrup restock', date: addDays(-2), by: 'Admin', role: 'admin' },
  { id: '6', type: 'withdraw', fund: 'ingredient', amount: 1600, reason: 'Cheese & buns restock', date: addDays(-1), by: 'Abilo', role: 'staff' },
  { id: '7', type: 'withdraw', fund: 'saving', amount: 700, reason: 'Staff transport (from saving)', date: addDays(-1), by: 'Admin', role: 'admin' },
  { id: '8', type: 'withdraw', fund: 'ingredient', amount: 8000, reason: 'Coffee Beans Purchase', date: today, by: 'Admin', role: 'admin' },
  { id: '9', type: 'withdraw', fund: 'ingredient', amount: 1300, reason: 'Milk Supply', date: today, by: 'Abilo', role: 'staff' },
  { id: '10', type: 'withdraw', fund: 'other', amount: 500, reason: 'Cleaning Supplies', date: today, by: 'Abilo', role: 'staff' },
  { id: '11', type: 'withdraw', fund: 'saving', amount: 2500, reason: 'Equipment repair (from saving)', date: today, by: 'Admin', role: 'admin' },
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
  takeouts: Takeout[];

  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOrder: (o: Omit<Order, 'id'>) => void;
  addMaterial: (m: Omit<StoreMaterial, 'id'>) => void;
  updateMaterial: (id: string, m: Partial<StoreMaterial>) => void;
  deleteMaterial: (id: string) => void;
  useMaterial: (id: string, amount: number) => void;
  addExpense: (e: Omit<Expense, 'id' | 'takenBy' | 'role'> & { takenBy?: string; role?: AppRole }) => void;
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
  currentRole: AppRole;
  telegramConfig: TelegramConfig;
  updateTelegramConfig: (c: Partial<TelegramConfig>) => void;
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
  const [orders, setOrders] = useState<Order[]>(() => loadOrDefault('cafe_orders_v3', defaultOrders));
  const [materials, setMaterials] = useState<StoreMaterial[]>(() => loadOrDefault('cafe_materials_v3', defaultMaterials));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadOrDefault('cafe_expenses_v3', defaultExpenses));
  const [financeConfig, setFinanceConfig] = useState<FinanceConfig>(() => loadOrDefault('cafe_finance_config', defaultConfig));
  const [txns, setTxns] = useState<FinanceTxn[]>(() => loadOrDefault('cafe_finance_txns_v3', defaultTxns));
  const [notes, setNotes] = useState<Note[]>(() => loadOrDefault('cafe_notes', defaultNotes));
  const [todos, setTodos] = useState<TodoItem[]>(() => loadOrDefault('cafe_todos', defaultTodos));
  const [selectedDate, setSelectedDate] = useState(today);

  const currentUserName = user ? `${user.firstName}` : 'Admin';
  const role: AppRole = user?.role || 'admin';
  const isAdmin = role === 'admin';
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>(() => loadOrDefault('cafe_telegram_config', { botToken: '', chatId: '' }));
  const updateTelegramConfig = (c: Partial<TelegramConfig>) => setTelegramConfig(prev => ({ ...prev, ...c }));

  useEffect(() => { localStorage.setItem('cafe_products_v2', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('cafe_orders_v3', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('cafe_materials_v3', JSON.stringify(materials)); }, [materials]);
  useEffect(() => { localStorage.setItem('cafe_expenses_v3', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('cafe_finance_config', JSON.stringify(financeConfig)); }, [financeConfig]);
  useEffect(() => { localStorage.setItem('cafe_finance_txns_v3', JSON.stringify(txns)); }, [txns]);
  useEffect(() => { localStorage.setItem('cafe_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('cafe_telegram_config', JSON.stringify(telegramConfig)); }, [telegramConfig]);
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
      currentUserName, isAdmin, currentRole: role, telegramConfig, updateTelegramConfig,
      selectedDate, setSelectedDate,
      drinkSubCategories: drinkSubs, foodSubCategories: foodSubs, snackSubCategories: snackSubs,
    }}>
      {children}
    </DataContext.Provider>
  );
};
