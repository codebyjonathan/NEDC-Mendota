"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Phone, MessageCircle, MapPin, Wind, Book, Music, Sparkles, Headphones } from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { SolarSystemJourney } from "@/components/solar-system-journey"
import { translations } from "@/lib/translations"
import { getCommunityBanRemainingMs, getCommunityBanState, isCommunityBanActive } from "@/lib/safe-space/community-ban"

function ScrollReveal({
  children,
  delay = 0,
}: {
  children: ReactNode
  delay?: number
}) {
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -8% 0px",
      },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={sectionRef}
      className={`scroll-reveal ${isVisible ? "is-visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

function MainScreenContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const langParam = searchParams.get("lang") || "en"
  const lang = (
    langParam === "en" || langParam === "es" || langParam === "ar" ? langParam : "en"
  ) as keyof typeof translations
  const t = translations[lang]
  const isRTL = lang === "ar"
  const [communityBanMessage, setCommunityBanMessage] = useState<string | null>(null)
  const [communityBanned, setCommunityBanned] = useState(false)
  const [showGameCenterAudioNotice, setShowGameCenterAudioNotice] = useState(false)
  const [gameCenterNoticeVisible, setGameCenterNoticeVisible] = useState(false)

  useEffect(() => {
    const syncBanState = () => {
      const state = getCommunityBanState()
      const active = isCommunityBanActive(state.bannedUntil)
      setCommunityBanned(active)
      if (!active) setCommunityBanMessage(null)
    }

    syncBanState()
    const timer = window.setInterval(syncBanState, 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    void router.prefetch(`/game-center/customize?lang=${lang}`)
  }, [lang, router])

  const handleBlockedCommunitiesClick = () => {
    const state = getCommunityBanState()
    const remainingMs = getCommunityBanRemainingMs(state.bannedUntil)
    const remainingSec = Math.ceil(remainingMs / 1000)
    setCommunityBanMessage(
      `You're currently banned due to going against Community Guidelines for ${remainingSec} seconds.`,
    )
  }

  const handleOpenGameCenter = () => {
    setShowGameCenterAudioNotice(true)
    window.setTimeout(() => setGameCenterNoticeVisible(true), 10)
    window.setTimeout(() => setGameCenterNoticeVisible(false), 4000)
    window.setTimeout(() => {
      setShowGameCenterAudioNotice(false)
      router.push(`/game-center/customize?lang=${lang}`)
    }, 4400)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      {/* Main Content */}
      <div className="home-scroll-shell flex-1 overflow-y-auto px-5 py-8 space-y-8 pb-24">
        <ScrollReveal>
          <h2 className="font-display text-3xl font-extrabold text-gray-900 text-center px-4 tracking-tight">{t.greeting}</h2>
        </ScrollReveal>

        <ScrollReveal delay={40}>
          <Link href={`/support?lang=${lang}`} data-transition-style="random">
            <Button className="app-cta font-display w-full h-20 text-xl font-bold tracking-[0.01em] rounded-3xl shadow-lg">
              {t.getSupport}
            </Button>
          </Link>
        </ScrollReveal>

        <ScrollReveal delay={70}>
          <div className="grid grid-cols-2 gap-5 mt-6">
            <Link
              href={`/call-lifeline?lang=${lang}`}
              data-transition-style="random"
              className="bg-white rounded-3xl p-6 shadow-md flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow min-h-[120px]"
            >
              <Phone className="w-8 h-8 text-gray-700 flex-shrink-0" />
              <span className="font-display text-base font-semibold text-gray-900 text-center leading-tight">{t.callLifeline}</span>
            </Link>
            <Link
              href={`/text-lifeline?lang=${lang}`}
              data-transition-style="random"
              className="bg-white rounded-3xl p-6 shadow-md flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow min-h-[120px]"
            >
              <MessageCircle className="w-8 h-8 text-gray-700 flex-shrink-0" />
              <span className="font-display text-base font-semibold text-gray-900 text-center leading-tight">{t.textLifeline}</span>
            </Link>
            <Link
              href={`/chat-support?lang=${lang}`}
              data-transition-style="random"
              className="bg-white rounded-3xl p-6 shadow-md flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow min-h-[120px]"
            >
              <MessageCircle className="w-8 h-8 text-gray-700 flex-shrink-0" />
              <span className="font-display text-base font-semibold text-gray-900 text-center leading-tight">{t.chatSupport}</span>
            </Link>
            <Link
              href={`/emergency-location?lang=${lang}`}
              data-transition-style="random"
              className="bg-white rounded-3xl p-6 shadow-md flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow min-h-[120px]"
            >
              <MapPin className="w-8 h-8 text-gray-700 flex-shrink-0" />
              <span className="font-display text-base font-semibold text-gray-900 text-center leading-tight">{t.emergencyLocation}</span>
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={90}>
          <div className="bg-white rounded-3xl p-6 shadow-md">
            <h3 className="font-display text-xl font-bold text-gray-900 mb-6 tracking-tight">{t.copingTools}</h3>
            <div className="grid grid-cols-4 gap-4 sm:gap-6">
              <Link
                href={`/breathing?lang=${lang}`}
                data-transition-style="random"
                className="flex flex-col items-center gap-3 hover:opacity-70 transition-opacity"
              >
                <Wind className="w-10 h-10" style={{ color: "#2B7FFF" }} />
                <span className="max-w-[72px] font-display text-[11px] font-medium text-center text-gray-900 leading-tight break-words sm:max-w-[92px] sm:text-sm">{t.breathing}</span>
              </Link>
              <Link
                href={`/grounding?lang=${lang}`}
                data-transition-style="random"
                className="flex flex-col items-center gap-3 hover:opacity-70 transition-opacity"
              >
                <Sparkles className="w-10 h-10" style={{ color: "#00c950" }} />
                <span className="max-w-[72px] font-display text-[11px] font-medium text-center text-gray-900 leading-tight break-words sm:max-w-[92px] sm:text-sm">{t.grounding}</span>
              </Link>
              <Link
                href={`/journal?lang=${lang}`}
                data-transition-style="random"
                className="flex flex-col items-center gap-3 hover:opacity-70 transition-opacity"
              >
                <Book className="w-10 h-10" style={{ color: "#fe9a00" }} />
                <span className="max-w-[72px] font-display text-[11px] font-medium text-center text-gray-900 leading-tight break-words sm:max-w-[92px] sm:text-sm">
                  {t.journal.replace("/", "/ ")}
                </span>
              </Link>
              <Link
                href={`/music?lang=${lang}`}
                data-transition-style="random"
                className="flex flex-col items-center gap-3 hover:opacity-70 transition-opacity"
              >
                <Music className="w-10 h-10" style={{ color: "#615fff" }} />
                <span className="max-w-[72px] font-display text-[11px] font-medium text-center text-gray-900 leading-tight break-words sm:max-w-[92px] sm:text-sm">{t.music}</span>
              </Link>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={110}>
          <div className="rounded-3xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 p-6 shadow-md space-y-5">
            <h3 className="font-display text-xl font-bold text-emerald-950 tracking-tight">{t.safetyPlan}</h3>
            <p className="text-base text-emerald-900/80 leading-relaxed">{t.safetyDesc}</p>
            <Link href={`/safety-plan?lang=${lang}`} data-transition-style="random">
              <Button className="font-display w-full h-14 text-lg font-bold rounded-2xl bg-emerald-600 text-white hover:bg-emerald-500">
                {t.openSafety}
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={120}>
          <div className="rounded-3xl border border-blue-300/50 bg-gradient-to-br from-blue-100 via-sky-50 to-cyan-100 p-6 shadow-md space-y-5">
            <h3 className="font-display text-xl font-bold text-blue-950 tracking-tight">{t.communitiesTitle}</h3>
            <p className="text-base text-blue-900/85 leading-relaxed">{t.communitiesDesc}</p>
            {communityBanned ? (
              <Button
                onClick={handleBlockedCommunitiesClick}
                className="font-display w-full h-14 text-lg font-bold rounded-2xl bg-gray-500 text-white hover:bg-gray-500"
              >
                {t.openCommunities}
              </Button>
            ) : (
              <Link href={`/safe-space-communities?lang=${lang}`} data-transition-style="random">
                <Button
                  onClick={() => {
                    try {
                      window.localStorage.removeItem("safe_space_guidelines_accepted_v1")
                    } catch {
                      // no-op
                    }
                  }}
                  className="font-display w-full h-14 text-lg font-bold rounded-2xl bg-blue-700 text-white hover:bg-blue-600"
                >
                  {t.openCommunities}
                </Button>
              </Link>
            )}
            {communityBanMessage ? (
              <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-xl p-3">{communityBanMessage}</p>
            ) : null}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={130}>
          <div className="rounded-3xl border border-fuchsia-200/40 bg-gradient-to-br from-fuchsia-50 via-rose-50 to-amber-50 p-6 shadow-md space-y-5">
            <h3 className="font-display text-xl font-bold text-fuchsia-950 tracking-tight">{t.gameCenterTitle}</h3>
            <p className="text-base text-fuchsia-900/80 leading-relaxed">{t.gameCenterDesc}</p>
            <Button
              onClick={handleOpenGameCenter}
              className="font-display w-full h-14 text-lg font-bold rounded-2xl bg-fuchsia-600 text-white hover:bg-fuchsia-500"
            >
              {t.openGameCenter}
            </Button>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <SolarSystemJourney lang={lang} />
        </ScrollReveal>

      </div>

      <BottomNav lang={lang} />

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
              {t.pageContainsAudio}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default function MainScreen() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "var(--app-accent)" }} />
        </div>
      }
    >
      <MainScreenContent />
    </Suspense>
  )
}
