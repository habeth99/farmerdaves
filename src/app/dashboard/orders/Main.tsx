'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getSignInContext } from '../../../utils/authService';
import OrderStats from '../../../components/OrderStats';
import RecentOrders from '../../../components/RecentOrders';
import Link from 'next/link';

export default function OrdersMain() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/signin');
          return;
        }

        const context = getSignInContext();
        if (context !== 'admin') {
          router.push('/dashboard');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/signin');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--color-borneo)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--color-pine)] dark:text-[var(--text-secondary)]">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-4 pr-4 pb-4 pl-3 sm:pt-6 sm:pr-6 sm:pb-6 sm:pl-4 md:pt-8 md:pr-8 md:pb-8 md:pl-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
              Orders Management
            </h1>
            <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)] mt-2">
              Monitor customer orders, track fulfillment, and analyze sales performance.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="bg-[var(--color-borneo)]/10 text-[var(--color-borneo)] dark:bg-[var(--color-borneo)]/20 dark:text-[var(--color-borneo)] px-3 py-1 rounded-full text-xs font-medium">
              Administrator
            </span>
            <div className="flex gap-2">
                <Link
                  href="/dashboard/orders/new"
                  className="bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                >
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create Order
                </Link>
                <Link
                  href="/dashboard/orders/fulfilled"
                  className="bg-[var(--color-sage)] hover:bg-[var(--color-pine)] text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                >
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Fulfilled Orders
                </Link>
                <button className="bg-[var(--color-pine)] hover:bg-[var(--color-borneo)] text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Orders
                </button>
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('ordersUpdated'))}
                  className="bg-[var(--color-box)] dark:bg-[var(--text-secondary)] hover:bg-[var(--color-pine)] dark:hover:bg-[var(--color-sage)] text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 flex items-center"
                >
                  <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
          </div>
        </div>

        {/* Order Statistics */}
        <OrderStats />

        {/* Recent Orders */}
        <RecentOrders />
      </div>
    </div>
  );
} 