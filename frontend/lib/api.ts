import {
  Transaction,
  Budget,
  AnalyticsSummary,
  BudgetStatus,
  TransactionFilterParams,
  TransactionCategory,
  EXPENSE_CATEGORIES,
} from '../types';
import { INITIAL_MOCK_TRANSACTIONS, INITIAL_MOCK_BUDGETS } from './mockData';
import { roundTo2Decimals, getBudgetAlertLevel } from './currency';
import { cognitoGetSessionToken } from './cognito';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const USE_REAL_API = process.env.NEXT_PUBLIC_USE_REAL_API === 'true' && !!API_BASE_URL;

// =================================================================
// SHARED HTTP REQUEST HELPER FOR AWS API GATEWAY
// =================================================================

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { requiresAuth = true, headers = {}, ...rest } = options;

  const url = `${API_BASE_URL.replace(/\/$/, '')}${path}`;
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  // Attach Cognito JWT Access Token if endpoint requires authentication
  if (requiresAuth) {
    const token = await cognitoGetSessionToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
    });
  } catch (netErr: unknown) {
    const msg = netErr instanceof Error ? netErr.message : 'Network error';
    throw new Error(`Unable to connect to SpendWise API: ${msg}`);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  interface BackendEnvelope {
    success?: boolean;
    data?: T;
    error?: {
      message?: string;
      code?: string;
      fieldErrors?: Record<string, string>;
    };
    message?: string;
  }

  let body: BackendEnvelope | null = null;
  try {
    const raw = await response.json();
    body = raw as BackendEnvelope;
  } catch {
    body = null;
  }

  if (!response.ok) {
    const errorMessage =
      body?.error?.message ||
      body?.message ||
      `Request failed with status ${response.status}`;

    const err = new Error(errorMessage) as Error & {
      status?: number;
      code?: string;
      fieldErrors?: Record<string, string>;
    };
    err.status = response.status;
    err.code = body?.error?.code;
    err.fieldErrors = body?.error?.fieldErrors;
    throw err;
  }

  if (body && body.data !== undefined) {
    return body.data as T;
  }
  return body as unknown as T;
}

// =================================================================
// OFFLINE / LOCAL MOCK STORAGE FALLBACK
// =================================================================

const STORAGE_KEY_TX = 'spendwise_mock_transactions_v1';
const STORAGE_KEY_BUDGETS = 'spendwise_mock_budgets_v1';

let memoryTransactions: Transaction[] = [...INITIAL_MOCK_TRANSACTIONS];
let memoryBudgets: Budget[] = [...INITIAL_MOCK_BUDGETS];

function getStoredTransactions(): Transaction[] {
  if (typeof window === 'undefined') return memoryTransactions;
  try {
    const item = window.localStorage.getItem(STORAGE_KEY_TX);
    if (!item) {
      window.localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(INITIAL_MOCK_TRANSACTIONS));
      return INITIAL_MOCK_TRANSACTIONS;
    }
    return JSON.parse(item);
  } catch {
    return memoryTransactions;
  }
}

function saveStoredTransactions(txs: Transaction[]) {
  memoryTransactions = txs;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(txs));
    } catch {
      // Storage fallback
    }
  }
}

function getStoredBudgets(): Budget[] {
  if (typeof window === 'undefined') return memoryBudgets;
  try {
    const item = window.localStorage.getItem(STORAGE_KEY_BUDGETS);
    if (!item) {
      window.localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(INITIAL_MOCK_BUDGETS));
      return INITIAL_MOCK_BUDGETS;
    }
    return JSON.parse(item);
  } catch {
    return memoryBudgets;
  }
}

function saveStoredBudgets(budgets: Budget[]) {
  memoryBudgets = budgets;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
    } catch {
      // Storage fallback
    }
  }
}

export function resetMockStore(): void {
  memoryTransactions = [...INITIAL_MOCK_TRANSACTIONS];
  memoryBudgets = [...INITIAL_MOCK_BUDGETS];
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY_TX);
    window.localStorage.removeItem(STORAGE_KEY_BUDGETS);
  }
}

// =================================================================
// TRANSACTIONS API METHODS
// =================================================================

export async function fetchTransactions(filters?: TransactionFilterParams): Promise<Transaction[]> {
  if (USE_REAL_API) {
    const query = new URLSearchParams();
    if (filters?.month) query.set('month', filters.month);
    if (filters?.startDate) query.set('startDate', filters.startDate);
    if (filters?.endDate) query.set('endDate', filters.endDate);
    if (filters?.category && filters.category !== 'ALL') query.set('category', filters.category);
    if (filters?.type && filters.type !== 'ALL') query.set('type', filters.type);

    const qs = query.toString();
    const data = await apiRequest<{ transactions: Transaction[] }>(
      `/transactions${qs ? `?${qs}` : ''}`
    );
    let items = data.transactions || [];

    if (filters?.search && filters.search.trim() !== '') {
      const q = filters.search.trim().toLowerCase();
      items = items.filter(
        (t) =>
          t.description.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          t.paymentMethod.toLowerCase().includes(q)
      );
    }
    return items;
  }

  // Fallback to local mock store
  await new Promise((r) => setTimeout(r, 60));
  let txs = getStoredTransactions();

  if (filters?.month) {
    txs = txs.filter((t) => t.transactionDate.startsWith(filters.month!));
  }
  if (filters?.startDate) {
    txs = txs.filter((t) => t.transactionDate >= filters.startDate!);
  }
  if (filters?.endDate) {
    txs = txs.filter((t) => t.transactionDate <= filters.endDate!);
  }
  if (filters?.category && filters.category !== 'ALL') {
    txs = txs.filter((t) => t.category.toLowerCase() === filters.category!.toLowerCase());
  }
  if (filters?.type && filters.type !== 'ALL') {
    txs = txs.filter((t) => t.type === filters.type);
  }
  if (filters?.search && filters.search.trim() !== '') {
    const q = filters.search.trim().toLowerCase();
    txs = txs.filter(
      (t) =>
        t.description.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        t.paymentMethod.toLowerCase().includes(q)
    );
  }

  const sortBy = filters?.sortBy || 'date-desc';
  return [...txs].sort((a, b) => {
    if (sortBy === 'date-desc') return b.transactionDate.localeCompare(a.transactionDate);
    if (sortBy === 'date-asc') return a.transactionDate.localeCompare(b.transactionDate);
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    return 0;
  });
}

export async function fetchTransactionById(id: string): Promise<Transaction | null> {
  if (USE_REAL_API) {
    try {
      return await apiRequest<Transaction>(`/transactions/${id}`);
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'status' in err &&
        (err as { status: number }).status === 404
      ) {
        return null;
      }
      throw err;
    }
  }

  await new Promise((r) => setTimeout(r, 50));
  const txs = getStoredTransactions();
  return txs.find((t) => t.id === id || t.transactionId === id) || null;
}

export async function createTransaction(
  payload: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Transaction> {
  if (USE_REAL_API) {
    return await apiRequest<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  await new Promise((r) => setTimeout(r, 80));
  const now = new Date().toISOString();
  const newTx: Transaction = {
    ...payload,
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    amount: roundTo2Decimals(payload.amount),
    description: payload.description.trim(),
    createdAt: now,
    updatedAt: now,
  };

  const txs = getStoredTransactions();
  saveStoredTransactions([newTx, ...txs]);
  return newTx;
}

export async function updateTransaction(
  id: string,
  payload: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Transaction> {
  if (USE_REAL_API) {
    return await apiRequest<Transaction>(`/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  await new Promise((r) => setTimeout(r, 80));
  const txs = getStoredTransactions();
  const index = txs.findIndex((t) => t.id === id || t.transactionId === id);
  if (index === -1) throw new Error('Transaction not found');

  const existing = txs[index];
  const updatedAmount =
    payload.amount !== undefined ? roundTo2Decimals(payload.amount) : existing.amount;

  const updatedTx: Transaction = {
    ...existing,
    ...payload,
    amount: updatedAmount,
    description: payload.description ? payload.description.trim() : existing.description,
    updatedAt: new Date().toISOString(),
  };

  txs[index] = updatedTx;
  saveStoredTransactions(txs);
  return updatedTx;
}

export async function deleteTransaction(id: string): Promise<void> {
  if (USE_REAL_API) {
    await apiRequest<void>(`/transactions/${id}`, {
      method: 'DELETE',
    });
    return;
  }

  await new Promise((r) => setTimeout(r, 60));
  const txs = getStoredTransactions();
  const filtered = txs.filter((t) => t.id !== id && t.transactionId !== id);
  saveStoredTransactions(filtered);
}

// =================================================================
// BUDGETS API METHODS
// =================================================================

export async function fetchBudgets(month?: string): Promise<Budget[]> {
  if (USE_REAL_API) {
    const data = await apiRequest<{ budgets: Budget[] }>(
      `/budgets${month ? `?month=${month}` : ''}`
    );
    return data.budgets || [];
  }

  await new Promise((r) => setTimeout(r, 50));
  const budgets = getStoredBudgets();
  return month ? budgets.filter((b) => b.month === month) : budgets;
}

export async function saveBudget(
  payload: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Budget> {
  if (USE_REAL_API) {
    return await apiRequest<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  await new Promise((r) => setTimeout(r, 60));
  const budgets = getStoredBudgets();
  const existingIndex = budgets.findIndex(
    (b) => b.month === payload.month && b.category === payload.category
  );

  const now = new Date().toISOString();
  if (existingIndex >= 0) {
    const updated: Budget = {
      ...budgets[existingIndex],
      limitAmount: roundTo2Decimals(payload.limitAmount),
      updatedAt: now,
    };
    budgets[existingIndex] = updated;
    saveStoredBudgets(budgets);
    return updated;
  } else {
    const newBudget: Budget = {
      ...payload,
      id: `bdg-${payload.month}-${payload.category.toLowerCase()}-${Date.now()}`,
      limitAmount: roundTo2Decimals(payload.limitAmount),
      createdAt: now,
      updatedAt: now,
    };
    budgets.push(newBudget);
    saveStoredBudgets(budgets);
    return newBudget;
  }
}

export async function deleteBudget(id: string): Promise<void> {
  if (USE_REAL_API) {
    await apiRequest<void>(`/budgets/${id}`, {
      method: 'DELETE',
    });
    return;
  }

  await new Promise((r) => setTimeout(r, 50));
  const budgets = getStoredBudgets();
  saveStoredBudgets(budgets.filter((b) => b.id !== id && b.budgetId !== id));
}

// =================================================================
// ANALYTICS & DERIVED DATA
// =================================================================

export async function fetchAnalyticsSummary(targetMonth: string = '2026-10'): Promise<AnalyticsSummary> {
  if (USE_REAL_API) {
    return await apiRequest<AnalyticsSummary>(`/analytics/summary?month=${targetMonth}`);
  }

  // Consistent offline calculation
  const allTxs = getStoredTransactions();
  const allBudgets = getStoredBudgets();

  const monthTxs = allTxs.filter((t) => t.transactionDate.startsWith(targetMonth));

  let totalIncome = 0;
  let totalExpenses = 0;
  const categorySpendMap: Record<string, { amount: number; count: number }> = {};

  EXPENSE_CATEGORIES.forEach((cat) => {
    categorySpendMap[cat] = { amount: 0, count: 0 };
  });

  monthTxs.forEach((tx) => {
    if (tx.type === 'INCOME') {
      totalIncome += tx.amount;
    } else {
      totalExpenses += tx.amount;
      if (!categorySpendMap[tx.category]) {
        categorySpendMap[tx.category] = { amount: 0, count: 0 };
      }
      categorySpendMap[tx.category].amount += tx.amount;
      categorySpendMap[tx.category].count += 1;
    }
  });

  totalIncome = roundTo2Decimals(totalIncome);
  totalExpenses = roundTo2Decimals(totalExpenses);
  const netSavings = roundTo2Decimals(totalIncome - totalExpenses);

  const overallBudget = allBudgets.find(
    (b) => b.month === targetMonth && b.category === 'OVERALL'
  );
  const overallBudgetLimit = overallBudget ? overallBudget.limitAmount : 0;
  const remainingBudget = roundTo2Decimals(overallBudgetLimit - totalExpenses);

  const overallBudgetPercentage =
    overallBudgetLimit > 0
      ? roundTo2Decimals((totalExpenses / overallBudgetLimit) * 100)
      : 0;

  const budgetAlertLevel = getBudgetAlertLevel(overallBudgetPercentage);

  const categorySpending = Object.entries(categorySpendMap)
    .filter(([, data]) => data.amount > 0)
    .map(([category, data]) => ({
      category: category as TransactionCategory,
      amount: roundTo2Decimals(data.amount),
      percentage: totalExpenses > 0 ? roundTo2Decimals((data.amount / totalExpenses) * 100) : 0,
      transactionCount: data.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  const [yearStr, monthStr] = targetMonth.split('-');
  const currYear = parseInt(yearStr, 10);
  const currMonth = parseInt(monthStr, 10);
  const prevDate = new Date(Date.UTC(currYear, currMonth - 2, 1));
  const prevMonthStr = `${prevDate.getUTCFullYear()}-${String(prevDate.getUTCMonth() + 1).padStart(2, '0')}`;

  const prevMonthTxs = allTxs.filter(
    (t) => t.transactionDate.startsWith(prevMonthStr) && t.type === 'EXPENSE'
  );
  const previousTotalExpenses = roundTo2Decimals(
    prevMonthTxs.reduce((sum, t) => sum + t.amount, 0)
  );

  const expenseChangeAmount = roundTo2Decimals(totalExpenses - previousTotalExpenses);
  const expenseChangePercentage =
    previousTotalExpenses > 0
      ? roundTo2Decimals(((totalExpenses - previousTotalExpenses) / previousTotalExpenses) * 100)
      : 0;

  return {
    month: targetMonth,
    totalIncome,
    totalExpenses,
    netSavings,
    overallBudgetLimit,
    remainingBudget,
    overallBudgetPercentage,
    budgetAlertLevel,
    categorySpending,
    previousMonthComparison: {
      previousMonth: prevMonthStr,
      previousTotalExpenses,
      expenseChangeAmount,
      expenseChangePercentage,
    },
  };
}

export async function fetchBudgetStatuses(targetMonth: string = '2026-10'): Promise<BudgetStatus[]> {
  const [allTxs, monthBudgets] = await Promise.all([
    fetchTransactions({ month: targetMonth }),
    fetchBudgets(targetMonth),
  ]);

  const totalExpenses = roundTo2Decimals(
    allTxs.filter((t) => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0)
  );

  const categoryExpenses: Record<string, number> = {};
  allTxs.forEach((t) => {
    if (t.type === 'EXPENSE') {
      categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + t.amount;
    }
  });

  const statuses: BudgetStatus[] = [];

  const overall = monthBudgets.find((b) => b.category === 'OVERALL');
  if (overall) {
    const spent = totalExpenses;
    const limit = overall.limitAmount;
    const remaining = roundTo2Decimals(limit - spent);
    const percentage = limit > 0 ? roundTo2Decimals((spent / limit) * 100) : 0;
    statuses.push({
      category: 'OVERALL',
      categoryName: 'Monthly Overall Budget',
      spent,
      limit,
      remaining,
      percentageUsed: percentage,
      isOverBudget: spent > limit,
      alertLevel: getBudgetAlertLevel(percentage),
    });
  }

  const catBudgets = monthBudgets.filter((b) => b.category !== 'OVERALL');
  catBudgets.forEach((b) => {
    const spent = roundTo2Decimals(categoryExpenses[b.category] || 0);
    const limit = b.limitAmount;
    const remaining = roundTo2Decimals(limit - spent);
    const percentage = limit > 0 ? roundTo2Decimals((spent / limit) * 100) : 0;
    statuses.push({
      category: b.category,
      categoryName: b.category,
      spent,
      limit,
      remaining,
      percentageUsed: percentage,
      isOverBudget: spent > limit,
      alertLevel: getBudgetAlertLevel(percentage),
    });
  });

  return statuses;
}

// =================================================================
// S3 RECEIPT UPLOAD URL
// =================================================================

export async function getPresignedUploadUrl(payload: {
  fileName: string;
  contentType: string;
  transactionId?: string;
}): Promise<{ uploadUrl: string; objectKey: string; expiresInSeconds: number }> {
  if (USE_REAL_API) {
    return await apiRequest('/uploads/presign', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  return {
    uploadUrl: 'https://spendwise-receipts.mock.s3.amazonaws.com/upload-preview',
    objectKey: `receipts/mock-user/${payload.transactionId || 'draft'}-${Date.now()}.jpg`,
    expiresInSeconds: 300,
  };
}
