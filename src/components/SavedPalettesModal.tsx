import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bookmark, Trash2, Plus, Sparkles, Check, Share2 } from 'lucide-react';
import { ColorItem, SavedPalette, Language } from '../types';
import { translations } from '../utils/translations';

interface SavedPalettesModalProps {
  currentColors: ColorItem[];
  savedPalettes: SavedPalette[];
  isOpen: boolean;
  onClose: () => void;
  onSaveCurrent: (name: string) => void;
  onLoadPalette: (hexes: string[]) => void;
  onDeletePalette: (id: string) => void;
  onCopy: (text: string, label: string) => void;
  lang: Language;
}

const PRESET_PALETTES: { nameEn: string; nameAr: string; colors: string[] }[] = [
  { nameEn: 'Cyberpunk Neon', nameAr: 'نيون سايبربانك', colors: ['#050505', '#7928CA', '#FF0080', '#00DFD8', '#FFF000'] },
  { nameEn: 'Nordic Forest', nameAr: 'غابة نوردية', colors: ['#2D3A3A', '#394B43', '#5B7065', '#9BB0A5', '#C4D4CC'] },
  { nameEn: 'Sunset Horizon', nameAr: 'أفق الغروب', colors: ['#2B1E3A', '#6C224B', '#B42D45', '#E96843', '#FFB74D'] },
  { nameEn: 'Pastel Sorbet', nameAr: 'باستيل هادئ', colors: ['#FFB5E8', '#AFF8DB', '#BFFCC6', '#FFC6FF', '#FFFFD1'] },
  { nameEn: 'Minimal Charcoal', nameAr: 'رمادي عصري', colors: ['#0F172A', '#334155', '#64748B', '#94A3B8', '#F8FAFC'] },
  { nameEn: 'Warm Terracotta', nameAr: 'ترابي دافئ', colors: ['#4A2810', '#7C3F1D', '#B85B28', '#E28E58', '#F5C4A1'] },
];

export const SavedPalettesModal: React.FC<SavedPalettesModalProps> = ({
  currentColors,
  savedPalettes,
  isOpen,
  onClose,
  onSaveCurrent,
  onLoadPalette,
  onDeletePalette,
  onCopy,
  lang,
}) => {
  const [paletteName, setPaletteName] = useState('');
  const [activeTab, setActiveTab] = useState<'my' | 'presets'>('my');

  const t = translations[lang];

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paletteName.trim()) return;
    onSaveCurrent(paletteName.trim());
    setPaletteName('');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.savedAndPresetsTitle}</h3>
            </div>
            <button
              onClick={onClose}
              id="close-saved-modal-btn"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Save Current Section */}
          <form onSubmit={handleSave} className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">{t.saveActivePalette}</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder={t.paletteNamePlaceholder}
                value={paletteName}
                onChange={(e) => setPaletteName(e.target.value)}
                id="save-palette-name-input"
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={!paletteName.trim()}
                id="submit-save-palette-btn"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.save}</span>
              </button>
            </div>
          </form>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('my')}
              id="tab-my-palettes"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'my'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t.mySaved} ({savedPalettes.length})
            </button>
            <button
              onClick={() => setActiveTab('presets')}
              id="tab-preset-palettes"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'presets'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t.curatedPresets} ({PRESET_PALETTES.length})
            </button>
          </div>

          {/* Palettes Grid */}
          <div className="overflow-y-auto flex-1 my-4 pr-1 space-y-3">
            {activeTab === 'my' ? (
              savedPalettes.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Bookmark className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">{t.noSavedPalettes}</p>
                  <p className="text-[11px] text-slate-400">{t.saveFavoriteHint}</p>
                </div>
              ) : (
                savedPalettes.map((p) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 bg-slate-50/50 dark:bg-slate-800/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {p.name}
                      </span>
                      {/* Swatches */}
                      <div className="flex h-8 w-48 rounded-lg overflow-hidden border border-black/10">
                        {p.colors.map((hex, idx) => (
                          <div
                            key={idx}
                            style={{ backgroundColor: hex }}
                            className="flex-1"
                            title={hex}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => {
                          onLoadPalette(p.colors);
                          onClose();
                        }}
                        id={`load-palette-${p.id}`}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                      >
                        {t.apply}
                      </button>
                      <button
                        onClick={() => onDeletePalette(p.id)}
                        id={`delete-palette-${p.id}`}
                        title={t.deletePalette}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )
            ) : (
              PRESET_PALETTES.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 bg-slate-50/50 dark:bg-slate-800/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {lang === 'ar' ? p.nameAr : p.nameEn}
                    </span>
                    <div className="flex h-8 w-48 rounded-lg overflow-hidden border border-black/10">
                      {p.colors.map((hex, i) => (
                        <div key={i} style={{ backgroundColor: hex }} className="flex-1" title={hex} />
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onLoadPalette(p.colors);
                      onClose();
                    }}
                    id={`apply-preset-${idx}`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors self-end sm:self-center"
                  >
                    {t.loadPreset}
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              id="close-saved-modal-footer-btn"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.close}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
