import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';

const COLORS = ['hsl(153 50% 28%)', 'hsl(25 90% 55%)', 'hsl(210 80% 55%)', 'hsl(38 92% 50%)'];

const SalesPage: React.FC = () => {
  const { orders, products, selectedDate } = useData();
  const [activeTab, setActiveTab] = useState<'today' | 'most' | 'least' | 'discount'>('today');
  const discountedOrders = orders.filter(o => (o.discount || 0) > 0);
  const totalDiscount = discountedOrders.reduce((s, o) => s + o.discount, 0);

  const todayOrders = orders.filter(o => o.date === selectedDate);
  const todaySales = todayOrders.reduce((s, o) => s + o.total, 0);

  const paymentBreakdown = [
    { name: 'Cash', value: todayOrders.filter(o => o.paymentMethod === 'cash').reduce((s, o) => s + o.total, 0) },
    { name: 'E-Birr', value: todayOrders.filter(o => o.paymentMethod === 'ebirr').reduce((s, o) => s + o.total, 0) },
    { name: 'Telebirr', value: todayOrders.filter(o => o.paymentMethod === 'telebirr').reduce((s, o) => s + o.total, 0) },
    { name: 'CBE', value: todayOrders.filter(o => o.paymentMethod === 'cbe').reduce((s, o) => s + o.total, 0) },
  ];

  // Product sales counts
  const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
  orders.forEach(o => o.items.forEach(i => {
    if (!productSales[i.product.id]) productSales[i.product.id] = { name: i.product.name, count: 0, revenue: 0 };
    productSales[i.product.id].count += i.quantity;
    productSales[i.product.id].revenue += i.product.price * i.quantity;
  }));
  const sorted = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);
  const mostSold = sorted.slice(0, 5);
  const leastSold = sorted.slice(-5).reverse();

  const exportData = () => {
    const csv = ['Payment Method,Amount', ...paymentBreakdown.map(p => `${p.name},${p.value}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'sales.csv'; a.click();
  };

  const tabs = [
    { key: 'today' as const, label: "Today's Sales" },
    { key: 'most' as const, label: 'Most Sales' },
    { key: 'least' as const, label: 'Least Sales' },
  ];

  const displayData = activeTab === 'most' ? mostSold : activeTab === 'least' ? leastSold : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold">Sales</h2>
        <button onClick={exportData} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Download size={16} /> Export
        </button>
      </div>

      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`panel-link ${activeTab === t.key ? 'panel-link-active' : 'panel-link-inactive'}`}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'today' ? (
        <>
          {todaySales === 0 ? (
            <div className="panel-card p-6 text-center text-muted-foreground">No sales for {selectedDate}</div>
          ) : (
            <>
              <div className="grid grid-cols-4 gap-4">
                {paymentBreakdown.map((p, i) => (
                  <div key={p.name} className="stat-card text-center">
                    <p className="text-xs text-muted-foreground">{p.name}</p>
                    <p className="text-xl font-heading font-bold mt-1">{p.value.toLocaleString()} ETB</p>
                  </div>
                ))}
              </div>
              <div className="table-container overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border bg-secondary/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order ID</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Items</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Payment</th>
                  </tr></thead>
                  <tbody>
                    {todayOrders.map(o => (
                      <tr key={o.id} className="border-b border-border hover:bg-secondary/30">
                        <td className="px-4 py-3 font-medium">#{o.id.substring(0, 8)}</td>
                        <td className="px-4 py-3">{o.items.map(i => `${i.product.name} x${i.quantity}`).join(', ')}</td>
                        <td className="px-4 py-3 font-bold">{o.total.toLocaleString()} ETB</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 bg-secondary rounded text-xs">{o.paymentMethod}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="panel-card p-6">
                <h3 className="text-sm font-heading font-semibold mb-4">Sales by Payment Method</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={paymentBreakdown.filter(p => p.value > 0)} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {paymentBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <div className="table-container overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Units Sold</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Revenue</th>
              </tr></thead>
              <tbody>
                {displayData.map(d => (
                  <tr key={d.name} className="border-b border-border hover:bg-secondary/30">
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="px-4 py-3">{d.count}</td>
                    <td className="px-4 py-3 font-bold">{d.revenue.toLocaleString()} ETB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="panel-card p-6">
            <h3 className="text-sm font-heading font-semibold mb-4">{activeTab === 'most' ? 'Top Selling' : 'Least Selling'} Products</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={displayData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 88%)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="revenue" fill="hsl(153 50% 28%)" radius={[6, 6, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default SalesPage;
