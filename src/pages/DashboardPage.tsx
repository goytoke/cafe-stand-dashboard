import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const DashboardPage: React.FC = () => {
  const { orders, expenses, selectedDate } = useData();
  const [graphType, setGraphType] = useState<'sales' | 'orders' | 'expenses'>('sales');

  const todayOrders = orders.filter(o => o.date === selectedDate);
  const todayExpenses = expenses.filter(e => e.date === selectedDate);
  const todaySales = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const todayExpenseTotal = todayExpenses.reduce((sum, e) => sum + e.price, 0);

  const stats = [
    { label: "Today's Sales", value: `${todaySales.toLocaleString()} ETB`, icon: TrendingUp, color: 'bg-primary' },
    { label: "Today's Orders", value: todayOrders.length, icon: ShoppingCart, color: 'bg-info' },
    { label: "Today's Expense", value: `${todayExpenseTotal.toLocaleString()} ETB`, icon: DollarSign, color: 'bg-accent' },
  ];

  const salesByMethod = [
    { name: 'Cash', amount: todayOrders.filter(o => o.paymentMethod === 'cash').reduce((s, o) => s + o.total, 0) },
    { name: 'E-Birr', amount: todayOrders.filter(o => o.paymentMethod === 'ebirr').reduce((s, o) => s + o.total, 0) },
    { name: 'Telebirr', amount: todayOrders.filter(o => o.paymentMethod === 'telebirr').reduce((s, o) => s + o.total, 0) },
    { name: 'CBE', amount: todayOrders.filter(o => o.paymentMethod === 'cbe').reduce((s, o) => s + o.total, 0) },
  ];

  const ordersByHour = Array.from({ length: 12 }, (_, i) => ({ hour: `${i + 8}:00`, count: Math.floor(Math.random() * 5) }));

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-xl font-heading font-bold">Dashboard</h2>
      {todayOrders.length === 0 && todayExpenses.length === 0 && (
        <div className="panel-card p-6 text-center text-muted-foreground">
          No data for {selectedDate}. Try selecting a different date.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map(s => (
          <div key={s.label} className="stat-card flex items-center gap-4 cursor-pointer hover:shadow-panel transition-shadow" onClick={() => setGraphType(s.label.includes('Sales') ? 'sales' : s.label.includes('Order') ? 'orders' : 'expenses')}>
            <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center`}>
              <s.icon className="text-primary-foreground" size={22} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-heading font-bold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Panel links */}
      <div className="flex gap-2">
        {(['sales', 'orders', 'expenses'] as const).map(t => (
          <button key={t} onClick={() => setGraphType(t)} className={`panel-link ${graphType === t ? 'panel-link-active' : 'panel-link-inactive'}`}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Graph */}
      <div className="panel-card p-6">
        <h3 className="text-sm font-heading font-semibold mb-4">
          {graphType === 'sales' ? 'Sales by Payment Method' : graphType === 'orders' ? 'Orders by Hour' : 'Expense Breakdown'}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          {graphType === 'sales' ? (
            <BarChart data={salesByMethod}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="amount" fill="hsl(153 50% 28%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : graphType === 'orders' ? (
            <LineChart data={ordersByHour}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 88%)" />
              <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="hsl(210 80% 55%)" strokeWidth={2} />
            </LineChart>
          ) : (
            <BarChart data={todayExpenses.map(e => ({ name: e.reason.substring(0, 15), amount: e.price }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="amount" fill="hsl(25 90% 55%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardPage;
