/** Надёжная прозрачность для Android (8-digit hex там часто даёт артефакты). */
export function withAlpha(color: string, alpha: number): string {
  const normalized = color.trim();
  if (!normalized.startsWith('#')) {
    return color;
  }
  let hex = normalized.slice(1);
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((char) => char + char)
      .join('');
  }
  if (hex.length === 8) {
    hex = hex.slice(0, 6);
  }
  if (hex.length !== 6) {
    return color;
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const COLORS = {
  // Light + high-contrast palette
  primary: '#1D4ED8',
  primaryStrong: '#1E3A8A',
  primaryBright: '#3B82F6',
  accent: '#2563EB',
  accentStrong: '#1D4ED8',
  accentViolet: '#0EA5E9',
  danger: '#E11D48',
  warning: '#F59E0B',
  success: '#16A34A',

  background: '#F8FBFF',
  bgPrimary: '#F8FBFF',
  bgSecondary: '#EEF4FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F5F9FF',
  card: '#FFFFFF',
  border: '#D4E2F7',
  borderSoft: '#E2ECFA',
  text: '#0F172A',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
  textInverse: '#FFFFFF',

  primarySoft: '#DBEAFE',
  dangerSoft: '#FFE4EA',
  warningSoft: '#FEF3C7',
  successSoft: '#DCFCE7',
  accentSoft: '#DFEBFF',
  violetSoft: '#E0F2FE',

  heroStart: '#1D4ED8',
  heroEnd: '#3B82F6',
} as const;

export const CHRONIC_DISEASE_LABELS: Record<string, string> = {
  ASTHMA: 'Астма',
  DIABETES: 'Диабет',
  HYPERTENSION: 'Гипертония',
  ARTHRITIS: 'Артрит',
};
