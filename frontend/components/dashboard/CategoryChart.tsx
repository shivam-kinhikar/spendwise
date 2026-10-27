import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { CategorySpending } from '../../types';
import { formatINR } from '../../lib/currency';
import { PieChart } from 'lucide-react';
import Link from 'next/link';

interface CategoryChartProps {
  categories: CategorySpending[];
  totalExpenses: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: 'bg-amber-500',
  Travel: 'bg-sky-500',
  Shopping: 'bg-purple-500',
  Education: 'bg-blue-500',
  Entertainment: 'bg-pink-500',
  Bills: 'bg-orange-500',
  Health: 'bg-emerald-500',
  Other: 'bg-slate-400',
};

export function CategoryChart({ categories, totalExpenses }: CategoryChartProps) {
  if (categories.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader
          title="Spending by Category"
          subtitle="Distribution of current month expenses"
        />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
            <PieChart className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500">No expense records found for this period.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Spending by Category"
        subtitle={`Total of ${formatINR(totalExpenses)} across ${categories.length} categories`}
        action={
          <Link
            href="/analytics"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Full Analytics →
          </Link>
        }
      />

      {/* Multi-segment stacked visual bar */}
      <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 mb-5">
        {categories.map((cat) => (
          <div
            key={cat.category}
            className={`${CATEGORY_COLORS[cat.category] || 'bg-slate-400'} h-full transition-all`}
            style={{ width: `${Math.max(2, cat.percentage)}%` }}
            title={`${cat.category}: ${formatINR(cat.amount)} (${cat.percentage}%)`}
          />
        ))}
      </div>

      {/* Category breakdown rows */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {categories.map((cat) => {
          const barColor = CATEGORY_COLORS[cat.category] || 'bg-slate-400';
          return (
            <div key={cat.category} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${barColor}`} />
                  <span className="font-semibold text-slate-800">{cat.category}</span>
                  <span className="text-[11px] text-slate-400">({cat.transactionCount} txs)</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <span className="text-slate-900">{formatINR(cat.amount)}</span>
                  <span className="text-slate-400 text-[11px] w-10 text-right">
                    {cat.percentage}%
                  </span>
                </div>
              </div>

              {/* Individual category track */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} rounded-full`}
                  style={{ width: `${Math.min(100, cat.percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
