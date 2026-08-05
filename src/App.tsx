import React, { useState, useEffect, useCallback } from 'react';
import { ColorItem, HarmonyMode, SavedPalette, ToastNotification, Language } from './types';
import {
  generatePalette,
  createColorItem,
  decodePaletteFromHash,
  encodePaletteToHash,
} from './utils/colorUtils';
import { translations } from './utils/translations';
import { Header } from './components/Header';
import { ColorCard } from './components/ColorCard';
import { ColorPickerModal } from './components/ColorPickerModal';
import { ExportModal } from './components/ExportModal';
import { SavedPalettesModal } from './components/SavedPalettesModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { AiPaletteModal } from './components/AiPaletteModal';
import { ToastContainer } from './components/Toast';

export default function App() {
  // Language State
  const [lang, setLang] = useState<Language>(() => {
    const stored = localStorage.getItem('chromapulse_lang');
    if (stored === 'ar' || stored === 'en') return stored;
    return 'ar'; // Default to Arabic as user asked for Arabic/English site
  });

  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('chromapulse_dark_mode');
    if (stored !== null) return stored === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Palette State & History
  const [colors, setColors] = useState<ColorItem[]>(() => {
    const hash = window.location.hash;
    const fromHash = decodePaletteFromHash(hash, lang);
    if (fromHash) return fromHash;
    return generatePalette([], 'random', lang);
  });

  const [harmonyMode, setHarmonyMode] = useState<HarmonyMode>('random');
  const [history, setHistory] = useState<ColorItem[][]>([colors]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Saved Palettes in LocalStorage
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>(() => {
    const stored = localStorage.getItem('chromapulse_saved_palettes');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Modals & Toast State
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [activePickerColor, setActivePickerColor] = useState<ColorItem | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  const t = translations[lang];

  // Sync language attribute and dir on <html>
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('chromapulse_lang', lang);
  }, [lang]);

  // Sync dark mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('chromapulse_dark_mode', String(darkMode));
  }, [darkMode]);

  // Sync URL Hash when palette changes
  useEffect(() => {
    const hash = encodePaletteToHash(colors);
    window.history.replaceState(null, '', `#${hash}`);
  }, [colors]);

  // Toast Helper
  const addToast = useCallback((message: string, colorHex?: string, type: 'success' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, colorHex, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  // Update Palette helper (manages history)
  const pushNewPaletteState = useCallback(
    (newColors: ColorItem[]) => {
      setColors(newColors);
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [...sliced, newColors];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex]
  );

  // Core Actions
  const handleGenerate = useCallback(() => {
    const nextColors = generatePalette(colors, harmonyMode, lang);
    pushNewPaletteState(nextColors);
  }, [colors, harmonyMode, lang, pushNewPaletteState]);

  const handleToggleLock = useCallback((id: string) => {
    setColors((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isLocked: !c.isLocked } : c))
    );
  }, []);

  const handleLockAll = useCallback(() => {
    setColors((prev) => prev.map((c) => ({ ...c, isLocked: true })));
    addToast(t.allLockedToast, undefined, 'info');
  }, [addToast, t.allLockedToast]);

  const handleUnlockAll = useCallback(() => {
    setColors((prev) => prev.map((c) => ({ ...c, isLocked: false })));
    addToast(t.allUnlockedToast, undefined, 'info');
  }, [addToast, t.allUnlockedToast]);

  const handleMoveColor = useCallback((index: number, direction: 'left' | 'right') => {
    setColors((prev) => {
      const next = [...prev];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  }, []);

  const handleCopy = useCallback(
    (text: string, label: string, hex?: string) => {
      if (text) {
        navigator.clipboard.writeText(text);
      }
      addToast(`${label}`, hex);
    },
    [addToast]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIdx = historyIndex - 1;
      setHistoryIndex(newIdx);
      setColors(history[newIdx]);
    }
  }, [history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIdx = historyIndex + 1;
      setHistoryIndex(newIdx);
      setColors(history[newIdx]);
    }
  }, [history, historyIndex]);

  const handleSaveCurrentPalette = (name: string) => {
    const newEntry: SavedPalette = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      colors: colors.map((c) => c.hex),
      createdAt: Date.now(),
    };
    const updated = [newEntry, ...savedPalettes];
    setSavedPalettes(updated);
    localStorage.setItem('chromapulse_saved_palettes', JSON.stringify(updated));
    addToast(`${t.savedPaletteToast} "${name}"!`);
  };

  const handleDeleteSavedPalette = (id: string) => {
    const updated = savedPalettes.filter((p) => p.id !== id);
    setSavedPalettes(updated);
    localStorage.setItem('chromapulse_saved_palettes', JSON.stringify(updated));
    addToast(t.deletedPaletteToast, undefined, 'info');
  };

  const handleLoadPaletteHexes = (hexes: string[]) => {
    const loaded = hexes.map((hex, idx) =>
      createColorItem(hex, false, colors[idx]?.id, lang)
    );
    pushNewPaletteState(loaded);
    addToast(t.loadedPaletteToast);
  };

  const handleSaveColorFromPicker = (updatedColor: ColorItem) => {
    setColors((prev) => prev.map((c) => (c.id === updatedColor.id ? updatedColor : c)));
    addToast(`${t.copiedCodeToast} ${updatedColor.name}`, updatedColor.hex);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut keys if user is typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleGenerate();
      } else if (e.key === 'l' || e.key === 'L') {
        handleLockAll();
      } else if (e.key === 'u' || e.key === 'U') {
        handleUnlockAll();
      } else if (e.key === 'c' || e.key === 'C') {
        const allHexes = colors.map((c) => c.hex).join(', ');
        navigator.clipboard.writeText(allHexes);
        addToast(t.copiedAllHexesToast);
      } else if (e.key === 's' || e.key === 'S') {
        setIsSavedOpen(true);
      } else if (e.key === 'e' || e.key === 'E') {
        setIsExportOpen(true);
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'z' || e.key === 'Z')) {
        if (e.shiftKey) handleRedo();
        else handleUndo();
      } else if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || e.key === 'Y')) {
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    colors,
    handleGenerate,
    handleLockAll,
    handleUnlockAll,
    handleUndo,
    handleRedo,
    addToast,
    t.copiedAllHexesToast,
  ]);

  const areAllLocked = colors.every((c) => c.isLocked);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Navbar Header */}
      <Header
        onGenerate={handleGenerate}
        harmonyMode={harmonyMode}
        onChangeHarmony={(mode) => {
          setHarmonyMode(mode);
          const next = generatePalette(colors, mode, lang);
          pushNewPaletteState(next);
        }}
        onLockAll={handleLockAll}
        onUnlockAll={handleUnlockAll}
        areAllLocked={areAllLocked}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenSaved={() => setIsSavedOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenAiModal={() => setIsAiOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))}
      />

      {/* Main Palette Viewport: Responsive 5 Columns Grid on Desktop, Stacked Cards on Mobile */}
      <main className="flex-1 flex flex-col md:flex-row p-3 md:p-6 gap-3 md:gap-4 max-w-[1600px] w-full mx-auto">
        {colors.map((color, index) => (
          <ColorCard
            key={color.id}
            color={color}
            index={index}
            total={colors.length}
            onToggleLock={handleToggleLock}
            onCopy={handleCopy}
            onOpenPicker={(c) => setActivePickerColor(c)}
            onMove={handleMoveColor}
            lang={lang}
          />
        ))}
      </main>

      {/* Quick Instructional Hint Bar */}
      <footer className="py-2.5 px-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200/50 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-2 max-w-[1600px] w-full mx-auto">
        <div className="flex items-center gap-2">
          <span>{t.footerPress}</span>
          <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono font-bold text-[10px]">
            {t.spacebarHint}
          </kbd>
          <span>{t.footerToGenerate}</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>{t.footerCopyHint}</span>
          <span>•</span>
          <span>{t.footerLockHint}</span>
        </div>
      </footer>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} />

      {/* Color Adjust Modal */}
      <ColorPickerModal
        color={activePickerColor}
        onClose={() => setActivePickerColor(null)}
        onSave={handleSaveColorFromPicker}
        onCopy={handleCopy}
        lang={lang}
      />

      {/* Export Modal */}
      <ExportModal
        colors={colors}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onCopy={handleCopy}
        lang={lang}
      />

      {/* Saved Palettes Modal */}
      <SavedPalettesModal
        currentColors={colors}
        savedPalettes={savedPalettes}
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        onSaveCurrent={handleSaveCurrentPalette}
        onLoadPalette={handleLoadPaletteHexes}
        onDeletePalette={handleDeleteSavedPalette}
        onCopy={handleCopy}
        lang={lang}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
        lang={lang}
      />

      {/* AI Palette Modal */}
      <AiPaletteModal
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(false)}
        onApplyPalette={handleLoadPaletteHexes}
        onToast={(msg) => addToast(msg, undefined, 'info')}
        lang={lang}
      />
    </div>
  );
}
