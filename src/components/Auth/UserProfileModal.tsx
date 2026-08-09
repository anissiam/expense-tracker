import React, { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { CURRENCIES } from '../../data/currencies';
import { CurrencyCode } from '../../types';
import {
  User,
  X,
  RotateCcw,
  Check,
  Building,
  Users,
  ShieldCheck,
  Mail,
  Calendar
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROFILES = [
  {
    id: 'usr-1',
    name: 'Alex Vance',
    email: 'alex.vance@example.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    type: 'Personal Budget',
  },
  {
    id: 'usr-2',
    name: 'Vance Family Account',
    email: 'family@vance.home',
    avatar: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=150&auto=format&fit=crop&q=80',
    type: 'Shared Household',
  },
  {
    id: 'usr-3',
    name: 'Vance Consulting LLC',
    email: 'finance@vanceconsulting.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    type: 'Small Business',
  },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, setUser, currency, setCurrency, resetToDemoData, theme, setTheme, t } = useExpense();

  const [nameInput, setNameInput] = useState(user.name);
  const [emailInput, setEmailInput] = useState(user.email);
  const [salaryDay, setSalaryDay] = useState(user.monthlySalaryDay || 1);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...user,
      name: nameInput,
      email: emailInput,
      monthlySalaryDay: salaryDay,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1000);
  };

  const handleSwitchProfile = (p: typeof PROFILES[0]) => {
    setUser({
      ...user,
      id: p.id,
      name: p.name,
      email: p.email,
      avatar: p.avatar,
    });
    setNameInput(p.name);
    setEmailInput(p.email);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">{t.userProfileTitle}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Switcher */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase block">
            Switch Profile Context
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PROFILES.map((p) => {
              const isSelected = user.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSwitchProfile(p)}
                  className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 text-white font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full mb-1 object-cover" />
                  <span className="text-[11px] truncate w-full">{p.name}</span>
                  <span className="text-[9px] text-slate-400">{p.type}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Settings */}
        <form onSubmit={handleSave} className="space-y-4 pt-2 border-t border-slate-800">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
              Account Name
            </label>
            <input
              type="text"
              required
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                Preferred Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
                Monthly Pay Day
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={salaryDay}
                onChange={(e) => setSalaryDay(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
              {t.themeOptions}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('obsidian')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border text-left rtl:text-right transition ${
                  theme === 'obsidian'
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-300'
                }`}
              >
                🌙 {t.themeObsidian}
              </button>
              <button
                type="button"
                onClick={() => setTheme('emerald_light')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border text-left rtl:text-right transition ${
                  theme === 'emerald_light'
                    ? 'border-emerald-500 bg-emerald-500/20 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-300'
                }`}
              >
                ☀️ {t.themeEmeraldLight}
              </button>
              <button
                type="button"
                onClick={() => setTheme('sapphire')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border text-left rtl:text-right transition ${
                  theme === 'sapphire'
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-300'
                }`}
              >
                💎 {t.themeSapphire}
              </button>
              <button
                type="button"
                onClick={() => setTheme('amber')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border text-left rtl:text-right transition ${
                  theme === 'amber'
                    ? 'border-amber-500 bg-amber-500/20 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-300'
                }`}
              >
                🌅 {t.themeAmber}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (confirm('Reset all budget data back to clean sample demo state?')) {
                  resetToDemoData();
                  onClose();
                }
              }}
              className="text-xs font-semibold text-rose-400 hover:underline flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Data</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
            >
              {isSaved ? <Check className="w-4 h-4" /> : null}
              <span>{isSaved ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
