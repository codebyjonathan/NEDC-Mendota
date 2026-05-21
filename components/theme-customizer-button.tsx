"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Check, Palette } from "lucide-react"
import { useAppTheme } from "@/components/app-theme-provider"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getThemeDefinition } from "@/lib/app-themes"
import { cn } from "@/lib/utils"
import type { Language } from "@/lib/translations"

const I18N = {
  en: {
    triggerAria: "Customize app colors",
    heading: "Color themes",
    subheading: "Pick the palette that feels best for this device.",
    calmLabel: "Calm Mint",
    calmDesc: "Fresh greens with a soft, grounded feel.",
    customLabel: "Custom Mix",
    customDesc: "Build your own palette with three colors.",
    customBuilderTitle: "Custom Mix builder",
    customBuilderDesc: "Choose three colors, then activate Custom Mix.",
    useCustom: "Use Custom",
    primary: "Primary",
    secondary: "Secondary",
    surface: "Surface",
    primaryAria: "Choose custom primary color",
    secondaryAria: "Choose custom secondary color",
    surfaceAria: "Choose custom surface color",
  },
  es: {
    triggerAria: "Personalizar colores de la app",
    heading: "Temas de color",
    subheading: "Elige la paleta que mejor se sienta para este dispositivo.",
    calmLabel: "Menta Calma",
    calmDesc: "Verdes frescos con una sensación suave y estable.",
    customLabel: "Mezcla Personalizada",
    customDesc: "Crea tu propia paleta con tres colores.",
    customBuilderTitle: "Constructor de Mezcla Personalizada",
    customBuilderDesc: "Elige tres colores y luego activa Mezcla Personalizada.",
    useCustom: "Usar Personalizado",
    primary: "Primario",
    secondary: "Secundario",
    surface: "Superficie",
    primaryAria: "Elegir color primario personalizado",
    secondaryAria: "Elegir color secundario personalizado",
    surfaceAria: "Elegir color de superficie personalizado",
  },
  ar: {
    triggerAria: "تخصيص ألوان التطبيق",
    heading: "سمات الألوان",
    subheading: "اختر لوحة الألوان الأنسب لهذا الجهاز.",
    calmLabel: "نعناع هادئ",
    calmDesc: "درجات خضراء منعشة بإحساس هادئ ومتزن.",
    customLabel: "مزيج مخصص",
    customDesc: "أنشئ لوحة ألوانك الخاصة بثلاثة ألوان.",
    customBuilderTitle: "منشئ المزيج المخصص",
    customBuilderDesc: "اختر ثلاثة ألوان ثم فعّل المزيج المخصص.",
    useCustom: "استخدام المخصص",
    primary: "أساسي",
    secondary: "ثانوي",
    surface: "الخلفية",
    primaryAria: "اختر اللون الأساسي المخصص",
    secondaryAria: "اختر اللون الثانوي المخصص",
    surfaceAria: "اختر لون الخلفية المخصص",
  },
} as const

export function ThemeCustomizerButton() {
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang") || "en"
  const lang = (langParam === "en" || langParam === "es" || langParam === "ar" ? langParam : "en") as Language
  const t = I18N[lang]

  const { theme, setTheme, themes, customTheme, setCustomTheme } = useAppTheme()
  const resolvedThemes = useMemo(
    () => themes.map((option) => (option.id === "custom" ? getThemeDefinition("custom", customTheme) : option)),
    [customTheme, themes],
  )

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full hover:bg-gray-100"
          aria-label={t.triggerAria}
        >
          <Palette className="h-5 w-5 text-gray-700" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-3xl border border-gray-200 bg-white p-3 shadow-xl">
        <div className="mb-3 px-2">
          <h3 className="text-sm font-semibold text-gray-900">{t.heading}</h3>
          <p className="mt-1 text-xs text-gray-600">{t.subheading}</p>
        </div>

        <div className="space-y-2">
          {resolvedThemes.map((option) => {
            const isActive = option.id === theme

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border p-3 text-left transition-colors",
                  isActive ? "border-transparent bg-gray-50 ring-2" : "border-gray-200 hover:bg-gray-50",
                )}
                style={isActive ? { boxShadow: `0 0 0 2px ${option.colors.accent}` } : undefined}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="h-4 w-4 rounded-full border border-white/60"
                        style={{ backgroundColor: option.colors.accent }}
                      />
                      <span
                        className="h-4 w-4 rounded-full border border-white/60"
                        style={{ backgroundColor: option.colors.accentSoft }}
                      />
                      <span
                        className="h-4 w-4 rounded-full border border-black/5"
                        style={{ backgroundColor: option.colors.surfaceMuted }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {option.id === "calm" ? t.calmLabel : t.customLabel}
                      </p>
                      <p className="text-xs text-gray-600">
                        {option.id === "calm" ? t.calmDesc : t.customDesc}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className="ml-3 flex h-7 w-7 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isActive ? option.colors.accent : option.colors.surfaceMuted,
                    color: isActive ? "#ffffff" : option.colors.textMuted,
                  }}
                >
                  <Check className="h-4 w-4" />
                </div>
              </button>
            )
          })}
        </div>

        <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900">{t.customBuilderTitle}</p>
              <p className="text-xs text-gray-600">{t.customBuilderDesc}</p>
            </div>
            <Button type="button" size="sm" className="app-cta rounded-full px-3 text-xs" onClick={() => setTheme("custom")}>
              {t.useCustom}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <label className="space-y-1 text-xs text-gray-600">
              <span>{t.primary}</span>
              <input
                type="color"
                value={customTheme.primary}
                onChange={(event) => setCustomTheme({ ...customTheme, primary: event.target.value })}
                className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
                aria-label={t.primaryAria}
              />
            </label>
            <label className="space-y-1 text-xs text-gray-600">
              <span>{t.secondary}</span>
              <input
                type="color"
                value={customTheme.secondary}
                onChange={(event) => setCustomTheme({ ...customTheme, secondary: event.target.value })}
                className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
                aria-label={t.secondaryAria}
              />
            </label>
            <label className="space-y-1 text-xs text-gray-600">
              <span>{t.surface}</span>
              <input
                type="color"
                value={customTheme.surface}
                onChange={(event) => setCustomTheme({ ...customTheme, surface: event.target.value })}
                className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
                aria-label={t.surfaceAria}
              />
            </label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
