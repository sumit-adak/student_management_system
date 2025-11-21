import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/db/supabase';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const validateUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    return usernameRegex.test(username);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (!validateUsername(formData.username)) {
      toast({
        title: 'Validation Error',
        description: 'Username can only contain letters, numbers, and underscores',
        variant: 'destructive'
      });
      return;
    }

    if (isSignUp && formData.password !== formData.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const email = `${formData.username}@miaoda.com`;

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: formData.password
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: 'Success',
            description: 'Account created successfully! You are now logged in.'
          });
          navigate('/');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: formData.password
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: 'Success',
            description: 'Logged in successfully!'
          });
          navigate('/');
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || `Failed to ${isSignUp ? 'sign up' : 'login'}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isSignUp 
              ? 'Sign up to access the Student Management System' 
              : 'Sign in to access the Student Management System'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={loading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Only letters, numbers, and underscores allowed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
                required
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setFormData({ username: '', password: '', confirmPassword: '' });
              }}
              className="text-primary hover:underline"
              disabled={loading}
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"}
            </button>
          </div>

          {isSignUp && (
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                ℹ️ The first registered user will automatically become an administrator
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
