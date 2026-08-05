import { ColorItem, HarmonyMode, Language } from '../types';

// Convert HEX string to RGB object
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleanHex, 16) || 0;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Convert RGB to HEX string
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

// Convert RGB to HSL
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Convert HSL to RGB
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const hNorm = (h % 360) / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;

  if (sNorm === 0) {
    const val = Math.round(lNorm * 255);
    return { r: val, g: val, b: val };
  }

  const hue2rgb = (p: number, q: number, t: number) => {
    let tAdjusted = t;
    if (tAdjusted < 0) tAdjusted += 1;
    if (tAdjusted > 1) tAdjusted -= 1;
    if (tAdjusted < 1 / 6) return p + (q - p) * 6 * tAdjusted;
    if (tAdjusted < 1 / 2) return q;
    if (tAdjusted < 2 / 3) return p + (q - p) * (2 / 3 - tAdjusted) * 6;
    return p;
  };

  const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
  const p = 2 * lNorm - q;

  const r = hue2rgb(p, q, hNorm + 1 / 3);
  const g = hue2rgb(p, q, hNorm);
  const b = hue2rgb(p, q, hNorm - 1 / 3);

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

// Relative luminance calculation for WCAG contrast
export function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    const val = v / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// WCAG Contrast ratio calculation
export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Best readable text color (#FFFFFF or #0F172A)
export function getBestTextColor(bgHex: string): { textColor: string; ratio: number } {
  const whiteRatio = getContrastRatio(bgHex, '#FFFFFF');
  const darkRatio = getContrastRatio(bgHex, '#0F172A');
  if (whiteRatio >= darkRatio) {
    return { textColor: '#FFFFFF', ratio: Math.round(whiteRatio * 10) / 10 };
  }
  return { textColor: '#0F172A', ratio: Math.round(darkRatio * 10) / 10 };
}

// Human readable color names database with Arabic support
const COLOR_NAMES: { nameEn: string; nameAr: string; hex: string }[] = [
  { nameEn: 'Pure White', nameAr: 'أبيض ناصع', hex: '#FFFFFF' },
  { nameEn: 'Off White', nameAr: 'أبيض عاجي', hex: '#F8FAFC' },
  { nameEn: 'Charcoal', nameAr: 'فحمي داكن', hex: '#1E293B' },
  { nameEn: 'Pure Black', nameAr: 'أسود خالص', hex: '#000000' },
  { nameEn: 'Crimson Red', nameAr: 'أحمر قرمزي', hex: '#E11D48' },
  { nameEn: 'Coral Flame', nameAr: 'مرجاني متوهج', hex: '#F43F5E' },
  { nameEn: 'Rose Quartz', nameAr: 'وردي كوارتز', hex: '#FB7185' },
  { nameEn: 'Sunset Orange', nameAr: 'برتقالي الغروب', hex: '#F97316' },
  { nameEn: 'Amber Gold', nameAr: 'ذهبي عنبري', hex: '#F59E0B' },
  { nameEn: 'Sunshine Yellow', nameAr: 'أصفر مشرق', hex: '#EAB308' },
  { nameEn: 'Lemon Chiffon', nameAr: 'أصفر ليموني', hex: '#FEF08A' },
  { nameEn: 'Emerald Green', nameAr: 'أخضر زمردي', hex: '#10B981' },
  { nameEn: 'Mint Leaf', nameAr: 'نعناعي منعش', hex: '#34D399' },
  { nameEn: 'Sage Green', nameAr: 'أخضر مريمي', hex: '#84CC16' },
  { nameEn: 'Teal Lagoon', nameAr: 'تيل بحري', hex: '#14B8A6' },
  { nameEn: 'Cyan Breeze', nameAr: 'سمائي سماوي', hex: '#06B6D4' },
  { nameEn: 'Sky Blue', nameAr: 'أزرق سماوي', hex: '#38BDF8' },
  { nameEn: 'Ocean Blue', nameAr: 'أزرق محيطي', hex: '#0284C7' },
  { nameEn: 'Electric Blue', nameAr: 'أزرق كهربائي', hex: '#3B82F6' },
  { nameEn: 'Royal Indigo', nameAr: 'نيلي ملكي', hex: '#6366F1' },
  { nameEn: 'Deep Violet', nameAr: 'بنفسجي عميق', hex: '#8B5CF6' },
  { nameEn: 'Orchid Purple', nameAr: 'أرجواني السحلبية', hex: '#A855F7' },
  { nameEn: 'Magenta Pink', nameAr: 'وردي ماجنتا', hex: '#D946EF' },
  { nameEn: 'Hot Pink', nameAr: 'وردي زاهي', hex: '#EC4899' },
  { nameEn: 'Warm Chocolate', nameAr: 'بني شوكولاتة', hex: '#78350F' },
  { nameEn: 'Terracotta', nameAr: 'طين محروق', hex: '#C2410C' },
  { nameEn: 'Sand Beige', nameAr: 'بيج رملي', hex: '#EAB308' },
  { nameEn: 'Cool Slate', nameAr: 'رمادي إردوازي', hex: '#64748B' },
];

export function getColorName(hex: string, lang: Language = 'en'): string {
  const target = hexToRgb(hex);
  let minDistance = Infinity;
  let closestName = lang === 'ar' ? 'درجة مخصصة' : 'Custom Tint';

  for (const item of COLOR_NAMES) {
    const c = hexToRgb(item.hex);
    // Euclidean distance in RGB space
    const dist = Math.sqrt(
      Math.pow(target.r - c.r, 2) +
      Math.pow(target.g - c.g, 2) +
      Math.pow(target.b - c.b, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closestName = lang === 'ar' ? item.nameAr : item.nameEn;
    }
  }

  // If hue is distinct, refine with dynamic adjective based on saturation/lightness
  const hsl = rgbToHsl(target.r, target.g, target.b);
  if (minDistance > 60) {
    if (lang === 'ar') {
      let prefix = '';
      if (hsl.l > 80) prefix = 'فاتح ';
      else if (hsl.l < 25) prefix = 'داكن ';
      else if (hsl.s > 80) prefix = 'زاهي ';
      else if (hsl.s < 30) prefix = 'هادئ ';

      let baseHue = 'لون';
      if (hsl.h >= 345 || hsl.h < 15) baseHue = 'أحمر';
      else if (hsl.h < 45) baseHue = 'برتقالي';
      else if (hsl.h < 70) baseHue = 'أصفر';
      else if (hsl.h < 165) baseHue = 'أخضر';
      else if (hsl.h < 195) baseHue = 'سماوي';
      else if (hsl.h < 260) baseHue = 'أزرق';
      else if (hsl.h < 315) baseHue = 'بنفسجي';
      else baseHue = 'وردي';

      return `${baseHue} ${prefix}`.trim();
    } else {
      let prefix = '';
      if (hsl.l > 80) prefix = 'Light ';
      else if (hsl.l < 25) prefix = 'Dark ';
      else if (hsl.s > 80) prefix = 'Vibrant ';
      else if (hsl.s < 30) prefix = 'Muted ';

      let baseHue = 'Shade';
      if (hsl.h >= 345 || hsl.h < 15) baseHue = 'Red';
      else if (hsl.h < 45) baseHue = 'Orange';
      else if (hsl.h < 70) baseHue = 'Yellow';
      else if (hsl.h < 165) baseHue = 'Green';
      else if (hsl.h < 195) baseHue = 'Cyan';
      else if (hsl.h < 260) baseHue = 'Blue';
      else if (hsl.h < 315) baseHue = 'Purple';
      else baseHue = 'Pink';

      return `${prefix}${baseHue}`;
    }
  }

  return closestName;
}

// Random color generator
export function getRandomHex(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function createColorItem(
  hex: string,
  isLocked = false,
  existingId?: string,
  lang: Language = 'en'
): ColorItem {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const name = getColorName(hex, lang);
  return {
    id: existingId || Math.random().toString(36).substring(2, 9),
    hex,
    rgb,
    hsl,
    name,
    isLocked,
  };
}

// Generate Palette based on Harmony Mode
export function generatePalette(
  currentColors: ColorItem[] = [],
  harmony: HarmonyMode = 'random',
  lang: Language = 'en'
): ColorItem[] {
  // Find a base hue from unlocked colors or choose random
  const baseHue = Math.floor(Math.random() * 360);
  const count = 5;
  const result: ColorItem[] = [];

  for (let i = 0; i < count; i++) {
    const existing = currentColors[i];
    if (existing && existing.isLocked) {
      result.push(existing);
      continue;
    }

    let hex = '#FFFFFF';

    switch (harmony) {
      case 'monochromatic': {
        const s = Math.min(100, Math.max(20, 40 + Math.random() * 50));
        const l = Math.min(92, Math.max(12, (i + 1) * 16 + (Math.random() * 10 - 5)));
        hex = hslToHex(baseHue, s, l);
        break;
      }
      case 'analogous': {
        const h = (baseHue + (i - 2) * 30 + 360) % 360;
        const s = 65 + Math.random() * 25;
        const l = 45 + Math.random() * 30;
        hex = hslToHex(h, s, l);
        break;
      }
      case 'triadic': {
        const offsets = [0, 120, 240, 30, 150];
        const h = (baseHue + offsets[i] + 360) % 360;
        const s = 60 + Math.random() * 30;
        const l = 45 + Math.random() * 25;
        hex = hslToHex(h, s, l);
        break;
      }
      case 'complementary': {
        const offsets = [0, 180, 20, 160, 40];
        const h = (baseHue + offsets[i] + 360) % 360;
        const s = 65 + Math.random() * 25;
        const l = 40 + Math.random() * 35;
        hex = hslToHex(h, s, l);
        break;
      }
      case 'split-complementary': {
        const offsets = [0, 150, 210, 30, 180];
        const h = (baseHue + offsets[i] + 360) % 360;
        const s = 60 + Math.random() * 30;
        const l = 45 + Math.random() * 25;
        hex = hslToHex(h, s, l);
        break;
      }
      case 'pastel': {
        const h = (baseHue + i * 50 + Math.random() * 20) % 360;
        const s = 50 + Math.random() * 25;
        const l = 78 + Math.random() * 15;
        hex = hslToHex(h, s, l);
        break;
      }
      case 'neon': {
        const h = (baseHue + i * 70) % 360;
        const s = 85 + Math.random() * 15;
        const l = 48 + Math.random() * 15;
        hex = hslToHex(h, s, l);
        break;
      }
      case 'warm': {
        const h = (Math.random() * 70 - 15 + 360) % 360; // Red, orange, yellow
        const s = 70 + Math.random() * 25;
        const l = 40 + Math.random() * 35;
        hex = hslToHex(h, s, l);
        break;
      }
      case 'cool': {
        const h = 170 + Math.random() * 110; // Cyan, blue, purple
        const s = 60 + Math.random() * 30;
        const l = 40 + Math.random() * 35;
        hex = hslToHex(h, s, l);
        break;
      }
      case 'random':
      default: {
        hex = getRandomHex();
        break;
      }
    }

    result.push(createColorItem(hex, false, existing?.id, lang));
  }

  return result;
}

// URL Serialization
export function encodePaletteToHash(colors: ColorItem[]): string {
  return colors.map((c) => c.hex.replace('#', '')).join('-');
}

export function decodePaletteFromHash(hash: string, lang: Language = 'en'): ColorItem[] | null {
  const clean = hash.replace('#', '').trim();
  if (!clean) return null;
  const hexes = clean.split('-');
  if (hexes.length >= 2 && hexes.every((h) => /^[0-9A-Fa-f]{6}$/.test(h))) {
    return hexes.slice(0, 5).map((hex) => createColorItem(`#${hex}`, false, undefined, lang));
  }
  return null;
}
