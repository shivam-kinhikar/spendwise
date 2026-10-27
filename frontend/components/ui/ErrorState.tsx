import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className = 'py-12',
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center px-4 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-3 border border-red-200">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-red-600 max-w-sm mt-1 mb-5">{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" onClick={onRetry} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Try Again
        </Button>
      )}
    </div>
  );
}
