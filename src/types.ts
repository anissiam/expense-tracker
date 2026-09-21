export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  categoryId: string;
  subcategoryId?: string;
  paymentMethod?: string;
  notes?: string;
  source?: 'manual' | 'voice';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  allocated: number;
  spent: number;
  isArchived: boolean;
  order: number;
  subcategories?: Subcategory[];
  parentId?: string | null;
  type?: string;
  isDefault?: boolean;
}

export interface Subcategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
}

export interface BudgetCycle {
  id: string;
  month: string;
  mode: BudgetMode;
  totalIncome: number;
  currency: string;
  status: string;
  myRole?: BudgetRole;
  isShared?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency?: string;
  monthlySalaryDay?: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
  color: string;
}

export interface SavingsTransaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  note: string;
  sourceMonth?: string;
}

export interface AccountWallet {
  id: string;
  name: string;
  type: 'bank' | 'wallet' | 'cash' | 'crypto';
  balance: number;
  accountNumber?: string;
  color: string;
  icon: string;
  notes?: string;
  createdAt: string;
}

export type AccountType = 'bank' | 'wallet' | 'cash' | 'crypto';

export interface IncomingIncome {
  id: string;
  title: string;
  amount: number;
  expectedDate: string;
  accountId?: string;
  category: string;
  recurrence: 'monthly' | 'once' | 'yearly';
  status: 'pending' | 'received';
  receivedDate?: string;
  notes?: string;
  createdAt: string;
}

export type IncomingRecurrence = 'monthly' | 'once' | 'yearly';

export interface ClosingRecord {
  id: string;
  month: string;
  totalIncome: number;
  totalAllocated: number;
  totalSpent: number;
  remainingAmount: number;
  carryOption: string;
  amountToSavings: number;
  amountToNextMonth: number;
  closedAt: string;
}

export interface SmartInsight {
  id: string;
  type: 'warning' | 'success' | 'info' | 'tip';
  title: string;
  message: string;
  actionableTip: string;
  confidence: string;
}

export interface TemplateCategory {
  categoryName: string;
  icon: string;
  color: string;
  percentageOfIncome: number;
  subcategories: {
    name: string;
    percentageOfCategory: number;
  }[];
}

export interface BudgetTemplate {
  id: string;
  name: string;
  type: string;
  description: string;
  icon: string;
  isDefault: boolean;
  categoryAllocations: TemplateCategory[];
}

export interface BudgetAllocation {
  categoryId: string;
  allocatedAmount: number;
  spentAmount: number;
}

export interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  totalSaved: number;
  remaining: number;
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'ILS' | 'SAR' | 'AED' | 'EGP' | 'JOD' | 'QAR' | 'KWD';

export type CurrencyConfig = {
  code: CurrencyCode;
  symbol: string;
  name: string;
  flag: string;
};

export type BudgetMode = 'salary' | 'planned';

export type ThemeId = 'light' | 'dark';

export type ClosingCarryOption = 'savings' | 'next_month' | 'split';

export type PaymentMethod = 'credit' | 'debit' | 'cash' | 'apple_pay' | 'bank_transfer';

export type PartnerRole = 'editor' | 'viewer';
export type BudgetRole = 'owner' | PartnerRole;
export type PartnerStatus = 'pending' | 'accepted' | 'declined' | 'revoked';

export interface BudgetPartner {
  id: string;
  budgetId: string;
  email: string;
  name?: string;
  userId?: string | null;
  role: PartnerRole;
  status: PartnerStatus;
  expiresAt?: string | null;
  acceptedAt?: string | null;
  createdAt?: string;
  inviteUrl?: string | null;
}

export interface PendingInvite {
  token: string;
  budgetId: string;
  budgetName?: string;
  inviterName?: string;
  role: PartnerRole;
  expiresAt?: string | null;
}

export interface InvitePreview {
  email: string;
  role: PartnerRole;
  status: PartnerStatus;
  expiresAt?: string | null;
  budgetName?: string;
  budgetId: string;
  inviterName?: string;
  isNewUser: boolean;
  expired?: boolean;
}
