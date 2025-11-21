import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, ClipboardCheck, DollarSign, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
        <div className="fixed inset-0 top-[73px] bg-background z-50 p-4">
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
          </nav>
        </div>
      )}
    </div>
  );
}
