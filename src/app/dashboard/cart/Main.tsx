'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, getSignInContext } from '../../../utils/authService';
import { 
  getUserCart, 
  removeFromCart, 
  updateCartItemQuantity, 
  clearCart, 
  getCartSummary 
} from '../../../utils/cartService';
import { Cart, CartItem } from '../../../../models/cart';

export default function CartMain() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [removingItems, setRemovingItems] = useState<Set<string>>(new Set());
  const [clearingCart, setClearingCart] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Mark when hydration is complete
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const checkAuthAndLoadCart = async () => {
      try {
        // Check authentication first
        const user = await getCurrentUser();
        if (!user) {
          router.push('/signin');
          return;
        }

        setUserEmail(user.email);
        setUserId(user.uid);

        // Check if user signed in through admin portal - they should not see the cart
        const context = getSignInContext();
        if (context === 'admin') {
          router.push('/dashboard');
          return;
        }

        // Load user cart
        const userCart = await getUserCart(user.uid);
        setCart(userCart);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading cart:', error);
        setError('Failed to load cart');
        setIsLoading(false);
      }
    };

    checkAuthAndLoadCart();
  }, [router]);

  const handleQuantityUpdate = async (cartItemId: string, newQuantity: number) => {
    if (!userId) return;
    
    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    setError(null);
    
    try {
      await updateCartItemQuantity(userId, cartItemId, newQuantity);
      
      // Refresh cart
      const updatedCart = await getUserCart(userId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
      setError(error instanceof Error ? error.message : 'Failed to update quantity');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (cartItemId: string) => {
    if (!userId) return;
    
    setRemovingItems(prev => new Set(prev).add(cartItemId));
    setError(null);
    
    try {
      await removeFromCart(userId, cartItemId);
      
      // Refresh cart
      const updatedCart = await getUserCart(userId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error removing item:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove item');
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  const handleClearCart = async () => {
    if (!userId || !cart || cart.items.length === 0) return;
    
    setClearingCart(true);
    setError(null);
    
    try {
      await clearCart(userId);
      
      // Refresh cart
      const updatedCart = await getUserCart(userId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error clearing cart:', error);
      setError(error instanceof Error ? error.message : 'Failed to clear cart');
    } finally {
      setClearingCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatTimeRemaining = (expiresAt: Date | any) => {
    const now = new Date();
    const expireDate = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
    const timeLeft = expireDate.getTime() - now.getTime();
    
    if (timeLeft <= 0) {
      return 'Expired';
    }
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--color-borneo)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--color-pine)]">Loading cart...</p>
        </div>
      </div>
    );
  }

  const cartSummary = getCartSummary(cart);

  return (
    <div className="min-h-screen bg-[var(--background)] pt-4 pr-4 pb-4 pl-3 sm:pt-6 sm:pr-6 sm:pb-6 sm:pl-4 lg:pt-8 lg:pr-8 lg:pb-8 lg:pl-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <nav className="mb-6">
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
              href="/dashboard/shop"
              className="text-[var(--color-pine)] hover:text-[var(--color-borneo)] transition-colors"
            >
              Shop
            </Link>
            <svg className="w-4 h-4 text-[var(--color-sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-[var(--color-borneo)] font-medium">Cart</span>
          </div>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[var(--color-borneo)] bg-opacity-10 mr-4">
                <svg className="w-6 h-6 text-[var(--color-borneo)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19M7 13l-1.5 6M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[var(--color-borneo)] mb-2">Your Cart</h1>
                <p className="text-[var(--color-pine)]">
                  {cartSummary.totalItems > 0 
                    ? `${cartSummary.totalItems} item${cartSummary.totalItems !== 1 ? 's' : ''} • Total: ${formatPrice(cartSummary.totalPrice)}`
                    : 'Your cart is empty'
                  }
                </p>
              </div>
            </div>
            
            {cartSummary.totalItems > 0 && (
              <Link
                href="/dashboard/shop"
                className="inline-flex items-center bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md text-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Continue Shopping
              </Link>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-700 font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Cart Content */}
        {cartSummary.totalItems === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <svg 
                className="w-24 h-24 mx-auto text-[var(--color-sage)] opacity-50" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19M7 13l-1.5 6M20 13v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-[var(--color-borneo)] mb-4">
              Your cart is empty
            </h2>
            <p className="text-[var(--color-pine)] text-lg mb-6">
              Start shopping to add items to your cart!
            </p>
            <Link
              href="/dashboard/shop"
              className="inline-flex items-center bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="space-y-6">
                {cart?.items.map((cartItem) => (
                  <div key={cartItem.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-[var(--color-sage)] border-opacity-30 rounded-lg">
                    {/* Product Image */}
                    <div className="w-full sm:w-24 h-24 bg-[var(--color-stone)] rounded-lg overflow-hidden flex-shrink-0">
                      {cartItem.productImage ? (
                        <img 
                          src={cartItem.productImage} 
                          alt={cartItem.productName}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const placeholder = target.nextElementSibling as HTMLElement;
                            if (placeholder) placeholder.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`${cartItem.productImage ? 'hidden' : 'flex'} w-full h-full items-center justify-center bg-gradient-to-br from-[var(--color-sage)] to-[var(--color-stone)]`}
                        style={{ display: cartItem.productImage ? 'none' : 'flex' }}
                      >
                        <svg className="w-8 h-8 text-[var(--color-pine)] opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[var(--color-borneo)] mb-2">
                        {cartItem.productName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-pine)] mb-2">
                        <span>Size: {cartItem.productSize} ft</span>
                        <span>Price: {formatPrice(cartItem.productPrice)}</span>
                        <span>Subtotal: {formatPrice(cartItem.productPrice * cartItem.quantity)}</span>
                      </div>
                      <div className="text-sm text-orange-600 font-medium">
                        {isHydrated ? formatTimeRemaining(cartItem.expiresAt) : 'Loading...'}
                      </div>
                    </div>

                    {/* Quantity and Actions */}
                    <div className="flex flex-col sm:items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityUpdate(cartItem.id, cartItem.quantity - 1)}
                          disabled={updatingItems.has(cartItem.id) || cartItem.quantity <= 1}
                          className="w-8 h-8 rounded-full border border-[var(--color-sage)] flex items-center justify-center hover:bg-[var(--color-stone)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        
                        <span className="w-12 text-center font-semibold text-[var(--color-borneo)]">
                          {updatingItems.has(cartItem.id) ? (
                            <div className="w-4 h-4 border-2 border-[var(--color-borneo)] border-t-transparent rounded-full animate-spin mx-auto"></div>
                          ) : (
                            cartItem.quantity
                          )}
                        </span>
                        
                        <button
                          onClick={() => handleQuantityUpdate(cartItem.id, cartItem.quantity + 1)}
                          disabled={updatingItems.has(cartItem.id)}
                          className="w-8 h-8 rounded-full border border-[var(--color-sage)] flex items-center justify-center hover:bg-[var(--color-stone)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleRemoveItem(cartItem.id)}
                        disabled={removingItems.has(cartItem.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {removingItems.has(cartItem.id) ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Summary and Actions */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-bold text-[var(--color-borneo)] mb-2">
                    Order Summary
                  </h3>
                  <div className="text-lg text-[var(--color-pine)]">
                    <div>Items: {cartSummary.totalItems}</div>
                    <div className="font-bold text-xl text-[var(--color-borneo)]">
                      Total: {formatPrice(cartSummary.totalPrice)}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleClearCart}
                    disabled={clearingCart}
                    className="px-4 py-2 text-red-600 hover:text-red-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-red-300 hover:border-red-500 rounded-lg"
                  >
                    {clearingCart ? 'Clearing...' : 'Clear Cart'}
                  </button>
                  
                  <button
                    className="bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md"
                    onClick={() => {
                      // TODO: Implement checkout functionality
                      alert('Checkout functionality coming soon!');
                    }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 