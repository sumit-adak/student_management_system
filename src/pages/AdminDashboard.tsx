import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { profilesApi } from '@/db/api';
import type { Profile } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Shield, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profilesData, currentProfile] = await Promise.all([
        profilesApi.getAll(),
        profilesApi.getCurrentProfile()
      ]);
      setProfiles(profilesData);
      setCurrentUser(currentProfile);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load user data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await profilesApi.updateRole(userId, newRole);
      toast({
        title: 'Success',
        description: 'User role updated successfully'
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role',
        variant: 'destructive'
      });
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <Badge className="bg-primary">
          <Shield className="h-3 w-3 mr-1" />
          Admin
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <Users className="h-3 w-3 mr-1" />
        User
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-4 xl:p-8">
        <div className="mb-6 xl:mb-8">
          <h1 className="text-2xl xl:text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-sm xl:text-base text-muted-foreground mt-1 xl:mt-2">Manage users and roles</p>
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
        <h1 className="text-2xl xl:text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm xl:text-base text-muted-foreground mt-1 xl:mt-2">Manage users and roles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management ({profiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">
                        {profile.username || '-'}
                        {profile.id === currentUser?.id && (
                          <Badge variant="outline" className="ml-2">You</Badge>
                        )}
                      </TableCell>
                      <TableCell>{profile.email || '-'}</TableCell>
                      <TableCell>{profile.phone || '-'}</TableCell>
                      <TableCell>{getRoleBadge(profile.role)}</TableCell>
                      <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {profile.id === currentUser?.id ? (
                          <span className="text-sm text-muted-foreground">Current User</span>
                        ) : (
                          <Select
                            value={profile.role}
                            onValueChange={(value: 'user' | 'admin') => handleRoleChange(profile.id, value)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-2xl font-bold">{profiles.length}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Administrators</p>
              <p className="text-2xl font-bold">{profiles.filter(p => p.role === 'admin').length}</p>
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Regular Users</p>
              <p className="text-2xl font-bold">{profiles.filter(p => p.role === 'user').length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
