import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Download, Send, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { downloadWordReport, sendReportToTelegram, ReportSnapshot } from '@/lib/reportDoc';

const COLORS = ['hsl(153 50% 28%)', 'hsl(25 90% 55%)', 'hsl(210 80% 55%)', 'hsl(38 92% 50%)', 'hsl(0 72% 51%)'];

const ReportPage: React.FC = () => {
  const { orders, expenses, materials, products, selectedDate, fundBalance, txns, notes, todos, telegramConfig, updateTelegramConfig } = useData();
  const [reportType, setReportType] = useState<'overview' | 'products' | 'expenses' | 'discount' | 'finance' | 'inventory'>('overview');
  const [showTgConfig, setShowTgConfig] = useState(false);
  const [sending, setSending] = useState(false);

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

  const snapshot: ReportSnapshot = { date: selectedDate, orders, expenses, materials, txns, notes, todos, fundBalance };

  const exportReport = () => {
    downloadWordReport(snapshot);
    toast.success('Word report downloaded');
  };

  const sendTelegram = async () => {
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
      setShowTgConfig(true);
      return toast.error('Add your Telegram bot token and chat ID first');
    }
    setSending(true);
    try {
      await sendReportToTelegram(telegramConfig, snapshot);
      toast.success('Report sent to your Telegram bot');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send report');
    } finally {
      setSending(false);
    }
  };


  const tabs = [
    { key: 'overview' as const, label: 'Overview' },
    { key: 'products' as const, label: 'Products' },
    { key: 'expenses' as const, label: 'Cost' },
    { key: 'discount' as const, label: 'Discount' },
    { key: 'finance' as const, label: 'Finance' },
    { key: 'inventory' as const, label: 'Inventory' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-heading font-bold">Report</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTgConfig(v => !v)} title="Telegram bot config" className="flex items-center gap-2 px-3 py-2.5 bg-secondary rounded-lg text-sm font-medium hover:bg-secondary/70">
            <Settings size={16} /> Telegram Config
          </button>
          <button onClick={sendTelegram} disabled={sending} title="Send report to Telegram bot" className="flex items-center gap-2 px-4 py-2.5 bg-info text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-60">
            <Send size={16} /> {sending ? 'Sending...' : 'Send to Telegram'}
          </button>
          <button onClick={exportReport} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
            <Download size={16} /> Export Word
          </button>
        </div>
      </div>

      {showTgConfig && (
        <div className="panel-card p-6 space-y-4">
          <h3 className="text-sm font-heading font-semibold">Telegram Bot Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground">Bot API Token</label>
              <input
                value={telegramConfig.botToken}
                onChange={e => updateTelegramConfig({ botToken: e.target.value })}
                placeholder="123456:ABC-DEF..."
                className="w-full mt-1 px-3 py-2.5 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Chat ID</label>
              <input
                value={telegramConfig.chatId}
                onChange={e => updateTelegramConfig({ chatId: e.target.value })}
                placeholder="e.g. 123456789"
                className="w-full mt-1 px-3 py-2.5 bg-secondary rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Create a bot with @BotFather to get the token, then send it a message and use your chat ID. The report is sent as a Word (.doc) document with a summary caption.
          </p>
        </div>
      )}


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
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="stat-card"><p className="text-xs text-muted-foreground">Total Cost</p><p className="text-xl font-heading font-bold">{totalExpenses.toLocaleString()} ETB</p></div>
            <div className="stat-card"><p className="text-xs text-muted-foreground">Cost by Admin</p><p className="text-xl font-heading font-bold text-primary">{costByAdmin.toLocaleString()} ETB</p></div>
            <div className="stat-card"><p className="text-xs text-muted-foreground">Cost by Staff</p><p className="text-xl font-heading font-bold text-accent">{costByStaff.toLocaleString()} ETB</p></div>
          </div>
          <div className="table-container overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reason</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fund</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Taken By</th>
              </tr></thead>
              <tbody>{expenses.map(e => (
                <tr key={e.id} className="border-b border-border hover:bg-secondary/30">
                  <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                  <td className="px-4 py-3 font-medium">{e.reason}</td>
                  <td className="px-4 py-3">{e.price.toLocaleString()} ETB</td>
                  <td className="px-4 py-3 capitalize">{e.fund}</td>
                  <td className="px-4 py-3">{e.takenBy} · {e.role === 'admin' ? 'Admin' : 'Staff'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      )}

      {reportType === 'discount' && (
        <div className="space-y-6">
          <div className="stat-card"><p className="text-xs text-muted-foreground">Total Discount</p><p className="text-xl font-heading font-bold text-accent">{totalDiscount.toLocaleString()} ETB</p></div>
          <div className="table-container overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Discount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reason</th>
              </tr></thead>
              <tbody>{discountedOrders.map(o => (
                <tr key={o.id} className="border-b border-border hover:bg-secondary/30">
                  <td className="px-4 py-3 text-muted-foreground">{o.date}</td>
                  <td className="px-4 py-3 font-medium">#{o.id.substring(0, 8)}</td>
                  <td className="px-4 py-3 text-destructive">-{o.discount.toLocaleString()} ETB</td>
                  <td className="px-4 py-3">{o.discountReason}</td>
                </tr>
              ))}</tbody>
            </table>
            {discountedOrders.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No discounts</div>}
          </div>
        </div>
      )}

      {reportType === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['rent', 'saving', 'ingredient', 'other'] as const).map(f => (
              <div key={f} className="stat-card">
                <p className="text-xs text-muted-foreground capitalize">{f} Fund</p>
                <p className="text-xl font-heading font-bold">{fundBalance(f).toLocaleString()} ETB</p>
              </div>
            ))}
          </div>
          <div className="panel-card p-6">
            <h3 className="text-sm font-heading font-semibold mb-4">Fund Balances</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={(['rent', 'saving', 'ingredient', 'other'] as const).map(f => ({ name: f, balance: fundBalance(f) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 88%)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                <Bar dataKey="balance" fill="hsl(210 80% 55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
