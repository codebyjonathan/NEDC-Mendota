"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, CheckCircle2, Play, ExternalLink } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { translations } from "@/lib/translations"

function GroundingContent() {
  const searchParams = useSearchParams()
  const lang = (searchParams.get("lang") || "en") as keyof typeof translations
  const t = translations[lang]
  const isRTL = lang === "ar"

  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState<number[]>([])

  const techniques = [
    {
      title: lang === "en" ? "5-4-3-2-1 Technique" : lang === "es" ? "Técnica 5-4-3-2-1" : "تقنية 5-4-3-2-1",
      steps: [
        lang === "en"
          ? "Name 5 things you can see"
          : lang === "es"
            ? "Nombra 5 cosas que puedes ver"
            : "اذكر 5 أشياء يمكنك رؤيتها",
        lang === "en"
          ? "Name 4 things you can touch"
          : lang === "es"
            ? "Nombra 4 cosas que puedes tocar"
            : "اذكر 4 أشياء يمكنك لمسها",
        lang === "en"
          ? "Name 3 things you can hear"
          : lang === "es"
            ? "Nombra 3 cosas que puedes oír"
            : "اذكر 3 أشياء يمكنك سماعها",
        lang === "en"
          ? "Name 2 things you can smell"
          : lang === "es"
            ? "Nombra 2 cosas que puedes oler"
            : "اذكر شيئين يمكنك شمهما",
        lang === "en"
          ? "Name 1 thing you can taste"
          : lang === "es"
            ? "Nombra 1 cosa que puedes saborear"
            : "اذكر شيئًا واحدًا يمكنك تذوقه",
      ],
    },
  ]

  const meditationVideos = [
    {
      title:
        lang === "en"
          ? "5-Minute Calm Meditation"
          : lang === "es"
            ? "Meditación Tranquila de 5 Minutos"
            : "تأمل هادئ لمدة 5 دقائق",
      thumbnail: "/peaceful-meditation-person-lotus-position.jpg",
      url: "https://www.youtube.com/watch?v=inpok4MKVLM",
      duration: "5 min",
    },
    {
      title: lang === "en" ? "Guided Body Scan" : lang === "es" ? "Escaneo Corporal Guiado" : "مسح الجسم الموجه",
      thumbnail: "/relaxation-body-scan-meditation.jpg",
      url: "https://www.youtube.com/watch?v=15q-N-_kkrU",
      duration: "10 min",
    },
    {
      title:
        lang === "en"
          ? "Mindfulness for Anxiety"
          : lang === "es"
            ? "Atención Plena para la Ansiedad"
            : "اليقظة الذهنية للقلق",
      thumbnail: "/mindfulness-calm-breathing-nature.jpg",
      url: "https://www.youtube.com/watch?v=O-6f5wQXSu8",
      duration: "15 min",
    },
  ]

  const technique = techniques[0]

  const handleComplete = () => {
    if (currentStep < technique.steps.length - 1) {
      setCompleted([...completed, currentStep])
      setCurrentStep(currentStep + 1)
    } else {
      setCompleted([...completed, currentStep])
    }
  }

  const reset = () => {
    setCurrentStep(0)
    setCompleted([])
  }

  const allCompleted = completed.length === technique.steps.length

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-teal-50 flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-20">
        <div className="text-center space-y-2">
          <Sparkles className="w-12 h-12 mx-auto text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">{t.groundingTitle}</h2>
          <p className="text-gray-600">{t.groundingDesc}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md">
          <h3 className="text-xl font-bold text-gray-900 mb-5 text-center">{technique.title}</h3>

          {!allCompleted ? (
            <div className="space-y-6">
              <div className="space-y-3">
                {technique.steps.map((step, index) => {
                  const isCompleted = completed.includes(index)
                  const isCurrent = index === currentStep

                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        isCompleted
                          ? "bg-green-50 border-green-300"
                          : isCurrent
                            ? "bg-blue-50 border-blue-300 shadow-sm"
                            : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold ${
                            isCompleted
                              ? "bg-green-500 text-white"
                              : isCurrent
                                ? "bg-blue-500 text-white"
                                : "bg-gray-300 text-gray-600"
                          }`}
                        >
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                        </div>
                        <span
                          className={`text-sm font-medium ${isCompleted ? "text-green-900" : isCurrent ? "text-blue-900" : "text-gray-600"}`}
                        >
                          {step}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Button
                onClick={handleComplete}
                className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl"
              >
                {lang === "en" ? "Complete This Step" : lang === "es" ? "Completar Este Paso" : "أكمل هذه الخطوة"}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-4 py-8">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto" />
              <h3 className="text-xl font-bold text-gray-900">
                {lang === "en" ? "Great Job!" : lang === "es" ? "¡Excelente Trabajo!" : "عمل رائع!"}
              </h3>
              <p className="text-gray-600">
                {lang === "en"
                  ? "You've completed the grounding exercise. How do you feel?"
                  : lang === "es"
                    ? "Has completado el ejercicio de anclaje. ¿Cómo te sientes?"
                    : "لقد أكملت تمرين التأريض. كيف تشعر؟"}
              </p>
              <Button
                onClick={reset}
                className="h-12 px-6 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl"
              >
                {lang === "en" ? "Do It Again" : lang === "es" ? "Hacerlo de Nuevo" : "افعلها مرة أخرى"}
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 px-1">
            {lang === "en"
              ? "Guided Meditation Videos"
              : lang === "es"
                ? "Videos de Meditación Guiada"
                : "فيديوهات التأمل الموجه"}
          </h3>
          <div className="space-y-3">
            {meditationVideos.map((video) => (
              <a
                key={video.url}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4 p-4">
                  <div className="relative w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h4 className="text-sm font-bold text-gray-900 mb-1">{video.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>{video.duration}</span>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-5 shadow-sm space-y-3">
          <h3 className="font-bold text-gray-900">
            {lang === "en"
              ? "Why Grounding Works"
              : lang === "es"
                ? "Por Qué Funciona el Anclaje"
                : "لماذا يعمل التأريض"}
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            {lang === "en"
              ? "Grounding techniques help you reconnect with the present moment when you're feeling anxious, overwhelmed, or dissociated. By engaging your senses, you anchor yourself to the here and now."
              : lang === "es"
                ? "Las técnicas de anclaje te ayudan a reconectar con el momento presente cuando te sientes ansioso, abrumado o disociado. Al involucrar tus sentidos, te anclas al aquí y ahora."
                : "تساعدك تقنيات التأريض على إعادة الاتصال باللحظة الحالية عندما تشعر بالقلق أو الإرهاق أو الانفصال. من خلال إشراك حواسك، فإنك تثبت نفسك في الحاضر."}
          </p>
        </div>
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

export default function GroundingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
        </div>
      }
    >
      <GroundingContent />
    </Suspense>
  )
}
