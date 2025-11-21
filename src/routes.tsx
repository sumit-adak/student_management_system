import Dashboard from './pages/Dashboard';
import AddStudent from './pages/AddStudent';
import StudentsList from './pages/StudentsList';
import Attendance from './pages/Attendance';
import Fees from './pages/Fees';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Dashboard',
    path: '/',
    element: <Dashboard />,
    visible: true
  },
  {
    name: 'Add Student',
    path: '/add-student',
    element: <AddStudent />,
    visible: true
  },
  {
    name: 'Students List',
    path: '/students',
    element: <StudentsList />,
    visible: true
  },
  {
    name: 'Attendance',
    path: '/attendance',
    element: <Attendance />,
    visible: true
  },
  {
    name: 'Fees',
    path: '/fees',
    element: <Fees />,
    visible: true
  },
  {
    name: 'Admin Dashboard',
    path: '/admin',
    element: <AdminDashboard />,
    visible: true
  },
  {
    name: 'Login',
    path: '/login',
    element: <Login />,
    visible: false
  }
];

export default routes;