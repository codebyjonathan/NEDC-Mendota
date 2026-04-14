"use client"

import { Home, Wrench, AlertCircle, Heart, CalendarDays } from "lucide-react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

interface BottomNavProps {
  lang: string
}

export function BottomNav({ lang }: BottomNavProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentLang = searchParams.get("lang") || lang

  const translations = {
    en: {
      home: "HOME",
      tools: "TOOLS",
      emergency: "EMERGENCY",
      wellness: "WELLNESS",
      resources: "RESOURCES",
    },
    es: {
      home: "INICIO",
      tools: "HERRAMIENTAS",
      emergency: "EMERGENCIA",
      wellness: "BIENESTAR",
      resources: "RECURSOS",
    },
    ar: {
      home: "الرئيسية",
      tools: "الأدوات",
      emergency: "طوارئ",
      wellness: "العافية",
      resources: "موارد",
    },
  }

  const t = translations[lang as keyof typeof translations] || translations.en

  const navItems = [
    { href: "/main", icon: Home, label: t.home },
    { href: "/tools", icon: Wrench, label: t.tools },
    { href: "/emergency", icon: AlertCircle, label: t.emergency },
    { href: "/wellness", icon: Heart, label: t.wellness },
    { href: "/resources", icon: CalendarDays, label: t.resources },
  ]

  return (
    <div className="bg-white border-t border-gray-200 px-2 py-2 flex justify-around items-center">
      {navItems.map((item, index) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        const isEmergency = item.href === "/emergency"

        return (
          <Link
            key={item.href}
            href={`${item.href}?lang=${currentLang}`}
            className="flex flex-col items-center gap-1 py-2 px-1 min-w-0 flex-1"
          >
            <Icon
              className={`w-6 h-6 flex-shrink-0 ${isEmergency ? "text-red-600" : isActive ? "" : "text-gray-600"}`}
              style={isEmergency ? undefined : isActive ? { color: "var(--app-accent-strong)" } : undefined}
            />
            <span
              className={`text-[10px] font-semibold text-center leading-tight ${isEmergency ? "text-red-600" : isActive ? "" : "text-gray-600"}`}
              style={isEmergency ? undefined : isActive ? { color: "var(--app-accent-strong)" } : undefined}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
