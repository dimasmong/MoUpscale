import React, { useState } from 'react';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  Globe, 
  Layers, 
  Info, 
  HelpCircle, 
  Shield, 
  FileText, 
  Award, 
  Menu, 
  X 
} from 'lucide-react';

const GitHubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);
import { Language, TranslationDictionary } from '../../types';

interface HeaderProps {
  t: TranslationDictionary;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isDark: boolean;
  onThemeToggle: () => void;
  activeTab: 'workspace' | 'batch';
  onTabChange: (tab: 'workspace' | 'batch') => void;
  onOpenModal: (modal: 'about' | 'faq' | 'privacy' | 'terms' | 'credits') => void;
}

export const Header: React.FC<HeaderProps> = ({
  t,
  language,
  onLanguageChange,
  isDark,
  onThemeToggle,
  activeTab,
  onTabChange,
  onOpenModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3">
          <div 
            onClick={() => onTabChange('workspace')}
            className="flex items-center space-x-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FD8D14] to-[#FFA742] flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-white animate-pulse-subtle" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight text-light-text dark:text-dark-text flex items-center gap-1.5">
                MoUpscale
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  AI
                </span>
              </span>
              <p className="hidden sm:block text-xs text-light-text-secondary dark:text-dark-text-secondary font-medium">
                {t.app.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-light-surface-subtle dark:bg-dark-surface-subtle p-1 rounded-xl border border-light-border dark:border-dark-border">
          <button
            onClick={() => onTabChange('workspace')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === 'workspace'
                ? 'bg-white dark:bg-dark-surface text-primary shadow-sm'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            {t.nav.workspace}
          </button>
          <button
            onClick={() => onTabChange('batch')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
              activeTab === 'batch'
                ? 'bg-white dark:bg-dark-surface text-primary shadow-sm'
                : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
            }`}
          >
            <Layers className="w-4 h-4" />
            {t.nav.batch}
          </button>
        </nav>

        {/* Right side controls: Language, Theme, Info Modal links, GitHub */}
        <div className="hidden lg:flex items-center space-x-2">
          {/* Information Links */}
          <button
            onClick={() => onOpenModal('about')}
            className="p-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle transition-colors"
            title={t.nav.about}
            aria-label={t.nav.about}
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenModal('faq')}
            className="p-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle transition-colors"
            title={t.nav.faq}
            aria-label={t.nav.faq}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenModal('credits')}
            className="p-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text hover:bg-light-surface-subtle dark:hover:bg-dark-surface-subtle transition-colors"
            title={t.nav.credits}
            aria-label={t.nav.credits}
          >
            <Award className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-light-border dark:bg-dark-border mx-1" />

          {/* Language Toggle */}
          <div className="flex items-center bg-light-surface-subtle dark:bg-dark-surface-subtle rounded-lg p-0.5 border border-light-border dark:border-dark-border text-xs font-semibold">
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded-md transition-colors ${
                language === 'en'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
              }`}
              aria-label="Switch to English"
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('id')}
              className={`px-2 py-1 rounded-md transition-colors ${
                language === 'id'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text'
              }`}
              aria-label="Beralih ke Bahasa Indonesia"
            >
              ID
            </button>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text bg-light-surface-subtle dark:bg-dark-surface-subtle border border-light-border dark:border-dark-border transition-colors"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* GitHub link */}
          <a
            href="https://github.com/dimasmong/MoUpscale"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text bg-light-surface-subtle dark:bg-dark-surface-subtle border border-light-border dark:border-dark-border transition-colors"
            title="GitHub Repository"
            aria-label="GitHub Repository"
          >
            <GitHubIcon className="w-4 h-4" />
          </a>
        </div>

        {/* Mobile controls & hamburger button */}
        <div className="flex items-center space-x-2 lg:hidden">
          {/* Quick theme toggle for mobile */}
          <button
            onClick={onThemeToggle}
            className="p-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary bg-light-surface-subtle dark:bg-dark-surface-subtle border border-light-border dark:border-dark-border"
            aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text dark:hover:text-dark-text bg-light-surface-subtle dark:bg-dark-surface-subtle border border-light-border dark:border-dark-border"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-light-border dark:border-dark-border bg-light-surface/95 dark:bg-dark-surface/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onTabChange('workspace');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-center text-sm font-medium ${
                activeTab === 'workspace'
                  ? 'bg-primary text-white font-semibold'
                  : 'bg-light-surface-subtle dark:bg-dark-surface-subtle text-light-text dark:text-dark-text'
              }`}
            >
              {t.nav.workspace}
            </button>
            <button
              onClick={() => {
                onTabChange('batch');
                setMobileMenuOpen(false);
              }}
              className={`p-2.5 rounded-xl text-center text-sm font-medium ${
                activeTab === 'batch'
                  ? 'bg-primary text-white font-semibold'
                  : 'bg-light-surface-subtle dark:bg-dark-surface-subtle text-light-text dark:text-dark-text'
              }`}
            >
              {t.nav.batch}
            </button>
          </div>

          {/* Language selector on mobile */}
          <div className="flex items-center justify-between py-2 border-y border-light-border dark:border-dark-border">
            <span className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary flex items-center gap-2">
              <Globe className="w-4 h-4" /> Language
            </span>
            <div className="flex space-x-1">
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-3 py-1 rounded-md text-xs font-bold ${
                  language === 'en' ? 'bg-primary text-white' : 'bg-light-surface-subtle dark:bg-dark-surface-subtle'
                }`}
              >
                English
              </button>
              <button
                onClick={() => onLanguageChange('id')}
                className={`px-3 py-1 rounded-md text-xs font-bold ${
                  language === 'id' ? 'bg-primary text-white' : 'bg-light-surface-subtle dark:bg-dark-surface-subtle'
                }`}
              >
                Indonesia
              </button>
            </div>
          </div>

          {/* Information Links */}
          <div className="grid grid-cols-2 gap-2 text-sm text-light-text-secondary dark:text-dark-text-secondary">
            <button
              onClick={() => {
                onOpenModal('about');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 hover:text-primary flex items-center gap-2"
            >
              <Info className="w-4 h-4" /> {t.nav.about}
            </button>
            <button
              onClick={() => {
                onOpenModal('faq');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 hover:text-primary flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4" /> {t.nav.faq}
            </button>
            <button
              onClick={() => {
                onOpenModal('privacy');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 hover:text-primary flex items-center gap-2"
            >
              <Shield className="w-4 h-4" /> {t.nav.privacy}
            </button>
            <button
              onClick={() => {
                onOpenModal('terms');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 hover:text-primary flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> {t.nav.terms}
            </button>
            <button
              onClick={() => {
                onOpenModal('credits');
                setMobileMenuOpen(false);
              }}
              className="text-left py-1.5 hover:text-primary flex items-center gap-2"
            >
              <Award className="w-4 h-4" /> {t.nav.credits}
            </button>
            <a
              href="https://github.com/dimasmong/MoUpscale"
              target="_blank"
              rel="noopener noreferrer"
              className="text-left py-1.5 hover:text-primary flex items-center gap-2"
            >
              <GitHubIcon className="w-4 h-4" /> {t.nav.github}
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
