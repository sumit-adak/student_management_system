export interface Option {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
  withCount?: boolean;
}

export interface Student {
  id: string;
  student_id: string;
  full_name: string;
  date_of_birth: string;
  grade_class: string;
  contact_number: string;
  email: string | null;
  address: string | null;
  guardian_name: string | null;
  guardian_contact: string | null;
  enrollment_date: string;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Fee {
  id: string;
  student_id: string;
  fee_type: string;
  amount_due: number;
  amount_paid: number;
  payment_status: 'paid' | 'pending' | 'overdue';
  due_date: string;
  payment_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentFormData {
  student_id: string;
  full_name: string;
  date_of_birth: string;
  grade_class: string;
  contact_number: string;
  email?: string;
  address?: string;
  guardian_name?: string;
  guardian_contact?: string;
  enrollment_date: string;
}

export interface AttendanceFormData {
  student_id: string;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export interface FeeFormData {
  student_id: string;
  fee_type: string;
  amount_due: number;
  amount_paid: number;
  payment_status: 'paid' | 'pending' | 'overdue';
  due_date: string;
  payment_date?: string;
}

export interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  totalFeesDue: number;
  totalFeesPaid: number;
  pendingPayments: number;
}

export interface AttendanceWithStudent extends Attendance {
  student?: Student;
}

export interface FeeWithStudent extends Fee {
  student?: Student;
}

export interface Profile {
  id: string;
  username: string | null;
  phone: string | null;
  email: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}
