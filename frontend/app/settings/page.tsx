'use client';

import React, { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FormField, TextInput, SelectInput } from '../../components/ui/FormField';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { resetMockStore } from '../../lib/api';
import {
  IndianRupee,
  RotateCcw,
  GraduationCap,
  Cloud,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  const [currency] = useState('INR');
  const [studentName, setStudentName] = useState('Aarav Sharma');
  const [collegeName, setCollegeName] = useState('National Institute of Technology');
  const [email] = useState('student@university.edu.in');
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

        {/* Architecture & Authentication Roadmap */}
        <Card className="p-6 bg-slate-50 border-slate-200">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Cloud className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-900 text-sm">
                AWS Architecture Pipeline
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Currently running in <strong className="text-slate-800">Stage 1 (Frontend UI & Isolated Mock Store)</strong>.
                Stage 2 introduces the AWS SAM template with Lambda, DynamoDB, and Cognito User Pool.
                Stage 3 integrates live authentication with Amazon Cognito JWT claim verification.
              </p>
            </div>
          </div>
        </Card>

        {/* Reset Mock Data for Testing */}
        <Card className="p-6 border-red-200/80 bg-red-50/10">
          <CardHeader
            title="Reset Local Mock Data"
            subtitle="Restore transactions and monthly budgets back to the initial sample records"
            action={
              <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
            }
          />
          <p className="text-xs text-slate-600 mb-4 max-w-lg leading-relaxed">
            If you added, edited, or deleted transactions during testing and want to reset back to the pristine assessment seed data, click below.
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsResetConfirmOpen(true)}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset to Initial Mock Records
          </Button>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset All Mock Data?"
        message="This will reset all modified transactions and budgets back to the default seed dataset. Any custom entries created during this session will be replaced."
        confirmText="Confirm Reset"
        isDestructive={true}
      />
    </AppShell>
  );
}
