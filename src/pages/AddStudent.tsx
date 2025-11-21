import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { studentsApi } from '@/db/api';
import { useToast } from '@/hooks/use-toast';
import type { StudentFormData } from '@/types';

export default function AddStudent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<StudentFormData>({
    student_id: '',
    full_name: '',
    date_of_birth: '',
    grade_class: '',
    contact_number: '',
    email: '',
    address: '',
    guardian_name: '',
    guardian_contact: '',
    enrollment_date: new Date().toISOString().split('T')[0]
  });

  const grades = [
    'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
    'Grade 11', 'Grade 12'
  ];

  const handleChange = (field: keyof StudentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.student_id || !formData.full_name || !formData.date_of_birth || 
        !formData.grade_class || !formData.contact_number) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const existing = await studentsApi.getByStudentId(formData.student_id);
      if (existing) {
        toast({
          title: 'Error',
          description: 'Student ID already exists',
          variant: 'destructive'
        });
        return;
      }

      await studentsApi.create(formData);
      toast({
        title: 'Success',
        description: 'Student added successfully'
      });
      navigate('/students');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add student',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      student_id: '',
      full_name: '',
      date_of_birth: '',
      grade_class: '',
      contact_number: '',
      email: '',
      address: '',
      guardian_name: '',
      guardian_contact: '',
      enrollment_date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="p-4 xl:p-8">
      <div className="mb-6 xl:mb-8">
        <h1 className="text-2xl xl:text-3xl font-bold text-foreground">Add New Student</h1>
        <p className="text-sm xl:text-base text-muted-foreground mt-1 xl:mt-2">Register a new student in the system</p>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID <span className="text-destructive">*</span></Label>
                <Input
                  id="student_id"
                  value={formData.student_id}
                  onChange={(e) => handleChange('student_id', e.target.value)}
                  placeholder="Enter student ID"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name <span className="text-destructive">*</span></Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth <span className="text-destructive">*</span></Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grade_class">Grade/Class <span className="text-destructive">*</span></Label>
                <Select value={formData.grade_class} onValueChange={(value) => handleChange('grade_class', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_number">Contact Number <span className="text-destructive">*</span></Label>
                <Input
                  id="contact_number"
                  type="tel"
                  value={formData.contact_number}
                  onChange={(e) => handleChange('contact_number', e.target.value)}
                  placeholder="Enter contact number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2 xl:col-span-2">
                <Label htmlFor="address">Home Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Enter home address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian_name">Guardian Name</Label>
                <Input
                  id="guardian_name"
                  value={formData.guardian_name}
                  onChange={(e) => handleChange('guardian_name', e.target.value)}
                  placeholder="Enter guardian name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="guardian_contact">Guardian Contact Number</Label>
                <Input
                  id="guardian_contact"
                  type="tel"
                  value={formData.guardian_contact}
                  onChange={(e) => handleChange('guardian_contact', e.target.value)}
                  placeholder="Enter guardian contact"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enrollment_date">Enrollment Date <span className="text-destructive">*</span></Label>
                <Input
                  id="enrollment_date"
                  type="date"
                  value={formData.enrollment_date}
                  onChange={(e) => handleChange('enrollment_date', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1 xl:flex-none">
                {loading ? 'Submitting...' : 'Submit'}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
