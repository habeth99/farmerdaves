'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInUserWithContext, signInWithGoogle } from '../../utils/authService';

export default function Main() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Sign in user with Firebase Auth using member context
      const user = await signInUserWithContext(email, password, 'member');
      console.log('User signed in successfully:', user);
      
      // Redirect to dashboard after successful signin
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Signin error:', error);
      setError(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError('');

    try {
      const user = await signInWithGoogle();
      console.log('User signed in with Google successfully:', user);
      
      // Redirect to dashboard after successful signin
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Google signin error:', error);
      setError(error.message || 'Failed to sign in with Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-[var(--bg-primary)] dark:to-[var(--bg-accent)] p-4 sm:p-6 md:p-8">
      <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md border dark:border-[var(--border-color)]">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-green-800 dark:text-[var(--text-primary)] mb-2">
            Member Sign In
          </h1>
          <p className="text-sm sm:text-base text-green-600 dark:text-[var(--text-secondary)]">
            Welcome back to Farmer Dave's
          </p>
        </div>

        {/* Google Sign In Button */}
        <div className="mb-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
            className="w-full bg-white dark:bg-[var(--bg-primary)] border border-gray-300 dark:border-[var(--border-color)] hover:bg-gray-50 dark:hover:bg-[var(--bg-accent)] disabled:bg-gray-100 dark:disabled:bg-[var(--bg-accent)] disabled:cursor-not-allowed text-gray-700 dark:text-[var(--text-primary)] font-semibold py-3 px-4 rounded-md transition-colors duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Signing In...' : 'Sign in with Google'}
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-[var(--border-color)]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-[var(--bg-secondary)] text-gray-500 dark:text-[var(--text-secondary)]">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-[var(--bg-primary)] text-gray-900 dark:text-[var(--text-primary)] text-base min-h-[44px]"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-[var(--text-primary)] mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 dark:border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-[var(--bg-primary)] text-gray-900 dark:text-[var(--text-primary)] text-base min-h-[44px]"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full bg-green-600 hover:bg-green-700 dark:bg-[var(--color-borneo)] dark:hover:bg-[var(--color-pine)] disabled:bg-green-400 dark:disabled:bg-[var(--color-sage)] disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm sm:text-base text-gray-600 dark:text-[var(--text-secondary)]">
            Don't have an account?{' '}
            <Link href="/signup" className="text-green-600 dark:text-[var(--color-borneo)] hover:text-green-700 dark:hover:text-[var(--color-pine)] font-semibold">
              Sign Up
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link href="/user-selection" className="text-green-600 dark:text-[var(--color-borneo)] hover:text-green-700 dark:hover:text-[var(--color-pine)] text-sm inline-block py-2 px-4 rounded-md min-h-[44px] flex items-center justify-center">
            ← Back to User Selection
          </Link>
        </div>
      </div>
    </div>
  );
} 