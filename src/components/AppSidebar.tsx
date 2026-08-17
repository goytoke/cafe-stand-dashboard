import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Package, ShoppingCart, Warehouse, DollarSign, TrendingUp, FileText,
  ChevronDown, ChevronRight, AlertTriangle, Clock, LogOut, Wallet, StickyNote, Users
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Product', icon: Package, path: '/products', adminOnly: true },
  { label: 'Order', icon: ShoppingCart, path: '/orders' },
  {
    label: 'Store', icon: Warehouse, path: '/store',
    children: [
      { label: 'Due to Expiry', icon: Clock, path: '/store/due-to-expiry' },
      { label: 'Expired Items', icon: AlertTriangle, path: '/store/expired' },
    ]
  },
  { label: 'Cost', icon: DollarSign, path: '/expenses' },
  { label: 'Balance & Finance', icon: Wallet, path: '/finance' },
  { label: 'Sales', icon: TrendingUp, path: '/sales' },
  { label: 'Notes', icon: StickyNote, path: '/notes' },
  { label: 'Employees', icon: Users, path: '/employees', adminOnly: true },
  { label: 'Report', icon: FileText, path: '/report' },
];

const AppSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [storeOpen, setStoreOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  const items = navItems.filter(i => !i.adminOnly || isAdmin);

  return (
    <aside className="w-60 h-screen sticky top-0 shrink-0 bg-sidebar flex flex-col overflow-hidden">
      {/* Cafe name */}
      <div className="px-5 py-3 border-b border-sidebar-border">
        <h1 className="text-base font-heading font-bold text-sidebar-primary-foreground tracking-tight">
          The Anfield Stand
        </h1>
        <p className="text-[10px] text-sidebar-muted">Café Management</p>
      </div>

      {/* User profile */}
      <div className="px-5 py-2.5 border-b border-sidebar-border flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground font-bold text-xs">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-sidebar-foreground truncate">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-[10px] text-sidebar-muted truncate">@{user?.username}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2.5 py-2 space-y-0.5 min-h-0">
        {items.map(item => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          if (item.children) {
            return (
              <div key={item.label}>
                <button
                  onClick={() => { setStoreOpen(!storeOpen); navigate(item.path); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                    isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <item.icon size={16} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {storeOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>
                {storeOpen && (
                  <div className="ml-5 mt-0.5 space-y-0.5">
                    {item.children.map(child => (
                      <button
                        key={child.path}
                        onClick={() => navigate(child.path)}
                        className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                          location.pathname === child.path
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent/30'
                        }`}
                      >
                        <child.icon size={13} />
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
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2.5 py-2 border-t border-sidebar-border">
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-sidebar-muted hover:text-destructive hover:bg-sidebar-accent/30 transition-colors"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
