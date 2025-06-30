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
          <div className="mb-6">
            <Link 
              href="/dashboard/inventory"
              className="inline-flex items-center text-[var(--color-borneo)] hover:text-[var(--color-pine)] transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Inventory
            </Link>
          </div>
          
          <div className="bg-[var(--color-sage)] p-8 rounded-lg shadow-md text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-[var(--color-pine)] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-borneo)] mb-2">
              {error || 'Item Not Found'}
            </h1>
            <p className="text-[var(--color-pine)] mb-6">
              The item you're looking for doesn't exist or has been removed.
            </p>
            <Link 
              href="/dashboard/inventory"
              className="bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-[var(--color-stone)] font-semibold py-2 px-6 rounded-lg transition-colors duration-200 border-2 border-[var(--color-pine)]"
            >
              Back to Inventory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="mb-6">
          <Link 
            href="/dashboard/inventory"
            className="inline-flex items-center text-[var(--color-borneo)] hover:text-[var(--color-pine)] transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Inventory
          </Link>
        </div>

        {/* Item Details */}
        <div className="bg-[var(--color-sage)] rounded-lg shadow-2xl overflow-hidden">
          <div className="md:flex">
            {/* Image Section */}
            <div className="md:w-1/2 p-8 bg-white flex items-center justify-center">
              <img
                src={item.image || '/bigfootimage.jpg'}
                alt={item.name}
                className="max-w-full max-h-96 object-contain rounded-lg shadow-md"
              />
            </div>
            
            {/* Details Section */}
            <div className="md:w-1/2 p-8">
              <h1 className="text-4xl font-bold text-[var(--color-borneo)] mb-6">
                {item.name}
              </h1>
              
              <div className="space-y-6">
                {/* Size */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-[var(--color-borneo)] rounded-lg mr-4">
                    <svg className="w-6 h-6 text-[var(--color-stone)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-pine)] font-medium">Size</p>
                    <p className="text-2xl font-bold text-[var(--color-borneo)]">{item.size} ft</p>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-[var(--color-borneo)] rounded-lg mr-4">
                    <svg className="w-6 h-6 text-[var(--color-stone)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-pine)] font-medium">Price</p>
                    <p className="text-3xl font-bold text-[var(--color-borneo)]">${item.price.toLocaleString()}</p>
                  </div>
                </div>

                {/* Item ID */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-[var(--color-borneo)] rounded-lg mr-4">
                    <svg className="w-6 h-6 text-[var(--color-stone)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-pine)] font-medium">Item ID</p>
                    <p className="text-lg font-mono text-[var(--color-borneo)]">{item.id}</p>
                  </div>
                </div>

                {/* Timestamps */}
                {(item.createdAt || item.updatedAt) && (
                  <div className="pt-4 border-t border-[var(--color-pine)] border-opacity-20">
                    {item.createdAt && (
                      <p className="text-sm text-[var(--color-pine)] mb-1">
                        <span className="font-medium">Created:</span> {item.createdAt.toLocaleDateString()} at {item.createdAt.toLocaleTimeString()}
                      </p>
                    )}
                    {item.updatedAt && (
                      <p className="text-sm text-[var(--color-pine)]">
                        <span className="font-medium">Updated:</span> {item.updatedAt.toLocaleDateString()} at {item.updatedAt.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex gap-4">
                <Link
                  href="/dashboard/inventory"
                  className="flex-1 bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-[var(--color-stone)] font-semibold py-3 px-6 rounded-lg transition-colors duration-200 border-2 border-[var(--color-pine)] text-center"
                >
                  Back to Inventory
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}