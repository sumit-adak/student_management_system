/*
# Create Student Information Management System Tables

## 1. New Tables

### students
- `id` (uuid, primary key, default: gen_random_uuid())
- `student_id` (text, unique, not null) - Student identification number
- `full_name` (text, not null) - Student's full name
- `date_of_birth` (date, not null) - Student's date of birth
- `grade_class` (text, not null) - Grade/Class information
- `contact_number` (text, not null) - Student's contact number
- `email` (text) - Student's email address
- `address` (text) - Home address
- `guardian_name` (text) - Guardian's name
- `guardian_contact` (text) - Guardian's contact number
- `enrollment_date` (date, not null, default: current_date) - Date of enrollment
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

### attendance
- `id` (uuid, primary key, default: gen_random_uuid())
- `student_id` (uuid, references students.id, not null)
- `attendance_date` (date, not null) - Date of attendance record
- `status` (text, not null) - Attendance status: present, absent, late, excused
- `notes` (text) - Additional notes
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())
- Unique constraint on (student_id, attendance_date)

### fees
- `id` (uuid, primary key, default: gen_random_uuid())
- `student_id` (uuid, references students.id, not null)
- `fee_type` (text, not null) - Type of fee: Tuition, Library, Sports, etc.
- `amount_due` (numeric(10,2), not null) - Total amount due
- `amount_paid` (numeric(10,2), default: 0) - Amount paid
- `payment_status` (text, not null) - Status: paid, pending, overdue
- `due_date` (date, not null) - Payment due date
- `payment_date` (date) - Date of payment
- `created_at` (timestamptz, default: now())
- `updated_at` (timestamptz, default: now())

## 2. Security
- No RLS enabled - This is a tool application where all users need full access to manage student data
- All tables are publicly accessible for CRUD operations

## 3. Indexes
- Index on students.student_id for fast lookups
- Index on attendance.attendance_date for date-based queries
- Index on fees.payment_status for filtering
- Index on fees.due_date for sorting

## 4. Notes
- All monetary values use numeric(10,2) for precision
- Timestamps use timestamptz for timezone awareness
- Unique constraint on attendance prevents duplicate records for same student on same date
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  date_of_birth date NOT NULL,
  grade_class text NOT NULL,
  contact_number text NOT NULL,
  email text,
  address text,
  guardian_name text,
  guardian_contact text,
  enrollment_date date NOT NULL DEFAULT current_date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  attendance_date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(student_id, attendance_date)
);

-- Create fees table
CREATE TABLE IF NOT EXISTS fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_type text NOT NULL,
  amount_due numeric(10,2) NOT NULL,
  amount_paid numeric(10,2) DEFAULT 0,
  payment_status text NOT NULL CHECK (payment_status IN ('paid', 'pending', 'overdue')),
  due_date date NOT NULL,
  payment_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_students_grade_class ON students(grade_class);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_payment_status ON fees(payment_status);
CREATE INDEX IF NOT EXISTS idx_fees_due_date ON fees(due_date);
CREATE INDEX IF NOT EXISTS idx_fees_student_id ON fees(student_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fees_updated_at BEFORE UPDATE ON fees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();