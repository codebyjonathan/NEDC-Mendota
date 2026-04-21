"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Phone, MessageCircle, Video, MapPin, HeartHandshake } from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { translations } from "@/lib/translations"

function SupportContent() {
  const searchParams = useSearchParams()
  const lang = (searchParams.get("lang") || "en") as keyof typeof translations
  const t = translations[lang]
  const isRTL = lang === "ar"

  const supportOptions = [
    {
      title: t.callLifeline,
      description:
        lang === "en"
          ? "Talk to a trained counselor"
          : lang === "es"
            ? "Habla con un consejero capacitado"
            : "تحدث مع مستشار مدرب",
      icon: Phone,
      href: `/call-lifeline?lang=${lang}`,
      color: "bg-blue-500",
    },
    {
      title: t.textLifeline,
      description:
        lang === "en"
          ? "Text a crisis counselor"
          : lang === "es"
            ? "Envía un mensaje a un consejero de crisis"
            : "أرسل رسالة نصية إلى مستشار أزمات",
      icon: MessageCircle,
      href: `/text-lifeline?lang=${lang}`,
      color: "bg-purple-500",
    },
    {
      title: t.chatSupport,
      description:
        lang === "en"
          ? "Live chat support available"
          : lang === "es"
            ? "Chat en vivo disponible"
            : "الدردشة المباشرة متاحة",
      icon: Video,
      href: `/chat-support?lang=${lang}`,
      color: "bg-teal-500",
    },
    {
      title: t.emergencyLocation,
      description:
        lang === "en"
          ? "Share your location for help"
          : lang === "es"
            ? "Comparte tu ubicación para ayuda"
            : "شارك موقعك للحصول على المساعدة",
      icon: MapPin,
      href: `/emergency-location?lang=${lang}`,
      color: "bg-red-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-blue-50 flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      <div className="home-scroll-shell flex-1 overflow-y-auto px-5 py-8 space-y-8 pb-24">
        <div className="text-center space-y-4">
          <HeartHandshake className="w-20 h-20 mx-auto text-teal-600" />
          <h2 className="text-3xl font-bold text-gray-900">{t.getSupport}</h2>
          <p className="text-lg text-gray-600 leading-relaxed px-4">
            {lang === "en"
              ? "Choose how you'd like to connect with support"
              : lang === "es"
                ? "Elige cómo te gustaría conectar con apoyo"
                : "اختر كيف تريد التواصل مع الدعم"}
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {supportOptions.map((option) => {
            const Icon = option.icon
            return (
              <Link key={option.href} href={option.href}>
                <div className="bg-white rounded-3xl p-6 shadow-md hover:shadow-lg transition-shadow flex items-center gap-6">
                  <div
                    className={`${option.color} w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md`}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-base text-gray-600">{option.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 shadow-sm">
          <p className="text-base text-red-800 font-medium text-center leading-relaxed">
            {lang === "en"
              ? "If you're in immediate danger, call 911 or your local emergency number"
              : lang === "es"
                ? "Si estás en peligro inmediato, llama al 911 o tu número de emergencia local"
                : "إذا كنت في خطر فوري، اتصل بالرقم 911 أو رقم الطوارئ المحلي"}
          </p>
        </div>

        <Link href={`/privacy-policy?lang=${lang}`} className="block">
          <div className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 text-center hover:bg-slate-50 transition-colors">
            Privacy Policy
          </div>
        </Link>

      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

export default function SupportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
        </div>
      }
    >
      <SupportContent />
    </Suspense>
  )
}
