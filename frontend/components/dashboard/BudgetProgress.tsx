import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { formatINR, getAlertLevelStyles } from '../../lib/currency';
import { BudgetStatus } from '../../types';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, ChevronRight, AlertTriangle } from 'lucide-react';

interface BudgetProgressProps {
  statuses: BudgetStatus[];
  month: string;
}

export function BudgetProgress({ statuses, month }: BudgetProgressProps) {
  const overall = statuses.find((s) => s.category === 'OVERALL');
  const categoryBudgets = statuses.filter((s) => s.category !== 'OVERALL');

  return (
    <Card className="flex flex-col h-full">
      <CardHeader
        title="Monthly Budget Progress"
        subtitle={`Tracking expenses against limits for ${month}`}
        action={
          <Link
            href="/budgets"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
          >
            Manage Limits
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      {overall ? (
        <div className="space-y-4">
          {/* Main Overall Progress */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-800">
                Overall Monthly Limit
              </span>
              <AlertBadge level={overall.alertLevel} />
            </div>

            {/* Progress Track */}
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  getAlertLevelStyles(overall.alertLevel).progressBar
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, overall.percentageUsed))}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-medium">
              <span>Spent: {formatINR(overall.spent)}</span>
              <span>
                {overall.percentageUsed}% of {formatINR(overall.limit)}
              </span>
            </div>

            <div className="mt-2 text-xs pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-slate-600">
                {overall.remaining >= 0 ? 'Remaining to spend:' : 'Amount exceeded:'}
              </span>
              <span
                className={`font-bold ${
                  overall.remaining >= 0 ? 'text-indigo-700' : 'text-red-600'
                }`}
              >
                {formatINR(Math.abs(overall.remaining))}
              </span>
            </div>
          </div>

          {/* Sub-category Budgets list */}
          {categoryBudgets.length > 0 && (
            <div className="space-y-3 pt-1">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Category Limits
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categoryBudgets.map((cat) => {
                  const styles = getAlertLevelStyles(cat.alertLevel);
                  return (
                    <div
                      key={cat.category}
                      className="p-3 rounded-lg border border-slate-200/80 bg-white"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-800">
                          {cat.categoryName}
                        </span>
                        <span
                          className={`font-semibold px-1.5 py-0.5 rounded text-[10px] border ${styles.badgeBg}`}
                        >
                          {cat.percentageUsed}%
                        </span>
                      </div>

                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${styles.progressBar}`}
                          style={{
                            width: `${Math.min(100, Math.max(0, cat.percentageUsed))}%`,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5">
                        <span>{formatINR(cat.spent)}</span>
                        <span>limit {formatINR(cat.limit)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-xs text-slate-500 mb-3">
            No budget set for {month}. Setting a budget enables threshold alerts at 75%, 90% and 100%.
          </p>
          <Link href="/budgets">
            <span className="text-xs font-medium text-indigo-600 hover:underline">
              + Set Monthly Budget
            </span>
          </Link>
        </div>
      )}
    </Card>
  );
}

function AlertBadge({
  level,
}: {
  level: 'normal' | 'warning_75' | 'warning_90' | 'exceeded_100';
}) {
  const styles = getAlertLevelStyles(level);

  let icon = <CheckCircle2 className="w-3 h-3" />;
  if (level === 'warning_75') icon = <AlertCircle className="w-3 h-3" />;
  if (level === 'warning_90' || level === 'exceeded_100')
    icon = <AlertTriangle className="w-3 h-3" />;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${styles.badgeBg}`}
    >
      {icon}
      {styles.label}
    </span>
  );
}
