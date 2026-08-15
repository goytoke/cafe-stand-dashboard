import React, { useState } from 'react';
import { useData, Expense, FundKey } from '@/contexts/DataContext';
import { Edit, Trash2, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const funds: FundKey[] = ['ingredient', 'saving', 'rent', 'other'];

const ExpensesPage: React.FC = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, selectedDate, currentUserName, isAdmin } = useData();
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'admin' | 'staff' | 'new'>('all');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Expense | null>(null);
  const [form, setForm] = useState({ reason: '', quantity: '', price: '', fund: 'ingredient' as FundKey });

  const tabs = [
    { key: 'all' as const, label: 'All Cost' },
    { key: 'today' as const, label: "Today's Cost" },
    { key: 'admin' as const, label: 'Cost by Admin' },
    { key: 'staff' as const, label: 'Cost by Staff' },
    { key: 'new' as const, label: 'New Cost' },
  ];

  const displayExpenses =
    activeTab === 'today' ? expenses.filter(e => e.date === selectedDate)
    : activeTab === 'admin' ? expenses.filter(e => e.role === 'admin')
    : activeTab === 'staff' ? expenses.filter(e => e.role === 'staff')
    : expenses;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      reason: form.reason,
      quantity: Number(form.quantity),
      price: Number(form.price),
      date: selectedDate,
      fund: form.fund,
    };
    if (editingExpense) { updateExpense(editingExpense.id, data); toast.success('Cost updated'); }
    else { addExpense(data); toast.success('Expense saved successfully'); }
    setForm({ reason: '', quantity: '', price: '', fund: 'ingredient' });
    setEditingExpense(null);
    setActiveTab('today');
  };

  const openEdit = (exp: Expense) => {
    setForm({ reason: exp.reason, quantity: String(exp.quantity), price: String(exp.price), fund: exp.fund });
    setEditingExpense(exp);
    setActiveTab('new');
  };

  const exportData = () => {
    const csv = ['Date,Reason,Quantity,Price,Fund,Taken By,Role',
      ...displayExpenses.map(e => `${e.date},${e.reason},${e.quantity},${e.price},${e.fund},${e.takenBy},${e.role}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'costs.csv'; a.click();
  };

  const totalShown = displayExpenses.reduce((s, e) => s + e.price, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold">Cost / Expenses</h2>
        <button onClick={exportData} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Download size={16} /> Export
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`panel-link ${activeTab === t.key ? 'panel-link-active' : 'panel-link-inactive'}`}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'new' ? (
        <form onSubmit={handleSubmit} className="form-card space-y-4 animate-fade-in">
          <h3 className="text-sm font-heading font-semibold">{editingExpense ? 'Edit Cost' : 'Add New Cost'}</h3>
          <p className="text-xs text-muted-foreground">Recorded as taken by <strong>{currentUserName}</strong> ({isAdmin ? 'Admin' : 'Staff'})</p>
          <div><label className="text-sm font-medium">Reason</label><input required value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Quantity</label><input type="number" required value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-sm font-medium">Price (ETB)</label><input type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
          </div>
          <div>
            <label className="text-sm font-medium">From Fund</label>
            <select value={form.fund} onChange={e => setForm({ ...form, fund: e.target.value as FundKey })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30">
              {funds.map(f => <option key={f} value={f}>{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
            </select>
          </div>
          <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90">{editingExpense ? 'Update' : 'Save'}</button>
        </form>
      ) : (
        <>
          <div className="table-container overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reason</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Quantity</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fund</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Taken By</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {displayExpenses.map(e => (
                  <tr key={e.id} className="border-b border-border hover:bg-secondary/30">
                    <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                    <td className="px-4 py-3 font-medium">{e.reason}</td>
                    <td className="px-4 py-3">{e.quantity}</td>
                    <td className="px-4 py-3">{e.price.toLocaleString()} ETB</td>
                    <td className="px-4 py-3 capitalize">{e.fund}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${e.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'}`}>
                        {e.takenBy} · {e.role === 'admin' ? 'Admin' : 'Staff'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(e)} aria-label="Edit cost" className="p-1.5 rounded hover:bg-secondary text-info"><Edit size={14} /></button>
                        <button onClick={() => setDeleteConfirm(e)} aria-label="Delete cost" className="p-1.5 rounded hover:bg-secondary text-destructive"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayExpenses.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No cost recorded</div>}
          </div>

          <div className="panel-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-heading font-semibold">Cost Overview</h3>
              <span className="text-sm font-bold text-primary">{totalShown.toLocaleString()} ETB</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={displayExpenses.map(e => ({ name: e.reason.substring(0, 12), amount: e.price }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 88%)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                <Bar dataKey="amount" fill="hsl(25 90% 55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-foreground/20 flex items-center justify-center z-50">
          <div className="panel-card p-6 w-96 animate-fade-in">
            <h3 className="text-sm font-heading font-semibold mb-2">Delete Cost</h3>
            <p className="text-sm text-muted-foreground mb-4">Delete <strong>{deleteConfirm.reason}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => { deleteExpense(deleteConfirm.id); toast.success('Deleted'); setDeleteConfirm(null); }} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium">Yes</button>
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-secondary rounded-lg text-sm font-medium">No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
