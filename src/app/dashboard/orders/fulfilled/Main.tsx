'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, getSignInContext } from '../../../../utils/authService';
import { getFulfilledOrders, Order } from '../../../../utils/orderService';

export default function FulfilledOrdersMain() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount-high' | 'amount-low'>('newest');
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          router.push('/signin');
          return;
        }

        const context = getSignInContext();
        if (context !== 'admin') {
          router.push('/dashboard');
          return;
        }

        setUser(currentUser);
        loadFulfilledOrders();
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/signin');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const loadFulfilledOrders = async () => {
    try {
      setOrdersLoading(true);
      const fulfilledOrders = await getFulfilledOrders();
      setOrders(fulfilledOrders);
    } catch (error) {
      console.error('Error loading fulfilled orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const getStatusConfig = (status: Order['status']) => {
    return { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', text: 'Fulfilled' };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAndSortedOrders = orders
    .filter(order => 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0);
        case 'oldest':
          return (a.updatedAt?.getTime() || 0) - (b.updatedAt?.getTime() || 0);
        case 'amount-high':
          return b.totalAmount - a.totalAmount;
        case 'amount-low':
          return a.totalAmount - b.totalAmount;
        default:
          return 0;
      }
    });

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[var(--color-borneo)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
                Fulfilled Orders to Date
              </h1>
              <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)]">
                Complete history of all fulfilled orders
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/orders"
                className="bg-[var(--color-sage)] hover:bg-[var(--color-pine)] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Orders
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[var(--color-box)] dark:text-[var(--text-secondary)]">Total Fulfilled</p>
                <p className="text-2xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">{totalOrders}</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6">
            <div className="flex items-center">
              <div className="p-2 bg-[var(--color-sage)]/20 rounded-lg">
                <svg className="w-6 h-6 text-[var(--color-sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[var(--color-box)] dark:text-[var(--text-secondary)]">Total Revenue</p>
                <p className="text-2xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">${totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[var(--color-box)] dark:text-[var(--text-secondary)]">Average Order</p>
                <p className="text-2xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
                  ${totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search orders by customer name, email, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-[var(--color-sage)]/40 rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)]"
              />
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-[var(--color-sage)]/40 rounded-lg bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)]"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount-high">Highest Amount</option>
                <option value="amount-low">Lowest Amount</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-sage)]/30 dark:border-[var(--border-color)]">
            <h2 className="text-xl font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
              Fulfilled Orders ({filteredAndSortedOrders.length})
            </h2>
          </div>

          {ordersLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-borneo)] mx-auto"></div>
              <p className="mt-2 text-[var(--color-box)] dark:text-[var(--text-secondary)]">Loading fulfilled orders...</p>
            </div>
          ) : filteredAndSortedOrders.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-sage)]/10 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[var(--color-sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
                {searchTerm ? 'No Matching Orders' : 'No Fulfilled Orders Yet'}
              </h3>
              <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)]">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Fulfilled orders will appear here once orders are completed.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-sage)]/30 dark:divide-[var(--border-color)]">
              {filteredAndSortedOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                
                return (
                  <div key={order.id} className="p-6 hover:bg-[var(--color-sage)]/5 dark:hover:bg-[var(--bg-accent)] transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
                            {order.customerName}
                          </h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            {statusConfig.text}
                          </span>
                        </div>
                        
                        <p className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)] mb-1">
                          {order.customerEmail} • {order.customerPhone}
                        </p>
                        
                        <p className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)] mb-3">
                          {order.customerAddress}
                        </p>
                        
                        <div className="space-y-1 mb-3">
                          {order.items.map((item, index) => (
                            <div key={index} className="text-sm text-[var(--color-pine)] dark:text-[var(--text-secondary)]">
                              {item.quantity}x {item.itemName} ({item.size} ft) - ${item.subtotal.toFixed(2)}
                            </div>
                          ))}
                        </div>

                        {order.description && (
                          <p className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)] italic">
                            "{order.description}"
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-lg font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
                          ${order.totalAmount.toFixed(2)}
                        </div>
                        <div className="text-xs text-[var(--color-box)] dark:text-[var(--text-secondary)]">
                          Fulfilled: {order.updatedAt ? formatDate(order.updatedAt) : 'Unknown'}
                        </div>
                        <div className="text-xs text-[var(--color-box)] dark:text-[var(--text-secondary)] mt-1">
                          Order #{order.id?.slice(-8) || 'New'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 