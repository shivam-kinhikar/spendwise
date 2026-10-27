import React from 'react';
import { Card } from '../ui/Card';
import { formatINR } from '../../lib/currency';
import { TrendingUp, TrendingDown, PiggyBank, Wallet } from 'lucide-react';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  remainingBudget: number; // Overall Budget Limit - Expenses
  overallBudgetLimit: number;
  netSavings: number;
}

export function SummaryCards({
  totalIncome,
  totalExpenses,
  remainingBudget,
  overallBudgetLimit,
  netSavings,
}: SummaryCardsProps) {
  const isBudgetExceeded = remainingBudget < 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Income Card */}
      <Card hover className="relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Income
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatINR(totalIncome)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Stipend & allowances</p>
        </div>
      </Card>

      {/* Total Expenses Card */}
      <Card hover className="relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Spent
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold text-slate-900 tracking-tight">
            {formatINR(totalExpenses)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Current month expenses</p>
        </div>
      </Card>

      {/* Budget Remaining Card (Overall Limit - Expenses) */}
      <Card
        hover
        className={`relative overflow-hidden border-2 ${
          isBudgetExceeded
            ? 'border-red-200 bg-red-50/20'
            : 'border-indigo-100 bg-indigo-50/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Remaining Budget
          </span>
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isBudgetExceeded
                ? 'bg-red-100 text-red-600'
                : 'bg-indigo-100 text-indigo-600'
            }`}
          >
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p
            className={`text-2xl font-bold tracking-tight ${
              isBudgetExceeded ? 'text-red-600' : 'text-indigo-700'
            }`}
          >
            {formatINR(remainingBudget)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Limit: {formatINR(overallBudgetLimit)} (Limit - Spent)
          </p>
        </div>
      </Card>

      {/* Net Savings Card (Income - Expenses) */}
      <Card hover className="relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Net Cash Flow
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p
            className={`text-2xl font-bold tracking-tight ${
              netSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatINR(netSavings)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Income minus expenses</p>
        </div>
      </Card>
    </div>
  );
}
