import React, { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { translateDataName } from '../../data/categoryTranslations';
import { AccountWallet, AccountType, IncomingIncome, IncomingRecurrence } from '../../types';
import {
  Landmark,
  Wallet,
  Smartphone,
  Banknote,
  CreditCard,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  Trash2,
  Edit3,
  ArrowDownLeft,
  Building2,
  Tag,
  DollarSign,
  TrendingUp,
  X,
  Check,
  AlertCircle
} from 'lucide-react';

export const AccountsIncomingView: React.FC = () => {
  const {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    incomings,
    addIncoming,
    updateIncoming,
    deleteIncoming,
    markIncomingAsReceived,
    currency,
    t,
    language
  } = useExpense();

  // Modals state
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountWallet | null>(null);

  const [isIncomingModalOpen, setIsIncomingModalOpen] = useState(false);
  const [editingIncoming, setEditingIncoming] = useState<IncomingIncome | null>(null);

  const [receivingIncome, setReceivingIncome] = useState<IncomingIncome | null>(null);
  const [addToBudgetCycleIncome, setAddToBudgetCycleIncome] = useState(true);

  // Status Filter for Incomings
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'received'>('all');

  // Account Form state
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<AccountType>('bank');
  const [accBalance, setAccBalance] = useState('');
  const [accNumber, setAccNumber] = useState('');
  const [accNotes, setAccNotes] = useState('');

  // Incoming Form state
  const [incTitle, setIncTitle] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incDate, setIncDate] = useState('');
  const [incAccountId, setIncAccountId] = useState('');
  const [incCategory, setIncCategory] = useState('Salary');
  const [incRecurrence, setIncRecurrence] = useState<IncomingRecurrence>('monthly');
  const [incNotes, setIncNotes] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculations
  const totalAccountLiquidity = accounts.reduce((acc, a) => acc + a.balance, 0);
  const totalPendingInflow = incomings
    .filter((i) => i.status === 'pending')
    .reduce((acc, i) => acc + i.amount, 0);
  const totalReceivedInflow = incomings
    .filter((i) => i.status === 'received')
    .reduce((acc, i) => acc + i.amount, 0);

  // Filtered incomings
  const filteredIncomings = incomings.filter((inc) => {
    if (statusFilter === 'all') return true;
    return inc.status === statusFilter;
  });

  // Open Account Modal
  const handleOpenAccountModal = (acc?: AccountWallet) => {
    if (acc) {
      setEditingAccount(acc);
      setAccName(acc.name);
      setAccType(acc.type);
      setAccBalance(acc.balance.toString());
      setAccNumber(acc.accountNumber || '');
      setAccNotes(acc.notes || '');
    } else {
      setEditingAccount(null);
      setAccName('');
      setAccType('bank');
      setAccBalance('');
      setAccNumber('');
      setAccNotes('');
    }
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName.trim()) return;

    const numericBalance = parseFloat(accBalance) || 0;

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name: accName.trim(),
        type: accType,
        balance: numericBalance,
        accountNumber: accNumber.trim() || undefined,
        notes: accNotes.trim() || undefined,
      });
    } else {
      addAccount({
        name: accName.trim(),
        type: accType,
        balance: numericBalance,
        accountNumber: accNumber.trim() || undefined,
        color: accType === 'bank' ? 'emerald' : accType === 'wallet' ? 'blue' : 'amber',
        icon: accType === 'bank' ? 'Building2' : accType === 'wallet' ? 'Wallet' : 'Banknote',
        notes: accNotes.trim() || undefined,
      });
    }

    setIsAccountModalOpen(false);
  };

  // Open Incoming Modal
  const handleOpenIncomingModal = (inc?: IncomingIncome) => {
    if (inc) {
      setEditingIncoming(inc);
      setIncTitle(inc.title);
      setIncAmount(inc.amount.toString());
      setIncDate(inc.expectedDate);
      setIncAccountId(inc.accountId || '');
      setIncCategory(inc.category);
      setIncRecurrence(inc.recurrence);
      setIncNotes(inc.notes || '');
    } else {
      setEditingIncoming(null);
      setIncTitle('');
      setIncAmount('');
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 7);
      setIncDate(defaultDate.toISOString().split('T')[0]);
      setIncAccountId(accounts[0]?.id || '');
      setIncCategory('Salary');
      setIncRecurrence('monthly');
      setIncNotes('');
    }
    setIsIncomingModalOpen(true);
  };

  const handleSaveIncoming = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incTitle.trim() || !incAmount) return;

    const numericAmount = parseFloat(incAmount) || 0;

    if (editingIncoming) {
      updateIncoming(editingIncoming.id, {
        title: incTitle.trim(),
        amount: numericAmount,
        expectedDate: incDate,
        accountId: incAccountId || undefined,
        category: incCategory,
        recurrence: incRecurrence,
        notes: incNotes.trim() || undefined,
      });
    } else {
      addIncoming({
        title: incTitle.trim(),
        amount: numericAmount,
        expectedDate: incDate,
        accountId: incAccountId || undefined,
        category: incCategory,
        recurrence: incRecurrence,
        notes: incNotes.trim() || undefined,
      });
    }

    setIsIncomingModalOpen(false);
  };

  const handleConfirmReceive = () => {
    if (!receivingIncome) return;
    markIncomingAsReceived(receivingIncome.id, addToBudgetCycleIncome);
    setReceivingIncome(null);
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return Building2;
      case 'wallet':
        return Wallet;
      case 'cash':
        return Banknote;
      case 'crypto':
        return CreditCard;
      default:
        return Landmark;
    }
  };

  const getAccountTypeLabel = (type: AccountType) => {
    switch (type) {
      case 'bank':
        return t.accountTypeBank;
      case 'wallet':
        return t.accountTypeWallet;
      case 'cash':
        return t.accountTypeCash;
      case 'crypto':
        return t.accountTypeCrypto;
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-[#28372B] text-amber-100 p-5 sm:p-6 rounded-3xl border border-[#1F2B21] shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-amber-400/10 text-amber-300 border border-amber-300/20">
              <Landmark className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono tracking-widest text-amber-200/80 uppercase">
              {t.accountsModuleEyebrow}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-amber-100">
            {t.incomingAndAccounts}
          </h1>
          <p className="text-xs sm:text-sm text-amber-200/80 mt-1 max-w-xl">
            {t.incomingDesc}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => handleOpenAccountModal()}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-200 hover:bg-amber-100 text-[#1E2B21] text-xs font-bold rounded-2xl transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t.addAccountBtn}</span>
          </button>

          <button
            onClick={() => handleOpenIncomingModal()}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-emerald-50 text-xs font-bold rounded-2xl transition border border-emerald-500/30 shadow-sm"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>{t.addIncomingBtn}</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Bank Liquidity */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E3DDD3] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#627064] uppercase tracking-wider mb-1">
              {t.totalBankBalances}
            </p>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1E2922]">
              {formatCurrency(totalAccountLiquidity)}
            </h3>
            <span className="inline-block mt-1 text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md font-semibold">
              {t.activeAccountsSuffix.replace('{n}', String(accounts.length))}
            </span>
          </div>
          <div className="p-3 bg-emerald-100/70 text-emerald-800 rounded-2xl border border-emerald-200/60">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        {/* Expected Pending Inflows */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E3DDD3] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#627064] uppercase tracking-wider mb-1">
              {t.totalPendingIncome}
            </p>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-amber-800">
              {formatCurrency(totalPendingInflow)}
            </h3>
            <span className="inline-block mt-1 text-[11px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md font-semibold">
              {incomings.filter((i) => i.status === 'pending').length} {t.pendingDepositsSuffix}
            </span>
          </div>
          <div className="p-3 bg-amber-100/70 text-amber-800 rounded-2xl border border-amber-200/60">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Total Received Inflows */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#E3DDD3] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-[#627064] uppercase tracking-wider mb-1">
              {t.totalReceivedIncome}
            </p>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1E2922]">
              {formatCurrency(totalReceivedInflow)}
            </h3>
            <span className="inline-block mt-1 text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md font-semibold">
              {incomings.filter((i) => i.status === 'received').length} {t.receivedDepositsSuffix}
            </span>
          </div>
          <div className="p-3 bg-emerald-100/70 text-emerald-800 rounded-2xl border border-emerald-200/60">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SECTION 1: Banks & Digital Wallets Grid */}
      <div className="p-5 rounded-3xl bg-[#FAF8F5] border border-[#E3DDD3] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E3DDD3] pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#28372B]" />
            <h2 className="font-serif text-lg font-bold text-[#1E2922]">
              {t.accountsSectionTitle}
            </h2>
          </div>
          <button
            onClick={() => handleOpenAccountModal()}
            className="flex items-center gap-1.5 text-xs font-bold text-[#28372B] hover:text-[#1F2B21] bg-[#EAE5DC] hover:bg-[#E2DDD3] px-3 py-1.5 rounded-xl transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addAccountBtn}</span>
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="p-8 text-center bg-[#F3EFEA] rounded-2xl border border-dashed border-[#DCD5C8]">
            <Wallet className="w-10 h-10 text-[#8A968C] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#627064]">
              {t.emptyAccountsMessage}
            </p>
            <button
              onClick={() => handleOpenAccountModal()}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-100 bg-[#28372B] px-4 py-2 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addAccountBtn}</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {accounts.map((acc) => {
              const IconComponent = getAccountIcon(acc.type);
              return (
                <div
                  key={acc.id}
                  className="p-4 rounded-2xl bg-[#F3EFEA] border border-[#E3DDD3] hover:border-[#28372B]/40 transition flex flex-col justify-between shadow-2xs group relative"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-[#28372B] text-amber-100 shadow-2xs">
                          <IconComponent className="w-4 h-4" />
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-[#1E2922] truncate max-w-[130px]">
                            {acc.name}
                          </h4>
                          <span className="text-[10px] font-mono font-semibold text-[#627064] block">
                            {getAccountTypeLabel(acc.type)}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => handleOpenAccountModal(acc)}
                          className="p-1 text-[#627064] hover:text-[#1E2922] hover:bg-[#EAE5DC] rounded-lg transition"
                          title={t.editAccountTitleAttr}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteAccount(acc.id)}
                          className="p-1 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                          title={t.deleteAccountTitleAttr}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {acc.accountNumber && (
                      <div className="text-[11px] font-mono text-[#526054] bg-[#EAE5DC]/80 px-2.5 py-1 rounded-lg truncate mb-3 border border-[#DCD5C8]/60">
                        {acc.accountNumber}
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#E3DDD3]/80 flex items-center justify-between mt-2">
                    <span className="text-[10px] font-mono text-[#627064] uppercase font-bold">
                      {t.accountBalanceLabel}
                    </span>
                    <span className="font-serif text-base font-bold text-[#1E2922]">
                      {formatCurrency(acc.balance)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Future & Scheduled Incoming Income */}
      <div className="p-5 rounded-3xl bg-[#FAF8F5] border border-[#E3DDD3] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#E3DDD3] pb-3">
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="w-5 h-5 text-emerald-800" />
            <h2 className="font-serif text-lg font-bold text-[#1E2922]">
              {t.incomingsSectionTitle}
            </h2>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#EAE5DC] p-1 rounded-2xl border border-[#DCD5C8] text-xs font-semibold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-xl transition ${
                statusFilter === 'all'
                  ? 'bg-[#28372B] text-amber-100 font-bold shadow-2xs'
                  : 'text-[#526054] hover:text-[#1E2922]'
              }`}
            >
              {t.filterAllLabel} ({incomings.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-xl transition flex items-center gap-1 ${
                statusFilter === 'pending'
                  ? 'bg-[#28372B] text-amber-100 font-bold shadow-2xs'
                  : 'text-[#526054] hover:text-[#1E2922]'
              }`}
            >
              <Clock className="w-3 h-3 text-amber-500" />
              <span>{t.filterPendingLabel}</span>
              <span>({incomings.filter((i) => i.status === 'pending').length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('received')}
              className={`px-3 py-1 rounded-xl transition flex items-center gap-1 ${
                statusFilter === 'received'
                  ? 'bg-[#28372B] text-amber-100 font-bold shadow-2xs'
                  : 'text-[#526054] hover:text-[#1E2922]'
              }`}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>{t.filterReceivedLabel}</span>
              <span>({incomings.filter((i) => i.status === 'received').length})</span>
            </button>
          </div>
        </div>

        {/* Incoming Items List */}
        {filteredIncomings.length === 0 ? (
          <div className="p-8 text-center bg-[#F3EFEA] rounded-2xl border border-dashed border-[#DCD5C8]">
            <Clock className="w-10 h-10 text-[#8A968C] mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#627064]">
              {t.emptyIncomingsMessage}
            </p>
            <button
              onClick={() => handleOpenIncomingModal()}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-50 bg-emerald-800 px-4 py-2 rounded-xl"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addIncomingBtn}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredIncomings.map((inc) => {
              const linkedAccount = accounts.find((a) => a.id === inc.accountId);
              const isPending = inc.status === 'pending';

              return (
                <div
                  key={inc.id}
                  className={`p-4 rounded-2xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    isPending
                      ? 'bg-[#F3EFEA] border-[#E3DDD3] hover:border-amber-400/60'
                      : 'bg-emerald-50/40 border-emerald-200/80'
                  }`}
                >
                  {/* Left Info */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`p-2.5 rounded-2xl border shrink-0 ${
                        isPending
                          ? 'bg-amber-100/80 text-amber-800 border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {isPending ? <Clock className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-sm text-[#1E2922] truncate">
                          {inc.title}
                        </h3>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#EAE5DC] text-[#4A554C]">
                          {translateDataName(inc.category, language)}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#EAE5DC]/80 text-[#627064]">
                          {translateDataName(inc.recurrence, language)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#627064]">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3.5 h-3.5 text-[#8A968C]" />
                          <span>
                            {t.expectedDatePrefix} {inc.expectedDate}
                          </span>
                        </span>

                        {linkedAccount && (
                          <span className="flex items-center gap-1 font-mono font-semibold text-[#28372B]">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{linkedAccount.name}</span>
                          </span>
                        )}

                        {inc.notes && (
                          <span className="text-[11px] text-[#78857A] italic truncate max-w-xs">
                            "{inc.notes}"
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Amount & Status Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-[#E3DDD3]">
                    <div className="text-left rtl:text-right">
                      <div className="font-serif text-lg font-bold text-[#1E2922]">
                        +{formatCurrency(inc.amount)}
                      </div>
                      <div className="text-[10px] font-mono">
                        {isPending ? (
                          <span className="text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-md">
                            {t.pendingInflowBadge}
                          </span>
                        ) : (
                          <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">
                            {t.depositedBadge.replace('{date}', inc.receivedDate || '')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isPending && (
                        <button
                          onClick={() => setReceivingIncome(inc)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-emerald-50 text-xs font-bold rounded-xl transition shadow-2xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{t.markReceivedBtn}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenIncomingModal(inc)}
                        className="p-1.5 text-[#627064] hover:text-[#1E2922] hover:bg-[#EAE5DC] rounded-xl transition"
                        title={t.editEntryTitleAttr}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteIncoming(inc.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-xl transition"
                        title={t.deleteEntryTitleAttr}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: Add/Edit Account Wallet */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 text-[#1E2922]">
            <div className="flex items-center justify-between border-b border-[#E3DDD3] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#28372B]" />
                <h3 className="font-serif text-lg font-bold">
                  {editingAccount ? t.editAccountModalTitle : t.addAccountModalTitle}
                </h3>
              </div>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="p-1 rounded-xl text-[#627064] hover:bg-[#EAE5DC] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#526054] mb-1">
                  {t.accountNameLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  placeholder={t.accountNamePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3EFEA] border border-[#E3DDD3] text-xs font-semibold focus:outline-none focus:border-[#28372B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#526054] mb-1">
                    {t.accountTypeLabel}
                  </label>
                  <select
                    value={accType}
                    onChange={(e) => setAccType(e.target.value as AccountType)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3EFEA] border border-[#E3DDD3] text-xs font-semibold focus:outline-none focus:border-[#28372B]"
                  >
                    <option value="bank">{t.accountTypeBank}</option>
                    <option value="wallet">{t.accountTypeWallet}</option>
                    <option value="cash">{t.accountTypeCash}</option>
                    <option value="crypto">{t.accountTypeCrypto}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#526054] mb-1">
                    {t.currentBalanceLabel} ({currency})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={accBalance}
                    onChange={(e) => setAccBalance(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3EFEA] border border-[#E3DDD3] text-xs font-semibold focus:outline-none focus:border-[#28372B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#526054] mb-1">
                  {t.accountNumberLabel}
                </label>
                <input
                  type="text"
                  value={accNumber}
                  onChange={(e) => setAccNumber(e.target.value)}
                  placeholder={t.accountNumberPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3EFEA] border border-[#E3DDD3] text-xs font-mono focus:outline-none focus:border-[#28372B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#526054] mb-1">
                  {t.notes}
                </label>
                <textarea
                  rows={2}
                  value={accNotes}
                  onChange={(e) => setAccNotes(e.target.value)}
                  placeholder={t.accountNotesPlaceholder}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F3EFEA] border border-[#E3DDD3] text-xs focus:outline-none focus:border-[#28372B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E3DDD3]">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#627064] hover:bg-[#EAE5DC] rounded-xl transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#28372B] hover:bg-[#1F2B21] text-amber-100 text-xs font-bold rounded-xl transition shadow-sm"
                >
                  {t.saveAccountBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add/Edit Scheduled Future Income */}
      {isIncomingModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 text-[#1E2922]">
            <div className="flex items-center justify-between border-b border-[#E3DDD3] pb-3">
              <div className="flex items-center gap-2">
                <ArrowDownLeft className="w-5 h-5 text-emerald-800" />
                <h3 className="font-serif text-lg font-bold">
                  {editingIncoming ? t.editIncomingModalTitle : t.addIncomingModalTitle}
                </h3>
              </div>
              <button
                onClick={() => setIsIncomingModalOpen(false)}
                className="p-1 rounded-xl text-[#627064] hover:bg-[#EAE5DC] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveIncoming} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#526054] mb-1">
                  {t.incomeTitleLabel} *
                </label>
                <input
                  type="text"
                  required
                  value={incTitle}
                  onChange={(e) => setIncTitle(e.target.value)}
                  placeholder={t.incomeTitlePlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3EFEA] border border-[#E3DDD3] text-xs font-semibold focus:outline-none focus:border-[#28372B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#526054] mb-1">
                    {t.expectedAmountLabel} ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={incAmount}
                    onChange={(e) => setIncAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3EFEA] border border-[#E3DDD3] text-xs font-semibold focus:outline-none focus:border-[#28372B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#526054] mb-1">
                    {t.expectedDateLabel} *
                  </label>
                  <input
                    type="date"
                    required
                    value={incDate}
                    onChange={(e) => setIncDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3EFEA] border border-[#E3DDD3] text-xs font-semibold focus:outline-none focus:border-[#28372B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#526054] mb-1">
                    {t.destinationAccountLabel}
                  </label>
                  <select
                    value={incAccountId}
                    onChange={(e) => setIncAccountId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3EFEA] border border-[#E3DDD3] text-xs font-semibold focus:outline-none focus:border-[#28372B]"
                  >
                    <option value="">{t.unlinkedAccountOption}</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({formatCurrency(acc.balance)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#526054] mb-1">
                    {t.recurrenceLabel}
                  </label>
                  <select
                    value={incRecurrence}
                    onChange={(e) => setIncRecurrence(e.target.value as IncomingRecurrence)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3EFEA] border border-[#E3DDD3] text-xs font-semibold focus:outline-none focus:border-[#28372B]"
                  >
                    <option value="once">{t.recurrenceOnce}</option>
                    <option value="monthly">{t.recurrenceMonthly}</option>
                    <option value="weekly">{t.recurrenceWeekly}</option>
                    <option value="yearly">{t.recurrenceYearly}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#526054] mb-1">
                  {t.incomeCategoryLabel}
                </label>
                <select
                  value={incCategory}
                  onChange={(e) => setIncCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#F3EFEA] border border-[#E3DDD3] text-xs font-semibold focus:outline-none focus:border-[#28372B]"
                >
                  <option value="Salary">{t.incomeCategorySalary}</option>
                  <option value="Freelance">{t.incomeCategoryFreelance}</option>
                  <option value="Investment">{t.incomeCategoryInvestment}</option>
                  <option value="Business">{t.incomeCategoryBusiness}</option>
                  <option value="Sale">{t.incomeCategorySale}</option>
                  <option value="Gift">{t.incomeCategoryGift}</option>
                  <option value="Other">{t.incomeCategoryOther}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#526054] mb-1">
                  {t.notes}
                </label>
                <textarea
                  rows={2}
                  value={incNotes}
                  onChange={(e) => setIncNotes(e.target.value)}
                  placeholder={t.incomeNotesPlaceholder}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F3EFEA] border border-[#E3DDD3] text-xs focus:outline-none focus:border-[#28372B]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E3DDD3]">
                <button
                  type="button"
                  onClick={() => setIsIncomingModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#627064] hover:bg-[#EAE5DC] rounded-xl transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-50 text-xs font-bold rounded-xl transition shadow-sm"
                >
                  {t.saveIncomeScheduleBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Mark Received & Deposit Confirmation */}
      {receivingIncome && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-[#FAF8F5] border border-[#E3DDD3] rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-5 text-[#1E2922]">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold">
                  {t.confirmIncomeReceiptTitle}
                </h3>
                <p className="text-xs text-[#627064]">
                  {receivingIncome.title} (+{formatCurrency(receivingIncome.amount)})
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F3EFEA] border border-[#E3DDD3] space-y-3">
              <div className="text-xs text-[#526054]">
                {t.confirmReceiptDesc}
              </div>

              {receivingIncome.accountId ? (
                <div className="text-xs font-bold text-[#28372B] bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200/80 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-800 shrink-0" />
                  <span>
                    {t.depositIntoAccount.replace(
                      '{name}',
                      accounts.find((a) => a.id === receivingIncome.accountId)?.name || ''
                    )}
                  </span>
                </div>
              ) : (
                <div className="text-xs text-amber-800 bg-amber-100/60 p-2.5 rounded-xl border border-amber-200/80 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-800 shrink-0" />
                  <span>
                    {t.notLinkedToAccountNote}
                  </span>
                </div>
              )}

              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={addToBudgetCycleIncome}
                  onChange={(e) => setAddToBudgetCycleIncome(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-800 focus:ring-emerald-700"
                />
                <span className="text-xs font-semibold text-[#1E2922]">
                  {t.addToBudgetIncomeCheckbox}
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReceivingIncome(null)}
                className="px-4 py-2 text-xs font-bold text-[#627064] hover:bg-[#EAE5DC] rounded-xl transition"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmReceive}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-emerald-50 text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{t.confirmDepositBtn}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
