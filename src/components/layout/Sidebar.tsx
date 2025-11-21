import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, ClipboardCheck, DollarSign } from 'lucide-react';
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

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar-background border-r border-sidebar-border h-screen sticky top-0 hidden xl:block">
      <div className="p-6">
        <h1 className="text-xl font-bold text-primary">SIMS</h1>
        <p className="text-xs text-muted-foreground mt-1">Student Management</p>
      </div>

      <nav className="px-3">
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
      </nav>
    </aside>
  );
}
