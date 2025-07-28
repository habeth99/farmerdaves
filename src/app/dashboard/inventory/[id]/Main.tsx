'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getItemById } from '../../../../utils/itemService';
import { Item } from '../../../../../models/item';

interface InventoryDetailsMainProps {
  itemId: string;
}

export default function InventoryDetailsMain({ itemId }: InventoryDetailsMainProps) {
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        setIsLoading(true);
        const fetchedItem = await getItemById(itemId);
        if (!fetchedItem) {
          setError('Item not found');
        } else {
          setItem(fetchedItem);
        }
      } catch (error) {
        console.error('Error fetching item:', error);
        setError('Failed to load item details');
      } finally {
        setIsLoading(false);
      }
    };

    if (itemId) {
      fetchItem();
    }
  }, [itemId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--color-borneo)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--color-pine)]">Loading item details...</p>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <nav className="mb-6">
            <Link 
              href="/dashboard/inventory"
              className="inline-flex items-center text-[var(--color-borneo)] hover:text-[var(--color-pine)] transition-colors duration-200 text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Inventory
            </Link>
          </nav>
          
          <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
                {error || 'Item Not Found'}
              </h1>
              <p className="text-[var(--color-pine)] dark:text-[var(--text-secondary)] text-lg">
                The item you're looking for doesn't exist or has been removed.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/dashboard/inventory"
                className="inline-flex items-center justify-center bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Inventory
              </Link>
              <Link 
                href="/dashboard/inventory/new-item"
                className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-[var(--color-borneo)] font-semibold py-3 px-6 rounded-lg transition-colors duration-200 border-2 border-[var(--color-borneo)]"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Item
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-4 pr-4 pb-4 pl-3 sm:pt-6 sm:pr-6 sm:pb-6 sm:pl-4 md:pt-8 md:pr-8 md:pb-8 md:pl-4">
      <div className="max-w-7xl mx-auto">
        {/* Navigation with Breadcrumbs */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm">
            <Link 
              href="/dashboard"
              className="text-[var(--color-pine)] hover:text-[var(--color-borneo)] transition-colors"
            >
              Dashboard
            </Link>
            <svg className="w-4 h-4 text-[var(--color-sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link 
              href="/dashboard/inventory"
              className="text-[var(--color-pine)] hover:text-[var(--color-borneo)] transition-colors"
            >
              Inventory
            </Link>
            <svg className="w-4 h-4 text-[var(--color-sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[var(--color-borneo)] font-medium">{item.name}</span>
          </div>
        </nav>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Quick Actions */}
          <div className="lg:col-span-1">
            {/* Item Image */}
            <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6 mb-6">
              <h3 className="text-lg font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-4">Product Image</h3>
              <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={item.image || '/bigfootimage.jpg'}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6">
              <h3 className="text-lg font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/dashboard/inventory/edit/${item.id}`}
                  className="w-full inline-flex items-center justify-center bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Item
                </Link>
                
                <Link
                  href="/dashboard/inventory"
                  className="w-full inline-flex items-center justify-center bg-[var(--color-sage)] hover:bg-[var(--color-pine)] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-md"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Inventory
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Item Details */}
          <div className="lg:col-span-2">
            {/* Header Card */}
            <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
                    {item.name}
                  </h1>
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Active
                    </span>
                    <span className="text-sm text-[var(--color-pine)] dark:text-[var(--text-secondary)]">
                      Item ID: <span className="font-mono text-xs">{item.id}</span>
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[var(--color-pine)] mb-1">Current Value</p>
                  <p className="text-3xl font-bold text-[var(--color-borneo)]">
                    ${item.price.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Product Information */}
              <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6">
                <h3 className="text-lg font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Product Information
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-[var(--color-pine)] font-medium">Name</span>
                    <span className="text-[var(--color-borneo)] font-semibold">{item.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-[var(--color-pine)] font-medium">Size</span>
                    <span className="inline-flex items-center px-2 py-1 bg-[var(--color-sage)] bg-opacity-20 text-[var(--color-borneo)] text-sm font-medium rounded-full">
                      {item.size} ft
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-[var(--color-pine)] font-medium">Quantity</span>
                    <span className={`inline-flex items-center px-2 py-1 text-sm font-medium rounded-full ${
                      item.quantity === 0 
                        ? 'bg-red-400 text-stone-50 dark:bg-red-800 dark:text-stone-300' 
                        : item.quantity < 10 
                        ? 'bg-yellow-500 text-stone-50 dark:bg-yellow-800 dark:text-stone-300' 
                        : 'bg-green-500 text-stone-50 dark:bg-green-800 dark:text-stone-300'
                    }`}>
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-[var(--color-pine)] font-medium">Unit Price</span>
                    <span className="text-xl font-bold text-[var(--color-borneo)]">
                      ${item.price.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[var(--color-pine)] font-medium">Total Value</span>
                    <span className="text-xl font-bold text-[var(--color-borneo)]">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6">
                <h3 className="text-lg font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Timestamps
                </h3>
                <div className="space-y-4">
                  {item.createdAt && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-[var(--color-pine)] font-medium">Created</span>
                      <div className="text-right">
                        <div className="text-[var(--color-borneo)] font-semibold">
                          {item.createdAt.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-[var(--color-pine)]">
                          {item.createdAt.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}
                  {item.updatedAt && (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-[var(--color-pine)] font-medium">Last Updated</span>
                      <div className="text-right">
                        <div className="text-[var(--color-borneo)] font-semibold">
                          {item.updatedAt.toLocaleDateString()}
                        </div>
                        <div className="text-sm text-[var(--color-pine)]">
                          {item.updatedAt.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[var(--color-pine)] font-medium">Status</span>
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            {item.description && (
              <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6 mb-6">
                <h3 className="text-lg font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  Description
                </h3>
                <p className="text-[var(--color-pine)] dark:text-[var(--text-secondary)] leading-relaxed">
                  {item.description}
                </p>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6">
              <h3 className="text-lg font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Item Analytics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-[var(--color-sage)] bg-opacity-10 rounded-lg">
                  <div className="text-2xl font-bold text-[var(--color-borneo)]">
                    ${(item.price / item.size).toFixed(2)}
                  </div>
                  <div className="text-sm text-[var(--color-pine)]">Price per ft</div>
                </div>
                <div className="text-center p-4 bg-[var(--color-sage)] bg-opacity-10 rounded-lg">
                  <div className="text-2xl font-bold text-[var(--color-borneo)]">
                    {item.createdAt ? Math.floor((Date.now() - item.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  </div>
                  <div className="text-sm text-[var(--color-pine)]">Days in inventory</div>
                </div>
                <div className="text-center p-4 bg-[var(--color-sage)] bg-opacity-10 rounded-lg">
                  <div className="text-2xl font-bold text-[var(--color-borneo)]">
                    {item.quantity === 0 ? 'Out of Stock' : item.quantity < 10 ? 'Low Stock' : 'In Stock'}
                  </div>
                  <div className="text-sm text-[var(--color-pine)]">Stock status</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}