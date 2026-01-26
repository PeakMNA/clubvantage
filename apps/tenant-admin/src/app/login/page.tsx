'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, Settings } from 'lucide-react';
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@clubvantage/ui';
import { useAuth } from '@clubvantage/api-client';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isLoading: isAuthLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = await signIn({ email, password });

      // Check if user has tenant admin role
      if (user.role !== 'TENANT_ADMIN') {
        setError('You do not have club administration access.');
        return;
      }

      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = isSubmitting || isAuthLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-stone-900 dark:via-amber-950/20 dark:to-stone-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25 mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
            Club Administration
          </h1>
          <p className="text-stone-600 dark:text-stone-400 mt-1">
            Configure and manage your club settings
          </p>
        </div>

        <Card className="border-amber-200/50 dark:border-amber-900/20 shadow-xl bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Administrator Login</CardTitle>
            <CardDescription>
              Sign in with your admin credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@yourclub.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    disabled={isLoading}
                    className="h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Access Admin Panel'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
          Only club administrators can access this portal
        </p>
      </div>
    </div>
  );
}
