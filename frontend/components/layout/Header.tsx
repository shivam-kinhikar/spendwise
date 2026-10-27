'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Calendar, IndianRupee } from 'lucide-react';
import { Button } from '../ui/Button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
  showAddButton?: boolean;
}

export function Header({
  title,
  subtitle,
  selectedMonth = '2026-10',
  onMonthChange,
  showAddButton = true,
}: HeaderProps) {
  const monthOptions = [
    { value: '2026-10', label: 'October 2026 (Current)' },
    { value: '2026-09', label: 'September 2026' },
    { value: '2026-08', label: 'August 2026' },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-8 py-3.5 bg-[#FBFBFA]/90 backdrop-blur-md border-b border-slate-200/80">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Month Selector if supported */}
        {onMonthChange && (
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1.5 rounded-lg shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              aria-label="Select month"
              className="text-xs font-medium text-slate-700 bg-transparent focus:outline-hidden cursor-pointer"
            >
              {monthOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Currency Tag */}
        <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold">
          <IndianRupee className="w-3.5 h-3.5" />
          <span>INR (₹)</span>
        </div>

        {/* Add Transaction Button */}
        {showAddButton && (
          <Link href="/transactions/new">
            <Button size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              <span className="hidden sm:inline">Add Record</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
