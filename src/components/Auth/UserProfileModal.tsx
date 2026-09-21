import React, { useState, useEffect } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { CURRENCIES } from '../../data/currencies';
import { CurrencyCode } from '../../types';
import {
  User,
  X,
  LogOut,
  Check
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, setUser, currency, setCurrency, logoutUser, theme, setTheme, t } = useExpense();

  const [nameInput, setNameInput] = useState(user.name);
  const [emailInput, setEmailInput] = useState(user.email);
  const [salaryDay, setSalaryDay] = useState(user.monthlySalaryDay || 1);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNameInput(user.name);
      setEmailInput(user.email);
      setSalaryDay(user.monthlySalaryDay || 1);
    }
  }, [isOpen, user]);

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

  const handleLogout = async () => {
    if (confirm(t.profileSignOutConfirm)) {
      await logoutUser();
      onClose();
    }
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

        {/* Current account */}
        <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-bold">
            {(user.name || user.email || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">{user.name || '—'}</div>
            <div className="text-xs text-slate-400 truncate">{user.email || '—'}</div>
          </div>
        </div>

        {/* Form Settings */}
        <form onSubmit={handleSave} className="space-y-4 pt-2 border-t border-slate-800">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase block mb-1">
              {t.profileAccountNameLabel}
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
              {t.profileEmailLabel}
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
                {t.profileCurrencyLabel}
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
                {t.profilePayDayLabel}
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
                onClick={() => setTheme('dark')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border text-left rtl:text-right transition ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-500/20 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-300'
                }`}
              >
                🌙 {t.themeDark}
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`px-3 py-2 rounded-xl text-xs font-bold border text-left rtl:text-right transition ${
                  theme === 'light'
                    ? 'border-emerald-500 bg-emerald-500/20 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-300'
                }`}
              >
                ☀️ {t.themeLight}
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-semibold text-rose-400 hover:underline flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.profileSignOutBtn}</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
            >
              {isSaved ? <Check className="w-4 h-4" /> : null}
              <span>{isSaved ? t.profileSaved : t.saveSettingsBtn}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
