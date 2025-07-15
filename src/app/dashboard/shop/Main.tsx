'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAllItems, searchItems } from '../../../utils/itemService';
import { getCurrentUser, getSignInContext } from '../../../utils/authService';
import { getUserCart, addToCart, getCartSummary } from '../../../utils/cartService';
import { startCartCleanupScheduler } from '../../../utils/cartCleanupService';
import { Item } from '../../../../models/item';
import { Cart } from '../../../../models/cart';

export default function ShopMain() {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Mark when hydration is complete and start cart cleanup
  useEffect(() => {
    setIsHydrated(true);
    // Start cart cleanup scheduler after hydration
    startCartCleanupScheduler();
  }, []);

  useEffect(() => {
    const checkAuthAndLoadItems = async () => {
      try {
        // Check authentication first
        const user = await getCurrentUser();
        if (!user) {
          router.push('/signin');
          return;
        }

        setUserEmail(user.email);
        setUserId(user.uid);

        // Check if user signed in through admin portal - they should not see the shop
        const context = getSignInContext();
        if (context === 'admin') {
          router.push('/dashboard');
          return;
        }

        // Load all items first
        const allItems = await getAllItems();
        setItems(allItems);
        setFilteredItems(allItems);

        // Only load cart after hydration is complete
        if (isHydrated) {
          const userCart = await getUserCart(user.uid);
          setCart(userCart);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading shop data:', error);
        setError('Failed to load shop items');
        setIsLoading(false);
      }
    };

    checkAuthAndLoadItems();
  }, [router, isHydrated]);

  const handleSearch = async (value: string) => {
    setSearchTerm(value);
    setIsSearching(true);
    
    try {
      if (value.trim() === '') {
        setFilteredItems(items);
      } else {
        const searchResults = await searchItems(value);
        setFilteredItems(searchResults);
      }
    } catch (error) {
      console.error('Error searching items:', error);
      setError('Failed to search items');
    } finally {
      setIsSearching(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleAddToCart = async (item: Item) => {
    if (!userId || !item.id) return;
    
    setAddingToCart(item.id);
    setError(null);
    
    try {
      await addToCart(userId, {
        productId: item.id,
        productName: item.name,
        productPrice: item.price,
        productSize: item.size,
        productImage: item.image,
        quantity: 1
      });
      
      // Refresh cart and items
      const [updatedItems, updatedCart] = await Promise.all([
        getAllItems(),
        getUserCart(userId)
      ]);
      
      setItems(updatedItems);
      setFilteredItems(searchTerm ? await searchItems(searchTerm) : updatedItems);
      setCart(updatedCart);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      setError(error instanceof Error ? error.message : 'Failed to add item to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--color-borneo)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--color-pine)]">Loading shop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pt-4 pr-4 pb-4 pl-3 sm:pt-6 sm:pr-6 sm:pb-6 sm:pl-4 lg:pt-8 lg:pr-8 lg:pb-8 lg:pl-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-borneo)] mb-4">
              Farmer Dave's Shop
            </h1>
            <p className="text-lg text-[var(--color-pine)] max-w-2xl mx-auto">
              Discover fresh, quality products from our farm. Browse our selection of seasonal offerings and farm-fresh goods.
            </p>
          </div>

          {/* Cart Summary and View Cart Button */}
          <div className="flex justify-center mb-6">
            <Link 
              href="/dashboard/cart"
              className="inline-flex items-center bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19M7 13l-1.5 6M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
              </svg>
              View Cart
              {isHydrated && cart && getCartSummary(cart).totalItems > 0 && (
                <span className="ml-2 bg-white text-[var(--color-borneo)] font-bold py-1 px-2 rounded-full text-sm">
                  {getCartSummary(cart).totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-[var(--color-sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border-2 border-[var(--color-sage)] rounded-xl focus:ring-2 focus:ring-[var(--color-borneo)] focus:border-[var(--color-borneo)] transition-colors bg-white shadow-sm"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                  <div className="w-4 h-4 border-2 border-[var(--color-borneo)] border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg max-w-2xl mx-auto">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Items Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-6">
              <svg 
                className="w-24 h-24 mx-auto text-[var(--color-sage)] opacity-50" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                {searchTerm ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                )}
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-[var(--color-borneo)] mb-4">
              {searchTerm ? 'No Results Found' : 'No Products Available'}
            </h2>
            <p className="text-[var(--color-pine)] text-lg max-w-md mx-auto">
              {searchTerm 
                ? `We couldn't find any products matching "${searchTerm}". Try a different search term.`
                : 'Check back later for new products and items from Farmer Dave\'s!'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => handleSearch('')}
                className="mt-6 inline-flex items-center px-6 py-3 bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white font-semibold rounded-lg transition-colors duration-200 shadow-md"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6 text-center">
              <p className="text-[var(--color-pine)]">
                {searchTerm 
                  ? `Found ${filteredItems.length} result${filteredItems.length !== 1 ? 's' : ''} for "${searchTerm}"`
                  : `Showing ${filteredItems.length} product${filteredItems.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
                  {/* Product Image */}
                  <div className="aspect-square bg-[var(--color-stone)] relative overflow-hidden">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const placeholder = target.nextElementSibling as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className={`${item.image ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gradient-to-br from-[var(--color-sage)] to-[var(--color-stone)]`}
                      style={{ display: item.image ? 'none' : 'flex' }}
                    >
                      <svg className="w-16 h-16 text-[var(--color-pine)] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    
                    {/* Stock Badge */}
                    {item.quantity === 0 && (
                      <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Out of Stock
                      </div>
                    )}
                    {item.quantity > 0 && item.quantity <= 5 && (
                      <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Low Stock
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[var(--color-borneo)] mb-2 line-clamp-2">
                      {item.name}
                    </h3>
                    
                    {item.description && (
                      <p className="text-[var(--color-pine)] text-sm mb-4 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-[var(--color-borneo)]">
                        {formatPrice(item.price)}
                      </div>
                      <div className="text-sm text-[var(--color-pine)]">
                        Size: {item.size} ft
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-[var(--color-pine)]">
                        {item.quantity > 0 ? (
                          <span className="text-green-600">
                            {item.quantity} in stock
                          </span>
                        ) : (
                          <span className="text-red-600">Out of stock</span>
                        )}
                      </div>
                      
                      <button 
                        onClick={() => handleAddToCart(item)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 text-sm ${
                          item.quantity > 0 && !addingToCart
                            ? 'bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white shadow-md'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={item.quantity === 0 || addingToCart === item.id}
                      >
                        {addingToCart === item.id ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                            Adding...
                          </div>
                        ) : item.quantity > 0 ? (
                          'Add to Cart'
                        ) : (
                          'Unavailable'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="text-center py-8 border-t border-[var(--color-sage)] border-opacity-30">
          <p className="text-[var(--color-pine)] mb-2">
            Welcome to Farmer Dave's Shop, {userEmail}!
          </p>
          <p className="text-sm text-[var(--color-sage)]">
            Fresh products • Quality guaranteed • Farm to table
          </p>
        </div>
      </div>
    </div>
  );
} 