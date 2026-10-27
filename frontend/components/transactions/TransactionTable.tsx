'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Transaction } from '../../types';
import { formatINR } from '../../lib/currency';
import { CategoryBadge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Edit2, Trash2 } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete: (id: string) => Promise<void>;
}

const ITEMS_PER_PAGE = 8;

export function TransactionTable({
  transactions,
  onDelete,
}: TransactionTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await onDelete(deleteId);
      setDeleteId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                    {tx.transactionDate}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{tx.description}</div>
                    {tx.notes && (
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {tx.notes}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <CategoryBadge category={tx.category} />
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap font-medium">
                    {tx.paymentMethod}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <span
                      className={`font-bold ${
                        tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : '-'} {formatINR(tx.amount)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <Link href={`/transactions/${tx.id}/edit`}>
                        <button
                          type="button"
                          aria-label={`Edit ${tx.description}`}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteId(tx.id)}
                        aria-label={`Delete ${tx.description}`}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card List View */}
        <div className="md:hidden divide-y divide-slate-100">
          {paginatedTransactions.map((tx) => (
            <div key={tx.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{tx.description}</h4>
                  <p className="text-[11px] text-slate-400">
                    {tx.transactionDate} • {tx.paymentMethod}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-bold block ${
                      tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {tx.type === 'INCOME' ? '+' : '-'} {formatINR(tx.amount)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <CategoryBadge category={tx.category} />
                <div className="flex items-center gap-2">
                  <Link href={`/transactions/${tx.id}/edit`}>
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2.5">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs px-2.5 text-red-600 hover:bg-red-50"
                    onClick={() => setDeleteId(tx.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs">
            <span className="text-slate-500">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, transactions.length)} of{' '}
              {transactions.length} transactions
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="px-2 font-medium text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction record? This action will update your monthly budget calculations and cannot be undone."
        confirmText="Delete Record"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </>
  );
}
