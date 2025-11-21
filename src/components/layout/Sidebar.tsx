import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, ClipboardCheck, DollarSign, Shield, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from 'miaoda-auth-react';
import { useEffect, useState } from 'react';
import { profilesApi } from '@/db/api';
import { Button } from '@/components/ui/button';
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

export default function Sidebar() {
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
    <aside className="w-64 bg-sidebar-background border-r border-sidebar-border h-screen sticky top-0 hidden xl:flex xl:flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary">SIMS</h1>
        <p className="text-xs text-muted-foreground mt-1">Student Management</p>
      </div>

      <nav className="px-3 flex-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent'
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
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-colors',
              location.pathname === '/admin'
                ? 'bg-primary text-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            )}
          >
            <Shield className="h-5 w-5" />
            <span className="font-medium">Admin Dashboard</span>
          </Link>
        )}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        {user && (
          <div className="mb-3 px-3 py-2">
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
    </aside>
  );
}

