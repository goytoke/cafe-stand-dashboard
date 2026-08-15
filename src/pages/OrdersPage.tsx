import React, { useState } from 'react';
import { useData, Product } from '@/contexts/DataContext';
import { ShoppingCart, Trash2, CreditCard, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner';

const OrdersPage: React.FC = () => {
  const { products, addOrder, selectedDate, drinkSubCategories, foodSubCategories, snackSubCategories } = useData();
  const [activeCategory, setActiveCategory] = useState<'drink' | 'food' | 'snacks'>('drink');
  const [activeSubCategory, setActiveSubCategory] = useState('');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'ebirr' | 'cbe' | 'telebirr'>('cash');
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountReason, setDiscountReason] = useState('');
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

  const changeQty = (id: string, delta: number) =>
    setCart(prev => prev
      .map(i => i.product.id === id ? { ...i, quantity: i.quantity + delta } : i)
      .filter(i => i.quantity > 0));

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.product.id !== id));

  const subtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const discount = hasDiscount ? Math.min(Number(discountAmount) || 0, subtotal) : 0;
  const total = subtotal - discount;

  const placeOrder = () => {
    if (cart.length === 0) { toast.error('Add items to order'); return; }
    if (hasDiscount && (!discount || !discountReason.trim())) { toast.error('Enter discount amount and reason'); return; }
    addOrder({ items: cart, subtotal, discount, discountReason: discount ? discountReason : '', total, paymentMethod, date: selectedDate });
    toast.success('Order placed successfully!');
    setCart([]);
    setHasDiscount(false);
    setDiscountAmount('');
    setDiscountReason('');
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
                <div key={i.product.id} className="flex items-center justify-between gap-2 p-2 bg-secondary rounded-lg">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{i.product.name}</p>
                    <p className="text-xs text-muted-foreground">{i.quantity} × {i.product.price} ETB</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => changeQty(i.product.id, -1)} aria-label="Decrease quantity"
                      className="p-1 rounded bg-card border border-border hover:bg-muted"><Minus size={12} /></button>
                    <span className="w-5 text-center text-xs font-semibold">{i.quantity}</span>
                    <button onClick={() => changeQty(i.product.id, 1)} aria-label="Increase quantity"
                      className="p-1 rounded bg-card border border-border hover:bg-muted"><Plus size={12} /></button>
                    <button onClick={() => removeFromCart(i.product.id)} aria-label="Remove item"
                      className="p-1 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Discount */}
          <div className="border-t border-border pt-3 space-y-2">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input type="checkbox" checked={hasDiscount} onChange={e => setHasDiscount(e.target.checked)} className="accent-primary w-4 h-4" />
              Apply discount
            </label>
            {hasDiscount && (
              <div className="space-y-2 animate-fade-in">
                <input type="number" placeholder="Discount amount (ETB)" value={discountAmount} onChange={e => setDiscountAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary rounded-lg text-xs border border-border outline-none focus:ring-2 focus:ring-primary/30" />
                <input placeholder="Discount reason" value={discountReason} onChange={e => setDiscountReason(e.target.value)}
                  className="w-full px-3 py-2 bg-secondary rounded-lg text-xs border border-border outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            )}
          </div>

          <div className="border-t border-border pt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground"><span>Subtotal</span><span>{subtotal.toLocaleString()} ETB</span></div>
            {discount > 0 && <div className="flex justify-between text-xs text-accent"><span>Discount</span><span>-{discount.toLocaleString()} ETB</span></div>}
            <div className="flex justify-between text-sm font-bold"><span>Total</span><span>{total.toLocaleString()} ETB</span></div>
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
