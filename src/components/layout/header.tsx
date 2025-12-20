"use client"

import { Bell, Menu, Search, ChevronRight, LogOut, User, Settings, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { useLogout, useMe } from "@/hooks/useAuth";
import { getInitialsFromNames } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isLoading } = useMe();
  const logoutMutation = useLogout();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering dynamic content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render user info until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden -m-2.5 p-2.5 text-gray-700 hover:text-gray-900"
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </button>
        <div className="h-6 w-px bg-gray-200 lg:hidden" />
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <nav className="flex items-center space-x-1 text-sm" aria-label="Breadcrumb">
            <span className="text-gray-900 font-medium">Loading...</span>
          </nav>
        </div>
        <div className="hidden md:flex md:flex-1 md:max-w-md">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 bg-gray-50 border-gray-200"
            />
          </div>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button
            type="button"
            className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />
          <Button variant="ghost" className="flex items-center gap-x-3 hover:bg-gray-100">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-brand-700 text-white text-xs font-medium">
                U
              </AvatarFallback>
            </Avatar>
            <div className="hidden lg:flex lg:flex-col lg:items-start">
              <span className="text-sm font-semibold text-gray-900">User</span>
              <span className="text-xs text-gray-500">...</span>
            </div>
          </Button>
        </div>
      </header>
    );
  }

  const getBreadcrumbs = () => {
    const paths = pathname.split("/").filter(Boolean);
    const breadcrumbs = paths.map((path, index) => {
      const href = "/" + paths.slice(0, index + 1).join("/");
      const label = path
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      return { label, href };
    });
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={onMenuClick}
        className="lg:hidden -m-2.5 p-2.5 text-gray-700 hover:text-gray-900"
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden" />

      {/* Breadcrumbs */}
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <nav className="flex items-center space-x-1 text-sm" aria-label="Breadcrumb">
          {breadcrumbs.length > 0 ? (
            breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
                )}
                <button
                  onClick={() => router.push(crumb.href)}
                  className={`hover:text-gray-900 transition-colors ${
                    index === breadcrumbs.length - 1
                      ? "text-gray-900 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {crumb.label}
                </button>
              </div>
            ))
          ) : (
            <span className="text-gray-900 font-medium">Dashboard</span>
          )}
        </nav>
      </div>

      {/* Search */}
      <div className="hidden md:flex md:flex-1 md:max-w-md">
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-x-4 lg:gap-x-6">
        {/* Notifications */}
        <button
          type="button"
          className="relative -m-2.5 p-2.5 text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">View notifications</span>
          <Bell className="h-6 w-6" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Separator */}
        <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-x-3 hover:bg-gray-100"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-brand-700 text-white text-xs font-medium">
                  {isLoading
                    ? "..."
                    : getInitialsFromNames(user?.staffName || "User", "")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex lg:flex-col lg:items-start">
                <span className="text-sm font-semibold text-gray-900">
                  {isLoading ? "Loading..." : user?.staffName || "User"}
                </span>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-brand-700" />
                  <span className="text-xs font-medium text-brand-700">
                    {isLoading ? "" : user?.role?.name || ""}
                  </span>
                </div>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.staffName || "User"}</p>
                <p className="text-xs text-gray-500">{user?.email || ""}</p>
                <div className="flex items-center gap-1 mt-1">
                  <ShieldCheck className="h-3 w-3 text-brand-700" />
                  <span className="text-xs font-medium text-brand-700">
                    {user?.role?.name || ""}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/change-password")}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Change Password</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600"
              disabled={logoutMutation.isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>{logoutMutation.isPending ? "Signing out..." : "Sign out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
