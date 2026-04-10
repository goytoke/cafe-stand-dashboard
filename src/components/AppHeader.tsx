import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, CalendarDays, Bell, User, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { format } from 'date-fns';

const AppHeader: React.FC = () => {
  const { logout } = useAuth();
  const { selectedDate, setSelectedDate } = useData();
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [search, setSearch] = useState('');
  const calRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) setShowCalendar(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="h-16 bg-card border-b border-border flex items-center px-6 gap-4 sticky top-0 z-30">
      {/* Search */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-secondary rounded-lg text-sm border-none outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Right icons */}
      <div className="flex items-center gap-2">
        {/* Calendar */}
        <div ref={calRef} className="relative">
          <button
            onClick={() => { setShowCalendar(!showCalendar); setShowNotifications(false); setShowUserMenu(false); }}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <CalendarDays size={20} />
          </button>
          {showCalendar && (
            <div className="absolute right-0 top-12 panel-card p-3 z-50 animate-fade-in">
              <p className="text-xs font-medium text-muted-foreground mb-2">Selected: {format(new Date(selectedDate), 'PPP')}</p>
              <Calendar
                mode="single"
                selected={new Date(selectedDate)}
                onSelect={(d) => { if (d) { setSelectedDate(format(d, 'yyyy-MM-dd')); setShowCalendar(false); } }}
                className="pointer-events-auto"
              />
            </div>
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowCalendar(false); setShowUserMenu(false); }}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground relative"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-12 w-72 panel-card p-4 z-50 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-heading font-semibold">Notifications</h3>
                <button onClick={() => setShowNotifications(false)}><X size={14} className="text-muted-foreground" /></button>
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-secondary rounded-md text-xs">
                  <p className="font-medium">Low stock alert</p>
                  <p className="text-muted-foreground">Vanilla Syrup is running low</p>
                </div>
                <div className="p-2 bg-secondary rounded-md text-xs">
                  <p className="font-medium">Expiry warning</p>
                  <p className="text-muted-foreground">Mint Leaves expires in 1 day</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowCalendar(false); setShowNotifications(false); }}
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            <User size={20} />
          </button>
          {showUserMenu && (
            <div className="absolute right-0 top-12 w-44 panel-card py-1 z-50 animate-fade-in">
              <button
                onClick={() => { setShowUserMenu(false); navigate('/edit-profile'); }}
                className="w-full px-4 py-2.5 text-sm text-left hover:bg-secondary transition-colors"
              >
                Edit Profile
              </button>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="w-full px-4 py-2.5 text-sm text-left text-destructive hover:bg-secondary transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
