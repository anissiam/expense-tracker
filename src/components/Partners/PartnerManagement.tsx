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
    t,
  } = useExpense();

  const roleLabel = (r: PartnerRole) => (r === 'editor' ? t.partnersRoleEditor : t.partnersRoleViewer);
  const statusLabel = (s: string) =>
    s === 'pending' ? t.partnerStatusPending
    : s === 'accepted' ? t.partnerStatusAccepted
    : s === 'declined' ? t.partnerStatusDeclined
    : s === 'revoked' ? t.partnerStatusRevoked
    : s;

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
          <span>{t.partnersTitle}</span>
        </div>
        <p className="text-xs text-[#78857A]">
          {t.partnersNoBudgetHint}
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
      setError(t.partnersEmailRequired);
      return;
    }
    setBusy(true);
    try {
      const created = await invitePartner(email.trim(), role);
      if (created.inviteUrl) setInviteLink(created.inviteUrl);
      setNotice(
        t.partnersInviteSavedNotice
          .replace('{email}', email.trim())
          .replace('{role}', roleLabel(role))
      );
      setEmail('');
    } catch (err: any) {
      setError(err?.message || t.partnersInviteFailed);
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
      setError(t.partnersCopyFailed);
    }
  };

  const handleRoleChange = async (memberId: string, next: PartnerRole) => {
    setError(null);
    try {
      await changePartnerRole(memberId, next);
    } catch (err: any) {
      setError(err?.message || t.partnersRoleChangeFailed);
    }
  };

  const handleRemove = async (memberId: string, memberEmail: string) => {
    if (!window.confirm(t.partnersRemoveConfirm.replace('{email}', memberEmail))) return;
    setError(null);
    try {
      await removePartner(memberId);
    } catch (err: any) {
      setError(err?.message || t.partnersRemoveFailed);
    }
  };

  return (
    <div className="bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#627064] uppercase tracking-wider">
          <Users className="w-4 h-4" />
          <span>{t.partnersTitle}</span>
        </div>
        {myBudgetRole && (
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-1 rounded-lg bg-[#EAE5DC] border border-[#DCD5C8] text-[#627064]">
            {t.partnersYourRole.replace('{role}', roleLabel(myBudgetRole as PartnerRole))}
          </span>
        )}
      </div>

      {budgetOwner && (
        <p className="text-xs text-[#78857A]">
          {t.partnersOwnerLabel} <span className="font-bold text-[#1E2922]">{budgetOwner.name || budgetOwner.email}</span>
        </p>
      )}

      {/* Pending invites for me */}
      {pendingInvites.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-mono font-bold text-[#627064] uppercase">{t.partnersPendingTitle}</div>
          {pendingInvites.map((inv) => (
            <div key={inv.token} className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs">
              <div>
                <span className="font-bold">{inv.budgetName || t.partnersSharedBudgetFallback}</span>
                <span className="text-[#78857A]"> · {roleLabel(inv.role)} · {t.partnersFromWord} {inv.inviterName || t.partnersOwnerFallback}</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => acceptInviteToken(inv.token).catch((e) => setError(e?.message))}
                  className="px-3 py-1.5 rounded-xl bg-[#28372B] text-amber-100 font-bold"
                >
                  {t.partnersAccept}
                </button>
                <button
                  onClick={() => declineInviteToken(inv.token).catch((e) => setError(e?.message))}
                  className="px-3 py-1.5 rounded-xl bg-[#EAE5DC] border border-[#DCD5C8] font-bold text-[#627064]"
                >
                  {t.partnersDecline}
                </button>
              </div>
            </div>
          ))}
          <button onClick={() => refreshPendingInvites()} className="text-[11px] text-[#627064] hover:underline">
            {t.partnersRefreshInvites}
          </button>
        </div>
      )}

      {/* Member list */}
      <div className="space-y-2">
        {budgetPartners.length === 0 && (
          <p className="text-xs font-mono italic text-[#78857A]">{t.partnersEmpty}</p>
        )}
        {budgetPartners.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-[#F3EFEA] border border-[#E3DDD3]">
            <div className="min-w-0">
              <div className="text-sm font-bold text-[#1E2922] truncate">{m.name || m.email}</div>
              <div className="text-[11px] font-mono text-[#78857A]">
                {m.email} · {statusLabel(m.status)}
                {m.status === 'pending' ? t.partnersInviteSentSuffix : ''}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isBudgetOwner ? (
                <>
                  <select
                    value={m.role}
                    onChange={(e) => handleRoleChange(m.id, e.target.value as PartnerRole)}
                    className="text-xs font-bold bg-[#EAE5DC] border border-[#DCD5C8] rounded-xl px-2 py-1.5 text-[#1E2922]"
                    title={t.partnersChangeRoleTitle}
                  >
                    <option value="editor">{t.partnersRoleEditor}</option>
                    <option value="viewer">{t.partnersRoleViewer}</option>
                  </select>
                  <button
                    onClick={() => handleRemove(m.id, m.email)}
                    className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 hover:bg-rose-500/20"
                    title={t.partnersRemoveTitle}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-[#627064] uppercase">
                  {m.role === 'editor' ? <ShieldCheck className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {roleLabel(m.role)}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Invite form (owner only) */}
      {isBudgetOwner ? (
        <form onSubmit={handleInvite} className="space-y-2 pt-1">
          <div className="text-[10px] font-mono font-bold text-[#627064] uppercase">{t.partnersInviteHeading}</div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.partnersEmailPlaceholder}
              className="flex-1 bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-4 py-2.5 text-sm text-[#1E2922] focus:outline-none focus:ring-2 focus:ring-[#28372B]"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as PartnerRole)}
              className="bg-[#EAE5DC] border border-[#DCD5C8] rounded-2xl px-3 py-2.5 text-sm font-bold text-[#1E2922]"
              title={t.partnersRoleTitle}
            >
              <option value="editor">{t.partnersEditorDesc}</option>
              <option value="viewer">{t.partnersViewerDesc}</option>
            </select>
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2.5 rounded-2xl bg-[#28372B] hover:bg-[#1F2B21] disabled:opacity-60 text-amber-100 font-bold text-xs flex items-center justify-center gap-2"
            >
              <MailPlus className="w-4 h-4" />
              {busy ? t.partnersSending : t.partnersSendInvite}
            </button>
          </div>
          <p className="text-[11px] text-[#78857A]">
            {t.partnersInviteHelp1}
          </p>
          <p className="text-[11px] text-[#78857A]">
            {t.partnersInviteHelp2}
          </p>
        </form>
      ) : (
        <p className="text-[11px] font-mono text-[#78857A]">{t.partnersOwnerOnlyNote}</p>
      )}

      {inviteLink && (
        <div className="p-3 rounded-2xl bg-[#28372B] text-amber-100 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-mono font-bold uppercase text-[10px] tracking-wider text-amber-200/80">
            <Link2 className="w-3.5 h-3.5" />
            <span>{t.partnersShareLinkTitle}</span>
          </div>
          <div className="break-all font-mono text-[11px] bg-black/20 rounded-xl px-3 py-2">{inviteLink}</div>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl bg-amber-100 text-[#28372B] font-bold text-[11px] flex items-center gap-1.5 hover:bg-amber-200"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t.partnersCopied : t.partnersCopyLink}
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
