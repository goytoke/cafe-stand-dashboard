import React from 'react';
import { useData } from '@/contexts/DataContext';
import { AlertTriangle, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DueToExpiryPage: React.FC = () => {
  const { materials } = useData();
  const today = new Date();

  const dueItems = materials
    .map(m => {
      const exp = new Date(m.expiredDate);
      const daysLeft = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return { ...m, daysLeft };
    })
    .filter(m => m.daysLeft > 0 && m.daysLeft <= 14)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const atRisk = dueItems.filter(m => m.daysLeft <= 3);

  const exportData = () => {
    const csv = ['Name,Quantity,Total Amount,Price,Expired Date,Days Left', ...dueItems.map(m => `${m.name},${m.quantity},${m.totalPrice},${m.pricePerUnit},${m.expiredDate},${m.daysLeft}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'due-to-expiry.csv'; a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold">Due to Expiry</h2>
        <button onClick={exportData} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Download size={16} /> Export
        </button>
      </div>

      {atRisk.length > 0 && (
        <div className="panel-card p-4 border-warning/30 bg-warning/5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-warning" />
            <h3 className="text-sm font-heading font-semibold text-warning">At Risk ({atRisk.length} items)</h3>
          </div>
          <div className="table-container overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Qty</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Expires</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Days Left</th>
              </tr></thead>
              <tbody>
                {atRisk.map(m => (
                  <tr key={m.id} className="border-b border-border">
                    <td className="px-4 py-2 font-medium">{m.name}</td>
                    <td className="px-4 py-2">{m.quantity} {m.measurement}</td>
                    <td className="px-4 py-2">{m.expiredDate}</td>
                    <td className="px-4 py-2"><span className="px-2 py-0.5 bg-destructive/10 text-destructive rounded text-xs font-bold">{m.daysLeft} days</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="table-container overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-secondary/50">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Quantity</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total Amount</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Expired Date</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Days Left</th>
          </tr></thead>
          <tbody>
            {dueItems.map(m => (
              <tr key={m.id} className="border-b border-border hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">{m.name}</td>
                <td className="px-4 py-3">{m.quantity} {m.measurement}</td>
                <td className="px-4 py-3">{m.totalPrice.toLocaleString()} ETB</td>
                <td className="px-4 py-3">{m.pricePerUnit} ETB</td>
                <td className="px-4 py-3">{m.expiredDate}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${m.daysLeft <= 3 ? 'bg-destructive/10 text-destructive' : m.daysLeft <= 7 ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                    {m.daysLeft} days
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {dueItems.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No items due to expiry</div>}
      </div>

      <div className="panel-card p-6">
        <h3 className="text-sm font-heading font-semibold mb-4">Expiry Timeline</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dueItems.map(m => ({ name: m.name.substring(0, 10), days: m.daysLeft, value: m.totalPrice }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 88%)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
            <Bar dataKey="days" fill="hsl(38 92% 50%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DueToExpiryPage;
