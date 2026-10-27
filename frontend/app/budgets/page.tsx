'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { BudgetModal } from '../../components/budgets/BudgetModal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import {
  fetchBudgets,
  fetchBudgetStatuses,
  saveBudget,
  deleteBudget,
} from '../../lib/api';
import { Budget, BudgetStatus, BudgetCategory } from '../../types';
import { formatINR, getAlertLevelStyles } from '../../lib/currency';
import {
  Plus,
  PiggyBank,
  Edit2,
  Trash2,
} from 'lucide-react';

export default function BudgetsPage() {
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [statuses, setStatuses] = useState<BudgetStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteBudgetId, setDeleteBudgetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadBudgetData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [budgetsList, statusList] = await Promise.all([
        fetchBudgets(selectedMonth),
        fetchBudgetStatuses(selectedMonth),
      ]);
      setBudgets(budgetsList);
      setStatuses(statusList);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load budgets');
    } finally {
      setIsLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    loadBudgetData();
  }, [loadBudgetData]);

  const handleSaveBudget = async (data: {
    month: string;
    category: BudgetCategory;
    limitAmount: number;
  }) => {
    await saveBudget(data);
    await loadBudgetData();
  };

  const handleConfirmDelete = async () => {
    if (!deleteBudgetId) return;
    setIsDeleting(true);
    try {
      await deleteBudget(deleteBudgetId);
      setDeleteBudgetId(null);
      await loadBudgetData();
    } finally {
      setIsDeleting(false);
    }
  };

  const overallStatus = statuses.find((s) => s.category === 'OVERALL');
  const categoryStatuses = statuses.filter((s) => s.category !== 'OVERALL');

  return (
    <AppShell
      title="Monthly Budgets & Limits"
      subtitle="Configure spending guardrails and monitor threshold warnings"
      selectedMonth={selectedMonth}
      onMonthChange={setSelectedMonth}
      showAddButton={false}
    >
      <div className="space-y-6">
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-white border border-slate-200/90 shadow-2xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Active Budgets for {selectedMonth}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Warning thresholds trigger automatically at 75%, 90% and 100% utilization.
            </p>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            + Set New Budget Limit
          </Button>
        </div>

        {isLoading ? (
          <LoadingState message="Loading budget configurations..." className="py-20" />
        ) : error ? (
          <ErrorState
            title="Unable to load budgets"
            message={error}
            onRetry={loadBudgetData}
          />
        ) : (
          <div className="space-y-6">
            {/* Overall Monthly Budget Section */}
            {overallStatus ? (
              <Card className="border-2 border-indigo-100 bg-linear-to-b from-indigo-50/20 to-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <PiggyBank className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">
                          Overall Monthly Budget Limit
                        </h3>
                        <span
                          className={`text-xs px-2 py-0.5 font-semibold rounded-full border ${
                            getAlertLevelStyles(overallStatus.alertLevel).badgeBg
                          }`}
                        >
                          {getAlertLevelStyles(overallStatus.alertLevel).label}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Controls primary dashboard remaining budget calculation
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const target = budgets.find((b) => b.category === 'OVERALL');
                        setEditingBudget(target || null);
                        setIsModalOpen(true);
                      }}
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    >
                      Edit Limit
                    </Button>
                  </div>
                </div>

                {/* Progress Visualizer */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">
                      Spent: {formatINR(overallStatus.spent)}
                    </span>
                    <span className="text-slate-900">
                      Limit: {formatINR(overallStatus.limit)} ({overallStatus.percentageUsed}%)
                    </span>
                  </div>

                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        getAlertLevelStyles(overallStatus.alertLevel).progressBar
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(0, overallStatus.percentageUsed))}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>
                      {overallStatus.remaining >= 0 ? (
                        <>
                          Remaining to spend:{' '}
                          <strong className="text-indigo-700 font-bold">
                            {formatINR(overallStatus.remaining)}
                          </strong>
                        </>
                      ) : (
                        <>
                          Over budget by:{' '}
                          <strong className="text-red-600 font-bold">
                            {formatINR(Math.abs(overallStatus.remaining))}
                          </strong>
                        </>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Formula: Limit - Total Spent
                    </span>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center border-dashed border-2 border-slate-300">
                <PiggyBank className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                <h3 className="font-bold text-slate-800 text-sm">
                  No overall monthly budget configured for {selectedMonth}
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                  Set an overall limit to unlock the remaining budget meter and student affordability checks.
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setEditingBudget(null);
                    setIsModalOpen(true);
                  }}
                >
                  Set Overall Monthly Limit
                </Button>
              </Card>
            )}

            {/* Category Budgets Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-xs">
                  Category-Specific Budgets ({categoryStatuses.length})
                </h3>
              </div>

              {categoryStatuses.length === 0 ? (
                <div className="p-6 rounded-xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                  No category budgets set. You can set limits for Food, Travel, Books, or Entertainment.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryStatuses.map((cat) => {
                    const styles = getAlertLevelStyles(cat.alertLevel);
                    const matchingBudget = budgets.find((b) => b.category === cat.category);

                    return (
                      <Card key={cat.category} className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">
                              {cat.categoryName}
                            </h4>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border inline-block mt-1 ${styles.badgeBg}`}
                            >
                              {styles.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingBudget(matchingBudget || null);
                                setIsModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-600 rounded-md transition-colors"
                              aria-label={`Edit ${cat.categoryName} budget`}
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            {matchingBudget && (
                              <button
                                type="button"
                                onClick={() => setDeleteBudgetId(matchingBudget.id)}
                                className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                                aria-label={`Delete ${cat.categoryName} budget`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${styles.progressBar}`}
                              style={{
                                width: `${Math.min(100, Math.max(0, cat.percentageUsed))}%`,
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                            <span>{formatINR(cat.spent)}</span>
                            <span>{cat.percentageUsed}% of {formatINR(cat.limit)}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 text-xs flex items-center justify-between">
                          <span className="text-slate-500">Remaining:</span>
                          <span
                            className={`font-semibold ${
                              cat.remaining >= 0 ? 'text-indigo-700' : 'text-red-600'
                            }`}
                          >
                            {formatINR(cat.remaining)}
                          </span>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal for adding/editing budget */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSave={handleSaveBudget}
        month={selectedMonth}
        initialBudget={editingBudget}
      />

      {/* Delete budget confirmation */}
      <ConfirmDialog
        isOpen={!!deleteBudgetId}
        onClose={() => setDeleteBudgetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Budget Limit"
        message="Are you sure you want to remove this budget limit? Spent amounts will still remain recorded."
        confirmText="Remove Limit"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </AppShell>
  );
}
