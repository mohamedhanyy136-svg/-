import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Keyboard } from 'lucide-react';
import { Language } from '../types';
import { translations } from '../utils/translations';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  const shortcuts = [
    { key: t.spacebarHint, description: t.scGenerate },
    { key: 'L', description: t.scLockAll },
    { key: 'U', description: t.scUnlockAll },
    { key: 'C', description: t.scCopyHex },
    { key: 'S', description: t.scSaved },
    { key: 'E', description: t.scExport },
    { key: 'CMD + Z / CTRL + Z', description: t.scUndo },
    { key: 'CMD + Y / CTRL + Y', description: t.scRedo },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.shortcutsTitle}</h3>
            </div>
            <button
              onClick={onClose}
              id="close-shortcuts-modal-btn"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="my-4 space-y-2.5">
            {shortcuts.map((s, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs"
              >
                <span className="font-medium text-slate-700 dark:text-slate-300">{s.description}</span>
                <kbd className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-mono font-bold text-[10px]">
                  {s.key}
                </kbd>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              id="close-shortcuts-modal-footer-btn"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.gotIt}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
