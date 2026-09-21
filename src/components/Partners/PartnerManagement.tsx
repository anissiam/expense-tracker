import React, { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { PartnerRole } from '../../types';
import { Users, MailPlus, Trash2, ShieldCheck, Eye, Link2, Copy, Check } from 'lucide-react';

/**
 * Owner-only partner management for the active budget.
 * Viewers/editors see a read-only list; only the owner can invite,
 * change roles, or remove partners (enforced server-side too).
 */
export const PartnerManagement: React.FC = () => {
  const {
    budgetCycle,
    budgetPartners,
    budgetOwner,
    myBudgetRole,
    isBudgetOwner,
    invitePartner,
    changePartnerRole,
    removePartner,
    pendingInvites,
    refreshPendingInvites,
    acceptInviteToken,
    declineInviteToken,
  } = useExpense();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<PartnerRole>('editor');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!budgetCycle.id) {
    return (
      <div className="bg-[#FAF8F5] border border-dashed border-[#DCD5C8] rounded-3xl p-5 text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#627064] uppercase tracking-wider">
          <Users className="w-4 h-4" />
          <span>Budget partners</span>
        </div>
        <p className="text-xs text-[#78857A]">
          Create a monthly budget first (Wizard tab) — then you can invite partners here.
        </p>
      </div>
    );
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setInviteLink(null);
    setCopied(false);
    if (!email.trim()) {
      setError('Enter an email address.');
      return;
    }
    setBusy(true);
    try {
      const created = await invitePartner(email.trim(), role);
      if (created.inviteUrl) setInviteLink(created.inviteUrl);
      setNotice(`Invitation saved for ${email.trim()} as ${role}. Share the link below — email delivery requires SMTP + a queue worker (see note).`);
      setEmail('');
    } catch (err: any) {
      setError(err?.message || 'Failed to send invitation.');
    } finally {
      setBusy(false);
    }
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (non-secure context): select manually.
      setError('Copy failed — select the link manually.');
    }
  };

  const handleRoleChange = async (memberId: string, next: PartnerRole) => {
    setError(null);
    try {
      await changePartnerRole(memberId, next);
    } catch (err: any) {
      setError(err?.message || 'Failed to change role.');
    }
  };

  const handleRemove = async (memberId: string, memberEmail: string) => {
    if (!window.confirm(`Remove ${memberEmail} from this budget? They will lose access immediately.`)) return;
    setError(null);
    try {
      await removePartner(memberId);
    } catch (err: any) {
      setError(err?.message || 'Failed to remove partner.');
    }
  };

  return (
    <div className="bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#627064] uppercase tracking-wider">
          <Users className="w-4 h-4" />
          <span>Budget partners</span>
        </div>
        {myBudgetRole && (
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-1 rounded-lg bg-[#EAE5DC] border border-[#DCD5C8] text-[#627064]">
            You are {myBudgetRole}
          </span>
        )}
      </div>

      {budgetOwner && (
        <p className="text-xs text-[#78857A]">
          Owner: <span className="font-bold text-[#1E2922]">{budgetOwner.name || budgetOwner.email}</span>
        </p>
      )}

      {/* Pending invites for me */}
      {pendingInvites.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-mono font-bold text-[#627064] uppercase">Your pending invitations</div>
          {pendingInvites.map((inv) => (
            <div key={inv.token} className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
              <div>
                <span className="font-bold">{inv.budgetName || 'Shared budget'}</span>
                <span className="text-[#78857A]"> · {inv.role} · from {inv.inviterName || 'owner'}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => acceptInviteToken(inv.token).catch((e) => setError(e?.message))}
                  className="px-3 py-1.5 rounded-xl bg-[#28372B] text-amber-100 font-bold"
                >
                  Accept
                </button>
                <button
                  onClick={() => declineInviteToken(inv.token).catch((e) => setError(e?.message))}
                  className="px-3 py-1.5 rounded-xl bg-[#EAE5DC] border border-[#DCD5C8] font-bold text-[#627064]"
                >
                  Decline
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => refreshPendingInvites()} className="text-[11px] text-[#627064] hover:underline">
            Refresh invitations
          </button>
        </div>
      )}

      {/* Member list */}
      <div className="space-y-2">
        {budgetPartners.length === 0 && (
          <p className="text-xs font-mono italic text-[#78857A]">No partners yet. Invite someone below.</p>
        )}
        {budgetPartners.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#F3EFEA] border border-[#E3DDD3]">
            <div className="min-w-0">
              <div className="text-sm font-bold text-[#1E2922] truncate">{m.name || m.email}</div>
              <div className="text-[11px] font-mono text-[#78857A]">
                {m.email} · {m.status}
                {m.status === 'pending' ? ' · invite sent' : ''}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isBudgetOwner ? (
                <>
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.id, e.target.value as PartnerRole)}
                    className="text-xs font-bold bg-[#EAE5DC] border border-[#DCD5C8] rounded-xl px-2 py-1.5 text-[#1E2922]"
                    title="Change role"
                  >
                    <option value="editor">editor</option>
                    <option value="viewer">viewer</option>
                  </select>
                  <button
                    onClick={() => handleRemove(m.id, m.email)}
                    className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 hover:bg-rose-500/20"
                    title="Remove partner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#627064] uppercase">
                  {m.role === 'editor' ? <ShieldCheck className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {m.role}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite form (owner only) */}
      {isBudgetOwner ? (
        <form onSubmit={handleInvite} className="space-y-2 pt-1">
          <div className="text-[10px] font-mono font-bold text-[#627064] uppercase">Invite a partner by email</div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@example.com"
              className="flex-1 bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#28372B]"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as PartnerRole)}
              className="bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-3 py-2.5 text-sm font-bold text-[#1E2922]"
              title="Role"
            >
              <option value="editor">editor — view + add/edit</option>
              <option value="viewer">viewer — view only</option>
            </select>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2.5 rounded-2xl bg-[#28372B] hover:bg-[#1F2B21] disabled:opacity-60 text-amber-100 font-bold text-xs flex items-center justify-center gap-2"
            >
              <MailPlus className="w-4 h-4" />
              {busy ? 'Sending…' : 'Send invite'}
            </button>
          </div>
          <p className="text-[11px] text-[#78857A]">
            If they have an account they can accept directly; otherwise the email asks them to sign up first.
            No SMTP configured? Copy the invite link shown after inviting and send it manually.
          </p>
        </form>
      ) : (
        <p className="text-[11px] font-mono text-[#78857A]">Only the budget owner can invite or manage partners.</p>
      )}

      {inviteLink && (
        <div className="p-3 rounded-2xl bg-[#28372B] text-amber-100 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-mono font-bold uppercase text-[10px] tracking-wider text-amber-200/80">
            <Link2 className="w-3.5 h-3.5" />
            <span>Share this invite link</span>
          </div>
          <div className="break-all font-mono text-[11px] bg-black/20 rounded-xl px-3 py-2">{inviteLink}</div>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-amber-100 text-[#28372B] font-bold text-[11px] flex items-center gap-1.5 hover:bg-amber-200"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 text-xs">{error}</div>
      )}
      {notice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 text-xs">{notice}</div>
      )}
    </div>
  );
};
