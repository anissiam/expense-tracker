import React, { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../data/currencies';
import { DynamicIcon } from '../Common/DynamicIcon';
import { Expense, PaymentMethod } from '../../types';
import {
  Receipt,
  Plus,
  Search,
  Trash2,
  Edit,
  Sparkles,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  X,
  FileSpreadsheet
} from 'lucide-react';

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: React.FC<any> }[] = [
  { id: 'credit', label: 'Credit Card', icon: CreditCard },
  { id: 'debit', label: 'Debit Card', icon: CreditCard },
  { id: 'cash', label: 'Cash', icon: Banknote },
  { id: 'apple_pay', label: 'Apple Pay', icon: Smartphone },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: Building2 },
];

export const ExpenseManager: React.FC = () => {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    categories,
    currency,
    activeMonth,
    t,
  } = useExpense();

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>('all');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState<string>('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit');
  const [notes, setNotes] = useState('');
  const [isCategorizing, setIsCategorizing] = useState(false);

  // Filtered Expenses
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCatFilter === 'all' || e.categoryId === selectedCatFilter;
    const matchesPayment =
      selectedPaymentFilter === 'all' || e.paymentMethod === selectedPaymentFilter;
    return matchesSearch && matchesCat && matchesPayment;
  });

  const openAddModal = () => {
    setEditingExpense(null);
    setTitle('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategoryId(categories[0]?.id || '');
    setSubcategoryId('');
    setPaymentMethod('credit');
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setAmount(exp.amount.toString());
    setDate(exp.date);
    setCategoryId(exp.categoryId);
    setSubcategoryId(exp.subcategoryId || '');
    setPaymentMethod(exp.paymentMethod);
    setNotes(exp.notes || '');
    setShowModal(true);
  };

  const handleAiAutoCategorize = async () => {
    if (!title.trim()) {
      alert('Please enter an expense title first (e.g. "Starbucks Coffee")');
      return;
    }
    setIsCategorizing(true);
    try {
      const res = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          amount: parseFloat(amount) || 0,
          categories,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.categoryId) setCategoryId(data.categoryId);
        if (data.subcategoryId) setSubcategoryId(data.subcategoryId);
      }
    } catch (err) {
      console.error('Auto categorize error:', err);
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0 || !categoryId) {
      alert('Please fill out all required fields with a valid positive amount.');
      return;
    }

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        title: title.trim(),
        amount: parsedAmount,
        date,
        categoryId,
        subcategoryId: subcategoryId || undefined,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    } else {
      addExpense({
        title: title.trim(),
        amount: parsedAmount,
        date,
        categoryId,
        subcategoryId: subcategoryId || undefined,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    }

    setShowModal(false);
  };

  const activeCategoryObj = categories.find((c) => c.id === categoryId);

  const exportToCSV = () => {
    const headers = ['Date', 'Title', 'Category', 'Amount', 'Payment Method', 'Notes'];
    const rows = filteredExpenses.map((e) => {
      const cat = categories.find((c) => c.id === e.categoryId);
      return [
        e.date,
        `"${e.title.replace(/"/g, '""')}"`,
        `"${cat?.name || 'General'}"`,
        e.amount,
        e.paymentMethod,
        `"${(e.notes || '').replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Expenses_${activeMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Banner & Quick Controls */}
      <div className="bg-[#28372B] p-6 rounded-3xl border border-[#1F2B21] text-amber-100 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-amber-100 tracking-wide flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-300" />
            {t.expenseLogTitle}
          </h2>
          <p className="text-xs text-amber-200/70 font-mono tracking-wider uppercase mt-1">
            {t.expenseLogDesc}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="px-4 py-2.5 rounded-2xl bg-[#EAE5DC] hover:bg-[#E2DDD3] text-[#28372B] border border-[#DCD5C8] text-xs font-mono font-bold flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#28372B]" />
            <span>{t.exportCsv}</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-2xl bg-amber-200 hover:bg-amber-100 text-[#1E2B21] font-serif font-bold text-xs flex items-center gap-2 shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-[#1E2B21]" />
            <span>{t.newExpenseBtn}</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#FAF8F5] p-4 rounded-3xl border border-[#E3DDD3] shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#78857A] absolute left-3.5 rtl:right-3.5 rtl:left-auto top-3" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#EAE5DC] text-[#1E2922] border border-[#DCD5C8] rounded-2xl pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#28372B]"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <select
            value={selectedCatFilter}
            onChange={(e) => setSelectedCatFilter(e.target.value)}
            className="w-full bg-[#EAE5DC] text-[#1E2922] border border-[#DCD5C8] rounded-2xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#28372B]"
          >
            <option value="all">{t.allCategories} ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method Filter */}
        <div className="relative">
          <select
            value={selectedPaymentFilter}
            onChange={(e) => setSelectedPaymentFilter(e.target.value)}
            className="w-full bg-[#EAE5DC] text-[#1E2922] border border-[#DCD5C8] rounded-2xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#28372B]"
          >
            <option value="all">{t.allPaymentMethods}</option>
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm.id} value={pm.id}>
                {pm.label}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Expenses Table */}
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#E3DDD3] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right text-xs text-[#232B25]">
            <thead className="bg-[#EAE5DC] text-[#627064] font-mono font-bold uppercase tracking-wider border-b border-[#DCD5C8] text-[10px]">
              <tr>
                <th className="py-4 px-5">Expense Details</th>
                <th className="py-4 px-5">Category</th>
                <th className="py-4 px-5">Payment Method</th>
                <th className="py-4 px-5">Date</th>
                <th className="py-4 px-5 text-right rtl:text-left">Amount</th>
                <th className="py-4 px-5 text-right rtl:text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E2D7]">
              {filteredExpenses.map((exp) => {
                const cat = categories.find((c) => c.id === exp.categoryId);
                const sub = cat?.subcategories.find((s) => s.id === exp.subcategoryId);

                return (
                  <tr key={exp.id} className="hover:bg-[#EAE5DC]/50 transition">
                    <td className="py-4 px-5">
                      <div className="font-serif font-bold text-[#1E2922] text-sm">{exp.title}</div>
                      {exp.notes && (
                        <div className="text-[11px] text-[#627064] italic mt-0.5 truncate max-w-xs font-mono">
                          {exp.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        {cat && (
                          <div className="p-1.5 rounded-xl bg-[#28372B] text-amber-200">
                            <DynamicIcon name={cat.icon} className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-[#1E2922]">{cat?.name || 'General'}</div>
                          {sub && <div className="text-[10px] font-mono text-[#78857A]">{sub.name}</div>}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAE5DC] border border-[#DCD5C8] text-[#28372B] text-[10px] font-mono uppercase font-bold">
                        {exp.paymentMethod.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-[#627064] font-mono text-xs">
                      {exp.date}
                    </td>

                    <td className="py-4 px-5 text-right rtl:text-left font-serif font-extrabold text-base text-[#8C5D4B]">
                      -{formatCurrency(exp.amount, currency)}
                    </td>

                    <td className="py-4 px-5 text-right rtl:text-left space-x-1">
                      <button
                        onClick={() => openEditModal(exp)}
                        className="p-1.5 rounded-xl bg-[#EAE5DC] hover:bg-[#E2DDD3] text-[#28372B] transition"
                        title="Edit Expense"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete expense "${exp.title}"?`)) deleteExpense(exp.id);
                        }}
                        className="p-1.5 rounded-xl bg-[#EAE5DC] hover:bg-[#E2DDD3] text-rose-700 transition"
                        title="Delete Expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-[#78857A] font-mono italic text-xs">
                    No expense records matching your search/filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-[#1E2B21]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8E2D7] pb-3">
              <h3 className="text-xl font-serif font-bold text-[#1E2922] flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#28372B]" />
                {editingExpense ? t.editExpenseModalTitle : t.addExpenseModalTitle}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-[#627064] hover:text-[#1E2922]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Title & AI Button */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-mono font-bold text-[#627064] uppercase">{t.expenseTitleLabel}</label>
                  <button
                    type="button"
                    onClick={handleAiAutoCategorize}
                    disabled={isCategorizing}
                    className="text-[11px] font-mono font-bold text-[#28372B] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    {isCategorizing ? 'Categorizing...' : t.autoCategorizeBtn}
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Uber Ride or Grocery Store"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#28372B]"
                />
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">
                    {t.amountLabel} ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm text-[#1E2922] font-serif font-extrabold focus:outline-none focus:ring-2 focus:ring-[#28372B]"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-3.5 py-2.5 text-xs font-mono text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#28372B]"
                  />
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">
                    {t.categoryLabel}
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setSubcategoryId('');
                    }}
                    className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-3.5 py-2.5 text-xs text-[#1E2922] font-semibold focus:outline-none focus:ring-2 focus:ring-[#28372B]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">
                    {t.subcategoryLabel}
                  </label>
                  <select
                    value={subcategoryId}
                    onChange={(e) => setSubcategoryId(e.target.value)}
                    className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-3.5 py-2.5 text-xs text-[#1E2922] font-semibold focus:outline-none focus:ring-2 focus:ring-[#28372B]"
                  >
                    <option value="">(None)</option>
                    {activeCategoryObj?.subcategories.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-2">
                  {t.paymentMethodLabel}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {PAYMENT_METHODS.map((pm) => {
                    const Icon = pm.icon;
                    const isSelected = paymentMethod === pm.id;
                    return (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`p-2.5 rounded-2xl border text-left rtl:text-right transition flex items-center gap-2 ${
                          isSelected
                            ? 'bg-[#28372B] border-[#1F2B21] text-amber-200 font-bold shadow-xs'
                            : 'bg-[#EAE5DC] border-[#DCD5C8] text-[#354238] hover:bg-[#E2DDD3]'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] font-mono truncate">{pm.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">
                  {t.notesLabel}
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Order #1042 or receipt notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-3.5 py-2 text-xs text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#28372B]"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E2D7]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-[#EAE5DC] text-[#354238] text-xs font-mono font-bold"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#28372B] hover:bg-[#1F2B21] text-amber-100 text-xs font-serif font-bold shadow-md"
                >
                  {t.saveExpenseBtn}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
