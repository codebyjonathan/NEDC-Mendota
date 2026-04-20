"use client"

import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, AlertTriangle, CheckCircle } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { BottomNav } from "@/components/bottom-nav"
import { translations, type Language } from "@/lib/translations"
import { CONFIG } from "@/lib/config"

function EmergencyLocationContent() {
  const searchParams = useSearchParams()
  const langParam = searchParams.get("lang") || "en"
  const lang: Language = langParam === "en" || langParam === "es" || langParam === "ar" ? langParam : "en"
  const t = translations[lang]
  const isRTL = lang === "ar"
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [shared, setShared] = useState(false)

  const getLocation = () => {
    setLoading(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          setLoading(false)
        },
        (error) => {
          console.error("Error getting location:", error)
          setLoading(false)
          alert(
            lang === "en"
              ? "Unable to access location. Please enable location services."
              : lang === "es"
                ? "No se puede acceder a la ubicación. Habilita los servicios de ubicación."
                : "تعذر الوصول إلى الموقع. يرجى تمكين خدمات الموقع.",
          )
        },
      )
    }
  }

  const shareLocation = () => {
    if (location) {
      setShared(true)
      // In a real app, this would send the location to emergency services
      const message = `Emergency location: https://maps.google.com/?q=${location.lat},${location.lng}`
      console.log(message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 flex flex-col" dir={isRTL ? "rtl" : "ltr"}>
      <AppHeader title={t.appTitle} subtitle={t.appSubtitle} />

      <div className="home-scroll-shell flex-1 overflow-y-auto px-4 py-6 space-y-6 pb-20">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-red-500 rounded-full mx-auto flex items-center justify-center">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">{t.emergencyLocation}</h2>
          <p className="text-gray-600">
            {lang === "en"
              ? "Share your location to help emergency services find you"
              : lang === "es"
                ? "Comparte tu ubicación para ayudar a los servicios de emergencia a encontrarte"
                : "شارك موقعك لمساعدة خدمات الطوارئ في العثور عليك"}
          </p>
        </div>

        <div className="bg-red-100 border-2 border-red-300 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-red-900 mb-1">
              {lang === "en"
                ? "Emergency Use Only"
                : lang === "es"
                  ? "Solo para Emergencias"
                  : "للاستخدام في حالات الطوارئ فقط"}
            </h3>
            <p className="text-sm text-red-800">
              {lang === "en"
                ? "Use this feature if you're in crisis and need immediate help. Your location will be shared with emergency services."
                : lang === "es"
                  ? "Usa esta función si estás en crisis y necesitas ayuda inmediata. Tu ubicación se compartirá con los servicios de emergencia."
                  : "استخدم هذه الميزة إذا كنت في أزمة وتحتاج إلى مساعدة فورية. سيتم مشاركة موقعك مع خدمات الطوارئ."}
            </p>
          </div>
        </div>

        {!location && !shared && (
          <Button
            onClick={getLocation}
            disabled={loading}
            className="w-full h-14 bg-red-500 hover:bg-red-600 text-white text-lg font-semibold rounded-xl"
          >
            {loading
              ? lang === "en"
                ? "Getting Location..."
                : lang === "es"
                  ? "Obteniendo Ubicación..."
                  : "جارٍ الحصول على الموقع..."
              : lang === "en"
                ? "Get My Location"
                : lang === "es"
                  ? "Obtener Mi Ubicación"
                  : "احصل على موقعي"}
          </Button>
        )}

        {location && !shared && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-md">
              <h3 className="font-bold text-gray-900 mb-3">
                {lang === "en" ? "Your Location" : lang === "es" ? "Tu Ubicación" : "موقعك"}
              </h3>
              <div className="bg-gray-50 rounded-xl p-3 font-mono text-sm text-gray-700">
                <div>
                  {lang === "en" ? "Latitude" : lang === "es" ? "Latitud" : "خط العرض"}: {location.lat.toFixed(6)}
                </div>
                <div>
                  {lang === "en" ? "Longitude" : lang === "es" ? "Longitud" : "خط الطول"}: {location.lng.toFixed(6)}
                </div>
              </div>
            </div>
            <Button
              onClick={shareLocation}
              className="w-full h-14 bg-red-500 hover:bg-red-600 text-white text-lg font-semibold rounded-xl"
            >
              {lang === "en"
                ? "Share with Emergency Services"
                : lang === "es"
                  ? "Compartir con Servicios de Emergencia"
                  : "شارك مع خدمات الطوارئ"}
            </Button>
          </div>
        )}

        {shared && (
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 text-center space-y-3">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <h3 className="text-xl font-bold text-green-900">
              {lang === "en" ? "Location Shared" : lang === "es" ? "Ubicación Compartida" : "تم مشاركة الموقع"}
            </h3>
            <p className="text-green-800">
              {lang === "en"
                ? "Your location has been sent to emergency services. Help is on the way."
                : lang === "es"
                  ? "Tu ubicación ha sido enviada a los servicios de emergencia. La ayuda está en camino."
                  : "تم إرسال موقعك إلى خدمات الطوارئ. المساعدة في الطريق."}
            </p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-md space-y-3">
          <h3 className="font-bold text-gray-900">
            {lang === "en"
              ? "Other Emergency Options"
              : lang === "es"
                ? "Otras Opciones de Emergencia"
                : "خيارات طوارئ أخرى"}
          </h3>
          <Button
            onClick={() => (window.location.href = "tel:911")}
            className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
          >
            {lang === "en" ? "Call 911" : lang === "es" ? "Llamar al 911" : "اتصل بـ 911"}
          </Button>
          <Button
            onClick={() => (window.location.href = `tel:${CONFIG.CRISIS_HOTLINE}`)}
            className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl"
          >
            {lang === "en"
              ? `Call ${CONFIG.CRISIS_HOTLINE} (Crisis Line)`
              : lang === "es"
                ? `Llamar al ${CONFIG.CRISIS_HOTLINE} (Línea de Crisis)`
                : `اتصل بـ ${CONFIG.CRISIS_HOTLINE} (خط الأزمات)`}
          </Button>
        </div>
      </div>

      <BottomNav lang={lang} />
    </div>
  )
}

export default function EmergencyLocationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
        </div>
      }
    >
      <EmergencyLocationContent />
    </Suspense>
  )
}
