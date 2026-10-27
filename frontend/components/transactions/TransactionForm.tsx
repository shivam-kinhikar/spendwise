'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Transaction,
  TransactionType,
  TransactionCategory,
  PaymentMethod,
  TRANSACTION_CATEGORIES,
  PAYMENT_METHODS,
} from '../../types';
import { FormField, TextInput, SelectInput, TextAreaInput } from '../ui/FormField';
import { Button } from '../ui/Button';
import { Check, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface TransactionFormProps {
  initialData?: Transaction;
  onSubmit: (data: {
    description: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    transactionDate: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => Promise<void>;
  isEditing?: boolean;
}

export function TransactionForm({
  initialData,
  onSubmit,
  isEditing = false,
}: TransactionFormProps) {
  const router = useRouter();

  const [description, setDescription] = useState(initialData?.description || '');
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [type, setType] = useState<TransactionType>(initialData?.type || 'EXPENSE');
  const [category, setCategory] = useState<TransactionCategory>(
    initialData?.category || (initialData?.type === 'INCOME' ? 'Income' : 'Food')
  );
  const [transactionDate, setTransactionDate] = useState(
    initialData?.transactionDate || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    initialData?.paymentMethod || 'UPI'
  );
  const [notes, setNotes] = useState(initialData?.notes || '');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Set default date on mount for new records
  React.useEffect(() => {
    if (!initialData?.transactionDate && !transactionDate) {
      setTransactionDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialData, transactionDate]);

  // When type changes, auto-adjust category if needed
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'INCOME') {
      setCategory('Income');
    } else if (category === 'Income') {
      setCategory('Food');
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!description.trim()) {
      newErrors.description = 'Please enter a description for this record';
    } else if (description.trim().length < 2) {
      newErrors.description = 'Description must be at least 2 characters';
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      newErrors.amount = 'Amount is required';
    } else if (numAmount <= 0) {
      newErrors.amount = 'Amount must be greater than ₹0.00';
    } else if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
      newErrors.amount = 'Enter a valid amount with up to 2 decimal places';
    }

    if (!transactionDate) {
      newErrors.transactionDate = 'Please select a valid date';
    } else {
      const parsed = Date.parse(transactionDate);
      if (isNaN(parsed)) {
        newErrors.transactionDate = 'Invalid date format';
      }
    }

    if (!category) {
      newErrors.category = 'Please choose a category';
    }

    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        description: description.trim(),
        amount: parseFloat(amount),
        type,
        category,
        transactionDate,
        paymentMethod,
        notes: notes.trim() ? notes.trim() : undefined,
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        router.push('/transactions');
      }, 700);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save transaction';
      setApiError(message);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {apiError && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {submitSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>Transaction saved successfully! Redirecting...</span>
        </div>
      )}

      {/* Transaction Type Selector (Toggle) */}
      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-2">
          Record Type <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTypeChange('EXPENSE')}
            className={`py-2.5 px-4 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
              type === 'EXPENSE'
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            - Expense (Outflow)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('INCOME')}
            className={`py-2.5 px-4 rounded-lg text-sm font-semibold border transition-all cursor-pointer ${
              type === 'INCOME'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            + Income (Inflow)
          </button>
        </div>
      </div>

      {/* Description Field */}
      <FormField
        label="Description"
        id="description"
        required
        error={errors.description}
        helperText="e.g. Canteen lunch, Metro pass, Textbook, Stipend"
      >
        <TextInput
          id="description"
          placeholder="What was this for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={!!errors.description}
        />
      </FormField>

      {/* Amount and Date Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Amount (INR ₹)"
          id="amount"
          required
          error={errors.amount}
          helperText="Finite positive number with up to 2 decimal places"
        >
          <div className="relative">
            <span className="absolute left-3 top-2 text-sm font-semibold text-slate-400">
              ₹
            </span>
            <TextInput
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 font-semibold"
              error={!!errors.amount}
            />
          </div>
        </FormField>

        <FormField
          label="Transaction Date"
          id="transactionDate"
          required
          error={errors.transactionDate}
        >
          <TextInput
            id="transactionDate"
            type="date"
            value={transactionDate}
            onChange={(e) => setTransactionDate(e.target.value)}
            error={!!errors.transactionDate}
          />
        </FormField>
      </div>

      {/* Category and Payment Method */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Category"
          id="category"
          required
          error={errors.category}
        >
          <SelectInput
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value as TransactionCategory)}
            error={!!errors.category}
          >
            {TRANSACTION_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </SelectInput>
        </FormField>

        <FormField
          label="Payment Method"
          id="paymentMethod"
          required
          error={errors.paymentMethod}
        >
          <SelectInput
            id="paymentMethod"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            error={!!errors.paymentMethod}
          >
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </SelectInput>
        </FormField>
      </div>

      {/* Optional Notes */}
      <FormField
        label="Optional Notes"
        id="notes"
        helperText="Additional details, bill/receipt reference, or notes for yourself"
      >
        <TextAreaInput
          id="notes"
          rows={3}
          placeholder="Add any extra details here..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </FormField>

      {/* Form Submission Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <Link href="/transactions">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Transactions
          </Button>
        </Link>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
          disabled={isSubmitting || submitSuccess}
        >
          {isEditing ? 'Save Changes' : 'Record Transaction'}
        </Button>
      </div>
    </form>
  );
}
