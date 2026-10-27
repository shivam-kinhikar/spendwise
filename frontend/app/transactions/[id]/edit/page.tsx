import { Suspense } from 'react';
import EditTransactionClient from './EditTransactionClient';
import { AppShell } from '../../../../components/layout/AppShell';
import { LoadingState } from '../../../../components/ui/LoadingState';

export function generateStaticParams() {
  return [{ id: 'edit' }];
}

export default function EditTransactionPage() {
  return (
    <AppShell
      title="Edit Transaction"
      subtitle="Modify and update your recorded transaction"
      showAddButton={false}
    >
      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<LoadingState message="Loading editor..." className="py-20" />}>
          <EditTransactionClient />
        </Suspense>
      </div>
    </AppShell>
  );
}
