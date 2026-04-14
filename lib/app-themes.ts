export type AppThemeId = "calm" | "custom"

export interface AppThemeColors {
  accent: string
  accentStrong: string
  accentSoft: string
  surface: string
  surfaceMuted: string
  surfaceHover: string
  border: string
  text: string
  textMuted: string
}

export interface AppThemeDefinition {
  id: AppThemeId
  label: string
  description: string
  colors: AppThemeColors
}

export interface CustomThemeInput {
  primary: string
  secondary: string
  surface: string
}

export const APP_THEME_STORAGE_KEY = "safe-space-app-theme"
export const APP_CUSTOM_THEME_STORAGE_KEY = "safe-space-custom-theme"

export const DEFAULT_CUSTOM_THEME: CustomThemeInput = {
  primary: "#8a7dff",
  secondary: "#ff8a5b",
  surface: "#fff7f0",
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function normalizeHex(value: string) {
  const trimmed = value.trim()
  const match = /^#([0-9a-f]{6})$/i.exec(trimmed)
  return match ? `#${match[1].toLowerCase()}` : null
}

function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex)
  if (!normalized) return { r: 0, g: 0, b: 0 }

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  }
}

function rgbToHex(r: number, g: number, b: number) {
  return `#${[r, g, b]
    .map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`
}

function mix(hexA: string, hexB: string, amount: number) {
  const a = hexToRgb(hexA)
  const b = hexToRgb(hexB)

  return rgbToHex(
    a.r + (b.r - a.r) * amount,
    a.g + (b.g - a.g) * amount,
    a.b + (b.b - a.b) * amount,
  )
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex)
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
}

export function sanitizeCustomThemeInput(value: Partial<CustomThemeInput> | null | undefined): CustomThemeInput {
  return {
    primary: normalizeHex(value?.primary || "") || DEFAULT_CUSTOM_THEME.primary,
    secondary: normalizeHex(value?.secondary || "") || DEFAULT_CUSTOM_THEME.secondary,
    surface: normalizeHex(value?.surface || "") || DEFAULT_CUSTOM_THEME.surface,
  }
}

export function buildCustomThemeColors(input: CustomThemeInput): AppThemeColors {
  const sanitized = sanitizeCustomThemeInput(input)
  const surfaceIsDark = luminance(sanitized.surface) < 0.45
  const text = surfaceIsDark ? "#f8fafc" : mix(sanitized.secondary, "#111827", 0.8)
  const textMuted = surfaceIsDark ? mix(text, "#94a3b8", 0.35) : mix(text, "#94a3b8", 0.45)
  const accentSoft = mix(sanitized.primary, sanitized.surface, 0.72)
  const surfaceMuted = mix(sanitized.surface, sanitized.primary, surfaceIsDark ? 0.12 : 0.08)
  const surfaceHover = mix(surfaceMuted, sanitized.secondary, surfaceIsDark ? 0.12 : 0.08)
  const border = mix(sanitized.surface, sanitized.secondary, surfaceIsDark ? 0.28 : 0.2)

  return {
    accent: sanitized.primary,
    accentStrong: sanitized.secondary,
    accentSoft,
    surface: sanitized.surface,
    surfaceMuted,
    surfaceHover,
    border,
    text,
    textMuted,
  }
}

export const APP_THEMES: AppThemeDefinition[] = [
  {
    id: "calm",
    label: "Calm Mint",
    description: "Fresh greens with a soft, grounded feel.",
    colors: {
      accent: "#1bbcad",
      accentStrong: "#159a8d",
      accentSoft: "#d8f6f1",
      surface: "#ffffff",
      surfaceMuted: "#f3fbf9",
      surfaceHover: "#e8f7f4",
      border: "#c6ece5",
      text: "#10312d",
      textMuted: "#4f6f6b",
    },
  },
  {
    id: "custom",
    label: "Custom Mix",
    description: "Build your own palette with three colors.",
    colors: buildCustomThemeColors(DEFAULT_CUSTOM_THEME),
  },
]

export function isAppThemeId(value: string): value is AppThemeId {
  return APP_THEMES.some((theme) => theme.id === value)
}

export function getThemeDefinition(themeId: AppThemeId, customTheme: CustomThemeInput): AppThemeDefinition {
  if (themeId === "calm") {
    return APP_THEMES.find((theme) => theme.id === "calm") || APP_THEMES[0]
  }

  return {
    id: "custom",
    label: "Custom Mix",
    description: "Build your own palette with three colors.",
    colors: buildCustomThemeColors(customTheme),
  }
}
