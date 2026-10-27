import React from 'react';
import { TransactionCategory, TransactionType } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'income' | 'expense' | 'category' | 'warning' | 'danger' | 'success';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    income: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    expense: 'bg-rose-50 text-rose-700 border-rose-200',
    category: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function CategoryBadge({ category }: { category: TransactionCategory | string }) {
  const categoryColors: Record<string, string> = {
    Food: 'bg-amber-50 text-amber-700 border-amber-200',
    Travel: 'bg-sky-50 text-sky-700 border-sky-200',
    Shopping: 'bg-purple-50 text-purple-700 border-purple-200',
    Education: 'bg-blue-50 text-blue-700 border-blue-200',
    Entertainment: 'bg-pink-50 text-pink-700 border-pink-200',
    Bills: 'bg-orange-50 text-orange-700 border-orange-200',
    Health: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Income: 'bg-teal-50 text-teal-700 border-teal-200',
    Other: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const style = categoryColors[category] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${style}`}>
      {category}
    </span>
  );
}

export function TypeBadge({ type }: { type: TransactionType }) {
  if (type === 'INCOME') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        + Income
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
      - Expense
    </span>
  );
}
