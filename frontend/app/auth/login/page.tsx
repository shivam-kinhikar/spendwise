'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormField, TextInput } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../lib/auth';
import { GraduationCap, ArrowRight, Info, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isRealAuth } = useAuth();
  const [email, setEmail] = useState('student@university.edu.in');
  const [password, setPassword] = useState('SpendWise#2026');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unable to sign in. Please verify your credentials.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="font-extrabold text-slate-900 text-2xl tracking-tight">
            SpendWise
          </span>
        </Link>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Sign in to your Student Account
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Access your personal finances, budgets, and savings goals
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
          {/* Status Note */}
          <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-2.5 text-xs text-indigo-900">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {isRealAuth ? (
                <span>
                  <strong>Amazon Cognito Active:</strong> Authenticating directly against your deployed AWS Cognito User Pool.
                </span>
              ) : (
                <span>
                  <strong>Local Mock Mode:</strong> Cognito public environment variables can be provided in <code>.env.local</code>. Click below to explore with demo credentials.
                </span>
              )}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignIn} className="space-y-4">
            <FormField label="Student Email" id="email" required>
              <TextInput
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu.in"
              />
            </FormField>

            <FormField label="Password" id="password" required>
              <TextInput
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
            </FormField>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {isRealAuth ? 'Enter your Cognito credentials' : 'Demo student credentials pre-filled'}
              </span>
              <span className="text-indigo-600 font-medium">
                {isRealAuth ? 'AWS Cloud' : 'Stage 3 Integrated'}
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full text-sm"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Dashboard
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don&apos;t have an account?{' '}
            <Link href="/auth/register" className="font-semibold text-indigo-600 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
