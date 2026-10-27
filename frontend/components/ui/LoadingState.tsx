import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({
  message = 'Loading data...',
  className = 'py-12',
}: LoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-slate-500 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="animate-pulse flex items-center justify-between p-4 border-b border-slate-100">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-200 rounded-lg"></div>
        <div className="space-y-1.5">
          <div className="h-4 w-32 bg-slate-200 rounded-sm"></div>
          <div className="h-3 w-20 bg-slate-100 rounded-sm"></div>
        </div>
      </div>
      <div className="h-4 w-16 bg-slate-200 rounded-sm"></div>
    </div>
  );
}
