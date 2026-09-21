import React from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../data/currencies';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  BrainCircuit
} from 'lucide-react';

export const SmartInsightsView: React.FC = () => {
  const {
    insights,
    fetchAIInsights,
    isAiLoading,
    budgetCycle,
    categories,
    savingsBalance,
    currency,
    t,
  } = useExpense();

  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
  const remaining = budgetCycle.totalIncome - totalSpent;
  const spentPercent = budgetCycle.totalIncome > 0 ? (totalSpent / budgetCycle.totalIncome) * 100 : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Banner */}
      <div className="bg-[#28372B] p-6 rounded-3xl border border-[#1F2B21] text-amber-100 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3.5 rounded-2xl bg-amber-200/10 text-amber-200 border border-amber-300/20 shrink-0">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-100 tracking-wide flex items-center gap-2">
              {t.insightsHeaderTitle}
            </h2>
            <p className="text-xs text-amber-200/70 font-mono tracking-wider uppercase mt-1">
              {t.insightsHeaderDesc}
            </p>
          </div>
        </div>

        <button
          onClick={fetchAIInsights}
          disabled={isAiLoading}
          className="px-5 py-2.5 rounded-2xl bg-amber-200 hover:bg-amber-100 text-[#1E2B21] font-serif font-bold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50 self-start sm:self-auto shrink-0"
        >
          <RefreshCw className={`w-4 h-4 text-[#1E2B21] ${isAiLoading ? 'animate-spin' : ''}`} />
          <span>{isAiLoading ? t.aiAnalyzing : t.refreshAiInsights}</span>
        </button>
      </div>

      {/* Real-time Health Diagnostic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-5 rounded-3xl bg-[#FAF8F5] border border-[#E3DDD3] space-y-1 shadow-xs">
          <div className="text-[10px] font-mono font-bold text-[#627064] uppercase tracking-wider">{t.budgetVelocityTitle}</div>
          <div className="text-xl font-serif font-extrabold text-[#1E2922]">
            {spentPercent.toFixed(1)}{t.consumedPercentSuffix}
          </div>
          <p className="text-xs font-mono text-[#78857A]">
            {spentPercent > 85 ? t.budgetVelocityHighMsg : t.budgetVelocityControlledMsg}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[#FAF8F5] border border-[#E3DDD3] space-y-1 shadow-xs">
          <div className="text-[10px] font-mono font-bold text-[#627064] uppercase tracking-wider">{t.unallocatedReserveTitle}</div>
          <div className="text-xl font-serif font-extrabold text-[#28372B]">{formatCurrency(remaining, currency)}</div>
          <p className="text-xs font-mono text-[#78857A]">
            {t.unallocatedReserveDesc}
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-[#FAF8F5] border border-[#E3DDD3] space-y-1 shadow-xs">
          <div className="text-[10px] font-mono font-bold text-[#627064] uppercase tracking-wider">{t.protectedSavingsTitle}</div>
          <div className="text-xl font-serif font-extrabold text-[#8C5D4B]">{formatCurrency(savingsBalance, currency)}</div>
          <p className="text-xs font-mono text-[#78857A]">
            {t.protectedSavingsDesc}
          </p>
        </div>

      </div>

      {/* Insights Cards List */}
      <div className="space-y-4">
        <h3 className="text-sm font-mono font-bold text-[#627064] uppercase tracking-wider flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#28372B]" />
          {t.activeRecommendationsTitle}
        </h3>

        <div className="space-y-3">
          {insights.map((ins) => (
            <div
              key={ins.id}
              className={`p-6 rounded-3xl border transition shadow-xs space-y-3 ${
                ins.type === 'warning'
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : ins.type === 'success'
                  ? 'bg-[#28372B]/5 border-[#28372B]/20 text-[#1E2922]'
                  : 'bg-[#FAF8F5] border-[#E3DDD3] text-[#1E2922]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-2xl shrink-0 ${
                      ins.type === 'warning'
                        ? 'bg-rose-200 text-rose-800'
                        : ins.type === 'success'
                        ? 'bg-[#28372B] text-amber-200'
                        : 'bg-[#EAE5DC] text-[#28372B]'
                    }`}
                  >
                    {ins.type === 'warning' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : ins.type === 'success' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Lightbulb className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#1E2922] flex items-center gap-2">
                      <span>{ins.title}</span>
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#EAE5DC] text-[#627064] border border-[#DCD5C8]">
                        {ins.confidence || 'Rule Engine'}
                      </span>
                    </h4>
                    <p className="text-xs font-mono text-[#354238] mt-1 leading-relaxed">{ins.message}</p>
                  </div>
                </div>
              </div>

              {ins.actionableTip && (
                <div className="p-3.5 rounded-2xl bg-[#EAE5DC] border border-[#DCD5C8] text-xs font-mono text-[#28372B] flex items-center gap-2 font-semibold">
                  <Sparkles className="w-4 h-4 text-[#28372B] shrink-0" />
                  <span>{t.actionTipPrefix}{ins.actionableTip}</span>
                </div>
              )}
            </div>
          ))}

          {insights.length === 0 && (
            <div className="p-8 rounded-3xl bg-[#FAF8F5] border border-[#E3DDD3] text-center text-xs font-mono text-[#78857A] italic">
              {t.insightsEmptyPlaceholder}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
