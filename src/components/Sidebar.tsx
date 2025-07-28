'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentUser, signOutUser, getSignInContext, isAdmin } from '../utils/authService';
import { getUserCart, getCartSummary } from '../utils/cartService';
import { Cart } from '../../models/cart';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signInContext, setSignInContext] = useState<'member' | 'admin' | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();

  // Mark when hydration is complete
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUserEmail(currentUser?.email || null);
        setUserId(currentUser?.uid || null);
        const context = getSignInContext();
        setSignInContext(context);
        
        // Only load cart after hydration is complete and for members only
        if (isHydrated && currentUser && context === 'member') {
          try {
            const userCart = await getUserCart(currentUser.uid);
            setCart(userCart);
          } catch (error) {
            console.error('Error loading cart:', error);
            setCart(null);
          }
        } else {
          setCart(null);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUserEmail(null);
        setUserId(null);
        setSignInContext(null);
        setCart(null);
      }
    };

    loadUser();
  }, [isHydrated]);

  // Refresh user data when sidebar opens to ensure current auth state
  useEffect(() => {
    if (isOpen && isHydrated) {
      const refreshUser = async () => {
        try {
          const currentUser = await getCurrentUser();
          setUserEmail(currentUser?.email || null);
          setUserId(currentUser?.uid || null);
          const context = getSignInContext();
          setSignInContext(context);
          
          // Refresh cart for members only
          if (currentUser && context === 'member') {
            try {
              const userCart = await getUserCart(currentUser.uid);
              setCart(userCart);
            } catch (error) {
              console.error('Error refreshing cart:', error);
              setCart(null);
            }
          } else {
            setCart(null);
          }
        } catch (error) {
          console.error('Error refreshing user on sidebar open:', error);
          setUserEmail(null);
          setUserId(null);
          setSignInContext(null);
          setCart(null);
        }
      };
      refreshUser();
    }
  }, [isOpen, isHydrated]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('sidebar');
      const hamburger = document.getElementById('hamburger-button');
      
      if (isOpen && sidebar && hamburger && 
          !sidebar.contains(event.target as Node) && 
          !hamburger.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when sidebar is open on mobile
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOutUser();
      setUserEmail(null);
      setIsOpen(false); // Close sidebar
      router.push('/'); // Redirect to home page
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <>
      {/* Hamburger Button */}
      {!isOpen && (
        <button
          id="hamburger-button"
          onClick={() => setIsOpen(true)}
          className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50 p-2.5 sm:p-2 rounded bg-[var(--color-borneo)] text-[var(--color-stone)] hover:bg-[var(--color-pine)] transition-colors shadow-lg"
          aria-label="Open menu"
        >
          {/* Hamburger Icon */}
          <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Backdrop Overlay for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed top-0 left-0 h-full w-64 sm:w-72 md:w-64 bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] shadow-xl z-40 transform transition-transform duration-300 ease-in-out dark:border-r dark:border-[var(--border-color)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 sm:p-6 h-full flex flex-col">
          {/* Header with Close Button */}
          <div className="flex flex-row justify-between items-center mb-6 sm:mb-8">
            <span className="text-xl sm:text-2xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">Menu</span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2.5 sm:p-2 rounded bg-[var(--color-borneo)] text-[var(--color-stone)] hover:bg-[var(--color-pine)] transition-colors shadow-md"
              aria-label="Close menu"
            >
              {/* X Icon */}
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex flex-col gap-3 sm:gap-4 flex-1">
            <Link 
              href="/dashboard" 
              className="text-[var(--color-borneo)] dark:text-[var(--text-primary)] hover:underline transition-colors py-2 px-1 text-base sm:text-lg min-h-[44px] flex items-center" 
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            {signInContext === 'admin' && (
              <>
                <Link 
                  href="/dashboard/inventory" 
                  className="text-[var(--color-borneo)] dark:text-[var(--text-primary)] hover:underline transition-colors py-2 px-1 text-base sm:text-lg min-h-[44px] flex items-center" 
                  onClick={() => setIsOpen(false)}
                >
                  Inventory
                </Link>
                <Link 
                  href="/dashboard/orders" 
                  className="text-[var(--color-borneo)] dark:text-[var(--text-primary)] hover:underline transition-colors py-2 px-1 text-base sm:text-lg min-h-[44px] flex items-center" 
                  onClick={() => setIsOpen(false)}
                >
                  Orders
                </Link>
              </>
            )}
            {signInContext === 'member' && (
              <Link 
                href="/dashboard/shop" 
                className="text-[var(--color-borneo)] dark:text-[var(--text-primary)] hover:underline transition-colors py-2 px-1 text-base sm:text-lg min-h-[44px] flex items-center" 
                onClick={() => setIsOpen(false)}
              >
                <span>Shop</span>
                {isHydrated && cart && getCartSummary(cart).totalItems > 0 && (
                  <span className="ml-2 bg-[var(--color-borneo)] text-white text-xs font-bold py-1 px-2 rounded-full min-w-[20px] h-5 flex items-center justify-center">
                    {getCartSummary(cart).totalItems}
                  </span>
                )}
              </Link>
            )}
            <Link 
              href="/dashboard/profile" 
              className="text-[var(--color-borneo)] dark:text-[var(--text-primary)] hover:underline transition-colors py-2 px-1 text-base sm:text-lg min-h-[44px] flex items-center" 
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
          </nav>

          {/* User info at bottom */}
          {userEmail && (
            <div className="mt-auto pt-4 sm:pt-6 border-t border-[var(--color-pine)] dark:border-[var(--border-color)]">
              <p className="text-xs sm:text-sm text-[var(--color-pine)] dark:text-[var(--text-secondary)] break-words">
                Signed in as:
              </p>
              <p className="text-sm sm:text-base text-[var(--color-borneo)] dark:text-[var(--text-primary)] font-medium break-words mb-3 sm:mb-4">
                {userEmail}
              </p>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full px-3 py-3 sm:py-2 text-sm sm:text-base bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-[var(--color-stone)] rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] font-medium"
              >
                {isSigningOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 