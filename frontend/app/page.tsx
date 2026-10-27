import React from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  PiggyBank,
  Calculator,
  BellRing,
  PieChart,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation Bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 text-lg tracking-tight">SpendWise</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Student Edition
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="px-4 sm:px-6 py-16 sm:py-24 max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-6 animate-in fade-in">
            <ShieldCheck className="w-4 h-4" />
            <span>Private & Secure • Zero Real Bank Account Connections</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Master your student expenses with{' '}
            <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">
              confidence
            </span>
            .
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            SpendWise helps students record allowances, track hostel and study expenses, maintain monthly budgets, and answer <strong className="text-slate-900 font-semibold">“Can I Afford This?”</strong> before buying.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto text-base px-7" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Launch Student Dashboard
              </Button>
            </Link>
            <Link href="/transactions/new" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                + Record a Transaction
              </Button>
            </Link>
          </div>

          {/* Quick Metrics / Guarantees Banner */}
          <div className="mt-14 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                <Calculator className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Affordability Check</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Instant check before making purchases</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
                <BellRing className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">75%, 90%, 100% Alerts</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Early warnings before limits break</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-2">
                <PieChart className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Category Insights</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Understand mess, travel, and books</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <PiggyBank className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Indian Rupee (₹)</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Native INR formatting & UPI methods</p>
            </div>
          </div>
        </section>

        {/* Feature Overview Section */}
        <section className="py-16 bg-white border-t border-slate-200/80">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Designed for college life and student realities
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Everything you need to stay on top of pocket money, stipends, and shared flat expenses without complicated banking setups.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-slate-200 bg-[#FBFBFA]">
                <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider block mb-2">
                  01. Complete Control
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Track Income & Expenses
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Log campus canteen food, monthly metro passes, textbook purchases, and tutoring stipends with date, payment mode (UPI, Cash, Debit Card), and notes.
                </p>
                <ul className="text-xs text-slate-500 space-y-1.5">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Real-time search and multi-criteria filters</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Single-click record editing and deletion</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 bg-[#FBFBFA]">
                <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider block mb-2">
                  02. Smart Limits
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Monthly & Category Budgets
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Set an overall ceiling for the month, and create optional guardrails for food or entertainment so you don&apos;t run out of funds before semester exams.
                </p>
                <ul className="text-xs text-slate-500 space-y-1.5">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Progress indicators with 75%, 90%, 100% warnings</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Consistent math: Limit minus spent</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 rounded-2xl border border-slate-200 bg-[#FBFBFA]">
                <span className="text-indigo-600 text-xs font-bold uppercase tracking-wider block mb-2">
                  03. Decision Support
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  “Can I Afford This?” Calculator
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Contemplating a new pair of sneakers or an out-of-town festival trip? Type in the amount to immediately see your projected remaining balance.
                </p>
                <ul className="text-xs text-slate-500 space-y-1.5">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Real-time safety verdict and warnings</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Prevents overdraft and student debt traps</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
        <p>
          SpendWise — Built for Cybernetics Software Pvt. Ltd. Junior Software Developer Assessment.
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Designed with Next.js App Router, Tailwind CSS, TypeScript, and AWS Serverless Architecture.
        </p>
      </footer>
    </div>
  );
}
