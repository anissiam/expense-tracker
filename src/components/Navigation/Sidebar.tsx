import React from 'react';
import { useExpense } from '../../context/ExpenseContext';
import {
  LayoutDashboard,
  Wand2,
  FolderKanban,
  Receipt,
  Layers,
  Lock,
  PiggyBank,
  BarChart3,
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
  Landmark
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'wizard'
  | 'incoming'
  | 'categories'
  | 'expenses'
  | 'templates'
  | 'closing'
  | 'savings'
  | 'reports'
  | 'insights';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { t, theme, setTheme } = useExpense();

  const menuItems: { id: TabType; label: string; icon: React.FC<any>; badge?: string; desc: string }[] = [
    {
      id: 'dashboard',
      label: t.dashboard,
      icon: LayoutDashboard,
      desc: t.dashboardDesc,
    },
    {
      id: 'wizard',
      label: t.budgetWizard,
      icon: Wand2,
      desc: t.budgetWizardDesc,
    },
    {
      id: 'incoming',
      label: t.incomingAndAccounts,
      icon: Landmark,
      desc: t.incomingDesc,
    },
    {
      id: 'expenses',
      label: t.expensesManager,
      icon: Receipt,
      desc: t.expensesDesc,
    },
    {
      id: 'categories',
      label: t.categoriesAllocations,
      icon: FolderKanban,
      desc: t.categoriesDesc,
    },
    {
      id: 'savings',
      label: t.savingsVault,
      icon: PiggyBank,
      desc: t.savingsDesc,
    },
    {
      id: 'templates',
      label: t.budgetTemplates,
      icon: Layers,
      badge: 'PRO',
      desc: t.templatesDesc,
    },
    {
      id: 'reports',
      label: t.reportsAnalytics,
      icon: BarChart3,
      desc: t.reportsDesc,
    },
    {
      id: 'insights',
      label: t.smartAiInsights,
      icon: Sparkles,
      badge: 'AI',
      desc: t.insightsDesc,
    },
    {
      id: 'closing',
      label: t.monthlyClosing,
      icon: Lock,
      desc: t.closingDesc,
    },
  ];

  return (
    <aside className="w-full md:w-60 bg-[#EAE5DC] border-r border-[#DCD5C8] p-4 shrink-0 flex flex-col justify-between rounded-r-3xl my-2 shadow-sm">
      <div className="space-y-4">
        
        {/* Top Brand Logo Badge */}
        <div className="flex items-center gap-3 p-2 bg-[#28372B] text-amber-100 rounded-2xl shadow-md border border-[#1F2B21]">
          <div className="w-10 h-10 rounded-xl bg-amber-200/10 border border-amber-300/20 flex flex-col items-center justify-center font-serif text-lg font-bold text-amber-200 leading-none">
            <span>F</span>
            <span className="-mt-1 text-xs">R</span>
          </div>
          <div>
            <h2 className="font-serif text-base font-bold text-amber-100 tracking-wide">{t.brandTitle}</h2>
            <p className="text-[9px] font-mono tracking-widest text-amber-200/70 uppercase">{t.brandSubtitle}</p>
          </div>
        </div>

        {/* Section Label */}
        <div className="px-2 text-[10px] font-mono font-bold text-[#6D7A70] uppercase tracking-widest">
          {t.navModules}
        </div>

        {/* Navigation Item List */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-left rtl:text-right transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#28372B] text-amber-100 font-bold shadow-md'
                    : 'text-[#4A554C] hover:text-[#1E2B21] hover:bg-[#E2DDD3]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`p-1.5 rounded-xl transition ${
                      isActive ? 'bg-amber-300/20 text-amber-200 border border-amber-300/30' : 'bg-[#DDD7CB] text-[#556056] group-hover:text-[#1E2B21]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase ${
                            item.badge === 'AI'
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                              : 'bg-[#C8BFB0] text-[#28372B]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform rtl:rotate-180 ${
                    isActive ? 'text-amber-200' : 'text-[#8A968C] group-hover:text-[#28372B]'
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Control Buttons */}
      <div className="pt-4 border-t border-[#D0C7B8] flex items-center justify-between px-1">
        <button
          onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          className="w-9 h-9 rounded-2xl bg-[#28372B] text-amber-200 flex items-center justify-center hover:bg-[#1F2B21] transition shadow-sm"
          title={theme === 'light' ? t.themeDark : t.themeLight}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        <div className="text-right text-[10px] font-mono text-[#626F64]">
          <div>PLANNER v2.4</div>
          <div className="text-emerald-700 font-bold">{t.systemStatusActive}</div>
        </div>
      </div>
    </aside>
  );
};
