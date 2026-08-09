import React from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { TabType } from './Sidebar';

interface RightBinderTabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const RightBinderTabs: React.FC<RightBinderTabsProps> = ({ activeTab, setActiveTab }) => {
  const { t } = useExpense();

  const tabs: { id: TabType; num: string; label: string }[] = [
    { id: 'dashboard', num: '01', label: t.dashboard },
    { id: 'wizard', num: '02', label: t.budgetWizard },
    { id: 'expenses', num: '03', label: t.expensesManager },
    { id: 'categories', num: '04', label: t.categoriesAllocations },
    { id: 'savings', num: '05', label: t.savingsVault },
    { id: 'templates', num: '06', label: t.budgetTemplates },
    { id: 'reports', num: '07', label: t.reportsAnalytics },
    { id: 'insights', num: '08', label: t.smartAiInsights },
  ];

  return (
    <div className="hidden lg:flex flex-col gap-2 shrink-0 py-6 pl-2 pr-1">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`group relative flex items-center justify-between px-3 py-2.5 rounded-l-2xl border-l border-y text-right transition-all duration-200 w-36 ${
              isActive
                ? 'bg-[#28372B] border-[#1D2A20] text-amber-100 font-bold shadow-xl translate-x-[-4px]'
                : 'bg-[#EAE5DC] hover:bg-[#E2DDD3] border-[#D8D2C5] text-[#556056]'
            }`}
          >
            <span
              className={`text-[10px] font-mono tracking-widest uppercase truncate ${
                isActive ? 'text-amber-200/90 font-bold' : 'text-[#7A867C] group-hover:text-[#28372B]'
              }`}
            >
              {tab.label}
            </span>
            <span
              className={`text-xs font-mono font-extrabold px-1.5 py-0.5 rounded-md ${
                isActive
                  ? 'bg-amber-300/20 text-amber-200 border border-amber-300/30'
                  : 'bg-[#DCD5C8] text-[#424F44]'
              }`}
            >
              {tab.num}
            </span>

            {/* Active tab pointer curve indicator */}
            {isActive && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-300 rounded-l-full shadow-sm" />
            )}
          </button>
        );
      })}
    </div>
  );
};
