import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['hsl(153 50% 28%)', 'hsl(25 90% 55%)', 'hsl(210 80% 55%)', 'hsl(38 92% 50%)', 'hsl(0 72% 51%)'];

const ReportPage: React.FC = () => {
  const { orders, expenses, materials, products, selectedDate, fundBalance } = useData();
  const [reportType, setReportType] = useState<'overview' | 'products' | 'expenses' | 'discount' | 'finance' | 'inventory'>('overview');

  const totalDiscount = orders.reduce((s, o) => s + (o.discount || 0), 0);
  const costByAdmin = expenses.filter(e => e.role === 'admin').reduce((s, e) => s + e.price, 0);
  const costByStaff = expenses.filter(e => e.role === 'staff').reduce((s, e) => s + e.price, 0);
  const discountedOrders = orders.filter(o => (o.discount || 0) > 0);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.price, 0);
  const totalOrders = orders.length;
  const profit = totalRevenue - totalExpenses;

  const categoryRevenue = ['drink', 'food', 'snacks'].map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: orders.reduce((s, o) => s + o.items.filter(i => i.product.category === cat).reduce((is, i) => is + i.product.price * i.quantity, 0), 0),
  }));

  const exportReport = () => {
    const lines = [
      'The Anfield Stand - Report',
      `Date: ${selectedDate}`,
      '',
      `Total Revenue: ${totalRevenue} ETB`,
      `Total Expenses: ${totalExpenses} ETB`,
      `Profit: ${profit} ETB`,
      `Total Orders: ${totalOrders}`,
      '',
      'Revenue by Category:',
      ...categoryRevenue.map(c => `  ${c.name}: ${c.value} ETB`),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'report.txt'; a.click();
  };

  const tabs = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'products' as const, label: 'Products' },
    { key: 'expenses' as const, label: 'Expenses' },
    { key: 'inventory' as const, label: 'Inventory' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold">Report</h2>
        <button onClick={exportReport} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Download size={16} /> Export Report
        </button>
      </div>

      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setReportType(t.key)} className={`panel-link ${reportType === t.key ? 'panel-link-active' : 'panel-link-inactive'}`}>{t.label}</button>
        ))}
      </div>

      {reportType === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card"><p className="text-xs text-muted-foreground">Total Revenue</p><p className="text-xl font-heading font-bold text-primary">{totalRevenue.toLocaleString()} ETB</p></div>
            <div className="stat-card"><p className="text-xs text-muted-foreground">Total Expenses</p><p className="text-xl font-heading font-bold text-accent">{totalExpenses.toLocaleString()} ETB</p></div>
            <div className="stat-card"><p className="text-xs text-muted-foreground">Profit</p><p className={`text-xl font-heading font-bold ${profit >= 0 ? 'text-success' : 'text-destructive'}`}>{profit.toLocaleString()} ETB</p></div>
            <div className="stat-card"><p className="text-xs text-muted-foreground">Total Orders</p><p className="text-xl font-heading font-bold text-info">{totalOrders}</p></div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="panel-card p-6">
              <h3 className="text-sm font-heading font-semibold mb-4">Revenue by Category</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart><Pie data={categoryRevenue} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {categoryRevenue.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            </div>
            <div className="panel-card p-6">
              <h3 className="text-sm font-heading font-semibold mb-4">Revenue vs Expenses</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={[{ name: 'Revenue', amount: totalRevenue }, { name: 'Expenses', amount: totalExpenses }, { name: 'Profit', amount: profit }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 88%)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                  <Bar dataKey="amount" fill="hsl(153 50% 28%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {reportType === 'products' && (
        <div className="table-container overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-secondary/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
            </tr></thead>
            <tbody>{products.map(p => (
              <tr key={p.id} className="border-b border-border hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">{p.subCategory}</td>
                <td className="px-4 py-3">{p.price} ETB</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-success/10 text-success rounded text-xs">{p.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {reportType === 'expenses' && (
        <div className="table-container overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-secondary/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reason</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
            </tr></thead>
            <tbody>{expenses.map(e => (
              <tr key={e.id} className="border-b border-border hover:bg-secondary/30">
                <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                <td className="px-4 py-3 font-medium">{e.reason}</td>
                <td className="px-4 py-3">{e.price.toLocaleString()} ETB</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {reportType === 'inventory' && (
        <div className="table-container overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-secondary/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Material</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Quantity</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Value</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Expires</th>
            </tr></thead>
            <tbody>{materials.map(m => (
              <tr key={m.id} className="border-b border-border hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3">{m.quantity} {m.measurement}</td>
                <td className="px-4 py-3">{m.totalPrice.toLocaleString()} ETB</td>
                <td className="px-4 py-3">{m.expiredDate}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
