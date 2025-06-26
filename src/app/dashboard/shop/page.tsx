'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getSignInContext } from '../../../utils/authService';

export default function ShopPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          // User not authenticated, redirect to signin
          router.push('/signin');
          return;
        }

        setUserEmail(user.email);

        // Check if user signed in through admin portal - they should not see the shop
        const context = getSignInContext();
        if (context === 'admin') {
          router.push('/dashboard');
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/signin');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-stone)] dark:bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--color-borneo)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--color-pine)] dark:text-[var(--text-secondary)]">Loading shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-stone)] dark:bg-[var(--bg-primary)] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">Shop</h1>
          <p className="text-[var(--color-pine)] dark:text-[var(--text-secondary)]">Browse available products</p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-lg shadow-md p-8 dark:border dark:border-[var(--border-color)]">
          <div className="text-center">
            <div className="mb-6">
              <svg 
                className="w-24 h-24 mx-auto text-[var(--color-pine)] dark:text-[var(--text-secondary)] opacity-50" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1} 
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-4">
              Coming Soon!
            </h2>
            <p className="text-[var(--color-pine)] dark:text-[var(--text-secondary)] text-lg">
              Nothing to shop for yet
            </p>
            <p className="text-[var(--color-pine)] dark:text-[var(--text-secondary)] mt-2">
              Check back later for new products and items from Farmer Dave's!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 