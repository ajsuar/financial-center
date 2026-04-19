"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  PiggyBank,
  TrendingUp,
  Target,
  Wallet,
  BarChart3,
  RefreshCw,
  TrendingDown,
  Heart,
  Settings,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: CreditCard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/budget", label: "Budget", icon: Wallet },
  { href: "/savings", label: "Savings", icon: PiggyBank },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/investments", label: "Investments", icon: TrendingUp },
  { href: "/net-worth", label: "Net Worth", icon: TrendingDown },
  { href: "/subscriptions", label: "Subscriptions", icon: RefreshCw },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/couple", label: "Couple Hub", icon: Heart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-zinc-800 bg-zinc-950 h-screen sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-zinc-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <span className="text-white text-sm font-bold">FC</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-100">Financial Center</p>
          <p className="text-xs text-zinc-500">My Household</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors group",
                isActive
                  ? "bg-indigo-600/20 text-indigo-400"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-zinc-300")} />
              {label}
              {isActive && <ChevronRight className="ml-auto h-3 w-3 text-indigo-500" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-zinc-800">
        <p className="text-xs text-zinc-600 text-center">Financial Center v1.0</p>
      </div>
    </aside>
  );
}
