import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wand2, Sparkles, Loader2 } from 'lucide-react';
import { Language } from '../types';
import { hslToHex, rgbToHsl, hexToRgb } from '../utils/colorUtils';
import { translations } from '../utils/translations';

interface AiPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPalette: (hexes: string[]) => void;
  onToast: (msg: string) => void;
  lang: Language;
}

// Built-in prompt palette database for instant zero-latency AI theme generation
const AI_THEME_TEMPLATES: Record<string, string[]> = {
  coffee: ['#3C2A21', '#1A120B', '#D5CEA3', '#E5E5CB', '#85586F'],
  ocean: ['#03045E', '#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8'],
  sunset: ['#2B1E3A', '#852999', '#F15BB5', '#FEE440', '#00F5D4'],
  cyberpunk: ['#0D0221', '#0F084B', '#26408B', '#A6CFD5', '#FF007F'],
  forest: ['#1B4332', '#2D6A4F', '#40916C', '#52B788', '#74C69D'],
  pastel: ['#FFB5E8', '#BFFCC6', '#FFC6FF', '#C5A3FF', '#FFFFD1'],
  autumn: ['#6B2D5C', '#E05A47', '#FF9F1C', '#FFBF69', '#2EC4B6'],
  retro: ['#F4A261', '#E76F51', '#2A9D8F', '#264653', '#E9C46A'],
  space: ['#0B091A', '#161B33', '#474973', '#A69CAC', '#F1E3E8'],
  candy: ['#FF70A6', '#FF9770', '#FFD670', '#E9FF70', '#70D6FF'],
  vintage: ['#8D8741', '#659DBD', '#DAAD86', '#BC986A', '#FBEEC1'],
  mint: ['#004B49', '#00796B', '#00BFA5', '#A7FFEB', '#E0F2F1'],
  cherry: ['#590219', '#8C031C', '#D9042B', '#F27405', '#F29F05'],
};

export const AiPaletteModal: React.FC<AiPaletteModalProps> = ({
  isOpen,
  onClose,
  onApplyPalette,
  onToast,
  lang,
}) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const t = translations[lang];

  if (!isOpen) return null;

  const handleGenerateAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);

    // Simulate AI generation with smart keyword matching & procedural fallback
    setTimeout(() => {
      const query = prompt.toLowerCase();
      let matchedHexes: string[] | null = null;

      for (const [key, colors] of Object.entries(AI_THEME_TEMPLATES)) {
        if (query.includes(key)) {
          matchedHexes = colors;
          break;
        }
      }

      if (!matchedHexes) {
        // Derive custom procedural palette from hash of prompt text
        let hash = 0;
        for (let i = 0; i < prompt.length; i++) {
          hash = prompt.charCodeAt(i) + ((hash << 5) - hash);
        }
        const baseHue = Math.abs(hash) % 360;
        matchedHexes = [
          hslToHex(baseHue, 75, 25),
          hslToHex((baseHue + 40) % 360, 80, 45),
          hslToHex((baseHue + 80) % 360, 85, 60),
          hslToHex((baseHue + 120) % 360, 70, 75),
          hslToHex((baseHue + 160) % 360, 60, 85),
        ];
      }

      onApplyPalette(matchedHexes);
      setLoading(false);
      onToast(`${t.aiGeneratedToast} "${prompt}"!`);
      onClose();
    }, 600);
  };

  const samplePromptsEn = [
    'Cozy coffee shop on a rainy afternoon',
    'Cyberpunk neon Tokyo city',
    'Sunset beach with coconut palms',
    'Pastel matcha Boba tea',
    'Nordic autumn pine forest',
  ];

  const samplePromptsAr = [
    'مقهى هادئ في بعد ظهر ممطر',
    'مدينة طوكيو سايبربانك نيون',
    'شاطئ الغروب مع أشجار النخيل',
    'شاي بوبا باستيل منعش',
    'غابة صنوبر خريفية نوردية',
  ];

  const samplePrompts = lang === 'ar' ? samplePromptsAr : samplePromptsEn;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
                <Wand2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.aiPaletteTitle}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.aiPaletteDesc}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              id="close-ai-modal-btn"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleGenerateAi} className="my-5 space-y-4">
            <div>
              <input
                type="text"
                placeholder={t.aiPromptPlaceholder}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                id="ai-prompt-input"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            {/* Quick Suggestions */}
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-2">
                {t.orTrySample}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {samplePrompts.map((s, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setPrompt(s)}
                    id={`sample-prompt-${i}`}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-pink-950/40 text-slate-700 dark:text-slate-300 hover:text-pink-600 dark:hover:text-pink-300 text-[11px] font-medium transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!prompt.trim() || loading}
              id="submit-ai-prompt-btn"
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:to-indigo-600 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-pink-500/20 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.synthesizing}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t.generate}</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
