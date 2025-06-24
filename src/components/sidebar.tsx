"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BarChart3,
  Package,
  Settings,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const routes = [
    {
      href: "/",
      label: "Ana Sayfa",
      icon: <LayoutDashboard className="h-4 w-4" />,
      active: pathname === "/",
    },
    {
      href: "/rapor",
      label: "Raporlar",
      icon: <BarChart3 className="h-4 w-4" />,
      active: pathname === "/rapor",
    },
    {
      href: "/urunler",
      label: "Ürünler",
      icon: <Package className="h-4 w-4" />,
      active: pathname === "/urunler",
    },
    {
      href: "/ayarlar",
      label: "Ayarlar",
      icon: <Settings className="h-4 w-4" />,
      active: pathname === "/ayarlar",
    },
  ];

  return (
    <>
      {/* Mobil menü butonu */}
      <div className="md:hidden fixed top-3 left-3 z-50">
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 
          shadow-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300"
        >
          {isOpen ? <X className="h-3 w-3 text-slate-600 dark:text-slate-300" /> : 
                    <Menu className="h-3 w-3 text-slate-600 dark:text-slate-300" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm md:hidden z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className="fixed top-1/2 -translate-y-1/2 left-0 p-3 z-40 pointer-events-none">
        {/* Minimal Sidebar */}
        <aside
          className={cn(
            "w-12 pointer-events-auto",
            "bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-xl",
            "rounded-full shadow-[0_4px_16px_rgba(15,23,42,0.1)] dark:shadow-[0_4px_16px_rgba(15,23,42,0.2)]",
            "border border-slate-200/50 dark:border-slate-700/50",
            "transform transition-all duration-300 ease-in-out",
            isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
            className
          )}
        >
          <div className="flex flex-col items-center py-2 space-y-3">
            {/* Logo */}
            <div className="p-1.5">
              <div className="h-6 w-6 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 dark:from-slate-600 dark:to-slate-800 
              flex items-center justify-center ring-2 ring-slate-100 dark:ring-slate-700">
                <Package className="h-3 w-3 text-slate-100" />
              </div>
            </div>

            {/* Navigasyon */}
            <nav className="flex flex-col items-center space-y-1.5">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => setIsOpen(false)}
                  className="group relative"
                >
                  <div
                    className={cn(
                      "p-2 rounded-full transition-all duration-200",
                      "hover:bg-slate-200/70 dark:hover:bg-slate-800/70",
                      route.active && "bg-slate-200 dark:bg-slate-800 ring-1 ring-slate-300 dark:ring-slate-600"
                    )}
                  >
                    <div className={cn(
                      "transition-all duration-200",
                      route.active 
                        ? "text-slate-900 dark:text-slate-100" 
                        : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                    )}>
                      {route.icon}
                    </div>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute left-12 px-2.5 py-1.5 bg-slate-800 dark:bg-slate-700 text-slate-100 text-xs rounded-lg
                    opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap
                    border border-slate-700 dark:border-slate-600">
                    {route.label}
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </>
  );
} 