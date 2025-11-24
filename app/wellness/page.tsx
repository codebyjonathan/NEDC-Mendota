"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Heart, Sun, Moon, Utensils, Activity, Users, Smile } from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { translations, type Language } from "@/lib/translations"

function WellnessContent() {
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang") || "en"
  const lang: Language = langParam === "en" || langParam === "es" || langParam === "ar" ? langParam : "en"
  const t = translations[lang]
  const isRTL = lang === "ar"

  const wellnessTips = [
    {
      title: t.sleepRoutine,
      description: t.sleepRoutineDescription,
      icon: Moon,
      color: "bg-indigo-500",
    },
    {
      title: t.healthyEating,
      description: t.healthyEatingDescription,
      icon: Utensils,
      color: "bg-green-500",
    },
    {
      title: t.physicalActivity,
      description: t.physicalActivityDescription,
      icon: Activity,
      color: "bg-orange-500",
    },
    {
      title: t.socialConnection,
      description: t.socialConnectionDescription,
      icon: Users,
      color: "bg-pink-500",
    },
    {
      title: t.sunlightAndFreshAir,
      description: t.sunlightAndFreshAirDescription,
      icon: Sun,
      color: "bg-yellow-500",
    },
    {
      title: t.selfCompassion,
      description: t.selfCompassionDescription,
      icon: Smile,
      color: "bg-purple-500",
    },
  ]

  const quickActivities = [
    {
      title: t.takeAWalk,
      duration: t.takeAWalkDuration,
    },
    {
      title: t.listenToMusic,
      duration: t.listenToMusicDuration,
      link: `/music?lang=${lang}`,
    },
    {
      title: t.breathingExercise,
      duration: t.breathingExerciseDuration,
      link: `/breathing?lang=${lang}`,
    },
    {
      title: t.journal,
      duration: t.journalDuration,
      link: `/journal?lang=${lang}`,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-20">
        <div className="text-center space-y-2">
          <Heart className="w-12 h-12 mx-auto text-pink-600" />
          <h2 className="text-2xl font-bold text-gray-900">{t.wellnessTitle}</h2>
          <p className="text-gray-600">{t.smallStepsTowardsBetterHealth}</p>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900">{t.dailyWellnessHabits}</h3>
          <div className="grid gap-3">
            {wellnessTips.map((tip) => {
              const Icon = tip.icon
              return (
                <div key={tip.title} className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4">
                  <div className={`${tip.color} w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900">{tip.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{tip.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold text-gray-900">{t.quickActivities}</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActivities.map((activity) => (
              <Link key={activity.title} href={activity.link || "#"}>
                <div className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow h-full">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">{activity.title}</h4>
                  <p className="text-xs text-gray-600">{activity.duration}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-pink-50 border border-pink-200 rounded-2xl p-5">
          <h4 className="font-bold text-pink-900 mb-2">{t.remember}</h4>
          <p className="text-sm text-pink-800">{t.wellnessIsAJourney}</p>
        </div>
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

export default function WellnessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600" />
        </div>
      }
    >
      <WellnessContent />
    </Suspense>
  )
}
