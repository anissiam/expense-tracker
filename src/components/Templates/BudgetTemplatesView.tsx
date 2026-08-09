import React, { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../data/currencies';
import { DynamicIcon } from '../Common/DynamicIcon';
import {
  Layers,
  Check,
  Plus,
  ArrowRight
} from 'lucide-react';

interface BudgetTemplatesViewProps {
  onApplied?: () => void;
}

export const BudgetTemplatesView: React.FC<BudgetTemplatesViewProps> = ({ onApplied }) => {
  const {
    templates,
    applyBudgetTemplate,
    addCustomTemplate,
    budgetCycle,
    currency,
    t,
  } = useExpense();

  const [appliedTplId, setAppliedTplId] = useState<string | null>(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');

  const handleApply = (templateId: string) => {
    applyBudgetTemplate(templateId, budgetCycle.totalIncome);
    setAppliedTplId(templateId);
    setTimeout(() => setAppliedTplId(null), 3000);
    if (onApplied) onApplied();
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    addCustomTemplate(customName.trim(), customDesc.trim() || 'Custom user allocation preset');
    setCustomName('');
    setCustomDesc('');
    setShowCustomModal(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-[#28372B] p-6 rounded-3xl border border-[#1F2B21] text-amber-100 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-amber-100 tracking-wide flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-300" />
            {t.templatesHeaderTitle}
          </h2>
          <p className="text-xs text-amber-200/70 font-mono tracking-wider uppercase mt-1">
            {t.templatesHeaderDesc}
          </p>
        </div>

        <button
          onClick={() => setShowCustomModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-amber-200 hover:bg-amber-100 text-[#1E2B21] font-serif font-bold text-xs flex items-center gap-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4 text-[#1E2B21]" />
          <span>{t.templatesTitle}</span>
        </button>
      </div>

      {/* Templates Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tpl) => {
          const isJustApplied = appliedTplId === tpl.id;

          return (
            <div
              key={tpl.id}
              className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E3DDD3] hover:border-[#28372B]/30 transition shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3.5 rounded-2xl bg-[#28372B] text-amber-200 border border-[#1F2B21]">
                      <DynamicIcon name={tpl.icon} className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-lg text-[#1E2922] flex items-center gap-2">
                        <span>{tpl.name}</span>
                        {tpl.isDefault && (
                          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#EAE5DC] text-[#28372B] border border-[#DCD5C8]">
                            Popular
                          </span>
                        )}
                      </h3>
                      <p className="text-xs font-mono text-[#627064] mt-0.5 leading-relaxed">
                        {tpl.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category Allocations breakdown */}
                <div className="space-y-2 pt-2 border-t border-[#E8E2D7]">
                  <div className="text-[10px] font-mono font-bold text-[#627064] uppercase tracking-wider">
                    Allocation Breakdown:
                  </div>
                  <div className="space-y-1.5">
                    {tpl.categoryAllocations.map((alloc, idx) => {
                      const estimatedVal = Math.round((budgetCycle.totalIncome * alloc.percentageOfIncome) / 100);

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-2xl bg-[#EAE5DC]/60 text-xs text-[#1E2922] border border-[#DCD5C8]"
                        >
                          <div className="flex items-center gap-2">
                            <DynamicIcon name={alloc.icon} className="w-3.5 h-3.5 text-[#28372B] shrink-0" />
                            <span className="font-semibold truncate max-w-xs">{alloc.categoryName}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 font-mono">
                            <span className="text-[11px] text-[#627064]">{alloc.percentageOfIncome}%</span>
                            <span className="font-bold text-[#28372B]">
                              {formatCurrency(estimatedVal, currency)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-[#E8E2D7] flex items-center justify-between">
                <span className="text-[11px] font-mono text-[#78857A] italic">
                  Based on income ({formatCurrency(budgetCycle.totalIncome, currency)})
                </span>
                <button
                  onClick={() => handleApply(tpl.id)}
                  className={`px-5 py-2.5 rounded-2xl font-serif font-bold text-xs flex items-center gap-2 transition shadow-md ${
                    isJustApplied
                      ? 'bg-[#28372B] text-amber-200'
                      : 'bg-[#28372B] hover:bg-[#1F2B21] text-amber-100'
                  }`}
                >
                  {isJustApplied ? (
                    <>
                      <Check className="w-4 h-4 text-amber-200" />
                      <span>{t.templateApplied}</span>
                    </>
                  ) : (
                    <>
                      <span>{t.applyTemplateBtn}</span>
                      <ArrowRight className="w-4 h-4 rtl:rotate-180 text-amber-200" />
                    </>
                  )}
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Save Current as Custom Template Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-[#1E2B21]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl w-full max-w-md p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8E2D7] pb-3">
              <h3 className="text-lg font-serif font-bold text-[#1E2922]">
                Save Current Allocations as Template
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-[#627064] hover:text-[#1E2922]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">
                  Template Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Conservative Allocation"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-xs text-[#1E2922]"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 50% essentials, 30% savings, 20% lifestyle"
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-xs text-[#1E2922]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E2D7]">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-[#EAE5DC] text-[#354238] text-xs font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#28372B] hover:bg-[#1F2B21] text-amber-100 text-xs font-serif font-bold shadow-md"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
