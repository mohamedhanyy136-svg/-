import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, Download, Share2, Code2 } from 'lucide-react';
import { ColorItem, Language } from '../types';
import { encodePaletteToHash } from '../utils/colorUtils';
import { translations } from '../utils/translations';

interface ExportModalProps {
  colors: ColorItem[];
  isOpen: boolean;
  onClose: () => void;
  onCopy: (text: string, label: string) => void;
  lang: Language;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  colors,
  isOpen,
  onClose,
  onCopy,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'css' | 'tailwind' | 'json' | 'link' | 'png'>('css');
  const [copied, setCopied] = useState(false);

  const t = translations[lang];

  if (!isOpen) return null;

  const hexList = colors.map((c) => c.hex);

  // CSS Variables snippet
  const cssCode = `:root {\n` + colors.map((c, i) => `  --color-${i + 1}: ${c.hex}; /* ${c.name} */`).join('\n') + `\n}`;

  // Tailwind CSS snippet
  const tailwindCode = `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n` +
    colors.map((c, i) => `        'palette-${i + 1}': '${c.hex}',`).join('\n') +
    `\n      }\n    }\n  }\n}`;

  // JSON format snippet
  const jsonCode = JSON.stringify(
    colors.map((c) => ({
      hex: c.hex,
      rgb: `rgb(${c.rgb.r}, ${c.rgb.g}, ${c.rgb.b})`,
      name: c.name,
    })),
    null,
    2
  );

  // Share URL
  const hash = encodePaletteToHash(colors);
  const shareUrl = `${window.location.origin}${window.location.pathname}#${hash}`;

  const handleCopyCurrent = () => {
    let textToCopy = '';
    if (activeTab === 'css') textToCopy = cssCode;
    else if (activeTab === 'tailwind') textToCopy = tailwindCode;
    else if (activeTab === 'json') textToCopy = jsonCode;
    else if (activeTab === 'link') textToCopy = shareUrl;

    if (textToCopy) {
      onCopy(textToCopy, t.copiedCodeToast);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate PNG Canvas download
  const handleDownloadPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const barWidth = canvas.width / colors.length;
    colors.forEach((c, i) => {
      // Draw color bar
      ctx.fillStyle = c.hex;
      ctx.fillRect(i * barWidth, 0, barWidth, canvas.height);

      // Draw bottom info card overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(i * barWidth, canvas.height - 120, barWidth, 120);

      // Draw HEX text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.hex, i * barWidth + barWidth / 2, canvas.height - 70);

      // Draw Name text
      ctx.font = '16px sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(c.name, i * barWidth + barWidth / 2, canvas.height - 35);
    });

    // Watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('ChromaPulse Color Palette', 20, 40);

    const link = document.createElement('a');
    link.download = `chromapulse-palette-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    onCopy('', t.downloadPng);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{t.exportPaletteTitle}</h3>
            </div>
            <button
              onClick={onClose}
              id="close-export-modal-btn"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Color Preview Header */}
          <div className="flex h-12 rounded-xl overflow-hidden my-4 border border-black/10">
            {colors.map((c) => (
              <div
                key={c.id}
                style={{ backgroundColor: c.hex }}
                className="flex-1 flex items-end justify-center pb-1"
                title={`${c.name} (${c.hex})`}
              >
                <span className="text-[10px] font-mono font-bold text-white drop-shadow-md hidden sm:inline">
                  {c.hex}
                </span>
              </div>
            ))}
          </div>

          {/* Format Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-2 mb-4 border-b border-slate-100 dark:border-slate-800">
            {[
              { id: 'css', label: t.cssVariables },
              { id: 'tailwind', label: t.tailwindCss },
              { id: 'json', label: t.json },
              { id: 'link', label: t.shareLink },
              { id: 'png', label: t.imagePng },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                id={`tab-export-${tab.id}`}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Body */}
          <div className="my-2">
            {activeTab === 'png' ? (
              <div className="py-6 text-center space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t.downloadPngDesc}
                </p>
                <button
                  onClick={handleDownloadPng}
                  id="download-png-btn"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{t.downloadPng}</span>
                </button>
              </div>
            ) : activeTab === 'link' ? (
              <div className="space-y-3 py-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  {t.shareableLink}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={shareUrl}
                    id="share-url-input"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-xs focus:outline-none"
                  />
                  <button
                    onClick={handleCopyCurrent}
                    id="copy-share-url-btn"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shrink-0 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? t.copied : t.copy}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-60 border border-slate-800 leading-relaxed">
                  <code>
                    {activeTab === 'css' && cssCode}
                    {activeTab === 'tailwind' && tailwindCode}
                    {activeTab === 'json' && jsonCode}
                  </code>
                </pre>
                <button
                  onClick={handleCopyCurrent}
                  id="copy-code-export-btn"
                  className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors border border-slate-700"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? t.copied : t.copyCode}</span>
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onClose}
              id="close-export-modal-footer-btn"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.done}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
