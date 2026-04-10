import React, { useState } from 'react';
import { useData, Expense } from '@/contexts/DataContext';
import { Plus, Edit, Trash2, X, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const ExpensesPage: React.FC = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, selectedDate } = useData();
  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'new'>('all');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Expense | null>(null);
  const [form, setForm] = useState({ reason: '', quantity: '', price: '' });

  const todayExpenses = expenses.filter(e => e.date === selectedDate);
  const tabs = [
    { key: 'all' as const, label: 'All Expenses' },
    { key: 'today' as const, label: "Today's Expense" },
    { key: 'new' as const, label: 'New Expense' },
  ];

  const displayExpenses = activeTab === 'today' ? todayExpenses : expenses;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { reason: form.reason, quantity: Number(form.quantity), price: Number(form.price), date: selectedDate };
    if (editingExpense) { updateExpense(editingExpense.id, data); toast.success('Expense updated'); }
    else { addExpense(data); toast.success('Expense saved successfully'); }
    setForm({ reason: '', quantity: '', price: '' });
    setEditingExpense(null);
    setActiveTab('today');
  };

  const openEdit = (exp: Expense) => {
    setForm({ reason: exp.reason, quantity: String(exp.quantity), price: String(exp.price) });
    setEditingExpense(exp);
    setActiveTab('new');
  };

  const exportData = () => {
    const csv = ['Date,Reason,Quantity,Price', ...displayExpenses.map(e => `${e.date},${e.reason},${e.quantity},${e.price}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'expenses.csv'; a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold">Expenses</h2>
        <button onClick={exportData} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Download size={16} /> Export
        </button>
      </div>

      <div className="flex gap-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className={`panel-link ${activeTab === t.key ? 'panel-link-active' : 'panel-link-inactive'}`}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'new' ? (
        <form onSubmit={handleSubmit} className="form-card space-y-4 animate-fade-in">
          <h3 className="text-sm font-heading font-semibold">{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
          <div><label className="text-sm font-medium">Reason</label><input required value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Quantity</label><input type="number" required value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-sm font-medium">Price (ETB)</label><input type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
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
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr></thead>
              <tbody>
                {displayExpenses.map(e => (
                  <tr key={e.id} className="border-b border-border hover:bg-secondary/30">
                    <td className="px-4 py-3 text-muted-foreground">{e.date}</td>
                    <td className="px-4 py-3 font-medium">{e.reason}</td>
                    <td className="px-4 py-3">{e.quantity}</td>
                    <td className="px-4 py-3">{e.price.toLocaleString()} ETB</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(e)} className="p-1.5 rounded hover:bg-secondary text-info"><Edit size={14} /></button>
                        <button onClick={() => setDeleteConfirm(e)} className="p-1.5 rounded hover:bg-secondary text-destructive"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {displayExpenses.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No expenses</div>}
          </div>

          <div className="panel-card p-6">
            <h3 className="text-sm font-heading font-semibold mb-4">Expense Overview</h3>
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
            <h3 className="text-sm font-heading font-semibold mb-2">Delete Expense</h3>
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
