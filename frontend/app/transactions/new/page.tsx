'use client';

import React from 'react';
import { AppShell } from '../../../components/layout/AppShell';
import { TransactionForm } from '../../../components/transactions/TransactionForm';
import { Card, CardHeader } from '../../../components/ui/Card';
import { createTransaction } from '../../../lib/api';
import { TransactionType, TransactionCategory, PaymentMethod } from '../../../types';
import { PlusCircle } from 'lucide-react';

export default function NewTransactionPage() {
  const handleCreate = async (data: {
    description: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    transactionDate: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => {
    await createTransaction(data);
  };

  return (
    <AppShell
      title="Add Transaction"
      subtitle="Record a new expense or student income entry"
      showAddButton={false}
    >
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 sm:p-8">
          <CardHeader
            title="New Transaction Record"
            subtitle="Fill in the transaction details below. All fields marked with * are required."
            action={
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <PlusCircle className="w-4 h-4" />
              </div>
            }
          />
          <TransactionForm onSubmit={handleCreate} isEditing={false} />
        </Card>
      </div>
    </AppShell>
  );
}
