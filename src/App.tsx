import React, { useState } from 'react';
import { ExpenseProvider, useExpense } from './context/ExpenseContext';
import { Navbar } from './components/Navigation/Navbar';
import { Sidebar, TabType } from './components/Navigation/Sidebar';
import { DashboardView } from './components/Dashboard/DashboardView';
import { MonthlyBudgetWizard } from './components/BudgetWizard/MonthlyBudgetWizard';
import { CategoryManagement } from './components/Categories/CategoryManagement';
import { ExpenseManager } from './components/Expenses/ExpenseManager';
import { BudgetTemplatesView } from './components/Templates/BudgetTemplatesView';
import { MonthlyClosingModal } from './components/ClosingWorkflow/MonthlyClosingModal';
import { SavingsVault } from './components/Savings/SavingsVault';
import { ReportsView } from './components/Reports/ReportsView';
import { SmartInsightsView } from './components/SmartInsights/SmartInsightsView';
import { UserProfileModal } from './components/Auth/UserProfileModal';
import { LoginView } from './components/Auth/LoginView';
import { InviteAcceptView } from './components/Partners/InviteAcceptView';
import { AccountsIncomingView } from './components/Accounts/AccountsIncomingView';

function AppContent() {
  const { isAuthenticated, isLoading } = useExpense();  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isClosingOpen, setIsClosingOpen] = useState(false);

  // Email deep link: /invite/:token or /?invite=:token (public, works logged out).
  const inviteToken =
    typeof window !== 'undefined'
      ? window.location.pathname.match(/\/invite\/([^/]+)/)?.[1] ||
        new URLSearchParams(window.location.search).get('invite')
      : null;

  if (inviteToken) {
    return <InviteAcceptView token={decodeURIComponent(inviteToken)} />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F3EFEA] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#28372B] mx-auto flex items-center justify-center animate-pulse">
            <span className="text-amber-200 font-bold">₪</span>
          </div>
          <p className="text-xs font-mono text-[#627064] uppercase tracking-widest">Loading your budget…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-[#F3EFEA] text-[#1E2922] flex flex-col font-sans-editorial selection:bg-[#28372B] selection:text-amber-100">
      
      {/* Top Header Navbar */}
      <Navbar
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenClosingModal={() => setIsClosingOpen(true)}
      />

      {/* Main Container Layout */}
      <div className="flex-1 max-w-[1400px] w-full mx-auto flex flex-col md:flex-row px-2 sm:px-4 py-2 gap-2">
        
        {/* Left Sidebar Menu */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Dynamic Content View Area */}
        <main className="flex-1 p-3 sm:p-5 overflow-y-auto bg-[#FAF8F5] rounded-3xl my-2 border border-[#E3DDD3] shadow-xs">
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigateToExpenses={() => setActiveTab('expenses')}
              onNavigateToWizard={() => setActiveTab('wizard')}
              onNavigateToCategories={() => setActiveTab('categories')}
            />
          )}

          {activeTab === 'wizard' && (
            <MonthlyBudgetWizard
              onNextStep={() => setActiveTab('categories')}
              onNavigateToTemplates={() => setActiveTab('templates')}
            />
          )}

          {activeTab === 'incoming' && <AccountsIncomingView />}

          {activeTab === 'categories' && <CategoryManagement />}

          {activeTab === 'expenses' && <ExpenseManager />}

          {activeTab === 'templates' && (
            <BudgetTemplatesView onApplied={() => setActiveTab('dashboard')} />
          )}

          {activeTab === 'closing' && (
            <div className="max-w-2xl mx-auto space-y-6 my-10">
              <div className="bg-[#FAF8F5] p-8 rounded-3xl border border-[#E3DDD3] text-center space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#28372B] text-amber-200 border border-[#1F2B21] mx-auto flex items-center justify-center font-bold text-xl">
                  🔒
                </div>
                <h2 className="text-xl font-serif font-bold text-[#1E2922]">Monthly Review & Closing Workflow</h2>
                <p className="text-xs text-[#526054] max-w-md mx-auto leading-relaxed">
                  Review planned vs actual performance, calculate category variances, and choose how unspent surplus rolls over into Savings Vault or next month.
                </p>
                <button
                  onClick={() => setIsClosingOpen(true)}
                  className="px-6 py-3 rounded-2xl bg-[#28372B] hover:bg-[#1F2B21] text-amber-100 font-bold text-xs shadow-md transition"
                >
                  Launch Closing Wizard
                </button>
              </div>
            </div>
          )}

          {activeTab === 'savings' && <SavingsVault />}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'insights' && <SmartInsightsView />}
        </main>

      </div>

      {/* Editorial Footer */}
      <footer className="border-t border-[#E3DDD3] bg-[#FAF8F5] py-3 text-center text-[10px] font-mono text-[#626F64] uppercase tracking-wider">
        MINIMAL FINANCIAL RESET PLANNER • DESIGN YOUR FREEDOM • SECURE LOCAL INSTANCE
      </footer>

      {/* Global Modals */}
      <UserProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      <MonthlyClosingModal isOpen={isClosingOpen} onClose={() => setIsClosingOpen(false)} />

    </div>
  );
}

export default function App() {
  return (
    <ExpenseProvider>
      <AppContent />
    </ExpenseProvider>
  );
}
