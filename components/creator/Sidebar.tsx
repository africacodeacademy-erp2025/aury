"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  FileText,
  Plus,
  Menu,
  X,
  LogOut,
  UserCircle,
  ShoppingBag,
  MessageCircle,
} from "lucide-react";
import { getCurrentUser, signOut } from "@/lib/actions/auth.action";
import PostModal from "./PostModal";
import { User } from "@/types";
import { useUnreadCount } from "@/lib/useMessaging";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Community", href: "/community", icon: Users },
  { name: "Messages", href: "/messages", icon: MessageCircle },
  { name: "Patterns & Products", href: "/patterns", icon: FileText },
  { name: "Orders", href: "/creator/orders", icon: ShoppingBag },
  { name: "Profile", href: "/profile", icon: UserCircle },
];

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const unreadCount = useUnreadCount();

  useEffect(() => {
    const fetchUser = async () => {
      const u = await getCurrentUser();
      setUser(u);
    };
    fetchUser();
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0]?.toUpperCase())
      .join("");
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md"
        aria-label="Toggle mobile menu"
      >
        {isMobileOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-40
          transition-all duration-300 ease-in-out
          ${isCollapsed ? "w-16" : "w-64"}
          ${
            isMobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {!isCollapsed && (
                <div className="flex items-center space-x-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white font-bold">
                    A
                  </div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    Aury Creator
                  </span>
                </div>
              )}
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:block p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Create Post Button */}
          <div className="p-4">
            <button
              onClick={() => setIsPostModalOpen(true)}
              className={`
                w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 
                text-white font-medium rounded-lg transition-colors duration-200
                ${isCollapsed ? "p-3" : "px-4 py-3"}
              `}
              aria-label="Create new post"
            >
              <Plus className="h-5 w-5" />
              {!isCollapsed && <span>Create Post</span>}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const showBadge = item.name === "Messages" && unreadCount > 0;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 relative
                    ${
                      isActive
                        ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                  aria-label={item.name}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                  {showBadge && (
                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Sign Out */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {user && (
              <div className="space-y-3">
                {!isCollapsed && (
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold">
                      {getInitials(user.name || user.email || "U")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSignOut}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 text-red-600 dark:text-red-400 
                    hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200
                    ${isCollapsed ? "justify-center" : ""}
                  `}
                  aria-label="Sign out"
                >
                  <LogOut className="h-5 w-5" />
                  {!isCollapsed && (
                    <span className="font-medium">Sign Out</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Post Modal */}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
      />
    </>
  );
}
