"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle, Send } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { translations, type Language } from "@/lib/translations"
import { CONFIG } from "@/lib/config"
import { markSolarGoalCompleted } from "@/lib/solar-system-goals"

function TextLifelineContent() {
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang") || "en"
  const lang: Language = langParam === "en" || langParam === "es" || langParam === "ar" ? langParam : "en"
  const t = translations[lang]
  const isRTL = lang === "ar"

  useEffect(() => {
    markSolarGoalCompleted("browse_lifeline_options")
  }, [])

  const handleText = (number: string, message: string) => {
    window.location.href = `sms:${number}?&body=${encodeURIComponent(message)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-20">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full mx-auto flex items-center justify-center shadow-lg">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">{t.textLifeline}</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            {lang === "en"
              ? "Text with a trained crisis counselor"
              : lang === "es"
                ? "Envía mensajes con un consejero de crisis capacitado"
                : "أرسل رسائل نصية مع مستشار أزمات مدرب"}
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-lg space-y-5">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Crisis Text Line</h3>
              <p className="text-base text-gray-600 mb-6">
                {lang === "en"
                  ? "Free 24/7 support via text message"
                  : lang === "es"
                    ? "Apoyo gratuito 24/7 por mensaje de texto"
                    : "دعم مجاني على مدار الساعة عبر الرسائل النصية"}
              </p>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 mb-6 border-2 border-purple-200">
                <div className="text-xl font-semibold text-gray-900 mb-3">
                  {lang === "en" ? "Text" : lang === "es" ? "Envía" : "أرسل"}{" "}
                  <span className="text-purple-600 font-bold text-2xl">{CONFIG.CRISIS_TEXT_KEYWORD}</span>
                </div>
                <div className="text-xl font-semibold text-gray-900">
                  {lang === "en" ? "to" : lang === "es" ? "al" : "إلى"}{" "}
                  <span className="text-purple-600 font-mono font-bold text-3xl">{CONFIG.CRISIS_TEXT_LINE}</span>
                </div>
              </div>
              <Button
                onClick={() => handleText(CONFIG.CRISIS_TEXT_LINE, CONFIG.CRISIS_TEXT_KEYWORD)}
                className="w-full h-16 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-xl font-semibold rounded-2xl flex items-center justify-center gap-3 shadow-lg"
              >
                <Send className="w-7 h-7" />
                {lang === "en" ? "Send Text" : lang === "es" ? "Enviar Mensaje" : "إرسال رسالة"}
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg space-y-5">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {lang === "en" ? "How It Works" : lang === "es" ? "Cómo Funciona" : "كيف يعمل"}
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-lg shadow-md">
                  1
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-base text-gray-900 leading-relaxed">
                    {lang === "en"
                      ? `Send the keyword ${CONFIG.CRISIS_TEXT_KEYWORD} to ${CONFIG.CRISIS_TEXT_LINE}`
                      : lang === "es"
                        ? `Envía la palabra ${CONFIG.CRISIS_TEXT_KEYWORD} al ${CONFIG.CRISIS_TEXT_LINE}`
                        : `أرسل الكلمة الرئيسية ${CONFIG.CRISIS_TEXT_KEYWORD} إلى ${CONFIG.CRISIS_TEXT_LINE}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-lg shadow-md">
                  2
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-base text-gray-900 leading-relaxed">
                    {lang === "en"
                      ? "A trained Crisis Counselor receives your text and responds"
                      : lang === "es"
                        ? "Un consejero de crisis capacitado recibe tu mensaje y responde"
                        : "يتلقى مستشار الأزمات المدرب رسالتك ويرد"}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white text-lg shadow-md">
                  3
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-base text-gray-900 leading-relaxed">
                    {lang === "en"
                      ? "They'll help you move from a hot moment to cool calm"
                      : lang === "es"
                        ? "Te ayudarán a pasar de un momento difícil a la calma"
                        : "سيساعدونك على الانتقال من لحظة ساخنة إلى الهدوء"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-6 shadow-md">
            <p className="text-base text-purple-900 text-center leading-relaxed font-medium">
              {lang === "en"
                ? "Standard text messaging rates apply. Your information is confidential."
                : lang === "es"
                  ? "Se aplican tarifas estándar de mensajes de texto. Tu información es confidencial."
                  : "تطبق أسعار المراسلة النصية القياسية. معلوماتك سرية."}
            </p>
          </div>
        </div>
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

export default function TextLifelinePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      }
    >
      <TextLifelineContent />
    </Suspense>
  )
}
