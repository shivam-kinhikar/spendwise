import React from 'react';
import { Card, CardHeader } from '../ui/Card';
import { formatINR } from '../../lib/currency';
import { ArrowUpRight, ArrowDownRight, Minus, CalendarDays } from 'lucide-react';

interface MonthlyComparisonCardProps {
  currentMonth: string;
  currentExpenses: number;
  previousMonth: string;
  previousExpenses: number;
  changeAmount: number;
  changePercentage: number;
}

export function MonthlyComparisonCard({
  currentMonth,
  currentExpenses,
  previousMonth,
  previousExpenses,
  changeAmount,
  changePercentage,
}: MonthlyComparisonCardProps) {
  const isSpendingUp = changeAmount > 0;
  const isSpendingDown = changeAmount < 0;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Month-over-Month Comparison"
        subtitle={`Comparing ${currentMonth} against ${previousMonth}`}
        action={
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
            <CalendarDays className="w-4 h-4" />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 mb-4">
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase">
            {previousMonth} Spend
          </span>
          <p className="text-lg font-bold text-slate-700 mt-0.5">
            {formatINR(previousExpenses)}
          </p>
        </div>
        <div>
          <span className="text-[11px] font-semibold text-slate-500 uppercase">
            {currentMonth} Spend
          </span>
          <p className="text-lg font-bold text-slate-900 mt-0.5">
            {formatINR(currentExpenses)}
          </p>
        </div>
      </div>

      {/* Delta indicator */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-2">
          {isSpendingUp ? (
            <div className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-1 rounded-md border border-rose-200">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{Math.abs(changePercentage)}% ({formatINR(Math.abs(changeAmount))})</span>
            </div>
          ) : isSpendingDown ? (
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>-{Math.abs(changePercentage)}% ({formatINR(Math.abs(changeAmount))})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
              <Minus className="w-3.5 h-3.5" />
              <span>Equal to previous month</span>
            </div>
          )}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {isSpendingUp ? (
            <>
              You have spent <strong className="text-slate-900">{formatINR(changeAmount)} more</strong> than last month. Consider reviewing Food or Entertainment limits.
            </>
          ) : isSpendingDown ? (
            <>
              Great job! Your spending is <strong className="text-slate-900">{formatINR(Math.abs(changeAmount))} lower</strong> compared to the same period in {previousMonth}.
            </>
          ) : (
            <>Your spending is at the exact same pace as last month.</>
          )}
        </p>
      </div>
    </Card>
  );
}
