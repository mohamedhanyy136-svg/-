import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Copy } from 'lucide-react';
import { ColorItem, Language } from '../types';
import { hslToHex, hexToRgb, rgbToHsl, getColorName } from '../utils/colorUtils';
import { translations } from '../utils/translations';

interface ColorPickerModalProps {
  color: ColorItem | null;
  onClose: () => void;
  onSave: (updatedColor: ColorItem) => void;
  onCopy: (text: string, label: string, hex?: string) => void;
  lang: Language;
}

export const ColorPickerModal: React.FC<ColorPickerModalProps> = ({
  color,
  onClose,
  onSave,
  onCopy,
  lang,
}) => {
  const [hex, setHex] = useState('#000000');
  const [h, setH] = useState(0);
  const [s, setS] = useState(50);
  const [l, setL] = useState(50);

  const t = translations[lang];

  useEffect(() => {
    if (color) {
      setHex(color.hex);
      setH(color.hsl.h);
      setS(color.hsl.s);
      setL(color.hsl.l);
    }
  }, [color]);

  if (!color) return null;

  const handleHslChange = (newH: number, newS: number, newL: number) => {
    setH(newH);
    setS(newS);
    setL(newL);
    const newHex = hslToHex(newH, newS, newL);
    setHex(newHex);
  };

  const handleHexInputChange = (val: string) => {
    setHex(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
      const rgb = hexToRgb(val);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setH(hsl.h);
      setS(hsl.s);
      setL(hsl.l);
    }
  };

  const handleApply = () => {
    const validHex = /^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : color.hex;
    const rgb = hexToRgb(validHex);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    const name = getColorName(validHex, lang);

    onSave({
      ...color,
      hex: validHex,
      rgb,
      hsl,
      name,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.adjustColorTitle}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t.adjustColorDesc}</p>
            </div>
            <button
              onClick={onClose}
              id="close-color-picker-btn"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Color Preview Swatch */}
          <div className="my-5 flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-2xl shadow-inner border border-black/10 transition-colors duration-150 shrink-0"
              style={{ backgroundColor: hex }}
            />
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                {t.hexValue}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={hex}
                  onChange={(e) => handleHexInputChange(e.target.value)}
                  id="hex-editor-input"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => onCopy(hex, `HEX ${hex}`, hex)}
                  id="copy-hex-picker-btn"
                  title={t.copyHex}
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4 my-6">
            {/* Hue Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                <span>{t.hue}</span>
                <span className="font-mono">{h}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={h}
                onChange={(e) => handleHslChange(Number(e.target.value), s, l)}
                id="hue-slider"
                className="w-full h-3 rounded-lg appearance-none cursor-pointer"
                style={{
                  background:
                    'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
                }}
              />
            </div>

            {/* Saturation Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                <span>{t.saturation}</span>
                <span className="font-mono">{s}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={s}
                onChange={(e) => handleHslChange(h, Number(e.target.value), l)}
                id="saturation-slider"
                className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700"
              />
            </div>

            {/* Lightness Slider */}
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                <span>{t.lightness}</span>
                <span className="font-mono">{l}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={l}
                onChange={(e) => handleHslChange(h, s, Number(e.target.value))}
                id="lightness-slider"
                className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              id="cancel-color-picker-btn"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              onClick={handleApply}
              id="apply-color-picker-btn"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t.applyChanges}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
