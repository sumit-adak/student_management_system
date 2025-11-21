import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { studentsApi, feesApi } from '@/db/api';
import type { Fee, Student } from '@/types';
import { Search, Filter, DollarSign, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

export default function Fees() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredFees, setFilteredFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const [newFee, setNewFee] = useState({
    student_id: '',
    fee_type: '',
    amount_due: '',
    due_date: ''
  });

  const [payment, setPayment] = useState({
    amount_paid: '',
    payment_date: new Date().toISOString().split('T')[0]
  });

  const feeTypes = ['Tuition', 'Library', 'Sports', 'Laboratory', 'Transportation', 'Other'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterFees();
  }, [fees, searchQuery, selectedStatus]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [feesData, studentsData] = await Promise.all([
        feesApi.getAll(),
        studentsApi.getAll()
      ]);
      setFees(feesData);
      setStudents(studentsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load fees data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterFees = () => {
    let filtered = [...fees];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(fee => {
        const student = students.find(s => s.id === fee.student_id);
        return (
          student?.full_name.toLowerCase().includes(query) ||
          student?.student_id.toLowerCase().includes(query)
        );
      });
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(fee => fee.payment_status === selectedStatus);
    }

    setFilteredFees(filtered);
    setCurrentPage(1);
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.full_name || 'Unknown';
  };

  const getStudentId = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.student_id || 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', className: string }> = {
      paid: { variant: 'default', className: 'bg-[hsl(var(--success))] hover:bg-[hsl(var(--success))]/90' },
      pending: { variant: 'secondary', className: 'bg-[hsl(var(--warning))] hover:bg-[hsl(var(--warning))]/90 text-white' },
      overdue: { variant: 'destructive', className: '' }
    };
    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleAddFee = async () => {
    if (!newFee.student_id || !newFee.fee_type || !newFee.amount_due || !newFee.due_date) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    try {
      await feesApi.create({
        student_id: newFee.student_id,
        fee_type: newFee.fee_type,
        amount_due: Number.parseFloat(newFee.amount_due),
        amount_paid: 0,
        payment_status: 'pending',
        due_date: newFee.due_date
      });

      toast({
        title: 'Success',
        description: 'Fee record added successfully'
      });

      setIsAddDialogOpen(false);
      setNewFee({ student_id: '', fee_type: '', amount_due: '', due_date: '' });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add fee record',
        variant: 'destructive'
      });
    }
  };

  const handleUpdatePayment = async () => {
    if (!selectedFee || !payment.amount_paid) {
      toast({
        title: 'Validation Error',
        description: 'Please enter payment amount',
        variant: 'destructive'
      });
      return;
    }

    try {
      await feesApi.updatePayment(
        selectedFee.id,
        Number.parseFloat(payment.amount_paid),
        payment.payment_date
      );

      toast({
        title: 'Success',
        description: 'Payment updated successfully'
      });

      setIsPaymentDialogOpen(false);
      setSelectedFee(null);
      setPayment({ amount_paid: '', payment_date: new Date().toISOString().split('T')[0] });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update payment',
        variant: 'destructive'
      });
    }
  };

  const openPaymentDialog = (fee: Fee) => {
    setSelectedFee(fee);
    setPayment({
      amount_paid: fee.amount_paid.toString(),
      payment_date: fee.payment_date || new Date().toISOString().split('T')[0]
    });
    setIsPaymentDialogOpen(true);
  };

  const totalPages = Math.ceil(filteredFees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFees = filteredFees.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="p-4 xl:p-8">
        <div className="mb-6 xl:mb-8">
          <h1 className="text-2xl xl:text-3xl font-bold text-foreground">Fee Management</h1>
          <p className="text-sm xl:text-base text-muted-foreground mt-1 xl:mt-2">Track and manage student fee payments</p>
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
      <div className="mb-6 xl:mb-8 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl xl:text-3xl font-bold text-foreground">Fee Management</h1>
          <p className="text-sm xl:text-base text-muted-foreground mt-1 xl:mt-2">Track and manage student fee payments</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Fee Record
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Fee Record</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student</Label>
                <Select value={newFee.student_id} onValueChange={(value) => setNewFee({ ...newFee, student_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.student_id} - {student.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fee_type">Fee Type</Label>
                <Select value={newFee.fee_type} onValueChange={(value) => setNewFee({ ...newFee, fee_type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee type" />
                  </SelectTrigger>
                  <SelectContent>
                    {feeTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount_due">Amount Due</Label>
                <Input
                  id="amount_due"
                  type="number"
                  step="0.01"
                  value={newFee.amount_due}
                  onChange={(e) => setNewFee({ ...newFee, amount_due: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={newFee.due_date}
                  onChange={(e) => setNewFee({ ...newFee, due_date: e.target.value })}
                />
              </div>

              <Button onClick={handleAddFee} className="w-full">Add Fee Record</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Records ({filteredFees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col xl:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full xl:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Amount Due</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentFees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No fee records found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentFees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium">{getStudentId(fee.student_id)}</TableCell>
                      <TableCell>{getStudentName(fee.student_id)}</TableCell>
                      <TableCell>{fee.fee_type}</TableCell>
                      <TableCell>${fee.amount_due.toFixed(2)}</TableCell>
                      <TableCell>${fee.amount_paid.toFixed(2)}</TableCell>
                      <TableCell>{getStatusBadge(fee.payment_status)}</TableCell>
                      <TableCell>{new Date(fee.due_date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openPaymentDialog(fee)}
                        >
                          <DollarSign className="h-4 w-4 mr-1" />
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredFees.length)} of {filteredFees.length} records
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

      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment</DialogTitle>
          </DialogHeader>
          {selectedFee && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <p className="text-sm font-medium">{getStudentName(selectedFee.student_id)}</p>
              </div>

              <div className="space-y-2">
                <Label>Fee Type</Label>
                <p className="text-sm font-medium">{selectedFee.fee_type}</p>
              </div>

              <div className="space-y-2">
                <Label>Amount Due</Label>
                <p className="text-sm font-medium">${selectedFee.amount_due.toFixed(2)}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount_paid">Amount Paid</Label>
                <Input
                  id="amount_paid"
                  type="number"
                  step="0.01"
                  value={payment.amount_paid}
                  onChange={(e) => setPayment({ ...payment, amount_paid: e.target.value })}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_date">Payment Date</Label>
                <Input
                  id="payment_date"
                  type="date"
                  value={payment.payment_date}
                  onChange={(e) => setPayment({ ...payment, payment_date: e.target.value })}
                />
              </div>

              <Button onClick={handleUpdatePayment} className="w-full">Update Payment</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
