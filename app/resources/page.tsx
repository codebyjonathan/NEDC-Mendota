"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useState, useEffect } from "react"
import { CalendarDays, BookOpen, Video, FileText, ExternalLink, Heart } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { markSolarGoalCompleted } from "@/lib/solar-system-goals"
import { translations } from "@/lib/translations"

function ResourcesContent() {
  const searchParams = useSearchParams()
  const lang = (searchParams.get("lang") || "en") as keyof typeof translations
  const t = translations[lang]
  const isRTL = lang === "ar"

  useEffect(() => {
    markSolarGoalCompleted("visit_resources_screen")
  }, [])

  const openUrl = (e: any, url?: string) => {
    if (!url) return
    e?.preventDefault()
    e?.stopPropagation()
    markSolarGoalCompleted("open_resource_link")
    try {
      window.open(url, "_blank", "noopener")
    } catch (err) {
      // fallback: set location
      window.location.href = url
    }
  }

  function TeamInfo({ lang, isRTL }: { lang: string; isRTL: boolean }) {
    const [teamText, setTeamText] = useState(t.teamDescription || "")

    useEffect(() => {
      setTeamText(t.teamDescription || "")
    }, [lang])

    return (
      <div>
        <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-wrap">{teamText}</p>
      </div>
    )
  }

  const resources = [
    {
      title: "988 Suicide & Crisis Lifeline",
      description:
        lang === "en"
          ? "Free, confidential support 24/7"
          : lang === "es"
            ? "Apoyo gratuito y confidencial 24/7"
            : "دعم مجاني وسري على مدار الساعة",
      url: "https://988lifeline.org/",
      icon: BookOpen,
      color: "bg-blue-500",
    },
    {
      title: "Crisis Text Line",
      description:
        lang === "en"
          ? "Text HOME to 741741 for support"
          : lang === "es"
            ? "Envía HOLA al 741741 para obtener apoyo"
            : "أرسل HOME إلى 741741 للحصول على الدعم",
      url: "https://www.crisistextline.org/",
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      title: "NAMI (National Alliance on Mental Illness)",
      description:
        lang === "en"
          ? "Providing Mental Health Support towards individuals and families!"
          : lang === "es"
            ? "Brindando apoyo de salud mental a individuos y familias."
            : "تقديم دعم الصحة النفسية للأفراد والعائلات!",
      url: "https://www.nami.org/",
      icon: Heart,
      color: "bg-green-500",
      featured: true,
    },
    {
      title: "United Health Centers",
      description:
        lang === "en"
          ? "Resource Center helping Behavioral Health"
          : lang === "es"
            ? "Centro de Recursos de Salud del Comportamiento"
            : "مركز المورد لمساعدة الصحة السلوكية",
      url: "https://unitedhealthcenters.org/locations/mendota-119",
      icon: BookOpen,
      color: "bg-blue-500",
      featured: true,
      borderColor: "border-blue-300",
    },
    {
      title: "AMOR Wellness Center",
      description:
        lang === "en"
          ? "Local Health Neighborhood Resource Center"
          : lang === "es"
            ? "Centro de Recursos de Salud de la Comunidad Local"
            : "مركز الموارد الصحية للحي المحلي",
      url: "https://amorwellness.org/",
      icon: FileText,
      color: "bg-yellow-500",
      featured: true,
      borderColor: "border-yellow-300",
    },
    {
      title: "SAMHSA National Helpline",
      description:
        lang === "en"
          ? "1-800-662-4357 (Treatment referral)"
          : lang === "es"
            ? "1-800-662-4357 (Referencia de tratamiento)"
            : "1-800-662-4357 (إحالة العلاج)",
      url: "https://www.samhsa.gov/find-help/national-helpline",
      icon: BookOpen,
      color: "bg-indigo-500",
    },
  ]

  const educationalResources = [
    {
      title: lang === "en" ? "Understanding Depression" : lang === "es" ? "Entendiendo la Depresión" : "فهم الاكتئاب",
      type: lang === "en" ? "Article" : lang === "es" ? "Artículo" : "مقالة",
      icon: FileText,
      url: "https://www.psychiatry.org/patients-families/depression/what-is-depression",
    },
    {
      title: lang === "en" ? "Coping with Anxiety" : lang === "es" ? "Afrontando la Ansiedad" : "التعامل مع القلق",
      type: lang === "en" ? "Article" : lang === "es" ? "Artículo" : "مقالة",
      url: "https://www.nyp.org/youthmentalhealth?utm_source=google&utm_medium=cpc&utm_campaign=21092678316&utm_content=160019785179&utm_term=help%20with%20anxiety%20teens&gad_source=1&gad_campaignid=21092678316&gbraid=0AAAAAD5MYxAC1O2WpAptT_XM5_wltHbWs&gclid=CjwKCAiA_orJBhBNEiwABkdmjAW8bI-TbprbfxQK30e990S3GHmjVilVlPyvZ1vSyQa_WhQh0gFLgxoCqQAQAvD_BwE",
      icon: FileText,
    },
    {
      title:
        lang === "en"
          ? "Mental Health First Aid"
          : lang === "es"
            ? "Primeros Auxilios de Salud Mental"
            : "الإسعافات الأولية للصحة النفسية",
      type: lang === "en" ? "Video" : lang === "es" ? "Video" : "فيديو",
      url: "https://www.youtube.com/watch?v=wMFpooKQVjc",
      icon: Video,
    },
    {
      title: lang === "en" ? "Supporting a Friend" : lang === "es" ? "Apoyando a un Amigo" : "دعم صديق",
      type: lang === "en" ? "Guide" : lang === "es" ? "Guía" : "دليل",
      url: "https://www.mentalhealth.org.uk/explore-mental-health/articles/how-support-someone-mental-health-problem",
      icon: BookOpen,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      <div className="home-scroll-shell flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-20">
        <div className="text-center space-y-2">
          <CalendarDays className="w-12 h-12 mx-auto text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">{t.resourcesTitle}</h2>
          <p className="text-gray-600">
            {lang === "en"
              ? "Helpful information and organizations"
              : lang === "es"
                ? "Información útil y organizaciones"
                : "معلومات ومنظمات مفيدة"}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">
            {lang === "en"
              ? "Crisis Support Organizations"
              : lang === "es"
                ? "Organizaciones de Apoyo en Crisis"
                : "منظمات دعم الأزمات"}
          </h3>
          <div className="flex flex-col gap-4">
            {resources.map((resource) => {
              const Icon = resource.icon
              const isLink = !!resource.url && resource.url.length > 0
              return (
                <a
                  key={resource.title}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markSolarGoalCompleted("open_resource_link")}
                >
                  <div
                    className={`bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 ${
                      resource.featured ? `border-2 ${resource.borderColor || "border-green-300"}` : ""
                    }`}
                  >
                    <div
                      className={`${resource.color} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isLink ? "cursor-pointer" : ""
                      }`}
                      onClick={(e) => openUrl(e, resource.url)}
                      role={isLink ? "button" : undefined}
                      tabIndex={isLink ? 0 : undefined}
                      onKeyDown={(e) => {
                        if (isLink && (e.key === "Enter" || e.key === " ")) openUrl(e, resource.url)
                      }}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900 mb-1">{resource.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{resource.description}</p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </a>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900">
            {lang === "en" ? "Educational Materials" : lang === "es" ? "Materiales Educativos" : "المواد التعليمية"}
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {educationalResources.map((resource) => {
              const Icon = resource.icon
              const isLink = !!resource.url && resource.url.length > 0

              const card = (
                <div
                  className={`bg-white rounded-2xl p-5 shadow-sm ${
                    isLink ? "hover:shadow-md transition-shadow cursor-pointer" : ""
                  }`}
                >
                  <Icon
                    className="w-8 h-8 text-gray-600 mb-3"
                    onClick={(e) => openUrl(e, resource.url)}
                    role={isLink ? "button" : undefined}
                    tabIndex={isLink ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (isLink && (e.key === "Enter" || e.key === " ")) openUrl(e, resource.url)
                    }}
                  />
                  <h4 className="text-sm font-bold text-gray-900 mb-1 leading-tight">{resource.title}</h4>
                  <p className="text-xs text-gray-600">{resource.type}</p>
                </div>
              )

              return isLink ? (
                <a
                  key={resource.title}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => markSolarGoalCompleted("open_resource_link")}
                >
                  {card}
                </a>
              ) : (
                <div key={resource.title}>{card}</div>
              )
            })}
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
          <h4 className="font-bold text-blue-900 mb-3">
            {lang === "en" ? "All About Our Team" : lang === "es" ? "Sobre Nuestro Equipo" : "كل شيء عن فريقنا"}
          </h4>

          <TeamInfo lang={lang} isRTL={isRTL} />
        </div>
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

export default function ResourcesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      }
    >
      <ResourcesContent />
    </Suspense>
  )
}
