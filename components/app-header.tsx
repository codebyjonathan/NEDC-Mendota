"use client"

import Image from "next/image"
import { NotificationBell } from "./notification-bell-v2"
import { NotificationSettingsButton } from "./notification-settings-button"
import { ThemeCustomizerButton } from "./theme-customizer-button"

export function AppHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="bg-white px-6 py-4 flex items-center gap-4 shadow-sm">
      <div className="w-14 h-14 flex-shrink-0">
        <Image src="/logo.png" alt="Logo" width={56} height={56} className="w-full h-full object-contain" />
      </div>
      <div className="flex-1">
        <h1 className="font-display text-lg font-extrabold text-gray-900 leading-tight tracking-tight">{title}</h1>
        <p className="font-display text-xs font-medium text-gray-600 tracking-tight">{subtitle}</p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-1">
        <ThemeCustomizerButton />
        <NotificationSettingsButton />
        <NotificationBell />
      </div>
    </div>
  )
}
