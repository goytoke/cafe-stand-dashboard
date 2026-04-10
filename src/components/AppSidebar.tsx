import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse, DollarSign, TrendingUp, FileText,
  ChevronDown, ChevronRight, AlertTriangle, Clock, LogOut
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Product', icon: Package, path: '/products' },
  { label: 'Order', icon: ShoppingCart, path: '/orders' },
  {
    label: 'Store', icon: Warehouse, path: '/store',
    children: [
      { label: 'Due to Expiry', icon: Clock, path: '/store/due-to-expiry' },
      { label: 'Expired Items', icon: AlertTriangle, path: '/store/expired' },
    ]
  },
  { label: 'Expense', icon: DollarSign, path: '/expenses' },
  { label: 'Sales', icon: TrendingUp, path: '/sales' },
  { label: 'Report', icon: FileText, path: '/report' },
];

const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [storeOpen, setStoreOpen] = useState(false);

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col">
      {/* Cafe name */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <h1 className="text-xl font-heading font-bold text-sidebar-primary-foreground tracking-tight">
          The Anfield Stand
        </h1>
        <p className="text-xs text-sidebar-muted mt-0.5">Café Management</p>
      </div>

      {/* User profile */}
      <div className="px-6 py-4 border-b border-sidebar-border flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground font-bold text-sm">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-xs text-sidebar-muted truncate">@{user?.username}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => { setStoreOpen(!storeOpen); navigate(item.path); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <item.icon size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {storeOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {storeOpen && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map(child => (
                      <button
                        key={child.path}
                        onClick={() => navigate(child.path)}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                          location.pathname === child.path
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/30'
                        }`}
                      >
                        <child.icon size={14} />
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-muted hover:text-destructive hover:bg-sidebar-accent/30 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
