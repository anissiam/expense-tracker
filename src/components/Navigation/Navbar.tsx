import React, { useState } from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { CURRENCIES } from '../../data/currencies';
import { CurrencyCode } from '../../types';
import { Language } from '../../data/translations';
import {
  User,
  Sparkles,
  Lock,
  Globe,
  Palette,
  Calendar as CalendarIcon,
  ChevronDown
} from 'lucide-react';
import { ThemeSelectorModal } from '../Theme/ThemeSelectorModal';

interface NavbarProps {
  onOpenProfile: () => void;
  onOpenClosingModal: () => void;
  onOpenThemeModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenProfile,
  onOpenClosingModal,
  onOpenThemeModal,
}) => {
  const {
    user,
    currency,
    setCurrency,
    language,
    setLanguage,
    t,
  } = useExpense();

  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);

  // Dynamic Date string formatting
  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const formattedDate = today.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', dateOptions);
  const dayName = today.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'long' });

  return (
    <header className="bg-[#FAF8F5] border-b border-[#E3DDD3] px-4 py-3 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left / Motivational Tagline */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#28372B]/10 text-[#28372B] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#28372B]" />
          </div>
          <div>
            <div className="text-[11px] font-mono tracking-widest text-[#626F64] uppercase font-bold flex items-center gap-1.5">
              <span>{language === 'ar' ? 'صباح الخير، أنت قادر على تحقيق هذا!' : "GOOD MORNING, YOU'VE GOT THIS!"}</span>
            </div>
          </div>
        </div>

        {/* Right Bar Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Date Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAE5DC] border border-[#DCD5C8] text-xs font-mono font-bold text-[#354238]">
            <CalendarIcon className="w-3.5 h-3.5 text-[#28372B]" />
            <span>{formattedDate} • {dayName}</span>
          </div>

          {/* Theme Selector Palette Button */}
          <button
            onClick={() => {
              if (onOpenThemeModal) onOpenThemeModal();
              else setIsThemeModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#28372B] hover:bg-[#1F2B21] text-xs font-semibold text-amber-100 transition shadow-sm"
            title={t.themeOptions}
          >
            <Palette className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline font-bold text-amber-200">{t.themeOptions}</span>
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowLanguageDropdown(!showLanguageDropdown);
                setShowCurrencyDropdown(false);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#EAE5DC] hover:bg-[#E2DDD3] text-xs font-bold text-[#28372B] border border-[#DCD5C8] transition"
            >
              <Globe className="w-3.5 h-3.5 text-[#28372B]" />
              <span className="uppercase">{language}</span>
              <ChevronDown className="w-3 h-3 text-[#556056]" />
            </button>

            {showLanguageDropdown && (
              <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-36 rounded-2xl bg-[#28372B] border border-[#1F2B21] shadow-2xl p-2 z-50 space-y-1">
                <button
                  onClick={() => {
                    setLanguage('en');
                    setShowLanguageDropdown(false);
                  }}
                  className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    language === 'en' ? 'bg-amber-300/20 text-amber-200' : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>English</span>
                  <span className="text-[10px] text-amber-300/70">EN</span>
                </button>
                <button
                  onClick={() => {
                    setLanguage('ar');
                    setShowLanguageDropdown(false);
                  }}
                  className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                    language === 'ar' ? 'bg-amber-300/20 text-amber-200' : 'text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <span>العربية</span>
                  <span className="text-[10px] text-amber-300/70">AR</span>
                </button>
              </div>
            )}
          </div>

          {/* Currency Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCurrencyDropdown(!showCurrencyDropdown);
                setShowLanguageDropdown(false);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#EAE5DC] hover:bg-[#E2DDD3] text-xs font-bold text-[#28372B] border border-[#DCD5C8] transition"
            >
              <span>{CURRENCIES[currency]?.symbol || '$'}</span>
              <span className="uppercase">{currency}</span>
            </button>

            {showCurrencyDropdown && (
              <div className="absolute ltr:right-0 rtl:left-0 mt-2 w-48 rounded-2xl bg-[#28372B] border border-[#1F2B21] shadow-2xl p-2 z-50 max-h-60 overflow-y-auto space-y-1">
                {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
                  <button
                    key={code}
                    onClick={() => {
                      setCurrency(code);
                      setShowCurrencyDropdown(false);
                    }}
                    className={`w-full text-left rtl:text-right px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      currency === code ? 'bg-amber-300/20 text-amber-200' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span>{CURRENCIES[code].name}</span>
                    <span className="font-mono text-amber-300">{CURRENCIES[code].symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Monthly Closing Workflow Trigger */}
          <button
            onClick={onOpenClosingModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#28372B]/10 hover:bg-[#28372B]/20 text-[#28372B] border border-[#28372B]/20 font-bold text-xs transition"
            title={t.monthlyClosing}
          >
            <Lock className="w-3.5 h-3.5 text-[#28372B]" />
            <span className="hidden sm:inline">{t.closingBtn}</span>
          </button>

          {/* Profile Button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-[#28372B] text-amber-100 hover:bg-[#1F2B21] transition shadow-sm"
          >
            <div className="w-6 h-6 rounded-full bg-amber-200/20 text-amber-200 flex items-center justify-center font-bold text-xs">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-bold hidden sm:inline">{user.name}</span>
          </button>

        </div>
      </div>

      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </header>
  );
};
