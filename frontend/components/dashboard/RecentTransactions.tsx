import React from 'react';
import Link from 'next/link';
import { Card, CardHeader } from '../ui/Card';
import { Transaction } from '../../types';
import { formatINR } from '../../lib/currency';
import { CategoryBadge } from '../ui/Badge';
import { ArrowRight, Receipt } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const recent = transactions.slice(0, 5);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Recent Transactions"
        subtitle="Latest 5 student spending & income records"
        action={
          <Link
            href="/transactions"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        }
      />

      {recent.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
            <Receipt className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500">No transactions recorded yet.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 flex-1">
          {recent.map((tx) => (
            <div
              key={tx.id}
              className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                    {tx.description}
                  </p>
                  <CategoryBadge category={tx.category} />
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span>{tx.transactionDate}</span>
                  <span>•</span>
                  <span>{tx.paymentMethod}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`text-sm font-bold block ${
                    tx.type === 'INCOME' ? 'text-emerald-600' : 'text-slate-900'
                  }`}
                >
                  {tx.type === 'INCOME' ? '+' : '-'} {formatINR(tx.amount)}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {tx.type.toLowerCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
