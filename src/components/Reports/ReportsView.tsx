import React from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../data/currencies';
import {
  BarChart3,
  TrendingDown,
  CreditCard,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { categories, expenses, activeMonth, currency, t } = useExpense();

  const monthExpenses = expenses.filter((e) => e.date.startsWith(activeMonth));

  // Category Allocated vs Spent Chart Data
  const catComparisonData = categories.map((c) => ({
    name: c.name.length > 12 ? c.name.substring(0, 10) + '...' : c.name,
    Allocated: c.allocated,
    Spent: c.spent,
  }));

  // Payment Method Breakdown Chart Data
  const paymentMethodMap: Record<string, number> = {};
  monthExpenses.forEach((exp) => {
    const pm = exp.paymentMethod.replace('_', ' ').toUpperCase();
    paymentMethodMap[pm] = (paymentMethodMap[pm] || 0) + exp.amount;
  });

  const paymentPieData = Object.keys(paymentMethodMap).map((pm) => ({
    name: pm,
    value: paymentMethodMap[pm],
  }));

  const COLORS = ['#28372B', '#8C5D4B', '#627064', '#C9A050', '#546A5B'];

  // Weekly breakdown
  const weeklyMap: Record<string, number> = {
    'Week 1 (1-7)': 0,
    'Week 2 (8-14)': 0,
    'Week 3 (15-21)': 0,
    'Week 4 (22-31)': 0,
  };

  monthExpenses.forEach((e) => {
    const day = parseInt(e.date.split('-')[2], 10);
    if (day <= 7) weeklyMap['Week 1 (1-7)'] += e.amount;
    else if (day <= 14) weeklyMap['Week 2 (8-14)'] += e.amount;
    else if (day <= 21) weeklyMap['Week 3 (15-21)'] += e.amount;
    else weeklyMap['Week 4 (22-31)'] += e.amount;
  });

  const weeklyData = Object.keys(weeklyMap).map((w) => ({
    week: w,
    spent: weeklyMap[w],
  }));

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Banner */}
      <div className="bg-[#28372B] p-6 rounded-3xl border border-[#1F2B21] text-amber-100 shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-amber-100 tracking-wide flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-300" />
            {t.reportsHeaderTitle}
          </h2>
          <p className="text-xs text-amber-200/70 font-mono tracking-wider uppercase mt-1">
            {t.reportsHeaderDesc} ({t.cycle}: <strong className="text-amber-200">{activeMonth}</strong>)
          </p>
        </div>
      </div>

      {/* Allocated vs Spent Bar Chart */}
      <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E3DDD3] shadow-xs space-y-4">
        <h3 className="text-base font-serif font-bold text-[#1E2922] flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-[#28372B]" />
          {t.incomeVsExpenseChart}
        </h3>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={catComparisonData}>
              <XAxis dataKey="name" stroke="#627064" fontSize={11} tickLine={false} />
              <YAxis stroke="#627064" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FAF8F5', borderColor: '#E3DDD3', borderRadius: '16px', fontSize: '12px', fontFamily: 'serif' }}
                formatter={(val: any) => [formatCurrency(Number(val), currency)]}
              />
              <Legend />
              <Bar dataKey="Allocated" fill="#28372B" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Spent" fill="#8C5D4B" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Breakdown & Payment Channels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly Expense Progression */}
        <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E3DDD3] shadow-xs space-y-4">
          <h3 className="text-base font-serif font-bold text-[#1E2922] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#28372B]" />
            Weekly Expense Distribution
          </h3>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis dataKey="week" stroke="#627064" fontSize={11} tickLine={false} />
                <YAxis stroke="#627064" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FAF8F5', borderColor: '#E3DDD3', borderRadius: '16px', fontSize: '12px', fontFamily: 'serif' }}
                  formatter={(val: any) => [formatCurrency(Number(val), currency), 'Spent']}
                />
                <Bar dataKey="spent" fill="#28372B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Channels Breakdown */}
        <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E3DDD3] shadow-xs space-y-4">
          <h3 className="text-base font-serif font-bold text-[#1E2922] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#28372B]" />
            Payment Channel Usage
          </h3>

          <div className="h-60 w-full flex items-center justify-center">
            {paymentPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {paymentPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FAF8F5', borderColor: '#E3DDD3', borderRadius: '16px', fontSize: '12px', fontFamily: 'serif' }}
                    formatter={(val: any) => [formatCurrency(Number(val), currency)]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center font-mono text-xs text-[#78857A] italic">No transactions recorded</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
