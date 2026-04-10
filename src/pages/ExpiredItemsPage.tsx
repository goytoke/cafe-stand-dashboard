import React from 'react';
import { useData } from '@/contexts/DataContext';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ExpiredItemsPage: React.FC = () => {
  const { materials } = useData();
  const today = new Date();

  const expiredItems = materials
    .map(m => {
      const exp = new Date(m.expiredDate);
      const daysLeft = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...m, daysLeft };
    })
    .filter(m => m.daysLeft <= 0);

  const totalLoss = expiredItems.reduce((sum, m) => sum + m.totalPrice, 0);

  const exportData = () => {
    const csv = ['Name,Quantity,Total Amount Lost,Price,Expired Date', ...expiredItems.map(m => `${m.name},${m.quantity},${m.totalPrice},${m.pricePerUnit},${m.expiredDate}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'expired-items.csv'; a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold">Expired Items</h2>
        <button onClick={exportData} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Download size={16} /> Export
        </button>
      </div>

      <div className="stat-card">
        <p className="text-xs text-muted-foreground">Total Loss from Expired Items</p>
        <p className="text-2xl font-heading font-bold text-destructive">{totalLoss.toLocaleString()} ETB</p>
      </div>

      <div className="table-container overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-secondary/50">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Quantity</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount Lost</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price/Unit</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Expired Date</th>
          </tr></thead>
          <tbody>
            {expiredItems.map(m => (
              <tr key={m.id} className="border-b border-border hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3">{m.quantity} {m.measurement}</td>
                <td className="px-4 py-3 text-destructive font-medium">{m.totalPrice.toLocaleString()} ETB</td>
                <td className="px-4 py-3">{m.pricePerUnit} ETB</td>
                <td className="px-4 py-3">{m.expiredDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {expiredItems.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No expired items</div>}
      </div>

      <div className="panel-card p-6">
        <h3 className="text-sm font-heading font-semibold mb-4">Loss Overview</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={expiredItems.map(m => ({ name: m.name.substring(0, 10), loss: m.totalPrice }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 88%)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
            <Bar dataKey="loss" fill="hsl(0 72% 51%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpiredItemsPage;
