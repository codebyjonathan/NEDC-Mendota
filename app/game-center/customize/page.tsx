"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { validateNickname } from "@/lib/chat-safety"
import type { Language } from "@/lib/translations"
import { translations } from "@/lib/translations"
import { Headphones } from "lucide-react"

const SUITS = ["#60a5fa", "#f472b6", "#34d399", "#f59e0b", "#a78bfa", "#f87171"]
const HELMETS = ["classic", "visor", "gold", "midnight"]
const BADGES = ["star", "moon", "planet", "comet"]

type BadgeType = "star" | "moon" | "planet" | "comet"
type HelmetStyle = "classic" | "visor" | "gold" | "midnight"

type GameCenterProfile = {
  nickname: string
  suitColor: string
  helmetStyle: HelmetStyle
  badge: BadgeType
  updatedAt: string
}

const GC_CUSTOMIZE_TRANSLATIONS = {
  en: {
    title: "Customize Your Character",
    subtitle: "Build Your Astronaut Profile",
    intro: "Create your astronaut look and choose a safe nickname.",
    nicknamePreview: "Your nickname appears here",
    nickname: "Nickname",
    nicknamePlaceholder: "Enter nickname",
    nicknameHelp: "3-18 chars. Allowed: letters, numbers, dot, underscore, hyphen.",
    invalidNickname: "Invalid nickname.",
    suitColor: "Suit Color",
    helmetStyle: "Helmet Style",
    chestIcon: "Chest Icon",
    saving: "Saving...",
    enterGameCenter: "Enter Game Center",
    cancel: "Cancel",
    profileSaveFailed: "Profile save failed.",
    helmets: {
      classic: "Classic",
      visor: "Visor",
      gold: "Gold",
      midnight: "Midnight",
    },
    badges: {
      star: "STAR",
      moon: "MOON",
      planet: "ORBIT",
      comet: "COMET",
    },
    suitColorAria: "Select suit color",
  },
  es: {
    title: "Personaliza Tu Personaje",
    subtitle: "Crea Tu Perfil de Astronauta",
    intro: "Crea el aspecto de tu astronauta y elige un apodo seguro.",
    nicknamePreview: "Tu apodo aparece aquí",
    nickname: "Apodo",
    nicknamePlaceholder: "Escribe apodo",
    nicknameHelp: "3-18 caracteres. Permitidos: letras, números, punto, guion bajo y guion.",
    invalidNickname: "Apodo no válido.",
    suitColor: "Color del Traje",
    helmetStyle: "Estilo de Casco",
    chestIcon: "Ícono del Pecho",
    saving: "Guardando...",
    enterGameCenter: "Entrar al Centro de Juegos",
    cancel: "Cancelar",
    profileSaveFailed: "Error al guardar el perfil.",
    helmets: {
      classic: "Clásico",
      visor: "Visor",
      gold: "Dorado",
      midnight: "Medianoche",
    },
    badges: {
      star: "ESTRELLA",
      moon: "LUNA",
      planet: "ÓRBITA",
      comet: "COMETA",
    },
    suitColorAria: "Seleccionar color del traje",
  },
  ar: {
    title: "تخصيص شخصيتك",
    subtitle: "أنشئ ملف رائد الفضاء الخاص بك",
    intro: "أنشئ مظهر رائد الفضاء واختر اسمًا آمنًا.",
    nicknamePreview: "سيظهر اسمك هنا",
    nickname: "الاسم",
    nicknamePlaceholder: "أدخل الاسم",
    nicknameHelp: "من 3 إلى 18 حرفًا. المسموح: الحروف والأرقام والنقطة والشرطة السفلية والشرطة.",
    invalidNickname: "اسم غير صالح.",
    suitColor: "لون البدلة",
    helmetStyle: "نمط الخوذة",
    chestIcon: "أيقونة الصدر",
    saving: "جارٍ الحفظ...",
    enterGameCenter: "الدخول إلى مركز الألعاب",
    cancel: "إلغاء",
    profileSaveFailed: "فشل حفظ الملف.",
    helmets: {
      classic: "كلاسيكي",
      visor: "حاجب",
      gold: "ذهبي",
      midnight: "ليلي",
    },
    badges: {
      star: "نجمة",
      moon: "قمر",
      planet: "مدار",
      comet: "مذنب",
    },
    suitColorAria: "اختر لون البدلة",
  },
} as const

function badgeLabel(type: BadgeType, lang: Language) {
  return GC_CUSTOMIZE_TRANSLATIONS[lang].badges[type]
}

function CustomizeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang") || "en"
  const currentLang = (langParam === "en" || langParam === "es" || langParam === "ar" ? langParam : "en") as Language
  const isRTL = currentLang === "ar"
  const t = GC_CUSTOMIZE_TRANSLATIONS[currentLang]
  const sharedT = translations[currentLang]

  const [nickname, setNickname] = useState("")
  const [suitColor, setSuitColor] = useState(SUITS[0])
  const [helmetStyle, setHelmetStyle] = useState<HelmetStyle>(HELMETS[0] as HelmetStyle)
  const [badge, setBadge] = useState<BadgeType>(BADGES[0] as BadgeType)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [showGameCenterAudioNotice, setShowGameCenterAudioNotice] = useState(false)
  const [gameCenterNoticeVisible, setGameCenterNoticeVisible] = useState(false)

  const helmetClass = useMemo(() => {
    if (helmetStyle === "visor") return "ring-cyan-200/80 bg-cyan-100/30"
    if (helmetStyle === "gold") return "ring-amber-200/80 bg-amber-100/25"
    if (helmetStyle === "midnight") return "ring-indigo-200/80 bg-indigo-100/25"
    return "ring-slate-200/80 bg-slate-100/25"
  }, [helmetStyle])

  const handleContinue = async () => {
    const result = validateNickname(nickname)
    if (!result.ok) {
      setError(result.reason ?? t.invalidNickname)
      return
    }

    setSaving(true)

    const profile: GameCenterProfile = {
      nickname: nickname.trim(),
      suitColor,
      helmetStyle,
      badge,
      updatedAt: new Date().toISOString(),
    }

    try {
      const response = await fetch("/api/game-center/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(typeof data?.error === "string" ? data.error : t.profileSaveFailed)
        setSaving(false)
        return
      }

      localStorage.setItem("game_center_profile_v1", JSON.stringify(data.profile ?? profile))
      setShowGameCenterAudioNotice(true)
      window.setTimeout(() => setGameCenterNoticeVisible(true), 10)
      window.setTimeout(() => setGameCenterNoticeVisible(false), 4000)
      window.setTimeout(() => {
        setShowGameCenterAudioNotice(false)
        router.push(`/game-center?lang=${currentLang}`)
      }, 4400)
    } catch {
      localStorage.setItem("game_center_profile_v1", JSON.stringify(profile))
      setShowGameCenterAudioNotice(true)
      window.setTimeout(() => setGameCenterNoticeVisible(true), 10)
      window.setTimeout(() => setGameCenterNoticeVisible(false), 4000)
      window.setTimeout(() => {
        setShowGameCenterAudioNotice(false)
        router.push(`/game-center?lang=${currentLang}`)
      }, 4400)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader title={t.title} subtitle={t.subtitle} />
      <div className="mx-auto w-full max-w-3xl space-y-4 px-4 py-6 pb-24">
        <div className="rounded-3xl border border-cyan-200/30 bg-gradient-to-br from-slate-900 to-slate-800 p-5">
          <p className="text-sm text-cyan-100">{t.intro}</p>

          <div className="mt-4 rounded-2xl border border-cyan-200/30 bg-black/25 p-4">
            <div className="mx-auto w-full max-w-[220px]">
              <AstronautAvatar suitColor={suitColor} helmetStyle={helmetStyle} badge={badge} />
            </div>
            <p className="mt-3 text-center text-sm text-slate-200">{nickname.trim() || t.nicknamePreview}</p>
          </div>

          <div className="mt-4 space-y-3">
            <label className="block text-sm font-semibold text-cyan-100">{t.nickname}</label>
            <input
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value)
                setError("")
              }}
              maxLength={18}
              placeholder={t.nicknamePlaceholder}
              className="h-11 w-full rounded-xl border border-cyan-200/30 bg-slate-950/60 px-3 text-white outline-none placeholder:text-slate-400 focus:border-cyan-300"
            />
            <p className="text-xs text-slate-300">{t.nicknameHelp}</p>
            {error ? <p className="text-xs font-semibold text-rose-300">{error}</p> : null}
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-cyan-100">{t.suitColor}</p>
            <div className="flex flex-wrap gap-2">
              {SUITS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSuitColor(color)}
                  className={`h-9 w-9 rounded-full ring-2 transition ${suitColor === color ? "ring-white" : "ring-transparent"}`}
                  style={{ backgroundColor: color }}
                  aria-label={`${t.suitColorAria} ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-cyan-100">{t.helmetStyle}</p>
            <div className="grid grid-cols-2 gap-2">
              {HELMETS.map((item) => (
                <Button key={item} onClick={() => setHelmetStyle(item as HelmetStyle)} variant={helmetStyle === item ? "default" : "secondary"}>
                  {t.helmets[item as HelmetStyle]}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold text-cyan-100">{t.chestIcon}</p>
            <div className="grid grid-cols-4 gap-2">
              {BADGES.map((item) => (
                <Button key={item} onClick={() => setBadge(item as BadgeType)} variant={badge === item ? "default" : "secondary"}>
                  {badgeLabel(item as BadgeType, currentLang)}
                </Button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex gap-2">
            <Button onClick={handleContinue} disabled={saving} className="bg-cyan-400 text-slate-950 hover:bg-cyan-300">
              {saving ? t.saving : t.enterGameCenter}
            </Button>
            <Link href={`/main?lang=${currentLang}`} data-transition-style="random">
              <Button variant="secondary">{t.cancel}</Button>
            </Link>
          </div>
        </div>
      </div>
      <BottomNav lang={currentLang} />
      {showGameCenterAudioNotice ? (
        <div
          className={`fixed inset-0 z-[130] bg-black/95 backdrop-blur-[2px] flex items-center justify-center transition-all duration-400 ${
            gameCenterNoticeVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`w-full max-w-xl px-8 text-center transition-all duration-400 ${
              gameCenterNoticeVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-95 opacity-0"
            }`}
          >
            <div className="mx-auto mb-6 w-16 h-16 rounded-full border border-white/45 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.12)]">
              <Headphones className="w-8 h-8 text-white" />
            </div>
            <p className="font-display text-white text-xl sm:text-2xl font-extrabold tracking-wide text-center leading-snug">
              {sharedT.pageContainsAudio}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function AstronautAvatar({
  suitColor,
  helmetStyle,
  badge,
}: {
  suitColor: string
  helmetStyle: HelmetStyle
  badge: BadgeType
}) {
  const visorFill = helmetStyle === "gold" ? "#f59e0b" : helmetStyle === "midnight" ? "#6366f1" : helmetStyle === "visor" ? "#22d3ee" : "#94a3b8"
  const trimColor = helmetStyle === "gold" ? "#fde68a" : helmetStyle === "midnight" ? "#c7d2fe" : helmetStyle === "visor" ? "#a5f3fc" : "#e2e8f0"

  return (
    <svg viewBox="0 0 220 220" className="h-44 w-full">
      <ellipse cx="110" cy="200" rx="54" ry="11" fill="#00000066" />
      <rect x="72" y="104" width="76" height="82" rx="20" fill={suitColor} stroke="#e2e8f0" strokeWidth="3" />
      <rect x="89" y="118" width="42" height="32" rx="8" fill="#0f172a" stroke="#94a3b8" strokeWidth="2" />
      {badge === "star" && (
        <path
          d="M110 124 L113.5 131.3 L121.5 132.2 L115.6 137.6 L117.1 145.4 L110 141.4 L102.9 145.4 L104.4 137.6 L98.5 132.2 L106.5 131.3 Z"
          fill="#fde68a"
          stroke="#fef3c7"
          strokeWidth="1.2"
        />
      )}
      {badge === "moon" && (
        <>
          <circle cx="110" cy="134" r="9" fill="#e2e8f0" />
          <circle cx="114" cy="132" r="8" fill="#0f172a" />
        </>
      )}
      {badge === "planet" && (
        <>
          <circle cx="110" cy="134" r="7" fill="#93c5fd" />
          <ellipse cx="110" cy="134" rx="13" ry="4.5" fill="none" stroke="#bfdbfe" strokeWidth="1.8" />
        </>
      )}
      {badge === "comet" && (
        <>
          <circle cx="115" cy="129" r="4.8" fill="#fef08a" />
          <path d="M98 141 C103 136,108 133,113 131" stroke="#fde68a" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M101 144 C106 139,109 137,114 134" stroke="#fef3c7" strokeWidth="1.4" strokeLinecap="round" />
        </>
      )}
      <rect x="54" y="118" width="18" height="52" rx="9" fill={suitColor} stroke="#e2e8f0" strokeWidth="3" />
      <rect x="148" y="118" width="18" height="52" rx="9" fill={suitColor} stroke="#e2e8f0" strokeWidth="3" />
      <rect x="84" y="176" width="18" height="24" rx="7" fill="#cbd5e1" stroke="#e2e8f0" strokeWidth="2" />
      <rect x="118" y="176" width="18" height="24" rx="7" fill="#cbd5e1" stroke="#e2e8f0" strokeWidth="2" />
      <circle cx="110" cy="74" r="40" fill="#f8fafc" stroke={trimColor} strokeWidth="4" />
      <ellipse cx="110" cy="78" rx="28" ry="20" fill={visorFill} opacity="0.85" />
      <circle cx="100" cy="71" r="5" fill="#f8fafc" opacity="0.7" />
      <rect x="99" y="28" width="22" height="8" rx="4" fill={trimColor} />
    </svg>
  )
}

export default function CustomizeCharacterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
      <CustomizeContent />
    </Suspense>
  )
}
