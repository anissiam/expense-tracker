import React from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../data/currencies';
import { DynamicIcon } from '../Common/DynamicIcon';
import { AlertTriangle } from 'lucide-react';

/**
 * Phase 1: direct-entry deduction visuals.
 * remaining = allocated - spent per category and in total.
 * Overspending is allowed but always flagged (negative remaining).
 */
export const BudgetOverview: React.FC = () => {
  const { categories, expenses, activeMonth, budgetCycle, currency } = useExpense();

  const monthExpenses = expenses.filter((e) => e.date.startsWith(activeMonth));
  const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0);
  const totalBudget = totalAllocated > 0 ? totalAllocated : budgetCycle.totalIncome;
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalBudget - totalSpent;
  const isOverspent = remaining < 0;

  const barColor = (pct: number) =>
    pct >= 100 ? 'bg-rose-600' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-700';

  return (
    <div className="space-y-4">
      {/* Key metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#FAF8F5] border border-[#E3DDD3] rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] font-mono font-bold text-[#728074] uppercase">Total Budget</div>
          <div className="font-serif text-2xl font-extrabold text-[#1E2922] mt-1">
            {formatCurrency(totalBudget, currency)}
          </div>
          <div className="text-[10px] font-mono text-[#78857A] mt-1">Cycle {activeMonth}</div>
        </div>
        <div className="bg-[#FAF8F5] border border-[#E3DDD3] rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] font-mono font-bold text-[#728074] uppercase">Total Spent</div>
          <div className="font-serif text-2xl font-extrabold text-[#1E2922] mt-1">
            {formatCurrency(totalSpent, currency)}
          </div>
          <div className="text-[10px] font-mono text-[#78857A] mt-1">{monthExpenses.length} expenses</div>
        </div>
        <div
          className={`rounded-2xl p-4 shadow-sm border ${
            isOverspent ? 'bg-rose-50 border-rose-300' : 'bg-[#FAF8F5] border-[#E3DDD3]'
          }`}
        >
          <div className="text-[10px] font-mono font-bold uppercase text-[#728074]">Remaining Budget</div>
          <div
            className={`font-serif text-2xl font-extrabold mt-1 ${
              isOverspent ? 'text-rose-700' : 'text-[#1E2922]'
            }`}
          >
            {formatCurrency(remaining, currency)}
          </div>
          <div className={`text-[10px] font-mono font-bold mt-1 ${isOverspent ? 'text-rose-700' : 'text-emerald-700'}`}>
            {isOverspent
              ? `Over budget by ${formatCurrency(Math.abs(remaining), currency)}`
              : 'On track'}
          </div>
        </div>
      </div>

      {isOverspent && (
        <div className="flex items-start gap-2 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl px-4 py-3 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            <span className="font-bold">Monthly budget exceeded.</span> New expenses are still saved, but
            spending is now over plan by {formatCurrency(Math.abs(remaining), currency)}.
          </span>
        </div>
      )}

      {/* Category meters */}
      <div className="bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl p-5 shadow-sm space-y-4">
        <div className="text-xs font-mono font-bold text-[#627064] uppercase tracking-wider">
          Category budgets · automatic deduction
        </div>
        {categories.length === 0 && (
          <p className="text-xs font-mono italic text-[#78857A]">
            No categories yet — create one to start tracking deductions.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const pct = cat.allocated > 0 ? Math.round((cat.spent / cat.allocated) * 100) : cat.spent > 0 ? 100 : 0;
            const catRemaining = cat.allocated - cat.spent;
            const over = catRemaining < 0;
            return (
              <div key={cat.id} className="border border-[#E8E2D7] rounded-2xl p-3.5 space-y-2 bg-[#FAF8F5]">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 rounded-xl bg-[#28372B] text-amber-200 shrink-0">
                      <DynamicIcon name={cat.icon} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-serif font-bold text-[#1E2922] truncate">{cat.name}</span>
                  </div>
                  {over ? (
                    <span className="text-[10px] font-mono font-bold text-rose-800 bg-rose-100 border border-rose-300 rounded-full px-2 py-0.5 whitespace-nowrap">
                      Over by {formatCurrency(Math.abs(catRemaining), currency)}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-[#627064] whitespace-nowrap">
                      {formatCurrency(catRemaining, currency)} left
                    </span>
                  )}
                </div>
                <div className="w-full bg-[#EAE5DC] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${barColor(pct)}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#78857A]">
                  <span>
                    {formatCurrency(cat.spent, currency)} / {formatCurrency(cat.allocated, currency)}
                  </span>
                  <span className="font-bold">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
