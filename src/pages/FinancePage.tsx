import React, { useState } from 'react';
import { useData, FundKey } from '@/contexts/DataContext';
import { Wallet, PiggyBank, Home, Boxes, Download, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

const fundMeta: { key: FundKey; label: string; icon: React.ElementType }[] = [
  { key: 'rent', label: 'Rent', icon: Home },
  { key: 'saving', label: 'Saving', icon: PiggyBank },
  { key: 'ingredient', label: 'Ingredient', icon: Boxes },
  { key: 'other', label: 'Other', icon: Wallet },
];

const FinancePage: React.FC = () => {
  const { financeConfig, updateFinanceConfig, txns, deposit, withdraw, fundBalance, rentStatus, suggestAllocation, selectedDate } = useData();
  const [activeTab, setActiveTab] = useState<FundKey | 'config'>('rent');
  const [depositForm, setDepositForm] = useState({ amount: '', reason: '' });
  const [withdrawForm, setWithdrawForm] = useState({ fund: 'ingredient' as FundKey, amount: '', reason: '', quantity: '1' });
  const [config, setConfig] = useState(financeConfig);

  const rent = rentStatus();
  const suggestion = suggestAllocation(Number(depositForm.amount) || 0);
  const fundTxns = activeTab === 'config' ? [] : txns.filter(t => t.fund === activeTab);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(depositForm.amount);
    if (!amount) { toast.error('Enter an amount'); return; }
    const reason = depositForm.reason || 'Income allocation';
    (['rent', 'ingredient', 'saving', 'other'] as FundKey[]).forEach(k => {
      const value = suggestion[k];
      if (value > 0) deposit(k, value, reason);
    });
    toast.success('Allocated and deposited successfully');
    setDepositForm({ amount: '', reason: '' });
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawForm.amount);
    if (!amount || !withdrawForm.reason.trim()) { toast.error('Enter amount and reason'); return; }
    const ok = withdraw(withdrawForm.fund, amount, withdrawForm.reason, Number(withdrawForm.quantity) || 1);
    if (!ok) { toast.error(`Not enough balance in ${withdrawForm.fund} fund`); return; }
    toast.success('Withdraw recorded and added to cost');
    setWithdrawForm({ fund: withdrawForm.fund, amount: '', reason: '', quantity: '1' });
  };

  const saveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateFinanceConfig(config);
    toast.success('Configuration saved');
  };

  const exportTxns = () => {
    const csv = ['Date,Type,Fund,Amount,Reason,By,Role', ...txns.map(t => `${t.date},${t.type},${t.fund},${t.amount},${t.reason},${t.by},${t.role}`)].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = 'finance.csv'; a.click();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold">Balance &amp; Finance</h2>
        <button onClick={exportTxns} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Download size={16} /> Export
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {fundMeta.map(f => (
          <div key={f.key} className="panel-card p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium"><f.icon size={14} /> {f.label} Fund</div>
            <p className="text-2xl font-heading font-bold mt-2">{fundBalance(f.key).toLocaleString()} <span className="text-sm">ETB</span></p>
          </div>
        ))}
      </div>

      <div className="panel-card p-5 space-y-2">
        <h3 className="text-sm font-heading font-semibold">Rent Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><p className="text-muted-foreground text-xs">Needed</p><p className="font-bold">{rent.needed.toLocaleString()} ETB</p></div>
          <div><p className="text-muted-foreground text-xs">Deposited</p><p className="font-bold">{rent.saved.toLocaleString()} ETB</p></div>
          <div><p className="text-muted-foreground text-xs">Remaining</p><p className="font-bold text-destructive">{rent.remaining.toLocaleString()} ETB</p></div>
          <div><p className="text-muted-foreground text-xs">Days left</p><p className="font-bold">{rent.daysLeft}</p></div>
        </div>
        <p className="text-xs text-muted-foreground">
          {rent.remaining > 0
            ? `Deposit at least ${Math.ceil(rent.remaining / Math.max(1, rent.daysLeft)).toLocaleString()} ETB per day to fulfil rent in time. The rest goes to ingredient, saving and other funds.`
            : 'Rent is fully covered — all new income is split into ingredient, saving and other funds.'}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {fundMeta.map(f => (
          <button key={f.key} onClick={() => setActiveTab(f.key)} className={`panel-link ${activeTab === f.key ? 'panel-link-active' : 'panel-link-inactive'}`}>{f.label}</button>
        ))}
        <button onClick={() => setActiveTab('config')} className={`panel-link ${activeTab === 'config' ? 'panel-link-active' : 'panel-link-inactive'}`}>
          <span className="inline-flex items-center gap-2"><Settings size={14} /> Config</span>
        </button>
      </div>

      {activeTab === 'config' ? (
        <form onSubmit={saveConfig} className="form-card space-y-4 animate-fade-in">
          <h3 className="text-sm font-heading font-semibold">Finance Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium">Rent amount (ETB)</label><input type="number" value={config.rentAmount} onChange={e => setConfig({ ...config, rentAmount: Number(e.target.value) })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-sm font-medium">Rent due date</label><input type="date" value={config.rentDueDate} onChange={e => setConfig({ ...config, rentDueDate: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-sm font-medium">Ingredient %</label><input type="number" value={config.ingredientPercent} onChange={e => setConfig({ ...config, ingredientPercent: Number(e.target.value) })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-sm font-medium">Saving %</label><input type="number" value={config.savingPercent} onChange={e => setConfig({ ...config, savingPercent: Number(e.target.value) })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="text-sm font-medium">Other %</label><input type="number" value={config.otherPercent} onChange={e => setConfig({ ...config, otherPercent: Number(e.target.value) })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
          </div>
          <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90">Save Config</button>
        </form>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-6">
            <form onSubmit={handleDeposit} className="form-card space-y-4">
              <h3 className="text-sm font-heading font-semibold">Deposit income</h3>
              <div><label className="text-sm font-medium">Amount (ETB)</label><input type="number" value={depositForm.amount} onChange={e => setDepositForm({ ...depositForm, amount: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <div><label className="text-sm font-medium">Reason</label><input value={depositForm.reason} onChange={e => setDepositForm({ ...depositForm, reason: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
              {Number(depositForm.amount) > 0 && (
                <div className="text-xs bg-secondary rounded-lg p-3 space-y-1">
                  <p className="font-medium">System suggestion:</p>
                  <p>Rent: <strong>{suggestion.rent.toLocaleString()} ETB</strong> · Ingredient: <strong>{suggestion.ingredient.toLocaleString()} ETB</strong></p>
                  <p>Saving: <strong>{suggestion.saving.toLocaleString()} ETB</strong> · Other: <strong>{suggestion.other.toLocaleString()} ETB</strong></p>
                </div>
              )}
              <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90">Deposit &amp; Allocate</button>
            </form>

            <form onSubmit={handleWithdraw} className="form-card space-y-4">
              <h3 className="text-sm font-heading font-semibold">Withdraw for a cost</h3>
              <div>
                <label className="text-sm font-medium">From fund</label>
                <select value={withdrawForm.fund} onChange={e => setWithdrawForm({ ...withdrawForm, fund: e.target.value as FundKey })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30">
                  {fundMeta.map(f => <option key={f.key} value={f.key}>{f.label} ({fundBalance(f.key).toLocaleString()} ETB)</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-medium">Amount (ETB)</label><input type="number" value={withdrawForm.amount} onChange={e => setWithdrawForm({ ...withdrawForm, amount: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
                <div><label className="text-sm font-medium">Quantity</label><input type="number" value={withdrawForm.quantity} onChange={e => setWithdrawForm({ ...withdrawForm, quantity: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
              </div>
              <div><label className="text-sm font-medium">Reason</label><input value={withdrawForm.reason} onChange={e => setWithdrawForm({ ...withdrawForm, reason: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" /></div>
              <p className="text-xs text-muted-foreground">Recorded on {selectedDate} and automatically added to the Cost page.</p>
              <button type="submit" className="px-6 py-2.5 bg-destructive text-destructive-foreground rounded-lg font-medium text-sm hover:opacity-90">Withdraw</button>
            </form>
          </div>

          <div className="table-container overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reason</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">By</th>
              </tr></thead>
              <tbody>
                {fundTxns.map(t => (
                  <tr key={t.id} className="border-b border-border hover:bg-secondary/30">
                    <td className="px-4 py-3 text-muted-foreground">{t.date}</td>
                    <td className={`px-4 py-3 font-medium capitalize ${t.type === 'deposit' ? 'text-primary' : 'text-destructive'}`}>{t.type}</td>
                    <td className="px-4 py-3">{t.amount.toLocaleString()} ETB</td>
                    <td className="px-4 py-3">{t.reason}</td>
                    <td className="px-4 py-3">{t.by} · {t.role === 'admin' ? 'Admin' : 'Staff'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {fundTxns.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No transactions in this fund</div>}
          </div>

          <div className="panel-card p-6">
            <h3 className="text-sm font-heading font-semibold mb-4">Fund Balances</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={fundMeta.map(f => ({ name: f.label, balance: fundBalance(f.key) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(30 15% 88%)" /><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />
                <Bar dataKey="balance" fill="hsl(25 90% 55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default FinancePage;
