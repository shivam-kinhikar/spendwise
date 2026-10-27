'use client';

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { TRANSACTION_CATEGORIES } from '../../types';

interface TransactionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export function TransactionFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  type,
  onTypeChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  sortBy,
  onSortByChange,
  onResetFilters,
  hasActiveFilters,
}: TransactionFiltersProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-xs mb-6 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search description, notes..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Category filter */}
        <div>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by category"
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {TRANSACTION_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Type filter */}
        <div>
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value)}
            aria-label="Filter by type"
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 cursor-pointer"
          >
            <option value="ALL">All Types (Income & Expenses)</option>
            <option value="EXPENSE">Expenses Only</option>
            <option value="INCOME">Income Only</option>
          </select>
        </div>

        {/* Sort by */}
        <div>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            aria-label="Sort transactions"
            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800 cursor-pointer"
          >
            <option value="date-desc">Date (Newest first)</option>
            <option value="date-asc">Date (Oldest first)</option>
            <option value="amount-desc">Amount (Highest first)</option>
            <option value="amount-asc">Amount (Lowest first)</option>
          </select>
        </div>
      </div>

      {/* Date range picker row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Date Range:
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            aria-label="Start date"
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-md text-xs text-slate-700"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            aria-label="End date"
            className="px-2.5 py-1 bg-white border border-slate-300 rounded-md text-xs text-slate-700"
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" /> Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}
