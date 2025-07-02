'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getAllItems } from '../../../utils/itemService';
import { Item } from '../../../../models/item';

export default function Inventory() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'size' | 'quantity' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const fetchedItems = await getAllItems();
        setItems(fetchedItems);
      } catch (error) {
        console.error('Failed to fetch items:', error);
        setError('Failed to load inventory items');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  // Filter and sort items
  const filteredAndSortedItems = items
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'createdAt') {
        aValue = a.createdAt?.getTime() || 0;
        bValue = b.createdAt?.getTime() || 0;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

  const handleSort = (field: 'name' | 'price' | 'size' | 'quantity' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Calculate total inventory value
  const totalValue = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[var(--color-borneo)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[var(--color-pine)]">Loading inventory...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-[var(--color-borneo)] mb-2">
                Inventory Management
              </h1>
              <p className="text-[var(--color-pine)]">
                Manage your product inventory with professional tools
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/dashboard/inventory/new-item"
                className="inline-flex items-center justify-center bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Item
              </Link>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-[var(--color-borneo)] mb-2">
                Search Items
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-[var(--color-pine)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-[var(--color-sage)] rounded-lg focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-[var(--color-borneo)] transition-colors"
                  placeholder="Search by item name or description..."
                />
              </div>
            </div>

            {/* Sort */}
            <div className="lg:w-64">
              <label htmlFor="sort" className="block text-sm font-medium text-[var(--color-borneo)] mb-2">
                Sort By
              </label>
              <select
                id="sort"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as 'name' | 'price' | 'size' | 'quantity' | 'createdAt');
                  setSortOrder(order as 'asc' | 'desc');
                }}
                className="block w-full py-3 px-4 border border-[var(--color-sage)] rounded-lg focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-[var(--color-borneo)] transition-colors"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low-High)</option>
                <option value="price-desc">Price (High-Low)</option>
                <option value="size-asc">Size (Small-Large)</option>
                <option value="size-desc">Size (Large-Small)</option>
                <option value="quantity-asc">Quantity (Low-High)</option>
                <option value="quantity-desc">Quantity (High-Low)</option>
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[var(--color-borneo)] bg-opacity-10">
                <svg className="w-6 h-6 text-[var(--color-borneo)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[var(--color-pine)]">Total Items</p>
                <p className="text-2xl font-bold text-[var(--color-borneo)]">{items.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[var(--color-borneo)] bg-opacity-10">
                <svg className="w-6 h-6 text-[var(--color-borneo)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[var(--color-pine)]">Total Quantity</p>
                <p className="text-2xl font-bold text-[var(--color-borneo)]">{totalQuantity.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[var(--color-borneo)] bg-opacity-10">
                <svg className="w-6 h-6 text-[var(--color-borneo)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[var(--color-pine)]">Total Value</p>
                <p className="text-2xl font-bold text-[var(--color-borneo)]">
                  ${totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[var(--color-borneo)] bg-opacity-10">
                <svg className="w-6 h-6 text-[var(--color-borneo)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-[var(--color-pine)]">Avg. Value</p>
                <p className="text-2xl font-bold text-[var(--color-borneo)]">
                  ${items.length > 0 ? Math.round(totalValue / items.length).toLocaleString() : '0'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table/Grid */}
        {error ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--color-borneo)] mb-2">Error Loading Inventory</h3>
            <p className="text-[var(--color-pine)] mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        ) : filteredAndSortedItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-[var(--color-pine)] mb-4">
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-[var(--color-borneo)] mb-2">
              {items.length === 0 ? 'No Items in Inventory' : 'No Items Found'}
            </h3>
            <p className="text-[var(--color-pine)] mb-6">
              {items.length === 0 
                ? 'Start building your inventory by adding your first item.'
                : 'Try adjusting your search criteria or filters.'
              }
            </p>
            {items.length === 0 && (
              <Link 
                href="/dashboard/inventory/new-item"
                className="inline-flex items-center bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Your First Item
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-[var(--color-sage)] bg-opacity-20 px-6 py-4 border-b border-[var(--color-sage)]">
              <div className="grid grid-cols-12 gap-4 items-center font-semibold text-[var(--color-borneo)]">
                <div className="col-span-1 text-center">Image</div>
                <div className="col-span-4 cursor-pointer hover:text-[var(--color-pine)] transition-colors" onClick={() => handleSort('name')}>
                  Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-1 cursor-pointer hover:text-[var(--color-pine)] transition-colors text-center" onClick={() => handleSort('size')}>
                  Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-1 cursor-pointer hover:text-[var(--color-pine)] transition-colors text-center" onClick={() => handleSort('quantity')}>
                  Qty {sortBy === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-2 cursor-pointer hover:text-[var(--color-pine)] transition-colors" onClick={() => handleSort('price')}>
                  Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </div>
                <div className="col-span-3 text-center">Actions</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-[var(--color-sage)] divide-opacity-30">
              {filteredAndSortedItems.map((item) => (
                <div key={item.id} className="px-6 py-4 hover:bg-[var(--color-sage)] hover:bg-opacity-10 transition-colors">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Image */}
                    <div className="col-span-1">
                      <img
                        src={item.image || '/bigfootimage.jpg'}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-lg border border-[var(--color-sage)]"
                      />
                    </div>
                    
                    {/* Name */}
                    <div className="col-span-4">
                      <Link 
                        href={`/dashboard/inventory/${item.id}`}
                        className="font-medium text-[var(--color-borneo)] hover:text-[var(--color-pine)] transition-colors"
                      >
                        {item.name}
                      </Link>
                      {item.createdAt && (
                        <p className="text-sm text-[var(--color-pine)] opacity-75">
                          Added {item.createdAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    
                    {/* Size */}
                    <div className="col-span-1 text-center">
                      <span className="inline-flex items-center px-2 py-1 bg-[var(--color-sage)] bg-opacity-20 text-[var(--color-borneo)] text-sm font-medium rounded-full">
                        {item.size} ft
                      </span>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-1 text-center">
                      <span className={`inline-flex items-center px-2 py-1 text-sm font-medium rounded-full ${
                        item.quantity === 0 
                          ? 'bg-red-100 text-red-800' 
                          : item.quantity < 10 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.quantity}
                      </span>
                    </div>
                    
                    {/* Price */}
                    <div className="col-span-2">
                      <div>
                        <span className="text-lg font-bold text-[var(--color-borneo)]">
                          ${item.price.toLocaleString()}
                        </span>
                        <p className="text-sm text-[var(--color-pine)]">
                          Total: ${(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="col-span-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/dashboard/inventory/${item.id}`}
                          className="inline-flex items-center px-3 py-1 bg-[var(--color-borneo)] text-white text-sm font-medium rounded-md hover:bg-[var(--color-pine)] transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </Link>
                        <Link
                          href={`/dashboard/inventory/edit/${item.id}`}
                          className="inline-flex items-center px-3 py-1 bg-[var(--color-sage)] text-[var(--color-borneo)] text-sm font-medium rounded-md hover:bg-[var(--color-pine)] hover:text-white transition-colors"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Summary */}
        {filteredAndSortedItems.length > 0 && (
          <div className="mt-6 text-center">
            <p className="text-[var(--color-pine)]">
              Showing {filteredAndSortedItems.length} of {items.length} items
              {searchTerm && ` matching "${searchTerm}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 