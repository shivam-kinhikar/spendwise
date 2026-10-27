'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormField, TextInput, SelectInput } from '../../components/ui/FormField';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { resetMockStore } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import {
  IndianRupee,
  RotateCcw,
  GraduationCap,
  Cloud,
  Check,
  Trash2,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, isRealAuth } = useAuth();
  const [currency] = useState('INR');
  const [studentName, setStudentName] = useState(user?.name || 'Student User');
  const [collegeName, setCollegeName] = useState(user?.college || 'Campus University');
  const [email] = useState(user?.email || 'student@spendwise.app');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2000);
  };

  const handleConfirmReset = () => {
    resetMockStore();
    setIsResetConfirmOpen(false);
    window.location.reload();
  };

  return (
    <AppShell
      title="Application Settings"
      subtitle="Manage your student preferences, currency, and local data"
      showAddButton={false}
    >
      <div className="max-w-3xl space-y-6">
        {/* Currency Preference Card */}
        <Card className="p-6">
          <CardHeader
            title="Currency Preference"
            subtitle="Default currency formatting used across all charts, tables, and budgets"
            action={
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <IndianRupee className="w-4 h-4" />
              </div>
            }
          />
          <div className="max-w-md space-y-3">
            <FormField
              label="Selected Currency"
              id="currency-select"
              helperText="Indian Rupee (₹) is the required standard for SpendWise."
            >
              <SelectInput id="currency-select" value={currency} disabled>
                <option value="INR">INR (₹) — Indian Rupee (Default)</option>
              </SelectInput>
            </FormField>
          </div>
        </Card>

        {/* Student Profile Settings */}
        <Card className="p-6">
          <CardHeader
            title="Student Profile"
            subtitle="Your student credentials and institution details"
            action={
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <GraduationCap className="w-4 h-4" />
              </div>
            }
          />

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
            {showSavedFeedback && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Student preferences updated locally!</span>
              </div>
            )}

            <FormField label="Full Name" id="student-name">
              <TextInput
                id="student-name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </FormField>

            <FormField label="University / College" id="college-name">
              <TextInput
                id="college-name"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
              />
            </FormField>

            <FormField
              label="Student Email Address"
              id="student-email"
              helperText="Managed by Amazon Cognito User Pool in Stage 3"
            >
              <TextInput
                id="student-email"
                type="email"
                value={email}
                disabled
                className="bg-slate-50 cursor-not-allowed text-slate-500"
              />
            </FormField>

            <Button type="submit" size="sm" variant="primary">
              Save Preferences
            </Button>
          </form>
        </Card>

        {/* Architecture & Authentication Pipeline */}
        <Card className="p-6 bg-slate-50 border-slate-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Cloud className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">
                SpendWise Cloud & Serverless Infrastructure
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isRealAuth ? (
                  <>
                    Operating in <strong className="text-slate-800">AWS Cloud Connected Mode</strong>. Transactions and budgets are stored in DynamoDB under your authenticated Cognito identity.
                  </>
                ) : (
                  <>
                    Operating in <strong className="text-slate-800">Clean Local Mode</strong> with zero demo data. All transactions and limits you create persist privately in your browser.
                  </>
                )}
              </p>
            </div>
          </div>
        </Card>

        {/* Clear Local Data */}
        <Card className="p-6 border-red-200/80 bg-red-50/10">
          <CardHeader
            title="Clear Local Records"
            subtitle="Erase all stored transactions and monthly budgets to start fresh"
            action={
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
            }
          />
          <p className="text-xs text-slate-600 mb-4 max-w-lg leading-relaxed">
            Wipes all transactions and budget limits recorded in this local session. Useful if you want to start over with a completely empty ledger.
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsResetConfirmOpen(true)}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Clear All Local Data
          </Button>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Clear All Local Data?"
        message="This will permanently remove all transactions and monthly budgets stored in this browser session, resetting your dashboard to a clean slate. This action cannot be undone."
        confirmText="Yes, Clear All Data"
        isDestructive={true}
      />
    </AppShell>
  );
}
