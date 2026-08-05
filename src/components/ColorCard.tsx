import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Unlock, Copy, Sliders, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { ColorItem, Language } from '../types';
import { getBestTextColor } from '../utils/colorUtils';
import { translations } from '../utils/translations';

interface ColorCardProps {
  color: ColorItem;
  index: number;
  total: number;
  onToggleLock: (id: string) => void;
  onCopy: (text: string, label: string, hex?: string) => void;
  onOpenPicker: (color: ColorItem) => void;
  onMove: (index: number, direction: 'left' | 'right') => void;
  lang: Language;
}

export const ColorCard: React.FC<ColorCardProps> = ({
  color,
  index,
  total,
  onToggleLock,
  onCopy,
  onOpenPicker,
  onMove,
  lang,
}) => {
  const [copiedHex, setCopiedHex] = useState(false);
  const [copiedRgb, setCopiedRgb] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const t = translations[lang];

  const { textColor, ratio } = getBestTextColor(color.hex);
  const isLightText = textColor === '#FFFFFF';

  // Subdued secondary text color for metadata & subtle icons
  const secondaryTextColor = isLightText ? 'rgba(255, 255, 255, 0.75)' : 'rgba(15, 23, 42, 0.75)';
  const buttonBgClass = isLightText
    ? 'bg-white/10 hover:bg-white/20 active:scale-95 text-white'
    : 'bg-black/10 hover:bg-black/20 active:scale-95 text-slate-900';
  const lockActiveBg = color.isLocked
    ? isLightText
      ? 'bg-white text-slate-900 shadow-lg'
      : 'bg-slate-900 text-white shadow-lg'
    : buttonBgClass;

  const handleCopyHex = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(color.hex, `HEX ${color.hex}`, color.hex);
    setCopiedHex(true);
    setTimeout(() => setCopiedHex(false), 1500);
  };

  const rgbString = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`;

  const handleCopyRgb = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy(rgbString, `RGB (${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`, color.hex);
    setCopiedRgb(true);
    setTimeout(() => setCopiedRgb(false), 1500);
  };

  return (
    <motion.div
      layout
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      style={{ backgroundColor: color.hex }}
      className="relative flex flex-col justify-between p-4 md:p-6 transition-colors duration-300 min-h-[160px] md:min-h-full flex-1 group select-none rounded-xl md:rounded-2xl shadow-sm border border-black/5 dark:border-white/5"
    >
      {/* Top Bar: Move Reorder Controls & Lock Indicator */}
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1 opacity-90 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onMove(index, 'left')}
            disabled={index === 0}
            title={t.moveLeft}
            id={`move-left-${color.id}`}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-20 disabled:pointer-events-none ${buttonBgClass}`}
          >
            <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
          </button>
          <button
            onClick={() => onMove(index, 'right')}
            disabled={index === total - 1}
            title={t.moveRight}
            id={`move-right-${color.id}`}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-20 disabled:pointer-events-none ${buttonBgClass}`}
          >
            <ChevronRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>

        {/* Lock / Unlock Main Button */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => onToggleLock(color.id)}
          id={`lock-btn-${color.id}`}
          title={color.isLocked ? t.unlockAll : t.lockAll}
          className={`p-3 rounded-full transition-all duration-200 ${lockActiveBg}`}
        >
          {color.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5 opacity-70 group-hover:opacity-100" />}
        </motion.button>
      </div>

      {/* Middle Action Bar: Fine-tune & Copy Quick Actions */}
      <div className="flex flex-col items-center justify-center my-auto py-2">
        <div className="flex items-center gap-2 md:flex-col md:gap-3 opacity-90 md:opacity-0 group-hover:opacity-100 transition-all transform md:translate-y-2 group-hover:translate-y-0 duration-200">
          <button
            onClick={() => onOpenPicker(color)}
            id={`adjust-btn-${color.id}`}
            title={t.adjust}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium backdrop-blur-md transition-all ${buttonBgClass}`}
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">{t.adjust}</span>
          </button>

          <button
            onClick={handleCopyHex}
            id={`quick-copy-btn-${color.id}`}
            title={t.copyHex}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium backdrop-blur-md transition-all ${buttonBgClass}`}
          >
            {copiedHex ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span className="hidden sm:inline">{copiedHex ? t.copied : t.copyHex}</span>
          </button>
        </div>
      </div>

      {/* Bottom Information Bar: Name, HEX, RGB & WCAG Badge */}
      <div className="flex flex-col gap-1 z-10">
        {/* WCAG Contrast Ratio Tag */}
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-md backdrop-blur-md"
            style={{
              color: textColor,
              backgroundColor: isLightText ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
            }}
            title={`WCAG Contrast Ratio: ${ratio}:1`}
          >
            {t.ratio} {ratio}:1 {ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ''}
          </span>

          {color.isLocked && (
            <span
              className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full"
              style={{
                color: isLightText ? '#0F172A' : '#FFFFFF',
                backgroundColor: isLightText ? '#FFFFFF' : '#0F172A',
              }}
            >
              {t.locked}
            </span>
          )}
        </div>

        {/* Color Name */}
        <p className="text-xs font-medium tracking-wide truncate" style={{ color: secondaryTextColor }}>
          {color.name}
        </p>

        {/* HEX Code (Clickable) */}
        <button
          onClick={handleCopyHex}
          id={`hex-text-btn-${color.id}`}
          className="text-left rtl:text-right font-mono text-2xl md:text-3xl font-extrabold tracking-tight hover:opacity-80 transition-opacity flex items-center justify-between group/hex"
          style={{ color: textColor }}
          title={t.clickToCopyHex}
        >
          <span>{color.hex}</span>
          {copiedHex ? (
            <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <Copy className="w-4 h-4 opacity-0 group-hover/hex:opacity-100 transition-opacity shrink-0" />
          )}
        </button>

        {/* RGB Value (Clickable) */}
        <button
          onClick={handleCopyRgb}
          id={`rgb-text-btn-${color.id}`}
          className="text-left rtl:text-right font-mono text-xs tracking-wider opacity-80 hover:opacity-100 transition-opacity"
          style={{ color: secondaryTextColor }}
          title={t.clickToCopyRgb}
        >
          {rgbString}
        </button>
      </div>
    </motion.div>
  );
};
