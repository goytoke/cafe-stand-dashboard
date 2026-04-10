import React, { useState } from 'react';
import { useData, Product } from '@/contexts/DataContext';
import { ShoppingCart, X, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const OrdersPage: React.FC = () => {
  const { products, addOrder, selectedDate, drinkSubCategories, foodSubCategories, snackSubCategories } = useData();
  const [activeCategory, setActiveCategory] = useState<'drink' | 'food' | 'snacks'>('drink');
  const [activeSubCategory, setActiveSubCategory] = useState('');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'ebirr' | 'cbe' | 'telebirr'>('cash');
  const categories = ['drink', 'food', 'snacks'] as const;
  const subCategories = activeCategory === 'drink' ? drinkSubCategories : activeCategory === 'food' ? foodSubCategories : snackSubCategories;

  const filteredProducts = products.filter(p => {
    if (p.category !== activeCategory || p.status !== 'active') return false;
    if (activeSubCategory && p.subCategory !== activeSubCategory) return false;
    return true;
  });

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === p.id);
      if (existing) return prev.map(i => i.product.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product: p, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.product.id !== id));
  const total = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const placeOrder = () => {
    if (cart.length === 0) { toast.error('Add items to order'); return; }
    addOrder({ items: cart, total, paymentMethod, date: selectedDate });
    toast.success('Order placed successfully!');
    setCart([]);
  };

  return (
    <div className="flex gap-6 animate-fade-in">
      {/* Menu */}
      <div className="flex-1 space-y-4">
        <h2 className="text-xl font-heading font-bold">Choose Order</h2>
        <div className="flex gap-2">
          {categories.map(c => (
            <button key={c} onClick={() => { setActiveCategory(c); setActiveSubCategory(''); }}
              className={`panel-link ${activeCategory === c ? 'panel-link-active' : 'panel-link-inactive'}`}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveSubCategory('')}
            className={`panel-link text-xs ${!activeSubCategory ? 'panel-link-active' : 'panel-link-inactive'}`}>All</button>
          {subCategories.map(s => (
            <button key={s} onClick={() => setActiveSubCategory(s)}
              className={`panel-link text-xs ${activeSubCategory === s ? 'panel-link-active' : 'panel-link-inactive'}`}>{s}</button>
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map(p => (
            <div key={p.id} onClick={() => addToCart(p)}
              className="panel-card p-4 cursor-pointer hover:shadow-panel transition-all hover:-translate-y-0.5">
              <div className="w-full h-24 bg-muted rounded-lg mb-3 flex items-center justify-center text-muted-foreground text-xs">IMG</div>
              <h4 className="font-medium text-sm">{p.name}</h4>
              <p className="text-xs text-muted-foreground">{p.description}</p>
              <p className="text-sm font-bold mt-1 text-primary">{p.price} ETB</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="w-80 shrink-0">
        <div className="panel-card p-5 sticky top-24 space-y-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={18} className="text-primary" />
            <h3 className="text-sm font-heading font-semibold">Order Summary</h3>
          </div>
          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No items added</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {cart.map(i => (
                <div key={i.product.id} className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{i.product.name}</p>
                    <p className="text-xs text-muted-foreground">{i.quantity} × {i.product.price} ETB</p>
                  </div>
                  <button onClick={() => removeFromCart(i.product.id)}><X size={14} className="text-muted-foreground hover:text-destructive" /></button>
                </div>
              ))}
            </div>
          )}
          <div className="border-t border-border pt-3">
            <div className="flex justify-between text-sm font-bold">
              <span>Total</span><span>{total.toLocaleString()} ETB</span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Payment Method</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {(['cash', 'ebirr', 'cbe', 'telebirr'] as const).map(m => (
                <button key={m} onClick={() => setPaymentMethod(m)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${paymentMethod === m ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-muted'}`}>
                  {m === 'ebirr' ? 'E-Birr' : m === 'cbe' ? 'CBE' : m === 'telebirr' ? 'Telebirr' : 'Cash'}
                </button>
              ))}
            </div>
          </div>
          <button onClick={placeOrder} className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <CreditCard size={16} /> Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
