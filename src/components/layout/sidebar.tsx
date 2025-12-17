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
  ChevronLeft,
  Factory,
  Receipt,
  Box,
} from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const navigation = [
  { name: "Dashboard", href: "/dashboard-overview", icon: LayoutDashboard },
  { name: "Items Management", href: "/items-management", icon: Package },
  { name: "Material Requests", href: "/material-request", icon: FileText },
  { name: "Production", href: "/production-management", icon: Factory },
  { name: "Product Stock", href: "/product-stock", icon: Box },
  { name: "Invoices", href: "/invoice-management", icon: Receipt },
  { name: "User Management", href: "/user-management", icon: Users },
  { name: "Configurations", href: "/configurations", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

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
        <nav className="flex flex-1 flex-col gap-y-1 px-3 py-4">
          <ul role="list" className="flex flex-1 flex-col gap-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href);
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
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
                      <span className="truncate">{item.name}</span>
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
