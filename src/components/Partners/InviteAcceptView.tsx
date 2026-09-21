import React, { useEffect, useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { previewInvite, getToken } from '../../services/apiService';
import { InvitePreview } from '../../types';
import { Users, LogIn, UserPlus } from 'lucide-react';

function tokenFromPath(): string | null {
  const m = window.location.pathname.match(/\/invite\/([^/]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

/**
 * Public deep link: /invite/:token (link sent by email).
 * - Shows budget name, inviter, role.
 * - New users are asked to sign up; existing users to sign in.
 * - After auth, the invite is accepted automatically.
 */
export const InviteAcceptView: React.FC<{ token?: string }> = ({ token: propToken }) => {
  const { isAuthenticated, login, register, acceptInviteToken, declineInviteToken, t } = useExpense();
  const [token] = useState(() => propToken || tokenFromPath() || new URLSearchParams(window.location.search).get('invite'));
  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const [mode, setMode] = useState<'login' | 'register'>(preview?.isNewUser ? 'register' : 'login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError(t.inviteInvalidLink);
      setLoading(false);
      return;
    }
    previewInvite(token)
      .then((p) => {
        setPreview(p);
        setMode(p.isNewUser ? 'register' : 'login');
        setEmail(p.email || '');
        if (p.status !== 'pending') setDone(t.inviteAlreadyStatus.replace('{status}', p.status));
      })
      .catch(() => setError(t.inviteNotFound))
      .finally(() => setLoading(false));
  }, [token]);

  const goHome = () => {
    window.location.href = '/';
  };

  const handleAccept = async () => {
    if (!token) return;
    setError(null);
    try {
      await acceptInviteToken(token);
      setDone(t.inviteAcceptedReady);
    } catch (e: any) {
      setError(e?.message || t.inviteAcceptFailed);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
        // Existing user: accept explicitly (email must match invite).
        await acceptInviteToken(token);
      } else {
        // New user: register auto-accepts via invite_token on the backend.
        await register(name.trim(), email.trim(), password, token);
      }
      setDone(t.inviteWelcomeAccepted);
      setTimeout(goHome, 1200);
    } catch (err: any) {
      setError(err?.message || t.authFailedGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3EFEA] flex items-center justify-center">
        <p className="text-xs font-mono text-[#627064] uppercase tracking-widest">{t.inviteLoading}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3EFEA] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="bg-[#28372B] p-8 rounded-3xl border border-[#1F2B21] text-amber-100 shadow-xl text-center space-y-2">
          <Users className="w-8 h-8 mx-auto text-amber-200" />
          <h1 className="font-serif text-2xl font-extrabold">{t.inviteTitle}</h1>
          {preview && (
            <p className="text-xs font-mono text-amber-200/70 uppercase tracking-widest">
              {preview.budgetName || t.partnersSharedBudgetFallback} · {preview.role === 'editor' ? t.partnersRoleEditor : t.partnersRoleViewer} · {t.partnersFromWord} {preview.inviterName || t.partnersOwnerFallback}
            </p>
          )}
        </div>

        <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E3DDD3] shadow-sm space-y-4">
          {done ? (
            <>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 text-xs">{done}</div>
              <button onClick={goHome} className="w-full px-6 py-3 rounded-2xl bg-[#28372B] text-amber-100 font-bold text-sm">
                {t.inviteGoDashboard}
              </button>
            </>
          ) : !isAuthenticated && !getToken() ? (
            <form onSubmit={handleAuth} className="space-y-3">
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#EAE5DC] border border-[#DCD5C8]">
                <button type="button" onClick={() => setMode('login')} className={`py-2 rounded-xl text-xs font-bold ${mode === 'login' ? 'bg-[#28372B] text-amber-100' : 'text-[#627064]'}`}>{t.authSignIn}</button>
                <button type="button" onClick={() => setMode('register')} className={`py-2 rounded-xl text-xs font-bold ${mode === 'register' ? 'bg-[#28372B] text-amber-100' : 'text-[#627064]'}`}>{t.authSignUp}</button>
              </div>
              <p className="text-xs text-[#627064]">
                {preview?.isNewUser
                  ? t.inviteNoAccountHint
                  : t.inviteSignInHint}
              </p>
              {mode === 'register' && (
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t.authNamePlaceholder} className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm" />
              )}
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t.authEmailPlaceholder} className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.authPasswordPlaceholderShort} minLength={mode === 'register' ? 8 : undefined} className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm" />
              {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 text-xs">{error}</div>}
              <button type="submit" disabled={submitting} className="w-full px-6 py-3 rounded-2xl bg-[#28372B] disabled:opacity-60 text-amber-100 font-bold text-sm flex items-center justify-center gap-2">
                {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {submitting ? t.commonPleaseWait : mode === 'login' ? t.inviteSignInAccept : t.inviteCreateJoin}
              </button>
            </form>
          ) : (
            <>
              <p className="text-xs text-[#627064]">
                {t.inviteConfirmPrompt
                  .replace('{role}', preview?.role === 'editor' ? t.partnersRoleEditor : t.partnersRoleViewer)
                  .replace('{budget}', preview?.budgetName || t.partnersSharedBudgetFallback)}
              </p>
              {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 text-xs">{error}</div>}
              <div className="flex gap-2">
                <button
                  onClick={handleAccept}
                  className="flex-1 px-6 py-3 rounded-2xl bg-[#28372B] text-amber-100 font-bold text-sm"
                >
                  {t.inviteAcceptBtn}
                </button>
                <button
                  onClick={() => token && declineInviteToken(token).then(() => setDone(t.inviteDeclinedDone)).catch((e: any) => setError(e?.message))}
                  className="px-6 py-3 rounded-2xl bg-[#EAE5DC] border border-[#DCD5C8] font-bold text-xs text-[#627064]"
                >
                  {t.partnersDecline}
                </button>
              </div>
              <button onClick={goHome} className="w-full text-center text-[11px] text-[#627064] hover:underline">
                {t.inviteBackDashboard}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
