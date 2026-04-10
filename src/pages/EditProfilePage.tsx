import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const EditProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    phone: user?.phone || '',
    password: '',
    confirmPassword: '',
  });

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const data: any = { firstName: form.firstName, lastName: form.lastName, username: form.username, phone: form.phone };
    if (form.password) data.password = form.password;
    updateProfile(data);
    toast.success('Profile updated successfully');
    navigate('/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <h2 className="text-xl font-heading font-bold mb-6">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="form-card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">First Name</label>
            <input value={form.firstName} onChange={e => update('firstName', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30"
              placeholder={user?.firstName} />
          </div>
          <div>
            <label className="text-sm font-medium">Last Name</label>
            <input value={form.lastName} onChange={e => update('lastName', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30"
              placeholder={user?.lastName} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Username</label>
            <input value={form.username} onChange={e => update('username', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30"
              placeholder={user?.username} />
          </div>
          <div>
            <label className="text-sm font-medium">Phone Number</label>
            <input value={form.phone} onChange={e => update('phone', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30"
              placeholder={user?.phone} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Profile Picture</label>
          <input type="file" accept="image/*"
            className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">New Password</label>
            <input type="password" value={form.password} onChange={e => update('password', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Leave blank to keep" />
          </div>
          <div>
            <label className="text-sm font-medium">Confirm Password</label>
            <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Confirm new password" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
            Save Changes
          </button>
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 bg-secondary text-foreground rounded-lg font-medium text-sm hover:bg-muted transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfilePage;
