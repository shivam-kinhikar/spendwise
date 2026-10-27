'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { FormField, TextInput, SelectInput } from '../ui/FormField';
import { Button } from '../ui/Button';
import { Budget, BudgetCategory, EXPENSE_CATEGORIES } from '../../types';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { month: string; category: BudgetCategory; limitAmount: number }) => Promise<void>;
  month: string;
  initialBudget?: Budget | null;
}

export function BudgetModal({
  isOpen,
  onClose,
  onSave,
  month,
  initialBudget,
}: BudgetModalProps) {
  const [category, setCategory] = useState<BudgetCategory>('OVERALL');
  const [limitAmount, setLimitAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialBudget) {
      setCategory(initialBudget.category);
      setLimitAmount(initialBudget.limitAmount.toString());
    } else {
      setCategory('OVERALL');
      setLimitAmount('');
    }
    setError(null);
  }, [initialBudget, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(limitAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid budget limit greater than ₹0.00');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        month,
        category,
        limitAmount: amount,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save budget limit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialBudget ? 'Edit Budget Limit' : 'Set Budget Limit'}
      description={`Configuring spending limits for ${month}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Budget Scope" id="budget-category" required>
          <SelectInput
            id="budget-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as BudgetCategory)}
            disabled={!!initialBudget}
          >
            <option value="OVERALL">Overall Monthly Limit (Entire Month)</option>
            <optgroup label="Specific Categories">
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </optgroup>
          </SelectInput>
        </FormField>

        <FormField
          label="Budget Limit (INR ₹)"
          id="budget-limit-amount"
          required
          error={error || undefined}
          helperText="Maximum student spending limit before alerts trigger"
        >
          <div className="relative">
            <span className="absolute left-3 top-2 text-sm font-semibold text-slate-400">
              ₹
            </span>
            <TextInput
              id="budget-limit-amount"
              type="number"
              step="100"
              min="1"
              placeholder="e.g. 5000"
              value={limitAmount}
              onChange={(e) => {
                setLimitAmount(e.target.value);
                setError(null);
              }}
              className="pl-8 font-semibold"
            />
          </div>
        </FormField>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
            Save Budget
          </Button>
        </div>
      </form>
    </Modal>
  );
}
