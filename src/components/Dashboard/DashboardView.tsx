import React, { useState, useMemo } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../data/currencies';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Target,
  Plus,
  Eye,
  Calendar as CalendarIcon,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip
} from 'recharts';
import { BudgetOverview } from './BudgetOverview';
import { PartnerManagement } from '../Partners/PartnerManagement';

interface DashboardViewProps {
  onNavigateToExpenses: () => void;
  onNavigateToWizard: () => void;
  onNavigateToCategories: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToExpenses,
  onNavigateToWizard,
  onNavigateToCategories,
}) => {
  const {
    currency,
    activeMonth,
    budgetCycle,
    categories,
    expenses,
    savingsBalance,
    savingsGoals,
    t,
    language,
    myBudgetRole,
  } = useExpense();

  const [netWorthTimeframe, setNetWorthTimeframe] = useState<'1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'>('1M');

  const monthExpenses = expenses.filter((e) => e.date.startsWith(activeMonth));
  const totalIncome = budgetCycle.totalIncome;
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalNetWorth = totalIncome + savingsBalance - totalSpent;

  // Net-worth trend derived from real daily spending in the active month
  const netWorthTrendData = useMemo(() => {
    const [yearStr, monthStr] = activeMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();
    const byDay: Record<number, number> = {};
    for (const e of monthExpenses) {
      const day = parseInt(e.date.slice(8, 10), 10);
      if (!isNaN(day)) byDay[day] = (byDay[day] || 0) + e.amount;
    }
    let cumulative = 0;
    const points: { day: string; val: number }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      cumulative += byDay[d] || 0;
      points.push({ day: `${monthStr}/${String(d).padStart(2, '0')}`, val: totalIncome + savingsBalance - cumulative });
    }
    return points;
  }, [monthExpenses, totalIncome, savingsBalance, activeMonth]);

  // Calendar setup for mini widget
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const calendarDays = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* Top Hero Section: Title & Aesthetic Arch Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Editorial Heading Column */}
        <div className="md:col-span-7 bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#738275] uppercase font-bold mb-2">
              <span>{t.heroEyebrow}</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-[#1E2922] leading-tight tracking-tight">
              {t.heroTitleFinancial} <br />
              <span className="italic font-normal">{t.heroTitleReset}</span> {t.heroTitlePlanner}
            </h1>

            <p className="text-xs text-[#526054] mt-3 max-w-xs font-sans leading-relaxed">
              {t.heroTagline}
            </p>
          </div>

          {/* Quick Stats Pill Bar */}
          <div className="mt-6 pt-4 border-t border-[#E8E2D7] flex items-center justify-between text-xs">
            <div>
              <div className="text-[10px] font-mono text-[#78857A] uppercase font-bold">{t.cycle}</div>
              <div className="font-serif font-bold text-[#1E2922] text-sm">{activeMonth}</div>
            </div>
            <div className="w-px h-6 bg-[#E0D8CB]" />
            <div>
              <div className="text-[10px] font-mono text-[#78857A] uppercase font-bold">{t.modeLabel}</div>
              <div className="font-serif font-bold text-[#1E2922] text-sm capitalize">{budgetCycle.mode}</div>
            </div>
            <button
              onClick={onNavigateToWizard}
              className="px-3.5 py-1.5 rounded-full bg-[#28372B] hover:bg-[#1F2B21] text-amber-100 font-mono text-[11px] font-bold transition shadow-sm"
            >
              {t.wizardBtn} →
            </button>
          </div>
        </div>

        {/* Aesthetic Arched Image & Plant Artwork Frame */}
        <div className="md:col-span-5 bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl p-4 flex items-center justify-center relative shadow-sm min-h-[220px]">
          <div className="w-full h-full max-w-[200px] bg-[#EAE5DC] border-2 border-dashed border-[#D0C7B8] rounded-arch p-3 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden group">
            
            {/* Aesthetic SVG Plant / Vase artwork */}
            <div className="relative z-10 my-auto">
              <div className="w-16 h-16 rounded-full bg-amber-100/50 flex items-center justify-center mx-auto mb-2 border border-amber-200/60 shadow-sm">
                <svg className="w-10 h-10 text-[#28372B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22C12 22 12 13 8 9M12 22C12 22 12 13 16 9M12 22V8M12 8C12 8 8 5 8 2M12 8C12 8 16 5 16 2" />
                  <path d="M8 18C5 18 3 16 3 13C3 10 5 8 8 8M16 18C19 18 21 16 21 13C21 10 19 8 16 8" />
                </svg>
              </div>
              <div className="font-serif text-xs font-bold text-[#28372B]">{t.artCardTitle}</div>
              <div className="text-[9px] font-mono text-[#6A786C] mt-0.5">{t.artCardSubtitle}</div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-[#28372B]/5 to-transparent pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Middle Section: Net Worth Card & Financial Snapshot 4-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Net Worth Chart Card (Forest Green Dark Accent) */}
        <div className="md:col-span-6 bg-[#28372B] text-amber-100 rounded-3xl p-6 shadow-xl border border-[#1F2B21] flex flex-col justify-between relative overflow-hidden">
          
          <div>
            <div className="flex items-center justify-between text-xs text-amber-200/80 font-mono tracking-widest uppercase font-bold">
              <span className="flex items-center gap-1.5">
                <span>{t.netWorthLabel}</span>
                <Eye className="w-3.5 h-3.5 text-amber-300" />
              </span>
              <span className="text-emerald-300 text-[10px]">{t.realTimeSyncBadge}</span>
            </div>

            <div className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-100 mt-2">
              {formatCurrency(totalNetWorth, currency)}
            </div>

            <div className="text-xs text-emerald-300 font-mono font-bold mt-1 flex items-center gap-1">
              <span>{t.netWorthLiveNote}</span>
            </div>
          </div>

          {/* Smooth Recharts Area Curve */}
          <div className="h-28 my-3 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthTrendData}>
                <defs>
                  <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1F2B21', borderColor: '#35473A', borderRadius: '12px', color: '#FCD34D' }}
                  formatter={(val: any) => [formatCurrency(Number(val), currency), t.netWorthTooltipLabel]}
                />
                <Area
                  type="monotone"
                  dataKey="val"
                  stroke="#FBBF24"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#netWorthGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Timeframe Filter Pills */}
          <div className="flex items-center justify-between gap-1 pt-2 border-t border-amber-200/10 text-[10px] font-mono font-bold">
            {(['1W', '1M', '3M', '6M', '1Y', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setNetWorthTimeframe(tf)}
                className={`px-2.5 py-1 rounded-full transition ${
                  netWorthTimeframe === tf
                    ? 'bg-amber-200 text-[#1F2B21] font-extrabold shadow-sm'
                    : 'text-amber-200/60 hover:text-amber-100 hover:bg-white/10'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

        </div>

        {/* Financial Snapshot (4 Pill Cards) */}
        <div className="md:col-span-6 bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#647266] uppercase tracking-wider">
            <span>{t.financialSnapshotTitle}</span>
            <span className="text-[10px] text-[#28372B] font-serif font-bold">{t.snapshotPeriodLabel} v</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            
            {/* Income Card */}
            <div className="bg-[#FAF8F5] border border-[#E8E2D7] p-3.5 rounded-2xl flex items-start justify-between shadow-2xs">
              <div>
                <div className="text-[10px] font-mono font-bold text-[#728074] uppercase">{t.totalCycleIncome}</div>
                <div className="font-serif text-xl font-extrabold text-[#1E2922] mt-1">
                  {formatCurrency(totalIncome, currency)}
                </div>
                <div className="text-[10px] font-mono font-bold text-emerald-700 mt-1">{t.thisMonthLabel}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#E3DDD3] text-[#28372B] flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4" />
              </div>
            </div>

            {/* Expenses Card */}
            <div className="bg-[#FAF8F5] border border-[#E8E2D7] p-3.5 rounded-2xl flex items-start justify-between shadow-2xs">
              <div>
                <div className="text-[10px] font-mono font-bold text-[#728074] uppercase">{t.totalCycleSpent}</div>
                <div className="font-serif text-xl font-extrabold text-[#1E2922] mt-1">
                  {formatCurrency(totalSpent, currency)}
                </div>
                <div className="text-[10px] font-mono font-bold text-rose-700 mt-1">{t.thisMonthLabel}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#EAE2D8] text-[#8C5D4B] flex items-center justify-center shrink-0">
                <TrendingDown className="w-4 h-4" />
              </div>
            </div>

            {/* Savings Card */}
            <div className="bg-[#FAF8F5] border border-[#E8E2D7] p-3.5 rounded-2xl flex items-start justify-between shadow-2xs">
              <div>
                <div className="text-[10px] font-mono font-bold text-[#728074] uppercase">{t.savingsVault}</div>
                <div className="font-serif text-xl font-extrabold text-[#1E2922] mt-1">
                  {formatCurrency(savingsBalance, currency)}
                </div>
                <div className="text-[10px] font-mono font-bold text-emerald-700 mt-1">{t.totalSavedLabel}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#E3DDD3] text-[#28372B] flex items-center justify-center shrink-0">
                <PiggyBank className="w-4 h-4" />
              </div>
            </div>

            {/* Net Surplus Card */}
            <div className="bg-[#FAF8F5] border border-[#E8E2D7] p-3.5 rounded-2xl flex items-start justify-between shadow-2xs">
              <div>
                <div className="text-[10px] font-mono font-bold text-[#728074] uppercase">{t.netSurplusDeficit}</div>
                <div className="font-serif text-xl font-extrabold text-[#1E2922] mt-1">
                  {formatCurrency(totalIncome - totalSpent, currency)}
                </div>
                <div className="text-[10px] font-mono font-bold text-emerald-700 mt-1">{t.incomeMinusSpentLabel}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#EAE2D8] text-[#8C5D4B] flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Phase 1: budget deduction + overspend meters */}
      <BudgetOverview />

      {myBudgetRole === 'viewer' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl px-4 py-3 text-xs">
          <span className="font-bold">{t.viewerBannerTitle}</span> {t.viewerBannerBody}
        </div>
      )}

      {/* Budget partners: invite by email, change roles, remove */}
      <PartnerManagement />

      {/* Bottom Row: Quote Tile, Top Priorities, and Mini Calendar Widget */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        
        {/* Dark Quote Tile */}
        <div className="md:col-span-4 bg-[#28372B] text-amber-100 rounded-3xl p-6 border border-[#1F2B21] flex flex-col justify-between shadow-md">
          <Sparkles className="w-6 h-6 text-amber-300" />
          <div className="font-serif text-lg leading-snug font-medium my-4 text-amber-100 tracking-wide uppercase">
            {t.quoteTileMain}
          </div>
          <div className="text-[10px] font-mono font-bold text-amber-200/80 tracking-widest">
            {t.quoteTileSub}
          </div>
        </div>

        {/* Top Priorities Goals List */}
        <div className="md:col-span-4 bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#627064] uppercase">
            <span>{t.topPrioritiesTitle}</span>
            <button onClick={onNavigateToCategories} className="text-[#28372B] hover:underline text-[11px]">
              {t.editPrioritiesBtn}
            </button>
          </div>

          <div className="space-y-3">
            {savingsGoals.slice(0, 3).map((goal, idx) => {
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div key={goal.id} className="space-y-1 border-b border-[#E8E2D7] pb-2 last:border-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-[#28372B]">0{idx + 1}</span>
                    <span className="font-serif font-bold text-[#1E2922] truncate max-w-[140px]">{goal.title}</span>
                    <span className="font-mono text-[11px] text-[#627064]">{pct}%</span>
                  </div>
                  <div className="w-full bg-[#EAE5DC] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#28372B] h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="text-[10px] font-mono text-[#78857A] text-right">
                    {formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mini Calendar Widget */}
        <div className="md:col-span-4 bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-[#627064] uppercase">
            <span>{t.monthlyCalendarTitle}</span>
            <span className="text-[#28372B] font-serif font-bold">{activeMonth} v</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-[#78857A]">
            {t.calendarWeekdays.split('').map((d, i) => (
              <div key={i}>{d}</div>
            ))}
            {calendarDays.slice(0, 28).map((d) => {
              const isToday = d === currentDay;
              return (
                <div
                  key={d}
                  className={`py-1 rounded-full text-[11px] font-bold ${
                    isToday
                      ? 'bg-[#28372B] text-amber-200 shadow-sm'
                      : 'text-[#3E4A40] hover:bg-[#EAE5DC]'
                  }`}
                >
                  {d}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Quick Actions Bar */}
      <div className="bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-mono font-bold text-[#627064] uppercase tracking-wider pl-2">
          {t.quickActionsTitle}
        </span>

        <div className="flex flex-wrap items-center gap-2">
          
          <button
            onClick={onNavigateToExpenses}
            className="px-4 py-2 rounded-full bg-[#EAE5DC] hover:bg-[#E2DDD3] text-[#28372B] font-serif font-bold text-xs border border-[#DCD5C8] flex items-center gap-2 transition"
          >
            <div className="w-5 h-5 rounded-full bg-[#28372B] text-amber-200 flex items-center justify-center text-xs">
              <Plus className="w-3 h-3" />
            </div>
            <span>{t.addExpenseBtn}</span>
          </button>

          <button
            onClick={onNavigateToWizard}
            className="px-4 py-2 rounded-full bg-[#EAE5DC] hover:bg-[#E2DDD3] text-[#28372B] font-serif font-bold text-xs border border-[#DCD5C8] flex items-center gap-2 transition"
          >
            <div className="w-5 h-5 rounded-full bg-[#8C5D4B] text-amber-100 flex items-center justify-center text-xs">
              <ArrowUpRight className="w-3 h-3" />
            </div>
            <span>{t.wizardBtn}</span>
          </button>

          <button
            onClick={onNavigateToCategories}
            className="px-4 py-2 rounded-full bg-[#EAE5DC] hover:bg-[#E2DDD3] text-[#28372B] font-serif font-bold text-xs border border-[#DCD5C8] flex items-center gap-2 transition"
          >
            <div className="w-5 h-5 rounded-full bg-[#28372B] text-amber-200 flex items-center justify-center text-xs">
              <ArrowRightLeft className="w-3 h-3" />
            </div>
            <span>{t.categoriesAllocations}</span>
          </button>

        </div>
      </div>

    </div>
  );
};
