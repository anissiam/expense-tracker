import React, { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { CURRENCIES, formatCurrency } from '../../data/currencies';
import { BudgetMode, CurrencyCode } from '../../types';
import {
  Wand2,
  Wallet,
  Check,
  AlertTriangle,
  ArrowRight,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

interface MonthlyBudgetWizardProps {
  onNextStep?: () => void;
  onNavigateToTemplates?: () => void;
}

export const MonthlyBudgetWizard: React.FC<MonthlyBudgetWizardProps> = ({
  onNextStep,
  onNavigateToTemplates,
}) => {
  const {
    budgetCycle,
    updateBudgetCycle,
    currency,
    setCurrency,
    categories,
    activeMonth,
    t,
  } = useExpense();

  const [mode, setMode] = useState<BudgetMode>(budgetCycle.mode || 'salary');
  const [incomeInput, setIncomeInput] = useState<string>(budgetCycle.totalIncome.toString());
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(currency);
  const [isSaved, setIsSaved] = useState(false);

  const numericIncome = parseFloat(incomeInput) || 0;
  const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0);
  const remainingUnallocated = numericIncome - totalAllocated;
  const isOverAllocated = remainingUnallocated < 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericIncome <= 0) {
      alert('Please enter a valid positive income amount.');
      return;
    }
    updateBudgetCycle(numericIncome, mode, selectedCurrency);
    setCurrency(selectedCurrency);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    if (onNextStep) onNextStep();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Editorial Header */}
      <div className="bg-[#28372B] p-6 rounded-3xl border border-[#1F2B21] text-amber-100 shadow-md">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-200/10 text-amber-200 border border-amber-300/20">
            <Wand2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-100 tracking-wide">{t.wizardHeaderTitle}</h2>
            <p className="text-xs text-amber-200/70 mt-1 font-mono uppercase tracking-wider">
              {t.wizardHeaderDesc} <strong className="text-amber-200">{activeMonth}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Main Wizard Form Card */}
      <form onSubmit={handleSave} className="bg-[#FAF8F5] p-6 sm:p-8 rounded-3xl border border-[#E3DDD3] shadow-sm space-y-6">
        
        {/* Step 1: Mode Selection */}
        <div className="space-y-3">
          <label className="text-xs font-mono font-bold text-[#627064] uppercase tracking-widest block">
            {t.step1SelectMode}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <button
              type="button"
              onClick={() => setMode('salary')}
              className={`p-5 rounded-2xl border text-left rtl:text-right transition flex items-start gap-4 ${
                mode === 'salary'
                  ? 'bg-[#28372B] border-[#1F2B21] text-amber-100 shadow-md'
                  : 'bg-[#EAE5DC] border-[#DCD5C8] text-[#354238] hover:bg-[#E2DDD3]'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${mode === 'salary' ? 'bg-amber-300/20 text-amber-200 border border-amber-300/30' : 'bg-[#D0C7B8] text-[#28372B]'}`}>
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="font-serif font-bold text-base">{t.fixedSalaryTitle}</div>
                <div className={`text-xs mt-1 leading-relaxed ${mode === 'salary' ? 'text-amber-200/80' : 'text-[#627064]'}`}>
                  {t.fixedSalaryDesc}
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setMode('planned')}
              className={`p-5 rounded-2xl border text-left rtl:text-right transition flex items-start gap-4 ${
                mode === 'planned'
                  ? 'bg-[#28372B] border-[#1F2B21] text-amber-100 shadow-md'
                  : 'bg-[#EAE5DC] border-[#DCD5C8] text-[#354238] hover:bg-[#E2DDD3]'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${mode === 'planned' ? 'bg-amber-300/20 text-amber-200 border border-amber-300/30' : 'bg-[#D0C7B8] text-[#28372B]'}`}>
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="font-serif font-bold text-base">{t.plannedFlexibleTitle}</div>
                <div className={`text-xs mt-1 leading-relaxed ${mode === 'planned' ? 'text-amber-200/80' : 'text-[#627064]'}`}>
                  {t.plannedFlexibleDesc}
                </div>
              </div>
            </button>

          </div>
        </div>

        {/* Step 2: Currency & Income Entry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#E8E2D7]">
          
          {/* Currency Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-[#627064] uppercase tracking-widest block">
              {t.step2SelectCurrency}
            </label>
            <div className="relative">
              <select
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-[#EAE5DC] text-[#1E2922] border border-[#DCD5C8] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#28372B] font-semibold"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.symbol}) - {c.code}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] font-mono text-[#78857A]">
              {t.currencyHelpText} {selectedCurrency}.
            </p>
          </div>

          {/* Monthly Income / Target Budget */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold text-[#627064] uppercase tracking-widest block">
              {t.step3MonthlyIncome} {mode === 'salary' ? t.salaryIncome : t.targetBudget}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-4 rtl:pr-4 flex items-center pointer-events-none text-[#627064] font-bold text-sm">
                {CURRENCIES[selectedCurrency].symbol}
              </div>
              <input
                type="number"
                min="0"
                step="10"
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                placeholder="e.g. 4000"
                className="w-full bg-[#EAE5DC] text-[#1E2922] border border-[#DCD5C8] rounded-2xl pl-10 rtl:pr-10 rtl:pl-4 pr-4 py-3 text-lg font-serif font-extrabold focus:outline-none focus:ring-2 focus:ring-[#28372B]"
              />
            </div>
            <p className="text-[11px] font-mono text-[#78857A]">
              {t.incomeHelpText}
            </p>
          </div>

        </div>

        {/* Real-time Budget Allocation Validation */}
        <div className="p-5 rounded-2xl bg-[#EAE5DC] border border-[#DCD5C8] space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-[#354238] uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#28372B]" />
              {t.allocationCheck}
            </span>
            <span className={isOverAllocated ? 'text-rose-700 font-extrabold' : 'text-[#28372B] font-extrabold'}>
              {remainingUnallocated >= 0
                ? `${formatCurrency(remainingUnallocated, selectedCurrency)} ${t.unallocatedRemaining}`
                : `${t.overallocatedBy} ${formatCurrency(Math.abs(remainingUnallocated), selectedCurrency)}!`}
            </span>
          </div>

          <div className="w-full bg-[#DCD5C8] rounded-full h-3 overflow-hidden border border-[#D0C7B8]">
            <div
              className={`h-full transition-all duration-300 ${
                isOverAllocated ? 'bg-rose-600' : 'bg-[#28372B]'
              }`}
              style={{
                width: `${Math.min(100, numericIncome > 0 ? (totalAllocated / numericIncome) * 100 : 0)}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#627064]">
            <span>{t.totalIncomeCap}: {formatCurrency(numericIncome, selectedCurrency)}</span>
            <span>{t.allocatedToCategories}: {formatCurrency(totalAllocated, selectedCurrency)}</span>
          </div>

          {isOverAllocated && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>
                {t.warningOverAllocated} {formatCurrency(Math.abs(remainingUnallocated), selectedCurrency)}.
              </span>
            </div>
          )}
        </div>

        {/* Submit & Quick Template Trigger */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E8E2D7]">
          {onNavigateToTemplates ? (
            <button
              type="button"
              onClick={onNavigateToTemplates}
              className="text-xs font-mono font-bold text-[#28372B] hover:underline flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-[#28372B]" />
              <span>{t.orApplyTemplate}</span>
            </button>
          ) : <div />}

          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#28372B] hover:bg-[#1F2B21] text-amber-100 font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-md transition"
          >
            {isSaved ? <Check className="w-4 h-4 text-amber-200" /> : <Wand2 className="w-4 h-4 text-amber-200" />}
            <span>{isSaved ? t.budgetSaved : t.saveAndUpdateCycle}</span>
            <ArrowRight className="w-4 h-4 ml-1 rtl:rotate-180 text-amber-200" />
          </button>
        </div>

      </form>

    </div>
  );
};
