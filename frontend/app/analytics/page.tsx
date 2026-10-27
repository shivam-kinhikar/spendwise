'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardHeader } from '../../components/ui/Card';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { CategoryBadge } from '../../components/ui/Badge';
import { fetchAnalyticsSummary } from '../../lib/api';
import { AnalyticsSummary } from '../../types';
import { formatINR } from '../../lib/currency';
import {
  BarChart3,
  Lightbulb,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchAnalyticsSummary(selectedMonth);
      setAnalytics(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <AppShell
      title="Spending Analytics"
      subtitle="Examine your expense distribution and month-over-month shifts"
      selectedMonth={selectedMonth}
      onMonthChange={setSelectedMonth}
      showAddButton={false}
    >
      {isLoading ? (
        <LoadingState message="Generating financial charts..." className="py-20" />
      ) : error ? (
        <ErrorState
          title="Could not compute analytics"
          message={error}
          onRetry={loadAnalytics}
        />
      ) : analytics ? (
        <div className="space-y-6">
          {/* Top KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Expenses
              </span>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {formatINR(analytics.totalExpenses)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Across {analytics.categorySpending.reduce((sum, c) => sum + c.transactionCount, 0)} student expenses
              </p>
            </Card>

            <Card className="p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Categories
              </span>
              <p className="text-2xl font-bold text-indigo-700 mt-1">
                {analytics.categorySpending.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Top driver: {analytics.categorySpending[0]?.category || 'None'}
              </p>
            </Card>

            <Card className="p-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Month-over-Month Delta
              </span>
              <p
                className={`text-2xl font-bold mt-1 ${
                  analytics.previousMonthComparison.expenseChangeAmount > 0
                    ? 'text-rose-600'
                    : 'text-emerald-600'
                }`}
              >
                {analytics.previousMonthComparison.expenseChangeAmount > 0 ? '+' : ''}
                {formatINR(analytics.previousMonthComparison.expenseChangeAmount)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                vs {analytics.previousMonthComparison.previousMonth} ({formatINR(analytics.previousMonthComparison.previousTotalExpenses)})
              </p>
            </Card>
          </div>

          {/* Detailed Category Distribution Table & Chart */}
          <Card className="p-6">
            <CardHeader
              title="Category-wise Spending Breakdown"
              subtitle={`Sorted by highest spending volume in ${selectedMonth}`}
              action={
                <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  <BarChart3 className="w-4 h-4" />
                </div>
              }
            />

            {analytics.categorySpending.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No expense entries found for {selectedMonth}.
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.categorySpending.map((cat, idx) => (
                  <div key={cat.category} className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/60">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-white border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                          #{idx + 1}
                        </span>
                        <CategoryBadge category={cat.category} />
                        <span className="text-slate-400">
                          ({cat.transactionCount} transactions)
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 text-sm">
                          {formatINR(cat.amount)}
                        </span>
                        <span className="text-xs font-semibold text-indigo-600 ml-2">
                          ({cat.percentage}% of total)
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(3, cat.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Student Financial Insights Box */}
          <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-indigo-950">Student Financial Takeaways</h4>
              <p className="text-xs text-indigo-800/80 mt-1 leading-relaxed">
                {analytics.categorySpending.length > 0 ? (
                  <>
                    Your highest spending category this month is{' '}
                    <strong>{analytics.categorySpending[0].category}</strong>, accounting for{' '}
                    <strong>{analytics.categorySpending[0].percentage}%</strong> of your entire student outflow.
                    {analytics.previousMonthComparison.expenseChangeAmount > 0
                      ? ' Your overall spending has increased compared to last month. Setting category limits under "Budgets & Limits" will help keep costs controlled.'
                      : ' You are pacing below or equal to last month. Keep up the disciplined spending habits!'}
                  </>
                ) : (
                  'No expenses recorded for this month yet. Start logging your food, transit, and course materials to view spending insights.'
                )}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
