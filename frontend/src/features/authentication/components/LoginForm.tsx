'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, GraduationCap, Shield, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/components/providers/AppStateProvider';

const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: (user: any) => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, user } = useAuth();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Starting login process...');
      const loggedInUser = await login(data);
      console.log('Login successful, user:', loggedInUser);
      // Use the returned user from login instead of the context state
      onSuccess?.(loggedInUser);
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 xl:px-24">
        <div className="mx-auto max-w-lg">
          <div className="flex items-center space-x-3 mb-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <GraduationCap className="h-6 w-6" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Academy Admin
            </h1>
          </div>
          
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Manage Your Academy with Confidence
          </h2>
          
          <p className="text-lg text-muted-foreground mb-8">
            Streamline student management, track progress, and enhance educational outcomes with our comprehensive admin platform.
          </p>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-foreground">Student & Staff Management</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100">
                <Shield className="h-4 w-4 text-indigo-600" />
              </div>
              <span className="text-foreground">Role-Based Access Control</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                <GraduationCap className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-foreground">Curriculum & Progress Tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <GraduationCap className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Academy Admin
              </h1>
            </div>
          </div>
          
          <Card className="border-0 shadow-2xl dark:shadow-primary/10">
            <CardHeader className="space-y-1 text-center pb-8">
              <CardTitle className="text-2xl font-bold text-card-foreground">
                Welcome back
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to your account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 animate-in fade-in-0 slide-in-from-top-1">
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm font-medium text-card-foreground">
                    Username
                  </label>
                  <input
                    {...register('username')}
                    id="username"
                    type="text"
                    autoComplete="username"
                    className="w-full rounded-lg border border-input bg-background px-4 py-3 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-accent-foreground"
                    placeholder="Enter your username"
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive font-medium animate-in fade-in-0 slide-in-from-top-1">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-card-foreground">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      {...register('password')}
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="w-full rounded-lg border border-input bg-background px-4 py-3 pr-12 text-sm text-foreground placeholder-muted-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-accent-foreground"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive font-medium animate-in fade-in-0 slide-in-from-top-1">{errors.password.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </Button>
              </form>

              <div className="mt-8 p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-muted-foreground mb-3">Demo Credentials:</p>
                <div className="space-y-2 text-xs">
                  <div 
                    className="flex items-center justify-between p-2 bg-background rounded border border-border cursor-pointer hover:bg-primary/10 hover:border-primary/20 transition-colors"
                    onClick={() => {
                      setValue('username', 'admin@academy.com');
                      setValue('password', 'admin123');
                    }}
                  >
                    <span className="text-muted-foreground">Super Admin:</span>
                    <code className="text-primary font-mono">admin@academy.com / admin123</code>
                  </div>
                  <div 
                    className="flex items-center justify-between p-2 bg-background rounded border border-border cursor-pointer hover:bg-primary/10 hover:border-primary/20 transition-colors"
                    onClick={() => {
                      setValue('username', 'swim.admin@academy.com');
                      setValue('password', 'swim123');
                    }}
                  >
                    <span className="text-muted-foreground">Program Admin:</span>
                    <code className="text-primary font-mono">swim.admin@academy.com / swim123</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}