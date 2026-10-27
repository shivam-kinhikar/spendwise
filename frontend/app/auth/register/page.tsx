'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormField, TextInput } from '../../../components/ui/FormField';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../lib/auth';
import { GraduationCap, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { signUp, confirmSignUp, isRealAuth } = useAuth();

  const [step, setStep] = useState<'register' | 'confirm'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [college, setCollege] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await signUp(email, password, name, college);
      if (isRealAuth) {
        setStep('confirm');
        setSuccessMessage('Verification code sent to your email! Please enter it below.');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await confirmSignUp(email, verificationCode);
      setSuccessMessage('Account verified successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification code failed');
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
          {step === 'register' ? 'Create Student Account' : 'Verify Email Address'}
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          {step === 'register'
            ? 'Take charge of your pocket money and college budgets'
            : `Enter the 6-digit confirmation code sent to ${email}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {step === 'register' ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <FormField label="Full Name" id="reg-name" required>
                <TextInput
                  id="reg-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Patel"
                />
              </FormField>

              <FormField label="College / Institution" id="reg-college">
                <TextInput
                  id="reg-college"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Delhi Technological University"
                />
              </FormField>

              <FormField label="Student Email" id="reg-email" required>
                <TextInput
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="priya@dtu.ac.in"
                />
              </FormField>

              <FormField
                label="Password"
                id="reg-password"
                required
                helperText="Minimum 8 characters (Cognito requirement)"
              >
                <TextInput
                  id="reg-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
              </FormField>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full text-sm"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign Up & Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={handleConfirmCode} className="space-y-4">
              <FormField
                label="Confirmation Code"
                id="verification-code"
                required
                helperText="Check your email inbox or spam folder"
              >
                <TextInput
                  id="verification-code"
                  required
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  className="text-center tracking-widest text-lg font-bold"
                />
              </FormField>

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full text-sm"
                isLoading={isLoading}
              >
                Verify & Activate Account
              </Button>

              <button
                type="button"
                onClick={() => setStep('register')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800"
              >
                ← Back to registration form
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-indigo-600 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
