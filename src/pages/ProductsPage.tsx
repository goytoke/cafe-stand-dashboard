import React, { useState } from 'react';
import { useData, Product } from '@/contexts/DataContext';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const ProductsPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, drinkSubCategories, foodSubCategories, snackSubCategories } = useData();
  const [activeCategory, setActiveCategory] = useState<'drink' | 'food' | 'snacks'>('drink');
  const [activeSubCategory, setActiveSubCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'drink' as Product['category'], subCategory: '', image: '' });

  const categories = ['drink', 'food', 'snacks'] as const;
  const getSubCategories = (cat: string) => cat === 'drink' ? drinkSubCategories : cat === 'food' ? foodSubCategories : snackSubCategories;
  const subCategories = getSubCategories(activeCategory);

  const filteredProducts = products.filter(p => {
    if (p.category !== activeCategory) return false;
    if (activeSubCategory && p.subCategory !== activeSubCategory) return false;
    return true;
  });

  const openAddForm = () => {
    setForm({ name: '', description: '', price: '', category: activeCategory, subCategory: subCategories[0] || '', image: '' });
    setEditingProduct(null);
    setShowForm(true);
  };

  const openEditForm = (p: Product) => {
    setForm({ name: p.name, description: p.description, price: String(p.price), category: p.category, subCategory: p.subCategory, image: p.image || '' });
    setEditingProduct(p);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name: form.name, description: form.description, price: Number(form.price), category: form.category, subCategory: form.subCategory, image: form.image, status: 'active' as const };
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
      toast.success(`${form.name} updated successfully`);
    } else {
      addProduct(data);
      toast.success(`${form.name} added successfully`);
    }
    setShowForm(false);
  };

  const handleDelete = (p: Product) => {
    deleteProduct(p.id);
    toast.success(`${p.name} deleted successfully`);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold">Products</h2>
        <button onClick={openAddForm} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="form-card space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-semibold">{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
            <button type="button" onClick={() => setShowForm(false)}><X size={18} className="text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium">Price (ETB)</label>
              <input type="number" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Category</label>
              <select value={form.category} onChange={e => { const cat = e.target.value as Product['category']; setForm({ ...form, category: cat, subCategory: getSubCategories(cat)[0] || '' }); }}
                className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30">
                {categories.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Sub Category</label>
              <select value={form.subCategory} onChange={e => setForm({ ...form, subCategory: e.target.value })}
                className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30">
                {getSubCategories(form.category).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Product Image</label>
            <input type="file" accept="image/*" className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none" />
          </div>
          <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
            {editingProduct ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      )}

      {/* Category tabs */}
      <div className="flex gap-2">
        {categories.map(c => (
          <button key={c} onClick={() => { setActiveCategory(c); setActiveSubCategory(''); }}
            className={`panel-link ${activeCategory === c ? 'panel-link-active' : 'panel-link-inactive'}`}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Sub-category tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveSubCategory('')}
          className={`panel-link text-xs ${!activeSubCategory ? 'panel-link-active' : 'panel-link-inactive'}`}>All</button>
        {subCategories.map(s => (
          <button key={s} onClick={() => setActiveSubCategory(s)}
            className={`panel-link text-xs ${activeSubCategory === s ? 'panel-link-active' : 'panel-link-inactive'}`}>{s}</button>
        ))}
      </div>

      {/* Table */}
      <div className="table-container overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Image</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => (
              <tr key={p.id} className="border-b border-border hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3"><div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">IMG</div></td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.description}</td>
                <td className="px-4 py-3">{p.price} ETB</td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-secondary rounded text-xs">{p.subCategory}</span></td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-success/10 text-success rounded text-xs font-medium">{p.status}</span></td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => openEditForm(p)} className="p-1.5 rounded hover:bg-secondary transition-colors text-info"><Edit size={14} /></button>
                    <button onClick={() => setDeleteConfirm(p)} className="p-1.5 rounded hover:bg-secondary transition-colors text-destructive"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No products found</div>}
      </div>

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-foreground/20 flex items-center justify-center z-50">
          <div className="panel-card p-6 w-96 animate-fade-in">
            <h3 className="text-sm font-heading font-semibold mb-2">Delete Product</h3>
            <p className="text-sm text-muted-foreground mb-4">Are you sure you want to delete <strong>{deleteConfirm.name}</strong>?</p>
            <div className="flex gap-3">
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90">Yes</button>
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 bg-secondary text-foreground rounded-lg text-sm font-medium hover:bg-muted">No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
