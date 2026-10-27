'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  BarChart3,
  Settings,
  PlusCircle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: Receipt },
  { label: 'Add Record', href: '/transactions/new', icon: PlusCircle },
  { label: 'Budgets & Limits', href: '/budgets', icon: PiggyBank },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 bg-white min-h-screen shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900 tracking-tight text-lg">SpendWise</span>
            <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-full border border-indigo-200">
              Student
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium">Expense Tracker</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Phase 1 Mock Badge / Student Note */}
      <div className="p-4 m-3 rounded-xl bg-slate-50 border border-slate-200/80">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Stage 1: Mock Mode</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Running with client-isolated mock data. AWS API Gateway & Cognito attach in Stage 3.
        </p>
      </div>

      {/* User profile preview footer */}
      <div className="p-4 border-t border-slate-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-200">
          AS
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-semibold text-slate-800 truncate">Aarav Sharma</p>
          <p className="text-[11px] text-slate-400 truncate">student@university.edu</p>
        </div>
      </div>
    </aside>
  );
}
