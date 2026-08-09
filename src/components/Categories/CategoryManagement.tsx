import React, { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { formatCurrency } from '../../data/currencies';
import { DynamicIcon } from '../Common/DynamicIcon';
import {
  FolderKanban,
  Plus,
  Trash2,
  Archive,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  X,
  Layers,
  AlertCircle,
  Tag
} from 'lucide-react';

const AVAILABLE_ICONS = [
  'Home',
  'Utensils',
  'Car',
  'Film',
  'HeartPulse',
  'PiggyBank',
  'ShoppingBag',
  'Briefcase',
  'Plane',
  'GraduationCap',
  'Shirt',
  'Smartphone',
  'Coffee',
  'Gift',
  'Zap'
];

export const CategoryManagement: React.FC = () => {
  const {
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    archiveCategory,
    reorderCategory,
    addSubcategory,
    deleteSubcategory,
    currency,
    budgetCycle,
    t,
  } = useExpense();

  // New Category State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Folder');
  const [newCatAllocated, setNewCatAllocated] = useState('');
  const [newSubcatInput, setNewSubcatInput] = useState('');
  const [newSubcatList, setNewSubcatList] = useState<string[]>([]);

  // Subcategory Add inline state
  const [addingSubForCatId, setAddingSubForCatId] = useState<string | null>(null);
  const [inlineSubName, setInlineSubName] = useState('');
  const [inlineSubAllocated, setInlineSubAllocated] = useState('');

  // Editing Category Allocation State
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editAllocatedValue, setEditAllocatedValue] = useState('');

  const totalIncome = budgetCycle.totalIncome;
  const totalAllocated = categories.reduce((sum, c) => sum + c.allocated, 0);
  const remainingToAllocate = totalIncome - totalAllocated;

  const handleAddSubcatToNewList = () => {
    if (!newSubcatInput.trim()) return;
    setNewSubcatList([...newSubcatList, newSubcatInput.trim()]);
    setNewSubcatInput('');
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory(
      newCatName.trim(),
      newCatIcon,
      'emerald',
      parseFloat(newCatAllocated) || 0,
      newSubcatList
    );
    setNewCatName('');
    setNewCatIcon('Folder');
    setNewCatAllocated('');
    setNewSubcatList([]);
    setShowAddModal(false);
  };

  const handleSaveInlineSubcategory = (catId: string) => {
    if (!inlineSubName.trim()) return;
    addSubcategory(catId, inlineSubName.trim(), parseFloat(inlineSubAllocated) || 0);
    setInlineSubName('');
    setInlineSubAllocated('');
    setAddingSubForCatId(null);
  };

  const handleSaveAllocatedEdit = (catId: string) => {
    const val = parseFloat(editAllocatedValue);
    if (!isNaN(val)) {
      updateCategory(catId, { allocated: val });
    }
    setEditingCatId(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Banner & Allocation Progress Header */}
      <div className="bg-[#28372B] p-6 rounded-3xl border border-[#1F2B21] text-amber-100 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-amber-100 tracking-wide flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-amber-300" />
            {t.categoryManagementTitle}
          </h2>
          <p className="text-xs text-amber-200/70 font-mono tracking-wider uppercase mt-1">
            {t.categoryManagementDesc}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-amber-200 hover:bg-amber-100 text-[#1E2B21] font-serif font-bold text-xs flex items-center gap-2 shadow-sm transition self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-[#1E2B21]" />
          <span>{t.newCategoryBtn}</span>
        </button>
      </div>

      {/* Allocation Summary Bar */}
      <div className="p-5 rounded-3xl bg-[#FAF8F5] border border-[#E3DDD3] space-y-2 shadow-sm">
        <div className="flex items-center justify-between text-xs font-mono font-bold">
          <span className="text-[#627064] uppercase">{t.totalIncomeAllocation}</span>
          <span className={remainingToAllocate < 0 ? 'text-rose-700' : 'text-[#28372B]'}>
            {remainingToAllocate >= 0
              ? `${formatCurrency(remainingToAllocate, currency)} ${t.unallocatedRemaining}`
              : `${t.overallocatedBy} ${formatCurrency(Math.abs(remainingToAllocate), currency)}`}
          </span>
        </div>
        <div className="w-full bg-[#EAE5DC] rounded-full h-3 overflow-hidden border border-[#DCD5C8]">
          <div
            className={`h-full transition-all duration-300 ${
              remainingToAllocate < 0 ? 'bg-rose-600' : 'bg-[#28372B]'
            }`}
            style={{
              width: `${Math.min(100, totalIncome > 0 ? (totalAllocated / totalIncome) * 100 : 0)}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-[#78857A]">
          <span>{t.totalIncomeCap}: {formatCurrency(totalIncome, currency)}</span>
          <span>{t.totalAllocated}: {formatCurrency(totalAllocated, currency)}</span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map((cat, index) => {
          const isEditingAlloc = editingCatId === cat.id;

          return (
            <div
              key={cat.id}
              className={`p-6 rounded-3xl border transition shadow-xs space-y-4 ${
                cat.isArchived
                  ? 'bg-[#EAE5DC]/60 border-[#DCD5C8] opacity-60'
                  : 'bg-[#FAF8F5] border-[#E3DDD3] hover:border-[#28372B]/30'
              }`}
            >
              {/* Category Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-[#28372B] text-amber-200 border border-[#1F2B21]">
                    <DynamicIcon name={cat.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#1E2922] flex items-center gap-2">
                      <span>{cat.name}</span>
                      {cat.isArchived && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAE5DC] text-[#627064] border border-[#DCD5C8]">
                          Archived
                        </span>
                      )}
                    </h3>
                    <div className="text-[11px] font-mono text-[#78857A] mt-0.5">
                      {cat.subcategories.length} Subcategories • Order #{index + 1}
                    </div>
                  </div>
                </div>

                {/* Reorder & Action Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => reorderCategory(cat.id, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-xl bg-[#EAE5DC] hover:bg-[#E2DDD3] text-[#28372B] disabled:opacity-30 transition"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => reorderCategory(cat.id, 'down')}
                    disabled={index === categories.length - 1}
                    className="p-1.5 rounded-xl bg-[#EAE5DC] hover:bg-[#E2DDD3] text-[#28372B] disabled:opacity-30 transition"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => archiveCategory(cat.id)}
                    className="p-1.5 rounded-xl bg-[#EAE5DC] hover:bg-[#E2DDD3] text-amber-700 transition"
                    title={cat.isArchived ? 'Unarchive' : 'Archive'}
                  >
                    <Archive className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete category "${cat.name}"?`)) deleteCategory(cat.id);
                    }}
                    className="p-1.5 rounded-xl bg-[#EAE5DC] hover:bg-[#E2DDD3] text-rose-700 transition"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Category Allocation Field */}
              <div className="p-3.5 rounded-2xl bg-[#EAE5DC] border border-[#DCD5C8] flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#627064]">{t.allocatedBudget}:</span>

                {isEditingAlloc ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={editAllocatedValue}
                      onChange={(e) => setEditAllocatedValue(e.target.value)}
                      className="w-28 bg-[#FAF8F5] border border-[#28372B] rounded-xl px-2.5 py-1 text-xs text-[#1E2922] font-bold focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveAllocatedEdit(cat.id)}
                      className="p-1.5 rounded-lg bg-[#28372B] text-amber-100"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-lg font-extrabold text-[#1E2922]">
                      {formatCurrency(cat.allocated, currency)}
                    </span>
                    <button
                      onClick={() => {
                        setEditingCatId(cat.id);
                        setEditAllocatedValue(cat.allocated.toString());
                      }}
                      className="p-1 text-[#627064] hover:text-[#28372B]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Subcategories List */}
              <div className="space-y-2 pt-2 border-t border-[#E8E2D7]">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#627064]">
                  <span>{t.subcategoriesList}</span>
                  <button
                    onClick={() => setAddingSubForCatId(addingSubForCatId === cat.id ? null : cat.id)}
                    className="text-[#28372B] hover:underline text-[11px] flex items-center gap-1 font-bold"
                  >
                    <Plus className="w-3 h-3" />
                    {t.addSubcategoryInline}
                  </button>
                </div>

                {/* Inline Add Subcategory form */}
                {addingSubForCatId === cat.id && (
                  <div className="p-3.5 rounded-2xl bg-[#EAE5DC] border border-[#28372B]/40 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder={t.subcategoryNamePlaceholder}
                        value={inlineSubName}
                        onChange={(e) => setInlineSubName(e.target.value)}
                        className="bg-[#FAF8F5] border border-[#DCD5C8] rounded-xl px-3 py-1.5 text-xs text-[#1E2922]"
                      />
                      <input
                        type="number"
                        placeholder={t.optionalLimit}
                        value={inlineSubAllocated}
                        onChange={(e) => setInlineSubAllocated(e.target.value)}
                        className="bg-[#FAF8F5] border border-[#DCD5C8] rounded-xl px-3 py-1.5 text-xs text-[#1E2922]"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setAddingSubForCatId(null)}
                        className="px-3 py-1 rounded-xl bg-[#DCD5C8] text-[#354238] text-xs font-mono"
                      >
                        {t.cancelBtn}
                      </button>
                      <button
                        onClick={() => handleSaveInlineSubcategory(cat.id)}
                        className="px-3 py-1 rounded-xl bg-[#28372B] text-amber-100 text-xs font-serif font-bold"
                      >
                        {t.confirm}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  {cat.subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-[#EAE5DC]/80 hover:bg-[#EAE5DC] text-xs text-[#1E2922] border border-[#DCD5C8]"
                    >
                      <span className="font-semibold">{sub.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs text-[#627064]">
                          {formatCurrency(sub.spent, currency)} / <strong className="text-[#1E2922]">{formatCurrency(sub.allocated, currency)}</strong>
                        </span>
                        <button
                          onClick={() => deleteSubcategory(cat.id, sub.id)}
                          className="text-[#88968A] hover:text-rose-700 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {cat.subcategories.length === 0 && (
                    <div className="text-center py-2 text-[11px] font-mono text-[#8A968C] italic">
                      No subcategories added yet
                    </div>
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* New Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#1E2B21]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E8E2D7] pb-3">
              <h3 className="text-xl font-serif font-bold text-[#1E2922] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#28372B]" />
                Create New Category
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#627064] hover:text-[#1E2922]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Travel & Experiences"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#28372B]"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">
                  Select Icon
                </label>
                <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2.5 bg-[#EAE5DC] rounded-2xl border border-[#DCD5C8]">
                  {AVAILABLE_ICONS.map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setNewCatIcon(iconName)}
                      className={`p-2 rounded-xl border transition ${
                        newCatIcon === iconName
                          ? 'bg-[#28372B] text-amber-200 border-[#1F2B21]'
                          : 'bg-[#FAF8F5] text-[#354238] border-[#DCD5C8] hover:bg-[#E2DDD3]'
                      }`}
                    >
                      <DynamicIcon name={iconName} className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">
                  Initial Monthly Budget Allocation ({currency})
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 500"
                  value={newCatAllocated}
                  onChange={(e) => setNewCatAllocated(e.target.value)}
                  className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm text-[#1E2922] font-serif font-bold focus:outline-none focus:ring-2 focus:ring-[#28372B]"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">
                  Subcategories (Optional)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Subcategory title (e.g. Flight Tickets)"
                    value={newSubcatInput}
                    onChange={(e) => setNewSubcatInput(e.target.value)}
                    className="flex-1 bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-3.5 py-2 text-xs text-[#1E2922]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSubcatToNewList}
                    className="px-4 py-2 bg-[#28372B] text-amber-100 rounded-2xl text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {newSubcatList.map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-[#EAE5DC] text-xs font-mono font-bold text-[#28372B] border border-[#DCD5C8] flex items-center gap-1.5"
                    >
                      <span>{sub}</span>
                      <button
                        type="button"
                        onClick={() => setNewSubcatList(newSubcatList.filter((_, i) => i !== idx))}
                        className="hover:text-rose-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E2D7]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-2xl bg-[#EAE5DC] text-[#354238] text-xs font-mono font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#28372B] hover:bg-[#1F2B21] text-amber-100 text-xs font-serif font-bold shadow-md"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
