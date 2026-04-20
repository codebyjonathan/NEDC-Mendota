"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense } from "react"
import { Wrench, Wind, Sparkles, Book, Music, Shield, Phone, MessageCircle, Heart, Languages } from "lucide-react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { translations } from "@/lib/translations"
import { Button } from "@/components/ui/button"
import { navigateWithViewTransition } from "@/lib/view-transition"

function ToolsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const langParam = searchParams.get("lang") || "en"
  const lang = (
    langParam === "en" || langParam === "es" || langParam === "ar" ? langParam : "en"
  ) as keyof typeof translations
  const t = translations[lang]
  const isRTL = lang === "ar"

  const changeLanguage = (newLang: string) => {
    navigateWithViewTransition(
      () => {
        router.push(`/tools?lang=${newLang}`)
      },
      { style: "expressive" },
    )
  }

  const toolCategories = [
    {
      title: lang === "en" ? "Coping Tools" : lang === "es" ? "Herramientas de Afrontamiento" : "أدوات التكيف",
      tools: [
        {
          name: t.breathing,
          icon: Wind,
          href: `/breathing?lang=${lang}`,
          color: "bg-blue-500",
        },
        {
          name: t.grounding,
          icon: Sparkles,
          href: `/grounding?lang=${lang}`,
          color: "bg-green-500",
        },
        {
          name: t.journal,
          icon: Book,
          href: `/journal?lang=${lang}`,
          color: "bg-amber-500",
        },
        {
          name: t.music,
          icon: Music,
          href: `/music?lang=${lang}`,
          color: "bg-indigo-500",
        },
      ],
    },
    {
      title: lang === "en" ? "Crisis Support" : lang === "es" ? "Apoyo de Crisis" : "دعم الأزمات",
      tools: [
        {
          name: t.callLifeline,
          icon: Phone,
          href: `/call-lifeline?lang=${lang}`,
          color: "bg-blue-600",
        },
        {
          name: t.textLifeline,
          icon: MessageCircle,
          href: `/text-lifeline?lang=${lang}`,
          color: "bg-purple-500",
        },
        {
          name: t.chatSupport,
          icon: MessageCircle,
          href: `/chat-support?lang=${lang}`,
          color: "bg-teal-500",
        },
      ],
    },
    {
      title: lang === "en" ? "Safety & Planning" : lang === "es" ? "Seguridad y Planificación" : "السلامة والتخطيط",
      tools: [
        {
          name: t.safetyPlan,
          icon: Shield,
          href: `/safety-plan?lang=${lang}`,
          color: "bg-teal-600",
        },
        {
          name: lang === "en" ? "Wellness Activities" : lang === "es" ? "Actividades de Bienestar" : "أنشطة العافية",
          icon: Heart,
          href: `/wellness?lang=${lang}`,
          color: "bg-pink-500",
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-20">
        <div className="text-center space-y-2">
          <Wrench className="w-12 h-12 mx-auto text-gray-700" />
          <h2 className="text-2xl font-bold text-gray-900">{t.helpTitle}</h2>
          <p className="text-gray-600">{t.helpDesc}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Languages className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">
              {lang === "en" ? "Change Language" : lang === "es" ? "Cambiar Idioma" : "تغيير اللغة"}
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={() => changeLanguage("en")}
              variant={lang === "en" ? "default" : "outline"}
              className={`h-12 font-semibold ${lang === "en" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
            >
              English
            </Button>
            <Button
              onClick={() => changeLanguage("es")}
              variant={lang === "es" ? "default" : "outline"}
              className={`h-12 font-semibold ${lang === "es" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
            >
              Español
            </Button>
            <Button
              onClick={() => changeLanguage("ar")}
              variant={lang === "ar" ? "default" : "outline"}
              className={`h-12 font-semibold ${lang === "ar" ? "bg-blue-500 hover:bg-blue-600" : ""}`}
            >
              العربية
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {toolCategories.map((category) => (
            <div key={category.title} className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 px-1">{category.title}</h3>
              <div className="grid grid-cols-2 gap-4">
                {category.tools.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <Link key={tool.href} href={tool.href}>
                      <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow h-full">
                        <div className={`${tool.color} w-12 h-12 rounded-xl flex items-center justify-center mb-3`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="text-sm font-semibold text-gray-900 leading-tight">{tool.name}</h4>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <h3 className="font-bold text-blue-900 mb-3">
            {lang === "en" ? "App Guide" : lang === "es" ? "Guía de la Aplicación" : "دليل التطبيق"}
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex gap-2">
              <span>•</span>
              <span>
                {lang === "en"
                  ? "Use coping tools when you're feeling overwhelmed"
                  : lang === "es"
                    ? "Usa herramientas de afrontamiento cuando te sientas abrumado"
                    : "استخدم أدوات التكيف عندما تشعر بالإرهاق"}
              </span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>
                {lang === "en"
                  ? "Reach out for support anytime you need it"
                  : lang === "es"
                    ? "Busca apoyo cuando lo necesites"
                    : "تواصل للحصول على الدعم في أي وقت تحتاجه"}
              </span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>
                {lang === "en"
                  ? "Create your safety plan before a crisis happens"
                  : lang === "es"
                    ? "Crea tu plan de seguridad antes de que ocurra una crisis"
                    : "أنشئ خطة السلامة قبل حدوث الأزمة"}
              </span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>
                {lang === "en"
                  ? "Emergency button is always available at the bottom"
                  : lang === "es"
                    ? "El botón de emergencia está siempre disponible en la parte inferior"
                    : "زر الطوارئ متاح دائمًا في الأسفل"}
              </span>
            </li>
          </ul>
        </div>
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

export default function ToolsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600" />
        </div>
      }
    >
      <ToolsContent />
    </Suspense>
  )
}
