"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wind, Play, Pause, RotateCcw } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { markSolarGoalCompleted } from "@/lib/solar-system-goals"
import { translations } from "@/lib/translations"

function BreathingContent() {
  const searchParams = useSearchParams()
  const lang = (searchParams.get("lang") || "en") as keyof typeof translations
  const t = translations[lang]
  const isRTL = lang === "ar"

  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale")
  const [count, setCount] = useState(4)
  const [cycles, setCycles] = useState(0)

  useEffect(() => {
    if (!isActive) return

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          // Move to next phase
          switch (phase) {
            case "inhale":
              setPhase("hold")
              return 4
            case "hold":
              setPhase("exhale")
              return 4
            case "exhale":
              setPhase("rest")
              return 2
            case "rest":
              setPhase("inhale")
              setCycles((c) => c + 1)
              return 4
          }
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isActive, phase])

  const reset = () => {
    setIsActive(false)
    setPhase("inhale")
    setCount(4)
    setCycles(0)
  }

  const getPhaseText = () => {
    switch (phase) {
      case "inhale":
        return lang === "en" ? "Breathe In" : lang === "es" ? "Inhala" : "استنشق"
      case "hold":
        return lang === "en" ? "Hold" : lang === "es" ? "Sostén" : "احتفظ"
      case "exhale":
        return lang === "en" ? "Breathe Out" : lang === "es" ? "Exhala" : "ازفر"
      case "rest":
        return lang === "en" ? "Rest" : lang === "es" ? "Descansa" : "استرح"
    }
  }

  const getPhaseColor = () => {
    switch (phase) {
      case "inhale":
        return "bg-blue-500"
      case "hold":
        return "bg-purple-500"
      case "exhale":
        return "bg-green-500"
      case "rest":
        return "bg-gray-400"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-20">
        <div className="text-center space-y-2">
          <Wind className="w-12 h-12 mx-auto text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">{t.breathingTitle}</h2>
          <p className="text-gray-600">{t.breathingDesc}</p>
        </div>

        <div className="flex flex-col items-center justify-center space-y-8 py-8">
          <div className="relative">
            <div
              className={`w-48 h-48 rounded-full ${getPhaseColor()} transition-all duration-1000 flex items-center justify-center shadow-2xl ${
                isActive ? "scale-110" : "scale-100"
              }`}
            >
              <div className="text-center text-white">
                <div className="text-5xl font-bold mb-2">{count}</div>
                <div className="text-xl font-semibold">{getPhaseText()}</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-sm text-gray-600 mb-4">
              {lang === "en" ? "Completed Cycles" : lang === "es" ? "Ciclos Completados" : "الدورات المكتملة"}: {cycles}
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => {
                  if (!isActive) markSolarGoalCompleted("start_breathing")
                  setIsActive(!isActive)
                }}
                className="h-12 px-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl flex items-center gap-2"
              >
                {isActive ? (
                  <>
                    <Pause className="w-5 h-5" />
                    {lang === "en" ? "Pause" : lang === "es" ? "Pausa" : "إيقاف"}
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    {lang === "en" ? "Start" : lang === "es" ? "Iniciar" : "ابدأ"}
                  </>
                )}
              </Button>
              <Button
                onClick={reset}
                className="h-12 px-6 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl flex items-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                {lang === "en" ? "Reset" : lang === "es" ? "Reiniciar" : "إعادة تعيين"}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-md space-y-3">
          <h3 className="font-bold text-gray-900">
            {lang === "en" ? "How It Helps" : lang === "es" ? "Cómo Ayuda" : "كيف يساعد"}
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>
                {lang === "en"
                  ? "Reduces anxiety and stress"
                  : lang === "es"
                    ? "Reduce la ansiedad y el estrés"
                    : "يقلل من القلق والتوتر"}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>
                {lang === "en"
                  ? "Calms the nervous system"
                  : lang === "es"
                    ? "Calma el sistema nervioso"
                    : "يهدئ الجهاز العصبي"}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>
                {lang === "en"
                  ? "Improves focus and clarity"
                  : lang === "es"
                    ? "Mejora el enfoque y la claridad"
                    : "يحسن التركيز والوضوح"}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500">•</span>
              <span>
                {lang === "en"
                  ? "Helps you feel grounded"
                  : lang === "es"
                    ? "Te ayuda a sentirte enraizado"
                    : "يساعدك على الشعور بالثبات"}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

export default function BreathingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      }
    >
      <BreathingContent />
    </Suspense>
  )
}
