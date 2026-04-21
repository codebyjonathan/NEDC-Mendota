"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Phone, MessageCircle, MapPin, Wind, Book, Music, Sparkles } from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { SolarSystemJourney } from "@/components/solar-system-journey"
import { translations } from "@/lib/translations"

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
  const langParam = searchParams.get("lang") || "en"
  const lang = (
    langParam === "en" || langParam === "es" || langParam === "ar" ? langParam : "en"
  ) as keyof typeof translations
  const t = translations[lang]
  const isRTL = lang === "ar"

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
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-6">
              <Link
                href={`/breathing?lang=${lang}`}
                data-transition-style="random"
                className="flex flex-col items-center gap-3 hover:opacity-70 transition-opacity"
              >
                <Wind className="w-10 h-10" style={{ color: "#2B7FFF" }} />
                <span className="max-w-[92px] font-display text-xs font-medium text-center text-gray-900 leading-tight break-words sm:text-sm">{t.breathing}</span>
              </Link>
              <Link
                href={`/grounding?lang=${lang}`}
                data-transition-style="random"
                className="flex flex-col items-center gap-3 hover:opacity-70 transition-opacity"
              >
                <Sparkles className="w-10 h-10" style={{ color: "#00c950" }} />
                <span className="max-w-[92px] font-display text-xs font-medium text-center text-gray-900 leading-tight break-words sm:text-sm">{t.grounding}</span>
              </Link>
              <Link
                href={`/journal?lang=${lang}`}
                data-transition-style="random"
                className="flex flex-col items-center gap-3 hover:opacity-70 transition-opacity"
              >
                <Book className="w-10 h-10" style={{ color: "#fe9a00" }} />
                <span className="max-w-[92px] font-display text-xs font-medium text-center text-gray-900 leading-tight break-words sm:text-sm">{t.journal}</span>
              </Link>
              <Link
                href={`/music?lang=${lang}`}
                data-transition-style="random"
                className="flex flex-col items-center gap-3 hover:opacity-70 transition-opacity"
              >
                <Music className="w-10 h-10" style={{ color: "#615fff" }} />
                <span className="max-w-[92px] font-display text-xs font-medium text-center text-gray-900 leading-tight break-words sm:text-sm">{t.music}</span>
              </Link>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={110}>
          <div className="bg-white rounded-3xl p-6 shadow-md space-y-5">
            <h3 className="font-display text-xl font-bold text-gray-900 tracking-tight">{t.safetyPlan}</h3>
            <p className="text-base text-gray-600 leading-relaxed">{t.safetyDesc}</p>
            <Link href={`/safety-plan?lang=${lang}`} data-transition-style="random">
              <Button className="app-cta font-display w-full h-14 text-lg font-bold rounded-2xl">
                {t.openSafety}
              </Button>
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={130}>
          <SolarSystemJourney />
        </ScrollReveal>

      </div>

      <BottomNav lang={lang} />
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
