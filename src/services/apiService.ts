import {
  Expense,
  Category,
  Subcategory,
  BudgetCycle,
  UserProfile,
  SavingsGoal,
  SavingsTransaction,
  AccountWallet,
  IncomingIncome,
  ClosingRecord,
  BudgetTemplate,
  CurrencyCode,
  BudgetMode,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TOKEN_KEY = 'expense_tracker_token';

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const setToken = (token: string | null): void => {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
};

// ---------------------------------------------------------------------------
// Generic request wrapper
// ---------------------------------------------------------------------------

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
      else if (body?.errors) message = Object.values(body.errors).flat().join(' ');
      else if (body?.error) message = body.error;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---------------------------------------------------------------------------
// Mappers: backend snake_case -> frontend camelCase
// ---------------------------------------------------------------------------

function toUserProfile(u: any): UserProfile {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    currency: u.currency_code || 'USD',
    monthlySalaryDay: u.monthly_salary_day ?? undefined,
  };
}

function monthFromDate(date: string): string {
  return (date || '').slice(0, 7);
}

function toBudgetCycle(b: any): BudgetCycle {
  return {
    id: String(b.id),
    month: monthFromDate(b.start_date),
    mode: (b.type as BudgetMode) || 'salary',
    totalIncome: Number(b.total_amount) || 0,
    currency: b.currency_code || 'USD',
    status: b.status || 'active',
    myRole: (b.my_role as BudgetCycle['myRole']) || undefined,
    isShared: b.is_shared ?? undefined,
  };
}

function buildCategoryTree(rows: any[]): Category[] {
  const parents = rows.filter((r) => !r.parent_id).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const children = rows.filter((r) => r.parent_id);

  return parents.map((p) => {
    const subs: Subcategory[] = children
      .filter((c) => String(c.parent_id) === String(p.id))
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((c) => ({
        id: String(c.id),
        name: c.name,
        allocated: 0,
        spent: 0,
      }));

    return {
      id: String(p.id),
      name: p.name,
      icon: p.icon || 'Circle',
      color: p.color || 'emerald',
      allocated: 0,
      spent: 0,
      isArchived: false,
      order: p.sort_order ?? 0,
      subcategories: subs,
      parentId: null,
      type: p.type || 'expense',
      isDefault: !!p.is_default,
    };
  });
}

function toExpense(e: any): Expense {
  return {
    id: String(e.id),
    title: e.description || 'Expense',
    amount: Number(e.amount) || 0,
    date: typeof e.date === 'string' ? e.date.slice(0, 10) : e.date,
    categoryId: String(e.category_id),
    subcategoryId: e.subcategory_id ? String(e.subcategory_id) : undefined,
    paymentMethod: e.payment_method || undefined,
    notes: e.description || undefined,
    source: e.source === 'voice' ? 'voice' : 'manual',
    createdAt: e.created_at,
  };
}

function toSavingsGoal(s: any): SavingsGoal {
  return {
    id: String(s.id),
    title: s.name || 'Savings Goal',
    targetAmount: Number(s.target_amount) || 0,
    currentAmount: Number(s.current_balance) || 0,
    deadline: s.target_date || '',
    icon: s.icon || 'ShieldCheck',
    color: s.color || 'emerald',
  };
}

function toSavingsTransaction(tx: any): SavingsTransaction {
  return {
    id: String(tx.id),
    date: tx.date,
    type: tx.type === 'withdraw' ? 'withdraw' : 'deposit',
    amount: Number(tx.amount) || 0,
    note: tx.description || '',
    sourceMonth: monthFromDate(tx.date),
  };
}

function toAccount(a: any): AccountWallet {
  return {
    id: String(a.id),
    name: a.name,
    type: a.type || 'bank',
    balance: Number(a.balance) || 0,
    accountNumber: a.account_number || undefined,
    color: a.color || 'emerald',
    icon: a.icon || 'Wallet',
    notes: a.notes || undefined,
    createdAt: a.created_at,
  };
}

function toIncoming(i: any): IncomingIncome {
  return {
    id: String(i.id),
    title: i.title,
    amount: Number(i.amount) || 0,
    expectedDate: i.expected_date,
    accountId: i.account_id ? String(i.account_id) : undefined,
    category: i.category || '',
    recurrence: i.recurrence || 'once',
    status: i.status || 'pending',
    receivedDate: i.received_date || undefined,
    notes: i.notes || undefined,
    createdAt: i.created_at,
  };
}

function toTemplate(t: any): BudgetTemplate {
  const config = (t.config && t.config.categoryAllocations) ? t.config.categoryAllocations
    : (Array.isArray(t.categoryAllocations) ? t.categoryAllocations : []);
  return {
    id: String(t.id),
    name: t.name,
    type: t.type || 'custom',
    description: t.description || '',
    icon: t.icon || 'Bookmark',
    isDefault: !!t.is_default,
    categoryAllocations: config,
  };
}

function toClosing(c: any): ClosingRecord {
  return {
    id: String(c.id),
    month: monthFromDate(c.performed_at),
    totalIncome: 0,
    totalAllocated: 0,
    totalSpent: 0,
    remainingAmount: Number(c.remaining_amount) || 0,
    carryOption: c.action || 'ignore',
    amountToSavings: Number(c.to_savings_amount) || 0,
    amountToNextMonth: Number(c.to_next_budget_amount) || 0,
    closedAt: c.performed_at,
  };
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const login = async (email: string, password: string): Promise<{ user: UserProfile; token: string }> => {
  const data = await request<{ user: any; token: string }>('/api/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return { user: toUserProfile(data.user), token: data.token };
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  currency: CurrencyCode = 'USD',
  inviteToken?: string | null
): Promise<{ user: UserProfile; token: string; acceptedInvites?: number }> => {
  const data = await request<{ user: any; token: string; accepted_invites?: number }>('/api/register', {
    method: 'POST',
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: password,
      currency,
      ...(inviteToken ? { invite_token: inviteToken } : {}),
    }),
  });
  return { user: toUserProfile(data.user), token: data.token, acceptedInvites: data.accepted_invites };
};

export const logout = async (): Promise<void> => {
  try {
    await request('/api/logout', { method: 'POST' });
  } finally {
    setToken(null);
  }
};

/**
 * Supabase Auth bridge: the user already signed up / signed in via
 * Supabase (GoTrue). Send its access token so Laravel verifies it,
 * creates the public.users row in the Supabase database, and returns
 * the API token used for all other /api/* calls.
 */
export const syncSupabaseUser = async (
  accessToken: string,
  opts: { name?: string; currency?: CurrencyCode; inviteToken?: string | null } = {}
): Promise<{ user: UserProfile; token: string; acceptedInvites?: number }> => {
  const data = await request<{ user: any; token: string; accepted_invites?: number }>(
    '/api/auth/supabase/sync',
    {
      method: 'POST',
      body: JSON.stringify({
        access_token: accessToken,
        ...(opts.name ? { name: opts.name } : {}),
        ...(opts.currency ? { currency: opts.currency } : {}),
        ...(opts.inviteToken ? { invite_token: opts.inviteToken } : {}),
      }),
    }
  );
  return { user: toUserProfile(data.user), token: data.token, acceptedInvites: data.accepted_invites };
};

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const data = await request<any>('/api/user/profile');
  return toUserProfile(data);
};

export const updateUserProfile = async (updates: {
  name?: string;
  currency?: CurrencyCode;
  monthlySalaryDay?: number | null;
}): Promise<UserProfile> => {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.currency !== undefined) payload.currency = updates.currency;
  if (updates.monthlySalaryDay !== undefined) payload.monthly_salary_day = updates.monthlySalaryDay;
  const data = await request<any>('/api/user/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return toUserProfile(data);
};

// ---------------------------------------------------------------------------
// Budget cycles
// ---------------------------------------------------------------------------

export const fetchBudgetCycles = async (): Promise<BudgetCycle[]> => {
  const data = await request<any[]>('/api/budgets');
  return data.map(toBudgetCycle);
};

export const createBudgetCycle = async (
  month: number,
  year: number,
  mode: BudgetMode,
  income: number,
  currency: CurrencyCode
): Promise<BudgetCycle> => {
  const data = await request<any>('/api/budgets', {
    method: 'POST',
    body: JSON.stringify({ month, year, mode, income, currency }),
  });
  return toBudgetCycle(data);
};

export const updateBudgetCycle = async (id: string, updates: Partial<BudgetCycle>): Promise<BudgetCycle> => {
  const payload: Record<string, unknown> = {};
  if (updates.mode !== undefined) payload.mode = updates.mode;
  if (updates.totalIncome !== undefined) payload.income = updates.totalIncome;
  if (updates.currency !== undefined) payload.currency = updates.currency;
  if (updates.status !== undefined) payload.status = updates.status;
  const data = await request<any>(`/api/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return toBudgetCycle(data);
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export const fetchCategories = async (): Promise<Category[]> => {
  const data = await request<any[]>('/api/categories');
  return buildCategoryTree(data);
};

export const createCategory = async (input: {
  name: string;
  icon?: string;
  color?: string;
  parentId?: string | null;
}): Promise<Category> => {
  const data = await request<any>('/api/categories', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      type: 'expense',
      icon: input.icon,
      color: input.color,
      parent_id: input.parentId || null,
    }),
  });
  return {
    id: String(data.id),
    name: data.name,
    icon: data.icon || 'Circle',
    color: data.color || 'emerald',
    allocated: 0,
    spent: 0,
    isArchived: false,
    order: data.sort_order || 0,
    subcategories: [],
    parentId: data.parent_id ? String(data.parent_id) : null,
    type: data.type || 'expense',
    isDefault: !!data.is_default,
  };
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<Category> => {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.icon !== undefined) payload.icon = updates.icon;
  if (updates.color !== undefined) payload.color = updates.color;
  const data = await request<any>(`/api/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await request(`/api/categories/${id}`, { method: 'DELETE' });
};

export const fetchAllocations = async (budgetId: string): Promise<Record<string, number>> => {
  const data = await request<any[]>('/api/budgets/' + budgetId + '/allocations');
  const map: Record<string, number> = {};
  for (const a of data) {
    map[String(a.category_id)] = Number(a.allocated_amount) || 0;
  }
  return map;
};

export const setAllocation = async (
  budgetId: string,
  categoryId: string,
  allocatedAmount: number
): Promise<void> => {
  await request(`/api/budgets/${budgetId}/allocations`, {
    method: 'POST',
    body: JSON.stringify({ category_id: categoryId, allocated_amount: allocatedAmount }),
  });
};

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

export const fetchExpenses = async (): Promise<Expense[]> => {
  const data = await request<any[]>('/api/expenses');
  return data.map(toExpense);
};

export const createExpense = async (
  input: Omit<Expense, 'id' | 'createdAt'> & { budgetId?: string | null }
): Promise<Expense> => {
  const data = await request<any>('/api/expenses', {
    method: 'POST',
    body: JSON.stringify({
      category_id: input.categoryId,
      subcategory_id: input.subcategoryId || null,
      budget_id: input.budgetId || null,
      amount: input.amount,
      currency: 'USD',
      date: input.date,
      description: input.title,
      payment_method: input.paymentMethod || null,
      source: input.source || 'manual',
    }),
  });
  return toExpense(data);
};

export const updateExpense = async (id: string, updates: Partial<Expense>): Promise<Expense> => {
  const payload: Record<string, unknown> = {};
  if (updates.categoryId !== undefined) payload.category_id = updates.categoryId;
  if (updates.subcategoryId !== undefined) payload.subcategory_id = updates.subcategoryId || null;
  if (updates.amount !== undefined) payload.amount = updates.amount;
  if (updates.title !== undefined) payload.description = updates.title;
  if (updates.date !== undefined) payload.date = updates.date;
  if (updates.paymentMethod !== undefined) payload.payment_method = updates.paymentMethod;
  const data = await request<any>(`/api/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return toExpense(data);
};

export const deleteExpense = async (id: string): Promise<void> => {
  await request(`/api/expenses/${id}`, { method: 'DELETE' });
};

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export const fetchBudgetTemplates = async (): Promise<BudgetTemplate[]> => {
  const data = await request<any[]>('/api/templates');
  return data.map(toTemplate);
};

export const createTemplate = async (input: {
  name: string;
  description?: string;
  icon?: string;
  config: unknown;
}): Promise<BudgetTemplate> => {
  const data = await request<any>('/api/templates', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      type: 'custom',
      description: input.description,
      icon: input.icon || 'Bookmark',
      config: input.config,
    }),
  });
  return toTemplate(data);
};

// ---------------------------------------------------------------------------
// Savings
// ---------------------------------------------------------------------------

export const fetchSavingsGoals = async (): Promise<SavingsGoal[]> => {
  const data = await request<any[]>('/api/savings');
  return data.map(toSavingsGoal);
};

export const createSavingsGoal = async (
  goal: Omit<SavingsGoal, 'id' | 'currentAmount'>
): Promise<SavingsGoal> => {
  const data = await request<any>('/api/savings', {
    method: 'POST',
    body: JSON.stringify({
      name: goal.title,
      target_amount: goal.targetAmount,
      target_date: goal.deadline || null,
      icon: goal.icon,
      color: goal.color,
    }),
  });
  return toSavingsGoal(data);
};

export const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>): Promise<SavingsGoal> => {
  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.name = updates.title;
  if (updates.targetAmount !== undefined) payload.target_amount = updates.targetAmount;
  if (updates.deadline !== undefined) payload.target_date = updates.deadline;
  if (updates.icon !== undefined) payload.icon = updates.icon;
  if (updates.color !== undefined) payload.color = updates.color;
  const data = await request<any>(`/api/savings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return toSavingsGoal(data);
};

export const deleteSavingsGoal = async (id: string): Promise<void> => {
  await request(`/api/savings/${id}`, { method: 'DELETE' });
};

export const fetchSavingsTransactions = async (savingId: string): Promise<SavingsTransaction[]> => {
  const data = await request<any[]>(`/api/savings/${savingId}/transactions`);
  return data.map(toSavingsTransaction);
};

export const addSavingsTransaction = async (
  savingId: string,
  input: { type: 'deposit' | 'withdraw'; amount: number; note?: string; date?: string }
): Promise<SavingsTransaction> => {
  const data = await request<any>(`/api/savings/${savingId}/transactions`, {
    method: 'POST',
    body: JSON.stringify({
      type: input.type === 'withdraw' ? 'withdraw' : 'add',
      amount: input.amount,
      description: input.note || '',
      date: input.date || new Date().toISOString().split('T')[0],
    }),
  });
  return toSavingsTransaction(data);
};

// ---------------------------------------------------------------------------
// Accounts (payment methods)
// ---------------------------------------------------------------------------

export const fetchAccounts = async (): Promise<AccountWallet[]> => {
  const data = await request<any[]>('/api/payment-methods');
  return data.map(toAccount);
};

export const createAccount = async (account: Omit<AccountWallet, 'id' | 'createdAt'>): Promise<AccountWallet> => {
  const data = await request<any>('/api/payment-methods', {
    method: 'POST',
    body: JSON.stringify({
      name: account.name,
      type: account.type,
      balance: account.balance,
      account_number: account.accountNumber || null,
      color: account.color,
      icon: account.icon,
      notes: account.notes || null,
    }),
  });
  return toAccount(data);
};

export const updateAccount = async (id: string, updates: Partial<AccountWallet>): Promise<AccountWallet> => {
  const payload: Record<string, unknown> = {};
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.type !== undefined) payload.type = updates.type;
  if (updates.balance !== undefined) payload.balance = updates.balance;
  if (updates.accountNumber !== undefined) payload.account_number = updates.accountNumber;
  if (updates.color !== undefined) payload.color = updates.color;
  if (updates.icon !== undefined) payload.icon = updates.icon;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  const data = await request<any>(`/api/payment-methods/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return toAccount(data);
};

export const deleteAccount = async (id: string): Promise<void> => {
  await request(`/api/payment-methods/${id}`, { method: 'DELETE' });
};

// ---------------------------------------------------------------------------
// Incomings
// ---------------------------------------------------------------------------

export const fetchIncomings = async (): Promise<IncomingIncome[]> => {
  const data = await request<any[]>('/api/incomings');
  return data.map(toIncoming);
};

export const createIncoming = async (
  incoming: Omit<IncomingIncome, 'id' | 'createdAt' | 'status' | 'receivedDate'>
): Promise<IncomingIncome> => {
  const data = await request<any>('/api/incomings', {
    method: 'POST',
    body: JSON.stringify({
      title: incoming.title,
      amount: incoming.amount,
      expected_date: incoming.expectedDate,
      account_id: incoming.accountId || null,
      category: incoming.category,
      recurrence: incoming.recurrence,
      notes: incoming.notes || null,
    }),
  });
  return toIncoming(data);
};

export const updateIncoming = async (id: string, updates: Partial<IncomingIncome>): Promise<IncomingIncome> => {
  const payload: Record<string, unknown> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.amount !== undefined) payload.amount = updates.amount;
  if (updates.expectedDate !== undefined) payload.expected_date = updates.expectedDate;
  if (updates.accountId !== undefined) payload.account_id = updates.accountId;
  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.recurrence !== undefined) payload.recurrence = updates.recurrence;
  if (updates.notes !== undefined) payload.notes = updates.notes;
  const data = await request<any>(`/api/incomings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return toIncoming(data);
};

export const deleteIncoming = async (id: string): Promise<void> => {
  await request(`/api/incomings/${id}`, { method: 'DELETE' });
};

export const markIncomingReceived = async (id: string): Promise<IncomingIncome> => {
  const data = await request<any>(`/api/incomings/${id}/mark-received`, { method: 'POST' });
  return toIncoming(data);
};

// ---------------------------------------------------------------------------
// Closing records
// ---------------------------------------------------------------------------

export const fetchClosingRecords = async (): Promise<ClosingRecord[]> => {
  const data = await request<any[]>('/api/closings');
  return data.map(toClosing);
};

export const closeBudget = async (
  budgetId: string,
  input: {
    remainingAmount: number;
    action: string;
    toSavingsAmount?: number;
    toNextBudgetAmount?: number;
    savingsId?: string | null;
  }
): Promise<ClosingRecord> => {
  const data = await request<any>(`/api/budgets/${budgetId}/close`, {
    method: 'POST',
    body: JSON.stringify({
      remaining_amount: input.remainingAmount,
      action: input.action,
      to_savings_amount: input.toSavingsAmount ?? 0,
      to_next_budget_amount: input.toNextBudgetAmount ?? 0,
      savings_id: input.savingsId || null,
    }),
  });
  return toClosing(data);
};

// ---------------------------------------------------------------------------
// Voice-to-expense (Phase 2): deterministic parse, review before saving
// ---------------------------------------------------------------------------

export interface VoiceParseResult {
  status: 'READY_FOR_REVIEW' | 'NEEDS_CLARIFICATION';
  amount: number | null;
  currency: string;
  category_id: string | number | null;
  category_name: string | null;
  subcategory_id: string | number | null;
  subcategory_name: string | null;
  date: string | null;
  description: string | null;
  missingField: 'amount' | 'category' | null;
  prompt: string | null;
}

export const parseVoiceTranscript = async (transcript: string): Promise<VoiceParseResult> => {
  return request<VoiceParseResult>('/api/voice/parse', {
    method: 'POST',
    body: JSON.stringify({ transcript }),
  });
};

export const fetchActiveBudgetSummary = async (year?: number, month?: number): Promise<any> => {
  const params = new URLSearchParams();
  if (year) params.set('year', String(year));
  if (month) params.set('month', String(month));
  const qs = params.toString() ? `?${params.toString()}` : '';
  return request(`/api/budgets/active/summary${qs}`);
};

/**
 * Phase 2 fallback: transcribe a MediaRecorder blob server-side (Gemini).
 * Same Express origin as the other /api/ai/* endpoints (not Laravel).
 */
export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
  const res = await fetch('/api/ai/transcribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType }),
  });
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    throw new Error(body?.error || `Transcription failed (${res.status})`);
  }
  const transcript = String(body?.transcript || '').trim();
  if (!transcript) throw new Error('Transcription came back empty. Try recording again.');
  return transcript;
};

// ---------------------------------------------------------------------------
// Dashboard summary / reports
// ---------------------------------------------------------------------------

export const fetchBudgetSummary = async (budgetId: string): Promise<unknown> => {
  return request(`/api/dashboard/summary?budget_id=${budgetId}`);
};

export const fetchMonthlyReport = async (month: number, year: number): Promise<unknown> => {
  return request(`/api/reports/monthly?month=${month}&year=${year}`);
};

// ---------------------------------------------------------------------------
// Budget partners (per-budget sharing: editor / viewer roles)
// ---------------------------------------------------------------------------

export interface BudgetPartnerRaw {
  id: number | string;
  budget_id: number | string;
  email: string;
  name?: string | null;
  user_id?: number | string | null;
  role: 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined' | 'revoked';
  expires_at?: string | null;
  accepted_at?: string | null;
  created_at?: string;
  invite_url?: string | null;
}

function toBudgetPartner(m: BudgetPartnerRaw): import('../types').BudgetPartner {
  return {
    id: String(m.id),
    budgetId: String(m.budget_id),
    email: m.email,
    name: m.name || undefined,
    userId: m.user_id != null ? String(m.user_id) : null,
    role: m.role,
    status: m.status,
    expiresAt: m.expires_at || null,
    acceptedAt: m.accepted_at || null,
    createdAt: m.created_at,
    inviteUrl: m.invite_url || null,
  };
}

export const fetchBudgetPartners = async (
  budgetId: string
): Promise<{ owner: { id: string; name?: string; email?: string }; members: import('../types').BudgetPartner[] }> => {
  const data = await request<{ owner: any; members: BudgetPartnerRaw[] }>(`/api/budgets/${budgetId}/partners`);
  return {
    owner: { id: String(data.owner?.id ?? ''), name: data.owner?.name, email: data.owner?.email },
    members: (data.members || []).map(toBudgetPartner),
  };
};

export const inviteBudgetPartner = async (
  budgetId: string,
  email: string,
  role: 'editor' | 'viewer'
): Promise<import('../types').BudgetPartner> => {
  const data = await request<BudgetPartnerRaw>(`/api/budgets/${budgetId}/partners`, {
    method: 'POST',
    body: JSON.stringify({ email, role }),
  });
  return toBudgetPartner(data);
};

export const updateBudgetPartnerRole = async (
  budgetId: string,
  memberId: string,
  role: 'editor' | 'viewer'
): Promise<import('../types').BudgetPartner> => {
  const data = await request<BudgetPartnerRaw>(`/api/budgets/${budgetId}/partners/${memberId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
  return toBudgetPartner(data);
};

export const removeBudgetPartner = async (budgetId: string, memberId: string): Promise<void> => {
  await request(`/api/budgets/${budgetId}/partners/${memberId}`, { method: 'DELETE' });
};

export const fetchPendingInvites = async (): Promise<import('../types').PendingInvite[]> => {
  const data = await request<any[]>('/api/invites/pending');
  return (data || []).map((i) => ({
    token: i.token,
    budgetId: String(i.budget_id),
    budgetName: i.budget_name,
    inviterName: i.inviter_name,
    role: i.role,
    expiresAt: i.expires_at || null,
  }));
};

export const previewInvite = async (token: string): Promise<import('../types').InvitePreview> => {
  const data = await request<any>(`/api/invites/${token}`);
  return {
    email: data.email,
    role: data.role,
    status: data.status,
    expiresAt: data.expires_at || null,
    budgetName: data.budget_name,
    budgetId: String(data.budget_id),
    inviterName: data.inviter_name,
    isNewUser: !!data.is_new_user,
    expired: !!data.expired,
  };
};

export const acceptInvite = async (token: string): Promise<{ budgetId: string; role: string }> => {
  const data = await request<any>(`/api/invites/${token}/accept`, { method: 'POST' });
  return { budgetId: String(data.budget_id ?? ''), role: data.role };
};

export const declineInvite = async (token: string): Promise<void> => {
  await request(`/api/invites/${token}/decline`, { method: 'POST' });
};