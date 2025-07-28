'use client';

import { useState, useEffect } from 'react';
import { Item } from '../../models/item';
import { getAllItems } from '../utils/itemService';
import Link from 'next/link';

interface LowStockItem extends Item {
  stockLevel: 'critical' | 'low' | 'warning';
}

export default function LowInventoryAlerts() {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async () => {
    try {
      setLoading(true);
      const allItems = await getAllItems();
      
      // Filter and categorize low stock items
      const lowStock = allItems
        .filter(item => item.quantity <= 10) // Items with 10 or fewer in stock
        .map(item => ({
          ...item,
          stockLevel: getStockLevel(item.quantity) as 'critical' | 'low' | 'warning'
        }))
        .sort((a, b) => a.quantity - b.quantity); // Sort by quantity (lowest first)

      setLowStockItems(lowStock);
    } catch (err) {
      console.error('Error fetching low stock items:', err);
      setError('Failed to load inventory alerts');
    } finally {
      setLoading(false);
    }
  };

  const getStockLevel = (quantity: number): string => {
    if (quantity === 0) return 'critical';
    if (quantity <= 3) return 'critical';
    if (quantity <= 7) return 'low';
    return 'warning';
  };

  const getStockLevelConfig = (level: string) => {
    switch (level) {
      case 'critical':
        return {
          color: 'bg-red-400 text-stone-50 dark:bg-red-800 dark:text-stone-300',
          icon: '🚨',
          text: 'Critical'
        };
      case 'low':
        return {
          color: 'bg-red-400 text-stone-50 dark:bg-red-800 dark:text-stone-300',
          icon: '⚠️',
          text: 'Low Stock'
        };
      case 'warning':
        return {
          color: 'bg-yellow-500 text-stone-50 dark:bg-yellow-800 dark:text-stone-300',
          icon: '⚡',
          text: 'Warning'
        };
      default:
        return {
          color: 'bg-green-500 text-stone-50 dark:bg-green-800 dark:text-stone-300',
          icon: '📦',
          text: 'In Stock'
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6">
        <h2 className="text-xl font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-4">
          Low Inventory Alerts
        </h2>
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-[var(--color-borneo)] border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-[var(--color-box)] dark:text-[var(--text-secondary)]">Loading alerts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg shadow-lg border border-[var(--color-sage)]/40 dark:border-[var(--border-color)] p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
          Low Inventory Alerts
        </h2>
        <button
          onClick={fetchLowStockItems}
          className="text-[var(--color-sage)] hover:text-[var(--color-pine)] transition-colors"
          title="Refresh alerts"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {lowStockItems.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-[var(--color-sage)]/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[var(--color-sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
            All Stock Levels Good
          </h3>
          <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)]">
            No items require immediate attention.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {lowStockItems.map((item) => {
            const config = getStockLevelConfig(item.stockLevel);
            
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg border border-[var(--color-sage)]/20 dark:border-[var(--border-color)] hover:border-[var(--color-sage)]/40 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{config.icon}</span>
                  <div>
                    <h3 className="font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)]">
                      {item.name}
                    </h3>
                    <p className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)]">
                      Size: {item.size} ft • Price: ${item.price}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                      {item.quantity} left
                    </div>
                    <p className="text-xs text-[var(--color-box)] dark:text-[var(--text-secondary)] mt-1">
                      {config.text} Stock
                    </p>
                  </div>
                  
                  <Link
                    href={`/dashboard/inventory/edit/${item.id}`}
                    className="bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
                  >
                    Restock
                  </Link>
                </div>
              </div>
            );
          })}
          
          <div className="pt-4 border-t border-[var(--color-sage)]/20 dark:border-[var(--border-color)]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)]">
                {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} need attention
              </p>
              <Link
                href="/dashboard/inventory"
                className="text-[var(--color-borneo)] hover:text-[var(--color-pine)] text-sm font-medium transition-colors"
              >
                View All Inventory →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 