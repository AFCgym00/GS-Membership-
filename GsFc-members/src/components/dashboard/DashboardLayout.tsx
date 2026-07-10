import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  TrendingUp,
  Dumbbell,
  Menu,
  X,
  ArrowLeft,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/AuthProvider';

const navItems = [
  { label: 'Overview', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Members', icon: Users, path: '/dashboard/members' },
  { label: 'Plans', icon: CreditCard, path: '/dashboard/plans' },
  { label: 'Revenue', icon: TrendingUp, path: '/dashboard/revenue' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    navigate('/dashboard/login');
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center gap-3 px-6 py-5">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Dumbbell className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-sm">AFC Gym</h2>
            <p className="text-xs text-muted-foreground">Admin Dashboard</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <Separator />

        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator />

        <div className="p-4 space-y-2">
          <Link to="/">
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Website
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            size="sm"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Log out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="h-14 border-b border-border bg-card flex items-center px-4 lg:px-6 sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden mr-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            {navItems.find((item) => item.path === location.pathname)?.label || 'Dashboard'}
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
