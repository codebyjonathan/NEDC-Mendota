"use client"

import { useMemo } from "react"
import { Check, Palette } from "lucide-react"
import { useAppTheme } from "@/components/app-theme-provider"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getThemeDefinition } from "@/lib/app-themes"
import { cn } from "@/lib/utils"

export function ThemeCustomizerButton() {
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
          aria-label="Customize app colors"
        >
          <Palette className="h-5 w-5 text-gray-700" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-3xl border border-gray-200 bg-white p-3 shadow-xl">
        <div className="mb-3 px-2">
          <h3 className="text-sm font-semibold text-gray-900">Color themes</h3>
          <p className="mt-1 text-xs text-gray-600">Pick the palette that feels best for this device.</p>
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
                      <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                      <p className="text-xs text-gray-600">{option.description}</p>
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
              <p className="text-sm font-semibold text-gray-900">Custom Mix builder</p>
              <p className="text-xs text-gray-600">Choose three colors, then activate Custom Mix.</p>
            </div>
            <Button type="button" size="sm" className="app-cta rounded-full px-3 text-xs" onClick={() => setTheme("custom")}>
              Use Custom
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <label className="space-y-1 text-xs text-gray-600">
              <span>Primary</span>
              <input
                type="color"
                value={customTheme.primary}
                onChange={(event) => setCustomTheme({ ...customTheme, primary: event.target.value })}
                className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
                aria-label="Choose custom primary color"
              />
            </label>
            <label className="space-y-1 text-xs text-gray-600">
              <span>Secondary</span>
              <input
                type="color"
                value={customTheme.secondary}
                onChange={(event) => setCustomTheme({ ...customTheme, secondary: event.target.value })}
                className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
                aria-label="Choose custom secondary color"
              />
            </label>
            <label className="space-y-1 text-xs text-gray-600">
              <span>Surface</span>
              <input
                type="color"
                value={customTheme.surface}
                onChange={(event) => setCustomTheme({ ...customTheme, surface: event.target.value })}
                className="h-10 w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-1"
                aria-label="Choose custom surface color"
              />
            </label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
