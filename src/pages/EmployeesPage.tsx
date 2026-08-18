import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth, Employee, AppRole, EmploymentType } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Plus, Pencil, Trash2, X, Users, Share2, Wallet, BellRing } from 'lucide-react';
import { toast } from 'sonner';

const roles: { key: AppRole; label: string }[] = [
  { key: 'admin', label: 'Admin' },
  { key: 'staff', label: 'Staff' },
  { key: 'shareholder', label: 'Shareholder' },
];

const emptyForm = {
  firstName: '', lastName: '', username: '', password: '', phone: '',
  role: 'staff' as AppRole, profilePic: '',
  employment: 'coworker' as EmploymentType, salary: '',
};

const DAY = 86400000;
const todayStr = () => new Date().toISOString().split('T')[0];
const shift = (from: string, n: number) => {
  const d = new Date(from);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
};
const dayDiff = (a: string, b: string) => Math.floor((new Date(a).getTime() - new Date(b).getTime()) / DAY);

export interface SalaryInfo {
  periodFrom: string;
  nextDate: string;
  daysWorked: number;
  daysLeft: number;
  daily: number;
  dueNow: number;
  full: number;
}

const salaryInfo = (e: Employee): SalaryInfo => {
  const periodFrom = e.lastPaidDate || e.hireDate || todayStr();
  const nextDate = shift(periodFrom, 30);
  const salary = e.employment === 'shared' ? 0 : (e.salary || 0);
  const daysWorked = Math.max(0, Math.min(dayDiff(todayStr(), periodFrom), 30));
  const daily = salary / 30;
  return {
    periodFrom,
    nextDate,
    daysWorked,
    daysLeft: dayDiff(nextDate, todayStr()),
    daily,
    dueNow: Math.round(daily * daysWorked),
    full: salary,
  };
};

const EmployeesPage: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, user } = useAuth();
  const { salaryPayments, paySalary } = useData();
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<'coworker' | 'shared' | 'payments'>('coworker');
  const [editing, setEditing] = useState<Employee | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Employee | null>(null);
  const [payFor, setPayFor] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);
  const reminded = useRef(false);

  const payables = useMemo(
    () => employees.filter(e => (e.employment || 'coworker') === 'coworker'),
    [employees],
  );

  useEffect(() => {
    if (reminded.current) return;
    reminded.current = true;
    payables.forEach(e => {
      const info = salaryInfo(e);
      if (info.daysLeft === 1) toast.warning(`${e.firstName}'s salary is due tomorrow (${info.full.toLocaleString()} ETB)`);
      else if (info.daysLeft <= 0) toast.error(`${e.firstName}'s salary is due — ${info.dueNow.toLocaleString()} ETB to pay`);
    });
  }, [payables]);

  if (user?.role !== 'admin') {
    return <div className="panel-card p-6 text-center text-muted-foreground">Only admins can manage employees.</div>;
  }

  const openAdd = () => { setEditing(null); setForm({ ...emptyForm, employment: tab === 'shared' ? 'shared' : 'coworker' }); setShowForm(true); };
  const openEdit = (e: Employee) => {
    setEditing(e);
    setForm({
      firstName: e.firstName, lastName: e.lastName, username: e.username, password: e.password,
      phone: e.phone, role: e.role, profilePic: e.profilePic || '',
      employment: e.employment || 'coworker', salary: e.salary ? String(e.salary) : '',
    });
    setShowForm(true);
  };

  const onPic = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, profilePic: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    const payload = {
      firstName: form.firstName, lastName: form.lastName, username: form.username,
      password: form.password, phone: form.phone, role: form.role, profilePic: form.profilePic,
      employment: form.employment,
      salary: form.employment === 'shared' ? undefined : Number(form.salary) || undefined,
    };
    if (editing) {
      updateEmployee(editing.id, payload);
      toast.success(`${form.firstName} updated successfully`);
    } else {
      if (!addEmployee({ ...payload, hireDate: todayStr() })) return toast.error('Username already exists');
      toast.success(`${form.firstName} added successfully — next payment ${shift(todayStr(), 30)}`);
    }
    setShowForm(false);
  };

  const confirmPay = (e: Employee, amount: number, days: number, periodFrom: string) => {
    paySalary({
      employeeId: e.id,
      employeeName: `${e.firstName} ${e.lastName}`,
      username: e.username,
      salary: e.salary || 0,
      days,
      amount,
      periodFrom,
    });
    updateEmployee(e.id, { lastPaidDate: todayStr() });
    setPayFor(null);
    toast.success(`${e.firstName} paid ${amount.toLocaleString()} ETB successfully`);
  };

  const list = tab === 'payments' ? [] : employees.filter(e => (e.employment || 'coworker') === (tab === 'shared' ? 'shared' : 'coworker'));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold">Employees</h2>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 shadow-md">
          <Plus size={16} /> Add Employee
        </button>
      </div>

      <div className="flex flex-wrap gap-4">
        <button onClick={() => setTab('coworker')} className={`panel-link ${tab === 'coworker' ? 'panel-link-active' : 'panel-link-inactive'}`}>
          <span className="inline-flex items-center gap-2"><Users size={16} /> Coworkers ({employees.filter(e => (e.employment || 'coworker') === 'coworker').length})</span>
        </button>
        <button onClick={() => setTab('shared')} className={`panel-link ${tab === 'shared' ? 'panel-link-active' : 'panel-link-inactive'}`}>
          <span className="inline-flex items-center gap-2"><Share2 size={16} /> Shared ({employees.filter(e => e.employment === 'shared').length})</span>
        </button>
        <button onClick={() => setTab('payments')} className={`panel-link ${tab === 'payments' ? 'panel-link-active' : 'panel-link-inactive'}`}>
          <span className="inline-flex items-center gap-2"><Wallet size={16} /> Payment ({payables.filter(e => salaryInfo(e).daysLeft <= 1).length} due)</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="form-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-sm">{editing ? 'Edit Employee' : 'New Employee'}</h3>
            <button type="button" onClick={() => setShowForm(false)}><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">First name</label>
              <input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium">Last name</label>
              <input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium">Username</label>
              <input required value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium">Phone number</label>
              <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as AppRole })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none">
                {roles.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <select value={form.employment} onChange={e => setForm({ ...form, employment: e.target.value as EmploymentType })} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none">
                <option value="coworker">Coworker (salary)</option>
                <option value="shared">Shared (no salary)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Salary (ETB)</label>
              <input type="number" disabled={form.employment === 'shared'} value={form.employment === 'shared' ? '' : form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder={form.employment === 'shared' ? 'No salary — shared' : '0'} className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none disabled:opacity-50" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Profile picture</label>
              <input type="file" accept="image/*" onChange={e => onPic(e.target.files?.[0])} className="mt-1 w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border" />
              {form.profilePic && <img src={form.profilePic} alt="Employee profile preview" className="mt-2 w-16 h-16 rounded-full object-cover" />}
            </div>
          </div>
          <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium">{editing ? 'Save changes' : 'Add employee'}</button>
        </form>
      )}

      {tab === 'payments' ? (
        <div className="space-y-6">
          <div className="table-container overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-secondary/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Monthly salary</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Period from</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Next payment</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Days left</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Days worked</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount to pay now</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
              </tr></thead>
              <tbody>
                {payables.map(e => {
                  const i = salaryInfo(e);
                  return (
                    <tr key={e.id} className="border-b border-border hover:bg-secondary/30">
                      <td className="px-4 py-3 font-medium">{e.firstName} {e.lastName}</td>
                      <td className="px-4 py-3">{i.full.toLocaleString()} ETB</td>
                      <td className="px-4 py-3">{i.periodFrom}</td>
                      <td className="px-4 py-3">{i.nextDate}</td>
                      <td className="px-4 py-3">
                        {i.daysLeft <= 0
                          ? <span className="text-destructive font-medium">Due now</span>
                          : i.daysLeft === 1
                            ? <span className="text-destructive font-medium inline-flex items-center gap-1"><BellRing size={13} /> Tomorrow</span>
                            : `${i.daysLeft} days`}
                      </td>
                      <td className="px-4 py-3">{i.daysWorked} / 30</td>
                      <td className="px-4 py-3 font-semibold">{i.dueNow.toLocaleString()} ETB</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setPayFor(e)} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium shadow-sm">Payment</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {payables.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No salaried coworkers yet</div>}
          </div>

          <div>
            <h3 className="font-heading font-semibold text-sm mb-3">Payment records</h3>
            <div className="table-container overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-border bg-secondary/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Username</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Period from</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Days</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Paid by</th>
                </tr></thead>
                <tbody>
                  {[...salaryPayments].reverse().map(p => (
                    <tr key={p.id} className="border-b border-border hover:bg-secondary/30">
                      <td className="px-4 py-3">{p.date}</td>
                      <td className="px-4 py-3 font-medium">{p.employeeName}</td>
                      <td className="px-4 py-3">{p.username}</td>
                      <td className="px-4 py-3">{p.periodFrom}</td>
                      <td className="px-4 py-3">{p.days}</td>
                      <td className="px-4 py-3 font-semibold">{p.amount.toLocaleString()} ETB</td>
                      <td className="px-4 py-3">{p.paidBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {salaryPayments.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No salary paid yet</div>}
            </div>
          </div>
        </div>
      ) : (
        <div className="table-container overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-secondary/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Profile</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Last name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Username</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Password</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Salary</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Next payment</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
            </tr></thead>
            <tbody>
              {list.map(e => {
                const i = salaryInfo(e);
                return (
                  <tr key={e.id} className="border-b border-border hover:bg-secondary/30">
                    <td className="px-4 py-3">
                      {e.profilePic
                        ? <img src={e.profilePic} alt={`${e.firstName} profile`} className="w-9 h-9 rounded-full object-cover" />
                        : <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{e.firstName[0]}{e.lastName[0]}</div>}
                    </td>
                    <td className="px-4 py-3 font-medium">{e.firstName}</td>
                    <td className="px-4 py-3">{e.lastName}</td>
                    <td className="px-4 py-3">{e.username}</td>
                    <td className="px-4 py-3">{e.phone}</td>
                    <td className="px-4 py-3 text-muted-foreground">{e.password}</td>
                    <td className="px-4 py-3">{e.employment === 'shared' ? <span className="text-muted-foreground text-xs">No salary (shared)</span> : `${(e.salary || 0).toLocaleString()} ETB`}</td>
                    <td className="px-4 py-3">
                      {e.employment === 'shared'
                        ? <span className="text-muted-foreground text-xs">—</span>
                        : <span className={i.daysLeft <= 1 ? 'text-destructive font-medium' : ''}>{i.nextDate} ({i.daysLeft <= 0 ? 'due' : `${i.daysLeft}d`})</span>}
                    </td>
                    <td className="px-4 py-3 capitalize">{e.role}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(e)} aria-label="Edit employee" className="p-1.5 rounded-md hover:bg-secondary"><Pencil size={14} /></button>
                        <button onClick={() => setConfirmDelete(e)} aria-label="Delete employee" className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                        {e.employment !== 'shared' && (
                          <button onClick={() => setPayFor(e)} className="px-2.5 py-1 rounded-md bg-secondary text-xs font-medium">Payment</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {list.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No {tab === 'shared' ? 'shared users' : 'coworkers'} yet</div>}
        </div>
      )}

      {payFor && (() => {
        const i = salaryInfo(payFor);
        return (
          <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50 p-4">
            <div className="form-card max-w-md w-full space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold text-sm">Salary payment — {payFor.firstName} {payFor.lastName}</h3>
                <button onClick={() => setPayFor(null)}><X size={16} /></button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Monthly salary (30 days)</span><span className="font-semibold">{i.full.toLocaleString()} ETB</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Daily rate</span><span>{i.daily.toFixed(2)} ETB</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Period from</span><span>{i.periodFrom}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Days worked</span><span>{i.daysWorked} days</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Next payment date</span><span>{i.nextDate}</span></div>
                <div className="flex justify-between border-t border-border pt-2"><span className="font-medium">Amount to pay now</span><span className="font-bold text-primary">{i.dueNow.toLocaleString()} ETB</span></div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => confirmPay(payFor, i.dueNow, i.daysWorked, i.periodFrom)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Paid {i.dueNow.toLocaleString()} ETB ({i.daysWorked}d)</button>
                <button onClick={() => confirmPay(payFor, i.full, 30, i.periodFrom)} className="px-4 py-2 bg-secondary rounded-lg text-sm font-medium">Paid full 30 days ({i.full.toLocaleString()} ETB)</button>
                <button onClick={() => setPayFor(null)} className="px-4 py-2 bg-secondary rounded-lg text-sm">Cancel</button>
              </div>
            </div>
          </div>
        );
      })()}

      {confirmDelete && (
        <div className="fixed inset-0 bg-foreground/40 flex items-center justify-center z-50 p-4">
          <div className="form-card max-w-sm w-full space-y-4">
            <p className="text-sm"><strong>{confirmDelete.firstName} {confirmDelete.lastName}</strong> — are you sure you want to delete?</p>
            <div className="flex gap-2">
              <button onClick={() => { deleteEmployee(confirmDelete.id); toast.success(`${confirmDelete.firstName} deleted successfully`); setConfirmDelete(null); }} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm">Yes</button>
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 bg-secondary rounded-lg text-sm">No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesPage;
