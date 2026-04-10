import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Coffee } from 'lucide-react';
import { toast } from 'sonner';

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', phone: '', password: '', confirmPassword: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (register({ firstName: form.firstName, lastName: form.lastName, username: form.username, phone: form.phone, password: form.password })) {
      toast.success('Account created!');
      navigate('/dashboard');
    } else {
      toast.error('Username already exists');
    }
  };

  const update = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary mb-4">
            <Coffee className="text-primary-foreground" size={28} />
          </div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join The Anfield Stand</p>
        </div>
        <form onSubmit={handleSubmit} className="form-card space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">First Name</label>
              <input required value={form.firstName} onChange={e => update('firstName', e.target.value)}
                className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" placeholder="First name" />
            </div>
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <input required value={form.lastName} onChange={e => update('lastName', e.target.value)}
                className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" placeholder="Last name" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Username</label>
              <input required value={form.username} onChange={e => update('username', e.target.value)}
                className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" placeholder="Username" />
            </div>
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <input required value={form.phone} onChange={e => update('phone', e.target.value)}
                className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" placeholder="Phone number" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Password</label>
              <input type="password" required value={form.password} onChange={e => update('password', e.target.value)}
                className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" placeholder="Password" />
            </div>
            <div>
              <label className="text-sm font-medium">Confirm Password</label>
              <input type="password" required value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                className="mt-1 w-full px-3 py-2.5 bg-secondary rounded-lg text-sm border border-border outline-none focus:ring-2 focus:ring-primary/30" placeholder="Confirm password" />
            </div>
          </div>
          <button type="submit" className="w-full py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
            Register
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
