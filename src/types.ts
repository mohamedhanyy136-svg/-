export type Language = 'en' | 'ar';

export interface ColorItem {
  id: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  name: string;
  isLocked: boolean;
}

export type HarmonyMode =
  | 'random'
  | 'analogous'
  | 'monochromatic'
  | 'triadic'
  | 'complementary'
  | 'split-complementary'
  | 'pastel'
  | 'neon'
  | 'warm'
  | 'cool';

export interface SavedPalette {
  id: string;
  name: string;
  colors: string[]; // hex values
  createdAt: number;
  tags?: string[];
}

export interface ToastNotification {
  id: string;
  message: string;
  colorHex?: string;
  type?: 'success' | 'info';
}
