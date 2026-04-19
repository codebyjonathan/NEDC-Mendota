"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Phone, MessageCircle, MapPin, Wind, Book, Music, Sparkles } from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { translations } from "@/lib/translations"
import { applyRandomDirectionalRouteTransitionVariant } from "@/lib/route-transition-variant"

function MainScreenContent() {
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang") || "en"
  const lang = (
    langParam === "en" || langParam === "es" || langParam === "ar" ? langParam : "en"
  ) as keyof typeof translations
  const t = translations[lang]
  const isRTL = lang === "ar"
  const handleDirectionalTransition = () => {
    applyRandomDirectionalRouteTransitionVariant()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-5 py-8 space-y-8 pb-24">
        <h2 className="text-2xl font-bold text-gray-900 text-center px-4">{t.greeting}</h2>

        <Link href={`/support?lang=${lang}`} onClick={handleDirectionalTransition}>
          <Button className="app-cta w-full h-20 text-xl font-semibold rounded-3xl shadow-lg">
            {t.getSupport}
          </Button>
        </Link>

        <div className="grid grid-cols-2 gap-5 mt-6">
          <Link
            href={`/call-lifeline?lang=${lang}`}
            onClick={handleDirectionalTransition}
            className="bg-white rounded-3xl p-6 shadow-md flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow min-h-[120px]"
          >
            <Phone className="w-8 h-8 text-gray-700 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900 text-center leading-tight">{t.callLifeline}</span>
          </Link>
          <Link
            href={`/text-lifeline?lang=${lang}`}
            onClick={handleDirectionalTransition}
            className="bg-white rounded-3xl p-6 shadow-md flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow min-h-[120px]"
          >
            <MessageCircle className="w-8 h-8 text-gray-700 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900 text-center leading-tight">{t.textLifeline}</span>
          </Link>
          <Link
            href={`/chat-support?lang=${lang}`}
            onClick={handleDirectionalTransition}
            className="bg-white rounded-3xl p-6 shadow-md flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow min-h-[120px]"
          >
            <MessageCircle className="w-8 h-8 text-gray-700 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900 text-center leading-tight">{t.chatSupport}</span>
          </Link>
          <Link
            href={`/emergency-location?lang=${lang}`}
            onClick={handleDirectionalTransition}
            className="bg-white rounded-3xl p-6 shadow-md flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-shadow min-h-[120px]"
          >
            <MapPin className="w-8 h-8 text-gray-700 flex-shrink-0" />
            <span className="text-sm font-medium text-gray-900 text-center leading-tight">{t.emergencyLocation}</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-6">{t.copingTools}</h3>
          <div className="grid grid-cols-4 gap-6">
            <Link
              href={`/breathing?lang=${lang}`}
              onClick={handleDirectionalTransition}
              className="flex flex-col items-center gap-3 hover:opacity-70 transition-opacity"
            >
              <Wind className="w-10 h-10" style={{ color: "#2B7FFF" }}/>
              <span className="text-xs text-center text-gray-900 leading-tight">{t.breathing}</span>
            </Link>
            <Link
              href={`/grounding?lang=${lang}`}
              onClick={handleDirectionalTransition}
              className="flex flex-col items-center gap-3 hover:opacity-70 transition-opacity"
            >
              <Sparkles className="w-10 h-10" style={{ color: "#00c950" }}/>
              <span className="text-xs text-center text-gray-900 leading-tight">{t.grounding}</span>
            </Link>
            <Link
              href={`/journal?lang=${lang}`}
              onClick={handleDirectionalTransition}
              className="flex flex-col items-center gap-3 hover:opacity-70 transition-opacity"
            >
              <Book className="w-10 h-10" style={{ color: "#fe9a00" }}/>
              <span className="text-xs text-center text-gray-900 leading-tight">{t.journal}</span>
            </Link>
            <Link
              href={`/music?lang=${lang}`}
              onClick={handleDirectionalTransition}
              className="flex flex-col items-center gap-3 hover:opacity-70 transition-opacity"
            >
              <Music className="w-10 h-10" style={{ color: "#615fff" }}/>
              <span className="text-xs text-center text-gray-900 leading-tight">{t.music}</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-md space-y-5">
          <h3 className="text-xl font-bold text-gray-900">{t.safetyPlan}</h3>
          <p className="text-base text-gray-600 leading-relaxed">{t.safetyDesc}</p>
          <Link href={`/safety-plan?lang=${lang}`} onClick={handleDirectionalTransition}>
            <Button className="app-cta w-full h-14 text-lg font-semibold rounded-2xl">
              {t.openSafety}
            </Button>
          </Link>
        </div>
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
