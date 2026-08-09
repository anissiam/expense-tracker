import React from 'react';
import { useExpense } from '../../context/ExpenseContext';
import { ThemeId } from '../../types';
import { Palette, Check, Moon, Sun, Shield, Sparkles, X } from 'lucide-react';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, t } = useExpense();

  if (!isOpen) return null;

  const themes: {
    id: ThemeId;
    title: string;
    desc: string;
    bgClass: string;
    cardClass: string;
    accentColor: string;
    badgeText: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'emerald_light',
      title: t.themeEmeraldLight || 'Minimalist Luxury (Forest & Sand)',
      desc: 'Editorial luxury layout with forest green accents, warm sand cards, and serif typography.',
      bgClass: 'bg-[#FAF8F5]',
      cardClass: 'bg-[#EAE5DC] border-[#DCD5C8]',
      accentColor: 'bg-[#28372B]',
      badgeText: 'Paper Luxury',
      icon: <Sun className="w-5 h-5 text-[#28372B]" />,
    },
    {
      id: 'obsidian',
      title: t.themeObsidian,
      desc: 'Dark slate canvas with high contrast emerald and indigo accents.',
      bgClass: 'bg-[#020617]',
      cardClass: 'bg-slate-900 border-slate-700',
      accentColor: 'bg-emerald-500',
      badgeText: 'Dark Slate',
      icon: <Moon className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'sapphire',
      title: t.themeSapphire,
      desc: 'Deep royal navy blue terminal aesthetic with sapphire indigo highlights.',
      bgClass: 'bg-[#080e21]',
      cardClass: 'bg-[#0f1c3f] border-indigo-900',
      accentColor: 'bg-indigo-500',
      badgeText: 'Royal Navy',
      icon: <Shield className="w-5 h-5 text-indigo-400" />,
    },
    {
      id: 'amber',
      title: t.themeAmber,
      desc: 'Warm charcoal dark palette with rich sunset amber gold indicators.',
      bgClass: 'bg-[#121214]',
      cardClass: 'bg-[#1c1c21] border-amber-900/40',
      accentColor: 'bg-amber-500',
      badgeText: 'Warm Sunset',
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2B21]/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#FAF8F5] border border-[#E3DDD3] w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8E2D7] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#28372B] border border-[#1F2B21] text-amber-200 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-[#1E2922]">{t.themeOptions}</h3>
              <p className="text-xs font-mono text-[#627064]">{t.selectTheme}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#627064] hover:text-[#1E2922] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themes.map((item) => {
            const isSelected = theme === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setTheme(item.id);
                }}
                className={`p-4 rounded-2xl border text-left rtl:text-right transition relative flex flex-col justify-between h-36 ${
                  isSelected
                    ? 'border-[#28372B] bg-[#28372B]/10 ring-2 ring-[#28372B]/30 shadow-xs'
                    : 'border-[#DCD5C8] bg-[#EAE5DC]/60 hover:bg-[#EAE5DC]'
                }`}
              >
                {/* Top bar with icon and check */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span className="text-xs font-mono font-bold text-[#1E2922]">{item.badgeText}</span>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-[#28372B] text-amber-100 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {/* Color swatches preview */}
                <div className="flex items-center gap-1.5 my-2">
                  <div className={`w-8 h-3 rounded-full ${item.bgClass} border border-[#DCD5C8]`} />
                  <div className={`w-8 h-3 rounded-full ${item.cardClass} border border-[#DCD5C8]`} />
                  <div className={`w-8 h-3 rounded-full ${item.accentColor}`} />
                </div>

                {/* Title & Desc */}
                <div>
                  <div className="text-xs font-serif font-bold text-[#1E2922] leading-tight">{item.title}</div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end pt-2 border-t border-[#E8E2D7]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-[#28372B] hover:bg-[#1F2B21] text-amber-100 text-xs font-serif font-bold shadow-md transition"
          >
            {t.saveSettingsBtn}
          </button>
        </div>

      </div>
    </div>
  );
};
