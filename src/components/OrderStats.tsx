'use client';

import { useState, useEffect } from 'react';
import { getOrderStats, OrderStats as OrderStatsType, getTodayFulfilledOrdersCount } from '../utils/orderService';

export default function OrderStats() {
  const [stats, setStats] = useState<OrderStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [todayFulfilledCount, setTodayFulfilledCount] = useState<number>(0);

  useEffect(() => {
    loadStats();
    loadTodayFulfilled();
  }, []);

  const loadStats = async () => {
    try {
      const orderStats = await getOrderStats();
      setStats(orderStats);
    } catch (error) {
      console.error('Error loading order stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTodayFulfilled = async () => {
    try {
      const count = await getTodayFulfilledOrdersCount();
      setTodayFulfilledCount(count);
    } catch (error) {
      console.error('Error loading today fulfilled orders:', error);
    }
  };

  // Refresh stats when component mounts or when orders might have changed
  useEffect(() => {
    const handleStorageChange = () => {
      loadStats();
      loadTodayFulfilled();
    };

    // Listen for storage changes (when orders are modified)
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for a custom event we'll dispatch when orders change
    window.addEventListener('ordersUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('ordersUpdated', handleStorageChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-[var(--color-sage)]/20 rounded mb-3"></div>
              <div className="h-8 bg-[var(--color-sage)]/20 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* Orders Today */}
      <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6">
        <div className="flex items-center mb-3">
          <div className="p-2 rounded-full bg-[var(--color-borneo)] bg-opacity-10 mr-3">
            <svg className="w-5 h-5 text-[var(--color-borneo)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-[var(--color-box)] dark:text-[var(--text-secondary)]">Today</h3>
        </div>
        <p className="text-2xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
          {stats.ordersToday}
        </p>
        <p className="text-sm text-[var(--color-pine)] dark:text-[var(--text-secondary)]">orders</p>
      </div>

      {/* Orders This Month */}
      <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6">
        <div className="flex items-center mb-3">
          <div className="p-2 rounded-full bg-[var(--color-sage)] bg-opacity-10 mr-3">
            <svg className="w-5 h-5 text-[var(--color-sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-[var(--color-box)] dark:text-[var(--text-secondary)]">This Month</h3>
        </div>
        <p className="text-2xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
          {stats.ordersThisMonth}
        </p>
        <p className="text-sm text-[var(--color-pine)] dark:text-[var(--text-secondary)]">orders</p>
      </div>

      {/* Unfulfilled Orders */}
      <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6">
        <div className="flex items-center mb-3">
          <div className="p-2 rounded-full bg-orange-500 bg-opacity-10 mr-3">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-[var(--color-box)] dark:text-[var(--text-secondary)]">Pending</h3>
        </div>
        <p className="text-2xl font-bold text-orange-500">
          {stats.unfulfilledOrders}
        </p>
        <p className="text-sm text-[var(--color-pine)] dark:text-[var(--text-secondary)]">unfulfilled</p>
      </div>

      {/* Today's Fulfilled Orders */}
      <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6">
        <div className="flex items-center mb-3">
          <div className="p-2 rounded-full bg-green-500 bg-opacity-10 mr-3">
            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-[var(--color-box)] dark:text-[var(--text-secondary)]">Fulfilled Orders</h3>
        </div>
        <p className="text-2xl font-bold text-green-500">
          {todayFulfilledCount}
        </p>
        <p className="text-sm text-[var(--color-pine)] dark:text-[var(--text-secondary)]">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </p>
      </div>
    </div>
  );
} 