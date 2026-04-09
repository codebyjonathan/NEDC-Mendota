"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Phone, PhoneCall } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { translations, type Language } from "@/lib/translations"
import { CONFIG } from "@/lib/config"

function CallLifelineContent() {
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang") || "en"
  const lang: Language = langParam === "en" || langParam === "es" || langParam === "ar" ? langParam : "en"
  const t = translations[lang]
  const isRTL = lang === "ar"

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-20">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
            <Phone className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{t.callLifeline}</h2>
          <p className="text-gray-600 leading-relaxed px-2 text-lg">
            {lang === "en"
              ? "Connect with a trained crisis counselor who can help"
              : lang === "es"
                ? "Conéctate con un consejero de crisis capacitado que puede ayudar"
                : "تواصل مع مستشار أزمات مدرب يمكنه المساعدة"}
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-lg space-y-5">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">988 Suicide & Crisis Lifeline</h3>
              <p className="text-base text-gray-600 mb-6">{t.call988Desc}</p>
              <div className="text-6xl font-bold text-blue-600 mb-6">{CONFIG.CRISIS_HOTLINE}</div>
              <Button
                onClick={() => handleCall(CONFIG.CRISIS_HOTLINE)}
                className="w-full h-16 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xl font-semibold rounded-2xl flex items-center justify-center gap-3 shadow-lg"
              >
                <PhoneCall className="w-7 h-7" />
                {lang === "en" ? "Call Now" : lang === "es" ? "Llamar Ahora" : "اتصل الآن"}
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg space-y-5">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {lang === "en" ? "Other Crisis Lines" : lang === "es" ? "Otras Líneas de Crisis" : "خطوط أزمات أخرى"}
            </h3>
            <div className="space-y-4">
              <button
                onClick={() => handleCall(CONFIG.CRISIS_HOTLINE_ALT)}
                className="w-full p-6 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-2xl text-left transition-all shadow-md"
              >
                <div className="font-semibold text-gray-900 mb-2 text-lg">National Suicide Prevention Lifeline</div>
                <div className="text-blue-600 font-mono text-xl font-bold">{CONFIG.CRISIS_HOTLINE_ALT}</div>
              </button>
              <button
                onClick={() => handleCall(CONFIG.TREVOR_PROJECT)}
                className="w-full p-6 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-2xl text-left transition-all shadow-md"
              >
                <div className="font-semibold text-gray-900 mb-2 text-lg">Trevor Project (LGBTQ+ Youth)</div>
                <div className="text-purple-600 font-mono text-xl font-bold">{CONFIG.TREVOR_PROJECT}</div>
              </button>
              <button
                onClick={() => handleCall(CONFIG.TRANS_LIFELINE)}
                className="w-full p-6 bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 rounded-2xl text-left transition-all shadow-md"
              >
                <div className="font-semibold text-gray-900 mb-2 text-lg">Trans Lifeline</div>
                <div className="text-teal-600 font-mono text-xl font-bold">{CONFIG.TRANS_LIFELINE}</div>
              </button>
              <button
                onClick={() => handleCall(CONFIG.VETERANS_CRISIS)}
                className="w-full p-6 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-2xl text-left transition-all shadow-md"
              >
                <div className="font-semibold text-gray-900 mb-2 text-lg">Veterans Crisis Line</div>
                <div className="text-green-600 font-mono text-xl font-bold">{CONFIG.VETERANS_CRISIS} (Press 1)</div>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 shadow-md">
            <p className="text-base text-blue-900 text-center leading-relaxed font-medium">
              {lang === "en"
                ? "All calls are free, confidential, and available 24/7"
                : lang === "es"
                  ? "Todas las llamadas son gratuitas, confidenciales y están disponibles 24/7"
                  : "جميع المكالمات مجانية وسرية ومتاحة على مدار الساعة"}
            </p>
          </div>
        </div>
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

export default function CallLifelinePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      }
    >
      <CallLifelineContent />
    </Suspense>
  )
}
