import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, MapPin, Users, Ticket,
  Menu, X, Moon, Sun, LogOut, User, Shield, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { toast } from 'sonner';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['visitor', 'organizer', 'admin'] },
  { label: 'Events', path: '/events', icon: Calendar, roles: ['visitor', 'organizer', 'admin'] },
  { label: 'Venues', path: '/venues', icon: MapPin, roles: ['visitor', 'organizer', 'admin'] },
  { label: 'Artists', path: '/artists', icon: Users, roles: ['visitor', 'organizer', 'admin'] },
  { label: 'Tickets', path: '/tickets', icon: Ticket, roles: ['visitor', 'organizer', 'admin'] },
  { label: 'Admin', path: '/admin', icon: Shield, roles: ['admin'] },
];

function NavContent({ onClose }: { onClose?: () => void }) {
  const { role, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const filtered = navItems.filter(item => !role || item.roles.includes(role));

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/');
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link to="/" onClick={onClose} className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent flex items-center justify-center">
            <span className="text-white font-black text-sm">CE</span>
          </div>
          <div>
            <div className="font-black text-sm tracking-widest uppercase text-sidebar-foreground">Cultural</div>
            <div className="font-black text-sm tracking-widest uppercase text-accent">Events</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filtered.map(item => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors group ${
                active
                  ? 'bg-accent text-white'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon size={16} className="shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={14} />}
            </Link>
          );
        })}
      </nav>

      {/* User section — always visible at bottom left */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/30">
        {profile ? (
          <div className="space-y-3">
            {/* User info */}
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 bg-accent/20 border border-accent/40 flex items-center justify-center shrink-0">
                <User size={16} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-sidebar-foreground truncate">
                  {profile.full_name || profile.username}
                </div>
                <Badge variant="outline" className="text-xs border-sidebar-border text-sidebar-foreground/70 mt-0.5">
                  {role}
                </Badge>
              </div>
            </div>

            {/* Profile Settings button */}
            <Link
              to="/profile"
              onClick={onClose}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-sidebar-foreground bg-sidebar-accent hover:bg-sidebar-accent/80 border border-sidebar-border transition-colors rounded-sm"
            >
              <User size={16} />
              Profile Settings
            </Link>

            {/* Sign Out button */}
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:text-white hover:bg-destructive/80 border border-destructive/30 transition-colors justify-start rounded-sm"
            >
              <LogOut size={16} />
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              to="/"
              onClick={onClose}
              className="block w-full px-3 py-2 text-sm font-medium text-center bg-accent text-white hover:bg-accent/90 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/auth/register"
              onClick={onClose}
              className="block w-full px-3 py-2 text-sm font-medium text-center border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggle } = useTheme();

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-border">
        <NavContent />
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top header */}
        <header className="h-14 border-b border-border flex items-center px-4 md:px-6 gap-4 bg-background shrink-0">
          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden shrink-0">
                <Menu size={18} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border" aria-describedby={undefined}>
              <NavContent onClose={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="flex-1 min-w-0" />

          {/* Dark mode toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            className="shrink-0 border border-border"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </Button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
