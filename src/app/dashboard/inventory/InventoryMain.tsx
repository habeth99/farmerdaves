'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Item } from '../../../../models/item';
import { getAllItems, deleteItem } from '../../../utils/itemService';
import { getCurrentUser, getSignInContext } from '../../../utils/authService';
import { getTodayOrders } from '../../../utils/orderService';
import { Order } from '../../../../models/order';

interface InventoryMainProps {
  initialItems: Item[];
  initialError: string | null;
}

export default function InventoryMain({ initialItems, initialError }: InventoryMainProps) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [todayOrders, setTodayOrders] = useState<Order[]>([]);
  const router = useRouter();

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    
    const searchLower = searchTerm.toLowerCase();
    return items.filter(item => 
      item.name.toLowerCase().includes(searchLower) ||
      (item.description && item.description.toLowerCase().includes(searchLower)) ||
      item.size.toString().includes(searchLower) ||
      item.price.toString().includes(searchLower) ||
      item.quantity.toString().includes(searchLower)
    );
  }, [items, searchTerm]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/signin');
          return;
        }
        
        const context = getSignInContext();
        setIsAdmin(context === 'admin');
        
        // Fetch today's orders
        await fetchTodayOrders();
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/signin');
      }
    };

    checkAuth();
  }, [router]);

  const fetchTodayOrders = async () => {
    try {
      const orders = await getTodayOrders();
      setTodayOrders(orders);
    } catch (error) {
      console.error('Error fetching today orders:', error);
      // Don't set error state for orders, just log it
    }
  };

  const refreshItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const updatedItems = await getAllItems();
      setItems(updatedItems);
      await fetchTodayOrders(); // Also refresh today's orders
    } catch (err) {
      console.error('Error refreshing items:', err);
      setError('Failed to refresh inventory items');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    try {
      await deleteItem(itemId);
      setItems(items.filter(item => item.id !== itemId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] pt-4 pr-4 pb-4 pl-3 sm:pt-6 sm:pr-6 sm:pb-6 sm:pl-4 md:pt-8 md:pr-8 md:pb-8 md:pl-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mt-2 sm:mt-1">
              Inventory Management
            </h1>
          </div>
          
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-3 lg:items-center">
            {/* Discrete Search Bar */}
            <div className="relative w-full sm:w-auto sm:min-w-[300px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-[var(--color-box)] dark:text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-9 pr-8 py-2 text-sm border border-[var(--color-sage)]/70 dark:border-[var(--border-color)] hover:border-[var(--color-pine)] dark:hover:border-[var(--border-color)] rounded-lg bg-white dark:bg-[var(--bg-primary)] text-[var(--color-borneo)] dark:text-[var(--text-primary)] placeholder-[var(--color-box)] dark:placeholder-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-borneo)] focus:border-transparent transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-box)] dark:text-[var(--text-secondary)] hover:text-[var(--color-borneo)] dark:hover:text-[var(--text-primary)]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {isAdmin && (
              <div className="flex flex-row gap-2">
                <button
                  onClick={refreshItems}
                  disabled={loading}
                  className="bg-[var(--color-sage)] hover:bg-[var(--color-pine)] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 flex items-center justify-center border border-transparent"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </>
                  )}
                </button>
                <Link href="/dashboard/inventory/new-item">
                  <button className="bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center whitespace-nowrap border border-transparent">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add New Item
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] p-4 sm:p-6 rounded-lg shadow-md dark:border dark:border-[var(--border-color)]">
            <div className="flex items-center mb-2">
              <p className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)] mr-2">Low Stock</p>
              <svg className="w-5 h-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
              {items.filter(item => item.quantity <= 5).length}
            </p>
          </div>

          <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] p-4 sm:p-6 rounded-lg shadow-md dark:border dark:border-[var(--border-color)]">
            <div className="flex items-center mb-2">
              <p className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)] mr-2">Total Inventory</p>
              <svg className="w-5 h-5 text-[var(--color-sage)] dark:text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
              {items.reduce((sum, item) => sum + item.quantity, 0)} items
            </p>
          </div>

          <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] p-4 sm:p-6 rounded-lg shadow-md dark:border dark:border-[var(--border-color)]">
            <div className="flex items-center mb-2">
              <p className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)] mr-2">Orders Today</p>
              <svg className="w-5 h-5 text-[var(--color-borneo)] dark:text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
              {todayOrders.length}
            </p>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-md border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] overflow-hidden">
          <div className="px-6 py-4 border-b border-[var(--color-sage)]/30 dark:border-[var(--border-color)]">
            <h2 className="text-xl font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
              {searchTerm ? `Search Results (${filteredItems.length})` : 'Inventory Items'}
            </h2>
          </div>
          
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-sage)]/10 rounded-full flex items-center justify-center">
                {searchTerm ? (
                  <svg className="w-8 h-8 text-[var(--color-sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-[var(--color-sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
                {searchTerm ? 'No items found' : 'No items in inventory'}
              </h3>
              <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)] mb-4">
                {searchTerm 
                  ? `No items match your search for "${searchTerm}". Try a different search term.`
                  : 'Get started by adding your first inventory item.'
                }
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
                >
                  Clear Search
                </button>
              ) : (
                isAdmin && (
                  <Link href="/dashboard/inventory/new-item">
                    <button className="bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                      Add First Item
                    </button>
                  </Link>
                )
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-sage)]/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] uppercase tracking-wider">
                      Size (ft)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-sage)]/30 dark:divide-[var(--border-color)]">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--color-sage)]/5 dark:hover:bg-[var(--bg-accent)] transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
                          {item.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)]">
                        {item.size} ft
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)]">
                        {formatPrice(item.price)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          item.quantity <= 5 
                            ? 'bg-red-400 text-stone-50 dark:bg-red-800 dark:text-stone-300' 
                            : item.quantity <= 10
                            ? 'bg-yellow-500 text-stone-50 dark:bg-yellow-800 dark:text-stone-300'
                            : 'bg-green-500 text-stone-50 dark:bg-green-800 dark:text-stone-300'
                        }`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)]">
                        {formatDate(item.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link href={`/dashboard/inventory/${item.id}`}>
                            <button 
                              className="text-[var(--color-sage)] hover:text-[var(--color-pine)] dark:text-[var(--text-secondary)] dark:hover:text-[var(--text-primary)] transition-colors"
                              title="View Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </Link>
                          {isAdmin && (
                            <>
                              <Link href={`/dashboard/inventory/edit/${item.id}`}>
                                <button 
                                  className="text-[var(--color-borneo)] hover:text-[var(--color-pine)] dark:text-[var(--text-primary)] dark:hover:text-[var(--text-secondary)] transition-colors"
                                  title="Edit Item"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                              </Link>
                              <button
                                onClick={() => setDeleteConfirm(item.id!)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                title="Delete Item"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-[var(--bg-secondary)] rounded-lg p-6 max-w-md w-full dark:border dark:border-[var(--border-color)]">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-red-100 rounded-full mr-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
                  Delete Item
                </h3>
              </div>
              <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)] mb-6">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-[var(--color-box)] dark:text-[var(--text-secondary)] border border-[var(--color-sage)]/30 dark:border-[var(--border-color)] rounded-lg hover:bg-[var(--color-sage)]/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}