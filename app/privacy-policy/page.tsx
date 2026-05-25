"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { translations } from "@/lib/translations"
import { CONFIG } from "@/lib/config"

function PrivacyPolicyContent() {
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang") || "en"
  const lang = (langParam === "en" || langParam === "es" || langParam === "ar" ? langParam : "en") as
    | "en"
    | "es"
    | "ar"
  const t = translations[lang]
  const contact = CONFIG.PRIVACY_CONTACT_EMAIL || "your official school/project contact email"

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      <div className="home-scroll-shell flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-20">
        <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
        <p className="text-sm text-gray-600">Effective date: {CONFIG.PRIVACY_POLICY_EFFECTIVE_DATE}</p>

        <section className="rounded-2xl border bg-white p-4 space-y-2">
          <h2 className="text-lg font-semibold">1) Information we collect</h2>
          <p className="text-sm text-gray-700">
            Safe Space may process user-entered messages in the Safety AI feature, technical identifiers used for
            notifications (such as a device cookie ID), push subscription metadata, and app usage analytics.
          </p>
          <p className="text-sm text-gray-700">
            Emergency location in this app is used on-device to create a share link. The current implementation does
            not send location coordinates to our backend servers.
          </p>
        </section>

        <section className="rounded-2xl border bg-white p-4 space-y-2">
          <h2 className="text-lg font-semibold">2) How we use information</h2>
          <p className="text-sm text-gray-700">
            We use information to provide core app features, including crisis support tools, reminders/notifications,
            app reliability, and abuse/safety moderation.
          </p>
          <p className="text-sm text-gray-700">
            We apply strict input validation and sanitization to user-submitted content to reduce abusive, hateful, or
            unsafe content in community and chat features.
          </p>
        </section>

        <section className="rounded-2xl border bg-white p-4 space-y-2">
          <h2 className="text-lg font-semibold">3) Sharing and third parties</h2>
          <p className="text-sm text-gray-700">
            Safety AI messages are sent to OpenAI for model processing. Analytics events may be processed by Vercel
            Analytics. We do not sell personal information.
          </p>
          <p className="text-sm text-gray-700">
            Sensitive server credentials (for example, private API keys) are stored server-side and are not exposed to
            client-side app code.
          </p>
        </section>

        <section className="rounded-2xl border bg-white p-4 space-y-2">
          <h2 className="text-lg font-semibold">4) Data retention</h2>
          <p className="text-sm text-gray-700">
            Data retention depends on the feature. Some data is stored only locally on device (for example, saved
            preferences). Some server-side data in this project is currently temporary/in-memory for operational use.
          </p>
        </section>

        <section className="rounded-2xl border bg-white p-4 space-y-2">
          <h2 className="text-lg font-semibold">5) Children and emergency notice</h2>
          <p className="text-sm text-gray-700">
            Safe Space provides supportive content and is not a medical device. It does not diagnose, treat, cure, or
            prevent medical conditions. If there is immediate danger, call 911. In the U.S., call or text 988 for
            crisis support.
          </p>
        </section>

        <section className="rounded-2xl border bg-white p-4 space-y-2">
          <h2 className="text-lg font-semibold">6) Changes to this policy</h2>
          <p className="text-sm text-gray-700">
            We may update this policy over time. The effective date above reflects the latest revision.
          </p>
        </section>

        <section className="rounded-2xl border bg-white p-4 space-y-2">
          <h2 className="text-lg font-semibold">7) Contact</h2>
          <p className="text-sm text-gray-700">
            Questions about this policy can be sent to: <span className="font-medium">{contact}</span>
          </p>
        </section>
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

export default function PrivacyPolicyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600" />
        </div>
      }
    >
      <PrivacyPolicyContent />
    </Suspense>
  )
}
