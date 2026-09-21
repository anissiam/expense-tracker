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
  const { isAuthenticated, login, register, acceptInviteToken, declineInviteToken } = useExpense();
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
      setError('Invalid invitation link.');
      setLoading(false);
      return;
    }
    previewInvite(token)
      .then((p) => {
        setPreview(p);
        setMode(p.isNewUser ? 'register' : 'login');
        setEmail(p.email || '');
        if (p.status !== 'pending') setDone(`This invitation is already ${p.status}.`);
      })
      .catch((e: any) => setError(e?.message || 'Invitation not found or expired.'))
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
      setDone('Invitation accepted! Your shared budget is now available.');
    } catch (e: any) {
      setError(e?.message || 'Failed to accept invitation.');
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
      setDone('Welcome! Invitation accepted — loading your shared budget…');
      setTimeout(goHome, 1200);
    } catch (err: any) {
      setError(err?.message || 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3EFEA] flex items-center justify-center">
        <p className="text-xs font-mono text-[#627064] uppercase tracking-widest">Loading invitation…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3EFEA] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="bg-[#28372B] p-8 rounded-3xl border border-[#1F2B21] text-amber-100 shadow-xl text-center space-y-2">
          <Users className="w-8 h-8 mx-auto text-amber-200" />
          <h1 className="font-serif text-2xl font-extrabold">Budget invitation</h1>
          {preview && (
            <p className="text-xs font-mono text-amber-200/70 uppercase tracking-widest">
              {preview.budgetName || 'Shared budget'} · {preview.role} · from {preview.inviterName || 'owner'}
            </p>
          )}
        </div>

        <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E3DDD3] shadow-sm space-y-4">
          {done ? (
            <>
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 text-xs">{done}</div>
              <button onClick={goHome} className="w-full px-6 py-3 rounded-2xl bg-[#28372B] text-amber-100 font-bold text-sm">
                Go to dashboard
              </button>
            </>
          ) : !isAuthenticated && !getToken() ? (
            <form onSubmit={handleAuth} className="space-y-3">
              <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#EAE5DC] border border-[#DCD5C8]">
                <button type="button" onClick={() => setMode('login')} className={`py-2 rounded-xl text-xs font-bold ${mode === 'login' ? 'bg-[#28372B] text-amber-100' : 'text-[#627064]'}`}>Sign In</button>
                <button type="button" onClick={() => setMode('register')} className={`py-2 rounded-xl text-xs font-bold ${mode === 'register' ? 'bg-[#28372B] text-amber-100' : 'text-[#627064]'}`}>Sign Up</button>
              </div>
              <p className="text-xs text-[#627064]">
                {preview?.isNewUser
                  ? 'No account found for this email — create one to join the shared budget.'
                  : 'Sign in with the invited email address to accept.'}
              </p>
              {mode === 'register' && (
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm" />
              )}
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" minLength={mode === 'register' ? 8 : undefined} className="w-full bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm" />
              {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 text-xs">{error}</div>}
              <button type="submit" disabled={submitting} className="w-full px-6 py-3 rounded-2xl bg-[#28372B] disabled:opacity-60 text-amber-100 font-bold text-sm flex items-center justify-center gap-2">
                {mode === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in & accept' : 'Create account & join'}
              </button>
            </form>
          ) : (
            <>
              <p className="text-xs text-[#627064]">
                Signed in. Accept this invitation to get <span className="font-bold">{preview?.role}</span> access to{' '}
                <span className="font-bold">{preview?.budgetName}</span>?
              </p>
              {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 text-xs">{error}</div>}
              <div className="flex gap-2">
                <button
                  onClick={handleAccept}
                  className="flex-1 px-6 py-3 rounded-2xl bg-[#28372B] text-amber-100 font-bold text-sm"
                >
                  Accept invitation
                </button>
                <button
                  onClick={() => token && declineInviteToken(token).then(() => setDone('Invitation declined.')).catch((e: any) => setError(e?.message))}
                  className="px-6 py-3 rounded-2xl bg-[#EAE5DC] border border-[#DCD5C8] font-bold text-xs text-[#627064]"
                >
                  Decline
                </button>
              </div>
              <button onClick={goHome} className="w-full text-center text-[11px] text-[#627064] hover:underline">
                Back to dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
