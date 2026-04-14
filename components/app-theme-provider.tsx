"use client"

import type { ReactNode } from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import {
  APP_CUSTOM_THEME_STORAGE_KEY,
  APP_THEME_STORAGE_KEY,
  APP_THEMES,
  DEFAULT_CUSTOM_THEME,
  getThemeDefinition,
  sanitizeCustomThemeInput,
  type AppThemeId,
  type CustomThemeInput,
  isAppThemeId,
} from "@/lib/app-themes"

interface AppThemeContextValue {
  theme: AppThemeId
  setTheme: (theme: AppThemeId) => void
  customTheme: CustomThemeInput
  setCustomTheme: (theme: CustomThemeInput) => void
}

const AppThemeContext = createContext<AppThemeContextValue | null>(null)

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppThemeId>("calm")
  const [customTheme, setCustomThemeState] = useState<CustomThemeInput>(DEFAULT_CUSTOM_THEME)

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(APP_THEME_STORAGE_KEY)
    const storedCustomTheme = window.localStorage.getItem(APP_CUSTOM_THEME_STORAGE_KEY)
    if (storedTheme && isAppThemeId(storedTheme)) setThemeState(storedTheme)

    if (storedCustomTheme) {
      try {
        setCustomThemeState(sanitizeCustomThemeInput(JSON.parse(storedCustomTheme) as Partial<CustomThemeInput>))
      } catch {
        window.localStorage.setItem(APP_CUSTOM_THEME_STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOM_THEME))
      }
    } else {
      window.localStorage.setItem(APP_CUSTOM_THEME_STORAGE_KEY, JSON.stringify(DEFAULT_CUSTOM_THEME))
    }

    if (!storedTheme || !isAppThemeId(storedTheme)) window.localStorage.setItem(APP_THEME_STORAGE_KEY, "calm")
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const activeTheme = getThemeDefinition(theme, customTheme)
    root.dataset.appTheme = theme
    window.localStorage.setItem(APP_THEME_STORAGE_KEY, theme)
    window.localStorage.setItem(APP_CUSTOM_THEME_STORAGE_KEY, JSON.stringify(customTheme))

    root.style.setProperty("--app-accent", activeTheme.colors.accent)
    root.style.setProperty("--app-accent-strong", activeTheme.colors.accentStrong)
    root.style.setProperty("--app-accent-soft", activeTheme.colors.accentSoft)
    root.style.setProperty("--app-surface", activeTheme.colors.surface)
    root.style.setProperty("--app-surface-muted", activeTheme.colors.surfaceMuted)
    root.style.setProperty("--app-surface-hover", activeTheme.colors.surfaceHover)
    root.style.setProperty("--app-border", activeTheme.colors.border)
    root.style.setProperty("--app-text", activeTheme.colors.text)
    root.style.setProperty("--app-text-muted", activeTheme.colors.textMuted)
  }, [customTheme, theme])

  const value = useMemo(
    () => ({
      theme,
      setTheme: (nextTheme: AppThemeId) => setThemeState(nextTheme),
      customTheme,
      setCustomTheme: (nextTheme: CustomThemeInput) => setCustomThemeState(sanitizeCustomThemeInput(nextTheme)),
    }),
    [customTheme, theme],
  )

  return <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>
}

export function useAppTheme() {
  const context = useContext(AppThemeContext)

  if (!context) {
    throw new Error("useAppTheme must be used within AppThemeProvider")
  }

  return {
    ...context,
    themes: APP_THEMES,
  }
}
