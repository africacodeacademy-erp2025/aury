'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { getCurrentUser } from '@/lib/actions/auth.action';

interface NavItem {
  name: string;
  href: string;
}

const navItems: NavItem[] = [
  { name: 'Home', href: '/' },
  { name: 'Price Calculator', href: '/calculator' },
  { name: 'Pattern Generator', href: '/pattern-generator' },
  { name: 'Marketplace', href: '/marketplace' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const u = await getCurrentUser();
        setUser(u);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0]?.toUpperCase())
      .join('');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white font-bold">
              A
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Aury
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden space-x-8 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-500 dark:text-gray-200 dark:hover:text-blue-400 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="hidden lg:flex items-center space-x-4">
            {!user ? (
              <>
                <Link
                  href="/sign-in"
                  className="text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-full bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700"
                >
                  Get Started
                </Link>
              </>
            ) : (
              <div className="flex items-center">
                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                  {getInitials(user.name || user.email || 'U')}
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 shadow-md">
          <div className="space-y-2 px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {!user ? (
              <div className="space-y-2 mt-2">
                <Link
                  href="/sign-in"
                  className="block text-center rounded-md py-2.5 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="block text-center rounded-md bg-blue-600 py-2.5 text-white hover:bg-blue-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="flex justify-center mt-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold cursor-pointer">
                  {getInitials(user.name || user.email || 'U')}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
