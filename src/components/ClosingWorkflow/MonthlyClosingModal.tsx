import React, { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../data/currencies';
import { translateDataName } from '../../data/categoryTranslations';
import { ClosingCarryOption } from '../../types';
import {
  Lock,
  ArrowRight,
  X,
  PiggyBank
} from 'lucide-react';

interface MonthlyClosingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonthlyClosingModal: React.FC<MonthlyClosingModalProps> = ({ isOpen, onClose }) => {
  const {
    activeMonth,
    budgetCycle,
    categories,
    performMonthlyClosing,
    currency,
    language,
    t,
  } = useExpense();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [carryOption, setCarryOption] = useState<ClosingCarryOption>('savings');
  const [customSavingsSplit, setCustomSavingsSplit] = useState<string>('');

  if (!isOpen) return null;

  const totalIncome = budgetCycle.totalIncome;
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
  const remainingUnspent = totalIncome - totalSpent;

  const handleFinalClose = () => {
    const splitVal = parseFloat(customSavingsSplit);
    performMonthlyClosing(carryOption, !isNaN(splitVal) ? splitVal : undefined);
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1E2B21]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl w-full max-w-2xl p-6 space-y-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E2D7] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#28372B] text-amber-200 border border-[#1F2B21]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-[#1E2922]">{t.closingHeaderTitle}</h3>
              <p className="text-xs font-mono text-[#627064]">
                {t.cycle}: <strong className="text-[#28372B]">{activeMonth}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#627064] hover:text-[#1E2922]">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Monthly Performance Review */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-[#EAE5DC] border border-[#DCD5C8] grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-[10px] font-mono font-bold text-[#627064] uppercase">{t.totalCycleIncome}</div>
                <div className="text-lg font-serif font-extrabold text-[#1E2922] mt-1">
                  {formatCurrency(totalIncome, currency)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-[#627064] uppercase">{t.totalCycleSpent}</div>
                <div className="text-lg font-serif font-extrabold text-[#8C5D4B] mt-1">
                  {formatCurrency(totalSpent, currency)}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono font-bold text-[#627064] uppercase">{t.netSurplusDeficit}</div>
                <div className={`text-lg font-serif font-extrabold mt-1 ${remainingUnspent >= 0 ? 'text-[#28372B]' : 'text-rose-700'}`}>
                  {formatCurrency(remainingUnspent, currency)}
                </div>
              </div>
            </div>

            {/* Category Performance Breakdown table */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold text-[#627064] uppercase">{t.closingCategoryPerformanceTitle}</div>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {categories.map((cat) => {
                  const diff = cat.allocated - cat.spent;
                  return (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#EAE5DC]/60 text-xs border border-[#DCD5C8]"
                    >
                      <span className="font-semibold text-[#1E2922]">{translateDataName(cat.name, language)}</span>
                      <div className="flex items-center gap-3 font-mono">
                        <span className="text-[#627064]">
                          {t.spent}: {formatCurrency(cat.spent, currency)} / {formatCurrency(cat.allocated, currency)}
                        </span>
                        <span className={`font-bold ${diff >= 0 ? 'text-[#28372B]' : 'text-rose-700'}`}>
                          {diff >= 0 ? `+${formatCurrency(diff, currency)}` : formatCurrency(diff, currency)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E8E2D7]">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-2xl bg-[#28372B] hover:bg-[#1F2B21] text-amber-100 font-serif font-bold text-xs flex items-center gap-2 shadow-md"
              >
                <span>{t.proceedToRolloverBtn}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180 text-amber-200" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Unspent Carry Forward Choice */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-[#EAE5DC] border border-[#DCD5C8] text-xs text-[#1E2922]">
              <div className="font-serif font-bold text-base mb-1">
                {t.unspentSurplusLabel} <span className="text-[#28372B]">{formatCurrency(remainingUnspent, currency)}</span>
              </div>
              <p className="text-[#627064] font-mono text-[11px] leading-relaxed">
                {t.rolloverChoiceHelp}
              </p>
            </div>

            <div className="space-y-3">
              
              <button
                onClick={() => setCarryOption('savings')}
                className={`w-full p-4 rounded-2xl border text-left rtl:text-right transition flex items-center gap-3 ${
                  carryOption === 'savings'
                    ? 'bg-[#28372B] border-[#1F2B21] text-amber-100 shadow-sm'
                    : 'bg-[#EAE5DC] border-[#DCD5C8] text-[#354238]'
                }`}
              >
                <PiggyBank className="w-5 h-5 shrink-0" />
                <div>
                  <div className="font-serif font-bold text-sm">{t.depositSurplusOption}</div>
                  <div className="text-xs font-mono opacity-80 mt-0.5">{t.depositSurplusDesc}</div>
                </div>
              </button>

              <button
                onClick={() => setCarryOption('next_month')}
                className={`w-full p-4 rounded-2xl border text-left rtl:text-right transition flex items-center gap-3 ${
                  carryOption === 'next_month'
                    ? 'bg-[#28372B] border-[#1F2B21] text-amber-100 shadow-sm'
                    : 'bg-[#EAE5DC] border-[#DCD5C8] text-[#354238]'
                }`}
              >
                <ArrowRight className="w-5 h-5 shrink-0" />
                <div>
                  <div className="font-serif font-bold text-sm">{t.rolloverNextMonthOption}</div>
                  <div className="text-xs font-mono opacity-80 mt-0.5">{t.rolloverNextMonthDesc}</div>
                </div>
              </button>

            </div>

            <div className="flex justify-between pt-3 border-t border-[#E8E2D7]">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-2xl bg-[#EAE5DC] text-[#354238] font-mono font-bold text-xs"
              >
                {t.backBtn}
              </button>
              <button
                onClick={handleFinalClose}
                className="px-6 py-2.5 rounded-2xl bg-[#28372B] hover:bg-[#1F2B21] text-amber-100 font-serif font-bold text-xs shadow-md"
              >
                {t.finalizeCloseMonthBtn}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
