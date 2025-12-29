"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { navigationItems, filterNavigationByRole } from "@/config/navigation";
import { getUserRoleDetail } from "@/utils/storage";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState<any>(null);

  // Get user role only on client side to avoid hydration mismatch
  useEffect(() => {
    setRole(getUserRoleDetail());
  }, []);

  // Filter navigation items based on user role
  const visibleNavigation = useMemo(() => {
    return filterNavigationByRole(navigationItems, role?.name);
  }, [role?.name]);

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ width: 256 }}
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-50 bg-gray-900 border-r border-gray-800"
      >
        {/* Logo */}
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-800">
          {!collapsed && (
            <Link href="/dashboard-overview" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-700 to-brand-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AW</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm">
                  <span className="text-brand-700">April</span>
                  <span>Wind</span>
                </span>
                <span className="text-xs text-gray-400">Fashion MS</span>
              </div>
            </Link>
          )}

          {collapsed && (
            <Link href="/dashboard-overview" className="flex items-center justify-center w-full">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-700 to-brand-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AW</span>
              </div>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-y-1 px-3 py-4 overflow-y-auto">
          <ul role="list" className="flex flex-1 flex-col gap-y-1">
            {visibleNavigation.map((item) => {
              const isActive = pathname ? (pathname === item.path || pathname.startsWith(item.path)) : false;
              return (
                <li key={item.label}>
                  <Link
                    href={item.path}
                    className={cn(
                      "group flex items-center gap-x-3 rounded-lg p-3 text-sm font-medium transition-all",
                      isActive
                        ? "bg-brand-700 text-white shadow-lg shadow-brand-700/50"
                        : "text-gray-400 hover:text-white hover:bg-gray-800"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 shrink-0",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                    )} />
                    {!collapsed && (
                      <span className="truncate">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse Button */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className={cn(
              "h-5 w-5 transition-transform",
              collapsed && "rotate-180"
            )} />
            {!collapsed && <span className="ml-3">Collapse</span>}
          </button>
        </div>
      </motion.aside>

      {/* Spacer for fixed sidebar - starts at full width to prevent layout shift */}
      <motion.div
        initial={{ width: 256 }}
        animate={{ width: collapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="hidden lg:block"
      />
    </>
  );
}
