'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  PiggyBank,
  BarChart3,
} from 'lucide-react';

const MOBILE_NAV_ITEMS = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Records', href: '/transactions', icon: Receipt },
  { label: 'Add', href: '/transactions/new', icon: PlusCircle, isPrimary: true },
  { label: 'Budgets', href: '/budgets', icon: PiggyBank },
  { label: 'Insights', href: '/analytics', icon: BarChart3 },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg"
    >
      {MOBILE_NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href));

        if (item.isPrimary) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center -mt-5"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-md hover:bg-indigo-700 transition-transform active:scale-95">
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-semibold text-indigo-700 mt-1">
                {item.label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
              isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
