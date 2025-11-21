import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, ClipboardCheck, DollarSign, Menu, X, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from 'miaoda-auth-react';
import { profilesApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import { useToast } from '@/hooks/use-toast';

const menuItems = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard
  },
  {
    name: 'Add Student',
    path: '/add-student',
    icon: UserPlus
  },
  {
    name: 'Students List',
    path: '/students',
    icon: Users
  },
  {
    name: 'Attendance',
    path: '/attendance',
    icon: ClipboardCheck
  },
  {
    name: 'Fees',
    path: '/fees',
    icon: DollarSign
  }
];

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const admin = await profilesApi.isAdmin();
      setIsAdmin(admin);
    } catch (error) {
      setIsAdmin(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsOpen(false);
      toast({
        title: 'Success',
        description: 'Logged out successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="xl:hidden">
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div>
          <h1 className="text-lg font-bold text-primary">SIMS</h1>
          <p className="text-xs text-muted-foreground">Student Management</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 top-[73px] bg-background z-50 p-4 overflow-y-auto">
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  location.pathname === '/admin'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                )}
              >
                <Shield className="h-5 w-5" />
                <span className="font-medium">Admin Dashboard</span>
              </Link>
            )}

            <div className="mt-4 pt-4 border-t border-border">
              {user && (
                <div className="mb-3 px-4 py-2">
                  <p className="text-xs text-muted-foreground">Logged in as</p>
                  <p className="text-sm font-medium truncate">{user.email?.replace('@miaoda.com', '')}</p>
                </div>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}
