'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { AppShell } from '../../../../components/layout/AppShell';
import { TransactionForm } from '../../../../components/transactions/TransactionForm';
import { Card, CardHeader } from '../../../../components/ui/Card';
import { LoadingState } from '../../../../components/ui/LoadingState';
import { ErrorState } from '../../../../components/ui/ErrorState';
import { fetchTransactionById, updateTransaction } from '../../../../lib/api';
import { Transaction, TransactionType, TransactionCategory, PaymentMethod } from '../../../../types';
import { Edit2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../../../../components/ui/Button';

function EditTransactionContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = React.use(params);
  const { id } = resolvedParams;

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTransaction() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchTransactionById(id);
        if (!data) {
          setError('Transaction not found. It may have been deleted.');
        } else {
          setTransaction(data);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error loading transaction');
      } finally {
        setIsLoading(false);
      }
    }
    loadTransaction();
  }, [id]);

  const handleUpdate = async (data: {
    description: string;
    amount: number;
    type: TransactionType;
    category: TransactionCategory;
    transactionDate: string;
    paymentMethod: PaymentMethod;
    notes?: string;
  }) => {
    await updateTransaction(id, data);
  };

  if (isLoading) {
    return <LoadingState message="Loading transaction details..." className="py-20" />;
  }

  if (error || !transaction) {
    return (
      <Card className="p-8 text-center">
        <ErrorState
          title="Transaction Not Found"
          message={error || 'Could not find the requested transaction record.'}
        />
        <div className="mt-4">
          <Link href="/transactions">
            <Button variant="outline" size="sm">
              Return to Transactions
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 sm:p-8">
      <CardHeader
        title={`Edit ${transaction.description}`}
        subtitle="Modify amount, category, date, or notes below."
        action={
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Edit2 className="w-4 h-4" />
          </div>
        }
      />
      <TransactionForm
        initialData={transaction}
        onSubmit={handleUpdate}
        isEditing={true}
      />
    </Card>
  );
}

export default function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <AppShell
      title="Edit Transaction"
      subtitle="Modify and update your recorded transaction"
      showAddButton={false}
    >
      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<LoadingState message="Loading editor..." className="py-20" />}>
          <EditTransactionContent params={params} />
        </Suspense>
      </div>
    </AppShell>
  );
}
