"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, Phone, MessageSquare, MapPin, ExternalLink } from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { translations, type Language } from "@/lib/translations"
import { CONFIG } from "@/lib/config"
import { markSolarGoalCompleted } from "@/lib/solar-system-goals"

function EmergencyContent() {
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang") || "en"
  const lang: Language = langParam === "en" || langParam === "es" || langParam === "ar" ? langParam : "en"
  const t = translations[lang]
  const isRTL = lang === "ar"

  useEffect(() => {
    markSolarGoalCompleted("browse_lifeline_options")
  }, [])

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-20">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-red-600 rounded-full mx-auto flex items-center justify-center animate-pulse shadow-lg">
            <AlertCircle className="w-14 h-14 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-red-900">{t.emergencyTitle}</h2>
          <p className="text-lg text-gray-700 font-medium leading-relaxed">
            {lang === "en"
              ? "You're not alone. Help is available now."
              : lang === "es"
                ? "No estás solo. La ayuda está disponible ahora."
                : "أنت لست وحدك. المساعدة متاحة الآن."}
          </p>
        </div>

        <div className="bg-gradient-to-r from-red-100 to-red-50 border-2 border-red-400 rounded-3xl p-6 shadow-lg">
          <p className="text-center text-red-900 font-bold text-xl mb-5">
            {lang === "en"
              ? "If you're in immediate danger:"
              : lang === "es"
                ? "Si estás en peligro inmediato:"
                : "إذا كنت في خطر فوري:"}
          </p>
          <Button
            onClick={() => handleCall("911")}
            className="w-full h-20 bg-red-600 hover:bg-red-700 text-white text-2xl font-bold rounded-2xl shadow-xl"
          >
            <Phone className="w-8 h-8 mr-3" />
            {lang === "en" ? "CALL 911" : lang === "es" ? "LLAMAR AL 911" : "اتصل بـ 911"}
          </Button>
        </div>

        <div className="space-y-5">
          <h3 className="text-2xl font-bold text-gray-900 text-center">
            {lang === "en" ? "Crisis Support Lines" : lang === "es" ? "Líneas de Apoyo en Crisis" : "خطوط دعم الأزمات"}
          </h3>

          <div className="bg-white rounded-3xl p-8 shadow-lg space-y-5">
            <h4 className="font-bold text-gray-900 text-xl">{t.call988}</h4>
            <p className="text-base text-gray-600">{t.call988Desc}</p>
            <div className="text-5xl font-bold text-blue-600 text-center my-4">{CONFIG.CRISIS_HOTLINE}</div>
            <Button
              onClick={() => handleCall(CONFIG.CRISIS_HOTLINE)}
              className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xl font-semibold rounded-2xl flex items-center justify-center gap-3 shadow-lg"
            >
              <Phone className="w-7 h-7" />
              {lang === "en" ? "Call 988" : lang === "es" ? "Llamar al 988" : "اتصل بـ 988"}
            </Button>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg space-y-5">
            <h4 className="font-bold text-gray-900 text-xl">Crisis Text Line</h4>
            <p className="text-base text-gray-600">
              {lang === "en"
                ? "Text with a trained counselor"
                : lang === "es"
                  ? "Envía mensajes con un consejero capacitado"
                  : "أرسل رسائل نصية مع مستشار مدرب"}
            </p>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 text-center border-2 border-purple-200">
              <div className="font-semibold text-gray-900 text-lg">
                {lang === "en" ? "Text" : lang === "es" ? "Envía" : "أرسل"}{" "}
                <span className="text-purple-600 font-bold text-2xl">{CONFIG.CRISIS_TEXT_KEYWORD}</span>{" "}
                {lang === "en" ? "to" : lang === "es" ? "al" : "إلى"}{" "}
                <span className="text-purple-600 font-mono font-bold text-2xl">{CONFIG.CRISIS_TEXT_LINE}</span>
              </div>
            </div>
            <Link href={`/text-lifeline?lang=${lang}`}>
              <Button className="w-full h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xl font-semibold rounded-2xl flex items-center justify-center gap-3 shadow-lg">
                <MessageSquare className="w-7 h-7" />
                {lang === "en" ? "Send Text" : lang === "es" ? "Enviar Mensaje" : "إرسال رسالة"}
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg space-y-5">
            <h4 className="font-bold text-gray-900 text-xl">
              {lang === "en"
                ? "Online Chat Support"
                : lang === "es"
                  ? "Apoyo por Chat en Línea"
                  : "دعم الدردشة عبر الإنترنت"}
            </h4>
            <p className="text-base text-gray-600">
              {lang === "en"
                ? "Connect with someone who cares"
                : lang === "es"
                  ? "Conéctate con alguien que se preocupa"
                  : "تواصل مع شخص يهتم"}
            </p>
            <Link href={`/chat-support?lang=${lang}`}>
              <Button className="w-full h-16 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-xl font-semibold rounded-2xl flex items-center justify-center gap-3 shadow-lg">
                <ExternalLink className="w-7 h-7" />
                {lang === "en" ? "Start Chat" : lang === "es" ? "Iniciar Chat" : "ابدأ الدردشة"}
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg space-y-5">
            <h4 className="font-bold text-gray-900 text-xl">{t.emergencyLocation}</h4>
            <p className="text-base text-gray-600">
              {lang === "en"
                ? "Share your location for immediate help"
                : lang === "es"
                  ? "Comparte tu ubicación para ayuda inmediata"
                  : "شارك موقعك للحصول على مساعدة فورية"}
            </p>
            <Link href={`/emergency-location?lang=${lang}`}>
              <Button className="w-full h-16 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white text-xl font-semibold rounded-2xl flex items-center justify-center gap-3 shadow-lg">
                <MapPin className="w-7 h-7" />
                {lang === "en" ? "Share Location" : lang === "es" ? "Compartir Ubicación" : "مشاركة الموقع"}
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-3xl p-6 shadow-md">
          <h4 className="font-bold text-green-900 mb-3 text-xl">
            {lang === "en" ? "You Matter" : lang === "es" ? "Importas" : "أنت مهم"}
          </h4>
          <p className="text-base text-green-800 leading-relaxed">
            {lang === "en"
              ? "Your life has value and meaning. These feelings are temporary. Help is available, and people care about you. Please reach out."
              : lang === "es"
                ? "Tu vida tiene valor y significado. Estos sentimientos son temporales. La ayuda está disponible y la gente se preocupa por ti. Por favor, comunícate."
                : "حياتك لها قيمة ومعنى. هذه المشاعر مؤقتة. المساعدة متاحة، والناس يهتمون بك. يرجى التواصل."}
          </p>
        </div>
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

export default function EmergencyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
        </div>
      }
    >
      <EmergencyContent />
    </Suspense>
  )
}
