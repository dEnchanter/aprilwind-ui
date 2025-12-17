"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Settings,
  X,
  Factory,
  Receipt,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navigation = [
  { name: "Dashboard", href: "/dashboard-overview", icon: LayoutDashboard },
  { name: "Items Management", href: "/items-management", icon: Package },
  { name: "Material Requests", href: "/material-request", icon: FileText },
  { name: "Production", href: "/production-management", icon: Factory },
  { name: "Invoices", href: "/invoice-management", icon: Receipt },
  { name: "User Management", href: "/user-management", icon: Users },
  { name: "Configurations", href: "/configurations", icon: Settings },
];

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

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
                  {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href);
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
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
                          <span>{item.name}</span>
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
