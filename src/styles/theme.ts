export const SPACING = {
  xs: 6,
  sm: 14,
  md: 18,
  lg: 24,
  xl: 32,
} as const;

export const RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  xxl: 30,
  pill: 999,
} as const;

export const FONT = {
  caption: 12,
  body: 14,
  bodyLg: 16,
  title: 22,
  headline: 30,
} as const;

export const CONTROL = {
  inputHeight: 54,
  buttonHeight: 56,
} as const;

export const SHADOW = {
  soft: {
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  medium: {
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
} as const;
