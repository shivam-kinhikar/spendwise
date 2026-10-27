'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '../../components/layout/AppShell';
import { TransactionFilters } from '../../components/transactions/TransactionFilters';
import { TransactionTable } from '../../components/transactions/TransactionTable';
import { LoadingState } from '../../components/ui/LoadingState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { fetchTransactions, deleteTransaction } from '../../lib/api';
import { Transaction } from '../../types';
import { Receipt } from 'lucide-react';

export default function TransactionsPage() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  const hasActiveFilters =
    search.trim() !== '' ||
    category !== 'ALL' ||
    type !== 'ALL' ||
    startDate !== '' ||
    endDate !== '' ||
    sortBy !== 'date-desc';

  const handleResetFilters = () => {
    setSearch('');
    setCategory('ALL');
    setType('ALL');
    setStartDate('');
    setEndDate('');
    setSortBy('date-desc');
  };

  const loadTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchTransactions({
        search,
        category,
        type,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        sortBy: sortBy as 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc',
      });
      setTransactions(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  }, [search, category, type, startDate, endDate, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadTransactions();
    }, 150);
    return () => clearTimeout(timer);
  }, [loadTransactions]);

  const handleDelete = async (id: string) => {
    await deleteTransaction(id);
    await loadTransactions();
  };

  return (
    <AppShell
      title="Transaction Records"
      subtitle="Track, search, and manage all your income and expense transactions"
      showAddButton={true}
    >
      <div className="space-y-4">
        {/* Filter Controls */}
        <TransactionFilters
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          type={type}
          onTypeChange={setType}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          sortBy={sortBy}
          onSortByChange={setSortBy}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Content Area */}
        {isLoading ? (
          <LoadingState message="Loading transactions..." className="py-20" />
        ) : error ? (
          <ErrorState
            title="Unable to load transactions"
            message={error}
            onRetry={loadTransactions}
          />
        ) : transactions.length === 0 ? (
          <EmptyState
            title={hasActiveFilters ? 'No transactions match filters' : 'No transactions recorded yet'}
            description={
              hasActiveFilters
                ? 'Try clearing or widening your search query, date range, or category filter.'
                : 'Start tracking your student pocket money and daily campus expenses.'
            }
            actionLabel={hasActiveFilters ? 'Reset Filters' : '+ Add First Record'}
            onAction={
              hasActiveFilters
                ? handleResetFilters
                : () => {
                    router.push('/transactions/new');
                  }
            }
            icon={<Receipt className="w-6 h-6 text-slate-400" />}
          />
        ) : (
          <TransactionTable
            transactions={transactions}
            onDelete={handleDelete}
          />
        )}
      </div>
    </AppShell>
  );
}
