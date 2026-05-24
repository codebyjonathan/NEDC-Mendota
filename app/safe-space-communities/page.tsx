"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { Button } from "@/components/ui/button"
import { translations } from "@/lib/translations"
import type { Language } from "@/lib/translations"
import { SAFE_COMMUNITIES, getLocalizedCommunityContent } from "@/lib/safe-space/utils"
import { MessageCircle, Users, Shield, Heart } from "lucide-react"
import { getCommunityBanState, isCommunityBanActive } from "@/lib/safe-space/community-ban"

function CommunitiesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const langParam = searchParams.get("lang") || "en"
  const lang = (
    langParam === "en" || langParam === "es" || langParam === "ar" ? langParam : "en"
  ) as Language
  const t = translations[lang]
  const isRTL = lang === "ar"
  const joinCommunityLabel =
    lang === "es" ? "Unirse a la Comunidad" : lang === "ar" ? "انضم إلى المجتمع" : "Join Community"

  const whySection =
    lang === "es"
      ? {
          title: "¿Por qué Comunidades Safe Space?",
          identityTitle: "Identidad Anónima",
          identityDesc: 'Nombres protegidos como "CalmRiver42"',
          moderationTitle: "Moderación con IA",
          moderationDesc: "Conversaciones seguras y monitoreadas",
          reactionsTitle: "Reacciones de Apoyo",
          reactionsDesc: "Sin likes ni competencia, solo apoyo",
        }
      : lang === "ar"
        ? {
            title: "لماذا مجتمعات Safe Space؟",
            identityTitle: "هوية مجهولة",
            identityDesc: 'أسماء محمية مثل "CalmRiver42"',
            moderationTitle: "إشراف بالذكاء الاصطناعي",
            moderationDesc: "محادثات آمنة وتحت المتابعة",
            reactionsTitle: "تفاعلات داعمة",
            reactionsDesc: "بدون إعجابات أو منافسة، فقط دعم",
          }
        : {
            title: "Why Safe Space Communities?",
            identityTitle: "Anonymous Identity",
            identityDesc: 'Protected usernames like "CalmRiver42"',
            moderationTitle: "AI Moderation",
            moderationDesc: "Safe, monitored conversations",
            reactionsTitle: "Supportive Reactions",
            reactionsDesc: "No likes or competition, just support",
          }

  const [guidesAccepted, setGuidesAccepted] = useState(false)
  const skipGuidelines = searchParams.get("skipGuidelines") === "1"

  useEffect(() => {
    const state = getCommunityBanState()
    if (isCommunityBanActive(state.bannedUntil)) {
      router.replace(`/main?lang=${lang}`)
    }
  }, [lang, router])

  useEffect(() => {
    const stored = window.localStorage.getItem("safe_space_guidelines_accepted_v1")
    if (stored === "true" || skipGuidelines) setGuidesAccepted(true)
  }, [skipGuidelines])

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader
        title={t.communitiesTitle}
        subtitle="Peer Support & Mental Wellness"
        backHref={`/main?lang=${lang}`}
        backLabel={lang === "es" ? "Volver" : "Back"}
      />

      <div className="home-scroll-shell flex-1 overflow-y-auto px-5 py-8 space-y-6 pb-24">
        {!guidesAccepted && (
          <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-teal-200 space-y-4 sticky top-0 z-50">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-teal-600 flex-shrink-0" />
              <h2 className="font-display text-lg font-bold text-gray-900">{t.communityGuidelines}</h2>
            </div>
            <p className="text-sm text-gray-600">{t.guidelinesDesc}</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2"><span className="text-teal-600 font-bold">-</span><span>{t.guideline1}</span></li>
              <li className="flex gap-2"><span className="text-teal-600 font-bold">-</span><span>{t.guideline2}</span></li>
              <li className="flex gap-2"><span className="text-teal-600 font-bold">-</span><span>{t.guideline3}</span></li>
              <li className="flex gap-2"><span className="text-teal-600 font-bold">-</span><span>{t.guideline4}</span></li>
              <li className="flex gap-2"><span className="text-teal-600 font-bold">-</span><span>{t.guideline5}</span></li>
            </ul>
            <Button
              onClick={() => {
                setGuidesAccepted(true)
                window.localStorage.setItem("safe_space_guidelines_accepted_v1", "true")
              }}
              className="w-full bg-teal-600 text-white hover:bg-teal-500 rounded-2xl h-12 font-semibold"
            >
              {t.iUnderstand}
            </Button>
          </div>
        )}

        {guidesAccepted && (
          <>
            <div className="text-center space-y-4 mt-6">
              <h1 className="font-display text-2xl font-extrabold text-teal-900">{t.selectCommunity}</h1>
              <p className="text-gray-600 max-w-md mx-auto">{t.communitiesDesc}</p>
            </div>

            <div className="grid gap-4">
              {SAFE_COMMUNITIES.map((community) => {
                const localized = getLocalizedCommunityContent(community.id, lang) || {
                  name: community.name,
                  description: community.description,
                }

                return (
                  <Link
                    key={community.id}
                    href={`/safe-space-communities/${community.slug}?lang=${lang}`}
                    className="group"
                    data-transition-style="random"
                  >
                    <div
                      className={`rounded-3xl p-6 shadow-md hover:shadow-xl transition-all hover:scale-102 border-2 ${community.borderColor} ${community.color} cursor-pointer`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-4xl">{community.icon}</span>
                            <div>
                              <h3 className={`font-display text-lg font-bold ${community.accentColor}`}>
                                {localized.name}
                              </h3>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-4">{localized.description}</p>
                          <div className="flex items-center gap-2">
                            <MessageCircle className={`w-4 h-4 ${community.accentColor}`} />
                            <span className="text-xs font-semibold text-gray-600">{joinCommunityLabel}</span>
                          </div>
                        </div>
                        <div className="text-2xl group-hover:translate-x-1 transition-transform">→</div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-md border border-teal-100 space-y-4 mt-8">
              <h2 className="font-display text-lg font-bold text-gray-900">{whySection.title}</h2>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{whySection.identityTitle}</p>
                    <p className="text-xs text-gray-600">{whySection.identityDesc}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{whySection.moderationTitle}</p>
                    <p className="text-xs text-gray-600">{whySection.moderationDesc}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{whySection.reactionsTitle}</p>
                    <p className="text-xs text-gray-600">{whySection.reactionsDesc}</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

export default function CommunitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-teal-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
        </div>
      }
    >
      <CommunitiesContent />
    </Suspense>
  )
}