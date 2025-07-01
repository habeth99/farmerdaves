'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getSignInContext, isAdmin } from '../../utils/authService';
import Link from 'next/link';

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [signInContext, setSignInContext] = useState<'member' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.push('/signin');
          return;
        }

        setUserEmail(user.email);
        setSignInContext(getSignInContext());
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/signin');
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--color-borneo)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--color-pine)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  if (signInContext === 'admin') {
    return (
      <div className="min-h-screen bg-[var(--background)] p-4 sm:p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 gap-3 sm:gap-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)]">Admin Dashboard</h1>
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium self-start sm:self-auto">Administrator</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] p-4 sm:p-6 rounded-lg shadow-md dark:border dark:border-[var(--border-color)]">
              <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-3">Sales Overview</h3>
              <div className="space-y-2">
                <p className="text-sm sm:text-base text-[var(--color-box)] dark:text-[var(--text-secondary)]">Total Sales: $12,450</p>
                <p className="text-sm sm:text-base text-[var(--color-box)] dark:text-[var(--text-secondary)]">Orders Today: 23</p>
                <p className="text-sm sm:text-base text-[var(--color-box)] dark:text-[var(--text-secondary)]">Revenue This Month: $45,230</p>
              </div>
            </div>
            
            <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] p-4 sm:p-6 rounded-lg shadow-md dark:border dark:border-[var(--border-color)]">
              <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-3">Inventory Status</h3>
              <div className="space-y-2">
                <p className="text-sm sm:text-base text-[var(--color-box)] dark:text-[var(--text-secondary)]">• Bigfoot Statues: 12 in stock</p>
                <p className="text-sm sm:text-base text-[var(--color-box)] dark:text-[var(--text-secondary)]">• Fresh Produce: 45 items</p>
                <p className="text-sm sm:text-base text-[var(--color-box)] dark:text-[var(--text-secondary)]">• Low Stock Alerts: 3</p>
              </div>
            </div>
            
            <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] p-4 sm:p-6 rounded-lg shadow-md dark:border dark:border-[var(--border-color)]">
              <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-3">Admin Tasks</h3>
              <div className="space-y-2">
                <p className="text-sm sm:text-base text-[var(--color-box)] dark:text-[var(--text-secondary)]">• Review pending orders</p>
                <p className="text-sm sm:text-base text-[var(--color-box)] dark:text-[var(--text-secondary)]">• Update inventory</p>
                <p className="text-sm sm:text-base text-[var(--color-box)] dark:text-[var(--text-secondary)]">• Process shipments</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] p-4 sm:p-6 rounded-lg shadow-md dark:border dark:border-[var(--border-color)]">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-4">Inventory Management</h2>
              <p className="text-sm sm:text-base text-[var(--color-box)] dark:text-[var(--text-secondary)] mb-4">
                Manage your farm's inventory, add new items, update stock levels, and track your famous bigfoot statue collection.
              </p>
              <Link href="/dashboard/inventory">
                <button className="bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-[var(--color-stone)] font-semibold py-2.5 px-4 sm:py-2 sm:px-4 rounded-lg transition-colors duration-200 w-full sm:w-auto text-sm sm:text-base">
                  Manage Inventory →
                </button>
              </Link>
            </div>
            
            <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] p-4 sm:p-6 rounded-lg shadow-md dark:border dark:border-[var(--border-color)]">
              <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-4">User Management</h2>
              <p className="text-sm sm:text-base text-[var(--color-box)] dark:text-[var(--text-secondary)] mb-4">
                View customer accounts, manage member access, and monitor user activity across the platform.
              </p>
              <button className="bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-[var(--color-stone)] font-semibold py-2.5 px-4 sm:py-2 sm:px-4 rounded-lg transition-colors duration-200 w-full sm:w-auto text-sm sm:text-base">
                View Users →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Member Dashboard
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-[var(--color-sage)]/20 to-[var(--color-pine)]/10">
        <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-4">
              Welcome to Farmer Dave's
            </h1>
            <p className="text-lg sm:text-xl text-[var(--color-box)] dark:text-[var(--text-secondary)] max-w-2xl mx-auto">
              Your gateway to farm-fresh produce and artisan crafts
            </p>
            {userEmail && (
              <p className="text-sm text-[var(--color-pine)] mt-2">
                Signed in as {userEmail}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Hero Image Section */}
      <section className="relative bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] border-t border-b border-[var(--color-sage)]/20">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24">
          <div className="text-center">
            <div className="bg-[var(--background)] border-2 border-dashed border-[var(--color-sage)]/30 rounded-lg p-12 sm:p-16 mb-8">
              <div className="text-[var(--color-box)] dark:text-[var(--text-secondary)]">
                <div className="w-24 h-24 mx-auto mb-4 bg-[var(--color-sage)]/10 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-[var(--color-sage)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">Featured Farm Image</h3>
                <p className="text-sm">Showcase your farm's seasonal highlights</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/shop">
                <button className="bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200">
                  Explore Products
                </button>
              </Link>
              <Link href="/dashboard/profile">
                <button className="border border-[var(--color-borneo)] text-[var(--color-borneo)] hover:bg-[var(--color-borneo)] hover:text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200">
                  Manage Account
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-light text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-4">
              Best Sellers
            </h2>
            <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)] max-w-2xl mx-auto">
              Our most popular farm-fresh products and handcrafted items
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Product Card 1 */}
            <div className="group">
              <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg overflow-hidden border border-[var(--color-sage)]/20 hover:border-[var(--color-sage)]/40 transition-colors duration-200">
                <div className="aspect-square bg-gradient-to-br from-[var(--color-sage)]/10 to-[var(--color-pine)]/10 flex items-center justify-center">
                  <div className="text-center text-[var(--color-box)] dark:text-[var(--text-secondary)]">
                    <div className="w-16 h-16 mx-auto mb-3 bg-[var(--color-borneo)]/10 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-[var(--color-borneo)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Bigfoot Statue</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
                    Handcrafted Bigfoot Statue
                  </h3>
                  <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)] text-sm mb-4">
                    Unique artisan-crafted statue, perfect for garden or home decoration
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold text-[var(--color-borneo)]">$89.99</span>
                    <button className="text-[var(--color-pine)] hover:text-[var(--color-borneo)] font-medium text-sm">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Card 2 */}
            <div className="group">
              <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg overflow-hidden border border-[var(--color-sage)]/20 hover:border-[var(--color-sage)]/40 transition-colors duration-200">
                <div className="aspect-square bg-gradient-to-br from-[var(--color-sage)]/10 to-[var(--color-pine)]/10 flex items-center justify-center">
                  <div className="text-center text-[var(--color-box)] dark:text-[var(--text-secondary)]">
                    <div className="w-16 h-16 mx-auto mb-3 bg-[var(--color-borneo)]/10 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-[var(--color-borneo)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Fresh Tomatoes</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
                    Organic Fresh Tomatoes
                  </h3>
                  <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)] text-sm mb-4">
                    Vine-ripened, locally grown organic tomatoes picked fresh daily
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold text-[var(--color-borneo)]">$4.99/lb</span>
                    <button className="text-[var(--color-pine)] hover:text-[var(--color-borneo)] font-medium text-sm">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Card 3 */}
            <div className="group">
              <div className="bg-[var(--color-stone)] dark:bg-[var(--bg-secondary)] rounded-lg overflow-hidden border border-[var(--color-sage)]/20 hover:border-[var(--color-sage)]/40 transition-colors duration-200">
                <div className="aspect-square bg-gradient-to-br from-[var(--color-sage)]/10 to-[var(--color-pine)]/10 flex items-center justify-center">
                  <div className="text-center text-[var(--color-box)] dark:text-[var(--text-secondary)]">
                    <div className="w-16 h-16 mx-auto mb-3 bg-[var(--color-borneo)]/10 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-[var(--color-borneo)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium">Veggie Bundle</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)] mb-2">
                    Weekly Veggie Bundle
                  </h3>
                  <p className="text-[var(--color-box)] dark:text-[var(--text-secondary)] text-sm mb-4">
                    Curated selection of seasonal vegetables, fresh from our farm
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold text-[var(--color-borneo)]">$24.99</span>
                    <button className="text-[var(--color-pine)] hover:text-[var(--color-borneo)] font-medium text-sm">
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link href="/dashboard/shop">
              <button className="bg-[var(--color-borneo)] hover:bg-[var(--color-pine)] text-white px-12 py-4 rounded-lg font-medium text-lg transition-colors duration-200 shadow-lg hover:shadow-xl">
                Shop Now →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-[var(--color-borneo)] text-white">
        <div className="max-w-7xl mx-auto px-6 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-light mb-4">Contact Us</h2>
            <p className="text-white/80 max-w-2xl mx-auto">
              Have questions about our products or need assistance? We're here to help.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Phone</h3>
              <p className="text-white/80">(555) 123-FARM</p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Hours</h3>
              <p className="text-white/80">Daily 8AM - 6PM</p>
            </div>
            
            <div>
              <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium mb-2">Location</h3>
              <p className="text-white/80">Pine Valley, Oregon</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 