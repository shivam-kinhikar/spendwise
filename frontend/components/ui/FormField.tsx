import React from 'react';

interface BaseFieldProps {
  label: string;
  id: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  className?: string;
}

export function FormField({
  label,
  id,
  error,
  helperText,
  required = false,
  className = '',
  children,
}: BaseFieldProps & { children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-slate-800 flex items-center justify-between">
        <span>
          {label}
          {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </span>
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-red-600 font-medium" role="alert">
          {error}
        </p>
      ) : helperText ? (
        <p id={`${id}-helper`} className="text-xs text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function TextInput({ error, className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 ${
        error ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 hover:border-slate-400'
      } ${className}`}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function SelectInput({ error, className = '', children, ...props }: SelectProps) {
  return (
    <select
      className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 ${
        error ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 hover:border-slate-400'
      } ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function TextAreaInput({ error, className = '', ...props }: TextAreaProps) {
  return (
    <textarea
      className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-colors focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 placeholder:text-slate-400 ${
        error ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 hover:border-slate-400'
      } ${className}`}
      {...props}
    />
  );
}
