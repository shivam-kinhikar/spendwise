'use client';

import React, { Suspense } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

interface AppShellProps {
  title: string;
  subtitle?: string;
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
  showAddButton?: boolean;
  children: React.ReactNode;
}

export function AppShell({
  title,
  subtitle,
  selectedMonth,
  onMonthChange,
  showAddButton = true,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[#FBFBFA]">
      {/* Desktop Sidebar wrapped in Suspense for usePathname prerendering */}
      <Suspense
        fallback={
          <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 bg-white min-h-screen shrink-0" />
        }
      >
        <Sidebar />
      </Suspense>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <Header
          title={title}
          subtitle={subtitle}
          selectedMonth={selectedMonth}
          onMonthChange={onMonthChange}
          showAddButton={showAddButton}
        />
        <main className="flex-1 px-4 sm:px-8 py-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Navigation wrapped in Suspense for usePathname prerendering */}
      <Suspense fallback={null}>
        <MobileNav />
      </Suspense>
    </div>
  );
}
