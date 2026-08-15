import React, { useState } from 'react';
import { useAuth, Employee, AppRole } from '@/contexts/AuthContext';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

const roles: { key: AppRole; label: string }[] = [
  { key: 'admin', label: 'Admin' },
  { key: 'staff', label: 'Staff' },
  { key: 'shareholder', label: 'Shareholder' },
];

const emptyForm = { firstName: '', lastName: '', username: '', password: '', phone: '', role: 'staff' as AppRole, profilePic: '' };

const EmployeesPage: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Employee | null>(null);
  const [form, setForm] = useState(emptyForm);

  if (user?.role !== 'admin') {
    return <div className="panel-card p-6 text-center text-muted-foreground">Only admins can manage employees.</div>;
  }

  const openAdd = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (e: Employee) => {
    setEditing(e);
    setForm({ firstName: e.firstName, lastName: e.lastName, username: e.username, password: e.password, phone: e.phone, role: e.role, profilePic: e.profilePic || '' });
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
    if (editing) {
      updateEmployee(editing.id, form);
      toast.success(`${form.firstName} updated successfully`);
    } else {
      if (!addEmployee(form)) return toast.error('Username already exists');
      toast.success(`${form.firstName} added successfully`);
    }
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-heading font-bold">Employees</h2>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Add Employee
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
            <div className="md:col-span-2">
              <label className="text-sm font-medium">Profile picture</label>
              <input type="file" accept="image/*" onChange={e => onPic(e.target.files?.[0])} className="mt-1 w-full px-3 py-2 bg-secondary rounded-lg text-sm border border-border" />
              {form.profilePic && <img src={form.profilePic} alt="Employee profile preview" className="mt-2 w-16 h-16 rounded-full object-cover" />}
            </div>
          </div>
          <button type="submit" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium">{editing ? 'Save changes' : 'Add employee'}</button>
        </form>
      )}

      <div className="table-container overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-secondary/50">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Photo</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Username</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Password</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
          </tr></thead>
          <tbody>
            {employees.map(e => (
              <tr key={e.id} className="border-b border-border hover:bg-secondary/30">
                <td className="px-4 py-3">
                  {e.profilePic
                    ? <img src={e.profilePic} alt={`${e.firstName} profile`} className="w-9 h-9 rounded-full object-cover" />
                    : <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">{e.firstName[0]}{e.lastName[0]}</div>}
                </td>
                <td className="px-4 py-3 font-medium">{e.firstName} {e.lastName}</td>
                <td className="px-4 py-3 capitalize">{e.role}</td>
                <td className="px-4 py-3">{e.phone}</td>
                <td className="px-4 py-3">{e.username}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.password}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(e)} className="p-1.5 rounded-md hover:bg-secondary"><Pencil size={14} /></button>
                    <button onClick={() => setConfirmDelete(e)} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {employees.length === 0 && <div className="p-8 text-center text-muted-foreground text-sm">No employees yet</div>}
      </div>

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
