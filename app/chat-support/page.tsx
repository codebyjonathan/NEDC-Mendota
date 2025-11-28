"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, ExternalLink } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { translations, type Language } from "@/lib/translations"
import { CONFIG } from "@/lib/config"

function ChatSupportContent() {
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang") || "en"
  const lang: Language = langParam === "en" || langParam === "es" || langParam === "ar" ? langParam : "en"
  const t = translations[lang]
  const isRTL = lang === "ar"
  const [loading, setLoading] = useState(false)

  const chatServices = [
    {
      name: "988 Suicide & Crisis Lifeline",
      description:
        lang === "en"
          ? "Chat with trained crisis counselors"
          : lang === "es"
            ? "Chatea con consejeros de crisis capacitados"
            : "دردش مع مستشاري الأزمات المدربين",
      url: CONFIG.CRISIS_CHAT,
      available: "24/7",
      color: "bg-[#2B7FFF] text-white", 
    },
    {
      name: "Crisis Text Line",
      description:
        lang === "en"
          ? "Web-based chat support"
          : lang === "es"
            ? "Apoyo por chat basado en web"
            : "دعم الدردشة على الويب",
      url: "https://www.crisistextline.org/",
      available: "24/7",
      color: "bg-gradient-to-r from-[#ad46ff] to-[#6e1aff] text-white", // gradient purple
    },
    {
      name: "The Trevor Project",
      description:
        lang === "en"
          ? "LGBTQ+ youth crisis support"
          : lang === "es"
            ? "Apoyo de crisis para jóvenes LGBTQ+"
            : "دعم أزمات الشباب LGBTQ+",
      url: CONFIG.TREVOR_CHAT,
      available: "24/7",
      color: "bg-[#f6339a] text-white", 
    },
  ]

  const handleOpenChat = (url: string) => {
    setLoading(true)
    window.open(url, "_blank")
    setTimeout(() => setLoading(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-cyan-50 flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-20">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-teal-500 rounded-full mx-auto flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{t.chatSupport}</h2>
          <p className="text-gray-600">
            {lang === "en"
              ? "Connect through live chat with someone who cares"
              : lang === "es"
                ? "Conéctate a través de chat en vivo con alguien que se preocupa"
                : "تواصل عبر الدردشة المباشرة مع شخص يهتم"}
          </p>
        </div>

        <div className="space-y-4">
          {chatServices.map((service) => (
                <div key={service.name} className="bg-white rounded-2xl p-5 shadow-md">
                <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">
                  {service.available}
                </span>
              </div>
              <Button
                onClick={() => handleOpenChat(service.url)}
                disabled={loading}
                className={`w-full h-12 ${service.color} font-semibold rounded-xl flex items-center justify-center gap-2`}
              >
                <ExternalLink className="w-5 h-5" />
                {lang === "en" ? "Start Chat" : lang === "es" ? "Iniciar Chat" : "ابدأ الدردشة"}
              </Button>
            </div>
          ))}
        </div>

        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
          <p className="text-sm text-teal-800 text-center">
            {lang === "en"
              ? "All chat services are free, confidential, and staffed by trained volunteers"
              : lang === "es"
                ? "Todos los servicios de chat son gratuitos, confidenciales y atendidos por voluntarios capacitados"
                : "جميع خدمات الدردشة مجانية وسرية ويعمل بها متطوعون مدربون"}
          </p>
        </div>
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

export default function ChatSupportPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
        </div>
      }
    >
      <ChatSupportContent />
    </Suspense>
  )
}
