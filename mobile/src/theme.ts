export const colors = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  primaryDark: "#1D4ED8",
  accent: "#6366F1",
  accentLight: "#EEF2FF",
  text: "#0F172A",
  textSub: "#475569",
  muted: "#94A3B8",
  dim: "#CBD5E1",
  green: "#16A34A",
  greenLight: "#F0FDF4",
  blue: "#2563EB",
  blueLight: "#EFF6FF",
  yellow: "#D97706",
  yellowLight: "#FFFBEB",
  red: "#DC2626",
  redLight: "#FEF2F2",
}

export const shadow = {
  sm: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  glow: {
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  glowGreen: {
    shadowColor: "#16A34A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  glowRed: {
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  glowYellow: {
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
}

export const verdict = {
  VALIDATED: colors.green,
  PROMISING: colors.blue,
  RISKY: colors.yellow,
  AVOID: colors.red,
}

export const verdictLight = {
  VALIDATED: colors.greenLight,
  PROMISING: colors.blueLight,
  RISKY: colors.yellowLight,
  AVOID: colors.redLight,
}

export const verdictShadow = {
  VALIDATED: shadow.glowGreen,
  PROMISING: shadow.glow,
  RISKY: shadow.glowYellow,
  AVOID: shadow.glowRed,
}
