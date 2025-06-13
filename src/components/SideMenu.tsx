'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SideMenu() {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Home', href: '/dashboard' },
    { name: 'Inventory', href: '/dashboard/inventory' },
    { name: 'Profile', href: '/dashboard/profile' },
  ];

  return (
    <div className="w-64 h-screen bg-green-800 text-white shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-green-700">
        <h1 className="text-2xl font-bold text-green-100">
          Farmer Dave's
        </h1>
      </div>
      
      {/* Navigation Menu */}
      <nav className="mt-6">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`block px-6 py-3 text-lg transition-colors duration-200 ${
                    isActive
                      ? 'bg-green-700 text-white border-r-4 border-green-300'
                      : 'text-green-100 hover:bg-green-700 hover:text-white'
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
} 