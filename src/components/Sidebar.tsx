'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      {/* Hamburger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded bg-[var(--color-borneo)] text-[var(--color-stone)]"
          aria-label="Open menu"
        >
          {/* Hamburger Icon */}
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-48 bg-[var(--color-stone)] shadow-lg z-40 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4">
          {/* Hamburger and Menu label */}
          <div className="flex flex-col items-start mb-8">
            <button
              onClick={() => setIsOpen(false)}
              className="mb-2 p-2 rounded bg-[var(--color-borneo)] text-[var(--color-stone)]"
              aria-label="Close menu"
            >
              {/* X Icon */}
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span className="text-xl font-bold text-[var(--color-borneo)]">Menu</span>
          </div>
          {/* Navigation Links */}
          <nav className="flex flex-col gap-4">
            <Link href="/" className="text-[var(--color-borneo)] hover:underline" onClick={() => setIsOpen(false)}>Home</Link>
            <Link href="/dashboard" className="text-[var(--color-borneo)] hover:underline" onClick={() => setIsOpen(false)}>Dashboard</Link>
            <Link href="/dashboard/inventory" className="text-[var(--color-borneo)] hover:underline" onClick={() => setIsOpen(false)}>Inventory</Link>
            <Link href="/dashboard/signup" className="text-[var(--color-borneo)] hover:underline" onClick={() => setIsOpen(false)}>Sign Up</Link>
            {/* Add more links as needed */}
          </nav>
        </div>
      </div>
    </>
  );
} 