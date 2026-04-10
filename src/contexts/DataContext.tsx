import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'drink' | 'food' | 'snacks';
  subCategory: string;
  image?: string;
  status: 'active' | 'inactive';
}

export interface Order {
  id: string;
  items: { product: Product; quantity: number }[];
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

export interface Expense {
  id: string;
  reason: string;
  quantity: number;
  price: number;
  date: string;
}

const drinkSubs = ['Iced Drink', 'Frappe', 'Mojito'];
const foodSubs = ['Western Food', 'Fast Food'];
const snackSubs = ['Fries', 'Other'];

const defaultProducts: Product[] = [
  { id: '1', name: 'Iced Latte', description: 'Cold coffee with milk', price: 120, category: 'drink', subCategory: 'Iced Drink', status: 'active' },
  { id: '2', name: 'Vanilla Frappe', description: 'Blended vanilla coffee', price: 150, category: 'drink', subCategory: 'Frappe', status: 'active' },
  { id: '3', name: 'Mint Mojito', description: 'Fresh mint with soda', price: 100, category: 'drink', subCategory: 'Mojito', status: 'active' },
  { id: '4', name: 'Caramel Frappe', description: 'Caramel blended coffee', price: 160, category: 'drink', subCategory: 'Frappe', status: 'active' },
  { id: '5', name: 'Burger', description: 'Classic beef burger', price: 200, category: 'food', subCategory: 'Fast Food', status: 'active' },
  { id: '6', name: 'Pasta Alfredo', description: 'Creamy pasta', price: 250, category: 'food', subCategory: 'Western Food', status: 'active' },
  { id: '7', name: 'French Fries', description: 'Crispy golden fries', price: 80, category: 'snacks', subCategory: 'Fries', status: 'active' },
  { id: '8', name: 'Iced Americano', description: 'Espresso with cold water', price: 100, category: 'drink', subCategory: 'Iced Drink', status: 'active' },
];

const today = new Date().toISOString().split('T')[0];

const defaultOrders: Order[] = [
  { id: '1', items: [{ product: defaultProducts[0], quantity: 2 }], total: 240, paymentMethod: 'cash', date: today },
  { id: '2', items: [{ product: defaultProducts[4], quantity: 1 }, { product: defaultProducts[6], quantity: 2 }], total: 360, paymentMethod: 'telebirr', date: today },
  { id: '3', items: [{ product: defaultProducts[1], quantity: 3 }], total: 450, paymentMethod: 'ebirr', date: today },
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
  { id: '1', reason: 'Coffee Beans Purchase', quantity: 10, price: 8000, date: today },
  { id: '2', reason: 'Milk Supply', quantity: 20, price: 1300, date: today },
  { id: '3', reason: 'Cleaning Supplies', quantity: 5, price: 500, date: '2026-04-09' },
];

interface DataContextType {
  products: Product[];
  orders: Order[];
  materials: StoreMaterial[];
  expenses: Expense[];
  addProduct: (p: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOrder: (o: Omit<Order, 'id'>) => void;
  addMaterial: (m: Omit<StoreMaterial, 'id'>) => void;
  updateMaterial: (id: string, m: Partial<StoreMaterial>) => void;
  deleteMaterial: (id: string) => void;
  useMaterial: (id: string, amount: number) => void;
  addExpense: (e: Omit<Expense, 'id'>) => void;
  updateExpense: (id: string, e: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
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
  return saved ? JSON.parse(saved) : def;
}

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => loadOrDefault('cafe_products', defaultProducts));
  const [orders, setOrders] = useState<Order[]>(() => loadOrDefault('cafe_orders', defaultOrders));
  const [materials, setMaterials] = useState<StoreMaterial[]>(() => loadOrDefault('cafe_materials', defaultMaterials));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadOrDefault('cafe_expenses', defaultExpenses));
  const [selectedDate, setSelectedDate] = useState(today);

  useEffect(() => { localStorage.setItem('cafe_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('cafe_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('cafe_materials', JSON.stringify(materials)); }, [materials]);
  useEffect(() => { localStorage.setItem('cafe_expenses', JSON.stringify(expenses)); }, [expenses]);

  const addProduct = (p: Omit<Product, 'id'>) => setProducts(prev => [...prev, { ...p, id: crypto.randomUUID() }]);
  const updateProduct = (id: string, p: Partial<Product>) => setProducts(prev => prev.map(x => x.id === id ? { ...x, ...p } : x));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(x => x.id !== id));
  const addOrder = (o: Omit<Order, 'id'>) => setOrders(prev => [...prev, { ...o, id: crypto.randomUUID() }]);
  const addMaterial = (m: Omit<StoreMaterial, 'id'>) => setMaterials(prev => [...prev, { ...m, id: crypto.randomUUID() }]);
  const updateMaterial = (id: string, m: Partial<StoreMaterial>) => setMaterials(prev => prev.map(x => x.id === id ? { ...x, ...m } : x));
  const deleteMaterial = (id: string) => setMaterials(prev => prev.filter(x => x.id !== id));
  const useMaterial = (id: string, amount: number) => setMaterials(prev => prev.map(x => x.id === id ? { ...x, quantity: Math.max(0, x.quantity - amount) } : x));
  const addExpense = (e: Omit<Expense, 'id'>) => setExpenses(prev => [...prev, { ...e, id: crypto.randomUUID() }]);
  const updateExpense = (id: string, e: Partial<Expense>) => setExpenses(prev => prev.map(x => x.id === id ? { ...x, ...e } : x));
  const deleteExpense = (id: string) => setExpenses(prev => prev.filter(x => x.id !== id));

  return (
    <DataContext.Provider value={{
      products, orders, materials, expenses,
      addProduct, updateProduct, deleteProduct,
      addOrder, addMaterial, updateMaterial, deleteMaterial, useMaterial,
      addExpense, updateExpense, deleteExpense,
      selectedDate, setSelectedDate,
      drinkSubCategories: drinkSubs, foodSubCategories: foodSubs, snackSubCategories: snackSubs,
    }}>
      {children}
    </DataContext.Provider>
  );
};
