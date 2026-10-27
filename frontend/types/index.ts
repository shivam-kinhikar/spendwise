export type TransactionType = 'INCOME' | 'EXPENSE';

export type TransactionCategory =
  | 'Food'
  | 'Travel'
  | 'Shopping'
  | 'Education'
  | 'Entertainment'
  | 'Bills'
  | 'Health'
  | 'Income'
  | 'Other';

export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  'Food',
  'Travel',
  'Shopping',
  'Education',
  'Entertainment',
  'Bills',
  'Health',
  'Income',
  'Other',
];

export const EXPENSE_CATEGORIES: TransactionCategory[] = [
  'Food',
  'Travel',
  'Shopping',
  'Education',
  'Entertainment',
  'Bills',
  'Health',
  'Other',
];

export type PaymentMethod =
  | 'UPI'
  | 'Cash'
  | 'Debit Card'
  | 'Credit Card'
  | 'Net Banking'
  | 'Other';

export const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Net Banking',
  'Other',
];

export interface Transaction {
  id: string;
  transactionId?: string;
  userId?: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: TransactionCategory;
  transactionDate: string; // ISO date 'YYYY-MM-DD'
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  receiptKey?: string;
}

export type BudgetCategory = 'OVERALL' | TransactionCategory;

export interface Budget {
  id: string;
  budgetId?: string;
  userId?: string;
  month: string; // 'YYYY-MM'
  category: BudgetCategory; // 'OVERALL' sentinel or specific category
  limitAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategorySpending {
  category: TransactionCategory;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface BudgetStatus {
  category: BudgetCategory;
  categoryName: string;
  spent: number;
  limit: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
  alertLevel: 'normal' | 'warning_75' | 'warning_90' | 'exceeded_100';
}

export interface AnalyticsSummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number; // Income - Expenses
  overallBudgetLimit: number;
  remainingBudget: number; // Overall Budget Limit - Expenses (Per specification)
  overallBudgetPercentage: number;
  budgetAlertLevel: 'normal' | 'warning_75' | 'warning_90' | 'exceeded_100';
  categorySpending: CategorySpending[];
  previousMonthComparison: {
    previousMonth: string;
    previousTotalExpenses: number;
    expenseChangeAmount: number;
    expenseChangePercentage: number;
  };
}

export interface TransactionFilterParams {
  search?: string;
  category?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  month?: string; // 'YYYY-MM'
  sortBy?: 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc';
}

export interface ApiError {
  message: string;
  code?: string;
  fieldErrors?: Record<string, string>;
  status?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}
