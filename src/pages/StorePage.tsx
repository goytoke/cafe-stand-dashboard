import React, { useState } from 'react';
import { useData, StoreMaterial } from '@/contexts/DataContext';
import { Plus, Edit, Trash2, Minus, X, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const StorePage: React.FC = () => {
  const { materials, addMaterial, updateMaterial, deleteMaterial, useMaterial } = useData();
  const [activeCategory, setActiveCategory] = useState<'drink' | 'food' | 'snacks'>('drink');
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StoreMaterial | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<StoreMaterial | null>(null);
  const [useAmount, setUseAmount] = useState<Record<string, number>>({});
  const [form, setForm] = useState({ name: '', quantity: '', measurement: '', pricePerUnit: '', expiredDate: '', category: 'drink' as StoreMaterial['category'] });

  const categories = ['drink', 'food', 'snacks'] as const;
  const filtered = materials.filter(m => m.category === activeCategory);
  const counts = { drink: materials.filter(m => m.category === 'drink').length, food: materials.filter(m => m.category === 'food').length, snacks: materials.filter(m => m.category === 'snacks').length };
  const getMeasurement = (cat: string) => cat === 'drink' ? 'liter' : cat === 'food' ? 'kg' : 'pieces';

  const openAddForm = () => {
    setForm({ name: '', quantity: '', measurement: getMeasurement(activeCategory), pricePerUnit: '', expiredDate: '', category: activeCategory });
    setEditingMaterial(null);
    setShowForm(true);
  };

  const openEditForm = (m: StoreMaterial) => {
    setForm({ name: m.name, quantity: String(m.quantity), measurement: m.measurement, pricePerUnit: String(m.pricePerUnit), expiredDate: m.expiredDate, category: m.category });
    setEditingMaterial(m);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Number(form.quantity);
    const price = Number(form.pricePerUnit);
    const data = { name: form.name, quantity: qty, measurement: form.measurement, pricePerUnit: price, totalPrice: qty * price, expiredDate: form.expiredDate, category: form.category };
    if (editingMaterial) { updateMaterial(editingMaterial.id, data); toast.success('Material updated'); }
    else { addMaterial(data); toast.success('Material added'); }
    setShowForm(false);
  };

  const handleUse = (id: string) => {
    const amount = useAmount[id] || 0;
    if (amount <= 0) return;
    useMaterial(id, amount);
    toast.success(`Used ${amount} units`);
    setUseAmount(prev => ({ ...prev, [id]: 0 }));
  };

  const graphData = filtered.map(m => ({ name: m.name.substring(0, 12), quantity: m.quantity, value: m.totalPrice }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold">Store Management</h2>
        <button onClick={openAddForm} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> Add Material
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="form-card space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-semibold">{editingMaterial ? 'Edit Material' : 'Add Material'}</h3>
            <button type="button" onClick={() => setShowForm(false)}><X size={18} className="text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Name</label><input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-sm font-medium">Category</label>
              <select value={form.category} onChange={e => { const cat = e.target.value as StoreMaterial['category']; setForm({ ...form, category: cat, measurement: getMeasurement(cat) }); }}
                className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30">
                {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="text-sm font-medium">Quantity</label><input type="number" required value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-sm font-medium">Measurement</label>
              <select required value={form.measurement} onChange={e => setForm({ ...form, measurement: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30">
                <option value="liter">Liter</option>
                <option value="kg">Kg</option>
                <option value="gram">Gram</option>
                <option value="pieces">Pieces</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div><label className="text-sm font-medium">Price per Unit</label><input type="number" required value={form.pricePerUnit} onChange={e => setForm({ ...form, pricePerUnit: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
          </div>
          <div><label className="text-sm font-medium">Expired Date</label><input type="date" required value={form.expiredDate} onChange={e => setForm({ ...form, expiredDate: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
          <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">{editingMaterial ? 'Update' : 'Add'}</button>
        </form>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6">
        {categories.map(c => (
          <button key={c} onClick={() => setActiveCategory(c)}
            className={`stat-card text-center cursor-pointer transition-all px-6 py-8 rounded-xl shadow-md ${activeCategory === c ? 'ring-2 ring-primary bg-primary/5 shadow-lg' : 'hover:shadow-lg'}`}>
            <p className="text-sm text-muted-foreground font-medium">{c.charAt(0).toUpperCase() + c.slice(1)}s</p>
            <p className="text-3xl font-heading font-bold mt-2">{counts[c]}</p>
            <p className="text-xs text-muted-foreground mt-1">materials</p>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="table-container overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-secondary/50">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Quantity</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Unit</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price/Unit</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Expires</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Use</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="border-b border-border hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3">{m.quantity}</td>
                <td className="px-4 py-3">{m.measurement}</td>
                <td className="px-4 py-3">{m.pricePerUnit} ETB</td>
                <td className="px-4 py-3">{m.totalPrice.toLocaleString()} ETB</td>
                <td className="px-4 py-3">{m.expiredDate}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setUseAmount(p => ({ ...p, [m.id]: Math.max(0, (p[m.id] || 0) - 1) }))} className="p-1 rounded bg-secondary hover:bg-muted"><Minus size={12} /></button>
                    <span className="w-8 text-center text-xs">{useAmount[m.id] || 0}</span>
                    <button onClick={() => setUseAmount(p => ({ ...p, [m.id]: (p[m.id] || 0) + 1 }))} className="p-1 rounded bg-secondary hover:bg-muted"><Plus size={12} /></button>
                    <button onClick={() => handleUse(m.id)} className="p-1 rounded bg-primary/10 text-primary hover:bg-primary/20 ml-1"><Check size={12} /></button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEditForm(m)} className="p-1.5 rounded hover:bg-secondary text-info"><Edit size={14} /></button>
                    <button onClick={() => setDeleteConfirm(m)} className="p-1.5 rounded hover:bg-secondary text-destructive"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Graph */}
      <div className="panel-card p-6">
        <h3 className="text-sm font-heading font-semibold mb-4">{activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Materials Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={graphData}><CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 88%)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="quantity" fill="hsl(153 50% 28%)" radius={[6, 6, 0, 0]} /></BarChart>
        </ResponsiveContainer>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-foreground/20 flex items-center justify-center z-50">
          <div className="panel-card p-6 w-96 animate-fade-in">
            <h3 className="text-sm font-heading font-semibold mb-2">Delete Material</h3>
            <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => { deleteMaterial(deleteConfirm.id); toast.success(`${deleteConfirm.name} deleted`); setDeleteConfirm(null); }} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium">Yes</button>
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-secondary rounded-lg text-sm font-medium">No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorePage;
