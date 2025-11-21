import { supabase } from './supabase';
import type { Student, Attendance, Fee, StudentFormData, AttendanceFormData, FeeFormData, DashboardStats } from '@/types';

export const studentsApi = {
  async getAll(): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('enrollment_date', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getByStudentId(studentId: string): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async create(student: StudentFormData): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .insert([student])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create student');
    return data;
  },

  async update(id: string, student: Partial<StudentFormData>): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .update(student)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to update student');
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async search(query: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .or(`full_name.ilike.%${query}%,student_id.ilike.%${query}%`)
      .order('full_name', { ascending: true });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async filterByGrade(grade: string): Promise<Student[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('grade_class', grade)
      .order('full_name', { ascending: true });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getCount(): Promise<number> {
    const { count, error } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
  }
};

export const attendanceApi = {
  async getAll(): Promise<Attendance[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('attendance_date', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByDate(date: string): Promise<Attendance[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('attendance_date', date)
      .order('id', { ascending: true });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getByStudentId(studentId: string): Promise<Attendance[]> {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .order('attendance_date', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(attendance: AttendanceFormData): Promise<Attendance> {
    const { data, error } = await supabase
      .from('attendance')
      .insert([attendance])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create attendance record');
    return data;
  },

  async upsert(attendance: AttendanceFormData): Promise<Attendance> {
    const { data, error } = await supabase
      .from('attendance')
      .upsert([attendance], { onConflict: 'student_id,attendance_date' })
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to upsert attendance record');
    return data;
  },

  async bulkUpsert(attendanceRecords: AttendanceFormData[]): Promise<Attendance[]> {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(attendanceRecords, { onConflict: 'student_id,attendance_date' })
      .select();
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getTodayStats(): Promise<{ present: number; absent: number }> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('attendance')
      .select('status')
      .eq('attendance_date', today);
    
    if (error) throw error;
    
    const records = Array.isArray(data) ? data : [];
    const present = records.filter(r => r.status === 'present' || r.status === 'late').length;
    const absent = records.filter(r => r.status === 'absent').length;
    
    return { present, absent };
  }
};

export const feesApi = {
  async getAll(): Promise<Fee[]> {
    const { data, error } = await supabase
      .from('fees')
      .select('*')
      .order('due_date', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async getById(id: string): Promise<Fee | null> {
    const { data, error } = await supabase
      .from('fees')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async getByStudentId(studentId: string): Promise<Fee[]> {
    const { data, error } = await supabase
      .from('fees')
      .select('*')
      .eq('student_id', studentId)
      .order('due_date', { ascending: false });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  async create(fee: FeeFormData): Promise<Fee> {
    const { data, error } = await supabase
      .from('fees')
      .insert([fee])
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to create fee record');
    return data;
  },

  async update(id: string, fee: Partial<FeeFormData>): Promise<Fee> {
    const { data, error } = await supabase
      .from('fees')
      .update(fee)
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to update fee record');
    return data;
  },

  async updatePayment(id: string, amountPaid: number, paymentDate: string): Promise<Fee> {
    const fee = await this.getById(id);
    if (!fee) throw new Error('Fee record not found');

    const totalPaid = amountPaid;
    const paymentStatus = totalPaid >= fee.amount_due ? 'paid' : 'pending';

    const { data, error } = await supabase
      .from('fees')
      .update({
        amount_paid: totalPaid,
        payment_status: paymentStatus,
        payment_date: paymentStatus === 'paid' ? paymentDate : null
      })
      .eq('id', id)
      .select()
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('Failed to update payment');
    return data;
  },

  async getStats(): Promise<{ totalDue: number; totalPaid: number; pending: number }> {
    const { data, error } = await supabase
      .from('fees')
      .select('amount_due, amount_paid, payment_status');
    
    if (error) throw error;
    
    const records = Array.isArray(data) ? data : [];
    const totalDue = records.reduce((sum, fee) => sum + Number(fee.amount_due), 0);
    const totalPaid = records.reduce((sum, fee) => sum + Number(fee.amount_paid), 0);
    const pending = records.filter(fee => fee.payment_status === 'pending' || fee.payment_status === 'overdue').length;
    
    return { totalDue, totalPaid, pending };
  },

  async filterByStatus(status: string): Promise<Fee[]> {
    const { data, error } = await supabase
      .from('fees')
      .select('*')
      .eq('payment_status', status)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  }
};

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const totalStudents = await studentsApi.getCount();
    const { present, absent } = await attendanceApi.getTodayStats();
    const { totalDue, totalPaid, pending } = await feesApi.getStats();

    return {
      totalStudents,
      presentToday: present,
      absentToday: absent,
      totalFeesDue: totalDue,
      totalFeesPaid: totalPaid,
      pendingPayments: pending
    };
  }
};
