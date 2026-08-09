import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  IncomingIncome
} from '../types';
import {
  DEFAULT_USER,
  INITIAL_CATEGORIES,
  INITIAL_EXPENSES,
  BUDGET_TEMPLATES,
  INITIAL_SAVINGS_GOALS,
  INITIAL_ACCOUNTS,
  INITIAL_INCOMINGS
} from '../data/defaults';

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
  activeMonth: string;
  setActiveMonth: (month: string) => void;
  budgetCycle: BudgetCycle;
  updateBudgetCycle: (income: number, mode: BudgetMode, currency?: CurrencyCode) => void;
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
  resetToDemoData: () => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'expense_tracker_v1_data';

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_user`);
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_language`);
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_language`, lang);
  };

  const [theme, setThemeState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_theme`);
    return (saved as ThemeId) || 'obsidian';
  });

  const setTheme = (th: ThemeId) => {
    setThemeState(th);
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_theme`, th);
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

  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    return user.currency || 'USD';
  });

  const [activeMonth, setActiveMonthState] = useState<string>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_activeMonth`);
    return saved || '2026-08';
  });

  const [budgetCycle, setBudgetCycle] = useState<BudgetCycle>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_budgetCycle`);
    return saved
      ? JSON.parse(saved)
      : {
          id: 'cycle-1',
          month: '2026-08',
          mode: 'salary',
          totalIncome: 4000,
          currency: 'USD',
          status: 'active',
        };
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_categories`);
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [templates, setTemplates] = useState<BudgetTemplate[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_templates`);
    return saved ? JSON.parse(saved) : BUDGET_TEMPLATES;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_savingsGoals`);
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
  });

  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_savingsTx`);
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'tx-1',
            date: '2026-08-01',
            type: 'deposit',
            amount: 4000,
            note: 'Initial Reserve Balance',
          },
        ];
  });

  const [closingRecords, setClosingRecords] = useState<ClosingRecord[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_closingRecords`);
    return saved ? JSON.parse(saved) : [];
  });

  const [accounts, setAccounts] = useState<AccountWallet[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_accounts`);
    return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_accounts`, JSON.stringify(accounts));
  }, [accounts]);

  const [incomings, setIncomings] = useState<IncomingIncome[]>(() => {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY}_incomings`);
    return saved ? JSON.parse(saved) : INITIAL_INCOMINGS;
  });

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_incomings`, JSON.stringify(incomings));
  }, [incomings]);

  const [insights, setInsights] = useState<SmartInsight[]>([
    {
      id: 'ins-1',
      type: 'info',
      title: '50/30/20 Budget Optimization',
      message: 'Your current allocation leaves $200 unallocated from your $4,000 monthly income.',
      actionableTip: 'Assign unallocated funds to your Emergency Vault subcategory or Savings Goal.',
      confidence: 'Rule Engine',
    },
    {
      id: 'ins-2',
      type: 'warning',
      title: 'Food & Dining Spending Rate',
      message: 'You have used 77.5% of your Food & Dining budget in the first week.',
      actionableTip: 'Consider preparing home meals for the remaining days of this month.',
      confidence: 'Spending Velocity',
    },
  ]);

  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_user`, JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_activeMonth`, activeMonth);
  }, [activeMonth]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_budgetCycle`, JSON.stringify(budgetCycle));
  }, [budgetCycle]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_categories`, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_expenses`, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_templates`, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_savingsGoals`, JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_savingsTx`, JSON.stringify(savingsTransactions));
  }, [savingsTransactions]);

  useEffect(() => {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_closingRecords`, JSON.stringify(closingRecords));
  }, [closingRecords]);

  // Recalculate Category Spent from Expenses
  useEffect(() => {
    const monthExpenses = expenses.filter((e) => e.date.startsWith(activeMonth));
    setCategories((prevCategories) =>
      prevCategories.map((cat) => {
        const catExpenses = monthExpenses.filter((e) => e.categoryId === cat.id);
        const totalCatSpent = catExpenses.reduce((sum, e) => sum + e.amount, 0);

        const updatedSubcategories = cat.subcategories.map((sub) => {
          const subSpent = catExpenses
            .filter((e) => e.subcategoryId === sub.id)
            .reduce((sum, e) => sum + e.amount, 0);
          return { ...sub, spent: subSpent };
        });

        return {
          ...cat,
          spent: totalCatSpent,
          subcategories: updatedSubcategories,
        };
      })
    );
  }, [expenses, activeMonth]);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    setUserState((prev) => ({ ...prev, currency: c }));
    setBudgetCycle((prev) => ({ ...prev, currency: c }));
  };

  const setUser = (u: UserProfile) => {
    setUserState(u);
  };

  const setActiveMonth = (m: string) => {
    setActiveMonthState(m);
    setBudgetCycle((prev) => ({ ...prev, month: m }));
  };

  const updateBudgetCycle = (income: number, mode: BudgetMode, curr?: CurrencyCode) => {
    const targetCurrency = curr || currency;
    setBudgetCycle({
      id: `cycle-${activeMonth}`,
      month: activeMonth,
      mode,
      totalIncome: income,
      currency: targetCurrency,
      status: 'active',
    });
    if (curr) setCurrencyState(curr);
  };

  // Category CRUD
  const addCategory = (
    name: string,
    icon: string,
    color: string,
    allocated: number,
    subcategoryNames: string[] = []
  ) => {
    const newCatId = `cat-${Date.now()}`;
    const subs: Subcategory[] = subcategoryNames.map((subName, idx) => ({
      id: `sub-${Date.now()}-${idx}`,
      name: subName,
      allocated: Math.floor(allocated / (subcategoryNames.length || 1)),
      spent: 0,
    }));

    const newCategory: Category = {
      id: newCatId,
      name,
      icon,
      color,
      allocated,
      spent: 0,
      isArchived: false,
      order: categories.length + 1,
      subcategories: subs,
    };

    setCategories((prev) => [...prev, newCategory]);
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    );
  };

  const deleteCategory = (id: string) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
    // Also cleanup expenses associated
    setExpenses((prev) => prev.filter((e) => e.categoryId !== id));
  };

  const archiveCategory = (id: string) => {
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

      const newCategories = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      const temp = newCategories[index];
      newCategories[index] = newCategories[targetIndex];
      newCategories[targetIndex] = temp;

      return newCategories.map((cat, idx) => ({ ...cat, order: idx + 1 }));
    });
  };

  const addSubcategory = (categoryId: string, name: string, allocated: number) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        const newSub: Subcategory = {
          id: `sub-${Date.now()}`,
          name,
          allocated,
          spent: 0,
        };
        return {
          ...cat,
          subcategories: [...cat.subcategories, newSub],
        };
      })
    );
  };

  const updateSubcategory = (
    categoryId: string,
    subcategoryId: string,
    updates: Partial<Subcategory>
  ) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          subcategories: cat.subcategories.map((sub) =>
            sub.id === subcategoryId ? { ...sub, ...updates } : sub
          ),
        };
      })
    );
  };

  const deleteSubcategory = (categoryId: string, subcategoryId: string) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          subcategories: cat.subcategories.filter((sub) => sub.id !== subcategoryId),
        };
      })
    );
  };

  const allocateCategoryBudget = (categoryId: string, allocated: number) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === categoryId ? { ...cat, allocated } : cat))
    );
  };

  // Expense CRUD
  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const updateExpense = (id: string, expenseData: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...expenseData } : e))
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Apply Budget Template
  const applyBudgetTemplate = (templateId: string, customIncome?: number) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;

    const baseIncome = customIncome || budgetCycle.totalIncome || 4000;

    const newCategories: Category[] = tpl.categoryAllocations.map((alloc, idx) => {
      const catAllocated = Math.round((baseIncome * alloc.percentageOfIncome) / 100);
      const subs: Subcategory[] = alloc.subcategories.map((sub, sIdx) => ({
        id: `sub-${Date.now()}-${idx}-${sIdx}`,
        name: sub.name,
        allocated: Math.round((catAllocated * sub.percentageOfCategory) / 100),
        spent: 0,
      }));

      return {
        id: `cat-tpl-${Date.now()}-${idx}`,
        name: alloc.categoryName,
        icon: alloc.icon,
        color: alloc.color,
        allocated: catAllocated,
        spent: 0,
        isArchived: false,
        order: idx + 1,
        subcategories: subs,
      };
    });

    setCategories(newCategories);
  };

  const addCustomTemplate = (name: string, description: string) => {
    const totalAlloc = categories.reduce((sum, c) => sum + c.allocated, 0) || 1;
    const newTpl: BudgetTemplate = {
      id: `tpl-${Date.now()}`,
      name,
      type: 'custom',
      description,
      icon: 'Bookmark',
      categoryAllocations: categories.map((c) => ({
        categoryName: c.name,
        icon: c.icon,
        color: c.color,
        percentageOfIncome: Math.round((c.allocated / totalAlloc) * 100),
        subcategories: c.subcategories.map((s) => ({
          name: s.name,
          percentageOfCategory: c.allocated > 0 ? Math.round((s.allocated / c.allocated) * 100) : 100,
        })),
      })),
    };
    setTemplates((prev) => [...prev, newTpl]);
  };

  // Savings
  const savingsBalance = savingsTransactions.reduce((acc, tx) => {
    return tx.type === 'deposit' ? acc + tx.amount : acc - tx.amount;
  }, 0);

  const depositToSavings = (amount: number, note: string) => {
    const tx: SavingsTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'deposit',
      amount,
      note,
      sourceMonth: activeMonth,
    };
    setSavingsTransactions((prev) => [tx, ...prev]);
  };

  const withdrawFromSavings = (amount: number, note: string) => {
    if (amount > savingsBalance) {
      alert('Withdrawal amount exceeds available savings balance.');
      return;
    }
    const tx: SavingsTransaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      type: 'withdraw',
      amount,
      note,
      sourceMonth: activeMonth,
    };
    setSavingsTransactions((prev) => [tx, ...prev]);
  };

  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}`,
      currentAmount: 0,
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  const updateSavingsGoal = (id: string, updates: Partial<SavingsGoal>) => {
    setSavingsGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates } : g))
    );
  };

  const deleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Monthly Closing
  const performMonthlyClosing = (carryOption: ClosingCarryOption, customSplitSavings?: number) => {
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

    if (amountToSavings > 0) {
      depositToSavings(amountToSavings, `Monthly Rollover from ${activeMonth}`);
    }

    const record: ClosingRecord = {
      id: `close-${activeMonth}`,
      month: activeMonth,
      totalIncome,
      totalAllocated,
      totalSpent,
      remainingAmount: remaining,
      carryOption,
      amountToSavings,
      amountToNextMonth,
      closedAt: new Date().toISOString(),
    };

    setClosingRecords((prev) => [record, ...prev]);
    setBudgetCycle((prev) => ({ ...prev, status: 'closed', closedAt: new Date().toISOString() }));

    // Prepare next month (e.g., 2026-09)
    const [yearStr, monthStr] = activeMonth.split('-');
    let year = parseInt(yearStr, 10);
    let month = parseInt(monthStr, 10) + 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
    const nextMonthStr = `${year}-${month.toString().padStart(2, '0')}`;

    const newNextIncome = budgetCycle.totalIncome + amountToNextMonth;

    setActiveMonthState(nextMonthStr);
    setBudgetCycle({
      id: `cycle-${nextMonthStr}`,
      month: nextMonthStr,
      mode: budgetCycle.mode,
      totalIncome: newNextIncome,
      currency: currency,
      status: 'active',
    });

    // Reset categories spent for new month
    setCategories((prev) =>
      prev.map((c) => ({
        ...c,
        spent: 0,
        subcategories: c.subcategories.map((s) => ({ ...s, spent: 0 })),
      }))
    );
  };

  // Fetch AI Insights from server endpoint
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

  // Account Handlers
  const addAccount = (account: Omit<AccountWallet, 'id' | 'createdAt'>) => {
    const newAccount: AccountWallet = {
      ...account,
      id: `acc-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setAccounts((prev) => [newAccount, ...prev]);
  };

  const updateAccount = (id: string, updates: Partial<AccountWallet>) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, ...updates } : acc))
    );
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== id));
  };

  // Incoming Handlers
  const addIncoming = (incoming: Omit<IncomingIncome, 'id' | 'createdAt' | 'status'>) => {
    const newIncoming: IncomingIncome = {
      ...incoming,
      id: `inc-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setIncomings((prev) => [newIncoming, ...prev]);
  };

  const updateIncoming = (id: string, updates: Partial<IncomingIncome>) => {
    setIncomings((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, ...updates } : inc))
    );
  };

  const deleteIncoming = (id: string) => {
    setIncomings((prev) => prev.filter((inc) => inc.id !== id));
  };

  const markIncomingAsReceived = (id: string, addToTotalIncome: boolean = false) => {
    const inc = incomings.find((item) => item.id === id);
    if (!inc || inc.status === 'received') return;

    const today = new Date().toISOString().split('T')[0];
    updateIncoming(id, { status: 'received', receivedDate: today });

    if (inc.accountId) {
      setAccounts((prev) =>
        prev.map((acc) =>
          acc.id === inc.accountId ? { ...acc, balance: acc.balance + inc.amount } : acc
        )
      );
    }

    if (addToTotalIncome) {
      setBudgetCycle((prev) => ({
        ...prev,
        totalIncome: prev.totalIncome + inc.amount,
      }));
    }
  };

  const resetToDemoData = () => {
    localStorage.clear();
    setUserState(DEFAULT_USER);
    setCurrencyState('USD');
    setActiveMonthState('2026-08');
    setBudgetCycle({
      id: 'cycle-1',
      month: '2026-08',
      mode: 'salary',
      totalIncome: 4000,
      currency: 'USD',
      status: 'active',
    });
    setCategories(INITIAL_CATEGORIES);
    setExpenses(INITIAL_EXPENSES);
    setTemplates(BUDGET_TEMPLATES);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setSavingsTransactions([
      {
        id: 'tx-1',
        date: '2026-08-01',
        type: 'deposit',
        amount: 4000,
        note: 'Initial Reserve Balance',
      },
    ]);
    setClosingRecords([]);
    setAccounts(INITIAL_ACCOUNTS);
    setIncomings(INITIAL_INCOMINGS);
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
        activeMonth,
        setActiveMonth,
        budgetCycle,
        updateBudgetCycle,
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
        resetToDemoData,
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
