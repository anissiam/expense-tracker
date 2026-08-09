import React, { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../data/currencies';
import { DynamicIcon } from '../Common/DynamicIcon';
import {
  PiggyBank,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Target,
  Calendar,
  X,
  Trash2
} from 'lucide-react';

export const SavingsVault: React.FC = () => {
  const {
    savingsBalance,
    savingsTransactions,
    savingsGoals,
    depositToSavings,
    withdrawFromSavings,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    currency,
    t,
  } = useExpense();

  // Transaction Modal State
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState<'deposit' | 'withdraw'>('deposit');
  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');

  // Goal Modal State
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalIcon] = useState('ShieldCheck');
  const [goalColor] = useState('emerald');

  const handleTxSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(txAmount);
    if (isNaN(val) || val <= 0) return;

    if (txType === 'deposit') {
      depositToSavings(val, txNote.trim() || 'Manual Deposit');
    } else {
      withdrawFromSavings(val, txNote.trim() || 'Manual Withdrawal');
    }

    setTxAmount('');
    setTxNote('');
    setShowTxModal(false);
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetVal = parseFloat(goalTarget);
    if (!goalTitle.trim() || isNaN(targetVal) || targetVal <= 0) return;

    addSavingsGoal({
      title: goalTitle.trim(),
      targetAmount: targetVal,
      deadline: goalDeadline || undefined,
      icon: goalIcon,
      color: goalColor,
    });

    setGoalTitle('');
    setGoalTarget('');
    setGoalDeadline('');
    setShowGoalModal(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Banner & Total Balance */}
      <div className="bg-[#28372B] p-6 rounded-3xl border border-[#1F2B21] text-amber-100 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-amber-200/10 text-amber-200 border border-amber-300/20 shrink-0">
            <PiggyBank className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-amber-200/70 uppercase tracking-widest">
              {t.totalVaultBalance}
            </div>
            <div className="text-3xl font-serif font-extrabold text-amber-100 mt-0.5 tracking-wide">
              {formatCurrency(savingsBalance, currency)}
            </div>
            <p className="text-xs text-amber-200/80 font-mono mt-1">
              {t.savingsVaultHeaderDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setTxType('withdraw');
              setShowTxModal(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-[#EAE5DC] hover:bg-[#E2DDD3] text-[#28372B] border border-[#DCD5C8] font-mono font-bold text-xs flex items-center gap-2 transition"
          >
            <ArrowDownLeft className="w-4 h-4 text-rose-700" />
            <span>{t.withdraw}</span>
          </button>
          <button
            onClick={() => {
              setTxType('deposit');
              setShowTxModal(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-amber-200 hover:bg-amber-100 text-[#1E2B21] font-serif font-bold text-xs flex items-center gap-2 shadow-sm transition"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>{t.depositFunds}</span>
          </button>
        </div>
      </div>

      {/* Savings Goals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#1E2922] flex items-center gap-2">
              <Target className="w-5 h-5 text-[#28372B]" />
              {t.savingsGoals}
            </h3>
            <p className="text-xs font-mono text-[#78857A]">{t.savingsVaultHeaderDesc}</p>
          </div>
          <button
            onClick={() => setShowGoalModal(true)}
            className="px-4 py-2 rounded-2xl bg-[#28372B] hover:bg-[#1F2B21] text-amber-100 text-xs font-serif font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-amber-200" />
            <span>{t.newGoalBtn}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {savingsGoals.map((goal) => {
            const percent = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const isCompleted = goal.currentAmount >= goal.targetAmount;

            return (
              <div
                key={goal.id}
                className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E3DDD3] hover:border-[#28372B]/30 transition shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-[#28372B] text-amber-200 border border-[#1F2B21]">
                      <DynamicIcon name={goal.icon} className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#1E2922] line-clamp-1">{goal.title}</h4>
                      {goal.deadline && (
                        <p className="text-[10px] font-mono text-[#78857A] flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-[#28372B]" />
                          Target: {goal.deadline}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`Delete goal "${goal.title}"?`)) deleteSavingsGoal(goal.id);
                    }}
                    className="text-[#88968A] hover:text-rose-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-mono font-bold">
                    <span className="text-[#627064]">{t.current}: {formatCurrency(goal.currentAmount, currency)}</span>
                    <span className="text-[#28372B]">{percent.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-[#EAE5DC] rounded-full h-2.5 overflow-hidden border border-[#DCD5C8]">
                    <div
                      className={`h-full transition-all duration-300 ${isCompleted ? 'bg-emerald-700' : 'bg-[#28372B]'}`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                  <div className="text-[11px] font-mono text-[#78857A] text-right rtl:text-left">
                    {t.target}: {formatCurrency(goal.targetAmount, currency)}
                  </div>
                </div>

                {/* Quick Add to Goal button */}
                <button
                  onClick={() => {
                    const addVal = prompt(`Add amount to "${goal.title}" goal:`, '100');
                    if (addVal) {
                      const num = parseFloat(addVal);
                      if (!isNaN(num) && num > 0) {
                        updateSavingsGoal(goal.id, { currentAmount: goal.currentAmount + num });
                      }
                    }
                  }}
                  className="w-full py-2.5 rounded-2xl bg-[#EAE5DC] hover:bg-[#E2DDD3] text-[#28372B] text-xs font-serif font-bold border border-[#DCD5C8] transition"
                >
                  + {t.depositFunds}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Savings Transaction History */}
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E3DDD3] shadow-xs p-6 space-y-4">
        <h3 className="text-base font-serif font-bold text-[#1E2922]">Savings Vault Activity Log</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {savingsTransactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EAE5DC]/60 border border-[#DCD5C8] text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    tx.type === 'deposit'
                      ? 'bg-[#28372B] text-amber-200'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {tx.type === 'deposit' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-serif font-bold text-[#1E2922]">{tx.note}</div>
                  <div className="text-[10px] font-mono text-[#78857A]">{tx.date}</div>
                </div>
              </div>

              <span
                className={`font-serif font-extrabold text-base ${
                  tx.type === 'deposit' ? 'text-[#28372B]' : 'text-[#8C5D4B]'
                }`}
              >
                {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Deposit / Withdraw Modal */}
      {showTxModal && (
        <div className="fixed inset-0 z-50 bg-[#1E2B21]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8E2D7] pb-3">
              <h3 className="text-lg font-serif font-bold text-[#1E2922] uppercase">
                {txType === 'deposit' ? 'Deposit Funds to Savings' : 'Withdraw Funds from Savings'}
              </h3>
              <button onClick={() => setShowTxModal(false)} className="text-[#627064] hover:text-[#1E2922]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTxSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm text-[#1E2922] font-serif font-bold focus:outline-none focus:ring-2 focus:ring-[#28372B]"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">
                  Note / Reason
                </label>
                <input
                  type="text"
                  placeholder="e.g. Monthly transfer or emergency withdrawal"
                  value={txNote}
                  onChange={(e) => setTxNote(e.target.value)}
                  className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-xs text-[#1E2922]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E2D7]">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-[#EAE5DC] text-[#354238] text-xs font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#28372B] hover:bg-[#1F2B21] text-amber-100 text-xs font-serif font-bold shadow-md"
                >
                  Confirm Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Goal Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-50 bg-[#1E2B21]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8E2D7] pb-3">
              <h3 className="text-lg font-serif font-bold text-[#1E2922] flex items-center gap-2">
                <Target className="w-5 h-5 text-[#28372B]" />
                Create Savings Goal
              </h3>
              <button onClick={() => setShowGoalModal(false)} className="text-[#627064] hover:text-[#1E2922]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGoalSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emergency Fund (6 Months)"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-xs text-[#1E2922]"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">
                  Target Amount ({currency})
                </label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5000"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-xs text-[#1E2922] font-serif font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">
                  Target Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={goalDeadline}
                  onChange={(e) => setGoalDeadline(e.target.value)}
                  className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-3.5 py-2.5 text-xs font-mono text-[#1E2922]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E2D7]">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-[#EAE5DC] text-[#354238] text-xs font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#28372B] hover:bg-[#1F2B21] text-amber-100 text-xs font-serif font-bold shadow-md"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
