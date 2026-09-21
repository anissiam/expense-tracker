import React, { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { Wallet, LogIn, UserPlus } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, register, authError, isLoading, t } = useExpense();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email.trim() || !password) {
      setLocalError(t.authEmailPasswordRequired);
      return;
    }
    if (mode === 'register' && !name.trim()) {
      setLocalError(t.authNameRequired);
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
    } catch (err: any) {
      setLocalError(err?.message || t.authFailedGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFEA] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="bg-[#28372B] p-8 rounded-3xl border border-[#1F2B21] text-amber-100 shadow-xl text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-200/10 border border-amber-300/20 mx-auto flex items-center justify-center">
            <Wallet className="w-7 h-7 text-amber-200" />
          </div>
          <h1 className="font-serif text-3xl font-extrabold tracking-tight">
            {t.authAppTitle}
          </h1>
          <p className="text-xs font-mono text-amber-200/70 uppercase tracking-widest">
            {t.authSubtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#FAF8F5] p-6 sm:p-8 rounded-3xl border border-[#E3DDD3] shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#EAE5DC] border border-[#DCD5C8]">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-2 rounded-xl text-xs font-bold transition ${mode === 'login' ? 'bg-[#28372B] text-amber-100 shadow' : 'text-[#627064]'}`}
            >
              {t.authSignIn}
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`py-2 rounded-xl text-xs font-bold transition ${mode === 'register' ? 'bg-[#28372B] text-amber-100 shadow' : 'text-[#627064]'}`}
            >
              {t.authRegister}
            </button>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">{t.authNameLabel}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.authNamePlaceholder}
                className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#28372B]"
              />
            </div>
          )}

          <div>
            <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">{t.authEmailLabel}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.authEmailPlaceholder}
              className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#28372B]"
            />
          </div>

          <div>
            <label className="text-xs font-mono font-bold text-[#627064] uppercase block mb-1">{t.authPasswordLabel}</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? t.authPasswordPlaceholderRegister : t.authPasswordPlaceholderLogin}
              minLength={mode === 'register' ? 8 : undefined}
              className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#28372B]"
            />
          </div>

          {(localError || authError) && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 text-xs">
              {localError || authError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || isLoading}
            className="w-full px-6 py-3 rounded-2xl bg-[#28372B] hover:bg-[#1F2B21] disabled:opacity-60 text-amber-100 font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-md transition"
          >
            {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{submitting ? t.commonPleaseWait : mode === 'login' ? t.authSignIn : t.authCreateAccount}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
