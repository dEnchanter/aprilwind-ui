"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo } from "react";
import { navigationItems, filterNavigationByPermissions } from "@/config/navigation";
import { getUserRoleDetail, getUserPermissions } from "@/utils/storage";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const role = getUserRoleDetail();

  // Filter navigation items based on user permissions
  const visibleNavigation = useMemo(() => {
    const permissions = getUserPermissions();
    return filterNavigationByPermissions(navigationItems, permissions, role?.name);
  }, [role?.name]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-gray-900/80 lg:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 lg:hidden"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-gray-800">
                <Link
                  href="/dashboard-overview"
                  onClick={onClose}
                  className="flex items-center gap-2"
                >
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

                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex flex-1 flex-col gap-y-1 px-3 py-4 overflow-y-auto">
                <ul role="list" className="flex flex-1 flex-col gap-y-1">
                  {visibleNavigation.map((item) => {
                    const isActive = pathname === item.path || pathname.startsWith(item.path);
                    return (
                      <li key={item.label}>
                        <Link
                          href={item.path}
                          onClick={onClose}
                          className={cn(
                            "group flex items-center gap-x-3 rounded-lg p-3 text-sm font-medium transition-all",
                            isActive
                              ? "bg-brand-700 text-white shadow-lg shadow-brand-700/50"
                              : "text-gray-400 hover:text-white hover:bg-gray-800"
                          )}
                        >
                          <item.icon
                            className={cn(
                              "h-5 w-5 shrink-0",
                              isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                            )}
                          />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
