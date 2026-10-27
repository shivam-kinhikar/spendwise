'use client';

import React, { useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { formatINR, roundTo2Decimals } from '../../lib/currency';
import { HelpCircle, CheckCircle2, AlertTriangle, XCircle, Calculator, Info } from 'lucide-react';

interface AffordabilityCalculatorProps {
  currentRemainingBudget: number; // Overall budget limit - expenses
  overallBudgetLimit: number;
  totalExpenses: number;
}

export function AffordabilityCalculator({
  currentRemainingBudget,
  overallBudgetLimit,
  totalExpenses,
}: AffordabilityCalculatorProps) {
  const [purchaseInput, setPurchaseInput] = useState<string>('');

  const plannedAmount = parseFloat(purchaseInput);
  const isValidNumber = !isNaN(plannedAmount) && plannedAmount > 0;
  const isZero = !isNaN(plannedAmount) && plannedAmount === 0;
  const isNegative = !isNaN(plannedAmount) && plannedAmount < 0;

  // Calculation:
  // Projected remaining = Current remaining budget - Planned purchase
  const projectedRemaining = isValidNumber
    ? roundTo2Decimals(currentRemainingBudget - plannedAmount)
    : currentRemainingBudget;

  const projectedTotalExpenses = isValidNumber
    ? roundTo2Decimals(totalExpenses + plannedAmount)
    : totalExpenses;

  const projectedPercentage =
    overallBudgetLimit > 0
      ? roundTo2Decimals((projectedTotalExpenses / overallBudgetLimit) * 100)
      : 0;

  let verdict: {
    status: 'idle' | 'affordable' | 'caution' | 'exceeded' | 'invalid';
    title: string;
    description: string;
    color: string;
    icon: React.ReactNode;
  } = {
    status: 'idle',
    title: 'Enter an amount to evaluate',
    description: 'Type a planned expense to see how it affects your monthly budget.',
    color: 'bg-slate-50 text-slate-600 border-slate-200',
    icon: <HelpCircle className="w-5 h-5 text-slate-400" />,
  };

  if (isNegative) {
    verdict = {
      status: 'invalid',
      title: 'Invalid amount',
      description: 'Purchase amount cannot be negative.',
      color: 'bg-red-50 text-red-700 border-red-200',
      icon: <XCircle className="w-5 h-5 text-red-500" />,
    };
  } else if (isZero) {
    verdict = {
      status: 'invalid',
      title: 'Zero amount entered',
      description: 'Please enter a purchase amount greater than ₹0.00.',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    };
  } else if (isValidNumber) {
    if (projectedRemaining < 0) {
      verdict = {
        status: 'exceeded',
        title: 'Exceeds Monthly Budget',
        description: `This purchase will exceed your remaining monthly budget by ${formatINR(
          Math.abs(projectedRemaining)
        )}.`,
        color: 'bg-red-50 text-red-800 border-red-200',
        icon: <XCircle className="w-5 h-5 text-red-600" />,
      };
    } else if (projectedPercentage >= 90) {
      verdict = {
        status: 'caution',
        title: 'Budget Caution (≥90% used)',
        description: `You will have only ${formatINR(
          projectedRemaining
        )} remaining, pushing budget utilization to ${projectedPercentage}%.`,
        color: 'bg-orange-50 text-orange-800 border-orange-200',
        icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
      };
    } else if (projectedPercentage >= 75) {
      verdict = {
        status: 'caution',
        title: 'Within Budget (≥75% used)',
        description: `Affordable, but will leave ${formatINR(
          projectedRemaining
        )} in your monthly budget (${projectedPercentage}% used).`,
        color: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
      };
    } else {
      verdict = {
        status: 'affordable',
        title: 'Comfortably Affordable',
        description: `You can safely make this purchase. You will still have ${formatINR(
          projectedRemaining
        )} remaining this month.`,
        color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
      };
    }
  }

  return (
    <Card className="flex flex-col h-full bg-white">
      <CardHeader
        title="“Can I Afford This?”"
        subtitle="Evaluate planned student purchases before spending"
        action={
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Calculator className="w-4 h-4" />
          </div>
        }
      />

      <div className="space-y-4 flex-1">
        <div>
          <label
            htmlFor="planned-amount-input"
            className="block text-xs font-semibold text-slate-700 mb-1.5"
          >
            Planned Purchase Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-sm font-semibold text-slate-400">
              ₹
            </span>
            <input
              id="planned-amount-input"
              type="number"
              min="0"
              step="any"
              value={purchaseInput}
              onChange={(e) => setPurchaseInput(e.target.value)}
              placeholder="e.g. 750 (Books, concert, shoes)"
              className="w-full pl-8 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 font-medium"
            />
            {purchaseInput && (
              <button
                type="button"
                onClick={() => setPurchaseInput('')}
                className="absolute right-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-slate-400">Quick test:</span>
          {[250, 600, 1500, 3500].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setPurchaseInput(val.toString())}
              className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors font-medium"
            >
              ₹{val}
            </button>
          ))}
        </div>

        {/* Verdict Box */}
        <div className={`p-4 rounded-xl border ${verdict.color} transition-all`}>
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">{verdict.icon}</div>
            <div>
              <h4 className="text-sm font-bold tracking-tight">{verdict.title}</h4>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {verdict.description}
              </p>
            </div>
          </div>

          {isValidNumber && (
            <div className="mt-3 pt-2.5 border-t border-current/15 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="opacity-75 block text-[11px]">Current Remaining:</span>
                <span className="font-semibold">{formatINR(currentRemainingBudget)}</span>
              </div>
              <div>
                <span className="opacity-75 block text-[11px]">Projected Remaining:</span>
                <span
                  className={`font-bold ${
                    projectedRemaining < 0 ? 'underline' : ''
                  }`}
                >
                  {formatINR(projectedRemaining)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Educational Disclaimer */}
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500">
          <Info className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
          <span>
            Estimation based on your recorded transactions and configured monthly budget. Not professional financial advice.
          </span>
        </div>
      </div>
    </Card>
  );
}
