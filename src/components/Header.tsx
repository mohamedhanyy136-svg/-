import React from 'react';
import {
  Sparkles,
  Lock,
  Unlock,
  Undo2,
  Redo2,
  Download,
  Bookmark,
  Sun,
  Moon,
  Keyboard,
  Wand2,
  Languages,
} from 'lucide-react';
import { HarmonyMode, Language } from '../types';
import { translations } from '../utils/translations';

interface HeaderProps {
  onGenerate: () => void;
  harmonyMode: HarmonyMode;
  onChangeHarmony: (mode: HarmonyMode) => void;
  onLockAll: () => void;
  onUnlockAll: () => void;
  areAllLocked: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenExport: () => void;
  onOpenSaved: () => void;
  onOpenShortcuts: () => void;
  onOpenAiModal?: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  lang: Language;
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onGenerate,
  harmonyMode,
  onChangeHarmony,
  onLockAll,
  onUnlockAll,
  areAllLocked,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenExport,
  onOpenSaved,
  onOpenShortcuts,
  onOpenAiModal,
  darkMode,
  onToggleDarkMode,
  lang,
  onToggleLang,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 md:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Section: Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-pink-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              {t.appTitle}
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/50">
                {t.paletteGenerator}
              </span>
            </h1>
          </div>
        </div>

        {/* Center Section: Harmony Selector & Generate Main Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Harmony Mode Dropdown */}
          <div className="relative">
            <select
              value={harmonyMode}
              onChange={(e) => onChangeHarmony(e.target.value as HarmonyMode)}
              id="harmony-mode-select"
              title="Select Color Harmony Rule"
              className="appearance-none bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold px-3 py-2 pr-8 rounded-xl border border-slate-200 dark:border-slate-700/60 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer transition-colors"
            >
              <option value="random">{t.random}</option>
              <option value="analogous">{t.analogous}</option>
              <option value="monochromatic">{t.monochromatic}</option>
              <option value="triadic">{t.triadic}</option>
              <option value="complementary">{t.complementary}</option>
              <option value="split-complementary">{t.splitComplementary}</option>
              <option value="pastel">{t.pastel}</option>
              <option value="neon">{t.neon}</option>
              <option value="warm">{t.warm}</option>
              <option value="cool">{t.cool}</option>
            </select>
          </div>

          {/* Primary Action Button: Generate Palette */}
          <button
            onClick={onGenerate}
            id="generate-palette-btn"
            title={`${t.generate} (${t.spacebarHint})`}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white font-semibold text-xs md:text-sm shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span>{t.generate}</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white/20 rounded text-white/90">
              {t.spacebarHint}
            </kbd>
          </button>

          {/* AI Prompt Button (Optional Gemini assistant) */}
          {onOpenAiModal && (
            <button
              onClick={onOpenAiModal}
              id="ai-palette-btn"
              title={t.aiPalette}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-300 text-xs font-semibold border border-pink-200 dark:border-pink-800/40 transition-colors"
            >
              <Wand2 className="w-3.5 h-3.5 text-pink-500" />
              <span className="hidden sm:inline">{t.aiPalette}</span>
            </button>
          )}
        </div>

        {/* Right Section: Toolbar Controls */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Language Toggle Button */}
          <button
            onClick={onToggleLang}
            id="lang-toggle-btn"
            title="Switch Language / تغيير اللغة"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <Languages className="w-4 h-4" />
            <span>{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 my-auto mx-1" />

          {/* Undo / Redo */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            id="undo-btn"
            title={t.undo}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            id="redo-btn"
            title={t.redo}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 my-auto mx-1" />

          {/* Lock / Unlock All */}
          <button
            onClick={areAllLocked ? onUnlockAll : onLockAll}
            id="lock-all-btn"
            title={areAllLocked ? t.unlockAll : t.lockAll}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {areAllLocked ? <Lock className="w-4 h-4 text-amber-500" /> : <Unlock className="w-4 h-4" />}
          </button>

          {/* Saved Palettes */}
          <button
            onClick={onOpenSaved}
            id="saved-palettes-btn"
            title={t.savedPalettes}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* Export */}
          <button
            onClick={onOpenExport}
            id="export-btn"
            title={t.export}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Shortcuts Guide */}
          <button
            onClick={onOpenShortcuts}
            id="shortcuts-btn"
            title={t.shortcuts}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden md:block"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 my-auto mx-1" />

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={onToggleDarkMode}
            id="theme-toggle-btn"
            title={darkMode ? t.lightMode : t.darkMode}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
