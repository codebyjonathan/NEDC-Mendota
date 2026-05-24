"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { NotificationBell } from "./notification-bell-v2"
import { NotificationSettingsButton } from "./notification-settings-button"
import { ThemeCustomizerButton } from "./theme-customizer-button"

export function AppHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  hideControlsOnMobile = false,
}: {
  title: string
  subtitle: string
  backHref?: string
  backLabel?: string
  hideControlsOnMobile?: boolean
}) {
  return (
    <div className="bg-white px-6 py-4 flex items-center gap-4 shadow-sm">
      {backHref ? (
        <Link
          href={backHref}
          aria-label={backLabel}
          className="h-10 w-10 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center justify-center flex-shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
      ) : null}
      <div className="w-14 h-14 flex-shrink-0">
        <Image src="/logo.png" alt="Logo" width={56} height={56} className="w-full h-full object-contain" />
      </div>
      <div className="flex-1">
        <h1 className="font-display text-lg font-extrabold text-gray-900 leading-tight tracking-tight">{title}</h1>
        <p className="font-display text-xs font-medium text-gray-600 tracking-tight">{subtitle}</p>
      </div>
      <div className={`${hideControlsOnMobile ? "hidden md:flex" : "flex"} flex-shrink-0 items-center gap-1`}>
        <ThemeCustomizerButton />
        <NotificationSettingsButton />
        <NotificationBell />
      </div>
    </div>
  )
}
