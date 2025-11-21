import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { studentsApi } from '@/db/api';
import type { Student } from '@/types';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function StudentsList() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [sortField, setSortField] = useState<'full_name' | 'student_id' | 'enrollment_date'>('enrollment_date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const grades = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12'
  ];

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchQuery, selectedGrade, sortField, sortOrder]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await studentsApi.getAll();
      setStudents(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load students',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortStudents = () => {
    let filtered = [...students];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        student =>
          student.full_name.toLowerCase().includes(query) ||
          student.student_id.toLowerCase().includes(query)
      );
    }

    if (selectedGrade !== 'all') {
      filtered = filtered.filter(student => student.grade_class === selectedGrade);
    }

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredStudents(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field: 'full_name' | 'student_id' | 'enrollment_date') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="p-4 xl:p-8">
        <div className="mb-6 xl:mb-8">
          <h1 className="text-2xl xl:text-3xl font-bold text-foreground">Students List</h1>
          <p className="text-sm xl:text-base text-muted-foreground mt-1 xl:mt-2">View and manage student records</p>
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
        <h1 className="text-2xl xl:text-3xl font-bold text-foreground">Students List</h1>
        <p className="text-sm xl:text-base text-muted-foreground mt-1 xl:mt-2">View and manage student records</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Students ({filteredStudents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col xl:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-full xl:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by grade" />
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

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('student_id')}
                      className="flex items-center gap-1 p-0 h-auto font-semibold hover:bg-transparent"
                    >
                      Student ID
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('full_name')}
                      className="flex items-center gap-1 p-0 h-auto font-semibold hover:bg-transparent"
                    >
                      Full Name
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Grade/Class</TableHead>
                  <TableHead>Contact Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('enrollment_date')}
                      className="flex items-center gap-1 p-0 h-auto font-semibold hover:bg-transparent"
                    >
                      Enrollment Date
                      <ArrowUpDown className="h-4 w-4" />
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.student_id}</TableCell>
                      <TableCell>{student.full_name}</TableCell>
                      <TableCell>{student.grade_class}</TableCell>
                      <TableCell>{student.contact_number}</TableCell>
                      <TableCell>{student.email || '-'}</TableCell>
                      <TableCell>{new Date(student.enrollment_date).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
