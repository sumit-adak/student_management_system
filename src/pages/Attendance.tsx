import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { studentsApi, attendanceApi } from '@/db/api';
import type { Student, AttendanceFormData } from '@/types';
import { Calendar, Filter, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Attendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, string>>(new Map());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const grades = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12'
  ];

  const statusOptions = [
    { value: 'present', label: 'Present', color: 'text-[hsl(var(--success))]' },
    { value: 'absent', label: 'Absent', color: 'text-destructive' },
    { value: 'late', label: 'Late', color: 'text-[hsl(var(--warning))]' },
    { value: 'excused', label: 'Excused', color: 'text-muted-foreground' }
  ];

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  useEffect(() => {
    filterStudents();
  }, [students, selectedGrade]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, attendanceData] = await Promise.all([
        studentsApi.getAll(),
        attendanceApi.getByDate(selectedDate)
      ]);

      setStudents(studentsData);

      const recordsMap = new Map<string, string>();
      attendanceData.forEach(record => {
        recordsMap.set(record.student_id, record.status);
      });
      setAttendanceRecords(recordsMap);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load attendance data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (selectedGrade === 'all') {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(students.filter(s => s.grade_class === selectedGrade));
    }
  };

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendanceRecords(prev => {
      const newMap = new Map(prev);
      newMap.set(studentId, status);
      return newMap;
    });
  };

  const handleBulkMark = (status: string) => {
    const newMap = new Map(attendanceRecords);
    filteredStudents.forEach(student => {
      newMap.set(student.id, status);
    });
    setAttendanceRecords(newMap);
    toast({
      title: 'Success',
      description: `Marked all visible students as ${status}`
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const records: AttendanceFormData[] = [];

      attendanceRecords.forEach((status, studentId) => {
        records.push({
          student_id: studentId,
          attendance_date: selectedDate,
          status: status as 'present' | 'absent' | 'late' | 'excused'
        });
      });

      if (records.length === 0) {
        toast({
          title: 'Warning',
          description: 'No attendance records to save',
          variant: 'destructive'
        });
        return;
      }

      await attendanceApi.bulkUpsert(records);
      toast({
        title: 'Success',
        description: 'Attendance saved successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save attendance',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || '';
  };

  if (loading) {
    return (
      <div className="p-4 xl:p-8">
        <div className="mb-6 xl:mb-8">
          <h1 className="text-2xl xl:text-3xl font-bold text-foreground">Attendance</h1>
          <p className="text-sm xl:text-base text-muted-foreground mt-1 xl:mt-2">Record and manage student attendance</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 xl:p-8">
      <div className="mb-6 xl:mb-8">
        <h1 className="text-2xl xl:text-3xl font-bold text-foreground">Attendance</h1>
        <p className="text-sm xl:text-base text-muted-foreground mt-1 xl:mt-2">Record and manage student attendance</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Attendance Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="grade">Filter by Grade</Label>
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6">
            <Label className="mb-2 block">Bulk Mark Attendance</Label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="outline"
                  onClick={() => handleBulkMark(option.value)}
                  className="flex-1 xl:flex-none"
                >
                  Mark All as {option.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Student Attendance ({filteredStudents.length})</CardTitle>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Grade/Class</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => {
                    const status = attendanceRecords.get(student.id) || '';
                    return (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.student_id}</TableCell>
                        <TableCell>{student.full_name}</TableCell>
                        <TableCell>{student.grade_class}</TableCell>
                        <TableCell>
                          <Select
                            value={status}
                            onValueChange={(value) => handleStatusChange(student.id, value)}
                          >
                            <SelectTrigger className={`w-[140px] ${getStatusColor(status)}`}>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <span className={option.color}>{option.label}</span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
