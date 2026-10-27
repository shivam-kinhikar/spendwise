'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { SummaryCards } from '../../components/dashboard/SummaryCard';
import { BudgetProgress } from '../../components/dashboard/BudgetProgress';
import { AffordabilityCalculator } from '../../components/dashboard/AffordabilityCalculator';
import { CategoryChart } from '../../components/dashboard/CategoryChart';
import { MonthlyComparisonCard } from '../../components/dashboard/MonthlyComparisonCard';
import { RecentTransactions } from '../../components/dashboard/RecentTransactions';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  fetchAnalyticsSummary,
  fetchBudgetStatuses,
  fetchTransactions,
} from '../../lib/api';
import { AnalyticsSummary, BudgetStatus, Transaction } from '../../types';

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [budgetStatuses, setBudgetStatuses] = useState<BudgetStatus[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryData, statusesData, txsData] = await Promise.all([
        fetchAnalyticsSummary(selectedMonth),
        fetchBudgetStatuses(selectedMonth),
        fetchTransactions({ month: selectedMonth, sortBy: 'date-desc' }),
      ]);

      setAnalytics(summaryData);
      setBudgetStatuses(statusesData);
      setRecentTransactions(txsData);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Unable to load dashboard records'
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <AppShell
      title="Student Dashboard"
      subtitle="Overview of your allowances, expenses, and budget health"
      selectedMonth={selectedMonth}
      onMonthChange={setSelectedMonth}
      showAddButton={true}
    >
      {isLoading ? (
        <LoadingState message="Calculating student finances..." className="py-24" />
      ) : error ? (
        <ErrorState
          title="Could not load dashboard"
          message={error}
          onRetry={loadDashboardData}
        />
      ) : analytics ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Row: 4 Metric Cards */}
          <SummaryCards
            totalIncome={analytics.totalIncome}
            totalExpenses={analytics.totalExpenses}
            remainingBudget={analytics.remainingBudget}
            overallBudgetLimit={analytics.overallBudgetLimit}
            netSavings={analytics.netSavings}
          />

          {/* Second Row: Budget Progress & Affordability Calculator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BudgetProgress statuses={budgetStatuses} month={selectedMonth} />
            <AffordabilityCalculator
              currentRemainingBudget={analytics.remainingBudget}
              overallBudgetLimit={analytics.overallBudgetLimit}
              totalExpenses={analytics.totalExpenses}
            />
          </div>

          {/* Third Row: Category Chart & Month-over-Month Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CategoryChart
              categories={analytics.categorySpending}
              totalExpenses={analytics.totalExpenses}
            />
            <MonthlyComparisonCard
              currentMonth={analytics.month}
              currentExpenses={analytics.totalExpenses}
              previousMonth={analytics.previousMonthComparison.previousMonth}
              previousExpenses={
                analytics.previousMonthComparison.previousTotalExpenses
              }
              changeAmount={
                analytics.previousMonthComparison.expenseChangeAmount
              }
              changePercentage={
                analytics.previousMonthComparison.expenseChangePercentage
              }
            />
          </div>

          {/* Fourth Row: Recent Transactions Table Preview */}
          <div className="grid grid-cols-1 gap-6">
            <RecentTransactions transactions={recentTransactions} />
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
