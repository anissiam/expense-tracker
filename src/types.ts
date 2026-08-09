export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'SAR' | 'AED' | 'EGP' | 'JOD' | 'QAR' | 'KWD' | 'ILS';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
}

export type BudgetMode = 'salary' | 'planned';

export type ThemeId = 'obsidian' | 'emerald_light' | 'sapphire' | 'amber';

export interface Subcategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name string
  color: string; // Tailwind color class or hex
  allocated: number;
  spent: number;
  isArchived: boolean;
  order: number;
  subcategories: Subcategory[];
}

export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'bank_transfer' | 'apple_pay';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  categoryId: string;
  subcategoryId?: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface BudgetCycle {
  id: string;
  month: string; // YYYY-MM format, e.g. "2026-08"
  mode: BudgetMode;
  totalIncome: number;
  currency: CurrencyCode;
  status: 'active' | 'closed';
  closedAt?: string;
}

export type TemplateType = 'default' | 'ramadan' | 'travel' | 'vacation' | 'school' | 'custom';

export interface CategoryTemplateAllocation {
  categoryName: string;
  icon: string;
  color: string;
  percentageOfIncome: number;
  subcategories: { name: string; percentageOfCategory: number }[];
}

export interface BudgetTemplate {
  id: string;
  name: string;
  type: TemplateType;
  description: string;
  icon: string;
  isDefault?: boolean;
  categoryAllocations: CategoryTemplateAllocation[];
}

export type ClosingCarryOption = 'savings' | 'next_month' | 'split';

export interface ClosingRecord {
  id: string;
  month: string; // YYYY-MM
  totalIncome: number;
  totalAllocated: number;
  totalSpent: number;
  remainingAmount: number;
  carryOption: ClosingCarryOption;
  amountToSavings: number;
  amountToNextMonth: number;
  closedAt: string;
}

export interface SavingsTransaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  note: string;
  sourceMonth?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon: string;
  color: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  currency: CurrencyCode;
  monthlySalaryDay: number; // e.g. 1st or 25th of month
}

export interface SmartInsight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'tip';
  title: string;
  message: string;
  actionableTip: string;
  confidence: string;
}

export type AccountType = 'bank' | 'wallet' | 'cash' | 'crypto' | 'other';

export interface AccountWallet {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  accountNumber?: string;
  color: string;
  icon: string;
  notes?: string;
  createdAt: string;
}

export type IncomingStatus = 'pending' | 'received' | 'cancelled';
export type IncomingRecurrence = 'once' | 'monthly' | 'weekly' | 'yearly';

export interface IncomingIncome {
  id: string;
  title: string;
  amount: number;
  expectedDate: string; // YYYY-MM-DD
  accountId?: string;
  category: string;
  recurrence: IncomingRecurrence;
  status: IncomingStatus;
  notes?: string;
  receivedDate?: string;
  createdAt: string;
}
