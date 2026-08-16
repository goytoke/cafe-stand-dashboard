import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download } from 'lucide-react';

const COLORS = ['hsl(153 50% 28%)', 'hsl(25 90% 55%)', 'hsl(210 80% 55%)', 'hsl(38 92% 50%)'];

type Cat = 'drink' | 'food' | 'snacks';

const downloadCsv = (name: string, rows: (string | number)[][]) => {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
};

const SalesPage: React.FC = () => {
  const { orders, expenses, selectedDate, drinkSubCategories, foodSubCategories, snackSubCategories } = useData();
  const [activeTab, setActiveTab] = useState<'today' | 'net' | 'categories' | 'most' | 'least' | 'discount'>('today');
  const [activeCat, setActiveCat] = useState<Cat>('drink');
  const [activeSub, setActiveSub] = useState<string | null>(null);

  const discountedOrders = orders.filter(o => (o.discount || 0) > 0);
  const totalDiscount = discountedOrders.reduce((s, o) => s + o.discount, 0);

  const todayOrders = orders.filter(o => o.date === selectedDate);
  const todaySales = todayOrders.reduce((s, o) => s + o.total, 0);
  const todayExpenses = expenses.filter(e => e.date === selectedDate);
  const todayCost = todayExpenses.reduce((s, e) => s + e.price, 0);
  const grossProfit = todayOrders.reduce((s, o) => s + o.items.reduce((is, i) => is + i.product.profit * i.quantity, 0), 0);
  const todayDiscount = todayOrders.reduce((s, o) => s + (o.discount || 0), 0);
  const todayNet = grossProfit - todayDiscount - todayCost;

  const paymentBreakdown = [
    { name: 'Cash', value: todayOrders.filter(o => o.paymentMethod === 'cash').reduce((s, o) => s + o.total, 0) },
    { name: 'E-Birr', value: todayOrders.filter(o => o.paymentMethod === 'ebirr').reduce((s, o) => s + o.total, 0) },
    { name: 'Telebirr', value: todayOrders.filter(o => o.paymentMethod === 'telebirr').reduce((s, o) => s + o.total, 0) },
    { name: 'CBE', value: todayOrders.filter(o => o.paymentMethod === 'cbe').reduce((s, o) => s + o.total, 0) },
  ];

  // Product sales counts (all time)
  const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
  orders.forEach(o => o.items.forEach(i => {
    if (!productSales[i.product.id]) productSales[i.product.id] = { name: i.product.name, count: 0, revenue: 0 };
    productSales[i.product.id].count += i.quantity;
    productSales[i.product.id].revenue += i.product.price * i.quantity;
  }));
  const sorted = Object.values(productSales).sort((a, b) => b.revenue - a.revenue);
  const mostSold = sorted.slice(0, 5);
  const leastSold = sorted.slice(-5).reverse();

  // ---- Category analytics ----
  const allItems = orders.flatMap(o => o.items.map(i => ({ ...i, date: o.date })));
  const catTotals = (['drink', 'food', 'snacks'] as Cat[]).map(c => {
    const items = allItems.filter(i => i.product.category === c);
    return {
      key: c,
      name: c.charAt(0).toUpperCase() + c.slice(1),
      sold: items.reduce((s, i) => s + i.quantity, 0),
      amount: items.reduce((s, i) => s + i.product.price * i.quantity, 0),
    };
  });
  const subsFor = (c: Cat) => c === 'drink' ? drinkSubCategories : c === 'food' ? foodSubCategories : snackSubCategories;
  const subTotals = subsFor(activeCat).map(sub => {
    const items = allItems.filter(i => i.product.category === activeCat && i.product.subCategory === sub);
    return {
      name: sub,
      sold: items.reduce((s, i) => s + i.quantity, 0),
      amount: items.reduce((s, i) => s + i.product.price * i.quantity, 0),
    };
  });
  const detailRows = activeSub
    ? Object.values(allItems
        .filter(i => i.product.category === activeCat && i.product.subCategory === activeSub)
        .reduce<Record<string, { name: string; price: number; sold: number; amount: number; profit: number }>>((acc, i) => {
          const k = i.product.id;
          if (!acc[k]) acc[k] = { name: i.product.name, price: i.product.price, sold: 0, amount: 0, profit: 0 };
          acc[k].sold += i.quantity;
          acc[k].amount += i.product.price * i.quantity;
          acc[k].profit += i.product.profit * i.quantity;
          return acc;
        }, {}))
    : [];
  const detailTotals = detailRows.reduce((a, r) => ({ sold: a.sold + r.sold, amount: a.amount + r.amount, profit: a.profit + r.profit }), { sold: 0, amount: 0, profit: 0 });

  const exportData = () => {
    if (activeTab === 'categories') {
      if (activeSub) {
        downloadCsv(`sales-${activeSub}.csv`, [
          ['Product', 'Price', 'Units Sold', 'Total Amount', 'Profit'],
          ...detailRows.map(r => [r.name, r.price, r.sold, r.amount, r.profit]),
          ['TOTAL', '', detailTotals.sold, detailTotals.amount, detailTotals.profit],
        ]);
      } else {
        downloadCsv(`sales-${activeCat}-subcategories.csv`, [
          ['Sub Category', 'Units Sold', 'Total Amount'],
          ...subTotals.map(s => [s.name, s.sold, s.amount]),
        ]);
      }
      return;
    }
    downloadCsv('sales.csv', [['Payment Method', 'Amount'], ...paymentBreakdown.map(p => [p.name, p.value])]);
  };

  const tabs = [
    { key: 'today' as const, label: "Today's Sales" },
    { key: 'net' as const, label: "Today's Net" },
    { key: 'categories' as const, label: 'Categories' },
    { key: 'most' as const, label: 'Most Sales' },
    { key: 'least' as const, label: 'Least Sales' },
    { key: 'discount' as const, label: 'Discount' },
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

      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`panel-link ${activeTab === t.key ? 'panel-link-active' : 'panel-link-inactive'}`}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'net' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="stat-card"><p className="text-xs text-muted-foreground">Today's Sales</p><p className="text-2xl font-heading font-bold mt-1">{todaySales.toLocaleString()} ETB</p></div>
            <div className="stat-card"><p className="text-xs text-muted-foreground">Gross Profit</p><p className="text-2xl font-heading font-bold mt-1 text-primary">{grossProfit.toLocaleString()} ETB</p></div>
            <div className="stat-card"><p className="text-xs text-muted-foreground">Discount + Cost</p><p className="text-2xl font-heading font-bold mt-1 text-accent">{(todayDiscount + todayCost).toLocaleString()} ETB</p></div>
            <div className="stat-card"><p className="text-xs text-muted-foreground">Today's Net Profit</p><p className={`text-2xl font-heading font-bold mt-1 ${todayNet >= 0 ? 'text-success' : 'text-destructive'}`}>{todayNet.toLocaleString()} ETB</p></div>
          </div>
          <div className="panel-card p-6">
            <h3 className="text-sm font-heading font-semibold mb-4">Net Profit Breakdown — {selectedDate}</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={[
                { name: 'Sales', amount: todaySales },
                { name: 'Gross Profit', amount: grossProfit },
                { name: 'Discount', amount: todayDiscount },
                { name: 'Cost', amount: todayCost },
                { name: 'Net', amount: todayNet },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 88%)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                <Bar dataKey="amount" fill="hsl(153 50% 28%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-3">Net = gross profit of sold products − discount given − today's cost.</p>
          </div>
        </>
      )}

      {activeTab === 'categories' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {catTotals.map(c => (
              <button
                key={c.key}
                onClick={() => { setActiveCat(c.key); setActiveSub(null); }}
                className={`stat-card text-left transition-all ${activeCat === c.key ? 'ring-2 ring-primary shadow-panel' : 'hover:shadow-panel'}`}
              >
                <p className="text-sm font-heading font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground mt-2">Total sold products</p>
                <p className="text-xl font-heading font-bold">{c.sold}</p>
                <p className="text-xs text-muted-foreground mt-1">Total amount</p>
                <p className="text-xl font-heading font-bold text-primary">{c.amount.toLocaleString()} ETB</p>
              </button>
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            {subTotals.map(s => (
              <button
                key={s.name}
                onClick={() => setActiveSub(activeSub === s.name ? null : s.name)}
                className={`panel-link flex-col items-start ${activeSub === s.name ? 'panel-link-active' : 'panel-link-inactive'}`}
              >
                <span>{s.name}</span>
                <span className="text-xs opacity-80">{s.sold} sold · {s.amount.toLocaleString()} ETB</span>
              </button>
            ))}
          </div>

          {activeSub && (
            <div className="table-container overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Units Sold</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Profit</th>
                </tr></thead>
                <tbody>
                  {detailRows.map(r => (
                    <tr key={r.name} className="border-b border-border hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{r.name}</td>
                      <td className="px-4 py-3">{r.price.toLocaleString()} ETB</td>
                      <td className="px-4 py-3">{r.sold}</td>
                      <td className="px-4 py-3 font-bold">{r.amount.toLocaleString()} ETB</td>
                      <td className="px-4 py-3 text-success">{r.profit.toLocaleString()} ETB</td>
                    </tr>
                  ))}
                  <tr className="bg-secondary/50 font-bold">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3" />
                    <td className="px-4 py-3">{detailTotals.sold}</td>
                    <td className="px-4 py-3">{detailTotals.amount.toLocaleString()} ETB</td>
                    <td className="px-4 py-3">{detailTotals.profit.toLocaleString()} ETB</td>
                  </tr>
                </tbody>
              </table>
              {detailRows.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No sales in {activeSub}</div>}
            </div>
          )}

          <div className="panel-card p-6">
            <h3 className="text-sm font-heading font-semibold mb-4">{activeSub ? `${activeSub} Products` : `${activeCat} Sub Categories`}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={activeSub ? detailRows.map(r => ({ name: r.name, amount: r.amount })) : subTotals.map(s => ({ name: s.name, amount: s.amount }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 88%)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                <Bar dataKey="amount" fill="hsl(210 80% 55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {activeTab === 'discount' && (
        <>
          <div className="stat-card">
            <p className="text-xs text-muted-foreground">Total discount given</p>
            <p className="text-2xl font-heading font-bold mt-1">{totalDiscount.toLocaleString()} ETB</p>
          </div>
          <div className="table-container overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Ordered Items</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Subtotal</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Discount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reason</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total</th>
              </tr></thead>
              <tbody>
                {discountedOrders.map(o => (
                  <tr key={o.id} className="border-b border-border hover:bg-secondary/30">
                    <td className="px-4 py-3 text-muted-foreground">{o.date}</td>
                    <td className="px-4 py-3 font-medium">#{o.id.substring(0, 8)}</td>
                    <td className="px-4 py-3">{o.items.map(i => `${i.product.name} x${i.quantity}`).join(', ')}</td>
                    <td className="px-4 py-3">{o.subtotal.toLocaleString()} ETB</td>
                    <td className="px-4 py-3 text-destructive">-{o.discount.toLocaleString()} ETB</td>
                    <td className="px-4 py-3">{o.discountReason}</td>
                    <td className="px-4 py-3 font-bold">{o.total.toLocaleString()} ETB</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {discountedOrders.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No discounted orders</div>}
          </div>
          <div className="panel-card p-6">
            <h3 className="text-sm font-heading font-semibold mb-4">Discounts</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={discountedOrders.map(o => ({ name: o.discountReason.substring(0, 12) || o.date, amount: o.discount }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 88%)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                <Bar dataKey="amount" fill="hsl(25 90% 55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {activeTab === 'today' && (
        <>
          {todaySales === 0 ? (
            <div className="panel-card p-6 text-center text-muted-foreground">No sales for {selectedDate}</div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {paymentBreakdown.map(p => (
                  <div key={p.name} className="stat-card text-center">
                    <p className="text-xs text-muted-foreground">{p.name}</p>
                    <p className="text-xl font-heading font-bold mt-1">{p.value.toLocaleString()} ETB</p>
                  </div>
                ))}
                <div className="stat-card text-center">
                  <p className="text-xs text-muted-foreground">Today's Net</p>
                  <p className={`text-xl font-heading font-bold mt-1 ${todayNet >= 0 ? 'text-success' : 'text-destructive'}`}>{todayNet.toLocaleString()} ETB</p>
                </div>
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
      )}

      {(activeTab === 'most' || activeTab === 'least') && (
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
