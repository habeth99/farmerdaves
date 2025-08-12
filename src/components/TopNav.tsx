'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getSignInContext, getCurrentUser, signOutUser } from '../utils/authService';

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [signInContext, setSignInContext] = useState<'member' | 'admin' | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const context = getSignInContext();
    setSignInContext(context);
    // determine if signed in
    getCurrentUser().then((u) => setIsSignedIn(!!u));
  }, []);

  const linkBaseClass =
    'text-sm text-[var(--color-borneo)] dark:text-[var(--text-primary)] hover:underline transition-colors';
  const linkMutedClass =
    'text-sm text-[var(--color-box)] dark:text-[var(--text-secondary)] hover:text-[var(--color-borneo)] dark:hover:text-[var(--text-primary)] transition-colors';

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOutUser();
      setIsSignedIn(false);
      router.push('/');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-[var(--color-stone)]/80 dark:bg-[var(--bg-secondary)]/80 backdrop-blur-sm border-b border-[var(--color-sage)]/30">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="h-12 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-[var(--color-borneo)] dark:text-[var(--text-primary)]"
          >
            Farmer Dave's
          </Link>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 overflow-x-auto">
              <Link
                href="/dashboard"
                className={isActive('/dashboard') ? linkBaseClass : linkMutedClass}
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/inventory"
                className={isActive('/dashboard/inventory') ? linkBaseClass : linkMutedClass}
              >
                Inventory
              </Link>
              {signInContext === 'admin' && (
                <Link
                  href="/dashboard/orders"
                  className={isActive('/dashboard/orders') ? linkBaseClass : linkMutedClass}
                >
                  Orders
                </Link>
              )}
              <Link
                href="/dashboard/profile"
                className={isActive('/dashboard/profile') ? linkBaseClass : linkMutedClass}
              >
                Profile
              </Link>
            </div>

            {isSignedIn && (
              <div className="flex items-center gap-3">
                {signInContext && (
                  <span className="text-xs text-[var(--color-box)] dark:text-[var(--text-secondary)]">
                    {signInContext === 'admin' ? 'Admin' : 'Member'}
                  </span>
                )}
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--color-borneo)]/10 hover:bg-[var(--color-borneo)]/20 text-[var(--color-borneo)] dark:text-[var(--text-primary)] transition-colors disabled:opacity-60"
                >
                  {isSigningOut ? 'Signing out...' : 'Sign out'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 