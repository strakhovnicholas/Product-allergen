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
