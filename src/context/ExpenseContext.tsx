import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import {
  Category,
  Expense,
  BudgetCycle,
  BudgetTemplate,
  SavingsGoal,
  SavingsTransaction,
  ClosingRecord,
  UserProfile,
  CurrencyCode,
  BudgetMode,
  ThemeId,
  ClosingCarryOption,
  SmartInsight,
  Subcategory,
  AccountWallet,
  IncomingIncome,
  BudgetPartner,
  BudgetRole,
  PartnerRole,
  PendingInvite
} from '../types';
import * as api from '../services/apiService';
import { getToken, setToken } from '../services/apiService';
import { supabase } from '../services/supabaseClient';

import { Language, translations, TranslationDictionary } from '../data/translations';

interface ExpenseContextType {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  t: TranslationDictionary;
  dir: 'ltr' | 'rtl';
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, inviteToken?: string | null) => Promise<void>;
  logoutUser: () => Promise<void>;
  activeMonth: string;
  setActiveMonth: (month: string) => void;
  budgetCycle: BudgetCycle;
  updateBudgetCycle: (income: number, mode: BudgetMode, currency?: CurrencyCode) => void;
  myBudgetRole: BudgetRole | null;
  canEditBudget: boolean;
  isBudgetOwner: boolean;
  budgetPartners: BudgetPartner[];
  budgetOwner: { id: string; name?: string; email?: string } | null;
  refreshPartners: () => Promise<void>;
  invitePartner: (email: string, role: PartnerRole) => Promise<BudgetPartner>;
  changePartnerRole: (memberId: string, role: PartnerRole) => Promise<void>;
  removePartner: (memberId: string) => Promise<void>;
  pendingInvites: PendingInvite[];
  refreshPendingInvites: () => Promise<void>;
  acceptInviteToken: (token: string) => Promise<void>;
  declineInviteToken: (token: string) => Promise<void>;
  categories: Category[];
  addCategory: (name: string, icon: string, color: string, allocated: number, subcategoryNames?: string[]) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  archiveCategory: (id: string) => void;
  reorderCategory: (id: string, direction: 'up' | 'down') => void;
  addSubcategory: (categoryId: string, name: string, allocated: number) => void;
  updateSubcategory: (categoryId: string, subcategoryId: string, updates: Partial<Subcategory>) => void;
  deleteSubcategory: (categoryId: string, subcategoryId: string) => void;
  allocateCategoryBudget: (categoryId: string, allocated: number) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  templates: BudgetTemplate[];
  applyBudgetTemplate: (templateId: string, customIncome?: number) => void;
  addCustomTemplate: (name: string, description: string) => void;
  savingsGoals: SavingsGoal[];
  addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => void;
  updateSavingsGoal: (id: string, updates: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  savingsTransactions: SavingsTransaction[];
  savingsBalance: number;
  depositToSavings: (amount: number, note: string) => void;
  withdrawFromSavings: (amount: number, note: string) => void;
  closingRecords: ClosingRecord[];
  performMonthlyClosing: (carryOption: ClosingCarryOption, customSplitSavings?: number) => void;
  insights: SmartInsight[];
  fetchAIInsights: () => Promise<void>;
  isAiLoading: boolean;
  accounts: AccountWallet[];
  addAccount: (account: Omit<AccountWallet, 'id' | 'createdAt'>) => void;
  updateAccount: (id: string, updates: Partial<AccountWallet>) => void;
  deleteAccount: (id: string) => void;
  incomings: IncomingIncome[];
  addIncoming: (incoming: Omit<IncomingIncome, 'id' | 'createdAt' | 'status'>) => void;
  updateIncoming: (id: string, updates: Partial<IncomingIncome>) => void;
  deleteIncoming: (id: string) => void;
  markIncomingAsReceived: (id: string, addToTotalIncome?: boolean) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const PREF_KEY = 'expense_tracker_prefs';

function currentMonthStr(): string {
  return new Date().toISOString().slice(0, 7);
}

function buildChildMap(cats: Category[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const c of cats) {
    for (const s of c.subcategories || []) {
      map[s.id] = c.id;
    }
  }
  return map;
}

function normalizeExpenses(raw: Expense[], childMap: Record<string, string>): Expense[] {
  return raw.map((e) => {
    const parentId = childMap[e.categoryId];
    if (parentId) {
      return { ...e, categoryId: parentId, subcategoryId: e.categoryId };
    }
    return e;
  });
}

function overlayAllocations(cats: Category[], allocMap: Record<string, number>): Category[] {
  return cats.map((c) => {
    const subs = (c.subcategories || []).map((s) => ({
      ...s,
      allocated: allocMap[s.id] || 0,
    }));
    const own = allocMap[c.id] || 0;
    const subsTotal = subs.reduce((sum, s) => sum + s.allocated, 0);
    return { ...c, allocated: own + subsTotal, subcategories: subs };
  });
}

function computeSpent(cats: Category[], expenses: Expense[], activeMonth: string): Category[] {
  const monthExpenses = expenses.filter((e) => e.date.startsWith(activeMonth));
  return cats.map((cat) => {
    const catExpenses = monthExpenses.filter((e) => e.categoryId === cat.id);
    const totalCatSpent = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    const updatedSubcategories = (cat.subcategories || []).map((sub) => {
      const subSpent = catExpenses
        .filter((e) => e.subcategoryId === sub.id)
        .reduce((sum, e) => sum + e.amount, 0);
      return { ...sub, spent: subSpent };
    });
    return { ...cat, spent: totalCatSpent, subcategories: updatedSubcategories };
  });
}

const EMPTY_BUDGET = (month: string, currency: CurrencyCode): BudgetCycle => ({
  id: '',
  month,
  mode: 'salary',
  totalIncome: 0,
  currency,
  status: 'none',
});

const EMPTY_USER: UserProfile = { id: '', name: '', email: '' };

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [userState, setUserState] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getToken());
  const [isLoading, setIsLoading] = useState<boolean>(() => !!getToken());
  const [authError, setAuthError] = useState<string | null>(null);

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
      return (saved.language as Language) || 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
      localStorage.setItem(PREF_KEY, JSON.stringify({ ...saved, language: lang }));
    } catch { /* ignore */ }
  };

  // Only 'light' | 'dark' are supported. Legacy multi-theme values
  // (obsidian/emerald_light/sapphire/amber) are mapped on load.
  const normalizeTheme = (value: unknown): ThemeId => {
    if (value === 'light' || value === 'emerald_light') return 'light';
    return 'dark';
  };

  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
      return normalizeTheme(saved.theme);
    } catch {
      return 'dark';
    }
  });

  const setTheme = (th: ThemeId) => {
    setThemeState(th);
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
      localStorage.setItem(PREF_KEY, JSON.stringify({ ...saved, theme: th }));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const dir = language === 'ar' ? 'rtl' : 'ltr';
  const t = translations[language] || translations.en;

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [language, dir]);

  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');

  const [activeMonth, setActiveMonthState] = useState<string>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
      return saved.activeMonth || currentMonthStr();
    } catch {
      return currentMonthStr();
    }
  });

  const activeMonthRef = React.useRef(activeMonth);
  useEffect(() => {
    activeMonthRef.current = activeMonth;
  }, [activeMonth]);

  const [budgetCycles, setBudgetCycles] = useState<BudgetCycle[]>([]);
  const [budgetCycle, setBudgetCycle] = useState<BudgetCycle>(() => EMPTY_BUDGET(currentMonthStr(), 'USD'));
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [templates, setTemplates] = useState<BudgetTemplate[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([]);
  const [closingRecords, setClosingRecords] = useState<ClosingRecord[]>([]);
  const [accounts, setAccounts] = useState<AccountWallet[]>([]);
  const [incomings, setIncomings] = useState<IncomingIncome[]>([]);
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [budgetPartners, setBudgetPartners] = useState<BudgetPartner[]>([]);
  const [budgetOwner, setBudgetOwner] = useState<{ id: string; name?: string; email?: string } | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);

  const myBudgetRole: BudgetRole | null = useMemo(() => {
    if (!budgetCycle.id) return null;
    if (budgetCycle.myRole) return budgetCycle.myRole;
    // Budgets created before sharing info existed are owned by the user.
    return budgetCycle.isShared ? null : 'owner';
  }, [budgetCycle.id, budgetCycle.myRole, budgetCycle.isShared]);

  const canEditBudget = myBudgetRole === null || myBudgetRole === 'owner' || myBudgetRole === 'editor';
  const isBudgetOwner = myBudgetRole === null || myBudgetRole === 'owner';

  const savingsBalance = useMemo(
    () => savingsGoals.reduce((sum, g) => sum + (g.currentAmount || 0), 0),
    [savingsGoals]
  );

  const user: UserProfile = userState ?? EMPTY_USER;

  // Recalculate Category Spent from Expenses (preserve allocated)
  useEffect(() => {
    setCategories((prev) => {
      if (prev.length === 0) return prev;
      const monthExpenses = expenses.filter((e) => e.date.startsWith(activeMonth));
      return prev.map((cat) => {
        const catExpenses = monthExpenses.filter((e) => e.categoryId === cat.id);
        const totalCatSpent = catExpenses.reduce((sum, e) => sum + e.amount, 0);
        const updatedSubcategories = (cat.subcategories || []).map((sub) => {
          const subSpent = catExpenses
            .filter((e) => e.subcategoryId === sub.id)
            .reduce((sum, e) => sum + e.amount, 0);
          return { ...sub, spent: subSpent };
        });
        return { ...cat, spent: totalCatSpent, subcategories: updatedSubcategories };
      });
    });
  }, [expenses, activeMonth]);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const profile = await api.fetchUserProfile();
      setUserState(profile);
      const curr = (profile.currency as CurrencyCode) || 'USD';
      setCurrencyState(curr);

      const [cycles, catsRaw, expensesRaw, tmpls, goals, accts, incs, closings] = await Promise.all([
        api.fetchBudgetCycles(),
        api.fetchCategories(),
        api.fetchExpenses(),
        api.fetchBudgetTemplates(),
        api.fetchSavingsGoals(),
        api.fetchAccounts(),
        api.fetchIncomings(),
        api.fetchClosingRecords(),
      ]);

      setBudgetCycles(cycles);
      setTemplates(tmpls);
      setSavingsGoals(goals);
      setAccounts(accts);
      setIncomings(incs);
      setClosingRecords(closings);

      // Determine active budget for the current month (fallback: active, then latest)
      const monthForLoad = activeMonthRef.current;
      const activeBudget: BudgetCycle | null =
        cycles.find((c) => c.month === monthForLoad)
        || cycles.find((c) => c.status === 'active')
        || cycles[0]
        || null;

      const resolvedMonth = activeBudget ? activeBudget.month : monthForLoad;
      if (activeBudget) {
        setActiveMonthState(activeBudget.month);
      }
      let allocMap: Record<string, number> = {};
      if (activeBudget) {
        try {
          allocMap = await api.fetchAllocations(activeBudget.id);
        } catch { allocMap = {}; }
        setBudgetCycle(activeBudget);
      } else {
        setBudgetCycle(EMPTY_BUDGET(resolvedMonth, curr));
      }

      const withAlloc = overlayAllocations(catsRaw, allocMap);
      const childMap = buildChildMap(withAlloc);
      const normalized = normalizeExpenses(expensesRaw, childMap);
      setExpenses(normalized);
      setCategories(computeSpent(withAlloc, normalized, resolvedMonth));

      // Savings transactions across all goals
      const txLists = await Promise.all(
        goals.map((g) => api.fetchSavingsTransactions(g.id).catch(() => [] as SavingsTransaction[]))
      );
      const merged = txLists.flat().sort((a, b) => (a.date < b.date ? 1 : -1));
      setSavingsTransactions(merged);

      setIsAuthenticated(true);
      setAuthError(null);

      // Partner invites (non-fatal — new accounts may have none).
      api.fetchPendingInvites().then(setPendingInvites).catch(() => {});
    } catch (err: any) {
      if (/401|Unauthenticated/i.test(err?.message || '')) {
        setToken(null);
        setIsAuthenticated(false);
        setUserState(null);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initial bootstrap: Sanctum token first, else resume a Supabase session
  useEffect(() => {
    if (getToken()) {
      loadAllData().catch((err) => {
        console.error('Failed to load data:', err);
        setIsLoading(false);
      });
      return;
    }
    // No API token: if Supabase kept a session (refresh token in storage),
    // exchange it for an API token so the user stays signed in.
    setIsLoading(true);
    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        const accessToken = data.session?.access_token;
        if (!accessToken) {
          setIsAuthenticated(false);
          return;
        }
        try {
          const { token } = await api.syncSupabaseUser(accessToken);
          setToken(token);
          await loadAllData();
        } catch {
          setToken(null);
          setIsAuthenticated(false);
        }
      })
      .catch(() => setIsAuthenticated(false))
      .finally(() => setIsLoading(false));
  }, [loadAllData]);

  // Persist activeMonth pref
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');
      localStorage.setItem(PREF_KEY, JSON.stringify({ ...saved, activeMonth }));
    } catch { /* ignore */ }
  }, [activeMonth]);

  // ---------------- Auth (Supabase) ----------------
  // Credentials are managed by Supabase Auth (GoTrue). After Supabase
  // signs the user in, we sync to Laravel which creates the public.users
  // row in the Supabase database and returns the API token.

  const syncFromSupabaseSession = async (
    accessToken: string,
    opts: { name?: string; currency?: CurrencyCode; inviteToken?: string | null } = {}
  ) => {
    const { user: u, token } = await api.syncSupabaseUser(accessToken, opts);
    setToken(token);
    setUserState(u);
    setCurrencyState((u.currency as CurrencyCode) || currency);
    await loadAllData();
  };

  const login = async (email: string, password: string) => {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw new Error(error.message);
      const accessToken = data.session?.access_token;
      if (!accessToken) throw new Error('Sign-in succeeded but no session was returned.');
      await syncFromSupabaseSession(accessToken);
    } catch (err: any) {
      setAuthError(err?.message || 'Login failed');
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, inviteToken?: string | null) => {
    setAuthError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, currency } },
      });
      if (error) throw new Error(error.message);
      let accessToken = data.session?.access_token;
      if (!accessToken) {
        // Email confirmations may be on: no session yet. If the account
        // already existed, a direct sign-in still works — try it once.
        const retry = await supabase.auth.signInWithPassword({ email, password });
        if (retry.error || !retry.data.session?.access_token) {
          throw new Error('Account created. Check your email to confirm, then sign in.');
        }
        accessToken = retry.data.session.access_token;
      }
      await syncFromSupabaseSession(accessToken, { name, currency, inviteToken: inviteToken || undefined });
    } catch (err: any) {
      setAuthError(err?.message || 'Registration failed');
      throw err;
    }
  };

  const logoutUser = async () => {
    try {
      await api.logout();
    } catch { /* ignore */ }
    try {
      await supabase.auth.signOut();
    } catch { /* ignore */ }
    setToken(null);
    setIsAuthenticated(false);
    setUserState(null);
    setBudgetCycles([]);
    setBudgetCycle(EMPTY_BUDGET(activeMonth, currency));
    setCategories([]);
    setExpenses([]);
    setTemplates([]);
    setSavingsGoals([]);
    setSavingsTransactions([]);
    setClosingRecords([]);
    setAccounts([]);
    setIncomings([]);
    setInsights([]);
    setBudgetPartners([]);
    setBudgetOwner(null);
    setPendingInvites([]);
  };

  // ---------------- User / prefs ----------------

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    setUserState((prev) => (prev ? { ...prev, currency: c } : prev));
    setBudgetCycle((prev) => ({ ...prev, currency: c }));
    api.updateUserProfile({ currency: c }).catch(() => {});
  };

  const setUser = (u: UserProfile) => {
    setUserState(u);
    api.updateUserProfile({
      name: u.name,
      currency: u.currency as CurrencyCode,
      monthlySalaryDay: u.monthlySalaryDay ?? null,
    }).then((updated) => setUserState(updated)).catch(() => {});
  };

  const setActiveMonth = (m: string) => {
    setActiveMonthState(m);
    const match = budgetCycles.find((c) => c.month === m);
    if (match) {
      setBudgetCycle(match);
      api.fetchAllocations(match.id).then((allocMap) => {
        setCategories((prev) => computeSpent(overlayAllocations(prev, allocMap), expenses, m));
      }).catch(() => {});
    } else {
      setBudgetCycle((prev) => ({ ...prev, month: m }));
    }
  };

  const reloadCategories = async (budgetId: string, month: string, expenseList: Expense[]) => {
    const catsRaw = await api.fetchCategories();
    let allocMap: Record<string, number> = {};
    if (budgetId) {
      try { allocMap = await api.fetchAllocations(budgetId); } catch { allocMap = {}; }
    }
    const withAlloc = overlayAllocations(catsRaw, allocMap);
    setCategories(computeSpent(withAlloc, expenseList, month));
  };

  const updateBudgetCycle = async (income: number, mode: BudgetMode, curr?: CurrencyCode) => {
    const targetCurrency = curr || currency;
    try {
      const [yearStr, monthStr] = activeMonth.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10);
      const existing = budgetCycles.find((c) => c.month === activeMonth);
      let updated: BudgetCycle;
      if (existing && existing.id) {
        updated = await api.updateBudgetCycle(existing.id, { mode, totalIncome: income, currency: targetCurrency });
      } else {
        updated = await api.createBudgetCycle(month, year, mode, income, targetCurrency);
      }
      setBudgetCycles((prev) => {
        const others = prev.filter((c) => c.month !== updated.month);
        return [...others, updated].sort((a, b) => (a.month < b.month ? 1 : -1));
      });
      setBudgetCycle(updated);
      if (curr) setCurrencyState(curr);
    } catch (err: any) {
      alert(err?.message || 'Failed to save budget cycle');
    }
  };

  // ---------------- Categories ----------------

  const addCategory = async (
    name: string,
    icon: string,
    color: string,
    allocated: number,
    subcategoryNames: string[] = []
  ) => {
    try {
      const created = await api.createCategory({ name, icon, color });
      const newSubs: Subcategory[] = [];
      for (const subName of subcategoryNames) {
        try {
          const sub = await api.createCategory({ name: subName, icon, color, parentId: created.id });
          const perSub = Math.floor(allocated / (subcategoryNames.length || 1));
          newSubs.push({ id: sub.id, name: sub.name, allocated: perSub, spent: 0 });
          if (budgetCycle.id && perSub > 0) {
            await api.setAllocation(budgetCycle.id, sub.id, perSub).catch(() => {});
          }
        } catch { /* continue */ }
      }
      if (budgetCycle.id && allocated > 0 && newSubs.length === 0) {
        await api.setAllocation(budgetCycle.id, created.id, allocated).catch(() => {});
      }
      const full: Category = { ...created, allocated, spent: 0, subcategories: newSubs };
      setCategories((prev) => [...prev, full]);
      if (budgetCycle.id) {
        api.fetchAllocations(budgetCycle.id).then((allocMap) => {
          setCategories((prev) => computeSpent(overlayAllocations(prev, allocMap), expenses, activeMonth));
        }).catch(() => {});
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to add category');
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      await api.updateCategory(id, updates);
      setCategories((prev) => prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat)));
    } catch (err: any) {
      alert(err?.message || 'Failed to update category');
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const associated = expenses.filter((e) => e.categoryId === id);
      await api.deleteCategory(id);
      for (const e of associated) {
        try { await api.deleteExpense(e.id); } catch { /* ignore */ }
      }
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
      if (associated.length > 0) {
        setExpenses((prev) => prev.filter((e) => e.categoryId !== id));
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to delete category');
    }
  };

  const archiveCategory = async (id: string) => {
    const target = categories.find((c) => c.id === id);
    if (target && !target.isArchived) {
      try {
        await api.deleteCategory(id);
      } catch (err: any) {
        alert(err?.message || 'Failed to archive category');
        return;
      }
    }
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, isArchived: !cat.isArchived } : cat))
    );
  };

  const reorderCategory = (id: string, direction: 'up' | 'down') => {
    setCategories((prev) => {
      const index = prev.findIndex((c) => c.id === id);
      if (index < 0) return prev;
      if (direction === 'up' && index === 0) return prev;
      if (direction === 'down' && index === prev.length - 1) return prev;
      const next = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next.map((cat, idx) => ({ ...cat, order: idx + 1 }));
    });
  };

  const addSubcategory = async (categoryId: string, name: string, allocated: number) => {
    try {
      const sub = await api.createCategory({ name, parentId: categoryId });
      if (budgetCycle.id && allocated > 0) {
        await api.setAllocation(budgetCycle.id, sub.id, allocated).catch(() => {});
      }
      const newSub: Subcategory = { id: sub.id, name: sub.name, allocated, spent: 0 };
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id !== categoryId) return cat;
          return { ...cat, subcategories: [...(cat.subcategories || []), newSub] };
        })
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to add subcategory');
    }
  };

  const updateSubcategory = async (
    categoryId: string,
    subcategoryId: string,
    updates: Partial<Subcategory>
  ) => {
    try {
      if (updates.name !== undefined) {
        await api.updateCategory(subcategoryId, { name: updates.name });
      }
      if (updates.allocated !== undefined && budgetCycle.id) {
        await api.setAllocation(budgetCycle.id, subcategoryId, updates.allocated).catch(() => {});
      }
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id !== categoryId) return cat;
          return {
            ...cat,
            subcategories: (cat.subcategories || []).map((sub) =>
              sub.id === subcategoryId ? { ...sub, ...updates } : sub
            ),
          };
        })
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to update subcategory');
    }
  };

  const deleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    try {
      await api.deleteCategory(subcategoryId);
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id !== categoryId) return cat;
          return {
            ...cat,
            subcategories: (cat.subcategories || []).filter((sub) => sub.id !== subcategoryId),
          };
        })
      );
    } catch (err: any) {
      alert(err?.message || 'Failed to delete subcategory');
    }
  };

  const allocateCategoryBudget = async (categoryId: string, allocated: number) => {
    if (!budgetCycle.id) {
      setCategories((prev) =>
        prev.map((cat) => (cat.id === categoryId ? { ...cat, allocated } : cat))
      );
      return;
    }
    try {
      await api.setAllocation(budgetCycle.id, categoryId, allocated);
      const allocMap = await api.fetchAllocations(budgetCycle.id);
      setCategories((prev) => computeSpent(overlayAllocations(prev, allocMap), expenses, activeMonth));
    } catch (err: any) {
      alert(err?.message || 'Failed to allocate budget');
    }
  };

  // ---------------- Expenses ----------------

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    try {
      const created = await api.createExpense({
        ...expenseData,
        budgetId: budgetCycle.id || null,
      });
      const childMap = buildChildMap(categories);
      const normalized = normalizeExpenses([created], childMap);
      // Preserve user's subcategory selection when backend only stores one category id
      const withSub = normalized.map((e) => ({
        ...e,
        subcategoryId: expenseData.subcategoryId || e.subcategoryId,
        categoryId: expenseData.categoryId || e.categoryId,
      }));
      setExpenses((prev) => [...withSub, ...prev]);
    } catch (err: any) {
      alert(err?.message || 'Failed to add expense');
    }
  };

  const updateExpense = async (id: string, expenseData: Partial<Expense>) => {
    try {
      const updated = await api.updateExpense(id, expenseData);
      setExpenses((prev) => prev.map((e) => (id === e.id ? { ...updated, subcategoryId: expenseData.subcategoryId ?? e.subcategoryId, categoryId: expenseData.categoryId ?? updated.categoryId } : e)));
    } catch (err: any) {
      alert(err?.message || 'Failed to update expense');
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await api.deleteExpense(id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete expense');
    }
  };

  // ---------------- Templates ----------------

  const applyBudgetTemplate = async (templateId: string, customIncome?: number) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    try {
      const baseIncome = customIncome || budgetCycle.totalIncome || 0;
      if (baseIncome <= 0) {
        alert('Set your monthly income first, then apply a template.');
        return;
      }
      // Ensure a budget exists for the active month
      let cycle = budgetCycles.find((c) => c.month === activeMonth) || (budgetCycle.id ? budgetCycle : null);
      if (!cycle || !cycle.id) {
        const [yearStr, monthStr] = activeMonth.split('-');
        cycle = await api.createBudgetCycle(parseInt(monthStr, 10), parseInt(yearStr, 10), budgetCycle.mode || 'salary', baseIncome, currency);
        setBudgetCycles((prev) => [...prev.filter((c) => c.month !== cycle!.month), cycle!]);
        setBudgetCycle(cycle);
      }
      const targetBudgetId = cycle.id;

      // Map template allocations onto categories (find-or-create by name)
      const existingByName = new Map<string, Category>();
      categories.forEach((c) => existingByName.set(c.name.toLowerCase(), c));

      for (const alloc of tpl.categoryAllocations) {
        const catAllocated = Math.round((baseIncome * alloc.percentageOfIncome) / 100);
        let parent = existingByName.get(alloc.categoryName.toLowerCase());
        if (!parent) {
          const created = await api.createCategory({ name: alloc.categoryName, icon: alloc.icon, color: alloc.color });
          parent = { ...created, allocated: 0, spent: 0, subcategories: [] };
          existingByName.set(alloc.categoryName.toLowerCase(), parent);
        }
        if (alloc.subcategories && alloc.subcategories.length > 0) {
          const existingSubs = new Map((parent.subcategories || []).map((s) => [s.name.toLowerCase(), s]));
          for (const sub of alloc.subcategories) {
            const subAllocated = Math.round((catAllocated * sub.percentageOfCategory) / 100);
            let subId = existingSubs.get(sub.name.toLowerCase())?.id;
            if (!subId) {
              const createdSub = await api.createCategory({ name: sub.name, icon: alloc.icon, color: alloc.color, parentId: parent.id });
              subId = createdSub.id;
            }
            if (subAllocated > 0) {
              await api.setAllocation(targetBudgetId, subId, subAllocated).catch(() => {});
            }
          }
        } else if (catAllocated > 0) {
          await api.setAllocation(targetBudgetId, parent.id, catAllocated).catch(() => {});
        }
      }
      await reloadCategories(targetBudgetId, activeMonth, expenses);
    } catch (err: any) {
      alert(err?.message || 'Failed to apply template');
    }
  };

  const addCustomTemplate = async (name: string, description: string) => {
    try {
      const totalAlloc = categories.reduce((sum, c) => sum + c.allocated, 0) || 1;
      const config = {
        categoryAllocations: categories.map((c) => ({
          categoryName: c.name,
          icon: c.icon,
          color: c.color,
          percentageOfIncome: Math.round((c.allocated / totalAlloc) * 100),
          subcategories: (c.subcategories || []).map((s) => ({
            name: s.name,
            percentageOfCategory: c.allocated > 0 ? Math.round((s.allocated / c.allocated) * 100) : 100,
          })),
        })),
      };
      const created = await api.createTemplate({ name, description, config });
      setTemplates((prev) => [...prev, created]);
    } catch (err: any) {
      alert(err?.message || 'Failed to save template');
    }
  };

  // ---------------- Savings ----------------

  const refreshSavings = async (goals: SavingsGoal[]) => {
    setSavingsGoals(goals);
    const txLists = await Promise.all(
      goals.map((g) => api.fetchSavingsTransactions(g.id).catch(() => [] as SavingsTransaction[]))
    );
    setSavingsTransactions(txLists.flat().sort((a, b) => (a.date < b.date ? 1 : -1)));
  };

  const ensureVaultGoal = async (): Promise<SavingsGoal> => {
    if (savingsGoals.length > 0) return savingsGoals[0];
    const created = await api.createSavingsGoal({
      title: 'General Savings',
      targetAmount: 0,
      deadline: '',
      icon: 'ShieldCheck',
      color: 'emerald',
    });
    const next = [...savingsGoals, created];
    setSavingsGoals(next);
    return created;
  };

  const depositToSavings = async (amount: number, note: string) => {
    try {
      const target = await ensureVaultGoal();
      await api.addSavingsTransaction(target.id, { type: 'deposit', amount, note });
      const goals = await api.fetchSavingsGoals();
      await refreshSavings(goals);
    } catch (err: any) {
      alert(err?.message || 'Failed to deposit to savings');
    }
  };

  const withdrawFromSavings = async (amount: number, note: string) => {
    if (amount > savingsBalance) {
      alert('Withdrawal amount exceeds available savings balance.');
      return;
    }
    try {
      const target = await ensureVaultGoal();
      await api.addSavingsTransaction(target.id, { type: 'withdraw', amount, note });
      const goals = await api.fetchSavingsGoals();
      await refreshSavings(goals);
    } catch (err: any) {
      alert(err?.message || 'Failed to withdraw from savings');
    }
  };

  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    try {
      const created = await api.createSavingsGoal(goal);
      setSavingsGoals((prev) => [...prev, created]);
    } catch (err: any) {
      alert(err?.message || 'Failed to add savings goal');
    }
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    try {
      const current = savingsGoals.find((g) => g.id === id);
      if (current && updates.currentAmount !== undefined && updates.currentAmount !== current.currentAmount) {
        const delta = updates.currentAmount - current.currentAmount;
        if (delta > 0) {
          await api.addSavingsTransaction(id, { type: 'deposit', amount: delta, note: 'Quick deposit' });
        } else if (delta < 0) {
          await api.addSavingsTransaction(id, { type: 'withdraw', amount: Math.abs(delta), note: 'Quick withdrawal' });
        }
      }
      const { currentAmount: _ignored, ...rest } = updates;
      let updated = current;
      if (Object.keys(rest).length > 0) {
        updated = await api.updateSavingsGoal(id, rest);
      } else {
        const goals = await api.fetchSavingsGoals();
        updated = goals.find((g) => g.id === id) || current;
      }
      if (updated) {
        setSavingsGoals((prev) => prev.map((g) => (g.id === id ? updated! : g)));
        const txs = await api.fetchSavingsTransactions(id).catch(() => [] as SavingsTransaction[]);
        setSavingsTransactions((prev) => {
          const others = prev.filter((tx) => !txs.some((n) => n.id === tx.id));
          return [...txs, ...others].sort((a, b) => (a.date < b.date ? 1 : -1));
        });
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to update savings goal');
    }
  };

  const deleteSavingsGoal = async (id: string) => {
    try {
      await api.deleteSavingsGoal(id);
      setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete savings goal');
    }
  };

  // ---------------- Monthly closing ----------------

  const performMonthlyClosing = async (carryOption: ClosingCarryOption, customSplitSavings?: number) => {
    try {
      const totalIncome = budgetCycle.totalIncome;
      const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0);
      const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
      const remaining = totalIncome - totalSpent;

      let amountToSavings = 0;
      let amountToNextMonth = 0;
      if (remaining > 0) {
        if (carryOption === 'savings') {
          amountToSavings = remaining;
        } else if (carryOption === 'next_month') {
          amountToNextMonth = remaining;
        } else if (carryOption === 'split') {
          amountToSavings = customSplitSavings !== undefined ? customSplitSavings : Math.round(remaining / 2);
          amountToNextMonth = remaining - amountToSavings;
        }
      }

      const action = carryOption === 'savings' ? 'to_savings' : carryOption === 'next_month' ? 'carry_forward' : 'split';

      if (budgetCycle.id) {
        const savingsId = amountToSavings > 0 && savingsGoals.length > 0 ? savingsGoals[0].id : null;
        await api.closeBudget(budgetCycle.id, {
          remainingAmount: remaining,
          action,
          toSavingsAmount: amountToSavings,
          toNextBudgetAmount: amountToNextMonth,
          savingsId,
        });
      }

      if (amountToSavings > 0) {
        await depositToSavings(amountToSavings, `Monthly Rollover from ${activeMonth}`);
      }

      const [yearStr, monthStr] = activeMonth.split('-');
      let year = parseInt(yearStr, 10);
      let month = parseInt(monthStr, 10) + 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
      const nextMonthStr = `${year}-${month.toString().padStart(2, '0')}`;
      const newNextIncome = budgetCycle.totalIncome + amountToNextMonth;

      try {
        const next = await api.createBudgetCycle(month, year, budgetCycle.mode, newNextIncome, currency);
        setBudgetCycles((prev) => [...prev.filter((c) => c.month !== next.month), next]);
        setBudgetCycle(next);
      } catch {
        setBudgetCycle((prev) => ({ ...prev, status: 'closed' }));
      }

      setActiveMonthState(nextMonthStr);
      setCategories((prev) =>
        prev.map((c) => ({
          ...c,
          spent: 0,
          subcategories: (c.subcategories || []).map((s) => ({ ...s, spent: 0 })),
        }))
      );

      try {
        const closings = await api.fetchClosingRecords();
        setClosingRecords(closings);
      } catch { /* ignore */ }
      void totalAllocated;
    } catch (err: any) {
      alert(err?.message || 'Failed to close the month');
    }
  };

  // ---------------- AI insights ----------------

  const fetchAIInsights = async () => {
    setIsAiLoading(true);
    try {
      const monthExpenses = expenses.filter((e) => e.date.startsWith(activeMonth));
      const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0);

      const res = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalIncome: budgetCycle.totalIncome,
          totalAllocated,
          totalSpent,
          categories,
          expenses: monthExpenses,
          savingsBalance,
          currency,
        }),
      });

      if (!res.ok) throw new Error('Server returned non-200');
      const data = await res.json();
      if (data.insights && Array.isArray(data.insights)) {
        setInsights(data.insights);
      }
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // ---------------- Accounts ----------------

  const addAccount = async (account: Omit<AccountWallet, 'id' | 'createdAt'>) => {
    try {
      const created = await api.createAccount(account);
      setAccounts((prev) => [created, ...prev]);
    } catch (err: any) {
      alert(err?.message || 'Failed to add account');
    }
  };

  const updateAccount = async (id: string, updates: Partial<AccountWallet>) => {
    try {
      const updated = await api.updateAccount(id, updates);
      setAccounts((prev) => prev.map((acc) => (acc.id === id ? updated : acc)));
    } catch (err: any) {
      alert(err?.message || 'Failed to update account');
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      await api.deleteAccount(id);
      setAccounts((prev) => prev.filter((acc) => acc.id !== id));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete account');
    }
  };

  // ---------------- Incomings ----------------

  const addIncoming = async (incoming: Omit<IncomingIncome, 'id' | 'createdAt' | 'status'>) => {
    try {
      const created = await api.createIncoming(incoming);
      setIncomings((prev) => [created, ...prev]);
    } catch (err: any) {
      alert(err?.message || 'Failed to add incoming');
    }
  };

  const updateIncoming = async (id: string, updates: Partial<IncomingIncome>) => {
    try {
      const updated = await api.updateIncoming(id, updates);
      setIncomings((prev) => prev.map((inc) => (inc.id === id ? updated : inc)));
    } catch (err: any) {
      alert(err?.message || 'Failed to update incoming');
    }
  };

  const deleteIncoming = async (id: string) => {
    try {
      await api.deleteIncoming(id);
      setIncomings((prev) => prev.filter((inc) => inc.id !== id));
    } catch (err: any) {
      alert(err?.message || 'Failed to delete incoming');
    }
  };

  const markIncomingAsReceived = async (id: string, addToTotalIncome: boolean = false) => {
    const inc = incomings.find((item) => item.id === id);
    if (!inc || inc.status === 'received') return;
    try {
      const updated = await api.markIncomingReceived(id);
      setIncomings((prev) => prev.map((item) => (item.id === id ? updated : item)));

      if (inc.accountId) {
        setAccounts((prev) =>
          prev.map((acc) =>
            acc.id === inc.accountId ? { ...acc, balance: acc.balance + inc.amount } : acc
          )
        );
      }

      if (addToTotalIncome && budgetCycle.id) {
        try {
          const updatedCycle = await api.updateBudgetCycle(budgetCycle.id, {
            totalIncome: budgetCycle.totalIncome + inc.amount,
          });
          setBudgetCycle(updatedCycle);
          setBudgetCycles((prev) => prev.map((c) => (c.id === updatedCycle.id ? updatedCycle : c)));
        } catch {
          setBudgetCycle((prev) => ({ ...prev, totalIncome: prev.totalIncome + inc.amount }));
        }
      } else if (addToTotalIncome) {
        setBudgetCycle((prev) => ({ ...prev, totalIncome: prev.totalIncome + inc.amount }));
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to mark incoming as received');
    }
  };

  // ---------------- Budget partners ----------------

  const refreshPartners = useCallback(async () => {
    if (!budgetCycle.id) {
      setBudgetPartners([]);
      setBudgetOwner(null);
      return;
    }
    try {
      const { owner, members } = await api.fetchBudgetPartners(budgetCycle.id);
      setBudgetOwner(owner);
      setBudgetPartners(members);
    } catch {
      // Silently keep previous list on failure.
    }
  }, [budgetCycle.id]);

  useEffect(() => {
    if (isAuthenticated && budgetCycle.id) {
      refreshPartners().catch(() => {});
    } else if (!budgetCycle.id) {
      setBudgetPartners([]);
      setBudgetOwner(null);
    }
  }, [isAuthenticated, budgetCycle.id, refreshPartners]);

  const invitePartner = async (email: string, role: PartnerRole) => {
    if (!budgetCycle.id) throw new Error('No active budget to share.');
    const created = await api.inviteBudgetPartner(budgetCycle.id, email, role);
    setBudgetPartners((prev) => {
      const others = prev.filter((p) => p.email.toLowerCase() !== created.email.toLowerCase());
      return [...others, created];
    });
    return created;
  };

  const changePartnerRole = async (memberId: string, role: PartnerRole) => {
    if (!budgetCycle.id) return;
    const updated = await api.updateBudgetPartnerRole(budgetCycle.id, memberId, role);
    setBudgetPartners((prev) => prev.map((p) => (p.id === memberId ? updated : p)));
  };

  const removePartner = async (memberId: string) => {
    if (!budgetCycle.id) return;
    await api.removeBudgetPartner(budgetCycle.id, memberId);
    setBudgetPartners((prev) => prev.filter((p) => p.id !== memberId));
  };

  const refreshPendingInvites = useCallback(async () => {
    try {
      setPendingInvites(await api.fetchPendingInvites());
    } catch {
      /* ignore when logged out */
    }
  }, []);

  const acceptInviteToken = async (token: string) => {
    await api.acceptInvite(token);
    await Promise.all([refreshPendingInvites(), loadAllData().catch(() => {})]);
  };

  const declineInviteToken = async (token: string) => {
    await api.declineInvite(token);
    await refreshPendingInvites();
  };

  return (
    <ExpenseContext.Provider
      value={{
        user,
        setUser,
        currency,
        setCurrency,
        language,
        setLanguage,
        theme,
        setTheme,
        t,
        dir,
        isAuthenticated,
        isLoading,
        authError,
        login,
        register,
        logoutUser,
        activeMonth,
        setActiveMonth,
        budgetCycle,
        updateBudgetCycle,
        myBudgetRole,
        canEditBudget,
        isBudgetOwner,
        budgetPartners,
        budgetOwner,
        refreshPartners,
        invitePartner,
        changePartnerRole,
        removePartner,
        pendingInvites,
        refreshPendingInvites,
        acceptInviteToken,
        declineInviteToken,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        archiveCategory,
        reorderCategory,
        addSubcategory,
        updateSubcategory,
        deleteSubcategory,
        allocateCategoryBudget,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        templates,
        applyBudgetTemplate,
        addCustomTemplate,
        savingsGoals,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        savingsTransactions,
        savingsBalance,
        depositToSavings,
        withdrawFromSavings,
        closingRecords,
        performMonthlyClosing,
        insights,
        fetchAIInsights,
        isAiLoading,
        accounts,
        addAccount,
        updateAccount,
        deleteAccount,
        incomings,
        addIncoming,
        updateIncoming,
        deleteIncoming,
        markIncomingAsReceived,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};
