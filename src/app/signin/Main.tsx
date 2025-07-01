'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInUserWithContext } from '../../utils/authService';

export default function Main() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
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
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 dark:bg-[var(--color-borneo)] dark:hover:bg-[var(--color-pine)] disabled:bg-green-400 dark:disabled:bg-[var(--color-sage)] disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200 shadow-lg hover:shadow-xl min-h-[44px] text-base"
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