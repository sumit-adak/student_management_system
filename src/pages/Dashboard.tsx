import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { dashboardApi } from '@/db/api';
import type { DashboardStats } from '@/types';
import { Users, UserCheck, UserX, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    totalFeesDue: 0,
    totalFeesPaid: 0,
    pendingPayments: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      link: '/students'
    },
    {
      title: 'Present Today',
      value: stats.presentToday,
      icon: UserCheck,
      color: 'text-[hsl(var(--success))]',
      bgColor: 'bg-[hsl(var(--success))]/10',
      link: '/attendance'
    },
    {
      title: 'Absent Today',
      value: stats.absentToday,
      icon: UserX,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
      link: '/attendance'
    },
    {
      title: 'Total Fees Due',
      value: `$${stats.totalFeesDue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-[hsl(var(--warning))]',
      bgColor: 'bg-[hsl(var(--warning))]/10',
      link: '/fees'
    },
    {
      title: 'Total Fees Paid',
      value: `$${stats.totalFeesPaid.toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-[hsl(var(--success))]',
      bgColor: 'bg-[hsl(var(--success))]/10',
      link: '/fees'
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments,
      icon: Clock,
      color: 'text-[hsl(var(--warning))]',
      bgColor: 'bg-[hsl(var(--warning))]/10',
      link: '/fees'
    }
  ];

  const quickAccessCards = [
    {
      title: 'Add New Student',
      description: 'Register a new student in the system',
      link: '/add-student',
      icon: Users,
      color: 'bg-primary'
    },
    {
      title: 'View Students',
      description: 'Browse and manage student records',
      link: '/students',
      icon: Users,
      color: 'bg-secondary'
    },
    {
      title: 'Mark Attendance',
      description: 'Record student attendance for today',
      link: '/attendance',
      icon: UserCheck,
      color: 'bg-[hsl(var(--success))]'
    },
    {
      title: 'Manage Fees',
      description: 'Track and update fee payments',
      link: '/fees',
      icon: DollarSign,
      color: 'bg-[hsl(var(--warning))]'
    }
  ];

  if (loading) {
    return (
      <div className="p-4 xl:p-8">
        <div className="mb-6 xl:mb-8">
          <h1 className="text-2xl xl:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm xl:text-base text-muted-foreground mt-1 xl:mt-2">Welcome to Student Information Management System</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 xl:p-8">
      <div className="mb-6 xl:mb-8">
        <h1 className="text-2xl xl:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm xl:text-base text-muted-foreground mt-1 xl:mt-2">Welcome to Student Information Management System</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-6 mb-6 xl:mb-8">
        {statCards.map((card, index) => (
          <Link key={index} to={card.link}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{card.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mb-6 xl:mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Access</h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
          {quickAccessCards.map((card, index) => (
            <Link key={index} to={card.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${card.color}`}>
                      <card.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{card.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
