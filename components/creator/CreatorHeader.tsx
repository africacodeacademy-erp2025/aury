"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { getCurrentUser, signOut } from "@/lib/actions/auth.action";

export default function CreatorHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const u = await getCurrentUser();
      setUser(u);
    };
    fetchUser();
  }, []);

  const initials = (user?.name || user?.email || "U").split(" ").map((n) => n[0]?.toUpperCase()).join("");

  const nav = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Community", href: "/community" },
    { name: "My Patterns", href: "/patterns" },
    { name: "Earnings", href: "/earnings" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md dark:bg-gray-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white font-bold">C</div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Aury Creator</span>
          </Link>

          <nav className="hidden space-x-8 lg:flex">
            {nav.map((n) => (
              <Link key={n.name} href={n.href} className="text-gray-700 hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400 font-medium">
                {n.name}
              </Link>
            ))}
          </nav>

          <div className="hidden lg:flex items-center space-x-4">
            <div className="h-9 w-9 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
              {initials}
            </div>
            <button
              onClick={async () => { await signOut(); window.location.href = "/sign-in"; }}
              className="rounded-full bg-blue-500 px-4 py-2 text-white font-medium hover:bg-blue-600"
            >
              Sign out
            </button>
          </div>

          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 shadow-md">
          <div className="space-y-2 px-4 py-4">
            {nav.map((n) => (
              <Link key={n.name} href={n.href} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800" onClick={() => setIsMobileMenuOpen(false)}>
                {n.name}
              </Link>
            ))}
            <button
              onClick={async () => { await signOut(); window.location.href = "/sign-in"; }}
              className="w-full text-center rounded-md bg-blue-500 py-2.5 text-white hover:bg-blue-600"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
